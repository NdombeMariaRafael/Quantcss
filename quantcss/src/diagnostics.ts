import { Position } from "./types";

export type Severity = "error" | "warning" | "info";

export interface Diagnostic {
  code: string;              // ex: Q101
  message: string;           // texto amigável
  severity: Severity;        // error|warning|info
  start: Position;           // posição inicial
  end: Position;             // posição final
  hint?: string;             // dica breve
  selector?: string;         // seletor envolvido (se houver)
  property?: string;         // propriedade CSS (se houver)
  value?: string;            // valor CSS (se houver)
}

export interface ValidationResult {
  errors: Diagnostic[];
  warnings: Diagnostic[];
  infos: Diagnostic[];
  all: Diagnostic[];
}
