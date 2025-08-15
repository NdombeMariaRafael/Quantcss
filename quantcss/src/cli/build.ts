import fs from "fs";
import { lex } from "../lexer";
import { Parser } from "../parser";
import { collectFlatRules } from "../ast";
import { scanProject } from "../detector/scan";
import { compileJIT } from "../jit/compiler";
import { emitCss } from "../jit/emit";
import { hashString } from "../jit/hash";
import { loadJitCache, saveJitCache } from "../jit/cache";

export async function runBuild() {
  const qsSource = fs.readFileSync("styles/utilities.qs","utf8");
  const qsHash   = hashString(qsSource);

  const { used } = await scanProject("./src");
  const usedHash = hashString(used.join("|"));

  // ----- cache (JIT) -----
  const cached = loadJitCache();
  if (cached && cached.hashQs === qsHash && cached.hashUsed === usedHash) {
    emitCss(cached.css, "./dist/quant.css", true);  // minify = true
    console.log("✅ build (cache): nenhum arquivo mudou");
    return;
  }

  // ----- build normal -----
  const parser = new Parser(lex(qsSource));
  const ast    = parser.parse();
  const flat   = collectFlatRules(ast);

  const cssRules = compileJIT(flat, used);

  // minify + write
  emitCss(cssRules, "./dist/quant.css", true);

  // salvar cache
  saveJitCache({
    hashQs: qsHash,
    hashUsed: usedHash,
    css: cssRules
  });

  console.log(`✅ build: ${cssRules.length} regras geradas`);
}
