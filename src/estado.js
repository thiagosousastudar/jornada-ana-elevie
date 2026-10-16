// Estado da sessão em memória. A fonte da verdade é o banco; aqui fica só o que já foi carregado.
export const S = {
  sessao: null,
  perfil: null,
  campanha: null,
  dias: [],
  inscricao: null,
  consent: {},
  registros: [],
  privados: {},          // respostas de tarefas privadas, por tarefa_id (só a própria participante lê)
  checkins: [],
  caixinha: [],          // as minhas mensagens + as respostas publicadas no mural
  autoria: new Set(),    // ids das minhas mensagens anônimas
  privado: { inicio: null, final: null }, // antes e depois: só no aparelho (IndexedDB)
  eq: null,              // dados da equipe (carregados sob demanda)
  ui: {},                // estado da tela atual (zerado a cada navegação)
  filtros: {},           // filtros e abas que a equipe mantém entre telas
  diaSim: null,          // dia simulado (só para a equipe testar a jornada)
};

// main.js preenche com a função que redesenha a tela.
export const app = { render() {} };
