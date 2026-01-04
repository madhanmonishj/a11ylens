import type { ProjectScanResult } from "../types/results";

export const reportJson = (result: ProjectScanResult): string => {
  return JSON.stringify(result, null, 2);
};
