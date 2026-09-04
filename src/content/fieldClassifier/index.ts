import type { DetectedField, FieldClassification } from "../../shared/schemas/fieldSchema";
import { UNKNOWN_FIELD_TYPE } from "../../shared/constants/fieldTypes";
import { looseNormalize } from "../../utils/textUtils";
import { FIELD_RULES, type FieldRule } from "./rules";

interface SignalMatch {
  weight: number;
  reason: string;
}

function matchesSynonym(haystack: string, synonyms: string[]): boolean {
  if (!haystack) return false;
  const normalizedHaystack = looseNormalize(haystack);
  if (!normalizedHaystack) return false;
  return synonyms.some((synonym) => normalizedHaystack.includes(looseNormalize(synonym)));
}

function fieldContainsAny(field: DetectedField, tokens: string[]): boolean {
  return [field.label, field.ariaLabel, field.name, field.id, field.placeholder, field.nearbyText].some((haystack) =>
    matchesSynonym(haystack, tokens)
  );
}

function scoreRule(field: DetectedField, rule: FieldRule): SignalMatch[] {
  const matches: SignalMatch[] = [];

  const synonymMatchingDisabled = rule.excludeIfContains && fieldContainsAny(field, rule.excludeIfContains);

  for (const matcher of rule.siteAttributeMatchers ?? []) {
    const value = field.siteAttributes[matcher.attribute];
    const excluded = matcher.excludeTokens && matchesSynonym(value ?? "", matcher.excludeTokens);
    if (value && !excluded && matchesSynonym(value, matcher.tokens)) {
      matches.push({ weight: 0.96, reason: `${matcher.attribute}="${value}"` });
    }
  }

  if (field.autocomplete && rule.autocompleteTokens.some((token) => looseNormalize(field.autocomplete) === looseNormalize(token))) {
    matches.push({ weight: 0.95, reason: `autocomplete="${field.autocomplete}"` });
  }

  if (rule.inputTypes?.includes(field.inputType)) {
    matches.push({ weight: 0.8, reason: `input type="${field.inputType}"` });
  }

  if (!synonymMatchingDisabled && matchesSynonym(field.label, rule.synonyms)) {
    matches.push({ weight: 0.85, reason: `label "${field.label}"` });
  }

  if (!synonymMatchingDisabled && matchesSynonym(field.ariaLabel, rule.synonyms)) {
    matches.push({ weight: 0.85, reason: `aria-label "${field.ariaLabel}"` });
  }

  if (!synonymMatchingDisabled && (matchesSynonym(field.name, rule.synonyms) || matchesSynonym(field.id, rule.synonyms))) {
    matches.push({ weight: 0.75, reason: `name/id "${field.name || field.id}"` });
  }

  if (!synonymMatchingDisabled && matchesSynonym(field.placeholder, rule.synonyms)) {
    matches.push({ weight: 0.65, reason: `placeholder "${field.placeholder}"` });
  }

  if (!synonymMatchingDisabled && matchesSynonym(field.nearbyText, rule.synonyms)) {
    matches.push({ weight: 0.5, reason: `nearby text "${field.nearbyText}"` });
  }

  if (rule.regex && (rule.regex.test(field.label) || rule.regex.test(field.name) || rule.regex.test(field.id) || rule.regex.test(field.placeholder))) {
    matches.push({ weight: 0.8, reason: "regex match" });
  }

  return matches;
}

/**
 * Deterministic, rule-based classifier. Runs entirely locally — no network
 * calls. Fields that don't clear AI_FALLBACK_THRESHOLD are returned as
 * "unknown" so the caller can decide whether to escalate to the AI fallback.
 *
 * `extraRules` lets a site adapter (Workday, Lever, ...) contribute
 * higher-precision, platform-specific rules. They're checked ahead of the
 * generic rule set and win ties, since a matching site-specific signal is
 * more trustworthy than a generic synonym match.
 */
export function classifyFieldByRules(field: DetectedField, extraRules: FieldRule[] = []): FieldClassification {
  let best: { fieldType: FieldClassification["fieldType"]; confidence: number; reason: string } | null = null;

  for (const rule of [...extraRules, ...FIELD_RULES]) {
    const matches = scoreRule(field, rule);
    if (matches.length === 0) continue;

    const topWeight = Math.max(...matches.map((m) => m.weight));
    const bonus = Math.min((matches.length - 1) * 0.03, 0.1);
    const confidence = Math.min(topWeight + bonus, 0.99);
    const topMatch = matches.find((m) => m.weight === topWeight) ?? matches[0];

    if (!best || confidence > best.confidence) {
      best = { fieldType: rule.fieldType, confidence, reason: `Matched ${topMatch.reason}` };
    }
  }

  if (!best) {
    return { fieldType: UNKNOWN_FIELD_TYPE, confidence: 0, reason: "No rule matched any signal" };
  }

  return best;
}
