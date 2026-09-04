import type { ProfessionalProfile } from "../../shared/schemas/profileSchema";
import type { ApplicationContext } from "../../shared/schemas/jobContextSchema";
import type { AIFieldClassification } from "../../shared/schemas/fieldSchema";

export interface FieldClassificationContext {
  label: string;
  placeholder: string;
  name: string;
  nearbyText: string;
}

export interface GenerateAnswerParams {
  profile: ProfessionalProfile;
  jobContext: ApplicationContext;
  question: string;
}

/**
 * Provider-agnostic AI contract. OpenAIProvider is the only implementation
 * today, but callers (content classifier, background worker, popup) must
 * depend only on this interface so a different provider can be swapped in
 * via services/ai/index.ts without touching call sites.
 */
export interface AIProvider {
  extractResumeProfile(resumeText: string): Promise<ProfessionalProfile>;

  classifyField(
    context: FieldClassificationContext,
    allowedFieldTypes: readonly string[]
  ): Promise<AIFieldClassification>;

  generateApplicationAnswer(params: GenerateAnswerParams): Promise<string>;

  extractJobContext(pageText: string): Promise<ApplicationContext>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly kind: "invalid_api_key" | "rate_limited" | "network" | "invalid_response" | "unknown"
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}
