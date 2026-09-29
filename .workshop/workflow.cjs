'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { GitHub, git, targetRepository } = require('./github.cjs');
const { contextFor, setup, collect, render, postProgress } = require('./engine.cjs');

function starterChoice(value = 'false') {
  if (!['true', 'false'].includes(value)) throw new Error('Create starter pull requests must be true or false.');
  return value === 'true';
}

function assertManagementRun(env, context, checkout) {
  if (env.GITHUB_ACTIONS !== 'true' || !env.GH_TOKEN) throw new Error('Use Actions -> Start lab / Lab progress in GitHub.com; no local management command is required.');
  if (env.GITHUB_REPOSITORY !== context.repository.full_name || env.GITHUB_REF !== `refs/heads/${context.branch}` || checkout !== context.head) {
    throw new Error('Management workflows require this repository and the current trusted default checkout. Rerun on current dev; no stale progress was posted.');
  }
}

async function execute(command, client, context, { createPulls = false } = {}) {
  if (command === 'setup') {
    const result = await setup(client, context, { createPulls });
    const lines = ['## Start lab', '', `Default commit: \`${context.head}\`.`, '',
      `[Exercise](${result.exercise}) | [Task](${result.task})`, '',
      ...result.pulls.map((pr) => `- [PR #${pr.number}](${pr.url}) (${pr.state}); inspect its actual head branch before fetching.`), '',
      'Existing open and closed work is preserved, not reset. These work items are not proof of completed security fixes.', '',
      'Use **Git, VS Code, and GitHub.com**. Open the [lesson](' + context.url + '/blob/' + context.branch + '/LAB.md).', '',
      createPulls ? 'Optional legacy starters were requested. They do not replace the single lab guide.'
        : 'No starter PRs were requested. Follow only [LAB.md](' + result.guide + ') for the Git branches and browser PR steps.', '',
      'No additional setup or manual instruction document is required.'];
    return { result, summary: lines.join('\n') + '\n' };
  }
  if (command !== 'status') throw new Error('Choose setup or status; administrative changes are not available to the workflow.');
  const report = await collect(client, context, { full: false });
  const issue = await postProgress(client, context, report, { full: false, allowMissingExercise: true });
  const summary = render(context, report, { full: false }) + (issue ? `\n\n[Exercise comment](${issue})\n`
    : '\n\n**Automatic issue comment unavailable:** no managed Exercise issue was found. Follow LAB.md and keep evidence in the actual repair PR. This snapshot is not whole-lab completion.\n');
  return { result: { issue, head: report.head, outcome: report.outcome, dependencies: 'use native Security page', secrets: 'use native Security page' }, summary };
}

async function main() {
  const env = process.env;
  if (env.GITHUB_ACTIONS !== 'true' || !env.GH_TOKEN) throw new Error('Open the browser workflow instead of running management locally.');
  const cwd = path.resolve(__dirname, '..');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'lab.json'), 'utf8'));
  const client = new GitHub(targetRepository(cwd), { token: env.GH_TOKEN });
  const context = await contextFor(client, config);
  const head = git(cwd, ['rev-parse', 'HEAD']);
  if (head.status !== 0) throw new Error('Cannot verify the trusted workflow checkout.');
  assertManagementRun(env, context, head.stdout.trim());
  const output = await execute(process.argv[2], client, context, { createPulls: starterChoice(env.CREATE_STARTER_PRS) });
  if (!env.GITHUB_STEP_SUMMARY) throw new Error('The Actions job summary is unavailable.');
  fs.appendFileSync(env.GITHUB_STEP_SUMMARY, output.summary, 'utf8');
  console.log(JSON.stringify(output.result, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
module.exports = { starterChoice, assertManagementRun, execute, main };
