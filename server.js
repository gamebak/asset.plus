const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9000;
const DIR = __dirname;

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/dao' || url === '/retro') { // redirect so relative asset paths resolve
    res.writeHead(301, { Location: url + '/' });
    return res.end();
  }
  if (url.endsWith('/')) url += 'index.html'; // mirror GitHub Pages directory index
  const file = path.join(DIR, url);

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(file);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
