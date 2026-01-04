import type { Issue } from "../types/results";
import type { Rule } from "../types/rules";
import type { RootNode } from "../parser/ast";

export const runRules = (
  rules: Rule[],
  ast: RootNode,
  filePath: string,
  source: string,
  styleLookup?: import("../types/style").StyleLookup
): Issue[] => {
  const issues: Issue[] = [];

  for (const rule of rules) {
    try {
      const results = rule.check(ast, { filePath, source, styleLookup });
      issues.push(...results.map((issue) => ({ ...issue, severity: issue.severity ?? rule.severity })));
    } catch {
      issues.push({
        ruleId: rule.id,
        message: `Rule ${rule.id} failed to execute.`,
        filePath,
        severity: "warn"
      });
    }
  }

  return issues;
};
