// Serve a pasta dist/ aplicando os cabeçalhos do vercel.json, para testar a versão de produção
// (CSP, service worker, manifesto) antes de publicar. Uso: npm run preview:prod
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const dist = join(raiz, 'dist');
const porta = Number(process.env.PORT) || 4173;
const conf = JSON.parse(readFileSync(join(raiz, 'vercel.json'), 'utf8'));
const regras = (conf.headers || []).map((h) => ({
  re: new RegExp('^' + h.source.replace(/\(\.\*\)/g, '.*') + '$'),
  headers: h.headers,
}));
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };

createServer((req, res) => {
  const caminho = decodeURIComponent(req.url.split('?')[0]);
  let arquivo = normalize(join(dist, caminho));
  if (!arquivo.startsWith(dist)) { res.writeHead(403); res.end(); return; }
  if (!existsSync(arquivo) || statSync(arquivo).isDirectory()) arquivo = join(dist, 'index.html');
  const cab = { 'Content-Type': tipos[extname(arquivo)] || 'application/octet-stream' };
  regras.filter((r) => r.re.test(caminho)).forEach((r) => r.headers.forEach(({ key, value }) => { cab[key] = value; }));
  res.writeHead(200, cab);
  res.end(readFileSync(arquivo));
}).listen(porta, () => console.log(`Produção local em http://localhost:${porta} (cabeçalhos do vercel.json)`));
