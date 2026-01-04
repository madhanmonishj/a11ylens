export interface SourceLocation {
  line: number;
  column: number;
}

export type Node = ElementNode | TextNode;

export interface RootNode {
  type: "root";
  children: Node[];
}

export interface ElementNode {
  type: "element";
  tagName: string;
  attrs: Record<string, string | true>;
  children: Node[];
  loc?: SourceLocation;
}

export interface TextNode {
  type: "text";
  value: string;
  loc?: SourceLocation;
}

const voidTags = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);

const buildLineMap = (input: string): number[] => {
  const lineStarts = [0];

  for (let i = 0; i < input.length; i += 1) {
    if (input[i] === "\n") {
      lineStarts.push(i + 1);
    }
  }

  return lineStarts;
};

const getLocation = (lineStarts: number[], index: number): SourceLocation => {
  let low = 0;
  let high = lineStarts.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const start = lineStarts[mid];
    const nextStart = mid + 1 < lineStarts.length ? lineStarts[mid + 1] : Number.MAX_SAFE_INTEGER;

    if (index >= start && index < nextStart) {
      return { line: mid + 1, column: index - start + 1 };
    }

    if (index < start) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return { line: 1, column: 1 };
};

const parseAttributes = (attrText: string): Record<string, string | true> => {
  const attrs: Record<string, string | true> = {};
  const attrRegex = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null = null;

  while ((match = attrRegex.exec(attrText)) !== null) {
    const name = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? match[5];
    attrs[name] = value === undefined ? true : value;
  }

  return attrs;
};

export const parseTemplate = (input: string): RootNode => {
  const root: RootNode = { type: "root", children: [] };
  const stack: ElementNode[] = [];
  const tagRegex = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*?>/g;
  const lineStarts = buildLineMap(input);

  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  const pushNode = (node: Node): void => {
    const parent = stack[stack.length - 1];

    if (parent) {
      parent.children.push(node);
    } else {
      root.children.push(node);
    }
  };

  while ((match = tagRegex.exec(input)) !== null) {
    const token = match[0];
    const index = match.index;

    if (index > lastIndex) {
      const textValue = input.slice(lastIndex, index);

      if (textValue.length > 0) {
        pushNode({
          type: "text",
          value: textValue,
          loc: getLocation(lineStarts, lastIndex)
        });
      }
    }

    lastIndex = index + token.length;

    if (token.startsWith("<!--")) {
      continue;
    }

    const isEndTag = token.startsWith("</");
    const isSelfClosing = token.endsWith("/>");

    if (isEndTag) {
      const name = token.slice(2, -1).trim().toLowerCase();

      while (stack.length > 0) {
        const current = stack.pop();
        if (current && current.tagName === name) break;
      }
      continue;
    }

    const content = token.slice(1, isSelfClosing ? -2 : -1).trim();
    if (content.length === 0) continue;

    const firstSpace = content.indexOf(" ");
    const tagName = (firstSpace === -1 ? content : content.slice(0, firstSpace)).toLowerCase();
    const attrText = firstSpace === -1 ? "" : content.slice(firstSpace + 1);

    const element: ElementNode = {
      type: "element",
      tagName,
      attrs: parseAttributes(attrText),
      children: [],
      loc: getLocation(lineStarts, index)
    };

    pushNode(element);

    if (!isSelfClosing && !voidTags.has(tagName)) {
      stack.push(element);
    }
  }

  if (lastIndex < input.length) {
    const textValue = input.slice(lastIndex);
    if (textValue.length > 0) {
      pushNode({
        type: "text",
        value: textValue,
        loc: getLocation(lineStarts, lastIndex)
      });
    }
  }

  return root;
};

export const traverse = (node: RootNode | Node, visit: (node: Node) => void): void => {
  if (node.type === "root") {
    for (const child of node.children) {
      traverse(child, visit);
    }
    return;
  }

  visit(node);

  if (node.type === "element") {
    for (const child of node.children) {
      traverse(child, visit);
    }
  }
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

export const findElementsByTag = (root: RootNode, tagName: string): ElementNode[] => {
  const matches: ElementNode[] = [];

  traverse(root, (node) => {
    if (node.type === "element" && node.tagName === tagName) {
      matches.push(node);
    }
  });

  return matches;
};
