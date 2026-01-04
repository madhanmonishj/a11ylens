import * as fs from "fs";
import * as path from "path";
import { defaultConfig } from "./defaults";
import type { A11yLensConfig, A11yLensConfigOverrides } from "../types/config";

const configFileNames = [".a11ylensrc.json", "a11ylens.config.json"];

export interface LoadedConfig {
  config: A11yLensConfig;
  configPath?: string;
}

export const loadConfig = (
  cwd: string,
  configPath?: string,
  overrides?: A11yLensConfigOverrides
): LoadedConfig => {
  const resolvedCwd = path.resolve(cwd);
  const discoveredPath = configPath ? path.resolve(configPath) : findConfigUpwards(resolvedCwd);
  let fileConfig: A11yLensConfigOverrides = {};

  if (discoveredPath) {
    const content = readConfigFile(discoveredPath);
    if (content) {
      fileConfig = content;
    }
  }

  const merged = mergeConfig(defaultConfig, fileConfig, overrides ?? {});
  return { config: merged, configPath: discoveredPath };
};

export const mergeConfig = (
  base: A11yLensConfig,
  fileConfig: A11yLensConfigOverrides,
  overrides: A11yLensConfigOverrides
): A11yLensConfig => {
  return {
    includePatterns: normalizeStringArray(overrides.includePatterns ?? fileConfig.includePatterns ?? base.includePatterns),
    ignoreDirs: normalizeStringArray(overrides.ignoreDirs ?? fileConfig.ignoreDirs ?? base.ignoreDirs),
    ignorePatterns: normalizeStringArray(overrides.ignorePatterns ?? fileConfig.ignorePatterns ?? base.ignorePatterns),
    styleFiles: normalizeStringArray(overrides.styleFiles ?? fileConfig.styleFiles ?? base.styleFiles),
    minScore: overrides.minScore ?? fileConfig.minScore ?? base.minScore
  };
};

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((entry) => typeof entry === "string");
};

const findConfigUpwards = (startDir: string): string | undefined => {
  let current = startDir;

  while (true) {
    for (const name of configFileNames) {
      const candidate = path.join(current, name);
      if (fs.existsSync(candidate)) return candidate;
    }

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return undefined;
};

const readConfigFile = (configPath: string): A11yLensConfigOverrides | undefined => {
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return undefined;

    const record = parsed as Record<string, unknown>;
    const minScore = record.minScore;

    return {
      includePatterns: normalizeStringArray(record.includePatterns),
      ignoreDirs: normalizeStringArray(record.ignoreDirs),
      ignorePatterns: normalizeStringArray(record.ignorePatterns),
      styleFiles: normalizeStringArray(record.styleFiles),
      minScore: typeof minScore === "number" ? minScore : undefined
    };
  } catch {
    return undefined;
  }
};
