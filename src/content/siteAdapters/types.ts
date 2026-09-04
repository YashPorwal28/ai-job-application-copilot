import type { ApplicationContext } from "../../shared/schemas/jobContextSchema";
import type { FieldRule } from "../fieldClassifier/rules";

export type SiteAdapterId = "generic" | "greenhouse" | "lever" | "workday" | "linkedin";

/**
 * A site adapter adds platform-specific precision on top of the generic
 * detection/classification pipeline — it never replaces it. Every method
 * has a safe, always-correct fallback in the generic adapter, so an adapter
 * that under-detects on a given page degrades to generic behavior rather
 * than breaking anything.
 */
export interface SiteAdapter {
  id: SiteAdapterId;

  /** Cheap, synchronous check — hostname and/or a stable DOM signature. */
  matches(url: string): boolean;

  /**
   * Scopes form-field scanning to the relevant part of the page (e.g. a
   * LinkedIn Easy Apply modal, a Greenhouse #application_form), so the
   * scanner doesn't pick up unrelated site chrome (search bars, nav, etc).
   * Falls back to `document` when the expected container isn't found.
   */
  getScanRoot(): ParentNode;

  /** Extra, higher-precision classification rules layered on top of the generic rule set. */
  getExtraFieldRules(): FieldRule[];

  /**
   * Site-specific job context extraction. Return only the fields you can
   * confidently read from known selectors; return null for fields you
   * can't find rather than guessing. Returning null overall defers entirely
   * to the generic detector (JSON-LD/meta tags/AI fallback).
   */
  detectJobContext(): Partial<ApplicationContext> | null;
}
