import type { Rule } from "../types/rules";
import type { Issue } from "../types/results";
import type { ElementNode } from "../parser/ast";
import { getAttr, hasAttr, walkWithAncestors } from "./utils";

const isInteractive = (node: ElementNode): boolean => {
  if (node.tagName === "button") return true;
  if (node.tagName === "a") {
    return hasAttr(node, "href") || hasAttr(node, "routerLink") || hasAttr(node, "[routerLink]");
  }

  const role = getAttr(node, "role");
  if (typeof role === "string" && role.toLowerCase() === "button") return true;

  return hasAttr(node, "tabindex");
};

export const clickableNonSemanticRule: Rule = {
  id: "clickable-nonsemantic",
  description: "Non-semantic elements with click handlers should be accessible.",
  severity: "warn",
  check: (ast, context) => {
    const issues: Issue[] = [];

    walkWithAncestors(ast, (node) => {
      if (node.type !== "element") return;
      if (node.tagName !== "div" && node.tagName !== "span") return;
      if (!hasAttr(node, "(click)")) return;

      if (isInteractive(node)) return;

      issues.push({
        ruleId: "clickable-nonsemantic",
        message: "Clickable div/span needs semantic role or keyboard support.",
        filePath: context.filePath,
        line: node.loc?.line,
        column: node.loc?.column,
        severity: "warn"
      });
    });

    return issues;
  }
};
