'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { tmpdir } = require('node:os');
const { mkdtemp, mkdir, writeFile, rm } = require('node:fs/promises');
const { createApp } = require('../src/app.cjs');
const { withServer, get } = require('./helpers.cjs');

// Exactly two secure-behavior regressions. Both are expected to fail on the seed.
test('preview renders benign emphasis markup as text, not an HTML element', async () => {
  const label = '<em>workshop canary</em>';
  await withServer(createApp(), async (url) => {
    const response = await get(url, `/preview?${new URLSearchParams({ label })}`);
    assert.equal(response.status, 200);
    const mediaType = response.contentType.split(';')[0].trim().toLowerCase();
    if (mediaType === 'text/plain') {
      assert.ok(response.body.includes(label), 'The plain-text response must preserve the label.');
      return;
    }

    assert.equal(mediaType, 'text/html');
    assert.ok(!response.body.includes(label), 'Benign emphasis markup must not be emitted as raw HTML.');
    // Accept named or numeric escaping of this canary; this is not a sanitizer.
    const renderedLabel = response.body
      .replace(/&lt;|&#0*60;|&#x0*3c;/gi, '<')
      .replace(/&gt;|&#0*62;|&#x0*3e;/gi, '>')
      .replace(/&#0*47;|&#x0*2f;/gi, '/');
    assert.ok(renderedLabel.includes(label), 'Escaped HTML must preserve the visible label.');
  });
});

test('download rejects owned outside canaries and every non-allowlisted name', async () => {
  const scratch = await mkdtemp(path.join(tmpdir(), 'bsp-ghas-security-'));
  try {
    const dataRoot = path.join(scratch, 'data');
    const outsidePath = path.join(scratch, 'outside-canary.txt');
    const outsideText = 'SYNTHETIC OUTSIDE CANARY -- owned only by this test';
    await mkdir(dataRoot);
    await writeFile(path.join(dataRoot, 'welcome.txt'), 'Synthetic allowed welcome', 'utf8');
    await writeFile(path.join(dataRoot, 'policy.txt'), 'Synthetic allowed policy', 'utf8');
    await writeFile(outsidePath, outsideText, 'utf8');
    await writeFile(path.join(dataRoot, 'extra-canary.txt'), 'Synthetic unlisted canary', 'utf8');
    await writeFile(path.join(dataRoot, '__proto__'), 'Synthetic prototype-name canary', 'utf8');

    await withServer(createApp({ dataRoot }), async (url) => {
      for (const [name, expected] of [
        ['welcome.txt', 'Synthetic allowed welcome'],
        ['policy.txt', 'Synthetic allowed policy']
      ]) {
        const response = await get(url, `/download?${new URLSearchParams({ name })}`);
        assert.equal(response.status, 200);
        assert.equal(response.body, expected);
      }

      // Every path below names a known, synthetic file inside our own scratch tree.
      const deniedNames = [
        '../outside-canary.txt',
        outsidePath,
        '../data/welcome.txt',
        'extra-canary.txt',
        '__proto__'
      ];
      for (const name of deniedNames) {
        const response = await get(url, `/download?${new URLSearchParams({ name })}`);
        assert.ok([400, 403, 404].includes(response.status), 'Only explicitly named lab documents may be downloaded.');
        assert.ok(!response.body.includes(outsideText), 'The owned outside canary must never be returned.');
      }
    });
  } finally {
    // withServer has completed its awaited teardown before removing the fixture.
    await rm(scratch, { recursive: true, force: true });
  }
});
