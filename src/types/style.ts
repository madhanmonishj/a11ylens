export interface StyleDeclaration {
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontWeight?: string;
}

export interface StyleLookup {
  getStyleFor: (node: import("../parser/ast").ElementNode) => StyleDeclaration;
}
