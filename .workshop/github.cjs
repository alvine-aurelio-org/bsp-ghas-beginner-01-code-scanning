'use strict';

const { spawnSync } = require('node:child_process');

const REPOSITORY = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9_.-]{1,100}$/;

function repositoryFromRemote(remote) {
  const match = /^(?:https:\/\/github\.com\/|git@github\.com:)([^/\s]+\/[^/\s]+?)(?:\.git)?\/?$/.exec(remote.trim());
  if (!match || !REPOSITORY.test(match[1])) throw new Error('Use a normal github.com origin URL without embedded credentials.');
  return match[1];
}

function git(cwd, args, input) {
  const result = spawnSync('git', ['-C', cwd, ...args], {
    input, encoding: 'utf8', windowsHide: true, timeout: 120_000, maxBuffer: 8 * 1024 * 1024
  });
  if (result.error) throw new Error('Git could not run. Install Git and open the cloned repository.');
  return result;
}

function targetRepository(cwd, env = process.env) {
  if (env.GITHUB_ACTIONS === 'true') {
    if (!REPOSITORY.test(env.GITHUB_REPOSITORY ?? '')) throw new Error('Missing workflow repository identity.');
    return env.GITHUB_REPOSITORY;
  }
  const remote = git(cwd, ['remote', 'get-url', 'origin']);
  if (remote.status !== 0) throw new Error('Run this command inside your cloned lab repository.');
  return repositoryFromRemote(remote.stdout);
}

class GitHub {
  constructor(repository, { token, transport } = {}) {
    if (!REPOSITORY.test(repository)) throw new Error('Invalid repository identity.');
    this.repository = repository;
    this.token = token;
    this.transport = transport;
  }

  async request(suffix = '', { method = 'GET', body, optional = false } = {}) {
    if (suffix && !suffix.startsWith('/')) throw new Error('Repository API suffix must start with /.');
    if (/[\r\n#]/.test(suffix) || /(?:^|\/)\.\.(?:\/|$)/.test(suffix)) throw new Error('Unsafe API suffix.');
    const endpoint = `repos/${this.repository}${suffix}`;
    let response;
    if (this.transport) {
      response = await this.transport(endpoint, { method, body });
    } else if (this.token) {
      const result = await fetch(`https://api.github.com/${endpoint}`, {
        method, redirect: 'error', signal: AbortSignal.timeout(90_000),
        headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body)
      });
      const text = await result.text();
      response = { ok: result.ok, status: result.status, data: text ? JSON.parse(text) : null };
    } else {
      const args = ['api', '--hostname', 'github.com', endpoint, '--method', method, '-H', 'X-GitHub-Api-Version: 2022-11-28'];
      if (body !== undefined) args.push('--input', '-');
      const result = spawnSync('gh', args, {
        input: body === undefined ? undefined : JSON.stringify(body), encoding: 'utf8', windowsHide: true,
        timeout: 90_000, maxBuffer: 16 * 1024 * 1024
      });
      if (result.error) throw new Error('GitHub CLI could not run. Install gh and use gh auth login with browser sign-in.');
      let data = null;
      try { data = result.stdout.trim() ? JSON.parse(result.stdout) : null; } catch { throw new Error('GitHub returned an unexpected non-JSON response.'); }
      response = { ok: result.status === 0, status: Number(result.stderr.match(/HTTP (\d+)/)?.[1] ?? (result.status === 0 ? 200 : 0)), data };
    }
    if (!response.ok && !optional) {
      // Never include API bodies: secret-alert responses and generated fixes may contain sensitive values.
      throw new Error(`${method} ${suffix.split('?')[0] || '/repository'} returned HTTP ${response.status}. Check your repository access and the troubleshooting guide.`);
    }
    return response;
  }

  async list(suffix, { optional = false, key } = {}) {
    const rows = [];
    for (let page = 1; page <= 20; page++) {
      const separator = suffix.includes('?') ? '&' : '?';
      const result = await this.request(`${suffix}${separator}per_page=100&page=${page}`, { optional });
      if (!result.ok) return { available: false, status: result.status, rows: [] };
      const batch = key ? result.data?.[key] : result.data;
      if (!Array.isArray(batch)) throw new Error('GitHub list response has an unexpected shape.');
      rows.push(...batch);
      if (batch.length < 100) return { available: true, status: result.status, rows };
    }
    throw new Error('The safety pagination limit was reached; results are incomplete, not clean.');
  }

  async file(filename, ref) {
    const encoded = filename.split('/').map(encodeURIComponent).join('/');
    const result = await this.request(`/contents/${encoded}?ref=${encodeURIComponent(ref)}`);
    if (result.data?.encoding !== 'base64' || result.data.type !== 'file') throw new Error('Expected a small repository file.');
    return Buffer.from(result.data.content, 'base64').toString('utf8');
  }
}

module.exports = { GitHub, git, repositoryFromRemote, targetRepository };
