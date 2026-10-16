// Service worker da Jornada Ana + Eleviê.
// - Guarda só a "casca" do app (HTML, JS, CSS, ícones) para abrir rápido e sem rede.
// - Nunca guarda dados: tudo que vai ao Supabase (login, registros, fotos) passa direto pela rede.
// - Quando sai uma versão nova, o app avisa e a pessoa escolhe quando atualizar.
// __VERSAO__ é trocado a cada build (ver vite.config.js), então cada publicação gera um sw.js novo.
const VERSAO = '__VERSAO__';
const CACHE = `jornada-${VERSAO}`;
const CASCA = ['/', '/index.html', '/manifest.webmanifest', '/icons/icone-192.png', '/icons/icone.svg'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((c) => c.addAll(CASCA)));
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('jornada-') && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (evento) => {
  if (evento.data === 'ATUALIZAR') self.skipWaiting();
});

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;        // Supabase, fontes e WhatsApp seguem direto
  if (url.pathname === '/sw.js') return;

  // Abrir o app: tenta a rede e, sem rede, usa a casca guardada.
  if (pedido.mode === 'navigate') {
    evento.respondWith(
      fetch(pedido).then((r) => {
        const copia = r.clone();
        caches.open(CACHE).then((c) => c.put('/index.html', copia));
        return r;
      }).catch(() => caches.match('/index.html').then((r) => r || caches.match('/'))),
    );
    return;
  }

  // Arquivos com hash no nome (/assets/...) nunca mudam: primeiro o cache.
  if (url.pathname.startsWith('/assets/')) {
    evento.respondWith(
      caches.match(pedido).then((guardado) => guardado || fetch(pedido).then((r) => {
        if (r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(pedido, copia)); }
        return r;
      })),
    );
    return;
  }

  // Ícones e manifesto: mostra o guardado e atualiza em segundo plano.
  evento.respondWith(
    caches.match(pedido).then((guardado) => {
      const rede = fetch(pedido).then((r) => {
        if (r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(pedido, copia)); }
        return r;
      }).catch(() => guardado);
      return guardado || rede;
    }),
  );
});
