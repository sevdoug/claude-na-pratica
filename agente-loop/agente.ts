// ─────────────────────────────────────────────────────────────────────────
// Um agente de IA é nada mais nada menos que um loop:
//   LLM decide → ferramenta executa → resultado volta pro LLM → repete.
// ─────────────────────────────────────────────────────────────────────────
import { tools, executar } from "./tools.js"; // ← 1. as ferramentas
import { llm, type Mensagem } from "./llm.js"; // ← 2. o LLM

const task =
  process.argv[2] ??
  "Rode `node demo/teste.js`. Se falhar, leia o código em demo/, conserte o bug e rode o teste de novo até passar.";

const messages: Mensagem[] = [{ role: "user", content: task }];

// ← 3. o agente é ISTO:
const MAX_TURNOS = 20; // todo agente real tem um limite
for (let turno = 1; turno <= MAX_TURNOS; turno++) {
  const res = await llm.chat({ messages, tools }); // o LLM decide o próximo passo
  messages.push(res.message);

  if (res.toolCalls.length === 0) break; // sem tool call = terminou

  // executa o que o modelo pediu e devolve os resultados
  messages.push({ role: "user", content: res.toolCalls.map(executar) });
}

console.log("\n✅ fim do loop.");
console.log("   isso é 90% de qualquer agente. o resto é engenharia de contexto.");
