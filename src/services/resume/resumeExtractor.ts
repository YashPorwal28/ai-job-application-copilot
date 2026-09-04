import type { ProfessionalProfile } from "../../shared/schemas/profileSchema";
import { getAIProvider } from "../ai";
import { extractTextFromPdf } from "./pdfParser";
import { extractTextFromDocx } from "./docxParser";

export class ResumeParsingError extends Error {}

export type ResumeFileKind = "pdf" | "docx";

export function detectResumeFileKind(file: File): ResumeFileKind | null {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    return "docx";
  }
  return null;
}

export async function extractResumeText(file: File): Promise<string> {
  const kind = detectResumeFileKind(file);
  if (!kind) {
    throw new ResumeParsingError("Unsupported file format. Please upload a PDF or DOCX resume.");
  }

  const text = kind === "pdf" ? await extractTextFromPdf(file) : await extractTextFromDocx(file);

  if (!text || text.trim().length < 20) {
    throw new ResumeParsingError(
      "Could not extract readable text from this file. It may be a scanned image or empty document."
    );
  }
  return text;
}

/**
 * Full pipeline: raw file -> extracted text -> AI-structured, Zod-validated profile.
 * Requires an OpenAI API key to already be configured.
 */
export async function extractStructuredProfile(resumeText: string): Promise<ProfessionalProfile> {
  const provider = await getAIProvider();
  if (!provider) {
    throw new ResumeParsingError("Add your OpenAI API key in Settings before extracting a profile.");
  }
  return provider.extractResumeProfile(resumeText);
}
