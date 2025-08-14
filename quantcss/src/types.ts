export type Position = { offset: number; line: number; column: number };

export type TokenType =
  | "LBRACE" | "RBRACE" | "LPAREN" | "RPAREN" | "LBRACKET" | "RBRACKET"
  | "COLON"  | "SEMICOLON" | "COMMA" | "BANG" | "AT" | "HASH"
  | "NUMBER" | "DIMENSION" | "STRING" | "FUNCTION" | "IDENT" | "WHITESPACE"
  | "SELECTOR_CHUNK" // pedaços de seletor (inclui :, -, [], /, etc.)
  | "EOF";

export interface Token {
  type: TokenType;
  value?: string;
  start: Position;
  end: Position;
  raw?: string; // útil para reconstrução fiel
}

export interface DeclarationNode {
  type: "Declaration";
  property: string; // incluindo custom props --x
  value: string; // valor já normalizado
  important?: boolean;
  loc: { start: Position; end: Position };
}

export interface RuleNode {
  type: "Rule";
  selector: string; // ex: "hover:bg-red", "md:text-lg", "w-[23.5rem]"
  declarations: DeclarationNode[];
  children?: (RuleNode | AtRuleNode)[]; // para aninhamento & e at-rules internos
  loc: { start: Position; end: Position };
}

export interface AtRuleNode {
  type: "AtRule";
  name: string; // media, supports, layer, variants, theme...
  prelude: string; // conteúdo entre @name e { (ou até ; se sem bloco)
  block?: (RuleNode | AtRuleNode)[]; // se tiver { ... }
  loc: { start: Position; end: Position };
}

export type ASTNode = RuleNode | AtRuleNode;

export interface ParseResult {
  type: "StyleSheet";
  body: ASTNode[];
}
