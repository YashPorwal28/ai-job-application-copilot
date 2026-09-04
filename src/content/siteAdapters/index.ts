import type { SiteAdapter } from "./types";
import { genericAdapter } from "./genericAdapter";
import { greenhouseAdapter } from "./greenhouseAdapter";
import { leverAdapter } from "./leverAdapter";
import { workdayAdapter } from "./workdayAdapter";
import { linkedinAdapter } from "./linkedinAdapter";

export type { SiteAdapter, SiteAdapterId } from "./types";

const KNOWN_ADAPTERS: SiteAdapter[] = [greenhouseAdapter, leverAdapter, workdayAdapter, linkedinAdapter];

/**
 * Picks the first matching platform adapter, falling back to the generic
 * adapter (which scans the whole document with no extra rules) for every
 * other job site. Called fresh on every scan — cheap, synchronous checks.
 */
export function getActiveSiteAdapter(url: string = window.location.href): SiteAdapter {
  for (const adapter of KNOWN_ADAPTERS) {
    try {
      if (adapter.matches(url)) return adapter;
    } catch (error) {
      console.error(`[AI Copilot] Site adapter "${adapter.id}" match check failed:`, error);
    }
  }
  return genericAdapter;
}
