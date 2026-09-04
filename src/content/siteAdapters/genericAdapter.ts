import type { SiteAdapter } from "./types";

export const genericAdapter: SiteAdapter = {
  id: "generic",
  matches: () => true,
  getScanRoot: () => document,
  getExtraFieldRules: () => [],
  detectJobContext: () => null,
};
