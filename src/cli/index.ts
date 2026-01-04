#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { runA11yLens, resolveConfig } from "../engine/runA11yLens";
import { reportConsole } from "../reporters/consoleReporter";
import { reportJson } from "../reporters/jsonReporter";
import { reportSarif } from "../reporters/sarifReporter";
import type { OutputFormat } from "../types/config";

const printUsage = (): void => {
  console.log("Usage: a11ylens [roots...] [options]");
  console.log("");
  console.log("Options:");
  console.log("  --config <path>     Path to config file");
  console.log("  --format <format>   console | json | sarif");
  console.log("  --out <path>        Output file for json/sarif");
  console.log("  --min-score <n>     Minimum passing score");
  console.log("  --verbose           Extra logging");
  console.log("  --help              Show usage");
};

const parseArgs = (argv: string[]): {
  roots: string[];
  configPath?: string;
  format: OutputFormat;
  outPath?: string;
  minScore?: number;
  verbose: boolean;
} => {
  const roots: string[] = [];
  let configPath: string | undefined;
  let format: OutputFormat = "console";
  let outPath: string | undefined;
  let minScore: number | undefined;
  let verbose = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }

    if (arg.startsWith("--config")) {
      const value = readValue(arg, argv[i + 1]);
      if (value) {
        configPath = value;
        if (!arg.includes("=")) i += 1;
      }
      continue;
    }

    if (arg.startsWith("--format")) {
      const value = readValue(arg, argv[i + 1]);
      if (value === "console" || value === "json" || value === "sarif") {
        format = value;
      }
      if (!arg.includes("=")) i += 1;
      continue;
    }

    if (arg.startsWith("--out")) {
      const value = readValue(arg, argv[i + 1]);
      if (value) {
        outPath = value;
        if (!arg.includes("=")) i += 1;
      }
      continue;
    }

    if (arg.startsWith("--min-score")) {
      const value = readValue(arg, argv[i + 1]);
      if (value) {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
          minScore = parsed;
        }
        if (!arg.includes("=")) i += 1;
      }
      continue;
    }

    if (arg === "--verbose") {
      verbose = true;
      continue;
    }

    if (arg.startsWith("-")) {
      continue;
    }

    roots.push(arg);
  }

  if (roots.length === 0) {
    roots.push("src");
  }

  return { roots, configPath, format, outPath, minScore, verbose };
};

const readValue = (arg: string, nextArg?: string): string | undefined => {
  if (arg.includes("=")) {
    return arg.split("=").slice(1).join("=");
  }

  return nextArg;
};

const main = (): void => {
  const { roots, configPath, format, outPath, minScore, verbose } = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const overrides = minScore !== undefined ? { minScore } : undefined;
  const config = resolveConfig(cwd, configPath, overrides);

  if (verbose) {
    console.log("Config:", config);
  }

  try {
    const result = runA11yLens(roots, { cwd, configFilePath: configPath, overrides });

    if (format === "console") {
      reportConsole(result, cwd);
    } else if (format === "json") {
      const output = reportJson(result);
      writeOutput(output, outPath);
    } else if (format === "sarif") {
      const output = reportSarif(result);
      writeOutput(output, outPath);
    }

    if (config.minScore !== undefined && result.score < config.minScore) {
      process.exit(2);
    }
  } catch (error) {
    console.error(
      "Error running A11yLens:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
};

const writeOutput = (output: string, outPath?: string): void => {
  if (outPath) {
    fs.writeFileSync(outPath, output, "utf8");
    return;
  }

  console.log(output);
};

main();
