export function toJsonArray(values: readonly string[] | undefined | null): string {
  return JSON.stringify(values ?? []);
}

export function fromJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}
