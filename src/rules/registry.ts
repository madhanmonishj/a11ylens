import type { Rule } from "../types/rules";
import { imgAltRule } from "./imgAlt";
import { clickableNonSemanticRule } from "./clickableNonsemantic";
import { routerLinkTextRule } from "./routerLinkText";
import { iconOnlyControlRule } from "./iconOnlyControl";
import { contrastRatioRule } from "./contrastRatio";

export const builtInRules: Rule[] = [
  imgAltRule,
  clickableNonSemanticRule,
  routerLinkTextRule,
  iconOnlyControlRule,
  contrastRatioRule
];

export const getRuleById = (id: string): Rule | undefined => {
  return builtInRules.find((rule) => rule.id === id);
};
