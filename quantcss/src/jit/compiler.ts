import { FlatRule } from "../ast";
import { normalizeSelector, matchSelector } from "./utils";

/**
 * Recebe regras planas (AST -> collectFlatRules) e a lista de classes usadas
 * Retorna um array de strings CSS prontos para serem emitidos
 */
export function compileJIT(flatRules: FlatRule[], usedClasses: string[]): string[] {
  const used = new Set(usedClasses.map(normalizeSelector));
  const output: string[] = [];

  for (const rule of flatRules) {
    const sel = normalizeSelector(rule.selector);

    if (!matchSelector(sel, used)) {
      // ignorar regra não usada
      continue;
    }

    // abre @rules externas se existirem
    let css = "";
    if (rule.atContext && rule.atContext.length > 0) {
      for (const ctx of rule.atContext) {
        css += `@${ctx.name} ${ctx.prelude}{`;
      }
    }

    // regra principal
    css += `.${sel}{`;
    for (const d of rule.declarations) {
      css += `${d.property}:${d.value};`;
    }
    css += "}";

    // fecha blocos @
    if (rule.atContext && rule.atContext.length > 0) {
      css += "}".repeat(rule.atContext.length);
    }

    output.push(css);
  }

  return output;
}
