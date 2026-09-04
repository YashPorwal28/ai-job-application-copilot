import type { DetectedField } from "../shared/schemas/fieldSchema";

/**
 * Heuristic for "this is an open-ended application question that needs an
 * AI-generated answer" rather than "this is a simple unmapped profile field".
 * Only ever called on fields the rule classifier already marked unknown.
 */
export function isCustomQuestion(field: DetectedField): boolean {
  const labelText = field.label || field.ariaLabel || field.nearbyText;
  if (!labelText) return false;

  const looksLikeQuestion = labelText.includes("?") || labelText.trim().split(/\s+/).length >= 5;
  const isLongFormControl = field.tagName === "TEXTAREA";

  return isLongFormControl || looksLikeQuestion;
}
