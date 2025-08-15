// detector/extract.ts
const CLASS_REGEXES = [
  /(?:class|className)\s*=\s*("([^"]*)"|'([^']*)'|`([^`]*)`)/g,
  /[:@]class\s*=\s*"([^"]*)"/g,
  /v-bind:class\s*=\s*"([^"]*)"/g,
  /class:\s*([A-Za-z0-9_-]+)/g
];

export function extractClasses(raw: string): string[] {
  const cleaned = raw
    .replace(/\$\{[^}]+\}/g, "")
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/\n+/g, " ");

  const found = new Set<string>();

  for (const rx of CLASS_REGEXES) {
    let match;
    while ((match = rx.exec(cleaned))) {
      const value = match[2] || match[3] || match[4] || "";
      value.split(/\s+/).forEach(cls => {
        if (!cls) return;
        found.add(cls.trim());
      });
    }
  }

  return Array.from(found);
}
