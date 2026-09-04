import type { GenerateAnswerParams } from "../AIProvider";

export const APPLICATION_ANSWER_SYSTEM_PROMPT = `You write job application answers on behalf of a candidate, using ONLY the facts provided in their profile.

Strict rules:
1. Use ONLY information present in the USER PROFILE below.
2. Never invent companies, job titles, employers, dates, or years of experience.
3. Never invent skills, technologies, or projects the candidate did not list.
4. Never exaggerate seniority or years of experience beyond what the profile supports.
5. If the profile lacks enough information to fully answer the question, write a brief, honest, conservative answer rather than fabricating details.
6. You may tailor tone and emphasis to the job description, but every factual claim must trace back to the profile.
7. Keep the answer concise and professional (roughly 3-6 sentences unless the question calls for a short response).
8. Write in first person, as the candidate.
9. Output plain text only — no markdown, no headers, no bullet points unless the question explicitly asks for a list.`;

export function buildApplicationAnswerUserPrompt(params: GenerateAnswerParams): string {
  return `USER PROFILE:
${JSON.stringify(params.profile, null, 2)}

JOB CONTEXT:
${JSON.stringify(params.jobContext, null, 2)}

QUESTION:
"${params.question}"

Write the candidate's answer now.`;
}
