import { FlatRule } from "../ast";
import { matchSelector, MatchMode, normalizeSelector } from "./utils";

/**
 * Recebe regras planas (AST -> collectFlatRules) e a lista de classes usadas
 * Retorna um array de strings CSS prontos para serem emitidos
 *
 * @param flatRules    Regras planas do AST
 * @param usedClasses  Lista de classes detectadas no projeto
 * @param mode         "flex"   → ignora prefixos (default)
 *                      "strict"→ match exato (mesmo prefixo/variante)
 */
export function compileJIT(
  flatRules: FlatRule[],
  usedClasses: string[],
  mode: MatchMode = "flex"
): string[] {
  // no strict mode guardamos o Set como está; no flex, as normalizações são feitas no match
  const used = new Set(usedClasses);

  const output: string[] = [];

  for (const rule of flatRules) {
    const selector = rule.selector.trim();

    if (!matchSelector(selector, used, mode)) {
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
    const base = normalizeSelector(selector);
    css += `.${base}{`;
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
