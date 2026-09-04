import type { PersonalInfo } from "../../../shared/schemas/profileSchema";
import { FormField } from "../FormField";

interface PersonalInfoFormProps {
  personal: PersonalInfo;
  onChange: (personal: PersonalInfo) => void;
}

const FIELDS: { key: keyof PersonalInfo; label: string }[] = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "fullName", label: "Full name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "country", label: "Country" },
  { key: "postalCode", label: "Postal code" },
];

export function PersonalInfoForm({ personal, onChange }: PersonalInfoFormProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">Personal information</h3>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({ key, label }) => (
          <FormField key={key} label={label} value={personal[key]} onChange={(value) => onChange({ ...personal, [key]: value })} />
        ))}
      </div>
    </section>
  );
}
