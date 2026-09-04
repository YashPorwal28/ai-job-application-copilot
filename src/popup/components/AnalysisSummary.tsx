import type { PageAnalysis } from "../../shared/types/messages";
import { HIGH_CONFIDENCE_THRESHOLD } from "../../shared/constants/fieldTypes";

export function AnalysisSummary({ analysis }: { analysis: PageAnalysis }) {
  const highConfidenceCount = analysis.classifiedFields.filter(
    (f) => f.classification.fieldType !== "unknown" && f.classification.confidence >= HIGH_CONFIDENCE_THRESHOLD
  ).length;
  const reviewCount = analysis.classifiedFields.length - highConfidenceCount;

  const { jobTitle, companyName } = analysis.jobContext;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5">
      {(jobTitle || companyName) ? (
        <div>
          <p className="text-sm font-semibold text-slate-800">{jobTitle ?? "Role not detected"}</p>
          <p className="text-xs text-slate-500">{companyName ?? "Company not detected"}</p>
        </div>
      ) : (
        <p className="text-xs text-slate-500">Job title/company not detected on this page.</p>
      )}
      <div className="flex gap-4 text-xs text-slate-600 pt-1">
        <span>
          <strong className="text-slate-800">{analysis.fields.length}</strong> fields found
        </span>
        <span>
          <strong className="text-green-700">{highConfidenceCount}</strong> auto-fillable
        </span>
        <span>
          <strong className="text-amber-700">{reviewCount}</strong> to review
        </span>
      </div>
    </div>
  );
}
