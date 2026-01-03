export { runA11yLens, resolveConfig } from "./engine/runA11yLens";
export { parseTemplate } from "./parser/ast";
export type { A11yLensConfig, A11yLensConfigOverrides, OutputFormat } from "./types/config";
export type { Issue, FileScanResult, ProjectScanResult, Severity } from "./types/results";
export type { Rule, RuleContext } from "./types/rules";
