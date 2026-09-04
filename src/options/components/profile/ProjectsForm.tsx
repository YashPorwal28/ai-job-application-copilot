import type { ProjectEntry } from "../../../shared/schemas/profileSchema";
import { FormField } from "../FormField";

interface ProjectsFormProps {
  projects: ProjectEntry[];
  onChange: (projects: ProjectEntry[]) => void;
}

const EMPTY_ENTRY: ProjectEntry = { name: "", description: "", technologies: [], url: "" };

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const updateEntry = (index: number, patch: Partial<ProjectEntry>) => {
    onChange(projects.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const removeEntry = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Projects</h3>
        <button
          onClick={() => onChange([...projects, EMPTY_ENTRY])}
          className="text-xs font-medium text-brand-700 hover:underline"
        >
          + Add project
        </button>
      </div>

      {projects.length === 0 && <p className="text-xs text-slate-400">No projects yet.</p>}

      {projects.map((entry, index) => (
        <div key={index} className="rounded-lg border border-slate-200 p-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Name" value={entry.name} onChange={(v) => updateEntry(index, { name: v })} />
            <FormField label="URL" value={entry.url} onChange={(v) => updateEntry(index, { url: v })} />
          </div>
          <FormField label="Description" value={entry.description} onChange={(v) => updateEntry(index, { description: v })} textarea />
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
