import type { DetectedField } from "../shared/schemas/fieldSchema";
import { findExplicitLabel, findNearbyText, findSiteAttributes, getFieldId, type FormControl } from "../utils/domUtils";
import { normalizeWhitespace } from "../utils/textUtils";

// A WeakMap keeps the element <-> fieldId mapping without touching the DOM,
// so the form filler can resolve a fieldId back to its live element later.
const fieldRegistry = new Map<string, FormControl>();

export function resolveFieldElement(fieldId: string): FormControl | null {
  return fieldRegistry.get(fieldId) ?? null;
}

export function clearFieldRegistry(): void {
  fieldRegistry.clear();
}

function extractSelectOptions(element: HTMLSelectElement): { value: string; label: string }[] {
  return Array.from(element.options).map((option) => ({
    value: option.value,
    label: normalizeWhitespace(option.textContent ?? ""),
  }));
}

export function extractFields(controls: FormControl[]): DetectedField[] {
  clearFieldRegistry();

  return controls.map((element, index) => {
    const fieldId = getFieldId(element, index);
    fieldRegistry.set(fieldId, element);

    const label = findExplicitLabel(element);
    const inputType = element instanceof HTMLInputElement ? element.type : element.tagName.toLowerCase();

    const field: DetectedField = {
      fieldId,
      tagName: element.tagName as DetectedField["tagName"],
      inputType,
      label,
      placeholder: "placeholder" in element ? element.placeholder || "" : "",
      name: element.name || "",
      id: element.id || "",
      ariaLabel: element.getAttribute("aria-label") || "",
      autocomplete: element.getAttribute("autocomplete") || "",
      nearbyText: label ? "" : findNearbyText(element),
      required: element.required,
      siteAttributes: findSiteAttributes(element),
      ...(element instanceof HTMLSelectElement ? { options: extractSelectOptions(element) } : {}),
    };

    return field;
  });
}
