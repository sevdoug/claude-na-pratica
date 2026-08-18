// restaura o bug pra rodar a demo de novo
import fs from "node:fs";

fs.writeFileSync(
  new URL("./soma.js", import.meta.url),
  `// devia somar, mas alguém trocou o operador 🙃
export function soma(a, b) {
  return a - b;
}
`,
);

console.log("🔄 bug restaurado — pronto pra próxima demo");
