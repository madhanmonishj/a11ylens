import * as path from "path";
import type { ProjectScanResult } from "../types/results";

export const reportConsole = (result: ProjectScanResult, cwd: string): void => {
  console.log("A11yLens");
  console.log("=======");
  console.log("");

  if (result.files.length === 0) {
    console.log("No matching files found.");
    return;
  }

  for (const file of result.files) {
    const relative = path.relative(cwd, file.filePath);
    console.log(relative || file.filePath);

    if (file.issues.length === 0) {
      console.log("  - No issues\n");
      continue;
    }

    for (const issue of file.issues) {
      const location = issue.line ? `:${issue.line}:${issue.column ?? 1}` : "";
      console.log(`  - [${issue.severity}] ${issue.ruleId}${location} ${issue.message}`);
    }

    console.log("");
  }

  console.log("Summary");
  console.log("-------");
  console.log(`Errors: ${result.totals.error}`);
  console.log(`Warnings: ${result.totals.warn}`);
  console.log(`Info: ${result.totals.info}`);
  console.log(`Score: ${result.score} / 100`);
};
