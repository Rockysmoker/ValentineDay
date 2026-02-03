const http = require('http');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || 4173;
const publicDir = path.join(__dirname, 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function sendNotFound(res){
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const safePath = path.normalize(urlPath).replace(/^\/+/, '');
  const filePath = path.join(publicDir, safePath || 'index.html');

  if(!filePath.startsWith(publicDir)){
    return sendNotFound(res);
  }

  fs.stat(filePath, (err, stat) => {
    if(err) return sendNotFound(res);
    const resolvedPath = stat.isDirectory() ? path.join(filePath, 'index.html') : filePath;
    fs.readFile(resolvedPath, (readErr, data) => {
      if(readErr) return sendNotFound(res);
      const ext = path.extname(resolvedPath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(port, () => {
  console.log(`Preview server running on http://localhost:${port}`);
});
