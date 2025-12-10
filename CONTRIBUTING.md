# Contributing to A11yLens

Thank you for your interest in contributing!  
Please follow these guidelines to keep development smooth and organized.

## How to Contribute
1. Fork the repository
2. Create a feature branch
3. Commit descriptive messages
4. Submit a pull request

## Requirements
- Follow the project structure
- Keep PRs focused and small
- Add documentation for new features

## Git workflow

We use a lightweight GitHub Flow style:

- `main` is always stable and release-ready.
- All changes go through short-lived branches and PRs.

### Branch naming

Use descriptive, kebab-case branch names:

- Features: `feature/<short-description>`
  - e.g. `feature/angular-template-rules`
- Fixes: `fix/<short-description>`
  - e.g. `fix/cli-empty-root-crash`
- Chores: `chore/<short-description>`
  - e.g. `chore/update-deps`
- Docs: `docs/<short-description>`
  - e.g. `docs/readme-usage-section`

### Commit messages

We follow the Conventional Commits style:

Format:

`<type>(optional-scope): <short summary>`

Common types:

- `feat` – new feature
- `fix` – bug fix
- `docs` – docs only
- `chore` – tooling, deps, config
- `refactor` – refactor without features/fixes
- `test` – tests only
- `build` – build/CI/package related

Examples:

- `feat(rule-engine): add registry for angular rules`
- `fix(scanner): ignore dist and node_modules folders`
- `docs: update README with CLI usage`
- `chore: bump typescript to 5.6`

Keep subjects short and written in the imperative mood (e.g. `add`, `fix`, `update`).


Thank you for helping improve A11yLens!