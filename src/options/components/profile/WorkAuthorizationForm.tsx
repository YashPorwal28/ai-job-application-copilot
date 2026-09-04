import type { WorkAuthorization } from "../../../shared/schemas/profileSchema";
import { FormField } from "../FormField";

interface WorkAuthorizationFormProps {
  workAuthorization: WorkAuthorization;
  onChange: (workAuthorization: WorkAuthorization) => void;
}

export function WorkAuthorizationForm({ workAuthorization, onChange }: WorkAuthorizationFormProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">Work authorization</h3>
      <FormField
        label="Authorized countries (comma-separated)"
        value={workAuthorization.authorizedCountries.join(", ")}
        onChange={(v) =>
          onChange({ ...workAuthorization, authorizedCountries: v.split(",").map((c) => c.trim()).filter(Boolean) })
        }
      />
      <label className="flex items-center gap-2 text-xs text-slate-600">
        <select
          value={
            workAuthorization.requiresSponsorship === null
              ? "unspecified"
              : workAuthorization.requiresSponsorship
                ? "yes"
                : "no"
          }
          onChange={(e) =>
            onChange({
              ...workAuthorization,
              requiresSponsorship: e.target.value === "unspecified" ? null : e.target.value === "yes",
            })
          }
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
        >
          <option value="unspecified">Not specified</option>
          <option value="no">Does not require sponsorship</option>
          <option value="yes">Requires sponsorship</option>
        </select>
        Requires visa sponsorship
      </label>
    </section>
  );
}
