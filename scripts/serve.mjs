#!/usr/bin/env node

import { createReadStream, existsSync, realpathSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = realpathSync(fileURLToPath(new URL('..', import.meta.url)));
const host = '127.0.0.1';
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('mob-design preview: PORT must be an integer from 1 to 65535.');
  process.exit(2);
}
const types = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
]);

function inside(path) {
  const rel = relative(root, path);
  return rel === '' || (!rel.startsWith(`..${sep}`) && rel !== '..');
}

const server = createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, `http://${host}`).pathname); }
  catch { response.writeHead(400).end('Bad request'); return; }
  if (pathname === '/') { response.writeHead(302, { location: '/examples/starter/' }).end(); return; }
  if (pathname.split('/').some((part) => part.startsWith('.'))) { response.writeHead(404).end('Not found'); return; }
  let file = resolve(root, `.${pathname}`);
  if (!inside(file)) { response.writeHead(403).end('Forbidden'); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file) || !statSync(file).isFile()) { response.writeHead(404).end('Not found'); return; }
  const real = realpathSync(file);
  if (!inside(real)) { response.writeHead(403).end('Forbidden'); return; }
  response.writeHead(200, { 'content-type': types.get(extname(real).toLowerCase()) || 'application/octet-stream', 'x-content-type-options': 'nosniff' });
  if (request.method === 'HEAD') response.end();
  else createReadStream(real).pipe(response);
});

server.listen(port, host, () => {
  console.log(`mob-design preview: http://${host}:${port}/examples/starter/`);
  console.log(`showcase: http://${host}:${port}/showcase/`);
});
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') console.error(`mob-design preview: port ${port} is busy. Try PORT=4174 npm run preview.`);
  else console.error(`mob-design preview: ${error.message}`);
  process.exitCode = 1;
});

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
