'use strict';

const { escape } = require('lodash');

function registerPreview(app) {
  app.get('/preview', (req, res) => {
    const label = req.query.label ?? 'Workshop preview';
    if (typeof label !== 'string') {
      return res.status(400).type('text/plain').send('Provide a single label string.');
    }

    // Encode at the HTML output boundary using the reviewed library sanitizer.
    return res.type('html').send(`<p>${escape(label)}</p>`);
  });
}

module.exports = { registerPreview };
