import { ASTNode, AtRuleNode, DeclarationNode, ParseResult, RuleNode, Token } from "./types";

class ParseError extends Error {
  constructor(message: string, public token: Token) {
    super(`${message} @ ${token.start.line}:${token.start.column}`);
  }
}

export class Parser {
  private i = 0;
  constructor(private tokens: Token[]) {}

  private peek(n = 0) { return this.tokens[this.i + n]; }
  private next() { return this.tokens[this.i++]; }
  private match(...types: Token["type"][]) {
    const t = this.peek();
    if (types.includes(t.type)) { this.next(); return t; }
    return null;
  }
  private expect(type: Token["type"], msg: string) {
    const t = this.next();
    if (t.type !== type) { throw new ParseError(msg, t); }
    return t;
  }

  parse(): ParseResult {
    const body: ASTNode[] = [];
    while (this.peek().type !== "EOF") {
      try {
        const node = this.parseTopLevel();
        if (node) body.push(node);
      } catch (err) {
        if (err instanceof ParseError) {
          // eslint-disable-next-line no-empty
        }
        this.sync();
      }
    }
    return { type: "StyleSheet", body };
  }

  private sync() {
    while (this.peek().type !== "EOF") {
      const t = this.next();
      if (t.type === "RBRACE" || t.type === "SEMICOLON") break;
    }
  }

  private parseTopLevel(): ASTNode | null {
    const t = this.peek();

    if (t.type === "AT") return this.parseAtRule();

    const selector = this.consumeSelector();
    const lbrace = this.expect("LBRACE", "Esperado { após seletor");
    const declarationsOrChildren = this.parseBlockContent();
    const rbrace = this.expect("RBRACE", "Esperado } ao final do bloco");

    const decls = declarationsOrChildren.filter(n => n.type === "Declaration") as DeclarationNode[];
    const children = declarationsOrChildren.filter(n => n.type !== "Declaration") as (RuleNode | AtRuleNode)[];
    const node: RuleNode = {
      type: "Rule",
      selector,
      declarations: decls,
      children: children.length ? children : undefined,
      loc: { start: lbrace.start, end: rbrace.end }
    };
    return node;
  }

  private consumeSelector(): string {
    const parts: string[] = [];
    while (true) {
      const t = this.peek();
      if (t.type === "SELECTOR_CHUNK" || t.type === "IDENT" || t.type === "HASH" || t.type === "NUMBER" || t.type === "DIMENSION" || t.type === "STRING") {
        parts.push(this.next().raw ?? this.tokens[this.i - 1].value ?? "");
        continue;
      }
      if (t.type === "LBRACE" || t.type === "EOF") break;
      if (t.type === "SEMICOLON" || t.type === "AT") break;
      if (t.type === "WHITESPACE") { this.next(); continue; }
      break;
    }
    const sel = parts.join("");
    if (!sel) throw new ParseError("Seletor vazio", this.peek());
    return sel;
  }

  private parseBlockContent(): (DeclarationNode | RuleNode | AtRuleNode)[] {
    const items: (DeclarationNode | RuleNode | AtRuleNode)[] = [];

    while (this.peek().type !== "RBRACE" && this.peek().type !== "EOF") {
      const t = this.peek();
      if (t.type === "AT") {
        items.push(this.parseAtRule());
        continue;
      }

      if (t.type === "SELECTOR_CHUNK" || t.type === "IDENT" || t.type === "HASH" || t.type === "STRING") {
        const sel = this.consumeSelector();
        if (this.peek().type === "LBRACE") {
          const l = this.next();
          const childItems = this.parseBlockContent();
          const r = this.expect("RBRACE", "Esperado } no bloco aninhado");
          const decls = childItems.filter(n => n.type === "Declaration") as DeclarationNode[];
          const kids = childItems.filter(n => n.type !== "Declaration") as (RuleNode | AtRuleNode)[];
          items.push({
            type: "Rule",
            selector: sel, declarations: decls, children: kids.length ? kids : undefined,
            loc: { start: l.start, end: r.end }
          });
          continue;
        }
      }

      const decl = this.parseDeclaration();
      if (decl) items.push(decl);

      if (this.peek().type === "SEMICOLON") this.next();
    }
    return items;
  }

  private parseDeclaration(): DeclarationNode {
    const propToken = this.expect("IDENT", "Esperado nome de propriedade");
    this.expect("COLON", "Esperado : após nome da propriedade");

    const valueParts: string[] = [];
    while (
      this.peek().type !== "SEMICOLON" &&
      this.peek().type !== "RBRACE" &&
      this.peek().type !== "EOF"
    ) {
      const t = this.next();
      valueParts.push(t.raw ?? t.value ?? "");
    }

    return {
      type: "Declaration",
      property: propToken.value ?? "",
      value: valueParts.join("").trim(),
      loc: { start: propToken.start, end: this.tokens[this.i - 1].end }
    };
  }

  private parseAtRule(): AtRuleNode {
    const at = this.expect("AT", "Esperado @");
    const nameTok = this.next();
    const name = (nameTok.value || nameTok.raw || "").toLowerCase();
    const preludeParts: string[] = [];

    while (this.peek().type !== "LBRACE" && this.peek().type !== "SEMICOLON" && this.peek().type !== "EOF") {
      const t = this.next();
      preludeParts.push(t.raw ?? t.value ?? "");
    }
    const prelude = preludeParts.join("").trim();

    if (this.peek().type === "SEMICOLON") {
      const semi = this.next();
      return {
        type: "AtRule",
        name, prelude,
        loc: { start: at.start, end: semi.end }
      };
    }

    const l = this.expect("LBRACE", `Esperado { após @${name}`);
    const block: (AtRuleNode | RuleNode)[] = [];
    while (this.peek().type !== "RBRACE" && this.peek().type !== "EOF") {
      const inner = this.parseTopLevel();
      if (inner) block.push(inner);
    }
    const r = this.expect("RBRACE", `Esperado } ao final de @${name}`);

    return {
      type: "AtRule",
      name,
      prelude,
      block,
      loc: { start: at.start, end: r.end }
    };
  }
}
