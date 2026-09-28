'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { GitHub, git, targetRepository } = require('./github.cjs');
const { contextFor, setup, collect, postProgress, gates } = require('./engine.cjs');

function trustedCheckout(cwd, context) {
  const branch = git(cwd, ['branch', '--show-current']);
  const head = git(cwd, ['rev-parse', 'HEAD']);
  const dirty = git(cwd, ['status', '--porcelain', '--untracked-files=normal']);
  if ([branch, head, dirty].some((result) => result.status !== 0) || branch.stdout.trim() !== context.branch ||
      head.stdout.trim() !== context.head || dirty.stdout.trim()) {
    throw new Error(`Use your clean, current ${context.branch} checkout for management commands. Save/commit your work; switch to ${context.branch} and pull --ff-only. Nothing was reset or discarded.`);
  }
}

async function enable(client, context, approved) {
  if (!approved) throw new Error('Feature enablement requires existing approved entitlement. Use --approve-security only after your instructor confirms it; no purchase or trial renewal is performed.');
  if (!context.repository.permissions?.admin) throw new Error('Enabling features requires an administrator of this repository.');
  const flags = context.repository.security_and_analysis;
  const needed = {};
  for (const key of ['code_security', 'secret_scanning', 'secret_scanning_push_protection']) {
    if (flags?.[key]?.status !== 'enabled') needed[key] = { status: 'enabled' };
  }
  if (Object.keys(needed).length) await client.request('', { method: 'PATCH', body: { security_and_analysis: needed } });
  await client.request('/vulnerability-alerts', { method: 'PUT' });
  if (context.config.id === '04') await client.request('/automated-security-fixes', { method: 'PUT' });
  const confirmed = (await client.request()).data;
  for (const key of ['code_security', 'secret_scanning', 'secret_scanning_push_protection']) {
    if (confirmed.security_and_analysis?.[key]?.status !== 'enabled') throw new Error(`${key} was not confirmed enabled. No entitlement or billing change will be attempted.`);
  }
  const defaultSetup = await client.request('/code-scanning/default-setup', { optional: true });
  if (defaultSetup.ok && defaultSetup.data.state === 'configured') throw new Error('Default CodeQL setup is already configured. Ask the instructor to select one setup method; this edition ships advanced setup and will not silently switch yours.');
  return { repository: context.repository.full_name, security: 'enabled and read back', billingChanged: false };
}

async function main() {
  const command = process.argv[2];
  if (!['setup', 'status', 'enable', 'gates'].includes(command)) throw new Error('Choose setup, status, enable or gates.');
  const cwd = path.resolve(__dirname, '..');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'lab.json'), 'utf8'));
  const workflow = process.env.GITHUB_ACTIONS === 'true';
  if (workflow && !['setup', 'status'].includes(command)) throw new Error('Administrative enablement is not available to the Actions token.');
  const client = new GitHub(targetRepository(cwd), { token: workflow ? process.env.GH_TOKEN : undefined });
  if (workflow && !process.env.GH_TOKEN) throw new Error('Missing workflow token.');
  const context = await contextFor(client, config);
  if (workflow) {
    if (process.env.GITHUB_REF !== `refs/heads/${context.branch}`) throw new Error('Management workflows only run on the default branch.');
    // The workflow explicitly checks out the default branch, never PR code/artifacts.
    if (git(cwd, ['rev-parse', 'HEAD']).stdout.trim() !== context.head) throw new Error('The workflow checkout is no longer current. Rerun on the latest default branch.');
  } else trustedCheckout(cwd, context);
  let result;
  if (command === 'enable') result = await enable(client, context, process.argv.includes('--approve-security'));
  else if (command === 'gates') result = await gates(client, context);
  else if (command === 'setup') result = await setup(client, context);
  else {
    const report = await collect(client, context, { full: !workflow });
    const issue = await postProgress(client, context, report, { full: !workflow });
    if (!workflow) {
      const folder = path.join(cwd, '.workshop-state');
      fs.mkdirSync(folder, { recursive: true });
      fs.writeFileSync(path.join(folder, 'latest-status.json'), JSON.stringify(report, null, 2) + '\n');
    }
    result = { issue, head: report.head, outcome: report.outcome,
      code: report.code.rows.map((alert) => ({ number: alert.number, rule: alert.rule, state: alert.state })),
      dependabotAccess: report.dependencies.available, secretAccess: report.secrets.available };
  }
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
module.exports = { enable, trustedCheckout, main };
