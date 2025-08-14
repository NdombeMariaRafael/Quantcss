import { Position, Token, TokenType } from "./types";

const isWhitespace = (ch: string) => /\s/.test(ch);
const isDigit = (ch: string) => /[0-9]/.test(ch);
const isIdentStart = (ch: string) => /[A-Za-z_\-]/.test(ch) || ch === "."; // inclui . para potenciais usos futuros
const isIdentChar = (ch: string) => /[A-Za-z0-9_\-]/.test(ch);
const isSelectorSafe = (ch: string) => /[A-Za-z0-9_\-:/.%!]/.test(ch);

export class Lexer {
  private i = 0;
  private line = 1;
  private col = 1;

  constructor(private input: string) {}

  private pos(): Position {
    return { offset: this.i, line: this.line, column: this.col };
  }

  private peek(n = 0) {
    return this.input[this.i + n];
  }

  private next(): string {
    const ch = this.input[this.i++];
    if (ch === "\n") { this.line++; this.col = 1; } else { this.col++; }
    return ch;
  }

  private make(type: TokenType, start: Position, end: Position, value?: string, raw?: string): Token {
    return { type, start, end, value, raw };
  }

  private skipLineComment() {
    // //
    while (this.i < this.input.length && this.peek() !== "\n") this.next();
  }

  private skipBlockComment() {
    // /* ... */
    this.next(); this.next(); // já consumiu "/*"
    while (this.i < this.input.length) {
      if (this.peek() === "*" && this.peek(1) === "/") { this.next(); this.next(); break; }
      this.next();
    }
  }

  private string(): Token {
    const quote = this.peek();
    const start = this.pos();
    let raw = this.next(); // abre aspas
    let val = "";

    while (this.i < this.input.length) {
      const ch = this.next();
      raw += ch;
      if (ch === "\\") { // escape
        const esc = this.next();
        raw += esc;
        val += ch + esc;
        continue;
      }
      if (ch === quote) break;
      val += ch;
    }
    return this.make("STRING", start, this.pos(), val, raw);
  }

  private numberOrDimension(): Token {
    const start = this.pos();
    let raw = "";
    let num = "";

    if (this.peek() === "+" || this.peek() === "-") { raw += this.next(); num += raw.at(-1); }
    while (isDigit(this.peek())) { const ch = this.next(); raw += ch; num += ch; }
    if (this.peek() === ".") {
      raw += this.next(); num += ".";
      while (isDigit(this.peek())) { const ch = this.next(); raw += ch; num += ch; }
    }

    // dimensão (px, rem, %, etc.)
    let unit = "";
    if (this.peek() && /[A-Za-z%]/.test(this.peek())) {
      while (this.peek() && /[A-Za-z%]/.test(this.peek())) { const ch = this.next(); raw += ch; unit += ch; }
      return this.make("DIMENSION", start, this.pos(), num + unit, raw);
    }

    return this.make("NUMBER", start, this.pos(), num, raw);
  }

  private functionOrIdent(): Token {
    const start = this.pos();
    let raw = "";
    let val = "";

    if (this.peek() === ".") { raw += this.next(); val += "."; } // não usamos por enquanto, mas mantemos

    if (!isIdentStart(this.peek()) && this.peek() !== "-") {
      // fallback IDENT (ex: --custom-prop inicia com -)
    }
    while (this.peek() && isIdentChar(this.peek())) {
      const ch = this.next();
      raw += ch; val += ch;
    }
    if (this.peek() === "(") {
      raw += this.next(); // (
      return this.make("FUNCTION", start, this.pos(), val, val + "(",);
    }
    return this.make("IDENT", start, this.pos(), val, raw);
  }

  private selectorChunk(): Token {
    // junta pedaços seguros até espaço, {, ou quebra de linha — útil para "hover:bg-red", "md:text-lg", "w-[23px]"
    const start = this.pos();
    let raw = "";
    while (this.i < this.input.length) {
      const ch = this.peek();
      if (ch === "[" ) {
        // capturar conteúdo entre colchetes, permitindo () dentro
        raw += this.next(); // [
        let depth = 1;
        while (this.i < this.input.length && depth > 0) {
          const c = this.next(); raw += c;
          if (c === "[") depth++;
          else if (c === "]") depth--;
          else if (c === "'" || c === '"') {
            // strings dentro dos colchetes
            const quote = c;
            while (this.i < this.input.length) {
              const s = this.next(); raw += s;
              if (s === "\\") { const e = this.next(); raw += e; continue; }
              if (s === quote) break;
            }
          } else if (c === "(") {
            let p = 1;
            while (this.i < this.input.length && p > 0) {
              const s = this.next(); raw += s;
              if (s === "(") p++;
              else if (s === ")") p--;
              else if (s === "'" || s === '"') {
                const quote = s;
                while (this.i < this.input.length) {
                  const t = this.next(); raw += t;
                  if (t === "\\") { const e = this.next(); raw += e; continue; }
                  if (t === quote) break;
                }
              }
            }
          }
        }
        continue;
      }
      if (!ch || isWhitespace(ch) || ch === "{" || ch === "}" || ch === ";" ) break;
      if (!isSelectorSafe(ch) && ch !== "[" && ch !== "]") break;
      raw += this.next();
    }
    return this.make("SELECTOR_CHUNK", start, this.pos(), raw, raw);
  }

  *tokenize(): Generator<Token, Token, void> {
    while (this.i < this.input.length) {
      const ch = this.peek();

      // comentários
      if (ch === "/" && this.peek(1) === "/") { this.skipLineComment(); continue; }
      if (ch === "/" && this.peek(1) === "*") { this.skipBlockComment(); continue; }

      // espaços (em geral ignoramos, mas é útil no parser em contextos)
      if (isWhitespace(ch)) {
        const start = this.pos(); let raw = "";
        while (this.i < this.input.length && isWhitespace(this.peek())) raw += this.next();
        yield this.make("WHITESPACE", start, this.pos(), raw, raw);
        continue;
      }

      const start = this.pos();
      if (ch === "{") { this.next(); yield this.make("LBRACE", start, this.pos()); continue; }
      if (ch === "}") { this.next(); yield this.make("RBRACE", start, this.pos()); continue; }
      if (ch === "(") { this.next(); yield this.make("LPAREN", start, this.pos()); continue; }
      if (ch === ")") { this.next(); yield this.make("RPAREN", start, this.pos()); continue; }
      if (ch === "[") { this.next(); yield this.make("LBRACKET", start, this.pos()); continue; }
      if (ch === "]") { this.next(); yield this.make("RBRACKET", start, this.pos()); continue; }
      if (ch === ":") { this.next(); yield this.make("COLON", start, this.pos()); continue; }
      if (ch === ";") { this.next(); yield this.make("SEMICOLON", start, this.pos()); continue; }
      if (ch === ",") { this.next(); yield this.make("COMMA", start, this.pos()); continue; }
      if (ch === "!") { this.next(); yield this.make("BANG", start, this.pos()); continue; }
      if (ch === "@") { this.next(); yield this.make("AT", start, this.pos()); continue; }
      if (ch === "#") { this.next(); yield this.make("HASH", start, this.pos(), "#", "#"); continue; }
      if (ch === "'" || ch === '"') { yield this.string(); continue; }
      if (isDigit(ch) || ((ch === "+" || ch === "-") && isDigit(this.peek(1)))) { yield this.numberOrDimension(); continue; }

      // em contexto de seletor antes de {, usamos SELECTOR_CHUNK para aceitar coisas tipo md:hover:w-[10px]
      // em outros contextos o parser cairá para IDENT/FUNCTION.
      // aqui preferimos SELECTOR_CHUNK (é flexível) – o parser decide quando usá-lo.
      if (isIdentStart(ch) || ch === "-" ) {
        // olhamos adiante: se até o próximo { não houver whitespace "crítico", tratamos como SELECTOR_CHUNK
        yield this.selectorChunk();
        continue;
      }

      // fallback: IDENT de 1 char
      const raw = this.next();
      yield this.make("IDENT", start, this.pos(), raw, raw);
    }
    const p = this.pos();
    return { type: "EOF", start: p, end: p } as Token;
  }
}

export function lex(input: string): Token[] {
  const lx = new Lexer(input);
  const tokens: Token[] = [];
  for (const t of lx.tokenize()) {
    if (t.type !== "WHITESPACE") tokens.push(t); // descartamos espaços por padrão
  }
  tokens.push({ type: "EOF", start: {offset: input.length, line: lx["line"], column: lx["col"]}, end: {offset: input.length, line: lx["line"], column: lx["col"]} });
  return tokens;
}
