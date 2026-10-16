// Dados fictícios do protótipo — Jornada Ana + Eleviê.
// Textos dos 21 dias: documento "21 dias de desafios" (Eleviê / Dra. Nelly Kim). Tipos de registro e fotos são propostas a validar.

(function () {
  // Tipos de registro:
  //  autorrelato — "Fiz" / "Fiz adaptado"; opcoes = qual atividade escolheu
  //  texto       — campos de texto; privado = só a participante lê
  //  checklist   — marcar hábitos; minimo = quantos itens para registrar
  //  privado     — confirmação local; nada é enviado (fotos/medidas/áudios/carta)
  //
  // Foto de comprovação (evidencia) é independente do tipo de registro: qualquer tarefa
  // pode pedir foto obrigatória, opcional ou nenhuma. Padrão: alimentação e movimento
  // pedem foto obrigatória; mentalidade não pede (é reflexiva/privada).
  // Tarefas "privado" nunca pedem foto: fotos do corpo e medidas não saem do celular.
  const auto = (opcoes) => ({ tipo: 'autorrelato', opcoes: opcoes || null });
  const texto = (campos, extra) => ({ tipo: 'texto', campos: campos.map((c) => (typeof c === 'string' ? { label: c, obrigatorio: true } : c)), ...extra });
  const check = (itens, minimo = 1) => ({ tipo: 'checklist', itens, minimo });
  const priv = (itens) => ({ tipo: 'privado', itens });
  const COMENTARIO = { label: 'Quer comentar algo sobre a foto?', obrigatorio: false };
  // Tarefa cujo registro principal é a foto, com comentário opcional.
  const foto = (criterio) => ({ registro: texto([COMENTARIO]), evidencia: obr(criterio) });
  const obr = (criterio) => ({ foto: 'obrigatoria', criterio });
  const opc = (criterio) => ({ foto: 'opcional', criterio });
  const sem = { foto: 'nao', criterio: '' };

  const PADRAO = {
    alimentacao: obr('Foto da refeição ou do preparo pedido no dia.'),
    movimento: obr('Foto que mostre a atividade: o local, o tênis, o tapete ou a tela do app/relógio. Não precisa aparecer o seu corpo.'),
    mentalidade: sem,
  };
  const task = (n, frente, t) => {
    const ev = t.registro.tipo === 'privado' ? sem : (t.evidencia || PADRAO[frente]);
    return { id: `d${n}-${frente.slice(0, 3)}`, frente, ...t, evidencia: { ...ev } };
  };

  // extra: nelly (conteúdo da Dra. Nelly), enquete (no check-in), balanco (perguntas da semana
  // no check-in de domingo) e cta (botão de avaliação na clínica).
  // Compartilhar o dia no Instagram marcando a clínica, a Dra. Nelly e a Ana (todos os dias, como no documento).
  // Comprovação: link do post/Stories ou print. O print entra na fila de revisão.
  const SUGESTAO_POST = {
    1: 'Poste o seu primeiro passo. Fotos do corpo e medidas são só suas: não poste.',
    2: 'Mostre a troca do dia: o ultraprocessado que saiu e a comida de verdade que entrou.',
    3: 'Mostre o seu prato colorido.',
    4: 'Conte como está cuidando da noite: o chá, o celular longe da cama.',
    5: 'Mostre a sua garrafa de água à vista ou o treino em casa.',
    6: 'Mostre o seu preparo da semana e marque quem você chamou para a jornada.',
    7: 'Conte como foi a sua primeira semana.',
    8: 'Poste a sua meta da semana.',
    9: 'Mostre o seu café da manhã que sustenta.',
    10: 'Mostre a sua refeição com atenção, sem telas.',
    11: 'Mostre o seu cantinho de lanches ou o movimento de que você mais gosta.',
    12: 'Mostre a refeição ou a atividade em família, sem rostos de crianças.',
    13: 'Mostre que a jornada também é flexível.',
    14: 'Conte o que você descobriu sobre você em duas semanas.',
    15: 'Poste a sua frase de identidade.',
    16: 'Mostre o seu lanche da tarde ou a sua pausa de 5 minutos.',
    17: 'Mostre o seu plano B para os dias corridos.',
    18: 'Conte que você vai marcar aquele check-up.',
    19: 'Conte a sua maior vitória que não tem a ver com a balança.',
    20: 'Mostre o lugar da sua caminhada.',
    21: 'Conte como você se sente no dia 21. Comparações do corpo ficam só com você.',
  };
  const compartilhar = (n) => ({
    id: `d${n}-com`,
    frente: 'compartilhar',
    titulo: 'Compartilhe o seu dia',
    instrucao: 'Poste no Instagram (feed ou Stories) marcando a clínica, a Dra. Nelly e a Ana.',
    sugestao: SUGESTAO_POST[n],
    registro: { tipo: 'compartilhar' },
    evidencia: { foto: 'opcional', criterio: 'Print do post ou do Stories em que dá para ver as marcações.' },
  });

  const D = (n, tema, ali, mov, men, extra) => ({
    n,
    tema,
    semana: Math.ceil(n / 7),
    tarefas: [task(n, 'alimentacao', ali), task(n, 'movimento', mov), task(n, 'mentalidade', men), compartilhar(n)],
    ...(extra || {}),
  });

  const ALT_MOV = 'Se hoje não deu, 5 minutos de alongamento já contam. Sem culpa.';

  // Textos baseados no documento "21 dias de desafios — Jornada Ana + Eleviê".
  const days = [
    // ---------------- Semana 1 · Desinflamar ----------------
    D(1, 'Ponto de partida',
      { titulo: 'Observar sem mudar', instrucao: 'Hoje não é dia de mudar nada na comida, só de observar. Anote o que você comeu e como se sentiu depois, sem julgar. Beba água ao longo do dia.', registro: texto(['O que você comeu e como se sentiu depois?']), evidencia: obr('Foto de uma refeição do dia, do jeito que ela é. Sem mudar nada.') },
      { titulo: 'Caminhada leve de 15 min', instrucao: 'Uma caminhada leve de 15 minutos, no seu ritmo.', registro: auto(), alternativa: ALT_MOV },
      { titulo: 'Seu ponto de partida', instrucao: 'Coleta de dados, só para você: medidas com fita métrica e fotos de frente, de costas e de perfil. Tudo fica guardado só no seu celular, para comparar no dia 21. Depois grave o primeiro áudio para si mesma: "eu sou capaz, eu posso, eu sou a minha principal motivadora".', registro: priv(['Fiz meu registro do ponto de partida (só no meu celular)', 'Gravei meu primeiro áudio para mim']), registroCorpo: 'inicio' }),
    D(2, 'Entendendo a inflamação',
      { titulo: 'Uma troca de verdade', instrucao: 'Troque um ultraprocessado do dia (salgadinho, biscoito recheado, refrigerante) por comida de verdade. Só um já está ótimo.', registro: texto(['Qual troca você fez?']), evidencia: obr('Foto da comida de verdade que entrou no lugar do ultraprocessado.') },
      { titulo: 'Caminhada de 20 min', instrucao: 'Caminhada de 20 minutos.', registro: auto(), alternativa: ALT_MOV },
      { titulo: '3 coisas que seu corpo faz', instrucao: 'Escreva três coisas que o seu corpo faz por você todos os dias, e agradeça.', registro: texto(['1ª coisa', '2ª coisa', '3ª coisa']) },
      { nelly: { formato: 'Áudio', titulo: 'O que é inflamação e por que começamos pelos hábitos', resumo: 'Explicação geral e simples: o que é inflamação, como alimentação, sono, estresse e movimento se relacionam com ela, e por que a primeira semana trabalha hábitos.', fecho: 'Se você tem dúvidas sobre o seu caso, converse em consulta.', status: 'aprovado' } }),
    D(3, 'O prato das cores',
      { titulo: 'Prato colorido', instrucao: 'Monte pelo menos uma refeição com bastante cor: folhas, legumes, frutas, grãos e boas gorduras (como azeite e castanhas). Reduza o açúcar adicionado do dia.', ...foto('Prato com pelo menos 3 cores de alimentos (folhas, legumes, frutas, grãos).') },
      { titulo: 'Alongamento de 10 min', instrucao: 'Alongamento de 10 minutos, pela manhã ou à noite.', registro: auto() },
      { titulo: 'Meus 3 motivos', instrucao: 'Escreva em um papel os seus três motivos para estar nessa jornada e deixe em um lugar visível.', registro: texto(['1º motivo', '2º motivo', '3º motivo']) }),
    D(4, 'Sono e noite tranquila',
      { titulo: 'Noite mais leve', instrucao: 'Faça um jantar mais leve e um pouco mais cedo, e prefira chá sem açúcar à noite. Evite beliscar de madrugada.', registro: check(['Jantei mais leve e mais cedo', 'Tomei chá sem açúcar', 'Evitei beliscar de madrugada']), evidencia: obr('Foto do jantar mais leve.') },
      { titulo: 'Caminhada de 20 a 30 min', instrucao: 'Caminhada de 20 a 30 minutos, de preferência com luz natural.', registro: auto(), alternativa: ALT_MOV },
      { titulo: 'Telas desligadas', instrucao: 'Desligue as telas 30 minutos antes de dormir, no que for possível. Em vez disso, ouça o áudio que você gravou para você mesma.', registro: auto() },
      { enquete: { pergunta: 'Quantas horas você dormiu essa noite?', opcoes: ['Menos de 5', 'De 5 a 7', 'Mais de 7'] } }),
    D(5, 'Intestino, fibras e água',
      { titulo: 'Fibras e água', instrucao: 'Aumente as fibras do dia (frutas, verduras, legumes, aveia, sementes) e beba água ao longo de todo o dia. Deixe uma garrafa à vista.', registro: check(['Aumentei as fibras do dia', 'Bebi água ao longo do dia'], 1), evidencia: obr('Foto de uma refeição com fibras ou da sua garrafa de água à vista.') },
      { titulo: '15 min de movimento em casa', instrucao: '15 minutos de movimento em casa: agachamentos na cadeira, elevação de joelhos e alongamento.', registro: auto(), alternativa: ALT_MOV },
      { titulo: 'Dizer não a uma cobrança', instrucao: 'Diga não a uma cobrança hoje. Pode ser uma tarefa que não precisa ser sua ou uma culpa que você mesma criou.', registro: texto([{ label: 'Quer anotar qual foi o seu não? (só você vê)', obrigatorio: false }], { privado: true }) }),
    D(6, 'Planejar para facilitar',
      { titulo: 'Planejar a semana', instrucao: 'Planeje as refeições da semana: faça uma lista de compras com comida de verdade e prepare algo para adiantar (legumes cortados, uma proteína pronta, um molho caseiro).', ...foto('Foto da lista de compras ou do preparo adiantado.') },
      { titulo: 'Caminhada de 30 min', instrucao: 'Caminhada de 30 minutos, de preferência com a família ou com o carrinho do bebê.', registro: auto(), alternativa: ALT_MOV, evidencia: obr('Foto do caminho ou do local, sem rostos de outras pessoas.') },
      { titulo: 'Chamar alguém junto', instrucao: 'Pense em quem faz parte da sua rede (família, amigas, vizinha) e chame uma pessoa para fazer a jornada com você.', registro: auto() }),
    D(7, 'Balanço da semana 1',
      { titulo: 'Dia flexível', instrucao: 'Coma bem, sem se cobrar. Observe o que funcionou melhor para você nessa semana.', registro: auto(), evidencia: opc('Se quiser, foto de uma refeição de hoje.') },
      { titulo: 'Descanso ativo', instrucao: 'Uma caminhada tranquila ou alongamento.', registro: auto(['Caminhada', 'Alongamento']) },
      { titulo: 'Novo áudio para você', instrucao: 'Ouça o seu áudio do dia 1 e grave um novo, contando como foi a primeira semana.', registro: priv(['Ouvi meu áudio do dia 1', 'Gravei um novo áudio']) },
      {
        nelly: { formato: 'Vídeo', titulo: 'Balanço da semana 1', resumo: 'Resumo da semana (sono, alimentação e movimento) e respostas a duas ou três dúvidas do grupo, em tom educativo e geral.', status: 'aprovado' },
        enquete: { pergunta: 'Como foi a sua semana?', opcoes: ['Ótima', 'Boa', 'Difícil, mas estou aqui'] },
        balanco: { titulo: 'Balanço da semana 1', perguntas: ['O que funcionou nesta semana?', 'O que foi mais difícil?'] },
      }),

    // ---------------- Semana 2 · Energia e constância ----------------
    D(8, 'Energia',
      { titulo: 'Proteína em cada refeição', instrucao: 'Inclua uma fonte de proteína em cada refeição principal (ovos, frango, peixe, feijão, lentilha, iogurte natural, queijo branco), junto com os legumes e as folhas.', ...foto('Refeição com uma fonte de proteína visível.') },
      { titulo: '20 min de força leve', instrucao: '20 minutos de exercício de força leve em casa, com o peso do corpo: agachamento, prancha, flexão no joelho ou apoio na parede.', registro: auto(), alternativa: ALT_MOV },
      { titulo: 'Meta da semana', instrucao: 'Defina uma meta pequena e realista para a semana e escreva onde você vai ver todo dia.', registro: texto(['Minha meta da semana']) }),
    D(9, 'Café da manhã que sustenta',
      { titulo: 'Café com proteína e fibra', instrucao: 'Faça um café da manhã com proteína e fibra (ovos com fruta, iogurte natural com aveia, pão integral com queijo). Reduza o açúcar da manhã.', ...foto('Café da manhã com proteína e fibra.') },
      { titulo: 'Caminhada de 25 min', instrucao: 'Caminhada de 25 minutos, em ritmo um pouco mais forte.', registro: auto(), alternativa: ALT_MOV },
      { titulo: '"Eu me automotivo"', instrucao: 'Grave um áudio para si mesma: "eu me automotivo". Fale de um momento em que você se surpreendeu com a sua força.', registro: priv(['Gravei meu áudio']) }),
    D(10, 'Fome, emoção e atenção',
      { titulo: 'Comer com atenção', instrucao: 'Faça pelo menos uma refeição com atenção: sem telas, mastigando devagar. Antes de beliscar, pergunte-se: "é fome ou é emoção?".', registro: texto(['Como foi comer com atenção?']), evidencia: obr('Foto da refeição feita com atenção, sem telas por perto.') },
      { titulo: '20 min de força leve', instrucao: '20 minutos de força leve.', registro: auto(), alternativa: ALT_MOV },
      { titulo: 'Perceber uma emoção', instrucao: 'Observe uma emoção que apareceu hoje e a que horas. Não precisa resolver, só perceber.', registro: texto(['Que emoção apareceu?', { label: 'A que horas?', obrigatorio: false }], { privado: true }) },
      { enquete: { pergunta: 'Eu belisco quando estou:', opcoes: ['Cansada', 'Ansiosa', 'Entediada', 'Com fome de verdade'] } }),
    D(11, 'Lanches e escolhas fáceis',
      { titulo: 'Lanches à vista', instrucao: 'Deixe lanches prontos e à vista: frutas, castanhas, iogurte natural, ovos cozidos, cenoura com homus. Tire os ultraprocessados da altura dos olhos.', ...foto('Lanches preparados e à vista.') },
      { titulo: '25 min do seu jeito', instrucao: 'Dance, caminhe ou pedale 25 minutos, o que você mais gostar.', registro: auto(['Dança', 'Caminhada', 'Bicicleta', 'Outra']), alternativa: ALT_MOV },
      { titulo: 'Sem comparação', instrucao: 'Hoje, não se compare. Se perceber que está se comparando nas redes, pare e volte para o seu ponto de partida.', registro: auto() }),
    D(12, 'Movimento em família',
      { titulo: 'Refeição em família', instrucao: 'Faça uma refeição em família com comida de verdade, e envolva as crianças no preparo, se puder.', ...foto('Foto só da comida. Evite rostos de outras pessoas, principalmente de crianças.') },
      { titulo: '30 min com os filhos', instrucao: '30 minutos de atividade com os filhos: parque, bicicleta, brincadeira ativa. Sem filhos por perto? Chame alguém querido.', registro: auto(), evidencia: obr('Foto do local ou da atividade, sem rostos de crianças ou de outras pessoas.') },
      { titulo: 'Pazes com a culpa de mãe', instrucao: 'Faça as pazes com a culpa de mãe: escreva uma coisa que você faz bem como mãe. Se você não é mãe, pense em alguém de quem você cuida.', registro: texto(['Uma coisa que eu faço bem']) }),
    D(13, 'Dia de flexibilidade',
      { titulo: 'Refeição social sem culpa', instrucao: 'Se tiver uma refeição social (aniversário, almoço de família), aproveite com tranquilidade. Escolha o que você gosta, coma com atenção e siga em frente, sem se punir depois.', registro: auto(), evidencia: opc('Se quiser, foto só do seu prato, sem outras pessoas.') },
      { titulo: 'Movimento livre', instrucao: 'Livre: o que o seu corpo pedir hoje.', registro: auto(['Caminhada', 'Dança', 'Alongamento', 'Outro']) },
      { titulo: 'Gentileza consigo', instrucao: 'Pratique a gentileza. Se você escorregou do plano, converse com você mesma como falaria com uma amiga.', registro: texto(['O que você diria para você, como amiga?']) }),
    D(14, 'Balanço da semana 2',
      { titulo: 'Revisar a semana', instrucao: 'Revise a semana: em quais refeições a proteína foi mais fácil? Qual lanche você quer manter?', registro: texto(['Onde a proteína foi mais fácil?', 'Qual lanche você quer manter?']), evidencia: sem },
      { titulo: 'Descanso ativo', instrucao: 'Caminhada ou alongamento.', registro: auto(['Caminhada', 'Alongamento']) },
      { titulo: 'Terceiro áudio', instrucao: 'Ouça os seus dois áudios e grave um terceiro, dizendo o que você descobriu sobre você nessas duas semanas.', registro: priv(['Ouvi meus dois áudios', 'Gravei o terceiro áudio']) },
      {
        nelly: { formato: 'Vídeo', titulo: 'Energia, sono e o que as mães mais perguntam', resumo: 'Respostas às dúvidas da semana, em tom geral.', fecho: 'Orientação personalizada só em consulta.', status: 'aprovado' },
        enquete: { pergunta: 'Como você se sente depois de 2 semanas?', opcoes: ['Mais disposta', 'Igual', 'Cansada, mas persistindo'] },
        balanco: { titulo: 'Balanço da semana 2', perguntas: ['O que você percebeu em você nessa semana?', 'O que foi mais difícil?'] },
      }),

    // ---------------- Semana 3 · A rotina que fica ----------------
    D(15, 'A rotina que fica',
      { titulo: 'Cardápio base', instrucao: 'Monte o seu cardápio base: 3 opções de café da manhã, 3 de almoço, 3 de lanche e 3 de jantar que você gosta e consegue repetir.', registro: texto(['Café da manhã (3 opções)', 'Almoço (3 opções)', 'Lanche (3 opções)', 'Jantar (3 opções)']), evidencia: opc('Se quiser, foto do cardápio escrito ou colado na geladeira.') },
      { titulo: 'Minha rotina de movimento', instrucao: 'Defina a sua rotina de movimento: quais dias e que horários (por exemplo, 3 a 4 vezes por semana).', registro: texto(['Meus dias e horários']), evidencia: sem },
      { titulo: 'Frase de identidade', instrucao: 'Escreva uma frase de identidade, como "eu sou uma mulher que cuida de si".', registro: texto(['Minha frase']) }),
    D(16, 'Energia da tarde',
      { titulo: 'Lanche da tarde', instrucao: 'Planeje o lanche da tarde para evitar a queda de energia: proteína, fruta e uma gordura boa.', ...foto('Lanche com proteína, fruta e gordura boa.') },
      { titulo: 'Força ou caminhada rápida', instrucao: '20 minutos de força leve ou uma caminhada rápida depois do almoço.', registro: auto(['Força leve', 'Caminhada rápida']), alternativa: ALT_MOV },
      { titulo: 'Pausa para respirar', instrucao: 'Pare 5 minutos no meio da tarde, só para respirar.', registro: auto() },
      { enquete: { pergunta: 'Como foi a sua tarde hoje?', opcoes: ['Com energia', 'Mais ou menos', 'Muito cansada'], alerta: { opcao: 'Muito cansada', msg: 'Se você anda muito cansada, vale levar isso para uma consulta. Cansaço constante merece atenção.' } } }),
    D(17, 'Plano B para os imprevistos',
      { titulo: 'Refeição de emergência', instrucao: 'Prepare um plano B para dias corridos: uma refeição de emergência saudável (ovos mexidos, sanduíche com salada, sopa caseira pronta).', registro: texto(['Minha refeição plano B']), evidencia: obr('Foto da refeição de emergência pronta ou dos ingredientes separados.') },
      { titulo: 'Movimento plano B', instrucao: 'Plano B de movimento: uma versão de 10 minutos para os dias em que não dá tempo.', registro: texto(['Meu plano B de 10 minutos']), evidencia: opc('Se quiser, foto do lugar onde vai fazer o plano B.') },
      { titulo: 'Meu maior sabotador', instrucao: 'Pense em qual foi o seu maior sabotador (cansaço, falta de tempo, vergonha, comparação) e em como você pode se antecipar.', registro: texto(['Qual foi o seu maior sabotador?', 'Como você vai se antecipar?']) }),
    D(18, 'Mulher, hormônios e check-up',
      { titulo: 'Cardápio base e água', instrucao: 'Alimentação do dia seguindo o seu cardápio base. Reforce a água.', registro: check(['Segui o cardápio base', 'Reforcei a água']), evidencia: obr('Foto de uma refeição do cardápio base.') },
      { titulo: 'Movimento da rotina', instrucao: 'Movimento de acordo com a sua rotina.', registro: auto() },
      { titulo: 'O check-up adiado', instrucao: 'Pense em qual consulta ou exame você vem adiando e anote para marcar. Não precisa contar qual.', registro: priv(['Anotei para marcar']) },
      {
        nelly: { formato: 'Vídeo', titulo: 'Hormônios ao longo da vida e a importância do check-up', resumo: 'As fases da vida da mulher (pós-parto, fase adulta, climatério e menopausa), por que investigar sintomas persistentes como cansaço e alterações de sono e humor, e o papel do acompanhamento médico.', status: 'em_revisao' },
        cta: true,
      }),
    D(19, 'Força e confiança',
      { titulo: 'Proteína e legumes', instrucao: 'Almoço e jantar com proteína e legumes, e uma sobremesa de fruta.', ...foto('Refeição com proteína e legumes.') },
      { titulo: '20 a 25 min de força', instrucao: '20 a 25 minutos de força, tentando aumentar um pouquinho (mais repetições ou um exercício novo).', registro: auto(), alternativa: ALT_MOV },
      { titulo: 'Uma vitória além do corpo', instrucao: 'Reconheça uma vitória que não tem a ver com o corpo: uma coisa que você aprendeu, um limite que você impôs, um hábito novo.', registro: texto(['Minha vitória']) }),
    D(20, 'Carta para o meu futuro',
      { titulo: 'Cardápio base em família', instrucao: 'Siga o seu cardápio base e, se puder, faça o jantar em família.', registro: auto(), evidencia: obr('Foto de uma refeição do cardápio base, só da comida.') },
      { titulo: 'Caminhada de 30 min', instrucao: 'Caminhada de 30 minutos, de preferência em um lugar de que você goste.', registro: auto(), alternativa: ALT_MOV },
      { titulo: 'Carta para daqui a um ano', instrucao: 'Escreva uma carta para você daqui a um ano: como você quer estar, o que quer ter feito pela sua saúde e o que quer poder fazer com a sua família. Ela é sua: não é enviada para ninguém.', registro: priv(['Escrevi minha carta']) }),
    D(21, 'Fechamento: onde estamos',
      { titulo: 'Refeição de comemoração', instrucao: 'Faça uma refeição especial e saudável, e comemore.', ...foto('Refeição de comemoração.') },
      { titulo: 'Movimento para celebrar', instrucao: 'Um movimento de que você gosta, para celebrar.', registro: auto() },
      { titulo: 'Fechando o ciclo', instrucao: 'Ouça o áudio do dia 1. Depois, faça o registro de fechamento e compare as medidas e as fotos, só para você. Grave um último áudio contando como se sente agora.', registro: priv(['Ouvi meu áudio do dia 1', 'Fiz meu registro de fechamento e comparei (só no meu celular)', 'Gravei meu último áudio']), registroCorpo: 'final' },
      {
        nelly: { formato: 'Vídeo', titulo: 'Encerramento: o valor da constância', resumo: 'O que a jornada mostra sobre hábitos e o convite para continuar com acompanhamento médico. Sem falar de resultados individuais.', status: 'aprovado' },
        cta: true,
      }),
  ];

  const campanha = {
    nome: 'Jornada Ana + Eleviê — Edição 1',
    inicio: '2026-10-16', // sexta-feira: começo da edição 1
    fuso: 'America/Sao_Paulo',
    liberacao: '06:00',
    semanas: [
      { nome: 'Desinflamar', foco: 'Alimentação mais natural, sono, movimento leve e o ponto de partida.' },
      { nome: 'Energia e constância', foco: 'Proteína, café da manhã, atenção ao comer, lanches e movimento em família.' },
      { nome: 'A rotina que fica', foco: 'Cardápio base, plano B, check-up, confiança e fechamento.' },
    ],
    // Botão de avaliação: na versão real, o WhatsApp da clínica (número a definir).
    whatsappClinica: '',
    palavraCodigo: 'Jornada',
    hashtag: '#JornadaAnaEleviê',
    // Perfis marcados no compartilhamento (editáveis em Configurar dias).
    // Atenção: o Instagram não aceita acento no @. O da clínica precisa ser confirmado.
    instagram: [
      { chave: 'clinica', nome: 'Eleviê (clínica)', usuario: '@eleviê', confirmar: true },
      { chave: 'nelly', nome: 'Dra. Nelly Kim', usuario: '@dra.nellykim' },
      { chave: 'ana', nome: 'Ana Paula Moura', usuario: '@anninha.moura' },
    ],
    responsaveis: ['Ana (jornada)', 'Equipe Eleviê (operação)', 'Dra. Nelly Kim (revisão clínica)'],
    avisoSaude: 'Esta jornada é sobre hábitos e constância. Não é tratamento e não substitui consulta. Se você está grávida, amamentando, tem alguma doença ou usa medicação, converse com seu médico antes de mudar a alimentação ou o exercício.',
  };

  // Participantes fictícias. "engaj" controla a geração do histórico.
  const participantes = [
    { id: 'p1', nome: 'Camila Andrade', email: 'camila.demo@exemplo.com', cidade: 'Campinas', engaj: 0.9, voce: true },
    { id: 'p2', nome: 'Juliana Ribeiro', email: 'juliana.demo@exemplo.com', cidade: 'São Paulo', engaj: 0.97 },
    { id: 'p3', nome: 'Patrícia Mello', email: 'patricia.demo@exemplo.com', cidade: 'Santos', engaj: 0.85 },
    { id: 'p4', nome: 'Renata Okada', email: 'renata.demo@exemplo.com', cidade: 'São Paulo', engaj: 0.75 },
    { id: 'p5', nome: 'Fernanda Lima', email: 'fernanda.demo@exemplo.com', cidade: 'Jundiaí', engaj: 0.6 },
    { id: 'p6', nome: 'Aline Castro', email: 'aline.demo@exemplo.com', cidade: 'Sorocaba', engaj: 0.92 },
    { id: 'p7', nome: 'Beatriz Nunes', email: 'beatriz.demo@exemplo.com', cidade: 'São Paulo', engaj: 0.4 },
    { id: 'p8', nome: 'Luana Pereira', email: 'luana.demo@exemplo.com', cidade: 'Campinas', engaj: 0.8 },
    { id: 'p9', nome: 'Marina Duarte', email: 'marina.demo@exemplo.com', cidade: 'Valinhos', engaj: 0.25 },
    { id: 'p10', nome: 'Sofia Teixeira', email: 'sofia.demo@exemplo.com', cidade: 'São Paulo', engaj: 0.88 },
    { id: 'p11', nome: 'Daniela Rocha', email: 'daniela.demo@exemplo.com', cidade: 'Indaiatuba', engaj: 0.7 },
    { id: 'p12', nome: 'Tatiane Alves', email: 'tatiane.demo@exemplo.com', cidade: 'São Paulo', engaj: 0.95 },
  ];

  const respostasExemplo = [
    'Percebi que belisco muito à tarde.', 'Troquei o biscoito por uma fruta.', 'Foi mais fácil do que imaginei.',
    'Fiz com calma, gostei.', 'Consegui na hora do almoço.', 'Planejar ajudou muito.', 'Ainda é difícil à noite.',
    'Preparei marmitas no domingo.', 'Ovos mexidos com aveia e banana.', 'Me senti mais disposta.',
  ];
  const palavras = ['animada', 'cansada', 'leve', 'orgulhosa', 'corrida', 'tranquila', 'motivada', 'ansiosa', 'feliz', 'focada', 'grata'];

  // Perguntas da "caixinha" nos dias em que a Ana pede (documento dos 21 dias).
  const caixinhaDia = {
    5: { pergunta: 'Qual foi o seu não hoje?', tag: 'Desafio do dia' },
    10: { pergunta: 'Qual emoção você mais sentiu hoje?', tag: 'Emoções' },
    12: { pergunta: 'Qual é a sua maior culpa de mãe? As mais comuns vão para a Dra. Nelly.', tag: 'Culpa de mãe' },
    17: { pergunta: 'Qual é o seu maior sabotador? Cansaço, falta de tempo, vergonha, comparação?', tag: 'Sabotadores' },
  };
  days.forEach((d) => { if (caixinhaDia[d.n]) d.caixinha = caixinhaDia[d.n]; });

  const temasCaixinha = ['Alimentação', 'Movimento', 'Sono e cansaço', 'Emoções', 'Culpa de mãe', 'Sabotadores', 'Hormônios e check-up', 'Saúde (caso individual)', 'Desafio do dia', 'Outro'];

  // Mensagens fictícias. "final" é o estado depois da triagem; as dos últimos dias chegam como novas.
  const EQ = 'Equipe Eleviê';
  const NK = 'Dra. Nelly Kim';
  const caixinhaExemplos = [
    { id: 'cx-s1', autor: 'p4', anonima: false, dia: 2, sobre: 'rotina', texto: 'Posso trocar o pão francês por tapioca no café da manhã?', tag: 'Alimentação',
      final: { status: 'respondida', destino: 'equipe', resposta: { texto: 'Pode, sim! O desafio é ter comida de verdade no prato. Se puder, acompanhe com uma proteína (ovo, queijo branco) para dar mais saciedade.', por: EQ, publica: true } } },
    { id: 'cx-s2', autor: 'p7', anonima: true, dia: 3, sobre: 'saude', texto: 'Tomo remédio para tireoide. Posso fazer a caminhada em jejum?', tag: 'Saúde (caso individual)',
      final: { status: 'respondida', destino: 'nelly', resposta: { texto: 'Obrigada pela pergunta! Como envolve medicação, o ideal é conversar sobre o seu caso em consulta. No vídeo do dia 7 eu falo, em tom geral, sobre se alimentar bem antes de se movimentar.', por: NK, publica: false, video: 7 } } },
    { id: 'cx-s3', autor: 'p2', anonima: true, dia: 5, sobre: 'rotina', texto: 'Meu não foi parar de lavar a louça sozinha. Pedi ajuda e deu certo!', tag: 'Desafio do dia',
      final: { status: 'respondida', destino: 'equipe', resposta: { texto: 'Que orgulho! Pedir ajuda também é se cuidar. 🤍', por: EQ, publica: true } } },
    { id: 'cx-s4', autor: 'p5', anonima: false, dia: 4, sobre: 'rotina', texto: 'Não consigo beber água, esqueço o dia todo. Alguma dica?', tag: 'Alimentação',
      final: { status: 'respondida', destino: 'equipe', resposta: { texto: 'Deixe uma garrafa sempre à vista e encha em horários fixos: ao acordar, no almoço e no fim da tarde. Marcar a garrafa com horários também ajuda.', por: EQ, publica: true } } },
    { id: 'cx-s5', autor: 'p9', anonima: true, dia: 6, sobre: 'saude', texto: 'Estou amamentando. Posso fazer os exercícios de força?', tag: 'Saúde (caso individual)',
      final: { status: 'respondida', destino: 'nelly', resposta: { texto: 'Durante a amamentação, o movimento costuma ser bem-vindo, mas cada caso é um caso. Converse com o seu médico antes de aumentar a intensidade.', por: NK, publica: false } } },
    { id: 'cx-s6', autor: 'p8', anonima: false, dia: 8, sobre: 'rotina', texto: 'Qual é o melhor horário para caminhar?', tag: 'Movimento',
      final: { status: 'respondida', destino: 'equipe', resposta: { texto: 'O melhor horário é o que cabe na sua rotina. Se puder, aproveite a luz natural da manhã ou do fim da tarde.', por: EQ, publica: true } } },
    { id: 'cx-s7', autor: 'p3', anonima: true, dia: 10, sobre: 'rotina', texto: 'A emoção que mais apareceu hoje foi a ansiedade, sempre no fim da tarde.', tag: 'Emoções',
      final: { status: 'arquivada', destino: 'equipe' } },
    { id: 'cx-s8', autor: 'p6', anonima: true, dia: 12, sobre: 'rotina', texto: 'Minha maior culpa é deixar meu filho com a minha avó para eu caminhar.', tag: 'Culpa de mãe',
      final: { status: 'respondida', destino: 'nelly', resposta: { texto: 'Essa foi uma das culpas mais citadas. Vou falar sobre isso no vídeo do dia 14.', por: NK, publica: true, video: 14 } } },
    { id: 'cx-s9', autor: 'p11', anonima: true, dia: 12, sobre: 'rotina', texto: 'Sinto culpa até de comer sentada.', tag: 'Culpa de mãe',
      final: { status: 'respondida', destino: 'nelly', resposta: { texto: 'Você não está sozinha. Vou falar sobre a culpa de mãe no vídeo do dia 14.', por: NK, publica: false, video: 14 } } },
    { id: 'cx-s10', autor: 'p10', anonima: false, dia: 11, sobre: 'saude', texto: 'Durmo mal desde o parto. Isso pode ser hormonal?', tag: 'Hormônios e check-up',
      final: { status: 'respondida', destino: 'nelly', resposta: { texto: 'No vídeo do dia 18 eu falo das fases da vida da mulher, incluindo o pós-parto, em tom geral. Sintomas que persistem merecem investigação em consulta.', por: NK, publica: true, video: 18 } } },
    { id: 'cx-s11', autor: 'p12', anonima: true, dia: 16, sobre: 'saude', texto: 'Sinto muito cansaço mesmo dormindo 8 horas. É normal?', tag: 'Sono e cansaço',
      final: { status: 'respondida', destino: 'nelly', resposta: { texto: 'Cansaço constante merece atenção e não deve ser normalizado. O ideal é investigar em consulta.', por: NK, publica: false } } },
    { id: 'cx-s12', autor: 'p4', anonima: true, dia: 17, sobre: 'rotina', texto: 'Meu maior sabotador é o cansaço no fim do dia.', tag: 'Sabotadores',
      final: { status: 'respondida', destino: 'equipe', resposta: { texto: 'Esse foi o sabotador mais citado! Uma ideia: mover o movimento para a manhã ou para depois do almoço, e ter o plano B de 10 minutos para os dias puxados.', por: EQ, publica: true } } },
    { id: 'cx-s13', autor: 'p5', anonima: false, dia: 17, sobre: 'rotina', texto: 'Tenho vergonha de caminhar na rua.', tag: 'Sabotadores',
      final: { status: 'respondida', destino: 'equipe', resposta: { texto: 'Você não está sozinha nisso. Comece pelo treino de 15 minutos em casa ou chame alguém para caminhar junto: a companhia ajuda muito.', por: EQ, publica: false } } },
    { id: 'cx-s14', autor: 'p2', anonima: false, dia: 9, sobre: 'rotina', texto: 'Como faço para não beliscar à noite?', tag: 'Alimentação',
      final: { status: 'respondida', destino: 'equipe', resposta: { texto: 'Um jantar com proteína e legumes ajuda a chegar sem fome na noite. Antes de beliscar, pergunte-se: é fome ou é emoção?', por: EQ, publica: true } } },
    { id: 'cx-s15', autor: 'p7', anonima: false, dia: 4, sobre: 'saude', texto: 'Senti uma dor no peito forte durante a caminhada de ontem e fiquei com falta de ar.', tag: 'Saúde (caso individual)',
      final: { status: 'respondida', destino: 'equipe', resposta: { texto: 'Beatriz, obrigada por avisar. Dor no peito com falta de ar precisa de avaliação médica: se acontecer de novo, procure atendimento imediatamente (SAMU 192). Vamos te ligar hoje. Até lá, pause os exercícios.', por: EQ, publica: false } } },
  ];

  window.JORNADA = { days, campanha, participantes, respostasExemplo, palavras, temasCaixinha, caixinhaExemplos };
})();
