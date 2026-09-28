'use strict';

const DAY_MS = 24 * 60 * 60 * 1000;
const UTC_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const STATES = new Set(['open', 'fixed', 'dismissed']);

// An explicit, immutable synthetic snapshot, never a live GitHub query.
const metricHistory = Object.freeze(
  require('../data/metric-history.json').map((record) => Object.freeze({ ...record }))
);

function parseTimestamp(value, field) {
  if (typeof value !== 'string' || !UTC_TIMESTAMP.test(value)) {
    throw new TypeError(`${field} must be a UTC timestamp with seconds and optional three-digit milliseconds.`);
  }
  const instant = Date.parse(value);
  const canonical = value.includes('.') ? value : value.replace('Z', '.000Z');
  if (!Number.isFinite(instant) || new Date(instant).toISOString() !== canonical) {
    throw new RangeError(`${field} must be a real UTC timestamp.`);
  }
  return instant;
}

function validateRecord(record, ids) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new TypeError('Each ledger record must be an object.');
  }
  if (typeof record.id !== 'string' || record.id.trim() === '' || ids.has(record.id)) {
    throw new TypeError('Each ledger record must have a unique, nonempty string id.');
  }
  ids.add(record.id);
  if (!STATES.has(record.state)) {
    throw new TypeError('state must be open, fixed or dismissed.');
  }

  const created = parseTimestamp(record.created_at, 'created_at');
  let closed = null;
  if (record.state === 'open') {
    if (record.closed_at !== null) {
      throw new TypeError('An open record must have closed_at: null.');
    }
  } else {
    closed = parseTimestamp(record.closed_at, 'closed_at');
    if (closed < created) {
      throw new RangeError('closed_at must not precede created_at.');
    }
  }

  if (record.state === 'dismissed') {
    if (typeof record.dismissal_reason !== 'string' || record.dismissal_reason.trim() === '') {
      throw new TypeError('A dismissed record must have a nonempty dismissal_reason.');
    }
  } else if (record.dismissal_reason !== null) {
    throw new TypeError('Only dismissed records can have a dismissal_reason; otherwise use null.');
  }

  return Object.freeze({
    created,
    closed,
    state: record.state,
    dismissalReason: record.dismissal_reason
  });
}

function calculateMetrics(records, { from, to } = {}) {
  if (!Array.isArray(records)) {
    throw new TypeError('records must be an explicit snapshot array.');
  }
  const start = parseTimestamp(from, 'from');
  const end = parseTimestamp(to, 'to');
  if (start >= end) throw new RangeError('from must be earlier than to.');

  const ids = new Set();
  // Validate all rows, including ones outside the selected window.
  const snapshot = Object.freeze(records.map((record) => validateRecord(record, ids)));
  const result = { meanFixDays: null, meanGithubLikeDays: null, open: 0, new: 0, fixed: 0, dismissed: 0 };
  let fixDays = 0;
  let githubLikeDays = 0;
  let githubLikeCount = 0;
  const inWindow = (instant) => instant >= start && instant < end;

  for (const record of snapshot) {
    if (inWindow(record.created)) result.new += 1;
    // State immediately before the exclusive upper boundary, assuming no reopenings.
    if (record.created < end && (record.closed === null || record.closed >= end)) {
      result.open += 1;
    }
    if (record.closed === null || !inWindow(record.closed)) continue;

    const elapsedDays = (record.closed - record.created) / DAY_MS;
    if (record.state === 'fixed') {
      result.fixed += 1;
      fixDays += elapsedDays;
    } else {
      result.dismissed += 1;
    }
    if (record.state === 'fixed' || record.dismissalReason !== 'false_positive') {
      githubLikeDays += elapsedDays;
      githubLikeCount += 1;
    }
  }

  result.meanFixDays = result.fixed === 0 ? null : fixDays / result.fixed;
  result.meanGithubLikeDays = githubLikeCount === 0 ? null : githubLikeDays / githubLikeCount;
  return result;
}

module.exports = { calculateMetrics, metricHistory };
