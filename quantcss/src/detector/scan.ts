// src/detector/scan.ts
import fs from "fs/promises";
import path from "path";
import { extractClasses } from "./extract";
import {
  loadCache,
  saveCache,
  cleanStaleEntries,
  getCached,
  updateCache
} from "./cache";
import { isKnownProp } from "../catalog/known-props";

/** Recursivamente retorna todos arquivos dentro de um diretório  */
async function listFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return await listFiles(full);
      }
      return full;
    })
  );
  return files.flat();
}

export async function scanProject(rootDir: string, noCache = false) {
  const cache = loadCache();
  const used  = new Set<string>();

  cleanStaleEntries(cache);

  const files: string[] = await listFiles(rootDir);

  await Promise.all(
    files.map(async (file: string) => {
        
      if (!/\.(html?|jsx?|tsx?|vue|svelte|pug)$/.test(file)) return;

      const cached = getCached(file, cache, noCache);
      if (cached) {
        cached.forEach((c) => used.add(c));
        return;
      }

      const src = await fs.readFile(file, "utf8");
      const classes = extractClasses(src);
      classes.forEach((c) => used.add(c));
      updateCache(file, classes, cache);
    })
  );

  saveCache(cache);

  // cruzar com catálogo de propriedades/conhecidas
  const unknown = [...used].filter(c => !isKnownProp(c.split(":").pop()!));

  return {
    used: [...used],
    unknown
  };
}
