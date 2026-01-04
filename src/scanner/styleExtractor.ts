import * as path from "path";
import { readFileContent } from "./fileAnalyzer";
import type { Issue } from "../types/results";

export interface StyleSource {
  id: string;
  filePath: string;
  content: string;
  kind: "external" | "inline";
  originFilePath: string;
}

export interface StyleExtractionResult {
  styles: StyleSource[];
  issues: Issue[];
}

const extractStringLiterals = (value: string): string[] => {
  const matches = [];
  const regex = /([`'"])([\s\S]*?)\1/g;
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(value)) !== null) {
    matches.push(match[2]);
  }

  return matches;
};

export const extractStyles = (filePath: string, content: string): StyleExtractionResult => {
  const styles: StyleSource[] = [];
  const issues: Issue[] = [];

  if (!filePath.endsWith(".component.ts")) {
    return { styles, issues };
  }

  const styleUrlsMatch = content.match(/styleUrls\s*:\s*\[([\s\S]*?)\]/);
  if (styleUrlsMatch) {
    const paths = extractStringLiterals(styleUrlsMatch[1]);
    for (const stylePath of paths) {
      const resolved = path.resolve(path.dirname(filePath), stylePath);
      const styleContent = readFileContent(resolved);
      if (!styleContent) {
        issues.push({
          ruleId: "style-extraction",
          message: `Unable to read styleUrl file: ${resolved}`,
          filePath,
          severity: "warn"
        });
        continue;
      }

      styles.push({
        id: resolved,
        filePath: resolved,
        content: styleContent,
        kind: "external",
        originFilePath: filePath
      });
    }
  }

  const stylesMatch = content.match(/styles\s*:\s*\[([\s\S]*?)\]/);
  if (stylesMatch) {
    const inlineStyles = extractStringLiterals(stylesMatch[1]);
    let index = 0;
    for (const inline of inlineStyles) {
      styles.push({
        id: `${filePath}#inline-style-${index}`,
        filePath,
        content: inline,
        kind: "inline",
        originFilePath: filePath
      });
      index += 1;
    }
  }

  return { styles, issues };
};
