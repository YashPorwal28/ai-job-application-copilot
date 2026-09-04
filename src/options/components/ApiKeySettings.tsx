import { useState } from "react";
import type { Settings } from "../../shared/schemas/settingsSchema";

interface ApiKeySettingsProps {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
}

const MODEL_OPTIONS = ["gpt-4o-mini", "gpt-4o", "gpt-4.1", "gpt-4.1-mini"];

export function ApiKeySettings({ settings, onUpdate }: ApiKeySettingsProps) {
  const [draftKey, setDraftKey] = useState(settings.openAiApiKey ?? "");
  const [reveal, setReveal] = useState(false);
  const [savedJustNow, setSavedJustNow] = useState(false);

  const handleSave = () => {
    onUpdate({ openAiApiKey: draftKey.trim() || null });
    setSavedJustNow(true);
    setTimeout(() => setSavedJustNow(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">OpenAI API key</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Stored locally in your browser only. Never sent anywhere except directly to OpenAI's API when generating
          answers or extracting your resume.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type={reveal ? "text" : "password"}
          value={draftKey}
          onChange={(e) => setDraftKey(e.target.value)}
          placeholder="sk-..."
          className="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-mono"
        />
        <button
          onClick={() => setReveal((r) => !r)}
          className="rounded-md border border-slate-300 px-2.5 text-xs text-slate-500 hover:bg-slate-50"
        >
          {reveal ? "Hide" : "Show"}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          Save key
        </button>
        {savedJustNow && <span className="text-xs text-green-600">Saved</span>}
        {settings.openAiApiKey && (
          <button
            onClick={() => {
              setDraftKey("");
              onUpdate({ openAiApiKey: null });
            }}
            className="text-xs font-medium text-red-600 hover:underline"
          >
            Remove key
          </button>
        )}
      </div>

      <div className="pt-3 border-t border-slate-200 space-y-1.5">
        <label className="block text-xs font-medium text-slate-500">Model</label>
        <select
          value={settings.openAiModel}
          onChange={(e) => onUpdate({ openAiModel: e.target.value })}
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
        >
          {MODEL_OPTIONS.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
