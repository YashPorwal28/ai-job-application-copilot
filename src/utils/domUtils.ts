import { normalizeWhitespace, truncate } from "./textUtils";

export type FormControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/**
 * Finds label text using, in order: <label for>, wrapping <label>, aria-label,
 * aria-labelledby. Returns "" if none of these strategies find anything —
 * callers should fall back to placeholder / nearby text separately.
 */
export function findExplicitLabel(element: FormControl): string {
  if (element.id) {
    const labelFor = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
    if (labelFor?.textContent) return normalizeWhitespace(labelFor.textContent);
  }

  const wrappingLabel = element.closest("label");
  if (wrappingLabel?.textContent) {
    // Exclude the control's own text (e.g. selected option text) from the label.
    const clone = wrappingLabel.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("input, textarea, select").forEach((el) => el.remove());
    const text = normalizeWhitespace(clone.textContent ?? "");
    if (text) return text;
  }

  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return normalizeWhitespace(ariaLabel);

  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ");
    if (text.trim()) return normalizeWhitespace(text);
  }

  return "";
}

/**
 * Best-effort context when there's no explicit label: text from the nearest
 * common container, plus preceding sibling text. Kept short so it's useful
 * signal for the classifier without being noisy.
 */
export function findNearbyText(element: FormControl): string {
  const collected: string[] = [];

  let sibling = element.previousElementSibling;
  let hops = 0;
  while (sibling && hops < 2) {
    const text = sibling.textContent?.trim();
    if (text && sibling.tagName !== "INPUT" && sibling.tagName !== "SELECT" && sibling.tagName !== "TEXTAREA") {
      collected.push(text);
    }
    sibling = sibling.previousElementSibling;
    hops++;
  }

  let container = element.parentElement;
  let depth = 0;
  while (container && depth < 3 && collected.length === 0) {
    const clone = container.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("input, textarea, select, script, style").forEach((el) => el.remove());
    const text = clone.textContent?.trim();
    if (text) {
      collected.push(text);
      break;
    }
    container = container.parentElement;
    depth++;
  }

  return truncate(collected.join(" "), 200);
}

export function getFieldId(element: FormControl, index: number): string {
  if (element.id) return `id:${element.id}`;
  if (element.name) return `name:${element.name}:${index}`;
  return `auto:${index}`;
}

/**
 * Whitelisted data-* attributes that site adapters key off of (e.g. Workday's
 * data-automation-id, which is far more stable than its auto-generated id/name).
 * Checks the element itself first, then a couple of ancestor hops, since some
 * platforms put the attribute on a wrapping container rather than the control.
 */
const SITE_ATTRIBUTE_NAMES = ["data-automation-id", "data-testid", "data-qa"];

export function findSiteAttributes(element: FormControl): Record<string, string> {
  const attributes: Record<string, string> = {};

  let node: HTMLElement | null = element;
  let hops = 0;
  while (node && hops < 3) {
    for (const attrName of SITE_ATTRIBUTE_NAMES) {
      if (!(attrName in attributes)) {
        const value = node.getAttribute(attrName);
        if (value) attributes[attrName] = value;
      }
    }
    node = node.parentElement;
    hops++;
  }

  return attributes;
}
