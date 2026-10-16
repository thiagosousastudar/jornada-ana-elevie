# Jornada Ana + Eleviê

Aplicação para operar o desafio de 21 dias (alimentação, movimento e mentalidade), baseada nos documentos *Levantamento_MVP_Jornada_Ana_Elevie.docx* (requisitos) e *21 Dias* (cronograma, textos dos dias, roteiros da Ana e participação da Dra. Nelly).

## Protótipo clicável (Fase A)

Esta pasta: HTML, CSS e JS puros, sem build e com **dados fictícios**. O estado fica no `localStorage` do navegador, apenas para a demonstração.

**Visual:** segue as Human Interface Guidelines da Apple:
- Fonte do sistema (SF Pro, com Inter como alternativa), título grande de 34 pt, cores do sistema por frente, listas agrupadas e ícones no estilo SF Symbols.
- **Liquid Glass** na barra de abas flutuante, na barra de navegação (aparece ao rolar), nos toasts e nos rótulos sobre fotos.
- Anel de progresso como no app Atividade e modo escuro automático.
- Respeita "reduzir movimento". No computador, a área da participante aparece dentro de um iPhone; no celular, ocupa a tela inteira.

```bash
npm run prototipo
```

Abra http://localhost:3200. A barra escura no topo controla a demonstração:

- **Ver como:** alterna entre a visão da participante (celular) e a da equipe (painel).
- **Hoje é:** simula o dia da campanha (1 a 21). O que já foi feito na demo é mantido.
- **Premissas do protótipo:** lista as decisões adotadas e as que estão em aberto.
- **Reiniciar dados:** volta ao estado inicial.

### O que dá para simular

**Participante** (Camila, fictícia)
- **Login com o Google** como opção principal, simulado no protótipo. A alternativa é um código de 6 dígitos no e-mail (qualquer código funciona na demo). Sem senha.
- **"Como podemos te chamar?"**: depois do primeiro acesso ela confirma o nome completo (já preenchido pelo Google) e, se quiser, diz como prefere ser chamada. O app usa esse nome na saudação. O perfil pode ser editado em Avisos, e a equipe vê o nome, o apelido e a forma de acesso.
- Boas-vindas com aviso de saúde e consentimentos separados, nenhum pré-marcado.
- Tela do dia com as 3 tarefas, o status de cada uma e o que será registrado. Os textos seguem o documento dos 21 dias, organizados em 3 semanas: Desinflamar, Energia e constância, A rotina que fica. O dia 1 cai numa segunda-feira.
- **Antes e depois privado:** no dia 1 (ponto de partida) e no dia 21 (fechamento), a participante registra medidas, fotos de frente, costas e perfil e como está se sentindo. Tudo fica **só no aparelho dela**; no dia 21 ela vê a comparação lado a lado. Nada vai para a equipe nem para a exportação.
- **Conteúdo da Dra. Nelly** nos dias 2, 7, 14, 18 e 21, que só aparece depois de aprovado.
- **Botão "Quero agendar minha avaliação"** nos dias 18 e 21 (e em Avisos), com a palavra-código "Jornada".
- **Foto de comprovação obrigatória em alimentação e movimento**, com critério específico por dia (prato, preparo, local, tênis, tela do app). Mentalidade não pede foto. Nunca se pede foto do corpo.
- **Compartilhe o seu dia (4ª tarefa diária):** a participante posta no Instagram marcando a clínica, a Dra. Nelly e a Ana (@anninha.moura) com #JornadaAnaEleviê. Ela recebe uma ideia de post do dia, o texto pronto para copiar e um atalho para o Instagram. Comprova com o link do post ou com um print (o print vai para a revisão) e confirma as marcações. Há um aviso para não postar corpo, medidas nem rostos de crianças, e postar não autoriza repost. Quem tem perfil fechado ou não quer se expor marca "Não vou postar hoje", sem punição.
- Além da foto, cada tarefa tem seu registro: marcar que fez, texto, checklist ou confirmação privada.
- Campos obrigatórios validados, rascunho e "não consegui" sem punição.
- Correção de tarefa devolvida: a tarefa do dia 3 já começa com ajuste pendente.
- Meu progresso (sem ranking) e check-in diário, que traz a **enquete do dia** nos dias 4, 7, 10, 14 e 16 e o **balanço de domingo** nos dias 7 e 14. O dia 21 tem a pesquisa final.
- **Caixinha:** a participante envia pergunta ou mensagem **com nome ou anônima**, marca se é sobre a saúde e acompanha o status e a resposta. Nos dias 5, 10, 12 e 17 aparece a pergunta da Ana, como no PDF. O mural "Respostas para todas" mostra respostas publicadas sem o nome de quem perguntou. Se a mensagem tem sinal de urgência, ela vê na hora a orientação de procurar atendimento (SAMU 192, CVV 188).
- Avisos: foco da semana, conteúdos da Dra. Nelly, aviso de saúde, canais de ajuda, botão de avaliação e revogação de autorizações.

**Equipe**
- Painel com indicadores, gráfico de adesão por dia e filtros por situação.
- Ficha da participante: consentimentos e alerta de repost; conteúdo privado aparece oculto.
- Indicador "Compartilharam hoje". Perfis do Instagram editáveis em Configurar dias, com alerta quando o @ é inválido (o `@eleviê` do PDF tem acento, o que o Instagram não aceita, então o perfil da clínica precisa ser confirmado).
- Fila de revisão em **grade**, com filtro por dia e por frente (inclui os prints de compartilhamento) e **aprovação em lote**. Na visão de detalhe, o pedido de ajuste exige motivo. A decisão aparece na hora para a participante.
- **Caixinha, triagem da equipe:** escolher o tema e decidir se a equipe responde, se vai para a Dra. Nelly (dúvida de saúde) ou se arquiva. Alerta de "parece clínica" e de "possível urgência", com urgentes no topo e contato da participante quando ela se identificou. Na fila da Dra. Nelly, resposta em tom geral, por escrito ou como pauta de um vídeo (dias 7, 14, 18 e 21), com modelo "orientar consulta". Também dá para publicar no mural e ver os temas mais comuns. Mensagens anônimas nunca mostram quem enviou.
- Check-ins por dia: quem respondeu e quem está pendente, o resultado da enquete e as respostas do balanço de domingo.
- Indicador de interesse em avaliação (quem tocou em "agendar").
- Configuração dos nomes das semanas e dos 21 dias: tema, conteúdo e situação de aprovação da Dra. Nelly, textos, campos obrigatórios e exigência de foto por tarefa (obrigatória, opcional ou sem foto) com critério, além do histórico de alterações.
- Exportação em CSV de registros e check-ins (sem conteúdo privado e sem e-mails).

Fora deste corte (Fase B): calendário editorial com aprovação da Dra. Nelly e métricas de campanha.
