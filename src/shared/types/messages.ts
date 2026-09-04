import type { ProfessionalProfile } from "../schemas/profileSchema";
import type { ApplicationContext } from "../schemas/jobContextSchema";
import type { ClassifiedField, DetectedField } from "../schemas/fieldSchema";

/**
 * Full protocol for Popup <-> Background <-> Content communication.
 * Every message is a discriminated union member keyed by `type`, and every
 * request type is paired with its response type in `MessageResponseMap`.
 * Callers must always go through src/shared/messaging/messageBus.ts —
 * never call chrome.runtime.sendMessage / chrome.tabs.sendMessage directly.
 */

export interface PageAnalysis {
  url: string;
  jobContext: ApplicationContext;
  fields: DetectedField[];
  classifiedFields: ClassifiedField[];
  customQuestions: DetectedField[];
  analyzedAt: number;
}

export interface FillInstruction {
  fieldId: string;
  value: string;
}

// ---- Popup / Background <-> Content (page-level) messages ----

export interface ScanPageRequest {
  type: "SCAN_PAGE";
}

export interface ScanPageResponse {
  jobContext: ApplicationContext;
  jobContextComplete: boolean;
  pageTextSample: string;
  fields: DetectedField[];
  classifiedFields: ClassifiedField[];
  customQuestions: DetectedField[];
}

export interface FillFieldsRequest {
  type: "FILL_FIELDS";
  instructions: FillInstruction[];
}

export interface FillFieldsResponse {
  filledCount: number;
  failedFieldIds: string[];
}

export interface InsertAnswerRequest {
  type: "INSERT_ANSWER";
  fieldId: string;
  value: string;
}

export interface InsertAnswerResponse {
  success: boolean;
}

// ---- Popup <-> Background (app-level) messages ----

export interface GetAppStateRequest {
  type: "GET_APP_STATE";
}

export interface AppState {
  hasProfile: boolean;
  hasApiKey: boolean;
  profile: ProfessionalProfile | null;
}

export interface AnalyzeApplicationRequest {
  type: "ANALYZE_APPLICATION";
  tabId: number;
}

export interface AnalyzeApplicationResponse {
  analysis: PageAnalysis | null;
  error?: string;
}

export interface GetCachedAnalysisRequest {
  type: "GET_CACHED_ANALYSIS";
  tabId: number;
}

export interface GetCachedAnalysisResponse {
  analysis: PageAnalysis | null;
}

export interface FillTabFieldsRequest {
  type: "FILL_TAB_FIELDS";
  tabId: number;
  instructions: FillInstruction[];
}

export interface InsertTabAnswerRequest {
  type: "INSERT_TAB_ANSWER";
  tabId: number;
  fieldId: string;
  value: string;
}

export interface GenerateAnswerRequest {
  type: "GENERATE_ANSWER";
  tabId: number;
  field: DetectedField;
}

export interface GenerateAnswerResponse {
  answer: string | null;
  error?: string;
}

// ---- Union of every request message ----

export type RuntimeMessage =
  | ScanPageRequest
  | FillFieldsRequest
  | InsertAnswerRequest
  | GetAppStateRequest
  | AnalyzeApplicationRequest
  | GetCachedAnalysisRequest
  | FillTabFieldsRequest
  | InsertTabAnswerRequest
  | GenerateAnswerRequest;

/** Maps each request `type` to its expected response payload. */
export interface MessageResponseMap {
  SCAN_PAGE: ScanPageResponse;
  FILL_FIELDS: FillFieldsResponse;
  INSERT_ANSWER: InsertAnswerResponse;
  GET_APP_STATE: AppState;
  ANALYZE_APPLICATION: AnalyzeApplicationResponse;
  GET_CACHED_ANALYSIS: GetCachedAnalysisResponse;
  FILL_TAB_FIELDS: FillFieldsResponse;
  INSERT_TAB_ANSWER: InsertAnswerResponse;
  GENERATE_ANSWER: GenerateAnswerResponse;
}

export type MessageType = keyof MessageResponseMap;
