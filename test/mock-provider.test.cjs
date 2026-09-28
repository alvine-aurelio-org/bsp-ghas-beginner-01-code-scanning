'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { MockProvider } = require('../src/mock-provider.cjs');

test('issued tokens work only in their issuing local mock instance', () => {
  const provider = new MockProvider();
  const other = new MockProvider();
  const token = provider.issue();
  assert.ok(token.startsWith('LOCAL_ONLY_'));
  assert.equal(provider.authenticate(token), true);
  assert.equal(other.authenticate(token), false);
  assert.equal(provider.authenticate('unissued-local-canary'), false);
});

test('revocation immediately rejects the old local token', () => {
  const provider = new MockProvider();
  const token = provider.issue();
  assert.equal(provider.revoke(token), true);
  assert.equal(provider.authenticate(token), false);
  assert.equal(provider.revoke(token), false);
  assert.equal(provider.authenticate(undefined), false);
});

test('rotation rejects the old token, accepts its replacement, and audits no token values', () => {
  const provider = new MockProvider();
  const oldToken = provider.issue();
  const replacement = provider.rotate(oldToken);
  assert.ok(replacement !== oldToken, 'Rotation must produce a distinct local token.');
  assert.equal(provider.authenticate(oldToken), false);
  assert.equal(provider.authenticate(replacement), true);

  const audit = JSON.stringify(provider.events);
  assert.ok(!audit.includes(oldToken), 'The audit must not contain the old token.');
  assert.ok(!audit.includes(replacement), 'The audit must not contain the replacement.');
  for (const [index, event] of provider.events.entries()) {
    assert.deepEqual(Object.keys(event).sort(), ['action', 'ok', 'sequence']);
    assert.equal(event.sequence, index + 1);
    assert.equal(typeof event.ok, 'boolean');
  }
});

test('inactive rotation is rejected and audit snapshots cannot be changed', () => {
  const provider = new MockProvider();
  const emptySnapshot = provider.events;
  const token = provider.issue();
  provider.revoke(token);
  assert.throws(() => provider.rotate(token), /active token/);
  assert.throws(() => provider.rotate('unissued-local-canary'), /active token/);
  assert.equal(provider.authenticate(token), false);

  const audit = provider.events;
  assert.equal(emptySnapshot.length, 0);
  assert.ok(Object.isFrozen(audit));
  assert.ok(audit.every(Object.isFrozen));
  assert.throws(() => audit.push({ action: 'changed' }), TypeError);
  assert.throws(() => { audit[0].action = 'changed'; }, TypeError);
  const serialized = JSON.stringify(audit);
  assert.ok(!serialized.includes(token));
  assert.ok(!serialized.includes('unissued-local-canary'));
});
