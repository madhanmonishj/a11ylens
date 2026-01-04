import type { Rule } from "../types/rules";
import type { Issue } from "../types/results";
import type { ElementNode } from "../parser/ast";
import { getAccessibleText, getAttr, walkWithAncestors } from "./utils";

const hasAccessibleName = (node: ElementNode): boolean => {
  const ariaLabel = getAttr(node, "aria-label");
  const text = getAccessibleText(node).replace(/\s+/g, " ").trim();
  return (typeof ariaLabel === "string" && ariaLabel.trim().length > 0) || text.length > 0;
};

export const imgAltRule: Rule = {
  id: "img-alt",
  description: "Images must have alternative text.",
  severity: "error",
  check: (ast, context) => {
    const issues: Issue[] = [];

    walkWithAncestors(ast, (node, ancestors) => {
      if (node.type !== "element" || node.tagName !== "img") return;

      const alt = getAttr(node, "alt");
      if (alt === undefined) {
        issues.push({
          ruleId: "img-alt",
          message: "Image elements must have an alt attribute.",
          filePath: context.filePath,
          line: node.loc?.line,
          column: node.loc?.column,
          severity: "error"
        });
        return;
      }

      if (alt === "") {
        const linkAncestor = ancestors.find((ancestor) => ancestor.tagName === "a");
        if (linkAncestor && !hasAccessibleName(linkAncestor)) {
          issues.push({
            ruleId: "img-alt",
            message: "Linked images with empty alt text need another accessible name.",
            filePath: context.filePath,
            line: node.loc?.line,
            column: node.loc?.column,
            severity: "warn"
          });
        }
      }
    });

    return issues;
  }
};
