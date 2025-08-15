import fs from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), ".quant-jitcache.json");

export interface JitCache {
  hashQs: string;
  hashUsed: string;
  css: string[];
}

/** Carrega o cache da build JIT, se existir. */
export function loadJitCache(): JitCache | null {
  if (!fs.existsSync(CACHE_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) as JitCache;
  } catch {
    return null;
  }
}

/** Salva o cache de build JIT atual. */
export function saveJitCache(data: JitCache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}
