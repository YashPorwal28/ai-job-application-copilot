import { useCallback, useEffect, useState } from "react";
import { getActiveTab, sendToBackground } from "../shared/messaging/messageBus";
import type { AppState, PageAnalysis } from "../shared/types/messages";
import type { ClassifiedField, DetectedField } from "../shared/schemas/fieldSchema";
import { HIGH_CONFIDENCE_THRESHOLD, type ProfileFieldType } from "../shared/constants/fieldTypes";
import { getProfileFieldValue } from "../services/profile/fieldValueMapper";

export interface AnswerState {
  status: "idle" | "generating" | "ready" | "error";
  text: string;
  error?: string;
}

export function usePopupState() {
  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [tabId, setTabId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<PageAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fillSummary, setFillSummary] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});

  const init = useCallback(async () => {
    setLoading(true);
    const [state, tab] = await Promise.all([sendToBackground({ type: "GET_APP_STATE" }), getActiveTab()]);
    setAppState(state);
    setTabId(tab?.id ?? null);

    if (tab?.id) {
      const { analysis: cached } = await sendToBackground({ type: "GET_CACHED_ANALYSIS", tabId: tab.id });
      setAnalysis(cached);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const analyze = useCallback(async () => {
    if (!tabId) return;
    setAnalyzing(true);
    setError(null);
    setFillSummary(null);
    const result = await sendToBackground({ type: "ANALYZE_APPLICATION", tabId });
    if (result.error) {
      setError(result.error);
    } else {
      setAnalysis(result.analysis);
    }
    setAnalyzing(false);
  }, [tabId]);

  const fillHighConfidenceFields = useCallback(async () => {
    if (!tabId || !analysis || !appState?.profile) return;
    const profile = appState.profile;

    const instructions = analysis.classifiedFields
      .filter(
        (cf): cf is ClassifiedField =>
          cf.classification.fieldType !== "unknown" && cf.classification.confidence >= HIGH_CONFIDENCE_THRESHOLD
      )
      .map((cf) => ({
        fieldId: cf.field.fieldId,
        value: getProfileFieldValue(profile, cf.classification.fieldType as ProfileFieldType),
      }))
      .filter((instruction): instruction is { fieldId: string; value: string } => Boolean(instruction.value));

    if (instructions.length === 0) {
      setFillSummary("No high-confidence fields with matching profile data were found.");
      return;
    }

    const result = await sendToBackground({ type: "FILL_TAB_FIELDS", tabId, instructions });
    setFillSummary(
      `Filled ${result.filledCount} field${result.filledCount === 1 ? "" : "s"}.` +
        (result.failedFieldIds.length ? ` ${result.failedFieldIds.length} field(s) could not be filled.` : "")
    );
  }, [tabId, analysis, appState]);

  const fillSingleField = useCallback(
    async (field: DetectedField, fieldType: ProfileFieldType) => {
      if (!tabId || !appState?.profile) return false;
      const value = getProfileFieldValue(appState.profile, fieldType);
      if (!value) return false;
      const result = await sendToBackground({
        type: "FILL_TAB_FIELDS",
        tabId,
        instructions: [{ fieldId: field.fieldId, value }],
      });
      return result.filledCount > 0;
    },
    [tabId, appState]
  );

  const generateAnswer = useCallback(
    async (field: DetectedField) => {
      if (!tabId) return;
      setAnswers((prev) => ({ ...prev, [field.fieldId]: { status: "generating", text: "" } }));
      const result = await sendToBackground({ type: "GENERATE_ANSWER", tabId, field });
      if (result.answer) {
        setAnswers((prev) => ({ ...prev, [field.fieldId]: { status: "ready", text: result.answer! } }));
      } else {
        setAnswers((prev) => ({
          ...prev,
          [field.fieldId]: { status: "error", text: "", error: result.error ?? "Failed to generate an answer." },
        }));
      }
    },
    [tabId]
  );

  const editAnswer = useCallback((fieldId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: { ...prev[fieldId], status: "ready", text } }));
  }, []);

  const insertAnswer = useCallback(
    async (fieldId: string) => {
      if (!tabId) return;
      const answer = answers[fieldId];
      if (!answer?.text) return;
      await sendToBackground({ type: "INSERT_TAB_ANSWER", tabId, fieldId, value: answer.text });
    },
    [tabId, answers]
  );

  const dismissAnswer = useCallback((fieldId: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  return {
    loading,
    appState,
    tabId,
    analysis,
    analyzing,
    error,
    fillSummary,
    answers,
    analyze,
    fillHighConfidenceFields,
    fillSingleField,
    generateAnswer,
    editAnswer,
    insertAnswer,
    dismissAnswer,
  };
}
