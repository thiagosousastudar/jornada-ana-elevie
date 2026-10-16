-- Gerado por scripts/gerar-seed.mjs a partir de prototipo/data.js. Não edite à mão.
-- Conteúdo da Edição 1 da Jornada Ana + Eleviê (documento "21 dias de desafios").
begin;
insert into public.campanhas (slug, nome, inicio, fuso, liberacao, hashtag, palavra_codigo, whatsapp_clinica, aviso_saude, semanas, instagram)
values ('edicao-1', 'Jornada Ana + Eleviê — Edição 1', '2026-11-02', 'America/Sao_Paulo', '06:00', '#JornadaAnaEleviê', 'Jornada', null, 'Esta jornada é sobre hábitos e constância. Não é tratamento e não substitui consulta. Se você está grávida, amamentando, tem alguma doença ou usa medicação, converse com seu médico antes de mudar a alimentação ou o exercício.', '[{"nome":"Desinflamar","foco":"Alimentação mais natural, sono, movimento leve e o ponto de partida."},{"nome":"Energia e constância","foco":"Proteína, café da manhã, atenção ao comer, lanches e movimento em família."},{"nome":"A rotina que fica","foco":"Cardápio base, plano B, check-up, confiança e fechamento."}]'::jsonb, '[{"chave":"clinica","nome":"Eleviê (clínica)","usuario":"@eleviê"},{"chave":"nelly","nome":"Dra. Nelly Kim","usuario":"@dra.nellykim"},{"chave":"ana","nome":"Ana Paula Moura","usuario":"@anninha.moura"}]'::jsonb)
on conflict (slug) do nothing;

-- Dia 1: Ponto de partida
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 1, 1, 'Ponto de partida', null, null, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd1-ali', 'alimentacao'::public.frente_t, 1, 'Observar sem mudar', 'Hoje não é dia de mudar nada na comida, só de observar. Anote o que você comeu e como se sentiu depois, sem julgar. Beba água ao longo do dia.', null, null, '{"tipo":"texto","campos":[{"label":"O que você comeu e como se sentiu depois?","obrigatorio":true}]}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto de uma refeição do dia, do jeito que ela é. Sem mudar nada."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 1
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd1-mov', 'movimento'::public.frente_t, 2, 'Caminhada leve de 15 min', 'Uma caminhada leve de 15 minutos, no seu ritmo.', null, 'Se hoje não deu, 5 minutos de alongamento já contam. Sem culpa.', '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 1
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd1-men', 'mentalidade'::public.frente_t, 3, 'Seu ponto de partida', 'Coleta de dados, só para você: medidas com fita métrica e fotos de frente, de costas e de perfil. Tudo fica guardado só no seu celular, para comparar no dia 21. Depois grave o primeiro áudio para si mesma: "eu sou capaz, eu posso, eu sou a minha principal motivadora".', null, null, '{"tipo":"privado","itens":["Fiz meu registro do ponto de partida (só no meu celular)","Gravei meu primeiro áudio para mim"]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, 'inicio'
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 1
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd1-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Poste o seu primeiro passo. Fotos do corpo e medidas são só suas: não poste.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 1
on conflict (codigo) do nothing;

-- Dia 2: Entendendo a inflamação
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 2, 1, 'Entendendo a inflamação', null, null, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.conteudos_nelly (dia_id, formato, titulo, resumo, fecho, status)
select d.id, 'Áudio', 'O que é inflamação e por que começamos pelos hábitos', 'Explicação geral e simples: o que é inflamação, como alimentação, sono, estresse e movimento se relacionam com ela, e por que a primeira semana trabalha hábitos.', 'Se você tem dúvidas sobre o seu caso, converse em consulta.', 'em_revisao'::public.status_nelly_t
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 2
on conflict (dia_id) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd2-ali', 'alimentacao'::public.frente_t, 1, 'Uma troca de verdade', 'Troque um ultraprocessado do dia (salgadinho, biscoito recheado, refrigerante) por comida de verdade. Só um já está ótimo.', null, null, '{"tipo":"texto","campos":[{"label":"Qual troca você fez?","obrigatorio":true}]}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto da comida de verdade que entrou no lugar do ultraprocessado."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 2
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd2-mov', 'movimento'::public.frente_t, 2, 'Caminhada de 20 min', 'Caminhada de 20 minutos.', null, 'Se hoje não deu, 5 minutos de alongamento já contam. Sem culpa.', '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 2
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd2-men', 'mentalidade'::public.frente_t, 3, '3 coisas que seu corpo faz', 'Escreva três coisas que o seu corpo faz por você todos os dias, e agradeça.', null, null, '{"tipo":"texto","campos":[{"label":"1ª coisa","obrigatorio":true},{"label":"2ª coisa","obrigatorio":true},{"label":"3ª coisa","obrigatorio":true}]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 2
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd2-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Mostre a troca do dia: o ultraprocessado que saiu e a comida de verdade que entrou.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 2
on conflict (codigo) do nothing;

-- Dia 3: O prato das cores
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 3, 1, 'O prato das cores', null, null, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd3-ali', 'alimentacao'::public.frente_t, 1, 'Prato colorido', 'Monte pelo menos uma refeição com bastante cor: folhas, legumes, frutas, grãos e boas gorduras (como azeite e castanhas). Reduza o açúcar adicionado do dia.', null, null, '{"tipo":"texto","campos":[{"label":"Quer comentar algo sobre a foto?","obrigatorio":false}]}'::jsonb, '{"foto":"obrigatoria","criterio":"Prato com pelo menos 3 cores de alimentos (folhas, legumes, frutas, grãos)."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 3
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd3-mov', 'movimento'::public.frente_t, 2, 'Alongamento de 10 min', 'Alongamento de 10 minutos, pela manhã ou à noite.', null, null, '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 3
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd3-men', 'mentalidade'::public.frente_t, 3, 'Meus 3 motivos', 'Escreva em um papel os seus três motivos para estar nessa jornada e deixe em um lugar visível.', null, null, '{"tipo":"texto","campos":[{"label":"1º motivo","obrigatorio":true},{"label":"2º motivo","obrigatorio":true},{"label":"3º motivo","obrigatorio":true}]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 3
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd3-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Mostre o seu prato colorido.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 3
on conflict (codigo) do nothing;

-- Dia 4: Sono e noite tranquila
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 4, 1, 'Sono e noite tranquila', '{"pergunta":"Quantas horas você dormiu essa noite?","opcoes":["Menos de 5","De 5 a 7","Mais de 7"]}'::jsonb, null, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd4-ali', 'alimentacao'::public.frente_t, 1, 'Noite mais leve', 'Faça um jantar mais leve e um pouco mais cedo, e prefira chá sem açúcar à noite. Evite beliscar de madrugada.', null, null, '{"tipo":"checklist","itens":["Jantei mais leve e mais cedo","Tomei chá sem açúcar","Evitei beliscar de madrugada"],"minimo":1}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto do jantar mais leve."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 4
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd4-mov', 'movimento'::public.frente_t, 2, 'Caminhada de 20 a 30 min', 'Caminhada de 20 a 30 minutos, de preferência com luz natural.', null, 'Se hoje não deu, 5 minutos de alongamento já contam. Sem culpa.', '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 4
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd4-men', 'mentalidade'::public.frente_t, 3, 'Telas desligadas', 'Desligue as telas 30 minutos antes de dormir, no que for possível. Em vez disso, ouça o áudio que você gravou para você mesma.', null, null, '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 4
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd4-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Conte como está cuidando da noite: o chá, o celular longe da cama.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 4
on conflict (codigo) do nothing;

-- Dia 5: Intestino, fibras e água
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 5, 1, 'Intestino, fibras e água', null, null, '{"pergunta":"Qual foi o seu não hoje?","tag":"Desafio do dia"}'::jsonb, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd5-ali', 'alimentacao'::public.frente_t, 1, 'Fibras e água', 'Aumente as fibras do dia (frutas, verduras, legumes, aveia, sementes) e beba água ao longo de todo o dia. Deixe uma garrafa à vista.', null, null, '{"tipo":"checklist","itens":["Aumentei as fibras do dia","Bebi água ao longo do dia"],"minimo":1}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto de uma refeição com fibras ou da sua garrafa de água à vista."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 5
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd5-mov', 'movimento'::public.frente_t, 2, '15 min de movimento em casa', '15 minutos de movimento em casa: agachamentos na cadeira, elevação de joelhos e alongamento.', null, 'Se hoje não deu, 5 minutos de alongamento já contam. Sem culpa.', '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 5
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd5-men', 'mentalidade'::public.frente_t, 3, 'Dizer não a uma cobrança', 'Diga não a uma cobrança hoje. Pode ser uma tarefa que não precisa ser sua ou uma culpa que você mesma criou.', null, null, '{"tipo":"texto","campos":[{"label":"Quer anotar qual foi o seu não? (só você vê)","obrigatorio":false}],"privado":true}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 5
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd5-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Mostre a sua garrafa de água à vista ou o treino em casa.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 5
on conflict (codigo) do nothing;

-- Dia 6: Planejar para facilitar
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 6, 1, 'Planejar para facilitar', null, null, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd6-ali', 'alimentacao'::public.frente_t, 1, 'Planejar a semana', 'Planeje as refeições da semana: faça uma lista de compras com comida de verdade e prepare algo para adiantar (legumes cortados, uma proteína pronta, um molho caseiro).', null, null, '{"tipo":"texto","campos":[{"label":"Quer comentar algo sobre a foto?","obrigatorio":false}]}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto da lista de compras ou do preparo adiantado."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 6
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd6-mov', 'movimento'::public.frente_t, 2, 'Caminhada de 30 min', 'Caminhada de 30 minutos, de preferência com a família ou com o carrinho do bebê.', null, 'Se hoje não deu, 5 minutos de alongamento já contam. Sem culpa.', '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto do caminho ou do local, sem rostos de outras pessoas."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 6
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd6-men', 'mentalidade'::public.frente_t, 3, 'Chamar alguém junto', 'Pense em quem faz parte da sua rede (família, amigas, vizinha) e chame uma pessoa para fazer a jornada com você.', null, null, '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 6
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd6-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Mostre o seu preparo da semana e marque quem você chamou para a jornada.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 6
on conflict (codigo) do nothing;

-- Dia 7: Balanço da semana 1
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 7, 1, 'Balanço da semana 1', '{"pergunta":"Como foi a sua semana?","opcoes":["Ótima","Boa","Difícil, mas estou aqui"]}'::jsonb, '{"titulo":"Balanço da semana 1","perguntas":["O que funcionou nesta semana?","O que foi mais difícil?"]}'::jsonb, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.conteudos_nelly (dia_id, formato, titulo, resumo, fecho, status)
select d.id, 'Vídeo', 'Balanço da semana 1', 'Resumo da semana (sono, alimentação e movimento) e respostas a duas ou três dúvidas do grupo, em tom educativo e geral.', null, 'em_revisao'::public.status_nelly_t
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 7
on conflict (dia_id) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd7-ali', 'alimentacao'::public.frente_t, 1, 'Dia flexível', 'Coma bem, sem se cobrar. Observe o que funcionou melhor para você nessa semana.', null, null, '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"opcional","criterio":"Se quiser, foto de uma refeição de hoje."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 7
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd7-mov', 'movimento'::public.frente_t, 2, 'Descanso ativo', 'Uma caminhada tranquila ou alongamento.', null, null, '{"tipo":"autorrelato","opcoes":["Caminhada","Alongamento"]}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 7
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd7-men', 'mentalidade'::public.frente_t, 3, 'Novo áudio para você', 'Ouça o seu áudio do dia 1 e grave um novo, contando como foi a primeira semana.', null, null, '{"tipo":"privado","itens":["Ouvi meu áudio do dia 1","Gravei um novo áudio"]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 7
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd7-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Conte como foi a sua primeira semana.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 7
on conflict (codigo) do nothing;

-- Dia 8: Energia
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 8, 2, 'Energia', null, null, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd8-ali', 'alimentacao'::public.frente_t, 1, 'Proteína em cada refeição', 'Inclua uma fonte de proteína em cada refeição principal (ovos, frango, peixe, feijão, lentilha, iogurte natural, queijo branco), junto com os legumes e as folhas.', null, null, '{"tipo":"texto","campos":[{"label":"Quer comentar algo sobre a foto?","obrigatorio":false}]}'::jsonb, '{"foto":"obrigatoria","criterio":"Refeição com uma fonte de proteína visível."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 8
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd8-mov', 'movimento'::public.frente_t, 2, '20 min de força leve', '20 minutos de exercício de força leve em casa, com o peso do corpo: agachamento, prancha, flexão no joelho ou apoio na parede.', null, 'Se hoje não deu, 5 minutos de alongamento já contam. Sem culpa.', '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 8
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd8-men', 'mentalidade'::public.frente_t, 3, 'Meta da semana', 'Defina uma meta pequena e realista para a semana e escreva onde você vai ver todo dia.', null, null, '{"tipo":"texto","campos":[{"label":"Minha meta da semana","obrigatorio":true}]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 8
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd8-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Poste a sua meta da semana.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 8
on conflict (codigo) do nothing;

-- Dia 9: Café da manhã que sustenta
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 9, 2, 'Café da manhã que sustenta', null, null, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd9-ali', 'alimentacao'::public.frente_t, 1, 'Café com proteína e fibra', 'Faça um café da manhã com proteína e fibra (ovos com fruta, iogurte natural com aveia, pão integral com queijo). Reduza o açúcar da manhã.', null, null, '{"tipo":"texto","campos":[{"label":"Quer comentar algo sobre a foto?","obrigatorio":false}]}'::jsonb, '{"foto":"obrigatoria","criterio":"Café da manhã com proteína e fibra."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 9
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd9-mov', 'movimento'::public.frente_t, 2, 'Caminhada de 25 min', 'Caminhada de 25 minutos, em ritmo um pouco mais forte.', null, 'Se hoje não deu, 5 minutos de alongamento já contam. Sem culpa.', '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 9
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd9-men', 'mentalidade'::public.frente_t, 3, '"Eu me automotivo"', 'Grave um áudio para si mesma: "eu me automotivo". Fale de um momento em que você se surpreendeu com a sua força.', null, null, '{"tipo":"privado","itens":["Gravei meu áudio"]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 9
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd9-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Mostre o seu café da manhã que sustenta.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 9
on conflict (codigo) do nothing;

-- Dia 10: Fome, emoção e atenção
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 10, 2, 'Fome, emoção e atenção', '{"pergunta":"Eu belisco quando estou:","opcoes":["Cansada","Ansiosa","Entediada","Com fome de verdade"]}'::jsonb, null, '{"pergunta":"Qual emoção você mais sentiu hoje?","tag":"Emoções"}'::jsonb, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd10-ali', 'alimentacao'::public.frente_t, 1, 'Comer com atenção', 'Faça pelo menos uma refeição com atenção: sem telas, mastigando devagar. Antes de beliscar, pergunte-se: "é fome ou é emoção?".', null, null, '{"tipo":"texto","campos":[{"label":"Como foi comer com atenção?","obrigatorio":true}]}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto da refeição feita com atenção, sem telas por perto."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 10
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd10-mov', 'movimento'::public.frente_t, 2, '20 min de força leve', '20 minutos de força leve.', null, 'Se hoje não deu, 5 minutos de alongamento já contam. Sem culpa.', '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 10
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd10-men', 'mentalidade'::public.frente_t, 3, 'Perceber uma emoção', 'Observe uma emoção que apareceu hoje e a que horas. Não precisa resolver, só perceber.', null, null, '{"tipo":"texto","campos":[{"label":"Que emoção apareceu?","obrigatorio":true},{"label":"A que horas?","obrigatorio":false}],"privado":true}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 10
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd10-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Mostre a sua refeição com atenção, sem telas.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 10
on conflict (codigo) do nothing;

-- Dia 11: Lanches e escolhas fáceis
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 11, 2, 'Lanches e escolhas fáceis', null, null, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd11-ali', 'alimentacao'::public.frente_t, 1, 'Lanches à vista', 'Deixe lanches prontos e à vista: frutas, castanhas, iogurte natural, ovos cozidos, cenoura com homus. Tire os ultraprocessados da altura dos olhos.', null, null, '{"tipo":"texto","campos":[{"label":"Quer comentar algo sobre a foto?","obrigatorio":false}]}'::jsonb, '{"foto":"obrigatoria","criterio":"Lanches preparados e à vista."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 11
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd11-mov', 'movimento'::public.frente_t, 2, '25 min do seu jeito', 'Dance, caminhe ou pedale 25 minutos, o que você mais gostar.', null, 'Se hoje não deu, 5 minutos de alongamento já contam. Sem culpa.', '{"tipo":"autorrelato","opcoes":["Dança","Caminhada","Bicicleta","Outra"]}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 11
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd11-men', 'mentalidade'::public.frente_t, 3, 'Sem comparação', 'Hoje, não se compare. Se perceber que está se comparando nas redes, pare e volte para o seu ponto de partida.', null, null, '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 11
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd11-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Mostre o seu cantinho de lanches ou o movimento de que você mais gosta.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 11
on conflict (codigo) do nothing;

-- Dia 12: Movimento em família
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 12, 2, 'Movimento em família', null, null, '{"pergunta":"Qual é a sua maior culpa de mãe? As mais comuns vão para a Dra. Nelly.","tag":"Culpa de mãe"}'::jsonb, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd12-ali', 'alimentacao'::public.frente_t, 1, 'Refeição em família', 'Faça uma refeição em família com comida de verdade, e envolva as crianças no preparo, se puder.', null, null, '{"tipo":"texto","campos":[{"label":"Quer comentar algo sobre a foto?","obrigatorio":false}]}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto só da comida. Evite rostos de outras pessoas, principalmente de crianças."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 12
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd12-mov', 'movimento'::public.frente_t, 2, '30 min com os filhos', '30 minutos de atividade com os filhos: parque, bicicleta, brincadeira ativa. Sem filhos por perto? Chame alguém querido.', null, null, '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto do local ou da atividade, sem rostos de crianças ou de outras pessoas."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 12
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd12-men', 'mentalidade'::public.frente_t, 3, 'Pazes com a culpa de mãe', 'Faça as pazes com a culpa de mãe: escreva uma coisa que você faz bem como mãe. Se você não é mãe, pense em alguém de quem você cuida.', null, null, '{"tipo":"texto","campos":[{"label":"Uma coisa que eu faço bem","obrigatorio":true}]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 12
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd12-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Mostre a refeição ou a atividade em família, sem rostos de crianças.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 12
on conflict (codigo) do nothing;

-- Dia 13: Dia de flexibilidade
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 13, 2, 'Dia de flexibilidade', null, null, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd13-ali', 'alimentacao'::public.frente_t, 1, 'Refeição social sem culpa', 'Se tiver uma refeição social (aniversário, almoço de família), aproveite com tranquilidade. Escolha o que você gosta, coma com atenção e siga em frente, sem se punir depois.', null, null, '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"opcional","criterio":"Se quiser, foto só do seu prato, sem outras pessoas."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 13
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd13-mov', 'movimento'::public.frente_t, 2, 'Movimento livre', 'Livre: o que o seu corpo pedir hoje.', null, null, '{"tipo":"autorrelato","opcoes":["Caminhada","Dança","Alongamento","Outro"]}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 13
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd13-men', 'mentalidade'::public.frente_t, 3, 'Gentileza consigo', 'Pratique a gentileza. Se você escorregou do plano, converse com você mesma como falaria com uma amiga.', null, null, '{"tipo":"texto","campos":[{"label":"O que você diria para você, como amiga?","obrigatorio":true}]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 13
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd13-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Mostre que a jornada também é flexível.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 13
on conflict (codigo) do nothing;

-- Dia 14: Balanço da semana 2
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 14, 2, 'Balanço da semana 2', '{"pergunta":"Como você se sente depois de 2 semanas?","opcoes":["Mais disposta","Igual","Cansada, mas persistindo"]}'::jsonb, '{"titulo":"Balanço da semana 2","perguntas":["O que você percebeu em você nessa semana?","O que foi mais difícil?"]}'::jsonb, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.conteudos_nelly (dia_id, formato, titulo, resumo, fecho, status)
select d.id, 'Vídeo', 'Energia, sono e o que as mães mais perguntam', 'Respostas às dúvidas da semana, em tom geral.', 'Orientação personalizada só em consulta.', 'em_revisao'::public.status_nelly_t
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 14
on conflict (dia_id) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd14-ali', 'alimentacao'::public.frente_t, 1, 'Revisar a semana', 'Revise a semana: em quais refeições a proteína foi mais fácil? Qual lanche você quer manter?', null, null, '{"tipo":"texto","campos":[{"label":"Onde a proteína foi mais fácil?","obrigatorio":true},{"label":"Qual lanche você quer manter?","obrigatorio":true}]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 14
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd14-mov', 'movimento'::public.frente_t, 2, 'Descanso ativo', 'Caminhada ou alongamento.', null, null, '{"tipo":"autorrelato","opcoes":["Caminhada","Alongamento"]}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 14
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd14-men', 'mentalidade'::public.frente_t, 3, 'Terceiro áudio', 'Ouça os seus dois áudios e grave um terceiro, dizendo o que você descobriu sobre você nessas duas semanas.', null, null, '{"tipo":"privado","itens":["Ouvi meus dois áudios","Gravei o terceiro áudio"]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 14
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd14-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Conte o que você descobriu sobre você em duas semanas.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 14
on conflict (codigo) do nothing;

-- Dia 15: A rotina que fica
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 15, 3, 'A rotina que fica', null, null, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd15-ali', 'alimentacao'::public.frente_t, 1, 'Cardápio base', 'Monte o seu cardápio base: 3 opções de café da manhã, 3 de almoço, 3 de lanche e 3 de jantar que você gosta e consegue repetir.', null, null, '{"tipo":"texto","campos":[{"label":"Café da manhã (3 opções)","obrigatorio":true},{"label":"Almoço (3 opções)","obrigatorio":true},{"label":"Lanche (3 opções)","obrigatorio":true},{"label":"Jantar (3 opções)","obrigatorio":true}]}'::jsonb, '{"foto":"opcional","criterio":"Se quiser, foto do cardápio escrito ou colado na geladeira."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 15
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd15-mov', 'movimento'::public.frente_t, 2, 'Minha rotina de movimento', 'Defina a sua rotina de movimento: quais dias e que horários (por exemplo, 3 a 4 vezes por semana).', null, null, '{"tipo":"texto","campos":[{"label":"Meus dias e horários","obrigatorio":true}]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 15
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd15-men', 'mentalidade'::public.frente_t, 3, 'Frase de identidade', 'Escreva uma frase de identidade, como "eu sou uma mulher que cuida de si".', null, null, '{"tipo":"texto","campos":[{"label":"Minha frase","obrigatorio":true}]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 15
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd15-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Poste a sua frase de identidade.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 15
on conflict (codigo) do nothing;

-- Dia 16: Energia da tarde
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 16, 3, 'Energia da tarde', '{"pergunta":"Como foi a sua tarde hoje?","opcoes":["Com energia","Mais ou menos","Muito cansada"],"alerta":{"opcao":"Muito cansada","msg":"Se você anda muito cansada, vale levar isso para uma consulta. Cansaço constante merece atenção."}}'::jsonb, null, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd16-ali', 'alimentacao'::public.frente_t, 1, 'Lanche da tarde', 'Planeje o lanche da tarde para evitar a queda de energia: proteína, fruta e uma gordura boa.', null, null, '{"tipo":"texto","campos":[{"label":"Quer comentar algo sobre a foto?","obrigatorio":false}]}'::jsonb, '{"foto":"obrigatoria","criterio":"Lanche com proteína, fruta e gordura boa."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 16
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd16-mov', 'movimento'::public.frente_t, 2, 'Força ou caminhada rápida', '20 minutos de força leve ou uma caminhada rápida depois do almoço.', null, 'Se hoje não deu, 5 minutos de alongamento já contam. Sem culpa.', '{"tipo":"autorrelato","opcoes":["Força leve","Caminhada rápida"]}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 16
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd16-men', 'mentalidade'::public.frente_t, 3, 'Pausa para respirar', 'Pare 5 minutos no meio da tarde, só para respirar.', null, null, '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 16
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd16-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Mostre o seu lanche da tarde ou a sua pausa de 5 minutos.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 16
on conflict (codigo) do nothing;

-- Dia 17: Plano B para os imprevistos
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 17, 3, 'Plano B para os imprevistos', null, null, '{"pergunta":"Qual é o seu maior sabotador? Cansaço, falta de tempo, vergonha, comparação?","tag":"Sabotadores"}'::jsonb, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd17-ali', 'alimentacao'::public.frente_t, 1, 'Refeição de emergência', 'Prepare um plano B para dias corridos: uma refeição de emergência saudável (ovos mexidos, sanduíche com salada, sopa caseira pronta).', null, null, '{"tipo":"texto","campos":[{"label":"Minha refeição plano B","obrigatorio":true}]}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto da refeição de emergência pronta ou dos ingredientes separados."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 17
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd17-mov', 'movimento'::public.frente_t, 2, 'Movimento plano B', 'Plano B de movimento: uma versão de 10 minutos para os dias em que não dá tempo.', null, null, '{"tipo":"texto","campos":[{"label":"Meu plano B de 10 minutos","obrigatorio":true}]}'::jsonb, '{"foto":"opcional","criterio":"Se quiser, foto do lugar onde vai fazer o plano B."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 17
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd17-men', 'mentalidade'::public.frente_t, 3, 'Meu maior sabotador', 'Pense em qual foi o seu maior sabotador (cansaço, falta de tempo, vergonha, comparação) e em como você pode se antecipar.', null, null, '{"tipo":"texto","campos":[{"label":"Qual foi o seu maior sabotador?","obrigatorio":true},{"label":"Como você vai se antecipar?","obrigatorio":true}]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 17
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd17-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Mostre o seu plano B para os dias corridos.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 17
on conflict (codigo) do nothing;

-- Dia 18: Mulher, hormônios e check-up
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 18, 3, 'Mulher, hormônios e check-up', null, null, null, true
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.conteudos_nelly (dia_id, formato, titulo, resumo, fecho, status)
select d.id, 'Vídeo', 'Hormônios ao longo da vida e a importância do check-up', 'As fases da vida da mulher (pós-parto, fase adulta, climatério e menopausa), por que investigar sintomas persistentes como cansaço e alterações de sono e humor, e o papel do acompanhamento médico.', null, 'em_revisao'::public.status_nelly_t
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 18
on conflict (dia_id) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd18-ali', 'alimentacao'::public.frente_t, 1, 'Cardápio base e água', 'Alimentação do dia seguindo o seu cardápio base. Reforce a água.', null, null, '{"tipo":"checklist","itens":["Segui o cardápio base","Reforcei a água"],"minimo":1}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto de uma refeição do cardápio base."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 18
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd18-mov', 'movimento'::public.frente_t, 2, 'Movimento da rotina', 'Movimento de acordo com a sua rotina.', null, null, '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 18
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd18-men', 'mentalidade'::public.frente_t, 3, 'O check-up adiado', 'Pense em qual consulta ou exame você vem adiando e anote para marcar. Não precisa contar qual.', null, null, '{"tipo":"privado","itens":["Anotei para marcar"]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 18
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd18-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Conte que você vai marcar aquele check-up.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 18
on conflict (codigo) do nothing;

-- Dia 19: Força e confiança
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 19, 3, 'Força e confiança', null, null, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd19-ali', 'alimentacao'::public.frente_t, 1, 'Proteína e legumes', 'Almoço e jantar com proteína e legumes, e uma sobremesa de fruta.', null, null, '{"tipo":"texto","campos":[{"label":"Quer comentar algo sobre a foto?","obrigatorio":false}]}'::jsonb, '{"foto":"obrigatoria","criterio":"Refeição com proteína e legumes."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 19
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd19-mov', 'movimento'::public.frente_t, 2, '20 a 25 min de força', '20 a 25 minutos de força, tentando aumentar um pouquinho (mais repetições ou um exercício novo).', null, 'Se hoje não deu, 5 minutos de alongamento já contam. Sem culpa.', '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 19
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd19-men', 'mentalidade'::public.frente_t, 3, 'Uma vitória além do corpo', 'Reconheça uma vitória que não tem a ver com o corpo: uma coisa que você aprendeu, um limite que você impôs, um hábito novo.', null, null, '{"tipo":"texto","campos":[{"label":"Minha vitória","obrigatorio":true}]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 19
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd19-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Conte a sua maior vitória que não tem a ver com a balança.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 19
on conflict (codigo) do nothing;

-- Dia 20: Carta para o meu futuro
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 20, 3, 'Carta para o meu futuro', null, null, null, false
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd20-ali', 'alimentacao'::public.frente_t, 1, 'Cardápio base em família', 'Siga o seu cardápio base e, se puder, faça o jantar em família.', null, null, '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto de uma refeição do cardápio base, só da comida."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 20
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd20-mov', 'movimento'::public.frente_t, 2, 'Caminhada de 30 min', 'Caminhada de 30 minutos, de preferência em um lugar de que você goste.', null, 'Se hoje não deu, 5 minutos de alongamento já contam. Sem culpa.', '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 20
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd20-men', 'mentalidade'::public.frente_t, 3, 'Carta para daqui a um ano', 'Escreva uma carta para você daqui a um ano: como você quer estar, o que quer ter feito pela sua saúde e o que quer poder fazer com a sua família. Ela é sua: não é enviada para ninguém.', null, null, '{"tipo":"privado","itens":["Escrevi minha carta"]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 20
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd20-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Mostre o lugar da sua caminhada.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 20
on conflict (codigo) do nothing;

-- Dia 21: Fechamento: onde estamos
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, 21, 3, 'Fechamento: onde estamos', null, null, null, true
from public.campanhas where slug = 'edicao-1'
on conflict (campanha_id, numero) do nothing;
insert into public.conteudos_nelly (dia_id, formato, titulo, resumo, fecho, status)
select d.id, 'Vídeo', 'Encerramento: o valor da constância', 'O que a jornada mostra sobre hábitos e o convite para continuar com acompanhamento médico. Sem falar de resultados individuais.', null, 'em_revisao'::public.status_nelly_t
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 21
on conflict (dia_id) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd21-ali', 'alimentacao'::public.frente_t, 1, 'Refeição de comemoração', 'Faça uma refeição especial e saudável, e comemore.', null, null, '{"tipo":"texto","campos":[{"label":"Quer comentar algo sobre a foto?","obrigatorio":false}]}'::jsonb, '{"foto":"obrigatoria","criterio":"Refeição de comemoração."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 21
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd21-mov', 'movimento'::public.frente_t, 2, 'Movimento para celebrar', 'Um movimento de que você gosta, para celebrar.', null, null, '{"tipo":"autorrelato","opcoes":null}'::jsonb, '{"foto":"obrigatoria","criterio":"Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 21
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd21-men', 'mentalidade'::public.frente_t, 3, 'Fechando o ciclo', 'Ouça o áudio do dia 1. Depois, faça o registro de fechamento e compare as medidas e as fotos, só para você. Grave um último áudio contando como se sente agora.', null, null, '{"tipo":"privado","itens":["Ouvi meu áudio do dia 1","Fiz meu registro de fechamento e comparei (só no meu celular)","Gravei meu último áudio"]}'::jsonb, '{"foto":"nao","criterio":""}'::jsonb, 'final'
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 21
on conflict (codigo) do nothing;
insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, 'd21-com', 'compartilhar'::public.frente_t, 4, 'Compartilhe o seu dia', 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.', 'Conte como você se sente no dia 21. Comparações do corpo ficam só com você.', null, '{"tipo":"compartilhar"}'::jsonb, '{"foto":"opcional","criterio":"Print do post ou do Stories em que dá para ver as marcações."}'::jsonb, null
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = 'edicao-1' and d.numero = 21
on conflict (codigo) do nothing;
commit;
