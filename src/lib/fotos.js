// Fotos de comprovação: reduzir antes de enviar e abrir por link temporário (bucket privado).
import { supabase } from './supabase.js';

const BUCKET = 'evidencias';
const cache = new Map(); // caminho -> { url, ate }

async function decodificar(file) {
  if (window.createImageBitmap) {
    try { return await createImageBitmap(file); } catch { /* tenta pelo <img> */ }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Não foi possível ler essa imagem. Tente outra foto (JPG ou PNG).')); };
    img.src = url;
  });
}

// Reduz para no máximo `max` pixels no lado maior e converte para JPEG.
export async function reduzirFoto(file, max = 1280, qualidade = 0.8) {
  if (!file || !/^image\//.test(file.type || 'image/jpeg')) throw new Error('Escolha uma imagem.');
  const img = await decodificar(file);
  const k = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * k);
  c.height = Math.round(img.height * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('Não foi possível preparar a foto.'))), 'image/jpeg', qualidade));
}

export function blobParaDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

// Caminho: {id da participante}/{código da tarefa}-{momento}.jpg (a regra do banco exige a pasta dela).
export async function enviarFoto(usuarioId, codigo, blob) {
  const caminho = `${usuarioId}/${codigo}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(caminho, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) throw new Error(/exceeded|too large|size/i.test(error.message) ? 'A foto é grande demais. Tente outra.' : `Não foi possível enviar a foto: ${error.message}`);
  return caminho;
}

// Gera links temporários (1 hora) para várias fotos de uma vez.
export async function precarregarFotos(caminhos) {
  const agora = Date.now();
  const faltam = [...new Set(caminhos.filter(Boolean))].filter((p) => !cache.has(p) || cache.get(p).ate < agora + 60000);
  if (!faltam.length) return;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(faltam, 3600);
  if (error) throw new Error(error.message);
  data.forEach((x) => { if (x.signedUrl) cache.set(x.path, { url: x.signedUrl, ate: agora + 3600 * 1000 }); });
}

export const urlFoto = (caminho) => (caminho && cache.has(caminho) ? cache.get(caminho).url : '');
