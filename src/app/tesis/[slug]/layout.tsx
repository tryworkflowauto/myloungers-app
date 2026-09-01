import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClient } from "@/utils/supabase/server";
import { getLabel, normalizeToCanonical } from "@/lib/tesisFacilityTypes";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

const FALLBACK_TITLE = "Tesis | MyLoungers";
const FALLBACK_DESCRIPTION =
  "Tesis detayı. Gerçek fiyatlarla MyLoungers'ta online rezervasyon yapın.";

const FALLBACK_METADATA: Metadata = {
  title: FALLBACK_TITLE,
  description: FALLBACK_DESCRIPTION,
  openGraph: {
    title: FALLBACK_TITLE,
    description: FALLBACK_DESCRIPTION,
  },
};

function kategoriLabel(kategori: unknown): string {
  const id = normalizeToCanonical(kategori);
  if (id) return getLabel(id);
  return "Tesis";
}

function bolgeText(ilce: unknown, sehir: unknown): string {
  const a = typeof ilce === "string" ? ilce.trim() : "";
  const b = typeof sehir === "string" ? sehir.trim() : "";
  if (a && b && a.toLocaleLowerCase("tr") !== b.toLocaleLowerCase("tr")) {
    return `${a}, ${b}`;
  }
  return a || b;
}

function buildDescription(ad: string, kategori: string, bolge: string): string {
  if (bolge) {
    return `${ad}, ${bolge}'da ${kategori} deneyimi. Gerçek fiyatlarla MyLoungers'ta online rezervasyon yapın.`;
  }
  return `${ad} ${kategori} deneyimi. Gerçek fiyatlarla MyLoungers'ta online rezervasyon yapın.`;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  try {
    const { slug: rawSlug } = await params;
    const slug = typeof rawSlug === "string" ? decodeURIComponent(rawSlug).trim() : "";
    if (!slug) return FALLBACK_METADATA;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tesisler")
      .select("ad, slug, kategori, ilce, sehir")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("[tesis layout] tesisler select error", error);
      return FALLBACK_METADATA;
    }
    if (!data) return FALLBACK_METADATA;

    const ad = typeof data.ad === "string" && data.ad.trim() ? data.ad.trim() : "Tesis";
    const kategori = kategoriLabel(data.kategori);
    const title = `${ad} — ${kategori} | MyLoungers`;
    const description = buildDescription(ad, kategori, bolgeText(data.ilce, data.sehir));

    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
    };
  } catch (err) {
    console.error("[tesis layout] generateMetadata failed", err);
    return FALLBACK_METADATA;
  }
}

export default function TesisSlugLayout({ children }: LayoutProps) {
  return children;
}
