import type { FormControl } from "../utils/domUtils";

const EXCLUDED_INPUT_TYPES = new Set([
  "hidden",
  "submit",
  "button",
  "reset",
  "image",
  "file",
  "range",
  "color",
]);

function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/**
 * Scans the given root (the whole document, or a site adapter's scoped
 * container — e.g. a LinkedIn Easy Apply modal) and same-origin iframes it
 * can reach, for fillable form controls. Cross-origin iframes throw on
 * access and are silently skipped — no way around the same-origin policy.
 */
export function detectFormControls(root: ParentNode = document): FormControl[] {
  const controls: FormControl[] = [];

  const selector = "input, textarea, select";
  root.querySelectorAll<FormControl>(selector).forEach((element) => {
    if (element instanceof HTMLInputElement && EXCLUDED_INPUT_TYPES.has(element.type)) return;
    if (element.disabled) return;
    if (!isVisible(element)) return;
    controls.push(element);
  });

  root.querySelectorAll("iframe").forEach((iframe) => {
    try {
      const iframeDoc = (iframe as HTMLIFrameElement).contentDocument;
      if (iframeDoc) controls.push(...detectFormControls(iframeDoc));
    } catch {
      // Cross-origin iframe — inaccessible by design, skip it.
    }
  });

  return controls;
}
