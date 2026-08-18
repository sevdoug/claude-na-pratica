// A comunicação com o LLM. Só isso:
// manda o histórico + as ferramentas disponíveis, recebe a resposta.
import Anthropic from "@anthropic-ai/sdk";

try { process.loadEnvFile(); } catch {} // carrega o .env se existir (nativo do Node 20+)

const client = new Anthropic(); // lê ANTHROPIC_API_KEY do ambiente (ou do .env acima)

export type Mensagem = Anthropic.MessageParam;

type Ferramenta = {
  description: string;
  input_schema: Anthropic.Tool["input_schema"];
  run: (args: any) => string;
};

export const llm = {
  async chat(opts: { messages: Mensagem[]; tools: Record<string, Ferramenta> }) {
    const res = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      messages: opts.messages,
      // converte nossas ferramentas pro formato da API (name + description + schema)
      tools: Object.entries(opts.tools).map(([name, t]) => ({
        name,
        description: t.description,
        input_schema: t.input_schema,
      })),
    });

    // mostra o que o modelo disse
    for (const block of res.content) {
      if (block.type === "text") console.log(`\n🤖 ${block.text}`);
    }

    return {
      // a resposta inteira volta pro histórico (inclui as tool calls)
      message: { role: "assistant" as const, content: res.content },
      // as ferramentas que o modelo PEDIU pra executar neste turno
      toolCalls: res.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      ),
    };
  },
};
