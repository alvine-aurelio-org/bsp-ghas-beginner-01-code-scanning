'use strict';

const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { git } = require('./github.cjs');
const root = path.resolve(__dirname, '..');

async function main() {
  const mode = process.argv[2];
  if (mode === 'secret-response') {
    const { MockProvider } = require('../src/mock-provider.cjs');
    const provider = new MockProvider();
    const original = provider.issue();
    assert.equal(provider.authenticate(original), true);
    const replacement = provider.rotate(original);
    assert.equal(provider.authenticate(original), false);
    assert.equal(provider.authenticate(replacement), true);
    assert.equal(provider.revoke(replacement), true);
    assert.equal(provider.authenticate(replacement), false);
    console.log('LOCAL MOCK ONLY: old credential rejected; updated consumer accepted; replacement revoked. No real provider or GHAS scan was used.');
    console.log(JSON.stringify(provider.events, null, 2));
  } else if (mode === 'metrics') {
    const { calculateMetrics, metricHistory } = require('../src/metrics.cjs');
    const from = '2026-09-01T00:00:00Z';
    const to = '2026-09-08T00:00:00Z';
    const result = calculateMetrics(metricHistory, { from, to });
    console.log(JSON.stringify({ source: 'FROZEN SYNTHETIC DATA - not live repository or organization metrics', fromInclusive: from, toExclusive: to, ...result }, null, 2));
  } else if (mode === 'smoke') {
    const head = git(root, ['rev-parse', 'HEAD']);
    const dirty = git(root, ['status', '--porcelain']);
    if (head.status !== 0 || dirty.status !== 0 || dirty.stdout.trim()) throw new Error('Smoke verification needs a clean committed snapshot. Save your work first.');
    const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', 'test/baseline.test.cjs', 'test/security.test.cjs', 'test/rate-limit.test.cjs'], {
      cwd: root, stdio: 'inherit', windowsHide: true, timeout: 120_000
    });
    if (result.error || result.status !== 0) throw new Error('Smoke checks failed; this is not a safe release checkpoint.');
    if (git(root, ['rev-parse', 'HEAD']).stdout !== head.stdout || git(root, ['status', '--porcelain']).stdout.trim()) throw new Error('Snapshot changed during smoke verification.');
    console.log(JSON.stringify({ scope: 'local loopback training only; no deployment or independent release approval', commit: head.stdout.trim(), result: 'PASS' }));
  } else throw new Error('Choose secret-response, metrics or smoke.');
}

if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
module.exports = { main };
