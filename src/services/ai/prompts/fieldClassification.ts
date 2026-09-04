import type { FieldClassificationContext } from "../AIProvider";

export const FIELD_CLASSIFICATION_SYSTEM_PROMPT = `You classify a single job application form field into one of a strictly allowed set of profile field types.

Rules:
- You MUST choose fieldType from the ALLOWED FIELD TYPES list given to you, or return "unknown" if none fit.
- Never invent a field type that is not in the allowed list.
- Base your decision only on the field's label, placeholder, name attribute, and nearby text.
- Return ONLY a JSON object: { "fieldType": string, "confidence": number } where confidence is between 0 and 1.
- No markdown, no commentary, no extra keys.`;

export function buildFieldClassificationUserPrompt(
  context: FieldClassificationContext,
  allowedFieldTypes: readonly string[]
): string {
  return `FIELD CONTEXT:
${JSON.stringify(context, null, 2)}

ALLOWED FIELD TYPES:
${JSON.stringify([...allowedFieldTypes, "unknown"], null, 2)}

Classify this field now.`;
}
