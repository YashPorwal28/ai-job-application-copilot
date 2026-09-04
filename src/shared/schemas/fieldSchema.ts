import { z } from "zod";
import { PROFILE_FIELD_TYPES, UNKNOWN_FIELD_TYPE } from "../constants/fieldTypes";

export const detectedFieldSchema = z.object({
  fieldId: z.string(),
  tagName: z.enum(["INPUT", "TEXTAREA", "SELECT"]),
  inputType: z.string(),
  label: z.string(),
  placeholder: z.string(),
  name: z.string(),
  id: z.string(),
  ariaLabel: z.string(),
  autocomplete: z.string(),
  nearbyText: z.string(),
  required: z.boolean(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  /** Whitelisted data-* attributes (e.g. data-automation-id on Workday) used by site adapters. */
  siteAttributes: z.record(z.string(), z.string()).default({}),
});

export type DetectedField = z.infer<typeof detectedFieldSchema>;

export const fieldClassificationSchema = z.object({
  fieldType: z.enum([...PROFILE_FIELD_TYPES, UNKNOWN_FIELD_TYPE]),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
});

export type FieldClassification = z.infer<typeof fieldClassificationSchema>;

/** Strict schema for the AI fallback classifier: it may only pick from an allow-list. */
export const aiFieldClassificationSchema = z.object({
  fieldType: z.string(),
  confidence: z.number().min(0).max(1),
});

export type AIFieldClassification = z.infer<typeof aiFieldClassificationSchema>;

export const classifiedFieldSchema = z.object({
  field: detectedFieldSchema,
  classification: fieldClassificationSchema,
  source: z.enum(["rule", "ai", "none"]),
});

export type ClassifiedField = z.infer<typeof classifiedFieldSchema>;

/** A custom, non-profile question (e.g. "Why do you want to work here?"). */
export const customQuestionSchema = z.object({
  field: detectedFieldSchema,
});

export type CustomQuestion = z.infer<typeof customQuestionSchema>;

export const aiGeneratedAnswerSchema = z.object({
  answer: z.string(),
});

export type AIGeneratedAnswer = z.infer<typeof aiGeneratedAnswerSchema>;
