'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { spawnSync } = require('node:child_process');
const { git } = require('./github.cjs');

const SUITES = {
  quality: [
    { name: 'Ordinary', count: 20, files: ['test/baseline.test.cjs', 'test/mock-provider.test.cjs', 'test/metrics.test.cjs'] },
    { name: 'Compatibility', count: 3, files: ['test/dependency-policy.test.cjs'] }
  ],
  security: [{ name: 'Security', count: 3, files: ['test/security.test.cjs', 'test/rate-limit.test.cjs'] }],
  smoke: [{ name: 'Runner-loopback smoke', count: 11, files: ['test/baseline.test.cjs', 'test/security.test.cjs', 'test/rate-limit.test.cjs'] }]
};

function testResult(stdout, exitCode, expectedCount) {
  const counts = {};
  for (const key of ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo']) {
    const matches = [...String(stdout).matchAll(new RegExp(`^# ${key} (\\d+)\\r?$`, 'gm'))];
    counts[key] = matches.length === 1 ? Number(matches[0][1]) : null;
  }
  const complete = Object.values(counts).every(Number.isSafeInteger) && counts.tests === expectedCount &&
    counts.tests === counts.pass + counts.fail + counts.cancelled + counts.skipped + counts.todo;
  const passed = complete && exitCode === 0 && counts.pass === expectedCount &&
    counts.fail === 0 && counts.cancelled === 0 && counts.skipped === 0 && counts.todo === 0;
  return { ...counts, exitCode, complete, passed };
}

function runSuite(cwd, suite, run = spawnSync) {
  const result = run(process.execPath, ['--test', '--test-reporter=tap', ...suite.files], {
    cwd, encoding: 'utf8', windowsHide: true, timeout: 120_000, maxBuffer: 4 * 1024 * 1024
  });
  const parsed = testResult(result.stdout ?? '', result.status, suite.count);
  const cases = [...String(result.stdout ?? '').matchAll(/^(not ok|ok) \d+ - ([^\r\n]+)\r?$/gm)]
    .map((match) => ({ name: match[2], outcome: match[1] === 'ok' ? 'success' : 'failure' }));
  const complete = parsed.complete && cases.length === suite.count && new Set(cases.map((entry) => entry.name)).size === cases.length;
  return { name: suite.name, expected: suite.count, ...parsed, cases, complete, passed: !result.error && complete && parsed.passed,
    stdout: result.stdout ?? '', stderr: result.stderr ?? '', executionError: Boolean(result.error) };
}

function validateMode(mode, labId, env) {
  if (env.GITHUB_ACTIONS !== 'true') throw new Error('Use the checks or Lab demonstrations in GitHub.com; local execution is not a participant requirement.');
  if (!/^0[1-5]$/.test(labId)) throw new Error('Unexpected lab identity.');
  if (['quality', 'security'].includes(mode)) return;
  if (!((mode === 'secret-response' && labId === '03') || (['metrics', 'smoke'].includes(mode) && labId === '05'))) throw new Error('This demonstration does not belong to this lab.');
  if (env.GITHUB_REF !== 'refs/heads/dev' || env.GITHUB_EVENT_NAME !== 'workflow_dispatch') throw new Error('Demonstrations run only from trusted dev through the browser.');
}

function snapshot(cwd, env) {
  const head = git(cwd, ['rev-parse', 'HEAD']);
  const dirty = git(cwd, ['status', '--porcelain', '--untracked-files=normal']);
  if (head.status !== 0 || dirty.status !== 0 || dirty.stdout.trim() || !/^[a-f0-9]{40}$/.test(head.stdout.trim())) throw new Error('The runner needs a clean, committed checkout.');
  if (head.stdout.trim() !== env.GITHUB_SHA) throw new Error('Checked-out commit differs from this Actions event.');
  if (!/^[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(env.GITHUB_REPOSITORY ?? '') || !/^[1-9][0-9]*$/.test(env.GITHUB_RUN_ID ?? '') ||
      !/^[1-9][0-9]*$/.test(env.GITHUB_RUN_ATTEMPT ?? '') || !/^[A-Za-z0-9_-]+$/.test(env.GITHUB_JOB ?? '')) throw new Error('Missing Actions run identity.');
  const prHead = /^[a-f0-9]{40}$/.test(env.PR_HEAD_SHA ?? '') ? env.PR_HEAD_SHA : null;
  return { sha: head.stdout.trim(), prHead, repository: env.GITHUB_REPOSITORY, runId: env.GITHUB_RUN_ID, attempt: env.GITHUB_RUN_ATTEMPT, job: env.GITHUB_JOB,
    event: /^[a-z_]+$/.test(env.GITHUB_EVENT_NAME ?? '') ? env.GITHUB_EVENT_NAME : 'unknown',
    url: `https://github.com/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}` };
}

function summary(mode, metadata, results, { installedVersion, policyVersion, demonstration, error } = {}) {
  const lines = [`## ${mode === 'quality' ? 'Quality' : mode === 'security' ? 'Security regression' : 'Lab demonstration: ' + mode}`, '',
    '**Execution: GitHub Actions runner, not your laptop.**', '',
    `[Run](${metadata.url}) | Event: \`${metadata.event}\` | Checked-out commit: \`${metadata.sha}\`.`, ''];
  if (metadata.prHead) lines.push(`PR source head: \`${metadata.prHead}\`. The checked-out commit may be the PR test-merge commit; they are not interchangeable.`, '');
  if (installedVersion) lines.push(`Installed lodash: **${installedVersion}**. Reviewed policy version: **${policyVersion}**.`, '');
  if (results.length) {
    lines.push('| Suite | Tests | Pass | Fail | Cancelled | Skipped | Todo | Result |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const row of results) lines.push(`| ${row.name} | ${row.tests ?? 'unknown'} / ${row.expected} | ${row.pass ?? '-'} | ${row.fail ?? '-'} | ${row.cancelled ?? '-'} | ${row.skipped ?? '-'} | ${row.todo ?? '-'} | ${row.passed ? 'PASS' : row.complete && !row.executionError ? 'FAIL' : 'ERROR / incomplete execution'} |`);
    lines.push('', 'Named red baselines are intentional learning steps, not passing checks. Zero, missing, skipped, or cancelled tests cannot pass. Do not change assertions to finish.');
  }
  if (demonstration) lines.push('', ...demonstration);
  if (error) lines.push('', '**ERROR:** the runner could not complete or verify this snapshot. Inspect the job log; missing evidence is not a pass.');
  lines.push('', mode === 'smoke' ? '**Scope:** runner-local loopback checks only; no laptop server, deployment, independent release approval, or executed rollback.'
    : 'A successful job is not proof that native alerts are fixed. Inspect current PR checks, then the merged default revision and the original Security alert URLs.');
  return lines.join('\n') + '\n';
}

function dependencyVersions(cwd) {
  const load = createRequire(path.join(cwd, 'package.json'));
  const installedVersion = load('lodash/package.json').version;
  const policyVersion = JSON.parse(fs.readFileSync(path.join(cwd, 'dependency-policy.json'), 'utf8')).validatedVersion;
  for (const value of [installedVersion, policyVersion]) {
    if (typeof value !== 'string' || !/^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/.test(value)) throw new Error('Unexpected dependency version metadata.');
  }
  return { installedVersion, policyVersion };
}

function demonstrate(mode, cwd) {
  if (mode === 'secret-response') {
    const { MockProvider } = require(path.join(cwd, 'src/mock-provider.cjs'));
    const provider = new MockProvider();
    const original = provider.issue();
    assert.equal(provider.authenticate(original), true);
    const replacement = provider.rotate(original);
    assert.equal(provider.authenticate(original), false);
    assert.equal(provider.authenticate(replacement), true);
    assert.equal(provider.revoke(replacement), true);
    assert.equal(provider.authenticate(replacement), false);
    const events = provider.events.map(({ sequence, action, ok }) => ({ sequence, action, ok }));
    return ['**IN-MEMORY MOCK ONLY:** old credential denied after rotation; replacement accepted, then revoked and denied. No real provider was contacted or credential revoked.', '',
      '```json', JSON.stringify(events, null, 2), '```'];
  }
  if (mode === 'metrics') {
    const { calculateMetrics, metricHistory } = require(path.join(cwd, 'src/metrics.cjs'));
    const from = '2026-09-01T00:00:00Z';
    const to = '2026-09-08T00:00:00Z';
    const result = calculateMetrics(metricHistory, { from, to });
    return ['**FROZEN SYNTHETIC DATA:** four-row teaching cohort, not live repository counts or an organization dashboard.', '',
      '```json', JSON.stringify({ fromInclusive: from, toExclusive: to, ...result }, null, 2), '```'];
  }
  return null;
}

function executionRecord(mode, labId, metadata, results, details) {
  return { schemaVersion: 1, mode, labId, ...metadata, installedVersion: details.installedVersion,
    policyVersion: details.policyVersion, error: Boolean(details.error),
    suites: results.map(({ stdout, stderr, ...result }) => result) };
}

function main() {
  const cwd = path.resolve(__dirname, '..');
  const env = process.env;
  const mode = process.argv[2] === 'demonstration' ? env.LAB_DEMONSTRATION : process.argv[2];
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'lab.json'), 'utf8'));
  validateMode(mode, config.id, env);
  const metadata = snapshot(cwd, env);
  if (!env.GITHUB_STEP_SUMMARY) throw new Error('The Actions summary is unavailable.');
  const results = [];
  const details = {};
  try {
    Object.assign(details, dependencyVersions(cwd));
    for (const suite of SUITES[mode] ?? []) {
      const result = runSuite(cwd, suite);
      results.push(result);
      process.stdout.write(result.stdout);
      process.stderr.write(result.stderr);
    }
    details.demonstration = demonstrate(mode, cwd);
    const after = snapshot(cwd, env);
    if (after.sha !== metadata.sha) throw new Error('The snapshot changed during verification.');
    if (results.some((result) => !result.passed)) process.exitCode = 1;
  } catch (error) {
    details.error = true;
    process.exitCode = 1;
    console.error(error.message);
  } finally {
    fs.appendFileSync(env.GITHUB_STEP_SUMMARY, summary(mode, metadata, results, details), 'utf8');
    console.log('BSP_GHAS_RESULT ' + JSON.stringify(executionRecord(mode, config.id, metadata, results, details)));
  }
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { SUITES, testResult, runSuite, validateMode, snapshot, summary, dependencyVersions, demonstrate, executionRecord, main };
