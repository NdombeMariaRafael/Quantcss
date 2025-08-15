import fs from "fs";
import { lex } from "../lexer";
import { Parser } from "../parser";
import { collectFlatRules } from "../ast";
import { scanProject } from "../detector/scan";
import { compileJIT } from "../jit/compiler";
import { emitCss } from "../jit/emit";

export async function runBuild() {
  const qsSource = fs.readFileSync("styles/utilities.qs","utf8");
  const parser   = new Parser(lex(qsSource));
  const ast      = parser.parse();

  const flat     = collectFlatRules(ast);

  const { used } = await scanProject("./src");
  const cssRules = compileJIT(flat, used);

  emitCss(cssRules, "./dist/quant.css");

  console.log(`✅ build: ${cssRules.length} regras geradas`);
}
