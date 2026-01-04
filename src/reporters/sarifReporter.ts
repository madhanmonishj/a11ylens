import * as path from "path";
import type { ProjectScanResult } from "../types/results";
import { builtInRules } from "../rules/registry";

const severityToLevel: Record<string, "error" | "warning" | "note"> = {
  error: "error",
  warn: "warning",
  info: "note"
};

export const reportSarif = (result: ProjectScanResult): string => {
  const rules = builtInRules.map((rule) => ({
    id: rule.id,
    name: rule.id,
    shortDescription: { text: rule.description },
    fullDescription: { text: rule.description }
  }));

  const sarif = {
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "a11ylens",
            informationUri: "https://github.com/madhanmonishj/a11ylens",
            rules
          }
        },
        results: result.files.flatMap((file) =>
          file.issues.map((issue) => ({
            ruleId: issue.ruleId,
            level: severityToLevel[issue.severity] ?? "warning",
            message: { text: issue.message },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: {
                    uri: normalizeFileUri(file.filePath)
                  },
                  region: issue.line
                    ? {
                        startLine: issue.line,
                        startColumn: issue.column ?? 1
                      }
                    : undefined
                }
              }
            ]
          }))
        )
      }
    ]
  };

  return JSON.stringify(sarif, null, 2);
};

const normalizeFileUri = (filePath: string): string => {
  const resolved = path.resolve(filePath);
  return resolved.replace(/\\/g, "/");
};
