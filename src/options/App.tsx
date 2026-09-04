import { useState } from "react";
import { useOptionsState } from "./useOptionsState";
import { ResumeUploader } from "./components/ResumeUploader";
import { ProfileEditor } from "./components/ProfileEditor";
import { ApiKeySettings } from "./components/ApiKeySettings";
import { PrivacySettings } from "./components/PrivacySettings";

type Tab = "profile" | "ai" | "privacy";

const TABS: { key: Tab; label: string }[] = [
  { key: "profile", label: "Resume & Profile" },
  { key: "ai", label: "AI Settings" },
  { key: "privacy", label: "Privacy & Data" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("profile");
  const {
    loading,
    profile,
    hasStoredProfile,
    resumeFilename,
    settings,
    saveStatus,
    uploadStatus,
    uploadError,
    uploadResume,
    updateProfile,
    persistProfile,
    clearProfile,
    updateSettings,
    deleteAllData,
  } = useOptionsState();

  if (loading) {
    return <div className="p-10 text-sm text-slate-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-lg font-semibold text-slate-800">AI Job Application Copilot — Settings</h1>
        <p className="text-xs text-slate-500 mt-1">This extension never submits a job application automatically.</p>
      </header>

      <nav className="px-8 pt-4 flex gap-1 border-b border-slate-200 bg-white">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="max-w-2xl mx-auto px-8 py-8 space-y-6">
        {tab === "profile" && (
          <>
            <ResumeUploader
              resumeFilename={resumeFilename}
              uploadStatus={uploadStatus}
              uploadError={uploadError}
              onUpload={uploadResume}
            />
            {hasStoredProfile && (
              <ProfileEditor
                profile={profile}
                onChange={updateProfile}
                onSave={persistProfile}
                onDelete={clearProfile}
                saveStatus={saveStatus}
              />
            )}
          </>
        )}

        {tab === "ai" && <ApiKeySettings settings={settings} onUpdate={updateSettings} />}

        {tab === "privacy" && (
          <PrivacySettings settings={settings} onUpdate={updateSettings} onDeleteAll={deleteAllData} />
        )}
      </main>
    </div>
  );
}
