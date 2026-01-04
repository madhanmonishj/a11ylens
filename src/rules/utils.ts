import type { ElementNode, Node, RootNode } from "../parser/ast";

export const getAttr = (node: ElementNode, name: string): string | true | undefined => {
  return node.attrs[name];
};

export const hasAttr = (node: ElementNode, name: string): boolean => {
  return Object.prototype.hasOwnProperty.call(node.attrs, name);
};

export const getTextContent = (node: RootNode | Node): string => {
  if (node.type === "root") {
    return node.children.map(getTextContent).join("");
  }

  if (node.type === "text") {
    return node.value;
  }

  return node.children.map(getTextContent).join("");
};

const iconTags = new Set(["i", "svg", "mat-icon", "fa-icon"]);

export const getAccessibleText = (node: RootNode | Node): string => {
  if (node.type === "root") {
    return node.children.map(getAccessibleText).join("");
  }

  if (node.type === "text") {
    return node.value;
  }

  if (iconTags.has(node.tagName)) {
    return "";
  }

  return node.children.map(getAccessibleText).join("");
};

export const walkWithAncestors = (
  node: RootNode | Node,
  visit: (node: Node, ancestors: ElementNode[]) => void,
  ancestors: ElementNode[] = []
): void => {
  if (node.type === "root") {
    for (const child of node.children) {
      walkWithAncestors(child, visit, ancestors);
    }
    return;
  }

  visit(node, ancestors);

  if (node.type === "element") {
    const nextAncestors = [...ancestors, node];
    for (const child of node.children) {
      walkWithAncestors(child, visit, nextAncestors);
    }
  }
};
