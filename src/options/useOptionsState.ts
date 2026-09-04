import { useCallback, useEffect, useState } from "react";
import { EMPTY_PROFILE, type ProfessionalProfile } from "../shared/schemas/profileSchema";
import { DEFAULT_SETTINGS, type Settings } from "../shared/schemas/settingsSchema";
import { deleteProfile, getProfile, getResumeFilename, saveProfile, saveResumeSource } from "../services/storage/profileStore";
import { getSettings, saveSettings } from "../services/storage/settingsStore";
import { extractResumeText, extractStructuredProfile, ResumeParsingError } from "../services/resume/resumeExtractor";
import { AIProviderError } from "../services/ai";

export type ResumeUploadStatus = "idle" | "extracting-text" | "extracting-profile" | "done" | "error";

export function useOptionsState() {
  const [profile, setProfile] = useState<ProfessionalProfile>(EMPTY_PROFILE);
  const [hasStoredProfile, setHasStoredProfile] = useState(false);
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  const [uploadStatus, setUploadStatus] = useState<ResumeUploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [storedProfile, storedSettings, filename] = await Promise.all([
        getProfile(),
        getSettings(),
        getResumeFilename(),
      ]);
      if (storedProfile) {
        setProfile(storedProfile);
        setHasStoredProfile(true);
      }
      setSettings(storedSettings);
      setResumeFilename(filename);
      setLoading(false);
    })();
  }, []);

  const uploadResume = useCallback(async (file: File) => {
    setUploadError(null);
    setUploadStatus("extracting-text");
    try {
      const text = await extractResumeText(file);
      setUploadStatus("extracting-profile");
      const extracted = await extractStructuredProfile(text);
      await saveResumeSource(text, file.name);
      await saveProfile(extracted);
      setProfile(extracted);
      setHasStoredProfile(true);
      setResumeFilename(file.name);
      setUploadStatus("done");
    } catch (error) {
      const message =
        error instanceof ResumeParsingError || error instanceof AIProviderError
          ? error.message
          : "Something went wrong while processing your resume.";
      setUploadError(message);
      setUploadStatus("error");
    }
  }, []);

  const updateProfile = useCallback((updater: (current: ProfessionalProfile) => ProfessionalProfile) => {
    setProfile(updater);
    setSaveStatus("idle");
  }, []);

  const persistProfile = useCallback(async () => {
    await saveProfile(profile);
    setHasStoredProfile(true);
    setSaveStatus("saved");
  }, [profile]);

  const clearProfile = useCallback(async () => {
    await deleteProfile();
    setProfile(EMPTY_PROFILE);
    setHasStoredProfile(false);
    setResumeFilename(null);
  }, []);

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await saveSettings(next);
  }, [settings]);

  const deleteAllData = useCallback(async () => {
    await deleteProfile();
    await saveSettings(DEFAULT_SETTINGS);
    setProfile(EMPTY_PROFILE);
    setHasStoredProfile(false);
    setResumeFilename(null);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
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
  };
}
