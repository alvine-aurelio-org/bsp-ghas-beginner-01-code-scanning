'use strict';

const path = require('node:path');
const { readFile } = require('node:fs/promises');

function registerDownload(app, dataRoot) {
  app.get('/download', async (req, res) => {
    const name = req.query.name;
    if (typeof name !== 'string' || name.length === 0) {
      return res.status(400).type('text/plain').send('Provide a single file name.');
    }

    // LAB WARNING: intentionally unsafe path-injection candidate. path.resolve
    // does NOT confine user input to dataRoot. Exercise only owned temp canaries.
    const target = path.resolve(dataRoot, name);
    try {
      const content = await readFile(target, 'utf8');
      return res.type('text/plain').send(content);
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
        return res.status(404).type('text/plain').send('Lab file not found.');
      }
      return res.status(500).type('text/plain').send('Lab file could not be read.');
    }
  });
}

module.exports = { registerDownload };
