export type MatchMode = "flex" | "strict";

/** Normaliza seletor removendo variantes (sm:hover:bg-red → bg-red). */
export function normalizeSelector(sel: string): string {
  return sel.split(":").pop()!.trim();
}

/** Extrai todos os prefixos de uma classe (ex: "sm:hover:bg-red" → ["sm", "hover"])  */
export function extractPrefixes(sel: string): string[] {
  const parts = sel.split(":");
  return parts.length > 1 ? parts.slice(0, -1) : [];
}

/**
 * Verifica se uma regra deve ser gerada.
 * - modo "flex"  -> compara apenas o seletor base
 * - modo "strict"-> compara seletor base + prefixos
 */
export function matchSelector(
  ruleSel: string,
  used: Set<string>,
  mode: MatchMode = "flex"
): boolean {
  const baseRule = normalizeSelector(ruleSel);

  for (const cls of used) {
    const baseUsed = normalizeSelector(cls);
    if (baseUsed !== baseRule) continue;

    if (mode === "flex") {
      return true;
    }
    // strict mode: comparar também os prefixos
    const prefixesRule = extractPrefixes(ruleSel);
    const prefixesUsed = extractPrefixes(cls);
    if (prefixesRule.join(":") === prefixesUsed.join(":")) {
      return true;
    }
  }
  return false;
}
