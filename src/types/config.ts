export type OutputFormat = "console" | "json" | "sarif";

export interface A11yLensConfig {
  includePatterns: string[];
  ignoreDirs: string[];
  ignorePatterns: string[];
  styleFiles: string[];
  minScore?: number;
}

export type A11yLensConfigOverrides = Partial<A11yLensConfig>;
