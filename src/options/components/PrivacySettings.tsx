import type { Settings } from "../../shared/schemas/settingsSchema";

interface PrivacySettingsProps {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
  onDeleteAll: () => void;
}

export function PrivacySettings({ settings, onUpdate, onDeleteAll }: PrivacySettingsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">Privacy &amp; data</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Your resume and profile are stored only in this browser's local extension storage — never on a server we
          control. Data is sent to OpenAI only for: (1) structuring your uploaded resume, (2) classifying an
          ambiguous form field, and (3) generating an answer to a custom application question. This extension never
          submits an application on your behalf.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={settings.allowAiFallbackClassification}
          onChange={(e) => onUpdate({ allowAiFallbackClassification: e.target.checked })}
        />
        Allow AI to classify form fields the rule-based system can't confidently identify
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={settings.autoFillHighConfidenceOnly}
          onChange={(e) => onUpdate({ autoFillHighConfidenceOnly: e.target.checked })}
        />
        Only auto-fill fields the classifier is highly confident about
      </label>

      <div className="pt-3 border-t border-slate-200">
        <button onClick={onDeleteAll} className="text-xs font-medium text-red-600 hover:underline">
          Delete all stored data (profile, resume, API key, settings)
        </button>
      </div>
    </div>
  );
}
