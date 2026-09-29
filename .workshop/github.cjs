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

  async request(suffix = '', { method = 'GET', body, optional = false, includeHeaders = false } = {}) {
    if (suffix && !suffix.startsWith('/')) throw new Error('Repository API suffix must start with /.');
    if (/[\r\n#]/.test(suffix) || /(?:^|\/)\.\.(?:\/|$)/.test(suffix)) throw new Error('Unsafe API suffix.');
    const endpoint = `repos/${this.repository}${suffix}`;
    let response;
    if (this.transport) {
      response = await this.transport(endpoint, { method, body, includeHeaders });
    } else {
      if (!this.token) throw new Error('Use the browser workflow; its scoped Actions token is required. No local management login is needed.');
      const result = await fetch(`https://api.github.com/${endpoint}`, {
        method, redirect: 'error', signal: AbortSignal.timeout(90_000),
        headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body)
      });
      const text = await result.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { throw new Error('GitHub returned an unexpected non-JSON response.'); }
      response = { ok: result.ok, status: result.status, data, link: result.headers.get('link') ?? '' };
    }
    if (!response.ok && !optional) {
      // Secret-alert API bodies include values. Never reflect those bodies in errors.
      throw new Error(`${method} ${suffix.split('?')[0] || '/repository'} returned HTTP ${response.status}. Check your repository access and the troubleshooting guide.`);
    }
    return response;
  }

  async list(suffix, { optional = false, key } = {}) {
    const rows = [];
    const cursorPagination = /^\/dependabot\/alerts(?:\?|$)/.test(suffix);
    let cursorSuffix = `${suffix}${suffix.includes('?') ? '&' : '?'}per_page=100`;
    const visited = new Set();
    for (let page = 1; page <= 20; page++) {
      const separator = suffix.includes('?') ? '&' : '?';
      const query = cursorPagination ? cursorSuffix : `${suffix}${separator}per_page=100&page=${page}`;
      if (visited.has(query)) throw new Error('GitHub repeated a pagination cursor; results are incomplete.');
      visited.add(query);
      const result = await this.request(query, { optional, includeHeaders: cursorPagination });
      if (!result.ok) return { available: false, status: result.status, rows: [] };
      const batch = key ? result.data?.[key] : result.data;
      if (!Array.isArray(batch)) throw new Error('GitHub list response has an unexpected shape.');
      rows.push(...batch);
      if (cursorPagination) {
        const next = result.link?.match(/<([^>]+)>;\s*rel="next"/)?.[1];
        if (!next) return { available: true, status: result.status, rows };
        const url = new URL(next);
        if (url.origin !== 'https://api.github.com' || url.username || url.password || url.hash || url.pathname !== `/repos/${this.repository}/dependabot/alerts` || !url.searchParams.has('after') || url.searchParams.has('page')) throw new Error('Unsafe or unexpected Dependabot pagination cursor.');
        cursorSuffix = '/dependabot/alerts' + url.search;
      } else if (batch.length < 100) return { available: true, status: result.status, rows };
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
