import type { EducationEntry } from "../../../shared/schemas/profileSchema";
import { FormField } from "../FormField";

interface EducationFormProps {
  education: EducationEntry[];
  onChange: (education: EducationEntry[]) => void;
}

const EMPTY_ENTRY: EducationEntry = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
};

export function EducationForm({ education, onChange }: EducationFormProps) {
  const updateEntry = (index: number, patch: Partial<EducationEntry>) => {
    onChange(education.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const removeEntry = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Education</h3>
        <button
          onClick={() => onChange([...education, EMPTY_ENTRY])}
          className="text-xs font-medium text-brand-700 hover:underline"
        >
          + Add education
        </button>
      </div>

      {education.length === 0 && <p className="text-xs text-slate-400">No education entries yet.</p>}

      {education.map((entry, index) => (
        <div key={index} className="rounded-lg border border-slate-200 p-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Institution" value={entry.institution} onChange={(v) => updateEntry(index, { institution: v })} />
            <FormField label="Degree" value={entry.degree} onChange={(v) => updateEntry(index, { degree: v })} />
            <FormField label="Field of study" value={entry.fieldOfStudy} onChange={(v) => updateEntry(index, { fieldOfStudy: v })} />
            <FormField label="Start date" value={entry.startDate} onChange={(v) => updateEntry(index, { startDate: v })} />
            <FormField label="End date" value={entry.endDate} onChange={(v) => updateEntry(index, { endDate: v })} />
          </div>
          <button onClick={() => removeEntry(index)} className="text-xs font-medium text-red-600 hover:underline">
            Remove
          </button>
        </div>
      ))}
    </section>
  );
}
