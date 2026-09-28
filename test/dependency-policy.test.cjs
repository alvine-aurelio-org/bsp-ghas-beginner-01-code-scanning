'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const lodash = require('lodash');
const policy = require('../dependency-policy.json');

test('installed lodash matches the explicit compatibility-review policy', () => {
  // Deliberate review gate, NOT proof of compatibility or absence of advisories.
  assert.equal(
    lodash.VERSION,
    policy.validatedVersion,
    'A dependency update requires review before updating validatedVersion; retain the behavior tests.'
  );
});

test('lodash retains ordinary chunk behavior for synthetic values', () => {
  assert.deepEqual(lodash.chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
});

test('lodash escapes benign classroom markup consistently', () => {
  assert.equal(
    lodash.escape('Workshop <em>label</em> & notes'),
    'Workshop &lt;em&gt;label&lt;/em&gt; &amp; notes'
  );
});
