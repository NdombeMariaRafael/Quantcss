import fs from "fs";
import path from "path";

/**
 * Grava o CSS final no disco.
 */
export function emitCss(rules: string[], outputPath: string) {
  const css = rules.join("\n");
  const dir = path.dirname(outputPath);

  // cria diretório se ainda não existir
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, css, "utf8");
}
