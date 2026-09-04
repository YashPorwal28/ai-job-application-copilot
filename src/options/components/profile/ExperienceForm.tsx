import type { ExperienceEntry } from "../../../shared/schemas/profileSchema";
import { FormField } from "../FormField";

interface ExperienceFormProps {
  experience: ExperienceEntry[];
  onChange: (experience: ExperienceEntry[]) => void;
}

const EMPTY_ENTRY: ExperienceEntry = {
  company: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: [],
  technologies: [],
};

export function ExperienceForm({ experience, onChange }: ExperienceFormProps) {
  const updateEntry = (index: number, patch: Partial<ExperienceEntry>) => {
    onChange(experience.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const removeEntry = (index: number) => {
    onChange(experience.filter((_, i) => i !== index));
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Experience</h3>
        <button
          onClick={() => onChange([...experience, EMPTY_ENTRY])}
          className="text-xs font-medium text-brand-700 hover:underline"
        >
          + Add experience
        </button>
      </div>

      {experience.length === 0 && <p className="text-xs text-slate-400">No experience entries yet.</p>}

      {experience.map((entry, index) => (
        <div key={index} className="rounded-lg border border-slate-200 p-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Company" value={entry.company} onChange={(v) => updateEntry(index, { company: v })} />
            <FormField label="Role" value={entry.role} onChange={(v) => updateEntry(index, { role: v })} />
            <FormField label="Location" value={entry.location} onChange={(v) => updateEntry(index, { location: v })} />
            <FormField label="Start date" value={entry.startDate} onChange={(v) => updateEntry(index, { startDate: v })} />
            <FormField
              label="End date"
              value={entry.endDate}
              onChange={(v) => updateEntry(index, { endDate: v })}
              placeholder={entry.current ? "Present" : "End date"}
            />
            <label className="flex items-center gap-2 pt-5 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={entry.current}
                onChange={(e) => updateEntry(index, { current: e.target.checked })}
              />
              Currently working here
            </label>
          </div>
          <FormField
            label="Description (one bullet per line)"
            value={entry.description.join("\n")}
            onChange={(v) => updateEntry(index, { description: v.split("\n").filter(Boolean) })}
            textarea
          />
          <FormField
            label="Technologies (comma-separated)"
            value={entry.technologies.join(", ")}
            onChange={(v) => updateEntry(index, { technologies: v.split(",").map((t) => t.trim()).filter(Boolean) })}
          />
          <button onClick={() => removeEntry(index)} className="text-xs font-medium text-red-600 hover:underline">
            Remove
          </button>
        </div>
      ))}
    </section>
  );
}
