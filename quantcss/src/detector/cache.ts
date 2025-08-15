import fs from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), ".quantcache.json");

export interface CacheEntry {
  mtime: number;
  classes: string[];
}

export type CacheMap = Record<string, CacheEntry>;

export function loadCache(): CacheMap {
  if (!fs.existsSync(CACHE_FILE)) return {};

  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } catch {
    return {};
  }
}

export function saveCache(cache: CacheMap) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
}

export function fileKey(filePath: string): string {
  return path.relative(process.cwd(), filePath);
}

export function fileMtime(filePath: string): number {
  return fs.statSync(filePath).mtimeMs;
}

/** Remove do cache entradas cujo arquivo não existe mais  */
export function cleanStaleEntries(cache: CacheMap) {
  for (const key of Object.keys(cache)) {
    if (!fs.existsSync(path.join(process.cwd(), key))) {
      delete cache[key];
    }
  }
}

/** Retorna classes previamente cacheadas se o arquivo não mudou  */
export function getCached(
  filePath: string,
  cache: CacheMap,
  noCache?: boolean
): string[] | undefined {
  if (noCache) return undefined;

  const key = fileKey(filePath);
  const entry = cache[key];
  if (!entry) return undefined;

  if (fileMtime(filePath) !== entry.mtime) return undefined;
  return entry.classes;
}

export function updateCache(filePath: string, classes: string[], cache: CacheMap) {
  const key = fileKey(filePath);
  cache[key] = { classes, mtime: fileMtime(filePath) };
}
