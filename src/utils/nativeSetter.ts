/**
 * Sets a value on an input/textarea/select in a way that survives React,
 * Vue, and Angular's controlled-input tracking. Plain `element.value = x`
 * is silently overwritten by these frameworks because their virtual DOM
 * diffing doesn't see the change. Instead we call the *native* property
 * setter (bypassing any framework-patched setter on the instance) and then
 * dispatch the same events a real user interaction would produce.
 */
function getNativeValueSetter(
  element: HTMLInputElement | HTMLTextAreaElement
): ((value: string) => void) | null {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  const setter = descriptor?.set;
  if (!setter) return null;
  return (value: string) => setter.call(element, value);
}

function dispatchInputEvents(element: HTMLElement): void {
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

export function setNativeInputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const nativeSetter = getNativeValueSetter(element);
  if (nativeSetter) {
    nativeSetter(value);
  } else {
    element.value = value;
  }
  dispatchInputEvents(element);
  element.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
}

export function setNativeSelectValue(element: HTMLSelectElement, value: string): boolean {
  const normalizedTarget = value.trim().toLowerCase();
  const option = Array.from(element.options).find(
    (opt) =>
      opt.value.trim().toLowerCase() === normalizedTarget ||
      opt.textContent?.trim().toLowerCase() === normalizedTarget
  );
  if (!option) return false;

  const descriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
  descriptor?.set?.call(element, option.value);
  dispatchInputEvents(element);
  return true;
}

export function setNativeCheckedValue(element: HTMLInputElement, checked: boolean): void {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked");
  const setter = descriptor?.set;
  if (setter) {
    setter.call(element, checked);
  } else {
    element.checked = checked;
  }
  element.dispatchEvent(new Event("click", { bubbles: true }));
  dispatchInputEvents(element);
}
