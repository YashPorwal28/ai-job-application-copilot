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

function siteAttr(fieldType: FieldRule["fieldType"], tokens: string[], excludeTokens?: string[]): FieldRule {
  return {
    fieldType,
    autocompleteTokens: [],
    synonyms: [],
    siteAttributeMatchers: [{ attribute: "data-automation-id", tokens, excludeTokens }],
  };
}

/**
 * Workday repeats "firstName"/"lastName" tokens across multiple distinct name
 * sections: legal name, local/native-script name, preferred name, additional
 * name. Only the legal name section should ever get auto-filled — the others
 * are semantically different fields we have no profile data for, and mirroring
 * the legal name into them silently produces wrong-looking submitted data.
 */
const NON_LEGAL_NAME_SECTIONS = ["local", "preferred", "additional", "alternate", "native"];

/**
 * Workday's custom form widgets often have auto-generated ids/names
 * ("input-6--uid12-input") with no semantic meaning and unreliable label
 * wiring. data-automation-id is the one attribute Workday keeps stable and
 * semantic across tenants — these values are the common ones seen across
 * Workday career sites, matched loosely (substring, alphanumeric-only) so
 * per-tenant suffixes don't break the match. Best-effort: Workday changes
 * these occasionally, and the generic rules still run as a fallback.
 */
const WORKDAY_RULES: FieldRule[] = [
  siteAttr("firstName", ["legalnamesectionfirstname", "firstname"], NON_LEGAL_NAME_SECTIONS),
  siteAttr("lastName", ["legalnamesectionlastname", "lastname"], NON_LEGAL_NAME_SECTIONS),
  siteAttr("email", ["email"]),
  siteAttr("phone", ["phonenumber", "phone-number"]),
  siteAttr("address", ["addresssectionaddressline1", "addressline1"]),
  siteAttr("city", ["addresssectioncity", "city"]),
  siteAttr("state", ["addresssectionregion", "addresssectioncountryregion", "region"]),
  siteAttr("country", ["addresssectioncountry", "country"]),
  siteAttr("postalCode", ["addresssectionpostalcode", "postalcode", "zipcode"]),
];

export const workdayAdapter: SiteAdapter = {
  id: "workday",

  matches(url) {
    return /\.myworkdayjobs\.com$/.test(new URL(url).hostname);
  },

  getScanRoot() {
    return document.querySelector('[data-automation-id="applyFlowPage"]') ?? document;
  },

  getExtraFieldRules() {
    return WORKDAY_RULES;
  },

  detectJobContext(): Partial<ApplicationContext> | null {
    const jobTitle = textOf(['[data-automation-id="jobPostingHeader"]']);
    const location = textOf(['[data-automation-id="locations"]', '[data-automation-id="subtitle"]']);
    const descriptionEl = document.querySelector('[data-automation-id="jobPostingDescription"]');
    const jobDescription = descriptionEl?.textContent?.trim() ? truncate(descriptionEl.textContent, 3000) : null;

    if (!jobTitle && !jobDescription) return null;

    return { jobTitle, companyName: null, location, jobDescription, requiredSkills: [] };
  },
};
