'use strict';

const { createApp } = require('./app.cjs');

// LAB ONLY: never make this address configurable or expose it through a tunnel.
const host = '127.0.0.1';
const portText = process.env.PORT ?? '3000';
const port = Number(portText);
if (!/^\d+$/.test(portText) || !Number.isInteger(port) || port < 0 || port > 65535) {
  throw new RangeError('PORT must be an integer from 0 to 65535.');
}

const app = createApp({ revision: process.env.APP_REVISION ?? 'unversioned' });
const server = app.listen(port, host, () => {
  console.log(`Synthetic GHAS lab listening at http://${host}:${server.address().port}`);
});
server.on('error', () => {
  console.error('The local lab server could not start.');
  process.exitCode = 1;
});

let closing = false;
function stop() {
  if (closing) return;
  closing = true;
  server.close((error) => {
    if (error) process.exitCode = 1;
  });
  server.closeAllConnections();
}

process.once('SIGINT', stop);
process.once('SIGTERM', stop);
