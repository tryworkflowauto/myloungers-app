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
export type PeriyotEtiketiHaritasi = ReadonlyMap<string, string>;

let yerEtiketiCache: YerEtiketiHaritasi | null = null;
let periyotEtiketiCache: PeriyotEtiketiHaritasi | null = null;
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

/** `tesis_tipleri` satırlarından db_value → periyot_etiketi haritası */
export function buildPeriyotEtiketiHaritasi(
  rows: readonly { db_value: string; periyot_etiketi?: string | null }[],
): PeriyotEtiketiHaritasi {
  const map = new Map<string, string>();
  for (const row of rows) {
    const dv = row.db_value?.trim();
    const periyot = row.periyot_etiketi?.trim();
    if (!dv || !periyot) continue;
    map.set(dv, periyot);
    map.set(normDbValue(dv), periyot);
  }
  return map;
}

function findEtiketInHarita(token: string, harita: ReadonlyMap<string, string>): string | null {
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

function findYerEtiketiInHarita(token: string, harita: YerEtiketiHaritasi): string | null {
  return findEtiketInHarita(token, harita);
}

function findPeriyotEtiketiInHarita(token: string, harita: PeriyotEtiketiHaritasi): string | null {
  return findEtiketInHarita(token, harita);
}

/** Modül cache — tesis_tipleri (tüm satırlar) bir kez yüklenir */
export async function ensureTesisTipleriYuklendi(client: SupabaseClient): Promise<YerEtiketiHaritasi> {
  if (yerEtiketiCache) return yerEtiketiCache;
  if (yerEtiketiLoadPromise) return yerEtiketiLoadPromise;

  yerEtiketiLoadPromise = (async () => {
    const { data, error } = await client
      .from("tesis_tipleri")
      .select("db_value, yer_etiketi, periyot_etiketi");

    if (error) {
      console.error("[tesisTipleriDb] ensureTesisTipleriYuklendi", error);
      yerEtiketiCache = new Map();
      periyotEtiketiCache = new Map();
      return yerEtiketiCache;
    }

    yerEtiketiCache = buildYerEtiketiHaritasi(data ?? []);
    periyotEtiketiCache = buildPeriyotEtiketiHaritasi(data ?? []);
    return yerEtiketiCache;
  })();

  return yerEtiketiLoadPromise;
}

/** yer_etiketi cache ile aynı fetch — periyot_etiketi haritası */
export async function ensurePeriyotEtiketiYuklendi(client: SupabaseClient): Promise<PeriyotEtiketiHaritasi> {
  await ensureTesisTipleriYuklendi(client);
  return periyotEtiketiCache ?? new Map();
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

/**
 * `tesisler.kategori` → popüler kart periyot rozeti (Günlük / Tur / Seans).
 * İlk dolu periyot_etiketi; yoksa "" (rozet gizlenir).
 */
export function getPeriyotEtiketiDinamik(
  kategori: unknown,
  harita: PeriyotEtiketiHaritasi | null | undefined,
): string {
  if (!harita || harita.size === 0) return "";
  const parts = normalizeKategoriList(kategori);
  for (const p of parts) {
    const label = findPeriyotEtiketiInHarita(p, harita);
    if (label) return label;
  }
  return "";
}
