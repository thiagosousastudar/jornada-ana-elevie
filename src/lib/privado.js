// Registro privado do corpo (dias 1 e 21): medidas, fotos de frente/costas/perfil e "como me sinto".
// Fica SÓ no aparelho (IndexedDB). Nunca é enviado ao Supabase, à equipe ou à exportação.

const BANCO = 'jornada-privado';
const LOJA = 'registros';

function abrir() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BANCO, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(LOJA);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function operar(modo, fn) {
  const db = await abrir();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOJA, modo);
    const req = fn(tx.objectStore(LOJA));
    tx.oncomplete = () => resolve(req && req.result);
    tx.onerror = () => reject(tx.error);
  });
}

// fase: 'inicio' (dia 1) ou 'final' (dia 21); a chave inclui a usuária para aparelhos compartilhados.
export const lerPrivado = (usuario, fase) => operar('readonly', (s) => s.get(`${usuario}:${fase}`));
export const salvarPrivado = (usuario, fase, dados) => operar('readwrite', (s) => s.put({ ...dados, em: new Date().toISOString() }, `${usuario}:${fase}`));
export const apagarPrivado = (usuario) => operar('readwrite', (s) => { s.delete(`${usuario}:inicio`); return s.delete(`${usuario}:final`); });
