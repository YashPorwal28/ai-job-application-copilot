import type { FillInstruction } from "../shared/types/messages";
import { resolveFieldElement } from "./fieldExtractor";
import { setNativeCheckedValue, setNativeInputValue, setNativeSelectValue } from "../utils/nativeSetter";

function isEmpty(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
  if (element instanceof HTMLSelectElement) return !element.value;
  if (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio")) {
    return !element.checked;
  }
  return element.value.trim().length === 0;
}

function fillSingleField(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): boolean {
  if (element instanceof HTMLSelectElement) {
    return setNativeSelectValue(element, value);
  }
  if (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio")) {
    const truthy = ["true", "yes", "1", "on"].includes(value.trim().toLowerCase());
    setNativeCheckedValue(element, truthy);
    return true;
  }
  setNativeInputValue(element, value);
  return true;
}

export interface FillResult {
  filledCount: number;
  failedFieldIds: string[];
}

/**
 * Batch autofill. Never overwrites a field the user has already filled in —
 * the user must clear a field themselves if they want it re-filled.
 */
export function fillFields(instructions: FillInstruction[]): FillResult {
  let filledCount = 0;
  const failedFieldIds: string[] = [];

  for (const instruction of instructions) {
    const element = resolveFieldElement(instruction.fieldId);
    if (!element) {
      failedFieldIds.push(instruction.fieldId);
      continue;
    }
    if (!isEmpty(element)) continue;

    const success = fillSingleField(element, instruction.value);
    if (success) {
      filledCount++;
    } else {
      failedFieldIds.push(instruction.fieldId);
    }
  }

  return { filledCount, failedFieldIds };
}

/**
 * Inserts a single AI-generated answer into a field. Unlike fillFields, this
 * always writes — it's only ever called right after the user explicitly
 * clicked "Insert" on a reviewed answer for this exact field.
 */
export function insertAnswer(fieldId: string, value: string): boolean {
  const element = resolveFieldElement(fieldId);
  if (!element || element instanceof HTMLSelectElement) return false;
  setNativeInputValue(element, value);
  return true;
}
