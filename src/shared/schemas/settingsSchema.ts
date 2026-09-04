import { z } from "zod";

export const settingsSchema = z.object({
  openAiApiKey: z.string().nullable().default(null),
  openAiModel: z.string().default("gpt-4o-mini"),
  autoFillHighConfidenceOnly: z.boolean().default(true),
  allowAiFallbackClassification: z.boolean().default(true),
});

export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = settingsSchema.parse({});
