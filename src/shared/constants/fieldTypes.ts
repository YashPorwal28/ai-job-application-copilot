/**
 * Canonical set of profile-mappable field types the classifier (rule-based or AI) may
 * produce. Keep in sync with fieldClassifier rules and the AI fallback allow-list.
 */
export const PROFILE_FIELD_TYPES = [
  "firstName",
  "lastName",
  "fullName",
  "email",
  "phone",
  "address",
  "city",
  "state",
  "country",
  "postalCode",
  "linkedin",
  "github",
  "portfolio",
  "website",
  "currentCompany",
  "currentTitle",
  "yearsOfExperience",
] as const;

export type ProfileFieldType = (typeof PROFILE_FIELD_TYPES)[number];

export const UNKNOWN_FIELD_TYPE = "unknown" as const;

export type FieldType = ProfileFieldType | typeof UNKNOWN_FIELD_TYPE;

/** Confidence at/above this is auto-fillable without a review prompt. */
export const HIGH_CONFIDENCE_THRESHOLD = 0.75;

/** Confidence below this triggers the AI fallback classifier. */
export const AI_FALLBACK_THRESHOLD = 0.55;
