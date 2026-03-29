/** Supabase `tesisler.kategori`: string veya string[]; sekme/token ile case-insensitive eşleşme */

export type KategoriToken = "HOTEL" | "BEACH CLUB" | "AQUA PARK";

export function normalizeKategoriList(k: unknown): string[] {
  if (Array.isArray(k)) {
    return k.map((x) => String(x).trim()).filter(Boolean);
  }
  if (k == null || k === "") return [];
  return [String(k).trim()].filter(Boolean);
}

export function tesisMatchesKategoriToken(k: unknown, token: KategoriToken): boolean {
  const parts = normalizeKategoriList(k).map((s) => s.toUpperCase());
  if (token === "BEACH CLUB") {
    return parts.some((s) => s === "BEACH CLUB" || s === "BEACH");
  }
  const u = token.toUpperCase();
  return parts.some((s) => s === u);
}

const ARAMA_TAB_TO_TOKEN: Record<string, KategoriToken | undefined> = {
  Hotel: "HOTEL",
  "Beach Club": "BEACH CLUB",
  "Aqua Park": "AQUA PARK",
};

export function aramaTabMatchesKategori(activeTab: string, k: unknown): boolean {
  if (activeTab === "Tümü") return true;
  const tok = ARAMA_TAB_TO_TOKEN[activeTab];
  if (!tok) return true;
  return tesisMatchesKategoriToken(k, tok);
}

const HOME_CAT_TO_TOKEN: Record<string, KategoriToken | undefined> = {
  hotel: "HOTEL",
  beach: "BEACH CLUB",
  aqua: "AQUA PARK",
};

export function homeActiveCategoryMatchesKategori(activeCategory: string, k: unknown): boolean {
  if (activeCategory === "all") return true;
  const tok = HOME_CAT_TO_TOKEN[activeCategory];
  if (!tok) return true;
  return tesisMatchesKategoriToken(k, tok);
}
