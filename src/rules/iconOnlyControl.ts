import type { Rule } from "../types/rules";
import type { Issue } from "../types/results";
import type { ElementNode } from "../parser/ast";
import { getAccessibleText, getAttr, walkWithAncestors } from "./utils";

const iconTags = new Set(["i", "svg", "mat-icon", "fa-icon"]);

const hasText = (node: ElementNode): boolean => {
  const text = getAccessibleText(node).replace(/\s+/g, " ").trim();
  return text.length > 0;
};

const isOnlyIconChildren = (node: ElementNode): boolean => {
  const elementChildren = node.children.filter((child) => child.type === "element") as ElementNode[];

  if (elementChildren.length === 0) return false;

  for (const child of elementChildren) {
    if (!iconTags.has(child.tagName)) return false;
  }

  return true;
};

export const iconOnlyControlRule: Rule = {
  id: "icon-only-control",
  description: "Controls with only icons need accessible labels.",
  severity: "warn",
  check: (ast, context) => {
    const issues: Issue[] = [];

    walkWithAncestors(ast, (node) => {
      if (node.type !== "element") return;
      if (node.tagName !== "button" && node.tagName !== "a") return;

      const ariaLabel = getAttr(node, "aria-label");
      if (typeof ariaLabel === "string" && ariaLabel.trim().length > 0) return;
      if (hasText(node)) return;
      if (!isOnlyIconChildren(node)) return;

      issues.push({
        ruleId: "icon-only-control",
        message: "Icon-only controls need aria-label text.",
        filePath: context.filePath,
        line: node.loc?.line,
        column: node.loc?.column,
        severity: "warn"
      });
    });

    return issues;
  }
};
