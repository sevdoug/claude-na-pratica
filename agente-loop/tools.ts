// As ferramentas do agente: funções comuns + um schema pro modelo entender.
// O modelo nunca executa nada — ele só PEDE. Quem executa é o nosso código.
import { execSync } from "node:child_process";
import fs from "node:fs";
import type Anthropic from "@anthropic-ai/sdk";

export const tools = {
  read_file: {
    description: "Lê um arquivo e retorna o conteúdo como texto.",
    input_schema: {
      type: "object" as const,
      properties: { path: { type: "string", description: "caminho do arquivo" } },
      required: ["path"],
    },
    run: (a: { path: string }) => fs.readFileSync(a.path, "utf8"),
  },

  write_file: {
    description: "Escreve conteúdo em um arquivo (sobrescreve se existir).",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string" },
        content: { type: "string" },
      },
      required: ["path", "content"],
    },
    run: (a: { path: string; content: string }) => {
      fs.writeFileSync(a.path, a.content);
      return `ok, escrevi ${a.path}`;
    },
  },

  run_shell: {
    description: "Executa um comando shell e retorna stdout + stderr.",
    input_schema: {
      type: "object" as const,
      properties: { cmd: { type: "string" } },
      required: ["cmd"],
    },
    run: (a: { cmd: string }) => {
      try {
        return execSync(a.cmd, { encoding: "utf8", stdio: "pipe" }) || "(sem saída)";
      } catch (e: any) {
        // comando falhou (ex: teste quebrado) — o erro É a informação útil
        return `exit code ${e.status}\n${e.stdout ?? ""}${e.stderr ?? ""}`;
      }
    },
  },
};

// Executa uma tool call que o modelo pediu e devolve o resultado no formato da API.
export function executar(call: Anthropic.ToolUseBlock): Anthropic.ToolResultBlockParam {
  console.log(`\n🔧 ${call.name}(${JSON.stringify(call.input)})`);

  let output: string;
  try {
    output = tools[call.name as keyof typeof tools].run(call.input as any);
  } catch (e: any) {
    output = `erro: ${e.message}`;
  }

  console.log(`   │ ${output.trim().split("\n").slice(0, 6).join("\n   │ ")}`);

  return { type: "tool_result", tool_use_id: call.id, content: output };
}
