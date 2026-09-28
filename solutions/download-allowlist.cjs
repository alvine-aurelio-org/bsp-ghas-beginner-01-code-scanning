'use strict';

const path = require('node:path');
const { readFile } = require('node:fs/promises');

function registerDownload(app, dataRoot) {
  // Only these trusted static targets are readable. Map has no prototype keys.
  // dataRoot and the two fixture files must be administrator-controlled, not symlinks.
  const allowedFiles = new Map([
    ['welcome.txt', path.resolve(dataRoot, 'welcome.txt')],
    ['policy.txt', path.resolve(dataRoot, 'policy.txt')]
  ]);

  app.get('/download', async (req, res) => {
    const name = req.query.name;
    if (typeof name !== 'string' || !allowedFiles.has(name)) {
      return res.status(400).type('text/plain').send('Choose welcome.txt or policy.txt.');
    }

    try {
      // User input selects a map entry; it is never joined into a filesystem path.
      const content = await readFile(allowedFiles.get(name), 'utf8');
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
