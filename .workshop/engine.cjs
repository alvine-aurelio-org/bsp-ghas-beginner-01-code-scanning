'use strict';

const SHA = /^[a-f0-9]{40}$/;
const MARKER = 'bsp-beginner-2026';
const CHECKS = ['unit-and-compatibility', 'secure-behavior', 'dependency-review'];

function marker(context, key) {
  return `<!-- ${MARKER}:${context.repository.id}:${context.config.id}:${key} -->`;
}

async function contextFor(client, config) {
  if (config.edition !== 'beginner-2026' || !/^0[1-5]$/.test(config.id)) throw new Error('Unexpected lab configuration.');
  const repository = (await client.request()).data;
  if (repository.full_name?.toLowerCase() !== client.repository.toLowerCase() || !Number.isSafeInteger(repository.id)) throw new Error('Repository identity mismatch.');
  const source = repository.full_name.toLowerCase() === config.source.toLowerCase();
  // Preserve the publisher's already-public Lab 01 source, without broadening
  // participant-copy visibility or altering any repository access setting.
  const publicSource = source && config.id === '01' && config.sourceVisibility === 'public' &&
    config.sourceRepositoryId === 1392023553 && repository.id === 1392023553 &&
    repository.full_name.toLowerCase() === 'alvine-aurelio-org/bsp-ghas-beginner-01-code-scanning' &&
    repository.owner?.id === 249697069 && repository.private === false && repository.visibility === 'public';
  if ((!repository.private && !publicSource) || repository.fork || repository.owner?.type !== 'Organization') throw new Error('This edition requires a private, non-fork participant copy in your approved organization.');
  // Normal packages permit participants' own entitled organizations. An instructor
  // may explicitly bind an edition to one owner; never ignore that restriction.
  if (config.owner !== undefined || config.ownerId !== undefined) {
    if (repository.owner.login?.toLowerCase() !== config.owner?.toLowerCase() || repository.owner.id !== config.ownerId) throw new Error('Repository owner does not match the instructor-approved organization identity.');
  }
  if (!source && repository.template_repository?.full_name?.toLowerCase() !== config.source.toLowerCase()) throw new Error('The copy does not identify the expected source template. Use this template, not an unrelated repository.');
  const branch = repository.default_branch;
  if (typeof branch !== 'string' || !/^[A-Za-z0-9_./-]+$/.test(branch)) throw new Error('Invalid default branch.');
  const head = (await client.request(`/git/ref/heads/${encodeURIComponent(branch)}`)).data?.object?.sha;
  if (!SHA.test(head ?? '')) throw new Error('No default-branch commit is available yet.');
  return { repository, config, branch, head, source, url: `https://github.com/${repository.full_name}` };
}

async function unchanged(client, context) {
  const repository = (await client.request()).data;
  const current = (await client.request(`/git/ref/heads/${encodeURIComponent(context.branch)}`)).data?.object?.sha;
  if (repository.id !== context.repository.id || repository.default_branch !== context.branch || current !== context.head) throw new Error('The default branch changed during this operation. Run the command again; no stale progress will be posted.');
}

function selectManaged(items, context, key, { pull = false } = {}) {
  const expected = marker(context, key);
  const matches = items.filter((item) => Boolean(item.pull_request) === pull && item.body?.includes(expected));
  if (matches.length > 1) throw new Error(`Duplicate managed item: ${key}. Ask the instructor to reconcile it.`);
  return matches[0] ?? null;
}

async function ensureIssue(client, context, items, key, title, body) {
  const existing = selectManaged(items, context, key);
  if (existing) return existing;
  const result = await client.request('/issues', { method: 'POST', body: { title, body: `${marker(context, key)}\n\n${body}` } });
  items.push(result.data);
  return result.data;
}

async function starterSpecs(client, context) {
  const { config, head } = context;
  if (config.starter !== 'gates') return [{
    key: 'work', branch: 'lab/work', title: `Lab ${config.id}: make your security fix here`,
    files: { 'exercise/start.md': '# Your work branch\n\nFollow LAB.md. Make the first real change yourself, then push and inspect the new checks.\n' },
    explanation: 'This notes-only starter PR is not a fix. Use its branch for the manual exercise. For Autofix or Dependabot, use the genuine generated PR and close this unused starter without merging it.'
  }];
  const preview = await client.file('src/routes/preview.cjs', head);
  const queryConfig = await client.file('.github/codeql/codeql-config.yml', head);
  if (!preview.includes('${escape(label)}') || !queryConfig.includes('name: BSP beginner CodeQL')) throw new Error('Unexpected gate-case baseline; refusing to manufacture a different defect.');
  const rawPreview = preview.replace('${escape(label)}', '${label}');
  const unsafePreview = rawPreview.includes('Ticket preview')
    ? rawPreview.replace('Ticket preview', 'Secure ticket preview')
    : rawPreview.replace('<p>${label}</p>', '<h1>Secure ticket preview</h1><p>${label}</p>');
  if (unsafePreview === rawPreview) throw new Error('Unexpected preview layout; no useful heading could be retained after repair.');
  return [{
    key: 'unsafe', branch: 'lab/unsafe-preview', title: 'Lab 05: repair this blocked preview PR',
    files: { 'src/routes/preview.cjs': unsafePreview },
    explanation: 'A controlled in-diff output-encoding defect. Do not merge the red revision. Restore escaping while keeping the useful new heading. Keep all tests and security rules.'
  }, {
    key: 'missing', branch: 'lab/missing-analysis', title: 'Lab 05: restore the missing CodeQL analysis',
    files: { '.github/codeql/codeql-config.yml': 'name: BSP beginner CodeQL\npaths:\n  - src\nqueries:\n  - uses: ./bsp-missing-query.ql\n',
      'exercise/scan-recovery.md': '# Scan recovery\n\nReplace the missing query with security-extended, inspect a successful scan, then close this demonstration PR.\n' },
    explanation: 'A deliberately nonexistent query prevents analysis. Missing analysis is NOT a clean scan. Replace ./bsp-missing-query.ql with security-extended in the CodeQL configuration, inspect the new run, then close this demonstration without merging the broken configuration. No workflow-file write permission is needed.'
  }];
}

async function ensurePull(client, context, pulls, spec, task) {
  const tag = marker(context, `pr-${spec.key}`);
  const matches = pulls.filter((pr) => pr.body?.includes(tag));
  if (matches.length > 1) throw new Error('Duplicate starter PRs; refusing to choose one.');
  if (matches[0]) {
    const pr = matches[0];
    if (pr.head?.repo?.id !== context.repository.id || pr.base?.repo?.id !== context.repository.id || pr.head.ref !== spec.branch || pr.base.ref !== context.branch) throw new Error('Starter PR identity does not match this copy.');
    return pr;
  }
  const ref = await client.request(`/git/ref/heads/${encodeURIComponent(spec.branch)}`, { optional: true });
  const message = `BSP beginner ${context.config.id}: starter ${spec.key}`;
  if (ref.ok) {
    const commit = (await client.request(`/git/commits/${ref.data.object.sha}`)).data;
    if (commit.message !== message || commit.parents?.length !== 1 || commit.parents[0].sha !== context.head) throw new Error('An unrecognized work branch exists. It was not overwritten.');
    for (const [file, expected] of Object.entries(spec.files)) {
      if (await client.file(file, ref.data.object.sha) !== expected) throw new Error('An existing work branch has different content. It was not overwritten.');
    }
  } else {
    if (ref.status !== 404) throw new Error('Cannot establish whether the work branch exists.');
    await unchanged(client, context);
    const parent = (await client.request(`/git/commits/${context.head}`)).data;
    const tree = (await client.request('/git/trees', { method: 'POST', body: { base_tree: parent.tree.sha,
      tree: Object.entries(spec.files).map(([filename, content]) => ({ path: filename, type: 'blob', mode: '100644', content }))
    } })).data;
    const commit = (await client.request('/git/commits', { method: 'POST', body: { message, tree: tree.sha, parents: [context.head] } })).data;
    await client.request('/git/refs', { method: 'POST', body: { ref: `refs/heads/${spec.branch}`, sha: commit.sha } });
  }
  const pr = (await client.request('/pulls', { method: 'POST', body: {
    head: spec.branch, base: context.branch, title: spec.title,
    body: `${tag}\n\n${spec.explanation}\n\nTask: #${task.number}. [Follow only LAB.md](${context.url}/blob/${context.branch}/LAB.md).`
  } })).data;
  pulls.push(pr);
  return pr;
}

async function setup(client, context, { createPulls = true } = {}) {
  if (typeof createPulls !== 'boolean') throw new Error('Choose whether Start lab should create starter pull requests.');
  // Installation-token metadata can report viewer push=false even when the
  // workflow has contents:write. Those viewer-role flags are not token scopes.
  // Keep the human preflight; GitHub enforces each installation-token mutation.
  if (!client.token && context.repository.permissions?.push === false) throw new Error('Setup needs write access to your copy.');
  const issues = (await client.list('/issues?state=all')).rows;
  const lesson = `${context.url}/blob/${context.branch}/LAB.md`;
  const exercise = await ensureIssue(client, context, issues, 'exercise', `Exercise - Lab ${context.config.id}: ${context.config.title}`,
    `## One guide for this lab\n\n[Follow only LAB.md](${lesson}). It contains setup, exact file edits, Git commands, pull requests, and final checks.\n\n**Git + VS Code + GitHub.com.** Keep actual alert and run URLs in your repair PR comments. This issue and its automatic comment are evidence, not another instruction guide.\n\n[Security](${context.url}/security) | [Actions](${context.url}/actions) | [Pull requests](${context.url}/pulls)\n\n${context.source ? '**Source template:** intentionally unfinished; these are not participant results.' : 'Work items belong to this copy; native scans create its own alerts.'}`);
  const task = await ensureIssue(client, context, issues, 'task', context.config.taskTitle,
    `Follow [the lesson](${lesson}) and track the real alert, PR and final run links here.\n\nAssign yourself. Note one target date. Do not paste secret values.\n\nExercise: #${exercise.number}. A merged PR only counts as remediation after the original native alert reports **fixed** (or, for the inert secret, the correctly explained test resolution).`);
  if (!createPulls) {
    await unchanged(client, context);
    return { exercise: exercise.html_url, task: task.html_url, pulls: [],
      guide: lesson, starterCreation: 'not requested; use the Git branches and PR steps in LAB.md; preserve any existing work' };
  }
  const pulls = (await client.list('/pulls?state=all')).rows;
  const created = [];
  const identities = context.config.starter === 'gates'
    ? [{ key: 'unsafe', branch: 'lab/unsafe-preview' }, { key: 'missing', branch: 'lab/missing-analysis' }]
    : [{ key: 'work', branch: 'lab/work' }];
  let specs;
  for (const identity of identities) {
    let spec = identity;
    if (!pulls.some((pr) => pr.body?.includes(marker(context, `pr-${identity.key}`)))) {
      specs ??= await starterSpecs(client, context);
      spec = specs.find((candidate) => candidate.key === identity.key);
    }
    created.push(await ensurePull(client, context, pulls, spec, task));
  }
  await unchanged(client, context);
  return { exercise: exercise.html_url, task: task.html_url, pulls: created.map((pr) => ({ number: pr.number, url: pr.html_url, state: pr.state })) };
}

function summarizeCode(rows, context) {
  return rows.filter((alert) => alert.most_recent_instance?.ref === `refs/heads/${context.branch}`).map((alert) => ({
    number: alert.number, state: alert.state, rule: alert.rule?.id, severity: alert.rule?.security_severity_level ?? alert.rule?.severity,
    path: alert.most_recent_instance?.location?.path, url: alert.html_url, fixedAt: alert.fixed_at ?? null
  }));
}

function summarizeDependencies(rows) {
  return rows.map((alert) => ({ number: alert.number, state: alert.state, package: alert.dependency?.package?.name,
    advisory: alert.security_advisory?.ghsa_id, severity: alert.security_vulnerability?.severity,
    patchedVersion: alert.security_vulnerability?.first_patched_version?.identifier ?? null,
    url: alert.html_url, fixedAt: alert.fixed_at ?? null }));
}

function summarizeSecrets(rows) {
  // Explicit allowlist. Never spread the original response: it includes the secret.
  return rows.map((alert) => ({ number: alert.number, state: alert.state, type: alert.secret_type,
    resolution: alert.resolution ?? null, url: alert.html_url, resolvedAt: alert.resolved_at ?? null }));
}

function latestChecks(rows) {
  const latest = new Map();
  for (const check of rows) {
    if (check.app?.id !== 15368) continue;
    if (!latest.has(check.name) || check.id > latest.get(check.name).id) latest.set(check.name, check);
  }
  return [...latest.values()].map((check) => ({ name: check.name, status: check.status, conclusion: check.conclusion,
    sha: check.head_sha, url: check.html_url, id: check.id }));
}

function observedChecks(rows, runs, context, { pr, lookupSha, scope }) {
  // A push and a PR workflow can report the same check name/source SHA while
  // testing different trees. Preserve each native check and its event, never
  // let a newer green push check erase a red PR check.
  return [...new Map(rows.filter((check) => check.app?.id === 15368 && check.head_sha === lookupSha)
    .map((check) => [check.id, check])).values()].map((check) => {
    const run = runs.find((candidate) => candidate.check_suite_id === check.check_suite?.id &&
      candidate.repository?.id === context.repository.id && candidate.head_repository?.id === context.repository.id &&
      (candidate.head_sha === lookupSha || candidate.head_sha === pr?.head.sha));
    let event = 'unresolved event';
    if (run?.event === 'pull_request' && pr && run.pull_requests?.some((item) => item.number === pr.number &&
      item.head?.sha === pr.head.sha && item.head.repo?.id === context.repository.id && item.base?.sha === pr.base.sha && item.base.repo?.id === context.repository.id)) event = 'pull_request';
    if (run?.event === 'push' && run.head_branch === (pr?.head.ref ?? context.branch) && run.head_sha === lookupSha) event = 'push';
    if (run?.event === 'workflow_dispatch' && run.head_branch === (pr?.head.ref ?? context.branch) && run.head_sha === lookupSha) event = 'workflow_dispatch';
    return { name: check.name, status: check.status, conclusion: check.conclusion, sha: check.head_sha, url: check.html_url,
      id: check.id, suiteId: check.check_suite?.id ?? null, event, scope, runId: event === 'unresolved event' ? null : run.id };
  });
}

function codeOutcome(code, analysis, expectedRules) {
  if (!code.available) return 'UNAVAILABLE: code alert access is required';
  if (!analysis) return 'PENDING: no successful CodeQL analysis for the current default commit';
  const expected = expectedRules.map((rule) => code.rows.filter((alert) => alert.rule === rule));
  if (expected.some((alerts) => alerts.length === 0)) return 'PENDING: the expected baseline finding has not been observed';
  if (expected.some((alerts) => alerts.some((alert) => alert.state === 'dismissed'))) return 'NOT FIXED: a baseline alert was dismissed, not repaired';
  if (code.rows.some((alert) => alert.state === 'open')) return 'IN PROGRESS: native default-branch alerts remain open';
  if (expected.length && expected.every((alerts) => alerts.every((alert) => alert.state === 'fixed' && alert.fixedAt))) return 'FIXED: original native alerts are fixed on the current default branch';
  return 'CURRENT SCAN: no open code alerts returned; this alone is not whole-lab completion';
}

async function collect(client, context, { full = true } = {}) {
  const branchRef = encodeURIComponent(`refs/heads/${context.branch}`);
  const [analyses, code, checks, pulls, runs] = await Promise.all([
    client.list(`/code-scanning/analyses?ref=${branchRef}&tool_name=CodeQL`, { optional: true }),
    client.list(`/code-scanning/alerts?ref=${branchRef}`, { optional: true }),
    client.list(`/commits/${context.head}/check-runs?filter=all`, { key: 'check_runs', optional: true }),
    client.list('/pulls?state=all', { optional: true }),
    client.list('/actions/runs', { key: 'workflow_runs', optional: true })
  ]);
  const valid = analyses.rows.filter((analysis) => analysis.commit_sha === context.head && analysis.ref === `refs/heads/${context.branch}` && analysis.tool?.name === 'CodeQL' && analysis.error === '' && !analysis.warning);
  const analysis = valid.sort((a, b) => b.id - a.id)[0] ?? null;
  const safeCode = { available: code.available, status: code.status, rows: summarizeCode(code.rows, context) };
  const report = {
    schemaVersion: 1, observedAt: new Date().toISOString(), repository: context.repository.full_name, repositoryId: context.repository.id,
    labId: context.config.id, sourceTemplate: context.source, branch: context.branch, head: context.head,
    code: safeCode, analysesAvailable: analyses.available,
    analysis: analysis ? { id: analysis.id, sha: analysis.commit_sha, results: analysis.results_count, category: analysis.category, url: `${context.url}/security/code-scanning?query=branch%3A${encodeURIComponent(context.branch)}` } : null,
    outcome: codeOutcome(safeCode, analysis, context.config.expectedRules),
    checks: { available: checks.available, rows: observedChecks(checks.rows, runs.rows, context, { lookupSha: context.head, scope: 'default SHA' }) },
    pulls: [], dependencies: { available: false, status: 'not-requested', rows: [] }, secrets: { available: false, status: 'not-requested', rows: [] }
  };
  // Retain closed human-authored repair PRs too: standard Autofix need not use
  // the cloud-agent identity, and history must not disappear after a merge.
  const selected = pulls.rows.filter((pr) => pr.head?.repo?.id === context.repository.id && pr.base?.repo?.id === context.repository.id && pr.base.ref === context.branch);
  if (selected.length > 30) throw new Error('More than 30 lab PRs need inspection; ask the instructor to narrow the exercise.');
  for (const summary of selected) {
    const pr = (await client.request(`/pulls/${summary.number}`)).data;
    const current = await client.list(`/commits/${pr.head.sha}/check-runs?filter=all`, { key: 'check_runs', optional: true });
    const mergeSha = SHA.test(pr.merge_commit_sha ?? '') ? pr.merge_commit_sha : null;
    const merge = mergeSha && mergeSha !== pr.head.sha
      ? await client.list(`/commits/${mergeSha}/check-runs?filter=all`, { key: 'check_runs', optional: true })
      : { available: false, rows: [] };
    const fresh = (await client.request(`/pulls/${pr.number}`)).data;
    if (fresh.head.sha !== pr.head.sha || fresh.base.sha !== pr.base.sha || fresh.state !== pr.state || fresh.merge_commit_sha !== pr.merge_commit_sha) throw new Error('A PR changed while its checks were read. Refresh instead of using stale evidence.');
    report.pulls.push({ number: pr.number, url: pr.html_url, head: pr.head.sha, base: pr.base.sha, branch: pr.head.ref, state: pr.state,
      merged: Boolean(pr.merged), mergedAt: pr.merged_at, mergeSha: pr.merge_commit_sha, author: pr.user?.login,
      checksAvailable: current.available || merge.available, sourceChecksAvailable: current.available, mergeChecksAvailable: merge.available,
      checks: [...observedChecks(current.rows, runs.rows, context, { pr, lookupSha: pr.head.sha, scope: 'source SHA' }),
        ...observedChecks(merge.rows, runs.rows, context, { pr, lookupSha: mergeSha, scope: pr.merged ? 'merged SHA' : 'PR test-merge SHA' })] });
  }
  if (full) {
    const [dependencies, secrets] = await Promise.all([
      client.list('/dependabot/alerts', { optional: true }), client.list('/secret-scanning/alerts', { optional: true })
    ]);
    report.dependencies = { available: dependencies.available, status: dependencies.status, rows: summarizeDependencies(dependencies.rows) };
    report.secrets = { available: secrets.available, status: secrets.status, rows: summarizeSecrets(secrets.rows) };
  }
  await unchanged(client, context);
  return report;
}

function cell(value) { return String(value ?? '-').replace(/[|\r\n<>`]/g, ' ').slice(0, 180); }
function trustedUrl(value, context) { return typeof value === 'string' && value.startsWith(`${context.url}/`) ? value.replace(/[\s()<>]/g, '') : context.url; }

function render(context, report, { full = true } = {}) {
  const tag = marker(context, full ? 'full-snapshot' : 'automatic-snapshot');
  const lines = [tag, '', `## ${full ? 'Full security' : 'Automatic code and PR'} progress`, '',
    `Observed: ${report.observedAt}. Default commit: [${report.head.slice(0, 12)}](${context.url}/commit/${report.head}).`, '',
    `**${report.outcome}**`, '', 'This is a live snapshot, not an exam score. A green scanner job, closed issue, or merged PR alone does not prove that an alert is fixed.', '',
    '### CodeQL alerts', '', '| Alert | Rule | Native state |', '| --- | --- | --- |'];
  for (const alert of report.code.rows) lines.push(`| [#${alert.number}](${trustedUrl(alert.url, context)}) | ${cell(alert.rule)} | ${cell(alert.state)} |`);
  if (!report.code.rows.length) lines.push(`| - | ${report.code.available ? 'No alerts returned; compare the expected starter findings above' : `UNAVAILABLE (HTTP ${report.code.status})`} | Not completion proof |`);
  lines.push('', `Current CodeQL analysis: ${report.analysis ? `**${report.analysis.id}**, ${report.analysis.results} result(s)` : '**PENDING / UNAVAILABLE**; no valid analysis for this exact default commit'}.`, '', '### Pull requests', '', 'Observed checks are listed separately by event and lookup revision. A push check is not a PR merge check. Keep unresolved or missing associations pending and inspect the native PR merge box; this table is not a merge verdict.', '', '| PR | Source revision | State | Observed native checks |', '| --- | --- | --- | --- |');
  for (const pr of report.pulls) {
    const checks = pr.checksAvailable ? pr.checks.map((check) => `[${cell(check.name)}: ${cell(check.conclusion ?? check.status)} (${cell(check.event)}, ${cell(check.scope)}, #${check.id})](${trustedUrl(check.url, context)})`).join('<br>') || 'PENDING: no observed checks; inspect native PR merge checks' : 'UNAVAILABLE';
    lines.push(`| [#${pr.number}](${trustedUrl(pr.url, context)}) | ${pr.head.slice(0, 12)} | ${pr.merged ? 'merged; verify default alerts' : cell(pr.state)} | ${checks} |`);
  }
  if (!report.pulls.length) lines.push('| - | - | No matching PRs returned | Run setup / inspect access |');
  if (full) {
    for (const [title, group, description] of [
      ['Dependabot', report.dependencies, (alert) => `${cell(alert.package)} / ${cell(alert.advisory)}`],
      ['Secret scanning (values never displayed)', report.secrets, (alert) => `${cell(alert.type)}${alert.resolution ? ` / ${cell(alert.resolution)}` : ''}`]
    ]) {
      lines.push('', `### ${title}`, '', '| Alert | Finding | Native state |', '| --- | --- | --- |');
      if (!group.available) lines.push(`| - | UNAVAILABLE (HTTP ${cell(group.status)}): check feature/access | Not clean |`);
      else if (!group.rows.length) lines.push('| - | No alerts returned; missing starter findings are pending, not passed | No baseline proof |');
      else for (const alert of group.rows) lines.push(`| [#${alert.number}](${trustedUrl(alert.url, context)}) | ${description(alert)} | ${cell(alert.state)} |`);
    }
  } else lines.push('', '**Dependabot and secret alerts:** open [Dependabot alerts](' + context.url + '/security/dependabot) and [Secret scanning](' + context.url + '/security/secret-scanning) in GitHub.com. Record the original alert URLs and native states in the task issue. The Actions token is not assumed to have these permissions, so these reads are not requested; missing access is **unavailable**, not zero alerts. No local status command is required.');
  if (context.source) lines.push('', '**Source template:** intentionally unfinished; these are not learner results.');
  lines.push('', 'Next: follow [LAB.md](' + context.url + '/blob/' + context.branch + '/LAB.md). Do not dismiss real problems, skip tests, or turn off checks to make this table green.');
  return lines.join('\n');
}

async function postProgress(client, context, report, { full = true, allowMissingExercise = false } = {}) {
  if (report.repositoryId !== context.repository.id || report.repository !== context.repository.full_name || report.head !== context.head || report.branch !== context.branch || report.labId !== context.config.id) throw new Error('Progress report identity or snapshot is stale. Refresh before posting.');
  const items = (await client.list('/issues?state=all')).rows;
  const exercise = selectManaged(items, context, 'exercise');
  if (!exercise) {
    if (allowMissingExercise) return null;
    throw new Error('No managed Exercise issue exists. Follow LAB.md and keep evidence in the actual repair PR.');
  }
  const comments = (await client.list(`/issues/${exercise.number}/comments`)).rows;
  const tag = marker(context, full ? 'full-snapshot' : 'automatic-snapshot');
  const existing = comments.filter((comment) => comment.body?.startsWith(tag));
  if (existing.length > 1) throw new Error('Duplicate progress comments; refusing to overwrite an arbitrary comment.');
  for (const snapshot of report.pulls) {
    const pr = (await client.request(`/pulls/${snapshot.number}`)).data;
    if (pr.head?.repo?.id !== context.repository.id || pr.base?.repo?.id !== context.repository.id || pr.head.sha !== snapshot.head || pr.base.sha !== snapshot.base || pr.state !== snapshot.state || Boolean(pr.merged) !== snapshot.merged || pr.merge_commit_sha !== snapshot.mergeSha) throw new Error('PR evidence changed after collection. Refresh the snapshot before posting.');
  }
  await unchanged(client, context);
  const body = render(context, report, { full });
  await client.request(existing[0] ? `/issues/comments/${existing[0].id}` : `/issues/${exercise.number}/comments`, { method: existing[0] ? 'PATCH' : 'POST', body: { body } });
  return exercise.html_url;
}

function trainingRules(context) {
  if (context.config.id !== '05') throw new Error('Training merge rules belong only to Lab 05.');
  return { name: 'BSP beginner 05 - security gates', target: 'branch', enforcement: 'active', bypass_actors: [],
    conditions: { ref_name: { include: [`refs/heads/${context.branch}`], exclude: [] } },
    rules: [{ type: 'deletion' }, { type: 'non_fast_forward' },
      { type: 'pull_request', parameters: { required_approving_review_count: 0, dismiss_stale_reviews_on_push: true, require_code_owner_review: false, require_last_push_approval: false, required_review_thread_resolution: true } },
      { type: 'required_status_checks', parameters: { strict_required_status_checks_policy: false, required_status_checks: CHECKS.map((name) => ({ context: name, integration_id: 15368 })) } },
      { type: 'code_scanning', parameters: { code_scanning_tools: [{ tool: 'CodeQL', alerts_threshold: 'errors_and_warnings', security_alerts_threshold: 'medium_or_higher' }] } }
    ] };
}

async function gates(client, context) {
  if (!context.repository.permissions?.admin) throw new Error('Ask your repository administrator to run lab:gates.');
  const wanted = trainingRules(context);
  const rules = (await client.list('/rulesets?includes_parents=false')).rows;
  const matches = rules.filter((rule) => rule.name === wanted.name);
  if (matches.length > 1) throw new Error('Duplicate training rulesets. No rules were changed.');
  if (matches[0]) return { id: matches[0].id, existing: true, message: 'Existing training rules preserved. Inspect the active rules; this command does not weaken or replace them.' };
  const result = (await client.request('/rulesets', { method: 'POST', body: wanted })).data;
  const confirmed = (await client.request(`/rulesets/${result.id}`)).data;
  const scanning = confirmed.rules?.find((rule) => rule.type === 'code_scanning')?.parameters?.code_scanning_tools;
  const required = confirmed.rules?.find((rule) => rule.type === 'required_status_checks')?.parameters?.required_status_checks ?? [];
  const pull = confirmed.rules?.find((rule) => rule.type === 'pull_request')?.parameters;
  if (confirmed.enforcement !== 'active' || confirmed.bypass_actors?.length ||
      !scanning?.some((tool) => tool.tool === 'CodeQL' && tool.alerts_threshold === 'errors_and_warnings' && tool.security_alerts_threshold === 'medium_or_higher') ||
      CHECKS.some((name) => !required.some((check) => check.context === name && check.integration_id === 15368)) ||
      !pull || pull.required_approving_review_count !== 0 || pull.require_last_push_approval !== false ||
      !confirmed.conditions?.ref_name?.include?.includes(`refs/heads/${context.branch}`)) throw new Error('Native ruleset readback did not confirm the expected gates and thresholds.');
  return { id: confirmed.id, existing: false, message: 'Training security rules enabled. Inherited organization rules were not changed.' };
}

module.exports = { CHECKS, marker, contextFor, unchanged, selectManaged, starterSpecs, setup, summarizeCode, summarizeDependencies,
  summarizeSecrets, latestChecks, observedChecks, codeOutcome, collect, render, postProgress, trainingRules, gates };
