import type { StyleDeclaration } from "../types/style";

export interface CssRule {
  selectors: string[];
  declarations: StyleDeclaration;
}

export const parseCss = (input: string): CssRule[] => {
  const rules: CssRule[] = [];
  const blockRegex = /([^{}]+)\{([^{}]+)\}/g;
  let match: RegExpExecArray | null = null;

  while ((match = blockRegex.exec(input)) !== null) {
    const selectorText = match[1].trim();
    const body = match[2].trim();
    if (!selectorText || !body) continue;

    const selectors = selectorText
      .split(",")
      .map((selector) => selector.trim())
      .filter((selector) => selector.length > 0);

    const declarations = parseDeclarations(body);
    if (selectors.length === 0 || Object.keys(declarations).length === 0) continue;

    rules.push({ selectors, declarations });
  }

  return rules;
};

export const parseInlineStyle = (styleValue: string): StyleDeclaration => {
  const declarations = parseDeclarations(styleValue);
  return declarations;
};

const parseDeclarations = (body: string): StyleDeclaration => {
  const entries = body.split(";");
  const declarations: StyleDeclaration = {};

  for (const entry of entries) {
    const [rawKey, rawValue] = entry.split(":").map((part) => part.trim());
    if (!rawKey || !rawValue) continue;

    const key = rawKey.toLowerCase();
    if (key === "color") declarations.color = rawValue;
    if (key === "background-color") declarations.backgroundColor = rawValue;
    if (key === "font-size") declarations.fontSize = rawValue;
    if (key === "font-weight") declarations.fontWeight = rawValue;
  }

  return declarations;
};
