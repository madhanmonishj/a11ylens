import * as path from "path";
import type { A11yLensConfig, A11yLensConfigOverrides } from "../types/config";
import type { ProjectScanResult, Issue } from "../types/results";
import { loadConfig } from "../config/loader";
import { fileSystemWalker, defaultWalkOptions } from "../scanner/fileWalker";
import { readFileContent } from "../scanner/fileAnalyzer";
import { extractTemplates } from "../scanner/templateExtractor";
import { extractStyles } from "../scanner/styleExtractor";
import { parseTemplate } from "../parser/ast";
import { runRules } from "../rules/engine";
import { builtInRules } from "../rules/registry";
import { buildStyleLookup } from "./styleResolver";

export interface RunOptions {
  cwd?: string;
  configFilePath?: string;
  overrides?: A11yLensConfigOverrides;
}

const severityWeights: Record<Issue["severity"], number> = {
  error: 5,
  warn: 2,
  info: 1
};

export const runA11yLens = (roots: string[], options: RunOptions = {}): ProjectScanResult => {
  const cwd = options.cwd ?? process.cwd();
  const { config, configPath } = loadConfig(cwd, options.configFilePath, options.overrides);
  const filePaths = fileSystemWalker(roots, defaultWalkOptions(config));
  const filePathSet = new Set(filePaths.map((filePath) => path.resolve(filePath)));
  const issueMap = new Map<string, Issue[]>();
  const styleMap = new Map<string, string[]>();
  const baseDir = configPath ? path.dirname(configPath) : cwd;
  const globalStyles: string[] = [];

  const addIssues = (filePath: string, issues: Issue[]): void => {
    if (issues.length === 0) return;
    const key = path.resolve(filePath);
    const existing = issueMap.get(key) ?? [];
    existing.push(...issues);
    issueMap.set(key, existing);
  };

  for (const filePath of filePaths) {
    issueMap.set(path.resolve(filePath), []);
  }

  for (const styleFile of config.styleFiles ?? []) {
    const resolved = path.resolve(baseDir, styleFile);
    const content = readFileContent(resolved);
    if (!content) {
      addIssues(resolved, [
        {
          ruleId: "style-extraction",
          message: `Unable to read style file: ${resolved}`,
          filePath: resolved,
          severity: "warn"
        }
      ]);
      continue;
    }
    globalStyles.push(content);
  }

  for (const filePath of filePaths) {
    if (!filePath.endsWith(".component.ts")) continue;
    const content = readFileContent(filePath);
    const extraction = extractStyles(filePath, content);
    addIssues(filePath, extraction.issues);

    const collected = styleMap.get(filePath) ?? [];
    for (const style of extraction.styles) {
      collected.push(style.content);
    }
    styleMap.set(filePath, collected);
  }

  for (const filePath of filePaths) {
    const content = readFileContent(filePath);
    const extraction = extractTemplates(filePath, content);
    addIssues(filePath, extraction.issues);

    for (const template of extraction.templates) {
      if (
        template.kind === "external" &&
        template.filePath !== filePath &&
        filePathSet.has(path.resolve(template.filePath))
      ) {
        continue;
      }

      const templateKey = path.resolve(template.filePath);
      if (!issueMap.has(templateKey)) {
        issueMap.set(templateKey, []);
      }

      const styleSheets = [
        ...globalStyles,
        ...(styleMap.get(template.originFilePath) ?? [])
      ];
      const styleLookup = buildStyleLookup(styleSheets);

      let ast;
      try {
        ast = parseTemplate(template.content);
      } catch {
        addIssues(template.filePath, [
          {
            ruleId: "template-parse",
            message: "Failed to parse template content.",
            filePath: template.filePath,
            severity: "warn"
          }
        ]);
        continue;
      }

      const issues = runRules(builtInRules, ast, template.filePath, template.content, styleLookup);
      addIssues(template.filePath, issues);
    }
  }

  const files = Array.from(issueMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([filePath, issues]) => ({ filePath, issues }));

  const totals = { error: 0, warn: 0, info: 0 };
  let score = 100;

  for (const { issues } of files) {
    for (const issue of issues) {
      totals[issue.severity] += 1;
      score -= severityWeights[issue.severity] ?? 0;
    }
  }

  score = Math.max(0, Math.min(100, score));

  return { files, score, totals };
};

export const resolveConfig = (
  cwd: string,
  configFilePath?: string,
  overrides?: A11yLensConfigOverrides
): A11yLensConfig => {
  return loadConfig(cwd, configFilePath, overrides).config;
};
