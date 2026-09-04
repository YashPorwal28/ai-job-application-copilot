import { professionalProfileSchema, type ProfessionalProfile } from "../../shared/schemas/profileSchema";
import { getItem, removeItems, setItem } from "./chromeStorage";

const PROFILE_KEY = "aicopilot.profile";
const RESUME_TEXT_KEY = "aicopilot.resumeText";
const RESUME_FILENAME_KEY = "aicopilot.resumeFilename";

export async function getProfile(): Promise<ProfessionalProfile | null> {
  const raw = await getItem<unknown>(PROFILE_KEY);
  if (!raw) return null;
  const parsed = professionalProfileSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function saveProfile(profile: ProfessionalProfile): Promise<void> {
  const validated = professionalProfileSchema.parse(profile);
  await setItem(PROFILE_KEY, validated);
}

export async function deleteProfile(): Promise<void> {
  await removeItems([PROFILE_KEY, RESUME_TEXT_KEY, RESUME_FILENAME_KEY]);
}

export async function saveResumeSource(text: string, filename: string): Promise<void> {
  await setItem(RESUME_TEXT_KEY, text);
  await setItem(RESUME_FILENAME_KEY, filename);
}

export async function getResumeFilename(): Promise<string | null> {
  return getItem<string>(RESUME_FILENAME_KEY);
}

export async function getResumeText(): Promise<string | null> {
  return getItem<string>(RESUME_TEXT_KEY);
}

export async function hasProfile(): Promise<boolean> {
  return (await getProfile()) !== null;
}
