export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function truncate(text: string, maxLength: number): string {
  const normalized = normalizeWhitespace(text);
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}…` : normalized;
}

/** Loose match: strips non-alphanumerics and lowercases, so "First-Name" == "firstname". */
export function looseNormalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}
