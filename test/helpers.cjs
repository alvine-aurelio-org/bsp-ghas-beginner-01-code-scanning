'use strict';

const http = require('node:http');

async function withServer(app, exercise) {
  const server = http.createServer(app);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolve();
    });
  });

  try {
    return await exercise(`http://127.0.0.1:${server.address().port}`);
  } finally {
    // Stop accepting connections before closing existing ones; await completion.
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeAllConnections();
    });
  }
}

async function get(baseUrl, resource) {
  const url = new URL(resource, baseUrl);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1') {
    throw new Error('Test requests must stay on IPv4 loopback.');
  }
  // A direct, non-pooled HTTP request: no redirects or external service clients.
  return new Promise((resolve, reject) => {
    const request = http.get(url, { agent: false }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.once('error', reject);
      response.once('end', () => resolve({
        status: response.statusCode,
        contentType: response.headers['content-type'] ?? '',
        body
      }));
    });
    request.once('error', reject);
  });
}

module.exports = { withServer, get };
