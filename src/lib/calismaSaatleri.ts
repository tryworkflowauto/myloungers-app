import tr from "@/messages/tr.json";
import en from "@/messages/en.json";

type DaysMap = Record<string, string>;

function daysMapForLang(lang: "tr" | "en"): DaysMap {
  return (lang === "en" ? en : tr).days_short_map as DaysMap;
}

/** DB'den gelen kısa gün adını (Pzt, Sal, …) dile göre çevirir; bilinmeyen değerde ham metin. */
export function translateDayShort(rawName: string, lang: "tr" | "en"): string {
  const key = String(rawName ?? "").trim();
  if (!key) return "";
  const map = daysMapForLang(lang);
  return map[key] ?? key;
}

export type CalismaGunRow = {
  name?: string;
  acilis?: string;
  kapanis?: string;
  kapali?: boolean;
  vurgu?: boolean;
};

/**
 * JSONB calisma_saatleri → satır listesi (mobile ile aynı sözleşme).
 * translateDay: DB name → ekran etiketi (ör. TR kısaltma → EN kısaltma).
 */
export function parseCalismaSaatleriLines(
  input: unknown,
  closedLabel: string,
  translateDay: (rawName: string) => string,
  pendingLabel = "Saat bilgisi yakında",
): string[] {
  let parsed: unknown[] = [];
  try {
    const arr =
      Array.isArray(input) ? input :
      typeof input === "string" ? JSON.parse(input) :
      [];
    parsed = Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
  const lines: string[] = [];
  for (const obj of parsed) {
    if (!obj || typeof obj !== "object") continue;
    const g = obj as CalismaGunRow;
    const rawName = String(g.name ?? "").trim();
    if (!rawName) continue;
    const name = translateDay(rawName);
    const vurgu = g.vurgu ? " ⭐" : "";
    if (g.kapali) {
      lines.push(`${name}: ${closedLabel}${vurgu}`);
    } else if (g.acilis && g.kapanis) {
      lines.push(`${name}: ${g.acilis} – ${g.kapanis}${vurgu}`);
    } else {
      lines.push(`${name}: ${pendingLabel}${vurgu}`);
    }
  }
  return lines;
}
