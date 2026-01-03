import type { Rule } from "../types/rules";
import type { Issue } from "../types/results";
import { getAccessibleText, getAttr, hasAttr, walkWithAncestors } from "./utils";

export const routerLinkTextRule: Rule = {
  id: "routerlink-text",
  description: "Router links need an accessible name.",
  severity: "error",
  check: (ast, context) => {
    const issues: Issue[] = [];

    walkWithAncestors(ast, (node) => {
      if (node.type !== "element" || node.tagName !== "a") return;
      if (!hasAttr(node, "routerLink") && !hasAttr(node, "[routerLink]")) return;

      const ariaLabel = getAttr(node, "aria-label");
      const text = getAccessibleText(node).replace(/\s+/g, " ").trim();

      if (!(typeof ariaLabel === "string" && ariaLabel.trim().length > 0) && text.length === 0) {
        issues.push({
          ruleId: "routerlink-text",
          message: "Router links need text or aria-label for an accessible name.",
          filePath: context.filePath,
          line: node.loc?.line,
          column: node.loc?.column,
          severity: "error"
        });
      }
    });

    return issues;
  }
};
