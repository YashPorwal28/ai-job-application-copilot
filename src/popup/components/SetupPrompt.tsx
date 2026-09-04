interface SetupPromptProps {
  hasProfile: boolean;
  hasApiKey: boolean;
}

export function SetupPrompt({ hasProfile, hasApiKey }: SetupPromptProps) {
  return (
    <div className="p-5 space-y-3">
      <h2 className="text-sm font-semibold text-slate-700">Finish setup to get started</h2>
      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <span className={hasProfile ? "text-green-600" : "text-slate-400"}>{hasProfile ? "✅" : "⬜"}</span>
          Upload your resume &amp; review your profile
        </li>
        <li className="flex items-center gap-2">
          <span className={hasApiKey ? "text-green-600" : "text-slate-400"}>{hasApiKey ? "✅" : "⬜"}</span>
          Add your OpenAI API key
        </li>
      </ul>
      <button
        onClick={() => chrome.runtime.openOptionsPage()}
        className="w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
      >
        Open Settings
      </button>
    </div>
  );
}
