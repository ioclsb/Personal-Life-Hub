const fs = require('fs');
const http = require('http');
const path = require('path');
const { execFile } = require('child_process');

const root = path.resolve(__dirname);
const port = Number(process.env.LIFE_HUB_PORT || 4173);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
};

function safePath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  const relative = pathname === '/' ? 'wood-rename.html' : pathname.slice(1);
  const filePath = path.resolve(root, relative);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) return null;
  return filePath;
}

const server = http.createServer(function(request, response) {
  let filePath;
  try {
    filePath = safePath(request.url);
  } catch (error) {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('无效路径');
    return;
  }
  if (!filePath) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('禁止访问');
    return;
  }
  fs.readFile(filePath, function(error, data) {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(error.code === 'ENOENT' ? '页面不存在' : '读取页面失败');
      return;
    }
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    response.end(data);
  });
});

server.listen(port, '127.0.0.1', function() {
  const url = 'http://127.0.0.1:' + port + '/';
  console.log('生活台已启动：' + url);
  if (process.argv.includes('--open')) execFile('cmd.exe', ['/c', 'start', '', url]);
});
