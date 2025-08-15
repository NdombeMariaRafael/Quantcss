// detector/extract.ts
const CLASS_REGEXES = [
  /(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)/g,
  /[:@]class\s*=\s*"(.*?)"/g,                        // Vue/Svelte :class=""
  /v-bind:class\s*=\s*"(.*?)"/g,                     // Vue v-bind
  /class:\s*([A-Za-z0-9_-]+)/g                       // <div class:active>
];

export function extractClasses(raw: string): string[] {
  // remove ${ ... } e {{ ... }} primeiro
  const cleaned = raw
    .replace(/\$\{[^}]+\}/g, "")     // template literals JS
    .replace(/\{\{[^}]+\}\}/g, "");  // moustache (Vue/Svelte)

  const found = new Set<string>();
  CLASS_REGEXES.forEach(rx => {
    let match;
    while ((match = rx.exec(cleaned))) {
      const value = match[1] || match[2] || match[3] || "";
      value.split(/\s+/).forEach(cls => {
        if (!cls) return;
        // concatenation fallback: 'bg-' + foo => detect prefix and add as possible
        if (/['"]\s*\+\s*[\w.]+/.test(value)) {
          const prefix = value.split("+")[0].replace(/['"]/g,"").trim();
          if (prefix) found.add(prefix);
        }
        found.add(cls.trim());
      });
    }
  });

  return [...found];
}
