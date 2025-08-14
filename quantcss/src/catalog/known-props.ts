// Catálogo local inspirado no csstype (propriedades CSS comuns e amplamente suportadas)
// Usar Set para lookup rápido
export const KNOWN_PROPS = new Set<string>([
  // Layout
  "display","position","top","right","bottom","left","float","clear",
  "z-index","overflow","overflow-x","overflow-y","clip","visibility",

  // Box model
  "width","height","min-width","max-width","min-height","max-height",
  "margin","margin-top","margin-right","margin-bottom","margin-left",
  "padding","padding-top","padding-right","padding-bottom","padding-left",
  "border","border-width","border-style","border-color","border-top",
  "border-right","border-bottom","border-left","border-radius",
  "box-sizing","box-shadow","outline","outline-color","outline-offset",
  "outline-style","outline-width",

  // Background
  "background","background-color","background-image","background-repeat",
  "background-size","background-position","background-clip","background-attachment",
  "backdrop-filter","filter",

  // Typography
  "color","font","font-family","font-size","font-style","font-weight",
  "font-variant","font-stretch","letter-spacing","line-height","text-align",
  "text-decoration","text-decoration-color","text-decoration-line",
  "text-decoration-style","text-transform","white-space","word-break",
  "word-spacing","overflow-wrap","tab-size","direction",

  // Flexbox & Grid
  "flex","flex-basis","flex-direction","flex-flow","flex-grow","flex-shrink",
  "flex-wrap","align-items","align-content","align-self","justify-content",
  "justify-items","justify-self","place-items","place-content","place-self",
  "gap","row-gap","column-gap",
  "grid","grid-area","grid-template","grid-template-areas",
  "grid-template-columns","grid-template-rows",
  "grid-auto-columns","grid-auto-rows","grid-auto-flow",
  "grid-column","grid-column-start","grid-column-end",
  "grid-row","grid-row-start","grid-row-end",

  // Transforms & Transitions
  "transform","transform-origin","transform-style","perspective","perspective-origin",
  "transition","transition-delay","transition-duration","transition-property",
  "transition-timing-function",

  // Animation
  "animation","animation-delay","animation-direction","animation-duration",
  "animation-fill-mode","animation-iteration-count","animation-name",
  "animation-play-state","animation-timing-function",

  // Misc
  "cursor","opacity","resize","user-select","pointer-events","content",
]);

export function isKnownProp(prop: string): boolean {
  return KNOWN_PROPS.has(prop);
}
