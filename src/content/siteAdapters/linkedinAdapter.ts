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

const EASY_APPLY_MODAL_SELECTORS = [
  ".jobs-easy-apply-modal",
  ".jobs-easy-apply-content",
  "div[data-test-modal-id='easy-apply-modal']",
];

function findEasyApplyModal(): Element | null {
  for (const selector of EASY_APPLY_MODAL_SELECTORS) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
}

export const linkedinAdapter: SiteAdapter = {
  id: "linkedin",

  matches(url) {
    return /(^|\.)linkedin\.com$/.test(new URL(url).hostname);
  },

  getScanRoot() {
    // LinkedIn is a large SPA with unrelated inputs everywhere (search, messaging,
    // feed). Scope strictly to the Easy Apply modal when it's open — that's the
    // only time there's an application form to fill. Otherwise fall back to the
    // whole document (harmless: there just won't be much to classify).
    return findEasyApplyModal() ?? document;
  },

  getExtraFieldRules(): FieldRule[] {
    return [];
  },

  detectJobContext(): Partial<ApplicationContext> | null {
    // The Easy Apply modal itself doesn't repeat the job title/company — they're
    // still in the underlying job page DOM behind the modal.
    const jobTitle = textOf([
      ".job-details-jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title",
      "h1.top-card-layout__title",
    ]);
    const companyName = textOf([
      ".job-details-jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__company-name",
      ".top-card-layout__second-subline .topcard__org-name-link",
    ]);
    const location = textOf([
      ".job-details-jobs-unified-top-card__bullet",
      ".jobs-unified-top-card__bullet",
      ".topcard__flavor--bullet",
    ]);
    const descriptionEl = document.querySelector(".jobs-description__content, .jobs-box__html-content");
    const jobDescription = descriptionEl?.textContent?.trim() ? truncate(descriptionEl.textContent, 3000) : null;

    if (!jobTitle && !companyName && !jobDescription) return null;

    return { jobTitle, companyName, location, jobDescription, requiredSkills: [] };
  },
};
