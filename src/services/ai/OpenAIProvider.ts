import { professionalProfileSchema, type ProfessionalProfile } from "../../shared/schemas/profileSchema";
import { applicationContextSchema, type ApplicationContext } from "../../shared/schemas/jobContextSchema";
import { aiFieldClassificationSchema, type AIFieldClassification } from "../../shared/schemas/fieldSchema";
import { AIProviderError, type AIProvider, type FieldClassificationContext, type GenerateAnswerParams } from "./AIProvider";
import { requestJson, requestText } from "./openaiClient";
import { RESUME_EXTRACTION_SYSTEM_PROMPT, buildResumeExtractionUserPrompt } from "./prompts/resumeExtraction";
import { FIELD_CLASSIFICATION_SYSTEM_PROMPT, buildFieldClassificationUserPrompt } from "./prompts/fieldClassification";
import { APPLICATION_ANSWER_SYSTEM_PROMPT, buildApplicationAnswerUserPrompt } from "./prompts/applicationAnswer";
import { JOB_CONTEXT_EXTRACTION_SYSTEM_PROMPT, buildJobContextExtractionUserPrompt } from "./prompts/jobContextExtraction";

export class OpenAIProvider implements AIProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = "gpt-4o-mini"
  ) {}

  async extractResumeProfile(resumeText: string): Promise<ProfessionalProfile> {
    const raw = await requestJson({
      apiKey: this.apiKey,
      model: this.model,
      systemPrompt: RESUME_EXTRACTION_SYSTEM_PROMPT,
      userPrompt: buildResumeExtractionUserPrompt(resumeText),
      temperature: 0.1,
    });

    const parsed = professionalProfileSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AIProviderError(
        `OpenAI returned a resume profile that failed validation: ${parsed.error.message}`,
        "invalid_response"
      );
    }
    return parsed.data;
  }

  async classifyField(
    context: FieldClassificationContext,
    allowedFieldTypes: readonly string[]
  ): Promise<AIFieldClassification> {
    const raw = await requestJson({
      apiKey: this.apiKey,
      model: this.model,
      systemPrompt: FIELD_CLASSIFICATION_SYSTEM_PROMPT,
      userPrompt: buildFieldClassificationUserPrompt(context, allowedFieldTypes),
      temperature: 0,
    });

    const parsed = aiFieldClassificationSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AIProviderError("OpenAI returned an invalid field classification.", "invalid_response");
    }
    if (!allowedFieldTypes.includes(parsed.data.fieldType) && parsed.data.fieldType !== "unknown") {
      return { fieldType: "unknown", confidence: 0 };
    }
    return parsed.data;
  }

  async generateApplicationAnswer(params: GenerateAnswerParams): Promise<string> {
    return requestText({
      apiKey: this.apiKey,
      model: this.model,
      systemPrompt: APPLICATION_ANSWER_SYSTEM_PROMPT,
      userPrompt: buildApplicationAnswerUserPrompt(params),
      temperature: 0.5,
    });
  }

  async extractJobContext(pageText: string): Promise<ApplicationContext> {
    const raw = await requestJson({
      apiKey: this.apiKey,
      model: this.model,
      systemPrompt: JOB_CONTEXT_EXTRACTION_SYSTEM_PROMPT,
      userPrompt: buildJobContextExtractionUserPrompt(pageText),
      temperature: 0.1,
    });

    const parsed = applicationContextSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AIProviderError("OpenAI returned an invalid job context.", "invalid_response");
    }
    return parsed.data;
  }
}
