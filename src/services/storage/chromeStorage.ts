/**
 * Single low-level abstraction over chrome.storage.local. Every other module
 * that needs persisted data goes through a typed store built on top of this
 * file — nothing else in the codebase should call chrome.storage directly.
 */

export async function getItem<T>(key: string): Promise<T | null> {
  const result = await chrome.storage.local.get(key);
  return (result[key] as T | undefined) ?? null;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export async function removeItem(key: string): Promise<void> {
  await chrome.storage.local.remove(key);
}

export async function removeItems(keys: string[]): Promise<void> {
  await chrome.storage.local.remove(keys);
}

export function onItemChanged<T>(
  key: string,
  callback: (newValue: T | null, oldValue: T | null) => void
): () => void {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
    if (areaName !== "local" || !(key in changes)) return;
    const change = changes[key];
    callback((change.newValue as T | undefined) ?? null, (change.oldValue as T | undefined) ?? null);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
