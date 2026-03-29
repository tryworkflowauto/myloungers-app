/** Supabase `tesisler.kategori`: string[], JSON string ("[\"HOTEL\",\"BEACH CLUB\"]") veya tek string */

export type KategoriToken = "HOTEL" | "BEACH CLUB" | "AQUA PARK";

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
