import { createClient } from "@/utils/supabase/server";
import { tesisMatchesKategoriToken } from "@/lib/tesisKategori";

export type KesfetSku = {
  id: string;
  skuAd: string;
  fiyat: number;
  tumTekneSabitFiyat: boolean;
  gorsel: string | null;
  aciklama: string | null;
  kapasite: number | null;
  tesisId: string;
  tesisAd: string;
  tesisSlug: string;
  ilce: string;
  sehir: string;
  kategoriRaw: unknown;
};

export type KesfetKampanya = {
  id: string;
  ad: string;
  aciklama: string;
  indirimOrani: number;
  tip: string | null;
  baslangic: string | null;
  bitis: string | null;
  tesisAd: string;
  tesisSlug: string;
};

export type KesfetRehber = {
  id: string;
  slug: string;
  baslik: string;
  kategori: string;
  ozet: string;
  icerik: string;
  ilgiliKesfetUrl: string | null;
};

type TesisEmbed = {
  id?: string;
  ad?: string | null;
  slug?: string | null;
  kategori?: unknown;
  ilce?: string | null;
  sehir?: string | null;
  aktif?: boolean | null;
  fotograflar?: unknown;
};

type SkuRow = {
  id: string;
  ad?: string | null;
  fiyat?: number | string | null;
  tum_tekne_sabit_fiyat?: boolean | null;
  gorsel?: string | null;
  aciklama?: string | null;
  kapasite?: number | null;
  tesis_id?: string;
  tesisler?: TesisEmbed | TesisEmbed[] | null;
};

type KampanyaRow = {
  id: string;
  ad?: string | null;
  aciklama?: string | null;
  indirim_orani?: number | null;
  tip?: string | null;
  baslangic_tarihi?: string | null;
  bitis_tarihi?: string | null;
  tesis_id?: string | null;
  tesisler?: TesisEmbed | TesisEmbed[] | null;
};

type RehberRow = {
  id: string;
  slug?: string | null;
  baslik?: string | null;
  kategori?: string | null;
  ozet?: string | null;
  icerik?: string | null;
  ilgili_kesfet_url?: string | null;
};

function firstTesis(raw: TesisEmbed | TesisEmbed[] | null | undefined): TesisEmbed | null {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

function usableImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  const t = src.trim();
  if (t.startsWith("https://") || t.startsWith("http://") || t.startsWith("/")) return t;
  return null;
}

function tesisImage(fotos: unknown, grupGorsel: string | null): string | null {
  const fromGrup = usableImageUrl(grupGorsel);
  if (fromGrup) return fromGrup;
  if (!Array.isArray(fotos)) return null;
  for (const item of fotos) {
    if (item && typeof item === "object") {
      const src = usableImageUrl((item as { src?: string }).src);
      if (src) return src;
    } else if (typeof item === "string") {
      const src = usableImageUrl(item);
      if (src) return src;
    }
  }
  return null;
}

function tesisHrefSlug(tesis: TesisEmbed): string {
  const slug = typeof tesis.slug === "string" ? tesis.slug.trim() : "";
  if (slug) return slug;
  return String(tesis.id ?? "");
}

function mapSkuRow(g: SkuRow): KesfetSku | null {
  const tesis = firstTesis(g.tesisler);
  if (!tesis || tesis.aktif === false) return null;
  const tesisId = String(tesis.id ?? g.tesis_id ?? "");
  if (!tesisId) return null;
  return {
    id: String(g.id),
    skuAd: (g.ad && String(g.ad).trim()) || "Deneyim",
    fiyat: Number(g.fiyat) || 0,
    tumTekneSabitFiyat: g.tum_tekne_sabit_fiyat === true,
    gorsel: tesisImage(tesis.fotograflar, g.gorsel ?? null),
    aciklama: g.aciklama != null ? String(g.aciklama).trim() || null : null,
    kapasite: typeof g.kapasite === "number" ? g.kapasite : null,
    tesisId,
    tesisAd: String(tesis.ad ?? "").trim() || "Tesis",
    tesisSlug: tesisHrefSlug(tesis),
    ilce: String(tesis.ilce ?? "").trim(),
    sehir: String(tesis.sehir ?? "").trim(),
    kategoriRaw: tesis.kategori,
  };
}

function mapRehberRow(r: RehberRow): KesfetRehber {
  return {
    id: String(r.id),
    slug: String(r.slug ?? ""),
    baslik: String(r.baslik ?? ""),
    kategori: String(r.kategori ?? "").toUpperCase(),
    ozet: String(r.ozet ?? ""),
    icerik: String(r.icerik ?? ""),
    ilgiliKesfetUrl: r.ilgili_kesfet_url ? String(r.ilgili_kesfet_url) : null,
  };
}

export function skuLoc(sku: KesfetSku): string {
  return [sku.ilce, sku.sehir].filter(Boolean).join(", ");
}

export function formatKesfetFiyat(
  sku: Pick<KesfetSku, "fiyat" | "tumTekneSabitFiyat" | "kategoriRaw">,
): string {
  const formatted = Math.round(Number(sku.fiyat) || 0).toLocaleString("tr-TR");
  const isTekne =
    tesisMatchesKategoriToken(sku.kategoriRaw, "TEKNE TURU") ||
    tesisMatchesKategoriToken(sku.kategoriRaw, "TEKNE");
  if (isTekne) {
    if (sku.tumTekneSabitFiyat) return `${formatted} TL'den — tüm tekne`;
    return `${formatted} TL kişi başı`;
  }
  return `${formatted} TL'den`;
}

export function tesisDetailHref(slug: string): string {
  return `/tesis/${encodeURIComponent(slug)}`;
}

export function rehberCtaLabel(rehber: Pick<KesfetRehber, "kategori" | "ilgiliKesfetUrl">): string {
  const url = rehber.ilgiliKesfetUrl ?? "";
  if (url.includes("spa")) return "Bodrum spa ve masaj hizmetlerini gör →";
  if (url.includes("firsat")) return "Fırsatları gör →";
  if (rehber.kategori === "SPA") return "Bodrum spa ve masaj hizmetlerini gör →";
  return "Bodrum tekne turlarını gör →";
}

function tesisKindMatches(kategoriRaw: unknown, kind: "all" | "tekne" | "spa"): boolean {
  const tekne =
    tesisMatchesKategoriToken(kategoriRaw, "TEKNE TURU") || tesisMatchesKategoriToken(kategoriRaw, "TEKNE");
  const spa = tesisMatchesKategoriToken(kategoriRaw, "SPA");
  if (kind === "tekne") return tekne;
  if (kind === "spa") return spa;
  return tekne || spa;
}

const SKU_SELECT_WITH_FLAG =
  "id, ad, fiyat, tum_tekne_sabit_fiyat, gorsel, aciklama, kapasite, tesis_id";
const SKU_SELECT_FALLBACK = "id, ad, fiyat, gorsel, aciklama, kapasite, tesis_id";

export async function fetchKesfetSkus(kind: "all" | "tekne" | "spa"): Promise<KesfetSku[]> {
  const sb = await createClient();
  const tesisRes = await sb
    .from("tesisler")
    .select("id, ad, slug, kategori, ilce, sehir, aktif")
    .eq("aktif", true);
  if (tesisRes.error || !tesisRes.data) return [];

  const tesisList = (tesisRes.data as TesisEmbed[]).filter(
    (t) => t.aktif !== false && tesisKindMatches(t.kategori, kind),
  );
  if (tesisList.length === 0) return [];

  const tesisById = new Map<string, TesisEmbed>();
  for (const t of tesisList) {
    if (t.id) tesisById.set(String(t.id), t);
  }
  const ids = [...tesisById.keys()];

  const primary = await sb
    .from("sezlong_gruplari")
    .select(SKU_SELECT_WITH_FLAG)
    .in("tesis_id", ids)
    .order("fiyat", { ascending: true });

  let gruplar: SkuRow[] = [];
  if (primary.error) {
    const fallback = await sb
      .from("sezlong_gruplari")
      .select(SKU_SELECT_FALLBACK)
      .in("tesis_id", ids)
      .order("fiyat", { ascending: true });
    if (fallback.error || !fallback.data) return [];
    gruplar = (fallback.data as unknown as SkuRow[]).map((r) => ({ ...r, tum_tekne_sabit_fiyat: false }));
  } else {
    gruplar = (primary.data ?? []) as unknown as SkuRow[];
  }

  return gruplar
    .map((g) => {
      const tesis = tesisById.get(String(g.tesis_id ?? ""));
      if (!tesis) return null;
      return mapSkuRow({ ...g, tesisler: tesis });
    })
    .filter((x): x is KesfetSku => x != null);
}

function toDayStr(v: unknown): string | null {
  if (v == null || v === "") return null;
  const m = String(v).match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function todayStr(): string {
  const now = new Date();
  return (
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0")
  );
}

export async function fetchAktifKampanyalar(): Promise<KesfetKampanya[]> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("kampanyalar")
    .select(
      "id, ad, aciklama, indirim_orani, tip, baslangic_tarihi, bitis_tarihi, tesis_id, tesisler(ad, slug, aktif)",
    )
    .eq("durum", "aktif")
    .eq("musteri_goster", true);
  if (error || !data) return [];
  const today = todayStr();
  const out: KesfetKampanya[] = [];
  for (const k of data as unknown as KampanyaRow[]) {
    const bas = toDayStr(k.baslangic_tarihi);
    const bit = toDayStr(k.bitis_tarihi);
    if (!(bas == null || bas <= today)) continue;
    if (!(bit == null || bit >= today)) continue;
    const tesis = firstTesis(k.tesisler);
    if (tesis && tesis.aktif === false) continue;
    const tesisAd = String(tesis?.ad ?? "").trim() || "Tesis";
    const tesisSlug =
      (typeof tesis?.slug === "string" && tesis.slug.trim()) || String(k.tesis_id ?? "");
    out.push({
      id: String(k.id),
      ad: String(k.ad ?? "Kampanya").trim() || "Kampanya",
      aciklama: String(k.aciklama ?? "").trim(),
      indirimOrani: Number(k.indirim_orani) || 0,
      tip: k.tip != null ? String(k.tip) : null,
      baslangic: bas,
      bitis: bit,
      tesisAd,
      tesisSlug,
    });
  }
  return out;
}

export async function fetchYayindaRehberler(limit?: number): Promise<KesfetRehber[]> {
  const sb = await createClient();
  let q = sb
    .from("rehberler")
    .select("id, slug, baslik, kategori, ozet, icerik, ilgili_kesfet_url")
    .eq("yayinda", true)
    .order("created_at", { ascending: false });
  if (limit != null) q = q.limit(limit);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as unknown as RehberRow[]).map(mapRehberRow);
}

export async function fetchRehberBySlug(slug: string): Promise<KesfetRehber | null> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("rehberler")
    .select("id, slug, baslik, kategori, ozet, icerik, ilgili_kesfet_url")
    .eq("slug", slug)
    .eq("yayinda", true)
    .maybeSingle();
  if (error || !data) return null;
  return mapRehberRow(data as unknown as RehberRow);
}
