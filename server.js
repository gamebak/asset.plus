// Local dev server only. GitHub Pages ignores this file.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9000;
// 'localhost' = this machine only, never the local network.
// (127.0.0.1:9000 is often taken by php-fpm on macOS; localhost resolves to ::1 first.)
const HOST = 'localhost';
const DIR = path.resolve(__dirname);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function send(res, status, file) {
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Server error');
    }
    res.writeHead(status, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

function notFound(res) {
  const page = path.join(DIR, '404.html'); // same behaviour as GitHub Pages
  fs.access(page, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    send(res, 404, page);
  });
}

http.createServer((req, res) => {
  let url;
  try {
    url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('Bad request'); // malformed %-encoding no longer crashes the server
  }

  if (url === '/dao') { // redirect so relative asset paths resolve
    res.writeHead(301, { Location: '/dao/' });
    return res.end();
  }
  if (url.endsWith('/')) url += 'index.html'; // mirror GitHub Pages directory index

  // Resolve and make sure the file stays inside the project folder (blocks ../ traversal)
  const file = path.resolve(DIR, '.' + url);
  if (file !== DIR && !file.startsWith(DIR + path.sep)) return notFound(res);

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) return notFound(res);
    send(res, 200, file);
  });
}).listen(PORT, HOST, () => {
  const address = `http://localhost:${PORT}`;
  console.log(address);
  // Open the site in Chrome (macOS). Skip with NO_OPEN=1 bun dev
  if (process.platform === 'darwin' && !process.env.NO_OPEN) {
    require('child_process').execFile('open', ['-a', 'Google Chrome', address], (err) => {
      if (err) console.log('Could not open Chrome:', err.message);
    });
  }
});
