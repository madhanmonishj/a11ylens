# A11yLens

A11yLens is a TypeScript Node.js CLI + library that scans Angular component templates (external `.component.html` and inline templates in `.component.ts`) for common accessibility issues. It reports findings in console, JSON, or SARIF formats and computes a project score.

No runtime dependencies are required.

## Install

```bash
npm install -g a11ylens
```

Or run via npx:

```bash
npx a11ylens ./src
```

## CLI

```bash
a11ylens [roots...] [options]
```

Options:

- `--config <path>`: Use a specific config file
- `--format <console|json|sarif>`: Output format (default: console)
- `--out <path>`: Write JSON/SARIF output to a file
- `--min-score <n>`: Exit non-zero when score is below `n`
- `--verbose`: Print extra diagnostics

Examples:

```bash
a11ylens ./src
npx a11ylens ./apps/admin --format json
npx a11ylens ./src --format sarif --out a11ylens.sarif --min-score 85
```

## Library API

```ts
import { runA11yLens } from "a11ylens";

const result = runA11yLens(["./src"], {
  cwd: process.cwd(),
  overrides: { minScore: 90 }
});

console.log(result.score);
```

## Configuration

A11yLens discovers config files by searching upward from the current working directory.

Supported files:

- `.a11ylensrc.json`
- `a11ylens.config.json`

Example:

```json
{
  "includePatterns": ["*.component.html", "*.component.ts"],
  "ignoreDirs": ["node_modules", ".git", "dist"],
  "ignorePatterns": ["**/legacy/**"],
  "styleFiles": ["./styles.css"],
  "minScore": 85
}
```

Notes:

- `includePatterns` and `ignorePatterns` use a minimal glob-like matcher (`*` prefix/suffix).
- `ignoreDirs` matches directory names anywhere in the path.
- `styleFiles` supports simple selectors (`.class`, `tag`, `tag.class`); complex selectors and CSS variables are ignored.

## Output Formats

- Console: human-friendly output with summary and score.
- JSON: machine-readable full results.
- SARIF: static analysis format for GitHub code scanning.

## Rules (Built-In)

- Note: rules are minimal and focus on common Angular template issues.
- `img-alt`: images require `alt`.
- `clickable-nonsemantic`: clickable div/span needs semantics.
- `routerlink-text`: router links need an accessible name.
- `icon-only-control`: icon-only controls need `aria-label`.
- `color-contrast`: text color must meet WCAG AA ratios when `color` and `background-color` are available (inline or simple class selectors).

## Exit Codes

- `0`: Success
- `1`: Runtime error
- `2`: `--min-score` provided and score is below the threshold

## CI Example (SARIF)

```yaml
name: A11yLens SARIF

on:
  workflow_dispatch:

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: node dist/cli/index.js ./src --format sarif --out a11ylens.sarif
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: a11ylens.sarif
```

## Development

```bash
npm run build
npm test
```

## License

MIT
