import type { DetectedField } from "../../shared/schemas/fieldSchema";
import type { AnswerState } from "../usePopupState";

interface CustomQuestionCardProps {
  field: DetectedField;
  answer: AnswerState | undefined;
  onGenerate: () => void;
  onEdit: (text: string) => void;
  onInsert: () => void;
  onDismiss: () => void;
}

export function CustomQuestionCard({ field, answer, onGenerate, onEdit, onInsert, onDismiss }: CustomQuestionCardProps) {
  const questionText = field.label || field.ariaLabel || field.placeholder || field.nearbyText || "Untitled question";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-2">
      <p className="text-xs font-medium text-slate-700">{questionText}</p>

      {(!answer || answer.status === "idle") && (
        <button
          onClick={onGenerate}
          className="w-full rounded bg-brand-50 px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors"
        >
          Generate AI Answer
        </button>
      )}

      {answer?.status === "generating" && <p className="text-xs text-slate-400">Generating answer…</p>}

      {answer?.status === "error" && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-red-600">{answer.error}</p>
          <button onClick={onGenerate} className="text-xs font-medium text-brand-700 hover:underline">
            Try again
          </button>
        </div>
      )}

      {answer?.status === "ready" && (
        <div className="space-y-1.5">
          <textarea
            value={answer.text}
            onChange={(e) => onEdit(e.target.value)}
            rows={4}
            className="w-full rounded border border-slate-300 p-1.5 text-xs"
          />
          <div className="flex gap-1.5">
            <button
              onClick={onGenerate}
              className="rounded border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
            >
              Regenerate
            </button>
            <button
              onClick={onInsert}
              className="flex-1 rounded bg-brand-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-brand-700"
            >
              Insert
            </button>
            <button
              onClick={onDismiss}
              className="rounded border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
