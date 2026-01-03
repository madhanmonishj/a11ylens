export type Severity = "info" | "warn" | "error";

export interface Issue {
  ruleId: string;
  message: string;
  filePath: string;
  line?: number;
  column?: number;
  severity: Severity;
}

export interface FileScanResult {
  filePath: string;
  issues: Issue[];
}

export interface ProjectScanResult {
  files: FileScanResult[];
  score: number;
  totals: {
    error: number;
    warn: number;
    info: number;
  };
}
