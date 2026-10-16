# Guia de produção — GitHub, Supabase e Vercel

```
Participante / equipe (celular ou computador)
        │  https://jornada...  (Vercel, região São Paulo)
        ▼
  App (Vite, HTML/CSS/JS) ──────────────►  Supabase (São Paulo)
        │                                   ├─ Auth: Google + código no e-mail
        │                                   ├─ Postgres com RLS (quem vê o quê)
        │                                   └─ Storage privado "evidencias" (fotos)
        ▼
  IndexedDB do aparelho: antes e depois do corpo (dias 1 e 21). Nunca sai do celular.
```

- **GitHub**: guarda o código. Cada push roda a verificação automática (testes do banco e build).
- **Vercel**: publica o app sozinha a cada push na `main` e cria uma prévia para cada pull request.
- **Supabase**: login, banco e fotos. Toda regra de acesso está no banco (pasta `supabase/migrations`), testada por `npm run test:db`.

> **Segurança:** as chaves `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` são públicas por natureza; quem protege os dados são as regras do banco.
> A chave **service_role** e a senha do banco **nunca** vão para o código, para o `.env` do app ou para o chat. Guarde-as num gerenciador de senhas.

---

## 1. GitHub

1. Em github.com › **New repository**: nome `jornada-ana-elevie`, **Private**, **sem** README, .gitignore ou licença.
2. Envie o link do repositório. O primeiro push é feito daqui com:
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/jornada-ana-elevie.git
   git push -u origin main
   ```

## 2. Supabase

### 2.1 Criar o projeto
1. supabase.com › **New project**. Nome `jornada-ana-elevie`, região **South America (São Paulo)**. Gere uma senha forte para o banco e guarde-a no gerenciador de senhas.
2. Plano: **Free** para montar e testar. **Antes do lançamento, passe para o Pro**: o plano Free pausa após 7 dias sem uso e não tem backup diário.
3. Em **Project Settings › API**, copie a **Project URL** e a chave **anon public**.

### 2.2 Aplicar o banco (tabelas, regras de acesso, fotos e os 21 dias)
```bash
npm install
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npm run test:db          # confere tudo localmente antes
npx supabase db push --include-seed
```
O seed cria a campanha `edicao-1` com os 21 dias e 84 tarefas. Os 5 conteúdos da Dra. Nelly entram **em revisão**: ela aprova pelo app antes de aparecerem.

### 2.3 Login por código no e-mail
1. **Authentication › Providers › Email**: ativo, com "Confirm email" ligado.
2. **Authentication › Email Templates**: nos modelos *Magic Link* e *Confirm signup*, inclua o código:
   ```html
   <h2>Seu código de acesso</h2>
   <p>Use este código para entrar na Jornada Ana + Eleviê:</p>
   <p style="font-size:28px;font-weight:700;letter-spacing:4px">{{ .Token }}</p>
   <p>Ele vale por 1 hora. Se não foi você, ignore este e-mail.</p>
   ```
3. **SMTP próprio é obrigatório antes do lançamento** (**Project Settings › Authentication › SMTP**). O e-mail padrão do Supabase envia pouquíssimas mensagens por hora. Opções: Resend, Brevo ou Amazon SES, com remetente do domínio da clínica.

### 2.4 Login com o Google
1. Em **console.cloud.google.com**, crie um projeto ("Jornada Ana Elevie").
2. **APIs e serviços › Tela de consentimento OAuth**:
   - tipo **Externo**;
   - nome do app "Jornada Ana + Eleviê", e-mail de suporte e logo;
   - domínios autorizados: `supabase.co` e o domínio do app;
   - escopos: `openid`, `email` e `profile`, nada além disso.
3. **Credenciais › Criar ID do cliente OAuth › Aplicativo da Web**:
   - Origens JavaScript: `http://localhost:5173` e `https://SEU-DOMINIO`.
   - URI de redirecionamento: `https://SEU_PROJECT_REF.supabase.co/auth/v1/callback`.
4. No Supabase, em **Authentication › Providers › Google**, ative e cole o *Client ID* e o *Client Secret*.
5. Antes do lançamento, **publique o app** na tela de consentimento (status "Em produção"). Enquanto estiver em "Teste", só os e-mails cadastrados como testadores conseguem entrar.

### 2.5 Endereços permitidos
Em **Authentication › URL Configuration**:
- **Site URL**: `https://SEU-DOMINIO` (o endereço final do app).
- **Redirect URLs**: `http://localhost:5173`, `https://SEU-DOMINIO` e `https://*-SEU-TIME.vercel.app` (prévias da Vercel).

### 2.6 Papéis: admin, equipe e Dra. Nelly
Cada pessoa entra no app uma vez (vira "participante"). Depois, no **SQL Editor**:
```sql
-- primeiro admin (só uma vez)
update public.perfis set papel = 'admin' where email = 'seu-email@gmail.com';
```
A partir daí, logado como admin, os outros papéis são dados com:
```sql
select public.definir_papel('ana@email.com', 'equipe');
select public.definir_papel('dra.nelly@email.com', 'nelly');
```

## 3. Vercel

1. vercel.com › **Add New › Project** › importe o repositório `jornada-ana-elevie` do GitHub. O framework **Vite** é detectado sozinho.
2. Em **Environment Variables**, para **Production** e **Preview**, cadastre:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CAMPANHA_SLUG` = `edicao-1`
3. **Deploy**. A região já vem configurada para São Paulo (`gru1`) no `vercel.json`, junto com os cabeçalhos de segurança.
4. Domínio próprio (ex.: `jornada.elevie.com.br`): em **Settings › Domains**. Depois, atualize o endereço no Supabase (item 2.5) e no Google (item 2.4).

## 4. Rodar no computador

```bash
cp .env.example .env.local   # preencha com a URL e a chave anon
npm install
npm run dev                  # http://localhost:5173
npm run prototipo            # protótipo clicável em http://localhost:3200
```

## 5. Rotina de mudanças

1. Crie um branch, faça a mudança e abra um pull request.
2. O GitHub roda `test:db` e `build`. A Vercel gera uma prévia com link.
3. Mudança no banco: crie um **novo** arquivo em `supabase/migrations/` (nunca edite um que já foi aplicado), rode `npm run test:db` e, depois do merge, `npx supabase db push`.
4. Mudança nos textos dos 21 dias antes do lançamento: edite `prototipo/data.js`, rode `npm run seed:gerar` e aplique. Depois do lançamento, a equipe edita pelo app.

## 6. Antes do lançamento

- [ ] Supabase no plano **Pro** (backups diários, sem pausa).
- [ ] **SMTP próprio** configurado e testado.
- [ ] App do Google **publicado** (fora do modo teste).
- [ ] Domínio próprio na Vercel, com Supabase e Google atualizados.
- [ ] Data de início real: `update public.campanhas set inicio = 'AAAA-MM-DD' where slug = 'edicao-1';` (uma **segunda-feira**).
- [ ] WhatsApp da clínica: `update public.campanhas set whatsapp_clinica = '55DDDNUMERO' where slug = 'edicao-1';`
- [ ] @ correto da clínica no Instagram (o `@eleviê` do PDF tem acento e não existe no Instagram).
- [ ] Os 5 conteúdos da Dra. Nelly aprovados por ela.
- [ ] Textos da política de privacidade e das regras revisados (LGPD).
- [ ] Prazo de retenção das fotos definido e rotina de exclusão combinada.
- [ ] Piloto com um grupo pequeno antes da campanha completa.
