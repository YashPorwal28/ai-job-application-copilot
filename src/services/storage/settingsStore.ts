import { DEFAULT_SETTINGS, settingsSchema, type Settings } from "../../shared/schemas/settingsSchema";
import { getItem, setItem } from "./chromeStorage";

const SETTINGS_KEY = "aicopilot.settings";

export async function getSettings(): Promise<Settings> {
  const raw = await getItem<unknown>(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  const parsed = settingsSchema.safeParse(raw);
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await setItem(SETTINGS_KEY, settingsSchema.parse(settings));
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await saveSettings(next);
  return next;
}

export async function getApiKey(): Promise<string | null> {
  const settings = await getSettings();
  return settings.openAiApiKey;
}

export async function setApiKey(apiKey: string | null): Promise<void> {
  await updateSettings({ openAiApiKey: apiKey });
}

export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey();
  return Boolean(key && key.trim().length > 0);
}
