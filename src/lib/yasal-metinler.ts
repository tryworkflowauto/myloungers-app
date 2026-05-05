import type { SupabaseClient } from "@supabase/supabase-js";

export type YasalMetinRow = {
  slug: string;
  baslik: string;
  baslik_en: string | null;
  meta_aciklama: string | null;
  meta_aciklama_en: string | null;
  icerik: string;
  icerik_en: string | null;
};

export function isLegalPageEnglish(lang: string | string[] | undefined): boolean {
  if (Array.isArray(lang)) return lang[0] === "en";
  return lang === "en";
}

export async function fetchYasalMetinBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<YasalMetinRow | null> {
  const { data, error } = await supabase
    .from("yasal_metinler")
    .select("slug,baslik,baslik_en,meta_aciklama,meta_aciklama_en,icerik,icerik_en")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as YasalMetinRow;
}

export function pickYasalMetinForLang(row: YasalMetinRow, english: boolean): {
  title: string;
  html: string;
  description: string;
} {
  const title =
    english && row.baslik_en != null && String(row.baslik_en).trim().length > 0
      ? String(row.baslik_en).trim()
      : row.baslik;

  const html =
    english && row.icerik_en != null && String(row.icerik_en).trim().length > 0
      ? String(row.icerik_en).trim()
      : row.icerik;

  const description =
    english && row.meta_aciklama_en != null && String(row.meta_aciklama_en).trim().length > 0
      ? String(row.meta_aciklama_en).trim()
      : (row.meta_aciklama != null && String(row.meta_aciklama).trim().length > 0
          ? String(row.meta_aciklama).trim()
          : title);

  return { title, html, description };
}
