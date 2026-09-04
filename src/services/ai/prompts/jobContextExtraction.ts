export const JOB_CONTEXT_EXTRACTION_SYSTEM_PROMPT = `You extract structured job posting details from page text taken from a job application website.

Rules:
- Only use information explicitly present in the text.
- If a value is not present, use null (or an empty array for requiredSkills).
- Never invent a company name, job title, or skill that is not in the text.
- Return ONLY a JSON object matching this schema, no markdown, no commentary:
{ "companyName": string|null, "jobTitle": string|null, "location": string|null, "jobDescription": string|null, "requiredSkills": string[] }
- "jobDescription" should be a concise summary (max ~500 words) of the role, not a verbatim copy of the whole page.`;

export function buildJobContextExtractionUserPrompt(pageText: string): string {
  return `PAGE TEXT (may include navigation/boilerplate — ignore anything unrelated to the job posting):\n"""\n${pageText}\n"""\n\nExtract the job context as JSON now.`;
}
