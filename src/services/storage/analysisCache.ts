import type { PageAnalysis } from "../../shared/types/messages";

/**
 * In-memory per-tab cache of the last page analysis, owned by the background
 * service worker. This avoids re-scanning the DOM and re-running
 * classification/AI calls every time the popup opens for the same tab.
 * Intentionally not persisted to chrome.storage — a fresh analysis after a
 * service worker restart is an acceptable tradeoff for an MVP and guarantees
 * we never show stale data for a page the user has since navigated away from.
 */

const cache = new Map<number, PageAnalysis>();

export function getCachedAnalysis(tabId: number): PageAnalysis | null {
  return cache.get(tabId) ?? null;
}

export function setCachedAnalysis(tabId: number, analysis: PageAnalysis): void {
  cache.set(tabId, analysis);
}

export function clearCachedAnalysis(tabId: number): void {
  cache.delete(tabId);
}
