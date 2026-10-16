# Guia de produção — GitHub, Supabase e Vercel

```
Participante / equipe (celular ou computador)
        │  https://jornada...  (Vercel, região São Paulo)
        ▼
  App (Vite, HTML/CSS/JS) ──────────────►  Supabase (São Paulo)
        │                                   ├─ Auth: e-mail e senha
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

### 2.3 Login por e-mail e senha
1. **Authentication › Sign In / Providers › Email**: deixe ativo e **desligue "Confirm email"**. Assim a participante cria a conta e já entra, sem depender de e-mail.
2. Senha mínima: 6 caracteres (padrão do Supabase, igual à regra do app).
3. **Esqueceu a senha?** O botão abre o WhatsApp da equipe com o e-mail da participante. Cadastre o número em `VITE_WHATSAPP_SUPORTE`: só números, com DDI e DDD (ex.: `5514999999999`). No app, a equipe entra com o próprio login, informa o e-mail da participante e gera uma senha provisória; o app pede uma senha nova no próximo acesso.
4. Como o app não envia e-mails, o SMTP próprio não é necessário.

### 2.4 Endereços permitidos
Em **Authentication › URL Configuration**:
- **Site URL**: `https://SEU-DOMINIO` (o endereço final do app).
- **Redirect URLs**: `http://localhost:5173` e `https://SEU-DOMINIO`.

### 2.5 Papéis: admin, equipe e Dra. Nelly
Cada pessoa cria a conta no app uma vez (vira "participante"). Depois, no **SQL Editor**:
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
   - `VITE_WHATSAPP_SUPORTE` = número do WhatsApp da equipe (só números)
3. **Deploy**. A região já vem configurada para São Paulo (`gru1`) no `vercel.json`, junto com os cabeçalhos de segurança.
4. Domínio próprio (ex.: `jornada.elevie.com.br`): em **Settings › Domains**. Depois, atualize o endereço no Supabase (item 2.4).

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
- [ ] "Confirm email" **desligado** e número de WhatsApp da equipe cadastrado.
- [ ] Domínio próprio na Vercel, com o Supabase atualizado.
- [ ] Data de início real: `update public.campanhas set inicio = 'AAAA-MM-DD' where slug = 'edicao-1';` (uma **segunda-feira**).
- [ ] WhatsApp da clínica: `update public.campanhas set whatsapp_clinica = '55DDDNUMERO' where slug = 'edicao-1';`
- [ ] @ correto da clínica no Instagram (o `@eleviê` do PDF tem acento e não existe no Instagram).
- [ ] Os 5 conteúdos da Dra. Nelly aprovados por ela.
- [ ] Textos da política de privacidade e das regras revisados (LGPD).
- [ ] Prazo de retenção das fotos definido e rotina de exclusão combinada.
- [ ] Piloto com um grupo pequeno antes da campanha completa.
