import type { Links } from "../../../shared/schemas/profileSchema";
import { FormField } from "../FormField";

interface LinksFormProps {
  links: Links;
  onChange: (links: Links) => void;
}

const FIELDS: { key: keyof Links; label: string }[] = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "portfolio", label: "Portfolio" },
  { key: "website", label: "Website" },
];

export function LinksForm({ links, onChange }: LinksFormProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">Links</h3>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({ key, label }) => (
          <FormField key={key} label={label} value={links[key]} onChange={(value) => onChange({ ...links, [key]: value })} />
        ))}
      </div>
    </section>
  );
}
