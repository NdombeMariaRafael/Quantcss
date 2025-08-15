import fs from "fs";
import { lex } from "../lexer";
import { Parser } from "../parser";
import { validateAST } from "../validator";
import { scanProject } from "../detector/scan";

export async function runCheck() {
  // Validação da .qs
  const qsSource = fs.readFileSync("styles/utilities.qs","utf8");
  const parser   = new Parser(lex(qsSource));
  const ast      = parser.parse();
  const report   = validateAST(ast);

  const { used, unknown } = await scanProject("./src");

  console.log(`✔  ${report.errors.length} erros, ${report.warnings.length} warnings`);
  if (report.errors.length > 0) {
    report.errors.forEach(e => console.error(`[${e.code}] ${e.message}`));
  }

  if (unknown.length) {
    console.warn("\n⚠️  Classes usadas mas não definidas no .qs:");
    unknown.forEach(c => console.warn("  • " + c));
  }

  if (report.errors.length === 0 && unknown.length === 0) {
    console.log("✅ check: nenhum problema encontrado");
  }
}
