// src/jit/emit.ts
import fs from "fs";
import path from "path";

export function emitCss(rules: string[], outputPath: string, minify = false) {
  let css = rules.join(minify ? "" : "\n");
  if (minify) {
    // remove quebras de linha e múltiplos espaços
    css = css.replace(/\s+/g, " ");
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, css, "utf8");
}
