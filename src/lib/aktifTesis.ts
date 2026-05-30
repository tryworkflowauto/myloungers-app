import type { SupabaseClient } from "@supabase/supabase-js";

export type TesisOzet = { id: string; ad: string };

const STORAGE_KEY = "myl_aktif_tesis_id";

export function setAktifTesisId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(id));
}

function clearStoredAktifTesisId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

function readStoredAktifTesisId(): string | null {
  if (typeof window === "undefined") return null;
  const val = localStorage.getItem(STORAGE_KEY);
  if (!val || val.trim() === "") return null;
  return val.trim();
}

function parseJoinedTesisler(rows: unknown[]): TesisOzet[] {
  const list: TesisOzet[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const nested = (row as { tesisler?: { id?: unknown; ad?: unknown } | { id?: unknown; ad?: unknown }[] | null })
      .tesisler;
    const tesis = Array.isArray(nested) ? nested[0] : nested;
    if (!tesis?.id || !tesis?.ad) continue;
    const id = String(tesis.id);
    if (seen.has(id)) continue;
    seen.add(id);
    list.push({ id, ad: String(tesis.ad) });
  }
  list.sort((a, b) => a.ad.localeCompare(b.ad, "tr"));
  return list;
}

async function fetchTesislerByIds(
  supabase: SupabaseClient,
  tesisIds: string[],
): Promise<TesisOzet[]> {
  if (tesisIds.length === 0) return [];
  const { data: tesisler } = await supabase.from("tesisler").select("id, ad").in("id", tesisIds);
  const list = (tesisler ?? [])
    .filter((t) => t.id != null && t.ad != null)
    .map((t) => ({ id: String(t.id), ad: String(t.ad) }));
  list.sort((a, b) => a.ad.localeCompare(b.ad, "tr"));
  return list;
}

async function fetchTesisFromKullanicilar(
  supabase: SupabaseClient,
  userId: string,
): Promise<TesisOzet[]> {
  const { data: kullanici } = await supabase
    .from("kullanicilar")
    .select("tesis_id")
    .eq("id", userId)
    .maybeSingle();
  const tid = (kullanici as { tesis_id?: unknown } | null)?.tesis_id;
  if (tid == null || String(tid).trim() === "") return [];
  return fetchTesislerByIds(supabase, [String(tid)]);
}

/** Mevcut kullanıcının yetkili olduğu tesisler ({ id, ad }). */
export async function getKullaniciTesisleri(supabase: SupabaseClient): Promise<TesisOzet[]> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) return [];

  const userId = authData.user.id;

  const { data: joined, error: joinErr } = await supabase
    .from("tesis_yetkili")
    .select("tesis_id, tesisler(id, ad)")
    .eq("kullanici_id", userId);

  if (!joinErr && joined && joined.length > 0) {
    const parsed = parseJoinedTesisler(joined);
    if (parsed.length > 0) return parsed;
  }

  const { data: yetkiliRows, error: yetkiliErr } = await supabase
    .from("tesis_yetkili")
    .select("tesis_id")
    .eq("kullanici_id", userId);

  if (!yetkiliErr && yetkiliRows && yetkiliRows.length > 0) {
    const tesisIds = [
      ...new Set(
        yetkiliRows
          .map((r) => (r as { tesis_id?: unknown }).tesis_id)
          .filter((id) => id != null && String(id).trim() !== "")
          .map(String),
      ),
    ];
    return fetchTesislerByIds(supabase, tesisIds);
  }

  return fetchTesisFromKullanicilar(supabase, userId);
}

/** Aktif tesis id — yalnızca kullanıcının yetkili olduğu tesislerden biri döner. */
export async function getAktifTesisId(supabase: SupabaseClient): Promise<string | null> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) return null;

  const userId = authData.user.id;
  const yetkiliTesisler = await getKullaniciTesisleri(supabase);
  if (yetkiliTesisler.length === 0) return null;

  const yetkiliIds = new Set(yetkiliTesisler.map((t) => t.id));

  const stored = readStoredAktifTesisId();
  if (stored) {
    if (yetkiliIds.has(stored)) return stored;
    clearStoredAktifTesisId();
  }

  const { data: kullanici } = await supabase
    .from("kullanicilar")
    .select("tesis_id")
    .eq("id", userId)
    .maybeSingle();

  const defaultRaw = (kullanici as { tesis_id?: unknown } | null)?.tesis_id;
  const defaultId =
    defaultRaw != null && String(defaultRaw).trim() !== "" ? String(defaultRaw) : null;

  if (defaultId && yetkiliIds.has(defaultId)) return defaultId;

  return yetkiliTesisler[0]?.id ?? null;
}
