export function getLocalizedField(
  obj: Record<string, unknown> | null | undefined,
  fieldName: string,
  lang: "tr" | "en",
): string {
  if (!obj) return "";
  if (lang === "en") {
    const enValue = obj[`${fieldName}_en`];
    if (enValue && typeof enValue === "string" && enValue.trim().length > 0) {
      return enValue;
    }
  }
  const base = obj[fieldName];
  return (typeof base === "string" ? base : base != null ? String(base) : "") || "";
}
