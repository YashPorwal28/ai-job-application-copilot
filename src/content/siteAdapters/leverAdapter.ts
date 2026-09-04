import type { ApplicationContext } from "../../shared/schemas/jobContextSchema";
import type { FieldRule } from "../fieldClassifier/rules";
import type { SiteAdapter } from "./types";
import { normalizeWhitespace, truncate } from "../../utils/textUtils";

function textOf(selectors: string[]): string | null {
  for (const selector of selectors) {
    const text = document.querySelector(selector)?.textContent?.trim();
    if (text) return normalizeWhitespace(text);
  }
  return null;
}

/**
 * Lever's `urls[LinkedIn]` / `urls[GitHub]` / `urls[Portfolio]` names already
 * loosely match the generic synonym rules. The one real gap: Lever's "org"
 * field (current company) has no synonym overlap with the generic rules at all.
 */
const LEVER_RULES: FieldRule[] = [
  {
    fieldType: "currentCompany",
    autocompleteTokens: ["organization"],
    synonyms: [],
    regex: /^org$/i,
  },
  {
    fieldType: "fullName",
    autocompleteTokens: ["name"],
    synonyms: [],
    regex: /^name$/i,
  },
];

export const leverAdapter: SiteAdapter = {
  id: "lever",

  matches(url) {
    return /(^|\.)jobs\.lever\.co$/.test(new URL(url).hostname) || Boolean(document.querySelector(".application-form, #application-form"));
  },

  getScanRoot() {
    return (
      document.querySelector(".application-page") ??
      document.querySelector("#application-form") ??
      document.querySelector(".application-form") ??
      document
    );
  },

  getExtraFieldRules() {
    return LEVER_RULES;
  },

  detectJobContext(): Partial<ApplicationContext> | null {
    const jobTitle = textOf([".posting-headline h2", "h2.posting-headline"]);
    const location = textOf([".posting-categories .location", ".location"]);
    const descriptionEl = document.querySelector(".section-wrapper") ?? document.querySelector("#content .posting-page");
    const jobDescription = descriptionEl?.textContent?.trim() ? truncate(descriptionEl.textContent, 3000) : null;

    if (!jobTitle && !jobDescription) return null;

    return { jobTitle, companyName: null, location, jobDescription, requiredSkills: [] };
  },
};
