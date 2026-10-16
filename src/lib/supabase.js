import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const configurado = Boolean(url && chave && !url.includes('SEU-PROJETO'));
export const CAMPANHA_SLUG = import.meta.env.VITE_CAMPANHA_SLUG || 'edicao-1';

// PKCE: o retorno do login do Google chega como ?code=..., sem conflitar com as rotas (#/...).
export const supabase = configurado
  ? createClient(url, chave, {
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
