/**
 * Tek merkezi kaynak — tesis "facility" tipleri (başvuru slug'ları ile uyumlu id'ler).
 * Arama/filtre tarafında `@/lib/tesisKategori` içindeki token eşlemeleri ile uyumludur
 * (BEACH≈BEACH CLUB, RESTORAN≈RESTAURANT, BAR≈BAR & LOUNGE, TEKNE≈TEKNE TURU, HOTEL≈OTEL).
 *
 * Şimdilik diğer sayfalar bu modülü import etmiyor; sadece merkezi sabit olarak hazır.
 */

import { normalizeKategoriList } from "./tesisKategori";

export type FacilityTypeId =
  | "beach"
  | "hotel"
  | "aqua"
  | "restoran"
  | "bar"
  | "tekne"
  | "spa";

export type FacilityType = {
  readonly id: FacilityTypeId;
  /** TR arayüz etiketi */
  readonly label: string;
  readonly labelEn: string;
  readonly emoji: string;
  /** Önerilen DB'de tek seçenek olarak saklanacak ana metin (uppercase normalize, filtreye uyumlu). */
  readonly dbValue: string;
  /** Eşleme — ham DB / form değeri (sıra önemli değil); karşılaştırma için norm() uygulanır. */
  readonly tokens: readonly string[];
};

/** Karşılaştırma için tek tip boşluk + büyük harf (@/lib/tesisKategori ile aynı kural). */
function norm(s: string): string {
  return s.toUpperCase().replace(/\s+/g, " ").trim();
}

const DEFS = [
  {
    id: "beach",
    label: "Beach Club",
    labelEn: "Beach Club",
    emoji: "🏖️",
    dbValue: "BEACH CLUB",
    tokens: [
      "BEACH CLUB",
      "BEACH",
      "BEACH CLUB ",
      // slug / onboarding
      "beach",
    ],
  },
  {
    id: "hotel",
    label: "Otel",
    labelEn: "Hotel",
    emoji: "🏨",
    dbValue: "HOTEL",
    tokens: [
      "HOTEL",
      "OTEL",
      "hotel",
    ],
  },
  {
    id: "aqua",
    label: "Aqua Park",
    labelEn: "Aqua Park",
    emoji: "💦",
    dbValue: "AQUA PARK",
    tokens: ["AQUA PARK", "AQUA", "aqua"],
  },
  {
    id: "restoran",
    label: "Restoran",
    labelEn: "Restaurant",
    emoji: "🍽️",
    dbValue: "RESTORAN",
    tokens: ["RESTORAN", "RESTAURANT", "restoran"],
  },
  {
    id: "bar",
    label: "Bar & Lounge",
    labelEn: "Bar & Lounge",
    emoji: "🍸",
    dbValue: "BAR & LOUNGE",
    tokens: ["BAR & LOUNGE", "BAR", "bar"],
  },
  {
    id: "tekne",
    label: "Tekne Turu",
    labelEn: "Boat Tour",
    emoji: "⛵",
    dbValue: "TEKNE TURU",
    tokens: ["TEKNE TURU", "TEKNE", "tekne"],
  },
  {
    id: "spa",
    label: "Spa",
    labelEn: "Spa",
    emoji: "💆",
    dbValue: "SPA",
    tokens: ["SPA", "spa"],
  },
] as const satisfies readonly FacilityType[];

const BY_ID: Record<FacilityTypeId, FacilityType> = {
  beach: DEFS[0],
  hotel: DEFS[1],
  aqua: DEFS[2],
  restoran: DEFS[3],
  bar: DEFS[4],
  tekne: DEFS[5],
  spa: DEFS[6],
};

const FACILITY_LOOKUP = (() => {
  const m = new Map<string, FacilityTypeId>();
  for (const def of DEFS) {
    for (const tok of def.tokens) {
      m.set(norm(tok), def.id);
    }
  }
  return m;
})();

/** İlk normalize edilmiş parça hangi canonical id ise onu döndürür (çoklu kategori sırasına duyarlı). */
function matchNormalizedPart(part: string): FacilityTypeId | null {
  const key = norm(part);
  const direct = FACILITY_LOOKUP.get(key);
  if (direct) return direct;
  // Tek kelime / gevşek eşleme: aqua park alt string (norm sonrası zaten tek token listesinde)
  if (key.includes("AQUA") && key.includes("PARK")) return "aqua";
  return null;
}

export function getAllFacilityTypes(): readonly FacilityType[] {
  return DEFS;
}

export function getFacilityType(id: FacilityTypeId): FacilityType {
  return BY_ID[id];
}

export function getLabel(id: FacilityTypeId): string {
  return BY_ID[id]?.label ?? id;
}

/** Ham değeri (tek string, JSON dizi metni veya PostgREST dizi vb.) ilk anlamlı canonical id’ye çevirir — çoklu kategoride sıradaki ilk eşleşen. */
export function normalizeToCanonical(value: unknown): FacilityTypeId | null {
  const parts = normalizeKategoriList(value);
  for (const p of parts) {
    const id = matchNormalizedPart(p);
    if (id) return id;
  }
  return null;
}

/** Yer seçimli rezervasyon UI — birim etiketi (yalnızca görünen metin). spa yok → varsayılan "Yer". */
const SEAT_UNIT_LABEL_BY_FACILITY: Partial<Record<FacilityTypeId, string>> = {
  beach: "Şezlong",
  hotel: "Şezlong",
  aqua: "Şezlong",
  restoran: "Masa",
  bar: "Masa",
  tekne: "Koltuk",
};

/**
 * `tesisler.kategori` → müşteri arayüzünde yer/şezlong/masa/koltuk birim adı.
 * Liste sırasıyla taranır; özel birimi olan ilk kanonik kategori kullanılır.
 * Hiçbiri yoksa (spa, bilinmeyen, boş) → "Yer".
 */
export function getSeatUnitLabel(kategori: unknown): string {
  const parts = normalizeKategoriList(kategori);
  for (const p of parts) {
    const id = matchNormalizedPart(p);
    if (id && SEAT_UNIT_LABEL_BY_FACILITY[id]) {
      return SEAT_UNIT_LABEL_BY_FACILITY[id]!;
    }
  }
  return "Yer";
}
