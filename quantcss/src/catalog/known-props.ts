// src/catalog/known-props.ts
// Catálogo local de propriedades CSS para o QuantCSS
// Fonte: MDN + W3C (2024)
// Inclui propriedades padrão, lógicas, experimentais e custom props (--foo)

export const KNOWN_PROPS = new Set<string>([
  // Layout e Box Model
  "all", "display", "position", "top", "right", "bottom", "left", "inset",
  "float", "clear", "z-index", "box-sizing",
  "width", "min-width", "max-width",
  "height", "min-height", "max-height",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "overflow", "overflow-x", "overflow-y", "clip", "clip-path",

  // Bordas
  "border", "border-width", "border-style", "border-color",
  "border-top", "border-top-width", "border-top-style", "border-top-color",
  "border-right", "border-right-width", "border-right-style", "border-right-color",
  "border-bottom", "border-bottom-width", "border-bottom-style", "border-bottom-color",
  "border-left", "border-left-width", "border-left-style", "border-left-color",
  "border-radius", "border-top-left-radius", "border-top-right-radius",
  "border-bottom-right-radius", "border-bottom-left-radius",
  "border-image", "border-image-source", "border-image-slice", "border-image-width", "border-image-outset", "border-image-repeat",

  // Tipografia
  "color", "font", "font-family", "font-size", "font-style", "font-variant", "font-weight",
  "font-stretch", "line-height", "letter-spacing", "word-spacing",
  "text-align", "text-align-last", "text-decoration", "text-decoration-line", "text-decoration-style", "text-decoration-color",
  "text-transform", "text-indent", "white-space", "word-break", "word-wrap", "overflow-wrap",
  "direction", "unicode-bidi", "writing-mode",

  // Background
  "background", "background-color", "background-image", "background-position",
  "background-size", "background-repeat", "background-origin", "background-clip", "background-attachment",
  "background-blend-mode",

  // Efeitos visuais
  "box-shadow", "filter", "backdrop-filter", "opacity", "mix-blend-mode", "isolation",

  // Flexbox
  "flex", "flex-basis", "flex-direction", "flex-flow", "flex-grow", "flex-shrink",
  "flex-wrap", "justify-content", "align-content", "align-items", "align-self", "order",

  // Grid
  "grid", "grid-area", "grid-auto-columns", "grid-auto-flow", "grid-auto-rows",
  "grid-column", "grid-column-end", "grid-column-gap", "grid-column-start",
  "grid-gap", "grid-row", "grid-row-end", "grid-row-gap", "grid-row-start",
  "grid-template", "grid-template-areas", "grid-template-columns", "grid-template-rows",

  // Animação e transição
  "animation", "animation-delay", "animation-direction", "animation-duration",
  "animation-fill-mode", "animation-iteration-count", "animation-name",
  "animation-play-state", "animation-timing-function",
  "transition", "transition-delay", "transition-duration",
  "transition-property", "transition-timing-function",

  // Transform
  "transform", "transform-box", "transform-origin", "transform-style", "perspective", "perspective-origin",

  // Variáveis CSS
  "--*",

  // Outras utilitárias
  "cursor", "pointer-events", "resize", "user-select", "visibility",
  "appearance", "accent-color", "scroll-behavior", "scroll-snap-align", "scroll-snap-type",
  "will-change", "contain", "contain-intrinsic-size", "object-fit", "object-position",

  // Conteúdo gerado
  "content", "quotes", "counter-reset", "counter-increment", "list-style", "list-style-type", "list-style-position", "list-style-image",
]);

export function isKnownProp(prop: string): boolean {
  if (prop.startsWith("--")) return true; // sempre aceita custom props
  return KNOWN_PROPS.has(prop);
}
