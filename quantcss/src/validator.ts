// src/validator.ts
import { ParseResult, RuleNode, AtRuleNode, ASTNode } from "./types";
import { Diagnostic, ValidationResult } from "./diagnostics";
import { KNOWN_PROPS, isKnownProp } from "./catalog/known-props";

// Variantes conhecidas (extensível futuramente)
const KNOWN_VARIANTS = [
  "sm","md","lg","xl","hover","focus","active","disabled","dark"
];

// Regexs reutilizáveis
const reHex         = /^#([0-9a-fA-F]{3,8})$/;
const reNumber      = /^[+-]?\d+(\.\d+)?$/;
const reLength      = /^[+-]?\d+(\.\d+)?(px|rem|em|vh|vw|%|ch|ex|cm|mm|in|pt|pc)$/;
const reFuncColor   = /^(rgb|rgba|hsl|hsla)\(.+\)$/i;
const reVar         = /^var\(.+\)$/i;
const reString      = /^(['"]).*\1$/;
const reUrl         = /^url\((.+)\)$/i;
const reUtilitySel  = /^[A-Za-z0-9:_\-\[\]()/.'%!,]+$/;

const ALLOWED_AT = new Set(["media","supports","layer","variants","theme"]);

type Ctx = { push: (d: Diagnostic) => void };

// Criador de diagnósticos
function diag(
  sev: "error"|"warning"|"info",
  code: string,
  message: string,
  node: any,
  extra: Partial<Diagnostic> = {}
): Diagnostic {
  const loc = ("loc" in node) ? node.loc : { start: node.start, end: node.end };
  return { code, message, severity: sev, start: loc.start, end: loc.end, ...extra };
}

// Validação de seletores
function validateSelector(rule: RuleNode, ctx: Ctx) {
  const s = rule.selector.trim();
  if (!s) {
    ctx.push(diag("error","Q001","Seletor vazio.", rule));
    return;
  }
  if (!reUtilitySel.test(s)) {
    ctx.push(diag("warning","Q002","Seletor contém caracteres suspeitos.", rule));
  }

  // Valida variantes antes do seletor base
  const parts = s.split(":");
  parts.slice(0, -1).forEach(v => {
    if (!KNOWN_VARIANTS.includes(v) && !v.endsWith("]")) {
      ctx.push(diag("warning","Q006",`Variante '${v}' não reconhecida.`, rule));
    }
  });

  if (s.includes(",")) {
    ctx.push(diag("warning","Q003","Múltiplos seletores com vírgula não suportados.", rule));
  }

  // Balanceamento de colchetes
  const opens  = (s.match(/\[/g) || []).length;
  const closes = (s.match(/\]/g) || []).length;
  if (opens !== closes) {
    ctx.push(diag("error","Q004","Colchetes não balanceados no seletor.", rule));
  }
}

// Validação de declarações
function validateDeclaration(rule: RuleNode, ctx: Ctx) {
  const seenProps = new Map<string,string>();

  for (const d of rule.declarations) {
    const prop = d.property.trim();
    const val  = d.value.trim();

    // Propriedade vazia
    if (!prop) {
      ctx.push(diag("error","Q101","Propriedade vazia.", d));
      continue;
    }

    const isCustom = prop.startsWith("--");

    // Verifica se a propriedade existe no catálogo
    if (!isCustom && !isKnownProp(prop) && /^[A-Za-z-]+$/.test(prop)) {
      ctx.push(diag("warning","Q102","Propriedade desconhecida.", d, { property: prop }));
    }

    // Valor vazio
    if (!val) {
      ctx.push(diag("error","Q103","Valor vazio para a propriedade.", d));
      continue;
    }

    const maybeColor   = /(color|background|border-color|outline-color)$/i.test(prop);
    const maybeLength  = /(width|height|margin|padding|gap|left|right|top|bottom|border-radius|min-|max-|letter-spacing|line-height)/i.test(prop);
    const maybeContent = prop === "content";

    const isOk =
      reVar.test(val) ||
      (maybeColor && (reHex.test(val) || reFuncColor.test(val))) ||
      (maybeLength && (reLength.test(val) || reNumber.test(val))) ||
      (maybeContent && reString.test(val)) ||
      reUrl.test(val) ||
      [
        "auto","inherit","initial","unset","revert","none",
        "block","inline","flex","grid","relative","absolute",
        "fixed","sticky","bold","normal","center"
      ].includes(val) ||
      /^[a-zA-Z-]+\(.+\)$/.test(val);

    if (!isOk && !isCustom) {
      ctx.push(diag("warning","Q104","Valor possivelmente inválido.", d));
    }

    // Propriedade repetida
    if (seenProps.has(prop)) {
      ctx.push(diag("info","Q105","Propriedade repetida; última prevalece.", d));
    }
    seenProps.set(prop, val);

    // Segurança extra: javascript: e expression()
    const urlMatch = val.match(reUrl);
    if (urlMatch && /^javascript:/i.test(urlMatch[1])) {
      ctx.push(diag("error","Q191","URL com javascript: não permitido.", d));
    }
    if (/\bexpression\s*\(/i.test(val)) {
      ctx.push(diag("error","Q190","expression() não permitido.", d));
    }
  }
}

// Validação de at-rules
function validateAtRule(at: AtRuleNode, ctx: Ctx) {
  if (!ALLOWED_AT.has(at.name)) {
    ctx.push(diag("warning","Q301",`@${at.name} não suportado nativamente.`, at));
  }
  if ((at.name === "media" || at.name === "supports") && !at.prelude.trim()) {
    ctx.push(diag("error","Q302",`@${at.name} requer condição no prelude.`, at));
  }
}

// API pública
export function validateAST(ast: ParseResult): ValidationResult {
  const all: Diagnostic[] = [];
  const ctx: Ctx = { push: (d) => all.push(d) };
  for (const node of ast.body) walkNode(node, ctx);
  return {
    errors:   all.filter(d => d.severity === "error"),
    warnings: all.filter(d => d.severity === "warning"),
    infos:    all.filter(d => d.severity === "info"),
    all
  };
}

// Percorre AST
function walkNode(node: ASTNode, ctx: Ctx) {
  if (node.type === "Rule") {
    validateSelector(node, ctx);
    validateDeclaration(node, ctx);
    node.children?.forEach(c => walkNode(c, ctx));
  } else {
    validateAtRule(node, ctx);
    node.block?.forEach(c => walkNode(c, ctx));
  }
}
