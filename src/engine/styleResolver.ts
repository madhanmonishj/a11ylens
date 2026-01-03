import type { ElementNode } from "../parser/ast";
import type { StyleDeclaration, StyleLookup } from "../types/style";
import { parseCss } from "../parser/css";

interface SelectorInfo {
  tag?: string;
  classes: string[];
}

const invalidSelectorChars = /[\\s>#:[\\]+~*]/;

const parseSelector = (selector: string): SelectorInfo | undefined => {
  if (invalidSelectorChars.test(selector)) return undefined;

  const parts = selector.split(".");
  const tag = parts[0] ? parts[0].toLowerCase() : undefined;
  const classes = parts.slice(1).filter((item) => item.length > 0);

  if (!tag && classes.length === 0) return undefined;
  return { tag, classes };
};

const matchSelector = (node: ElementNode, selector: SelectorInfo, classList: string[]): boolean => {
  if (selector.tag && selector.tag !== node.tagName) return false;
  if (selector.classes.length === 0) return true;

  for (const cls of selector.classes) {
    if (!classList.includes(cls)) return false;
  }

  return true;
};

const mergeStyles = (base: StyleDeclaration, next: StyleDeclaration): StyleDeclaration => {
  return {
    color: next.color ?? base.color,
    backgroundColor: next.backgroundColor ?? base.backgroundColor,
    fontSize: next.fontSize ?? base.fontSize,
    fontWeight: next.fontWeight ?? base.fontWeight
  };
};

export const buildStyleLookup = (styleSheets: string[]): StyleLookup => {
  const rules = styleSheets.flatMap((sheet) => parseCss(sheet));
  const ruleSelectors = rules.map((rule) => ({
    selectors: rule.selectors.map(parseSelector),
    declarations: rule.declarations
  }));

  return {
    getStyleFor: (node: ElementNode) => {
      const classAttr = node.attrs["class"];
      const classList = typeof classAttr === "string"
        ? classAttr.split(/\s+/).map((item) => item.trim()).filter(Boolean)
        : [];

      let resolved: StyleDeclaration = {};

      for (const rule of ruleSelectors) {
        for (const selector of rule.selectors) {
          if (!selector) continue;
          if (matchSelector(node, selector, classList)) {
            resolved = mergeStyles(resolved, rule.declarations);
            break;
          }
        }
      }

      return resolved;
    }
  };
};
