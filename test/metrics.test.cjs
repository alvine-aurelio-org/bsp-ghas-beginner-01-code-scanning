'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateMetrics, metricHistory } = require('../src/metrics.cjs');

const window = Object.freeze({ from: '2026-09-01T00:00:00Z', to: '2026-09-08T00:00:00Z' });
const empty = { meanFixDays: null, meanGithubLikeDays: null, open: 0, new: 0, fixed: 0, dismissed: 0 };
const row = (changes = {}) => ({
  id: 'SYN-TEST',
  created_at: '2026-09-01T00:00:00Z',
  closed_at: '2026-09-03T00:00:00Z',
  state: 'fixed',
  dismissal_reason: null,
  ...changes
});

test('the frozen four-row cohort produces means of four and three days', () => {
  assert.ok(Object.isFrozen(metricHistory));
  assert.ok(metricHistory.every(Object.isFrozen));
  const before = JSON.stringify(metricHistory);
  assert.deepEqual(calculateMetrics(metricHistory, window), {
    meanFixDays: 4,
    meanGithubLikeDays: 3,
    open: 0,
    new: 4,
    fixed: 2,
    dismissed: 2
  });
  assert.equal(JSON.stringify(metricHistory), before);
  const fractional = calculateMetrics([row({ closed_at: '2026-09-01T12:00:00Z' })], window);
  assert.equal(fractional.meanFixDays, 0.5);
  assert.equal(fractional.meanGithubLikeDays, 0.5);
});

test('empty denominators return null rather than zero or NaN', () => {
  assert.deepEqual(calculateMetrics([], window), empty);
  const openOnly = [row({ state: 'open', closed_at: null })];
  assert.deepEqual(calculateMetrics(openOnly, window), { ...empty, open: 1, new: 1 });
});

test('false positives count as dismissals but enter neither mean', () => {
  const falsePositive = row({
    state: 'dismissed',
    closed_at: '2026-09-04T00:00:00Z',
    dismissal_reason: 'false_positive'
  });
  assert.deepEqual(calculateMetrics([falsePositive], window), { ...empty, new: 1, dismissed: 1 });
  const accepted = row({
    state: 'dismissed',
    closed_at: '2026-09-02T00:00:00Z',
    dismissal_reason: 'risk_accepted'
  });
  assert.deepEqual(calculateMetrics([accepted], window), {
    ...empty, meanGithubLikeDays: 1, new: 1, dismissed: 1
  });
});

test('activity uses a half-open window and includes earlier-created records', () => {
  const records = [
    row({ id: 'old-open', created_at: '2026-08-30T00:00:00Z', state: 'open', closed_at: null }),
    row({ id: 'new-open', created_at: '2026-09-02T00:00:00Z', state: 'open', closed_at: null }),
    row({ id: 'early-fix', created_at: '2026-08-29T00:00:00Z', closed_at: '2026-08-31T00:00:00Z' }),
    row({ id: 'fix-at-start', created_at: '2026-08-30T00:00:00Z', closed_at: '2026-09-01T00:00:00Z' }),
    row({ id: 'fix-at-end', created_at: '2026-09-05T00:00:00Z', closed_at: '2026-09-08T00:00:00Z' }),
    row({ id: 'created-at-end', created_at: '2026-09-08T00:00:00Z', state: 'open', closed_at: null }),
    row({ id: 'later-fix', created_at: '2026-09-04T00:00:00Z', closed_at: '2026-09-10T00:00:00Z' }),
    row({
      id: 'accepted', created_at: '2026-08-31T00:00:00Z', closed_at: '2026-09-02T00:00:00Z',
      state: 'dismissed', dismissal_reason: 'risk_accepted'
    })
  ];
  assert.deepEqual(calculateMetrics(records, window), {
    meanFixDays: 2, meanGithubLikeDays: 2, open: 4, new: 3, fixed: 1, dismissed: 1
  });
});

test('timestamps reject malformed values, impossible dates, and reversed lifecycles', () => {
  for (const invalid of [
    'not-a-date', '2026-09-01', '2026-09-01T00:00:00',
    '2026-02-30T00:00:00Z', '2026-09-01T24:00:00Z', '2026-09-01T00:00:60Z', null, 0
  ]) {
    assert.throws(() => calculateMetrics([row({ created_at: invalid })], window), /created_at/);
    assert.throws(() => calculateMetrics([row({ closed_at: invalid })], window), /closed_at/);
  }
  assert.throws(() => calculateMetrics([row({ closed_at: '2026-08-31T00:00:00Z' })], window), /precede/);
  // An out-of-window bad record must not disappear through filtering.
  assert.throws(() => calculateMetrics([row({ created_at: '2026-02-30T00:00:00Z' })], window), /created_at/);
});

test('states, closure timestamps, and dismissal reasons must agree', () => {
  for (const changes of [
    { state: 'resolved' },
    { state: 'open' },
    { closed_at: null },
    { closed_at: undefined },
    { state: 'open', closed_at: null, dismissal_reason: 'risk_accepted' },
    { dismissal_reason: 'false_positive' },
    { dismissal_reason: undefined },
    { state: 'dismissed', dismissal_reason: null },
    { state: 'dismissed', dismissal_reason: '' },
    { state: 'dismissed', dismissal_reason: '   ' }
  ]) {
    assert.throws(() => calculateMetrics([row(changes)], window));
  }
});

test('metric windows require valid explicit increasing UTC boundaries', () => {
  assert.throws(() => calculateMetrics([], { from: window.to, to: window.from }), /earlier/);
  assert.throws(() => calculateMetrics([], { from: window.from, to: window.from }), /earlier/);
  assert.throws(() => calculateMetrics([], { from: 'bad', to: window.to }), /from/);
  assert.throws(() => calculateMetrics([], { from: window.from, to: '2026-09-31T00:00:00Z' }), /to/);
  assert.throws(() => calculateMetrics([]), /from/);
});

test('ledger input must contain objects with unique nonempty ids', () => {
  for (const invalid of [null, {}, 'not-an-array']) {
    assert.throws(() => calculateMetrics(invalid, window), /snapshot array/);
  }
  for (const invalid of [null, [], 'not-an-object']) {
    assert.throws(() => calculateMetrics([invalid], window), /record must be an object/);
  }
  for (const id of ['', '   ', undefined, 1]) {
    assert.throws(() => calculateMetrics([row({ id })], window), /id/);
  }
  assert.throws(() => calculateMetrics([row(), row()], window), /unique/);
});
