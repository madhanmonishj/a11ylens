import type { Rule } from "../types/rules";
import type { Issue } from "../types/results";
import type { ElementNode } from "../parser/ast";
import type { StyleDeclaration } from "../types/style";
import { parseInlineStyle } from "../parser/css";
import { getAccessibleText, getAttr, walkWithAncestors } from "./utils";

const parseHexChannel = (value: string): number | undefined => {
  const parsed = Number.parseInt(value, 16);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
};

const parseColor = (value: string): [number, number, number] | undefined => {
  const normalized = value.trim().toLowerCase();

  if (normalized.startsWith("#")) {
    const hex = normalized.slice(1);
    if (hex.length === 3) {
      const r = parseHexChannel(hex[0] + hex[0]);
      const g = parseHexChannel(hex[1] + hex[1]);
      const b = parseHexChannel(hex[2] + hex[2]);
      if (r === undefined || g === undefined || b === undefined) return undefined;
      return [r, g, b];
    }

    if (hex.length === 6) {
      const r = parseHexChannel(hex.slice(0, 2));
      const g = parseHexChannel(hex.slice(2, 4));
      const b = parseHexChannel(hex.slice(4, 6));
      if (r === undefined || g === undefined || b === undefined) return undefined;
      return [r, g, b];
    }

    return undefined;
  }

  const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(",").map((item) => item.trim());
    if (parts.length < 3) return undefined;
    const r = Number(parts[0]);
    const g = Number(parts[1]);
    const b = Number(parts[2]);
    if ([r, g, b].some((channel) => Number.isNaN(channel))) return undefined;
    return [clampChannel(r), clampChannel(g), clampChannel(b)];
  }

  return undefined;
};

const clampChannel = (value: number): number => {
  if (value < 0) return 0;
  if (value > 255) return 255;
  return Math.round(value);
};

const channelToLinear = (value: number): number => {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};

const luminance = (rgb: [number, number, number]): number => {
  const [r, g, b] = rgb.map(channelToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (fg: [number, number, number], bg: [number, number, number]): number => {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

const isLargeText = (styles: StyleDeclaration): boolean => {
  const fontSize = styles.fontSize;
  const fontWeight = styles.fontWeight;
  let sizePx: number | undefined;

  if (fontSize && fontSize.endsWith("px")) {
    const parsed = Number(fontSize.slice(0, -2));
    if (!Number.isNaN(parsed)) sizePx = parsed;
  }

  const weight = fontWeight ? Number(fontWeight) : undefined;
  const isBold = weight !== undefined && weight >= 700;

  if (sizePx === undefined) return false;
  if (sizePx >= 18) return true;
  if (isBold && sizePx >= 14) return true;
  return false;
};

const getInlineContrast = (node: ElementNode, styles: StyleDeclaration): { ratio: number; threshold: number } | undefined => {
  const colorValue = styles.color;
  const backgroundValue = styles.backgroundColor;

  if (!colorValue || !backgroundValue) return undefined;

  const fg = parseColor(colorValue);
  const bg = parseColor(backgroundValue);

  if (!fg || !bg) return undefined;

  const ratio = contrastRatio(fg, bg);
  const threshold = isLargeText(styles) ? 3 : 4.5;
  return { ratio, threshold };
};

const getResolvedStyles = (node: ElementNode, styleLookup?: { getStyleFor: (node: ElementNode) => StyleDeclaration }): StyleDeclaration => {
  const base = styleLookup ? styleLookup.getStyleFor(node) : {};
  const styleAttr = getAttr(node, "style");
  if (typeof styleAttr !== "string") return base;

  const inline = parseInlineStyle(styleAttr);
  return {
    color: inline.color ?? base.color,
    backgroundColor: inline.backgroundColor ?? base.backgroundColor,
    fontSize: inline.fontSize ?? base.fontSize,
    fontWeight: inline.fontWeight ?? base.fontWeight
  };
};

const getContrast = (node: ElementNode, styleLookup?: { getStyleFor: (node: ElementNode) => StyleDeclaration }): { ratio: number; threshold: number } | undefined => {
  const resolved = getResolvedStyles(node, styleLookup);
  return getInlineContrast(node, resolved);
};

export const contrastRatioRule: Rule = {
  id: "color-contrast",
  description: "Text color should meet WCAG AA contrast ratios.",
  severity: "warn",
  check: (ast, context) => {
    const issues: Issue[] = [];

    walkWithAncestors(ast, (node) => {
      if (node.type !== "element") return;
      const text = getAccessibleText(node).replace(/\s+/g, " ").trim();
      if (!text) return;

      const contrast = getContrast(node, context.styleLookup);
      if (!contrast) return;

      if (contrast.ratio < contrast.threshold) {
        issues.push({
          ruleId: "color-contrast",
          message: `Color contrast ${contrast.ratio.toFixed(2)}:1 is below ${contrast.threshold}:1.`,
          filePath: context.filePath,
          line: node.loc?.line,
          column: node.loc?.column,
          severity: "warn"
        });
      }
    });

    return issues;
  }
};
