# Plano: travar os dias encerrados

**Situação:** aprovado em 16/10/2026 ("com as sugestões") e implementado.

## O problema

Hoje a participante pode voltar a qualquer dia anterior e registrar o que esqueceu.
A tela do dia até avisa: "Você ainda pode registrar tarefas de dias anteriores".

## A proposta

Passado o dia, ele fica **somente leitura**.

| Item | Proposta |
|---|---|
| **Quando trava** | Às **06:00 do dia seguinte**, quando o próximo dia abre. Quem faz a caminhada à noite ainda consegue registrar até de madrugada. (Alternativa: travar às 23:59.) |
| **O que trava** | Registrar ou alterar as tarefas do dia, incluindo rascunhos não enviados, e responder o check-in do dia. |
| **O que continua aberto** | A **caixinha de perguntas** (não depende do dia) e o **ponto de partida** (primeiro passo obrigatório). |
| **Como a participante vê** | Dias passados mostram **"Dia encerrado"**. O que ela enviou aparece normalmente; o que não enviou aparece como **"Não registrada"**, sem botão de enviar. |
| **Onde fica a regra** | **No banco de dados**, não só na tela, usando o **horário do servidor**. Trocar a hora do celular não reabre o dia. |

## Pontos para decidir

1. **Ajuste pedido pela equipe**
   Se a equipe revisa a foto depois que o dia fechou e pede ajuste, a participante não teria como corrigir.
   - Sugestão: um pedido de ajuste reabre **só aquela tarefa** por **24 horas**.

2. **Reabrir um dia como exceção** (ex.: participante que ficou sem internet)
   - Sugestão: um botão para **admin** reabrir um dia específico para uma participante, com registro no histórico.
   - Alternativa: não ter exceção nenhuma.

3. **Quem entrar atrasada**
   Encontra os dias anteriores já travados, como "não feitos". O ponto de partida continua liberado.

## Para aprovar

Responda na conversa:
- **"Aprovado com as sugestões"**: trava às 06:00 do dia seguinte, ajuste reabre a tarefa por 24h e admin pode reabrir um dia como exceção; ou
- **"Aprovado sem exceções"**: trava às 06:00 do dia seguinte e nada reabre; ou
- as suas escolhas em cada ponto.
