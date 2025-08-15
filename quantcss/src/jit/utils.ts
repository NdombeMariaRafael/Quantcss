/**
 * Normaliza seletores utilitários removendo variantes
 * (ex.: "md:hover:bg-red" => "bg-red").
 */
export function normalizeSelector(sel: string): string {
  const parts = sel.split(":");
  return parts[parts.length - 1];
}

/**
 * Verifica se o seletor da regra (já normalizado) corresponde a
 * uma classe usada. Aceita também caso a classe usada possua
 * prefixo/variante (ex.: usado = sm:bg-red ⇒ regra = bg-red deve ser gerada).
 */
export function matchSelector(ruleSel: string, used: Set<string>): boolean {
  if (used.has(ruleSel)) return true;

  for (const cls of used) {
    const base = normalizeSelector(cls);
    if (base === ruleSel) return true;
  }
  return false;
}
