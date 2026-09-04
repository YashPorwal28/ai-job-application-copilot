import { applicationContextSchema, type ApplicationContext } from "../shared/schemas/jobContextSchema";
import type { ClassifiedField, DetectedField } from "../shared/schemas/fieldSchema";
import { registerMessageHandlers } from "../shared/messaging/messageBus";
import type { ScanPageResponse } from "../shared/types/messages";
import { detectFormControls } from "./formDetector";
import { extractFields } from "./fieldExtractor";
import { classifyFieldByRules } from "./fieldClassifier";
import { detectJobContext } from "./jobDetector";
import { isCustomQuestion } from "./customQuestionDetector";
import { fillFields, insertAnswer } from "./formFiller";
import { getActiveSiteAdapter } from "./siteAdapters";

/** Adapter values win where present; generic detection fills in whatever the adapter didn't find. */
function mergeJobContext(
  adapterContext: Partial<ApplicationContext> | null,
  generic: Partial<ApplicationContext>
): Partial<ApplicationContext> {
  if (!adapterContext) return generic;
  return {
    jobTitle: adapterContext.jobTitle ?? generic.jobTitle ?? null,
    companyName: adapterContext.companyName ?? generic.companyName ?? null,
    location: adapterContext.location ?? generic.location ?? null,
    jobDescription: adapterContext.jobDescription ?? generic.jobDescription ?? null,
    requiredSkills: adapterContext.requiredSkills?.length ? adapterContext.requiredSkills : (generic.requiredSkills ?? []),
  };
}

function scanPage(): ScanPageResponse {
  const adapter = getActiveSiteAdapter();
  const scanRoot = adapter.getScanRoot();
  const extraRules = adapter.getExtraFieldRules();

  const controls = detectFormControls(scanRoot);
  const fields = extractFields(controls);

  const classifiedFields: ClassifiedField[] = [];
  const customQuestions: DetectedField[] = [];

  for (const field of fields) {
    const classification = classifyFieldByRules(field, extraRules);
    classifiedFields.push({ field, classification, source: "rule" });

    if (classification.fieldType === "unknown" && isCustomQuestion(field)) {
      customQuestions.push(field);
    }
  }

  const generic = detectJobContext();
  const context = mergeJobContext(adapter.detectJobContext(), generic.context);
  const isComplete = Boolean(context.jobTitle && context.companyName && context.jobDescription);

  return {
    jobContext: applicationContextSchema.parse(context),
    jobContextComplete: isComplete,
    pageTextSample: generic.pageTextSample,
    fields,
    classifiedFields,
    customQuestions,
  };
}

registerMessageHandlers({
  SCAN_PAGE: () => scanPage(),
  FILL_FIELDS: (message) => fillFields(message.instructions),
  INSERT_ANSWER: (message) => ({ success: insertAnswer(message.fieldId, message.value) }),
});
