'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { GitHub, git, targetRepository } = require('./github.cjs');
const { contextFor, unchanged } = require('./engine.cjs');
const { trustedCheckout } = require('./cli.cjs');

function neverIssuedMarker(identity) {
  const digest = crypto.createHash('sha256').update(`BSP beginner never-issued marker: ${identity}`).digest('hex');
  // A never-issued, format-recognition fixture. Never contact a real provider.
  return `SG.BSP_GHAS_DEMO_${digest.slice(0, 8)}.NEVER_ISSUED_${digest.slice(8, 38)}`;
}

function rejectionEvidence(result, { absent, before, after }) {
  const output = result.stdout + result.stderr;
  return Number.isInteger(result.status) && result.status !== 0 && /GH013/.test(output) && /Push cannot contain secrets/.test(output) &&
    /SendGrid API Key/.test(output) && absent && before === after;
}

async function main() {
  if (process.env.GITHUB_ACTIONS === 'true') throw new Error('Run the push check locally as yourself, not with an Actions token.');
  const cwd = path.resolve(__dirname, '..');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'lab.json'), 'utf8'));
  if (config.id !== '03') throw new Error('The safe secret-protection exercise belongs only to Lab 03.');
  const client = new GitHub(targetRepository(cwd));
  const context = await contextFor(client, config);
  trustedCheckout(cwd, context);
  if (context.repository.security_and_analysis?.secret_scanning_push_protection?.status !== 'enabled') throw new Error('Enable approved repository push protection first.');
  const branch = `lab/push-check-${crypto.randomBytes(6).toString('hex')}`;
  const previous = await client.request(`/git/ref/heads/${encodeURIComponent(branch)}`, { optional: true });
  if (previous.ok || previous.status !== 404) throw new Error('The canary branch is not proved absent.');
  const marker = neverIssuedMarker(`${context.repository.id}:${branch}`);
  function object(args, input) {
    const result = git(cwd, args, input);
    if (result.status !== 0) throw new Error('Cannot create the isolated local fixture objects. Your working files were not changed.');
    return result.stdout.trim();
  }
  const blob = object(['hash-object', '-w', '--stdin'], `# Never-issued classroom marker, not a working credential\nSENDGRID_API_KEY=${marker}\n`);
  const listing = object(['ls-tree', context.head]);
  const tree = object(['mktree'], `${listing}\n100644 blob ${blob}\tinert-push-canary.txt\n`);
  const commit = object(['commit-tree', tree, '-p', context.head], 'test: never-issued push protection canary\n');
  await unchanged(client, context);
  const pushed = git(cwd, ['-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential', 'push', 'origin', `${commit}:refs/heads/${branch}`]);
  const after = (await client.request(`/git/ref/heads/${encodeURIComponent(context.branch)}`)).data.object.sha;
  const remote = await client.request(`/git/ref/heads/${encodeURIComponent(branch)}`, { optional: true });
  const absent = !remote.ok && remote.status === 404;
  const verified = rejectionEvidence(pushed, { absent, before: context.head, after });
  let unexpectedBranchRemoved = false;
  // Clean up only the exact new, never-issued canary ref if protection failed.
  // Never delete another ref, change default, or treat this cleanup as protection.
  if (remote.ok && remote.data.object.sha === commit) {
    await client.request(`/git/refs/heads/${encodeURIComponent(branch)}`, { method: 'DELETE' });
    const cleanup = await client.request(`/git/ref/heads/${encodeURIComponent(branch)}`, { optional: true });
    unexpectedBranchRemoved = !cleanup.ok && cleanup.status === 404;
  }
  const result = { observedAt: new Date().toISOString(), repositoryId: context.repository.id, repository: context.repository.full_name,
    before: context.head, after, attemptedRef: branch, attemptedCommit: commit, verified, secretSpecificRejection: /GH013/.test(pushed.stderr) && /SendGrid API Key/.test(pushed.stderr),
    remoteBranchAbsentAtVerification: absent, unexpectedBranchRemoved, fixtureSha256: crypto.createHash('sha256').update(marker).digest('hex'),
    realCredentialUsed: false, bypassAttempted: false, workingTreeChanged: false };
  const folder = path.join(cwd, '.workshop-state');
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, `push-check-${Date.now()}.json`), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify(result, null, 2));
  if (!verified) throw new Error('NOT PASSED: no verified secret-specific prevention. Ask the instructor; do not bypass protection or use a real secret.');
}

if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
module.exports = { neverIssuedMarker, rejectionEvidence, main };
