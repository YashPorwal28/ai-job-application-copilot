import { useRef } from "react";
import type { ResumeUploadStatus } from "../useOptionsState";

interface ResumeUploaderProps {
  resumeFilename: string | null;
  uploadStatus: ResumeUploadStatus;
  uploadError: string | null;
  onUpload: (file: File) => void;
}

const STATUS_LABEL: Record<ResumeUploadStatus, string | null> = {
  idle: null,
  "extracting-text": "Reading your resume…",
  "extracting-profile": "Asking OpenAI to structure your profile…",
  done: "Profile extracted successfully.",
  error: null,
};

export function ResumeUploader({ resumeFilename, uploadStatus, uploadError, onUpload }: ResumeUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isBusy = uploadStatus === "extracting-text" || uploadStatus === "extracting-profile";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">Resume</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload a PDF or DOCX resume. We'll extract the text locally and ask OpenAI to structure it into your profile.
        </p>
      </div>

      {resumeFilename && (
        <p className="text-xs text-slate-600">
          Current resume: <span className="font-medium">{resumeFilename}</span>
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={isBusy}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
      >
        {resumeFilename ? "Upload a different resume" : "Upload Resume"}
      </button>

      {STATUS_LABEL[uploadStatus] && <p className="text-xs text-slate-500">{STATUS_LABEL[uploadStatus]}</p>}
      {uploadStatus === "error" && uploadError && (
        <p className="text-xs text-red-600 bg-red-50 rounded p-2">{uploadError}</p>
      )}
    </div>
  );
}
