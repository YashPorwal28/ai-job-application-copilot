import type { ApplicationContext } from "../shared/schemas/jobContextSchema";
import { normalizeWhitespace, truncate } from "../utils/textUtils";

interface JsonLdJobPosting {
  "@type"?: string | string[];
  title?: string;
  hiringOrganization?: { name?: string } | string;
  jobLocation?: { address?: { addressLocality?: string; addressRegion?: string } } | { address?: string };
  description?: string;
  skills?: string | string[];
}

function isJobPosting(node: unknown): node is JsonLdJobPosting {
  if (!node || typeof node !== "object") return false;
  const type = (node as JsonLdJobPosting)["@type"];
  return type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"));
}

function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return normalizeWhitespace(div.textContent ?? "");
}

function extractFromJsonLd(): Partial<ApplicationContext> | null {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script.textContent ?? "");
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      const posting = candidates.find(isJobPosting);
      if (!posting) continue;

      const location =
        typeof posting.jobLocation === "object" && posting.jobLocation && "address" in posting.jobLocation
          ? typeof posting.jobLocation.address === "string"
            ? posting.jobLocation.address
            : [posting.jobLocation.address?.addressLocality, posting.jobLocation.address?.addressRegion]
                .filter(Boolean)
                .join(", ")
          : null;

      return {
        jobTitle: posting.title ? normalizeWhitespace(posting.title) : null,
        companyName:
          typeof posting.hiringOrganization === "string"
            ? posting.hiringOrganization
            : posting.hiringOrganization?.name ?? null,
        location: location || null,
        jobDescription: posting.description ? truncate(stripHtml(posting.description), 3000) : null,
        requiredSkills:
          typeof posting.skills === "string"
            ? posting.skills.split(",").map((s) => s.trim()).filter(Boolean)
            : posting.skills ?? [],
      };
    } catch {
      // Malformed JSON-LD on the page — ignore and try the next script/strategy.
    }
  }
  return null;
}

function getMetaContent(selectors: string[]): string | null {
  for (const selector of selectors) {
    const content = document.querySelector(selector)?.getAttribute("content");
    if (content?.trim()) return normalizeWhitespace(content);
  }
  return null;
}

function extractFromMetaTags(): Partial<ApplicationContext> {
  return {
    jobTitle: getMetaContent(['meta[property="og:title"]', 'meta[name="twitter:title"]']),
    companyName: getMetaContent(['meta[property="og:site_name"]']),
    jobDescription: getMetaContent(['meta[property="og:description"]', 'meta[name="description"]']),
  };
}

/** A condensed sample of page text for the AI fallback extractor — never the full page. */
function collectPageTextSample(): string {
  const likelySelectors = [
    '[class*="job-description" i]',
    '[class*="jobdescription" i]',
    '[id*="job-description" i]',
    '[class*="posting" i]',
    'main',
    'article',
  ];

  for (const selector of likelySelectors) {
    const el = document.querySelector(selector);
    const text = el?.textContent?.trim();
    if (text && text.length > 200) return truncate(text, 4000);
  }

  return truncate(document.body.innerText, 4000);
}

export interface JobDetectionResult {
  context: Partial<ApplicationContext>;
  pageTextSample: string;
  isComplete: boolean;
}

export function detectJobContext(): JobDetectionResult {
  const jsonLd = extractFromJsonLd();
  const meta = extractFromMetaTags();

  const context: Partial<ApplicationContext> = {
    jobTitle: jsonLd?.jobTitle ?? meta.jobTitle ?? null,
    companyName: jsonLd?.companyName ?? meta.companyName ?? null,
    location: jsonLd?.location ?? null,
    jobDescription: jsonLd?.jobDescription ?? meta.jobDescription ?? null,
    requiredSkills: jsonLd?.requiredSkills ?? [],
  };

  const isComplete = Boolean(context.jobTitle && context.companyName && context.jobDescription);

  return { context, pageTextSample: collectPageTextSample(), isComplete };
}
