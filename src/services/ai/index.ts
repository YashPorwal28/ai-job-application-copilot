import { getApiKey, getSettings } from "../storage/settingsStore";
import { OpenAIProvider } from "./OpenAIProvider";
import type { AIProvider } from "./AIProvider";

export type { AIProvider, FieldClassificationContext, GenerateAnswerParams } from "./AIProvider";
export { AIProviderError } from "./AIProvider";

/**
 * Resolves the active AIProvider from stored settings. This is the only
 * place that decides which provider implementation to use — swapping in a
 * different provider later means changing this function, not call sites.
 */
export async function getAIProvider(): Promise<AIProvider | null> {
  const [apiKey, settings] = await Promise.all([getApiKey(), getSettings()]);
  if (!apiKey) return null;
  return new OpenAIProvider(apiKey, settings.openAiModel);
}
