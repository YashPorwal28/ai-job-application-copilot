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
 * Greenhouse's generated `name` attributes (e.g. "job_application[first_name]")
 * already loosely match the generic synonym rules once brackets/underscores
 * are stripped, so most fields work without any adapter rules at all. These
 * fill a couple of gaps the generic rules don't cover well.
 */
const GREENHOUSE_RULES: FieldRule[] = [
  {
    fieldType: "linkedin",
    autocompleteTokens: [],
    synonyms: [],
    regex: /job_application\[urls\]\[linkedin\]|job_application\[linked_in\]/i,
  },
  {
    fieldType: "phone",
    autocompleteTokens: [],
    synonyms: [],
    regex: /job_application\[phone\]/i,
  },
];

export const greenhouseAdapter: SiteAdapter = {
  id: "greenhouse",

  matches(url) {
    return /greenhouse\.io$/.test(new URL(url).hostname) || Boolean(document.querySelector("#grnhse_app, [data-source='greenhouse']"));
  },

  getScanRoot() {
    return (
      document.querySelector("#application_form") ??
      document.querySelector(".application--form") ??
      document.querySelector("#grnhse_app") ??
      document
    );
  },

  getExtraFieldRules() {
    return GREENHOUSE_RULES;
  },

  detectJobContext(): Partial<ApplicationContext> | null {
    const jobTitle = textOf(["h1.app-title", ".job__title h1", "#header h1", "h1"]);
    const companyName = textOf([".company-name", "#header .company-name"]);
    const location = textOf([".location", ".job__location", "[class*='location' i]"]);
    const descriptionEl =
      document.querySelector("#content") ??
      document.querySelector(".job__description") ??
      document.querySelector("#job_description") ??
      document.querySelector(".job-post__description");
    const jobDescription = descriptionEl?.textContent?.trim()
      ? truncate(descriptionEl.textContent, 3000)
      : null;

    if (!jobTitle && !companyName && !jobDescription) return null;

    return { jobTitle, companyName, location, jobDescription, requiredSkills: [] };
  },
};
