import assert from "node:assert";
import { soma } from "./soma.js";

assert.equal(soma(2, 2), 4, `soma(2, 2) devia ser 4, deu ${soma(2, 2)}`);
assert.equal(soma(10, 5), 15, `soma(10, 5) devia ser 15, deu ${soma(10, 5)}`);
assert.equal(soma(-1, 1), 0, `soma(-1, 1) devia ser 0, deu ${soma(-1, 1)}`);

console.log("✅ todos os testes passaram");
