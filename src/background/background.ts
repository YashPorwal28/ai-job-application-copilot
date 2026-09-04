import { registerMessageHandlers, sendToTab } from "../shared/messaging/messageBus";
import type {
  AnalyzeApplicationResponse,
  AppState,
  GenerateAnswerResponse,
  PageAnalysis,
} from "../shared/types/messages";
import type { ClassifiedField } from "../shared/schemas/fieldSchema";
import { AI_FALLBACK_THRESHOLD, PROFILE_FIELD_TYPES } from "../shared/constants/fieldTypes";
import { getProfile } from "../services/storage/profileStore";
import { hasApiKey, getSettings } from "../services/storage/settingsStore";
import { getCachedAnalysis, setCachedAnalysis, clearCachedAnalysis } from "../services/storage/analysisCache";
import { getAIProvider, AIProviderError } from "../services/ai";

/** Hard ceiling on AI classification calls per page scan, to bound cost/latency. */
const MAX_AI_CLASSIFICATION_CALLS = 15;

async function upgradeUnknownFieldsWithAI(fields: ClassifiedField[]): Promise<ClassifiedField[]> {
  const settings = await getSettings();
  if (!settings.allowAiFallbackClassification) return fields;

  const provider = await getAIProvider();
  if (!provider) return fields;

  const candidates = fields.filter((f) => f.classification.confidence < AI_FALLBACK_THRESHOLD);
  const toUpgrade = candidates.slice(0, MAX_AI_CLASSIFICATION_CALLS);
  if (toUpgrade.length < candidates.length) {
    console.warn(
      `[AI Copilot] Skipping AI classification for ${candidates.length - toUpgrade.length} field(s) beyond the ${MAX_AI_CLASSIFICATION_CALLS}-call cap.`
    );
  }

  const upgraded = new Map<string, ClassifiedField>();
  await Promise.all(
    toUpgrade.map(async (classifiedField) => {
      try {
        const result = await provider.classifyField(
          {
            label: classifiedField.field.label,
            placeholder: classifiedField.field.placeholder,
            name: classifiedField.field.name,
            nearbyText: classifiedField.field.nearbyText,
          },
          PROFILE_FIELD_TYPES
        );
        if (result.fieldType !== "unknown" && result.confidence > classifiedField.classification.confidence) {
          upgraded.set(classifiedField.field.fieldId, {
            ...classifiedField,
            classification: {
              fieldType: result.fieldType as ClassifiedField["classification"]["fieldType"],
              confidence: result.confidence,
              reason: "Classified by AI fallback",
            },
            source: "ai",
          });
        }
      } catch (error) {
        console.error("[AI Copilot] AI field classification failed:", error);
      }
    })
  );

  return fields.map((f) => upgraded.get(f.field.fieldId) ?? f);
}

async function analyzeTab(tabId: number): Promise<AnalyzeApplicationResponse> {
  try {
    const [tab, scanResult] = await Promise.all([
      chrome.tabs.get(tabId),
      sendToTab(tabId, { type: "SCAN_PAGE" }),
    ]);

    const classifiedFields = await upgradeUnknownFieldsWithAI(scanResult.classifiedFields);

    let jobContext = scanResult.jobContext;
    if (!scanResult.jobContextComplete) {
      const provider = await getAIProvider();
      if (provider && scanResult.pageTextSample) {
        try {
          const aiContext = await provider.extractJobContext(scanResult.pageTextSample);
          jobContext = {
            companyName: jobContext.companyName ?? aiContext.companyName,
            jobTitle: jobContext.jobTitle ?? aiContext.jobTitle,
            location: jobContext.location ?? aiContext.location,
            jobDescription: jobContext.jobDescription ?? aiContext.jobDescription,
            requiredSkills: jobContext.requiredSkills.length ? jobContext.requiredSkills : aiContext.requiredSkills,
          };
        } catch (error) {
          console.error("[AI Copilot] AI job context extraction failed:", error);
        }
      }
    }

    const analysis: PageAnalysis = {
      url: tab.url ?? "",
      jobContext,
      fields: scanResult.fields,
      classifiedFields,
      customQuestions: scanResult.customQuestions,
      analyzedAt: Date.now(),
    };

    setCachedAnalysis(tabId, analysis);
    return { analysis };
  } catch (error) {
    const message =
      error instanceof Error
        ? `Could not analyze this page: ${error.message}`
        : "Could not analyze this page.";
    return { analysis: null, error: message };
  }
}

registerMessageHandlers({
  GET_APP_STATE: async (): Promise<AppState> => {
    const [profile, apiKeyPresent] = await Promise.all([getProfile(), hasApiKey()]);
    return { hasProfile: profile !== null, hasApiKey: apiKeyPresent, profile };
  },

  ANALYZE_APPLICATION: async (message) => analyzeTab(message.tabId),

  GET_CACHED_ANALYSIS: async (message) => ({ analysis: getCachedAnalysis(message.tabId) }),

  FILL_TAB_FIELDS: async (message) => sendToTab(message.tabId, { type: "FILL_FIELDS", instructions: message.instructions }),

  INSERT_TAB_ANSWER: async (message) =>
    sendToTab(message.tabId, { type: "INSERT_ANSWER", fieldId: message.fieldId, value: message.value }),

  GENERATE_ANSWER: async (message): Promise<GenerateAnswerResponse> => {
    const provider = await getAIProvider();
    if (!provider) {
      return { answer: null, error: "Add your OpenAI API key in Settings first." };
    }

    const profile = await getProfile();
    if (!profile) {
      return { answer: null, error: "Upload and save your resume profile first." };
    }

    const cached = getCachedAnalysis(message.tabId);
    const jobContext = cached?.jobContext ?? {
      companyName: null,
      jobTitle: null,
      location: null,
      jobDescription: null,
      requiredSkills: [],
    };

    const questionText = message.field.label || message.field.ariaLabel || message.field.placeholder || message.field.nearbyText;

    try {
      const answer = await provider.generateApplicationAnswer({ profile, jobContext, question: questionText });
      return { answer };
    } catch (error) {
      const errorMessage = error instanceof AIProviderError ? error.message : "Failed to generate an answer.";
      return { answer: null, error: errorMessage };
    }
  },
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading" && changeInfo.url) {
    clearCachedAnalysis(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  clearCachedAnalysis(tabId);
});
