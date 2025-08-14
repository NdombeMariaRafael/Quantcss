// src/css-props.ts
// Catálogo local de propriedades CSS (base MDN 2025)
export const KNOWN_PROPS = new Set<string>([
  // Layout & Box Model
  "display", "position", "top", "right", "bottom", "left", "z-index",
  "float", "clear", "overflow", "overflow-x", "overflow-y",
  "box-sizing", "width", "min-width", "max-width",
  "height", "min-height", "max-height",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border", "border-width", "border-style", "border-color",
  "border-top", "border-right", "border-bottom", "border-left",
  "border-radius", "border-top-left-radius", "border-top-right-radius",
  "border-bottom-right-radius", "border-bottom-left-radius",
  "outline", "outline-width", "outline-style", "outline-color",

  // Typography
  "font", "font-family", "font-size", "font-style", "font-weight",
  "font-variant", "font-stretch", "line-height", "letter-spacing",
  "word-spacing", "white-space", "text-align", "text-transform",
  "text-decoration", "text-decoration-line", "text-decoration-style",
  "text-decoration-color", "text-indent", "vertical-align", "direction",
  "color",

  // Background
  "background", "background-color", "background-image",
  "background-repeat", "background-position", "background-size",
  "background-attachment", "background-clip", "background-origin",

  // Flexbox
  "flex", "flex-grow", "flex-shrink", "flex-basis", "flex-direction",
  "flex-wrap", "justify-content", "align-items", "align-content",
  "align-self", "gap", "row-gap", "column-gap", "order",

  // Grid
  "grid", "grid-template", "grid-template-columns", "grid-template-rows",
  "grid-template-areas", "grid-auto-columns", "grid-auto-rows",
  "grid-auto-flow", "grid-column", "grid-column-start", "grid-column-end",
  "grid-row", "grid-row-start", "grid-row-end", "grid-area",

  // Animations & Transitions
  "animation", "animation-name", "animation-duration",
  "animation-timing-function", "animation-delay",
  "animation-iteration-count", "animation-direction",
  "animation-fill-mode", "animation-play-state",
  "transition", "transition-property", "transition-duration",
  "transition-timing-function", "transition-delay",

  // Transform & Effects
  "transform", "transform-origin", "transform-style", "perspective",
  "perspective-origin", "backface-visibility",
  "filter", "box-shadow", "text-shadow", "opacity", "mix-blend-mode",

  // Table
  "border-collapse", "border-spacing", "caption-side", "empty-cells",
  "table-layout",

  // Lists
  "list-style", "list-style-type", "list-style-position", "list-style-image",

  // Content & Generated Content
  "content", "quotes", "counter-reset", "counter-increment",

  // Scroll & Overflow
  "scroll-behavior", "scroll-snap-type", "scroll-snap-align",
  "scroll-margin", "scroll-margin-top", "scroll-margin-right",
  "scroll-margin-bottom", "scroll-margin-left",
  "scroll-padding", "scroll-padding-top", "scroll-padding-right",
  "scroll-padding-bottom", "scroll-padding-left",

  // Other
  "cursor", "visibility", "pointer-events", "resize", "user-select",

  // CSS Variables
  "--*"
]);
