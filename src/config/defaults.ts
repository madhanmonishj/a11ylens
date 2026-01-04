import type { A11yLensConfig } from "../types/config";

export const defaultConfig: A11yLensConfig = {
  includePatterns: ["*.component.html", "*.component.ts"],
  ignoreDirs: ["node_modules", ".git", "dist"],
  ignorePatterns: [],
  styleFiles: []
};
