import type { Issue, Severity } from "./results";
import type { RootNode } from "../parser/ast";
import type { StyleLookup } from "./style";

export interface RuleContext {
  filePath: string;
  source: string;
  styleLookup?: StyleLookup;
}

export interface Rule {
  id: string;
  description: string;
  severity: Severity;
  check: (ast: RootNode, context: RuleContext) => Issue[];
}
