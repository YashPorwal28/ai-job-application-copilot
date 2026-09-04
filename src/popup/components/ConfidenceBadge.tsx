import { HIGH_CONFIDENCE_THRESHOLD } from "../../shared/constants/fieldTypes";

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percent = Math.round(confidence * 100);
  const color =
    confidence >= HIGH_CONFIDENCE_THRESHOLD
      ? "bg-green-100 text-green-700"
      : confidence > 0
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-500";

  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${color}`}>{percent}%</span>;
}
