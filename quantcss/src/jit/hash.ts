import crypto from "crypto";

/** Gera um hash estável de uma string (usado p/ cache incremental). */
export function hashString(value: string): string {
  return crypto.createHash("sha1").update(value).digest("hex");
}
