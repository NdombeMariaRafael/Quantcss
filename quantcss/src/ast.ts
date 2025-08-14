import { ASTNode, AtRuleNode, ParseResult, RuleNode } from "./types";

export type Visitor = {
  Rule?: (node: RuleNode, parents: ASTNode[]) => void;
  AtRule?: (node: AtRuleNode, parents: ASTNode[]) => void;
};

export function walk(ast: ParseResult, visitor: Visitor) {
  const stack: ASTNode[] = [];
  const visit = (node: ASTNode) => {
    stack.push(node);
    if (node.type === "Rule") {
      visitor.Rule?.(node, [...stack]);
      node.children?.forEach(visit);
    } else if (node.type === "AtRule") {
      visitor.AtRule?.(node, [...stack]);
      node.block?.forEach(visit);
    }
    stack.pop();
  };
  ast.body.forEach(visit);
}

/**
 * Expande seletores aninhados com '&' combinando com o seletor do pai (recursivo).
 * Em QuantCSS, a regra pai é sempre utilitária (ex.: "btn"), então "&:hover" -> "btn:hover".
 */
export function expandNesting(ast: ParseResult): ParseResult {
  function resolveChildSelector(parentSel: string, childSel: string): string {
    if (childSel.includes("&")) return childSel.replaceAll("&", parentSel);
    // se o filho não usa &, tratamos como utilitário encadeado "parent child" (opção 1) ou composição "parent:child" (opção 2)
    // Para QuantCSS utilitário, a escolha mais natural é **composição**:
    return `${parentSel}${childSel.startsWith(":") ? "" : ":"}${childSel}`;
  }

  const clone: ParseResult = { type: "StyleSheet", body: [] };

  const copyRule = (r: RuleNode): RuleNode => ({
    type: "Rule",
    selector: r.selector,
    declarations: [...r.declarations],
    children: r.children ? [...r.children] : undefined,
    loc: r.loc
  });

  function flattenNode(node: ASTNode, parents: string[] = []): ASTNode[] {
    if (node.type === "Rule") {
      const base = copyRule(node);
      const out: ASTNode[] = [{
        ...base,
        // sem children; children serão “promovidos” a regras irmãs já expandidas
        children: undefined
      }];

      if (node.children?.length) {
        for (const child of node.children) {
          if (child.type === "Rule") {
            const sel = resolveChildSelector(node.selector, child.selector);
            const promoted = flattenNode({ ...child, selector: sel }, parents.concat(node.selector));
            out.push(...promoted);
          } else if (child.type === "AtRule") {
            // manter @rule e expandir internamente
            const inner = flattenNode(child, parents.concat(node.selector));
            out.push(...inner);
          }
        }
      }
      return out;
    } else {
      // AtRule: preservar estrutura, mas achatar internamente
      const block: ASTNode[] = [];
      node.block?.forEach(child => block.push(...flattenNode(child, parents)));
      return [{ ...node, block }];
    }
  }

  for (const n of ast.body) clone.body.push(...flattenNode(n));

  return clone;
}

/** Extrai todas as regras planas, protegendo o contexto das @rules ancestrais (útil ao JIT). */
export interface FlatRule {
  selector: string;
  declarations: RuleNode["declarations"];
  atContext: { name: string; prelude: string }[]; // ex.: [ {name:"media", prelude:"(min-width:768px)"} ]
  loc: RuleNode["loc"];
}

export function collectFlatRules(ast: ParseResult): FlatRule[] {
  const flat: FlatRule[] = [];
  function visit(node: ASTNode, ctx: { name: string; prelude: string }[]) {
    if (node.type === "Rule") {
      flat.push({
        selector: node.selector,
        declarations: node.declarations,
        atContext: ctx,
        loc: node.loc
      });
    } else {
      const next = ctx.concat({ name: node.name, prelude: node.prelude });
      node.block?.forEach(n => visit(n, next));
    }
  }
  ast.body.forEach(n => visit(n, []));
  return flat;
}
