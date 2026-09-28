'use strict';

const path = require('node:path');
const express = require('express');
const { sortBy } = require('lodash');
const { registerPreview } = require('./routes/preview.cjs');
const { registerDownload } = require('./routes/download.cjs');

const tickets = Object.freeze([
  Object.freeze({ id: 'LAB-103', title: 'Review synthetic dependency update', state: 'open' }),
  Object.freeze({ id: 'LAB-101', title: 'Preview a classroom label', state: 'open' }),
  Object.freeze({ id: 'LAB-102', title: 'Read a synthetic workshop document', state: 'fixed' })
]);

function createApp({
  dataRoot = path.resolve(__dirname, '..', 'data'),
  revision = 'unversioned'
} = {}) {
  if (typeof dataRoot !== 'string' || dataRoot.trim() === '') {
    throw new TypeError('dataRoot must be a nonempty local directory path.');
  }
  if (typeof revision !== 'string' || revision.trim() === '') {
    throw new TypeError('revision must be a nonempty, self-reported label.');
  }

  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    next();
  });

  app.get('/health', (_req, res) => res.json({ ok: true }));
  // This label is metadata, not proof of source or deployment provenance.
  app.get('/version', (_req, res) => res.json({ revision }));
  app.get('/tickets', (_req, res) => res.json(sortBy(tickets, 'id')));

  registerPreview(app);
  registerDownload(app, path.resolve(dataRoot));

  app.use((_req, res) => res.status(404).json({ error: 'Local lab route not found.' }));
  app.use((_error, _req, res, _next) => {
    res.status(500).json({ error: 'Local lab request failed.' });
  });
  return app;
}

module.exports = { createApp };
