/** Supabase `tesisler.kategori`: string[], JSON string ("[\"HOTEL\",\"BEACH CLUB\"]") veya tek string */

export type KategoriToken =
  | "HOTEL"
  | "BEACH CLUB"
  | "AQUA PARK"
  | "RESTORAN"
  | "BAR"
  | "BAR & LOUNGE"
  | "TEKNE"
  | "TEKNE TURU"
  | "SPA";

function unwrapKategoriRaw(k: unknown): unknown {
  if (Array.isArray(k)) return k;
  if (typeof k === "string") {
    const t = k.trim();
    if (t.startsWith("[")) {
      try {
        const parsed: unknown = JSON.parse(t);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        /* tek satır string olarak devam */
      }
    }
  }
  return k;
}

export function normalizeKategoriList(k: unknown): string[] {
  const v = unwrapKategoriRaw(k);
  if (Array.isArray(v)) {
    return v.map((x) => String(x).trim()).filter(Boolean);
  }
  if (v == null || v === "") return [];
  return [String(v).trim()].filter(Boolean);
}

/** Karşılaştırma için tek tip boşluk + büyük harf */
function normCatPart(s: string): string {
  return s.toUpperCase().replace(/\s+/g, " ").trim();
}

export function tesisMatchesKategoriToken(k: unknown, token: KategoriToken): boolean {
  const parts = normalizeKategoriList(k).map((s) => normCatPart(s));
  if (token === "BEACH CLUB") {
    return parts.some((s) => s === "BEACH CLUB" || s === "BEACH");
  }
  if (token === "RESTORAN") {
    return parts.some((s) => s === "RESTORAN" || s === "RESTAURANT");
  }
  const u = normCatPart(token);
  return parts.some((s) => s === u);
}

/**
 * Arama sayfası `activeTab` metin anahtarları — `TIP_QUERY_TO_TAB` çıktıları ile aynı olmalı.
 * Bilinmeyen sekme için `aramaTabMatchesKategori` geriye uyumlulukla true döner.
 */
const ARAMA_TAB_TO_TOKENS: Record<string, readonly KategoriToken[]> = {
  Hotel: ["HOTEL"],
  "Beach Club": ["BEACH CLUB"],
  "Aqua Park": ["AQUA PARK"],
  Restoran: ["RESTORAN"],
  "Bar & Lounge": ["BAR", "BAR & LOUNGE"],
  "Tekne Turu": ["TEKNE", "TEKNE TURU"],
  Spa: ["SPA"],
};

export function aramaTabMatchesKategori(activeTab: string, k: unknown): boolean {
  if (activeTab === "Tümü") return true;
  const tokens = ARAMA_TAB_TO_TOKENS[activeTab];
  if (!tokens || tokens.length === 0) return true;
  return tokens.some((tok) => tesisMatchesKategoriToken(k, tok));
}

/** Ana sayfa `activeCategory` (hotel, beach, …) → DB token listesi */
const HOME_CAT_TO_TOKENS: Record<string, readonly KategoriToken[]> = {
  hotel: ["HOTEL"],
  beach: ["BEACH CLUB"],
  aqua: ["AQUA PARK"],
  restoran: ["RESTORAN"],
  bar: ["BAR", "BAR & LOUNGE"],
  tekne: ["TEKNE", "TEKNE TURU"],
  spa: ["SPA"],
};

export function homeActiveCategoryMatchesKategori(activeCategory: string, k: unknown): boolean {
  if (activeCategory === "all") return true;
  const tokens = HOME_CAT_TO_TOKENS[activeCategory];
  if (!tokens || tokens.length === 0) return true;
  return tokens.some((tok) => tesisMatchesKategoriToken(k, tok));
}
