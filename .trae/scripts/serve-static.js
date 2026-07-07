const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8777;
const DIR = path.resolve(__dirname, '..', '..', 'out');
const BASE_PATH = '/Research-Compass-for-Robotics';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // Strip basePath prefix — Next.js static export puts assets at root,
  // but HTML asset URLs include the basePath. Page files are at root of out/.
  if (urlPath.startsWith(BASE_PATH)) {
    urlPath = urlPath.slice(BASE_PATH.length) || '/';
  }

  let filePath = path.join(DIR, urlPath);

  // Try as directory -> index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
    } else {
      filePath = path.join(DIR, 'index.html');
    }
  }

  // If not found: empty response for injected scripts, SPA fallback for pages
  if (!fs.existsSync(filePath)) {
    if (urlPath.includes('/_next/') || urlPath.startsWith('/@')) {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end('');
      return;
    }
    filePath = path.join(DIR, 'index.html');
  }

  // Next.js RSC expects .txt payload files to have text/x-component content-type
  const isRscRequest = req.url.includes('_rsc');
  const ext = path.extname(filePath);
  let contentType = MIME_TYPES[ext] || 'application/octet-stream';
  if (ext === '.txt' && isRscRequest) {
    contentType = 'text/x-component';
  }

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Serving from: ${DIR}`);
  console.log(`Open: http://localhost:${PORT}${BASE_PATH}/`);
});
