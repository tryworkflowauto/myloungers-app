import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeKategoriList } from "@/lib/tesisKategori";
import { getFacilityType, getSeatUnitLabel, normalizeToCanonical, type FacilityTypeId } from "@/lib/tesisFacilityTypes";

export type TesisTipiCatalogRow = {
  id: string;
  slug: string;
  ad: string;
  db_value: string;
  sira: number;
  ikon: string | null;
  gorsel?: string | null;
};

export const TESIS_TIPI_CATALOG_SELECT = "id, slug, ad, db_value, sira, ikon";

export async function fetchAktifTesisTipleri(client: SupabaseClient): Promise<TesisTipiCatalogRow[]> {
  const { data, error } = await client
    .from("tesis_tipleri")
    .select(TESIS_TIPI_CATALOG_SELECT)
    .eq("aktif", true)
    .order("sira", { ascending: true });

  if (error) {
    console.error("[tesisTipleriDb] fetchAktifTesisTipleri", error);
    return [];
  }
  return (data ?? []) as TesisTipiCatalogRow[];
}

function normDbValue(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, " ");
}

function findDbValueInCatalog(token: string, catalog: TesisTipiCatalogRow[]): string | null {
  const t = token.trim();
  if (!t) return null;
  const lower = t.toLowerCase();
  for (const row of catalog) {
    if (row.slug.toLowerCase() === lower) return row.db_value;
    if (row.db_value === t) return row.db_value;
    if (normDbValue(row.db_value) === normDbValue(t)) return row.db_value;
  }
  return null;
}

/**
 * Form girdisi (slug, db_value, legacy canonical id) → `tesisler.kategori` db_value[].
 * catalog boşsa legacy DEFS fallback (onay / eski başvurular).
 */
export function kategoriInputToDbValues(input: unknown, catalog: TesisTipiCatalogRow[]): string[] {
  const parts = normalizeKategoriList(input);
  const out: string[] = [];
  const seen = new Set<string>();

  const pushDb = (dv: string) => {
    const v = dv.trim();
    if (!v || seen.has(v)) return;
    seen.add(v);
    out.push(v);
  };

  for (const p of parts) {
    const fromCatalog = catalog.length > 0 ? findDbValueInCatalog(p, catalog) : null;
    if (fromCatalog) {
      pushDb(fromCatalog);
      continue;
    }
    const id = normalizeToCanonical(p) as FacilityTypeId | null;
    if (!id) continue;
    pushDb(getFacilityType(id).dbValue);
  }

  if (out.length === 0) {
    if (typeof input === "string" && input.trim()) {
      const fromCatalog = catalog.length > 0 ? findDbValueInCatalog(input, catalog) : null;
      if (fromCatalog) return [fromCatalog];
    }
    const id = normalizeToCanonical(input) as FacilityTypeId | null;
    if (id) pushDb(getFacilityType(id).dbValue);
  }

  return out;
}

export type YerEtiketiHaritasi = ReadonlyMap<string, string>;

let yerEtiketiCache: YerEtiketiHaritasi | null = null;
let yerEtiketiLoadPromise: Promise<YerEtiketiHaritasi> | null = null;

/** `tesis_tipleri` satırlarından db_value → yer_etiketi haritası */
export function buildYerEtiketiHaritasi(
  rows: readonly { db_value: string; yer_etiketi?: string | null }[],
): YerEtiketiHaritasi {
  const map = new Map<string, string>();
  for (const row of rows) {
    const dv = row.db_value?.trim();
    const yer = row.yer_etiketi?.trim();
    if (!dv || !yer) continue;
    map.set(dv, yer);
    map.set(normDbValue(dv), yer);
  }
  return map;
}

function findYerEtiketiInHarita(token: string, harita: YerEtiketiHaritasi): string | null {
  const t = token.trim();
  if (!t || harita.size === 0) return null;
  const direct = harita.get(t);
  if (direct) return direct;
  const normalized = normDbValue(t);
  const fromNorm = harita.get(normalized);
  if (fromNorm) return fromNorm;
  for (const [k, v] of harita) {
    if (normDbValue(k) === normalized) return v;
  }
  return null;
}

/** Modül cache — tesis_tipleri (tüm satırlar) bir kez yüklenir */
export async function ensureTesisTipleriYuklendi(client: SupabaseClient): Promise<YerEtiketiHaritasi> {
  if (yerEtiketiCache) return yerEtiketiCache;
  if (yerEtiketiLoadPromise) return yerEtiketiLoadPromise;

  yerEtiketiLoadPromise = (async () => {
    const { data, error } = await client
      .from("tesis_tipleri")
      .select("db_value, yer_etiketi");

    if (error) {
      console.error("[tesisTipleriDb] ensureTesisTipleriYuklendi", error);
      yerEtiketiCache = new Map();
      return yerEtiketiCache;
    }

    yerEtiketiCache = buildYerEtiketiHaritasi(data ?? []);
    return yerEtiketiCache;
  })();

  return yerEtiketiLoadPromise;
}

/**
 * `tesisler.kategori` → birim etiketi.
 * Önce tablo haritası (yer_etiketi); yoksa/boşsa `getSeatUnitLabel` (kod haritası); o da yoksa "Yer".
 */
export function getSeatUnitLabelDinamik(
  kategori: unknown,
  harita: YerEtiketiHaritasi | null | undefined,
): string {
  if (harita && harita.size > 0) {
    const parts = normalizeKategoriList(kategori);
    for (const p of parts) {
      const label = findYerEtiketiInHarita(p, harita);
      if (label) return label;
    }
  }
  return getSeatUnitLabel(kategori);
}
