import { useState } from "react";
import type { ClassifiedField } from "../../shared/schemas/fieldSchema";
import { PROFILE_FIELD_TYPES, type ProfileFieldType } from "../../shared/constants/fieldTypes";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface FieldReviewRowProps {
  classifiedField: ClassifiedField;
  onFill: (fieldType: ProfileFieldType) => Promise<boolean>;
}

export function FieldReviewRow({ classifiedField, onFill }: FieldReviewRowProps) {
  const { field, classification } = classifiedField;
  const [selected, setSelected] = useState<ProfileFieldType | "">(
    classification.fieldType === "unknown" ? "" : classification.fieldType
  );
  const [status, setStatus] = useState<"idle" | "filled" | "no-data">("idle");

  const handleFill = async () => {
    if (!selected) return;
    const success = await onFill(selected);
    setStatus(success ? "filled" : "no-data");
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-700 truncate" title={field.label || field.name || field.id}>
          {field.label || field.placeholder || field.name || field.id || "Unlabeled field"}
        </p>
        <ConfidenceBadge confidence={classification.confidence} />
      </div>
      <p className="text-[11px] text-slate-400">{classification.reason}</p>
      <div className="flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as ProfileFieldType)}
          className="flex-1 rounded border border-slate-300 text-xs py-1 px-1.5"
        >
          <option value="">Skip this field</option>
          {PROFILE_FIELD_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <button
          disabled={!selected}
          onClick={handleFill}
          className="rounded bg-brand-600 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-40 hover:bg-brand-700 transition-colors"
        >
          Fill
        </button>
      </div>
      {status === "filled" && <p className="text-[11px] text-green-600">Filled.</p>}
      {status === "no-data" && <p className="text-[11px] text-amber-600">No matching data in your profile.</p>}
    </div>
  );
}
