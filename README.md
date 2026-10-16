# Jornada Ana + Eleviê

App do desafio de 21 dias (alimentação, movimento e mentalidade) da Eleviê com a Dra. Nelly Kim e a Ana Paula Moura.
Baseado nos documentos *Levantamento_MVP_Jornada_Ana_Elevie.docx* (requisitos) e *21 Dias* (cronograma, textos, roteiros e participação da Dra. Nelly).

## Estrutura

| Pasta | O que é |
|---|---|
| `src/` | App de produção (Vite + JavaScript + Supabase) |
| `supabase/migrations/` | Banco: tabelas, regras de acesso (RLS), proteções e bucket de fotos |
| `supabase/seed.sql` | Conteúdo da Edição 1 (gerado de `prototipo/data.js`) |
| `scripts/` | `gerar-seed.mjs` e `testar-banco.mjs` (61 testes de acesso) |
| `prototipo/` | Protótipo clicável com dados fictícios (referência de telas e regras; ver `prototipo/README.md`) |
| `docs/PRODUCAO.md` | Passo a passo de GitHub, Supabase e Vercel |

## Comandos

```bash
npm install
npm run dev          # app em http://localhost:5173 (precisa do .env.local)
npm run test:db      # aplica migrações + seed num Postgres local e testa as regras de acesso
npm run build        # gera dist/ (o mesmo que a Vercel faz)
npm run seed:gerar   # regenera supabase/seed.sql a partir do protótipo
npm run prototipo    # protótipo clicável em http://localhost:3200
```

## Segurança e privacidade (resumo)

- **Quem vê o quê é regra do banco (RLS)**, não do app:
  - a participante só vê os próprios registros;
  - a equipe vê os registros e as fotos de comprovação, mas não as respostas privadas;
  - só a Dra. Nelly aprova conteúdo de saúde.
- **Caixinha anônima**: a autoria fica numa tabela que só a autora lê. Ninguém da equipe consegue "desanonimizar".
- **Antes e depois do corpo** (dias 1 e 21): fica só no aparelho (IndexedDB) e nunca é enviado.
- **Fotos de comprovação**: bucket privado, cada participante só grava na própria pasta, e a equipe lê para revisar.
- **Consentimentos**: viram histórico (aceite e revogação), sem sobrescrever.

## Etapas

1. **Fundação (feita)**: estrutura do projeto, banco com RLS testado (66 testes), bucket de fotos, seed dos 21 dias, login por e-mail e senha, perfil, entrada na jornada com consentimentos, deploy na Vercel e CI no GitHub.
2. **Telas da participante (feitas)**: Hoje/dia, tarefa com foto de comprovação (cinco tipos de registro), "não consegui", rascunho, correção pedida pela equipe, check-in com enquete e balanço, caixinha (anônima), compartilhar no Instagram, progresso, antes e depois privado (só no aparelho), avisos e autorizações.
3. **Área da equipe (feita)**: painel, ficha da participante, revisão em grade com aprovação em lote, caixinha (triagem e Dra. Nelly), check-ins, configurar dias (inclui aprovação do conteúdo da Dra. Nelly), campanha (datas, WhatsApp, perfis do Instagram), acessos e senhas, exportação CSV e "testar a jornada" (simula um dia sem afetar as participantes).
4. **Lançamento**: checklist do `docs/PRODUCAO.md`, piloto e campanha.

Ainda fora do app (Fase B do levantamento): calendário editorial dos Stories com aprovação e métricas manuais de campanha (marcações e mensagens).
