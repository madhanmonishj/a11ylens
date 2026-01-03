import * as path from "path";
import { readFileContent } from "./fileAnalyzer";
import type { Issue } from "../types/results";

export interface TemplateSource {
  id: string;
  filePath: string;
  content: string;
  kind: "external" | "inline";
  originFilePath: string;
}

export interface TemplateExtractionResult {
  templates: TemplateSource[];
  issues: Issue[];
}

export const extractTemplates = (filePath: string, content: string): TemplateExtractionResult => {
  const templates: TemplateSource[] = [];
  const issues: Issue[] = [];

  if (filePath.endsWith(".component.html")) {
    templates.push({
      id: filePath,
      filePath,
      content,
      kind: "external",
      originFilePath: filePath
    });

    return { templates, issues };
  }

  if (!filePath.endsWith(".component.ts")) {
    return { templates, issues };
  }

  const templateRegex = /template\s*:\s*([`'"])([\s\S]*?)\1/g;
  let match: RegExpExecArray | null = null;
  let inlineIndex = 0;

  while ((match = templateRegex.exec(content)) !== null) {
    const inlineContent = match[2];
    templates.push({
      id: `${filePath}#inline-${inlineIndex}`,
      filePath,
      content: inlineContent,
      kind: "inline",
      originFilePath: filePath
    });
    inlineIndex += 1;
  }

  const templateUrlRegex = /templateUrl\s*:\s*([`'"])([^`'"]+)\1/g;
  while ((match = templateUrlRegex.exec(content)) !== null) {
    const templateUrl = match[2];
    const resolved = path.resolve(path.dirname(filePath), templateUrl);
    const externalContent = readFileContent(resolved);

    if (!externalContent) {
      issues.push({
        ruleId: "template-extraction",
        message: `Unable to read templateUrl file: ${resolved}`,
        filePath,
        severity: "warn"
      });
      continue;
    }

    templates.push({
      id: resolved,
      filePath: resolved,
      content: externalContent,
      kind: "external",
      originFilePath: filePath
    });
  }

  if (templates.length === 0) {
    issues.push({
      ruleId: "template-extraction",
      message: "No Angular templates found in component file.",
      filePath,
      severity: "info"
    });
  }

  return { templates, issues };
};
