import type { ProfessionalProfile } from "../../shared/schemas/profileSchema";
import type { ProfileFieldType } from "../../shared/constants/fieldTypes";

function mostRecentExperience(profile: ProfessionalProfile) {
  return profile.experience.find((entry) => entry.current) ?? profile.experience[0] ?? null;
}

/** Best-effort year extraction from free-text resume dates (e.g. "Jan 2019", "2019"). Never guesses if absent. */
function extractYear(dateText: string | null): number | null {
  if (!dateText) return null;
  const match = dateText.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

/** Computes total years of experience purely from the candidate's own listed dates — never fabricated. */
function computeYearsOfExperience(profile: ProfessionalProfile): string | null {
  const startYears = profile.experience.map((entry) => extractYear(entry.startDate)).filter((y): y is number => y !== null);
  if (startYears.length === 0) return null;

  const earliestStart = Math.min(...startYears);
  const currentYear = new Date().getFullYear();
  const years = currentYear - earliestStart;
  return years > 0 ? String(years) : null;
}

/**
 * Resolves a classified field type to the candidate's actual profile value.
 * Returns null when the profile has no data for that field — callers must
 * skip the field rather than fill in a placeholder.
 */
export function getProfileFieldValue(profile: ProfessionalProfile, fieldType: ProfileFieldType): string | null {
  switch (fieldType) {
    case "firstName":
      return profile.personal.firstName;
    case "lastName":
      return profile.personal.lastName;
    case "fullName":
      return (
        profile.personal.fullName ??
        ([profile.personal.firstName, profile.personal.lastName].filter(Boolean).join(" ") || null)
      );
    case "email":
      return profile.personal.email;
    case "phone":
      return profile.personal.phone;
    case "address":
      return profile.personal.address;
    case "city":
      return profile.personal.city;
    case "state":
      return profile.personal.state;
    case "country":
      return profile.personal.country;
    case "postalCode":
      return profile.personal.postalCode;
    case "linkedin":
      return profile.links.linkedin;
    case "github":
      return profile.links.github;
    case "portfolio":
      return profile.links.portfolio;
    case "website":
      return profile.links.website;
    case "currentCompany":
      return mostRecentExperience(profile)?.company ?? null;
    case "currentTitle":
      return mostRecentExperience(profile)?.role ?? null;
    case "yearsOfExperience":
      return computeYearsOfExperience(profile);
    default:
      return null;
  }
}
