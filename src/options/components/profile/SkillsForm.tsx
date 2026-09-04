import { FormField } from "../FormField";

interface SkillsFormProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">Skills</h3>
      <FormField
        label="Skills (comma-separated)"
        value={skills.join(", ")}
        onChange={(v) => onChange(v.split(",").map((s) => s.trim()).filter(Boolean))}
        textarea
      />
    </section>
  );
}
