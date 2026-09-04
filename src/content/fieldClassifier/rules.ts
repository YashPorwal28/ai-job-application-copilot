import type { ProfileFieldType } from "../../shared/constants/fieldTypes";

/**
 * Qualifiers that mark a name field as NOT the candidate's primary legal
 * name (local/native-script name, preferred/chosen name, maiden name, an
 * alternate spelling, ...). We have no profile data for any of these, so
 * they must be left for the user to review rather than silently mirroring
 * the primary first/last/full name into them.
 */
export const NON_LEGAL_NAME_QUALIFIERS = ["local", "preferred", "maiden", "native", "alternate", "nickname", "former"];

export interface FieldRule {
  fieldType: ProfileFieldType;
  /** Matched against the `autocomplete` attribute (exact or "contains"). */
  autocompleteTokens: string[];
  /** Matched (loosely, alphanumeric-only) against label/name/id/placeholder/nearbyText. */
  synonyms: string[];
  /** Optional: input `type` attribute values that strongly imply this field type. */
  inputTypes?: string[];
  /** Optional extra regex tested against the raw (non-normalized) label/placeholder/name/id. */
  regex?: RegExp;
  /**
   * If the field's label/aria-label/name/id/placeholder/nearbyText contains
   * any of these tokens, synonym-based matching is skipped entirely for this
   * rule. Exists because loose substring matching means e.g. firstName's
   * "givenname" synonym also matches "Local Given Name(s)" — a distinct
   * native-script field we have no profile data for, not the primary name.
   * Guessing there would silently produce wrong submitted data.
   */
  excludeIfContains?: string[];
  /**
   * Optional site-adapter signal: matched (loosely) against a specific
   * DetectedField.siteAttributes entry, e.g. Workday's data-automation-id.
   * Highest-confidence signal available since these values are usually
   * stable, semantic identifiers controlled by the platform itself.
   */
  siteAttributeMatchers?: { attribute: string; tokens: string[]; excludeTokens?: string[] }[];
}

export const FIELD_RULES: FieldRule[] = [
  {
    fieldType: "email",
    autocompleteTokens: ["email"],
    inputTypes: ["email"],
    synonyms: ["email", "emailaddress", "e-mail"],
    regex: /e-?mail/i,
  },
  {
    fieldType: "phone",
    autocompleteTokens: ["tel", "tel-national", "phone"],
    inputTypes: ["tel"],
    synonyms: ["phone", "phonenumber", "mobile", "cell", "telephone", "contactnumber"],
  },
  {
    fieldType: "firstName",
    autocompleteTokens: ["given-name", "fname"],
    synonyms: ["firstname", "fname", "givenname", "forename"],
    excludeIfContains: NON_LEGAL_NAME_QUALIFIERS,
  },
  {
    fieldType: "lastName",
    autocompleteTokens: ["family-name", "lname", "surname"],
    synonyms: ["lastname", "lname", "surname", "familyname"],
    excludeIfContains: NON_LEGAL_NAME_QUALIFIERS,
  },
  {
    fieldType: "fullName",
    // NOTE: deliberately no bare "name" synonym — every "First/Last/Middle Name"
    // label also contains the substring "name", so a loose synonym match on
    // "name" alone previously misclassified fields like "Middle Name" as
    // fullName. autocomplete="name" is still matched exactly (not as a
    // substring) via autocompleteTokens, which is safe.
    autocompleteTokens: ["name"],
    synonyms: ["fullname", "yourname", "applicantname", "candidatename", "legalname"],
    regex: /^\s*name\s*[:*]?\s*$/i,
    excludeIfContains: NON_LEGAL_NAME_QUALIFIERS,
  },
  {
    fieldType: "address",
    autocompleteTokens: ["street-address", "address-line1"],
    synonyms: ["address", "streetaddress", "addressline1", "mailingaddress"],
  },
  {
    fieldType: "city",
    autocompleteTokens: ["address-level2"],
    synonyms: ["city", "town"],
  },
  {
    fieldType: "state",
    autocompleteTokens: ["address-level1"],
    synonyms: ["state", "province", "region"],
  },
  {
    fieldType: "country",
    autocompleteTokens: ["country", "country-name"],
    synonyms: ["country", "nation"],
  },
  {
    fieldType: "postalCode",
    autocompleteTokens: ["postal-code"],
    synonyms: ["zip", "zipcode", "postalcode", "postcode"],
  },
  {
    fieldType: "linkedin",
    autocompleteTokens: [],
    synonyms: ["linkedin", "linkedinurl", "linkedinprofile"],
    regex: /linkedin/i,
  },
  {
    fieldType: "github",
    autocompleteTokens: [],
    synonyms: ["github", "githuburl", "githubprofile"],
    regex: /github/i,
  },
  {
    fieldType: "portfolio",
    autocompleteTokens: [],
    synonyms: ["portfolio", "portfoliourl", "portfoliolink", "workssamples"],
  },
  {
    fieldType: "website",
    autocompleteTokens: ["url"],
    inputTypes: ["url"],
    synonyms: ["website", "personalwebsite", "websiteurl", "homepage"],
  },
  {
    fieldType: "currentCompany",
    autocompleteTokens: ["organization"],
    synonyms: ["currentcompany", "currentemployer", "employer", "company", "companyname"],
  },
  {
    fieldType: "currentTitle",
    autocompleteTokens: ["organization-title"],
    synonyms: ["currenttitle", "jobtitle", "currentrole", "currentposition", "title"],
  },
  {
    fieldType: "yearsOfExperience",
    autocompleteTokens: [],
    synonyms: ["yearsofexperience", "yearsexperience", "yoe", "experienceyears", "totalexperience"],
    regex: /years?\s*of\s*experience/i,
  },
];
