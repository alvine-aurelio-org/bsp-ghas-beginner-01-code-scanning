'use strict';

const { randomUUID } = require('node:crypto');

// These are invented local identifiers, not credentials for any real provider.
const makeToken = () => `LOCAL_ONLY_${randomUUID()}`;

class MockProvider {
  #active = new Set();
  #events = [];

  #record(action, ok) {
    // Only fixed action names, sequence numbers and booleans enter the audit.
    this.#events.push(Object.freeze({ sequence: this.#events.length + 1, action, ok }));
  }

  issue() {
    const token = makeToken();
    this.#active.add(token);
    this.#record('issue', true);
    return token;
  }

  revoke(token) {
    const revoked = this.#active.delete(token);
    this.#record('revoke', revoked);
    return revoked;
  }

  rotate(token) {
    if (!this.#active.has(token)) {
      this.#record('rotate', false);
      throw new Error('Rotation requires an active token from this local mock instance.');
    }
    const replacement = makeToken();
    this.#active.delete(token);
    this.#active.add(replacement);
    this.#record('rotate', true);
    return replacement;
  }

  authenticate(token) {
    const accepted = this.#active.has(token);
    this.#record('authenticate', accepted);
    return accepted;
  }

  get events() {
    return Object.freeze([...this.#events]);
  }
}

module.exports = { MockProvider };
