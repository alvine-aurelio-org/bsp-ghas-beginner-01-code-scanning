'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app.cjs');
const { withServer, get } = require('./helpers.cjs');

test('download permits sixty local fixture reads and limits the next one', async () => {
  await withServer(createApp(), async (base) => {
    for (let request = 0; request < 60; request++) {
      assert.equal((await get(base, '/download?name=welcome.txt')).status, 200);
    }
    assert.equal((await get(base, '/download?name=welcome.txt')).status, 429);
  });
});
