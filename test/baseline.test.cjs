'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { readFile } = require('node:fs/promises');
const { createApp } = require('../src/app.cjs');
const { withServer, get } = require('./helpers.cjs');

test('health reports ordinary local service readiness', async () => {
  await withServer(createApp(), async (url) => {
    const response = await get(url, '/health');
    assert.equal(response.status, 200);
    assert.match(response.contentType, /^application\/json\b/);
    assert.deepEqual(JSON.parse(response.body), { ok: true });
  });
});

test('version echoes a supplied revision label without attesting provenance', async () => {
  const revision = 'synthetic-revision-01';
  await withServer(createApp({ revision }), async (url) => {
    const response = await get(url, '/version');
    assert.equal(response.status, 200);
    assert.deepEqual(JSON.parse(response.body), { revision });
  });
});

test('version has an explicit default label', async () => {
  await withServer(createApp(), async (url) => {
    const response = await get(url, '/version');
    assert.equal(response.status, 200);
    assert.deepEqual(JSON.parse(response.body), { revision: 'unversioned' });
  });
});

test('tickets returns the ordered synthetic in-memory records', async () => {
  await withServer(createApp(), async (url) => {
    const response = await get(url, '/tickets');
    assert.equal(response.status, 200);
    const tickets = JSON.parse(response.body);
    assert.deepEqual(tickets.map((ticket) => ticket.id), ['LAB-101', 'LAB-102', 'LAB-103']);
    assert.deepEqual(tickets.map((ticket) => ticket.state), ['open', 'fixed', 'open']);
    assert.ok(tickets.every((ticket) => typeof ticket.title === 'string'));
  });
});

test('preview preserves an ordinary classroom label', async () => {
  const label = 'Classroom ticket 101';
  await withServer(createApp(), async (url) => {
    const response = await get(url, `/preview?${new URLSearchParams({ label })}`);
    assert.equal(response.status, 200);
    assert.match(response.contentType, /^text\/(?:html|plain)\b/);
    assert.ok(response.body.includes(label));
  });
});

test('preview supplies an ordinary default label', async () => {
  await withServer(createApp(), async (url) => {
    const response = await get(url, '/preview');
    assert.equal(response.status, 200);
    assert.ok(response.body.includes('Workshop preview'));
  });
});

test('download serves both bundled synthetic documents', async () => {
  await withServer(createApp(), async (url) => {
    for (const name of ['welcome.txt', 'policy.txt']) {
      const expected = await readFile(path.resolve(__dirname, '..', 'data', name), 'utf8');
      const response = await get(url, `/download?${new URLSearchParams({ name })}`);
      assert.equal(response.status, 200);
      assert.match(response.contentType, /^text\/plain\b/);
      assert.equal(response.body, expected);
    }
  });
});

test('ordinary invalid requests and missing resources return errors', async () => {
  await withServer(createApp(), async (url) => {
    for (const resource of ['/download', '/download?name=', '/preview?label=one&label=two']) {
      assert.equal((await get(url, resource)).status, 400);
    }
    const missing = await get(url, '/download?name=absent-workshop-document.txt');
    // Baseline checks file existence; the solution rejects unlisted names first.
    assert.ok([400, 404].includes(missing.status));
    assert.ok(!missing.body.includes(path.resolve(__dirname, '..')));
    const unknownRoute = await get(url, '/not-a-lab-route');
    assert.equal(unknownRoute.status, 404);
    assert.deepEqual(JSON.parse(unknownRoute.body), { error: 'Local lab route not found.' });
  });
});
