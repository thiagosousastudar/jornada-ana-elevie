import { defineConfig } from 'vite';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// Troca __VERSAO__ no sw.js a cada build: o navegador percebe o arquivo novo e oferece a atualização.
function versaoDoServiceWorker() {
  return {
    name: 'versao-do-service-worker',
    apply: 'build',
    closeBundle() {
      const arquivo = 'dist/sw.js';
      if (!existsSync(arquivo)) return;
      const versao = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
      writeFileSync(arquivo, readFileSync(arquivo, 'utf8').replaceAll('__VERSAO__', versao));
    },
  };
}

export default defineConfig({
  plugins: [versaoDoServiceWorker()],
  server: { port: 5173 },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
