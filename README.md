<pre align="center">
╔═╗┬ ┬╦  ┌─┐┌┐┌┌─┐
╠═╣└┬┘║  ├┤ │││└─┐
╩ ╩ ┴ ╩═╝└─┘┘└┘└─┘
</pre>

<p align="center"><strong>A11yLens</strong></p>
<p align="center">See your accessibility clearly.</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/a11ylens?color=blue&style=flat-square" />
  <img src="https://img.shields.io/npm/dm/a11ylens?style=flat-square" />
  <img src="https://img.shields.io/github/license/YOUR_USERNAME/a11ylens?style=flat-square" />
  <img src="https://img.shields.io/github/issues/YOUR_USERNAME/a11ylens?style=flat-square" />
</p>

---

# A11yLens

A11yLens is a zero-dependency static accessibility scanner for front-end projects.  
It analyzes template files (Angular external templates, inline templates, HTML fragments) and produces an **Accessibility Fingerprint Score** to help teams measure and improve accessibility over time.

---

## ✨ Features

- **Static Template Scanning**  
  Detects accessibility issues directly in component templates — no browser required.

- **Angular-Friendly**  
  Supports external `.component.html` and inline `template: \`...\`` blocks inside `.ts` files.

- **Zero Runtime Dependencies**  
  Lightweight, fast, secure.

- **Accessibility Fingerprint Score (0–100)**  
  Evaluate and track your project’s accessibility health.

- **CLI-First Design**  
  Optimized for CI pipelines, pre-commit hooks, and local development.

---

## 📦 Installation

### Global Install
```bash
npm install -g a11ylens
```

### Or use npx (no install required)
```bash
npx a11ylens ./src
```

---

## 🔍 Usage

Scan a project:

```bash
a11ylens path/to/project
```

Example output:

```
A11yLens
========

Scanned roots:
  - ./src

Files analyzed: 14
Accessibility score: 92 / 100
```

---

## 📁 Project Structure

```
src/
  cli/          # CLI entry point
  scanner/      # File walker, analyzers, extractors
  rules/        # Individual rule implementations + registry
  scoring/      # Accessibility scoring logic
  utils/        # Shared types, helpers
dist/
```

---

## 🧭 Roadmap

### **v1.0**
- Angular template scanning  
- Base rule set  
- Score generation  
- Human-readable CLI output  

### **v2.0**
- React JSX support  
- JSON/CI output  
- Configurable rules  
- More granular scoring  

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo  
2. Create a new branch  
3. Commit changes with clear messages  
4. Open a pull request  

Suggestions for new rules or framework support are especially welcome.

---

## 📄 License

A11yLens is released under the **MIT License**.  
See [`LICENSE`](./LICENSE) for details.

---

<p align="center">
  <strong>A11yLens – See your accessibility clearly.</strong>
</p>
