import * as path from "path";
import * as fs from "fs";
import type { A11yLensConfig } from "../types/config";

export interface WalkOptions {
  includePatterns: string[];
  ignoreDirs: string[];
  ignorePatterns: string[];
}

export const fileSystemWalker = (rootDirs: string[], options: WalkOptions): string[] => {
  const results: string[] = [];

  for (const root of rootDirs) {
    if (!fs.existsSync(root)) continue;
    let stat: fs.Stats;

    try {
      stat = fs.statSync(root);
    } catch {
      continue;
    }

    if (!stat.isDirectory()) continue;
    const resolvedPath = path.resolve(root);
    walkDirectory(resolvedPath, options, results);
  }

  return results;
};

export const defaultWalkOptions = (config: A11yLensConfig): WalkOptions => ({
  includePatterns: config.includePatterns,
  ignoreDirs: config.ignoreDirs,
  ignorePatterns: config.ignorePatterns
});

const walkDirectory = (currentDir: string, options: WalkOptions, results: string[]): void => {
  if (shouldIgnorePath(currentDir, options)) return;
  let entries: fs.Dirent[];

  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      walkDirectory(fullPath, options, results);
    } else if (entry.isFile()) {
      if (
        matchesPattern(entry.name, options.includePatterns) &&
        !shouldIgnorePath(fullPath, options)
      ) {
        results.push(fullPath);
      }
    }
  }
};

const shouldIgnorePath = (p: string, options: WalkOptions): boolean => {
  const normalized = path.resolve(p);
  const parts = normalized.split(path.sep);

  for (const dirName of options.ignoreDirs) {
    if (parts.includes(dirName)) return true;
  }

  if (options.ignorePatterns.length > 0) {
    const normalizedPath = normalized.replace(/\\/g, "/");
    for (const pattern of options.ignorePatterns) {
      if (simpleMatch(normalizedPath, pattern) || simpleMatch(path.basename(normalized), pattern)) {
        return true;
      }
    }
  }

  return false;
};

const matchesPattern = (fileName: string, patterns: string[]): boolean => {
  for (const pattern of patterns) {
    if (simpleMatch(fileName, pattern)) return true;
  }

  return false;
};

const simpleMatch = (value: string, pattern: string): boolean => {
  if (pattern === "*") return true;

  const starIndex = pattern.indexOf("*");
  if (starIndex === -1) {
    return value === pattern || value.endsWith(pattern);
  }

  const first = pattern.slice(0, starIndex);
  const last = pattern.slice(starIndex + 1);

  if (first.length > 0 && !value.startsWith(first)) return false;
  if (last.length > 0 && !value.endsWith(last)) return false;

  return true;
};
