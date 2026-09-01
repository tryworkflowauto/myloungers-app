import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { createClient } from "@/utils/supabase/server";
import { footerLegalQueryFromLang } from "@/lib/footer-legal-query";
import {
  fetchYasalMetinBySlug,
  isLegalPageEnglish,
  pickYasalMetinForLang,
} from "@/lib/yasal-metinler";

const SLUG = "gizlilik";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const supabase = await createClient();
  const row = await fetchYasalMetinBySlug(supabase, SLUG);
  if (!row) return { title: "MyLoungers", alternates: { canonical: "/gizlilik" } };
  const en = isLegalPageEnglish(sp.lang);
  const { title, description } = pickYasalMetinForLang(row, en);
  return { title: `${title} | MyLoungers`, description, alternates: { canonical: "/gizlilik" } };
}

export default async function GizlilikPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const en = isLegalPageEnglish(sp.lang);
  const supabase = await createClient();
  const row = await fetchYasalMetinBySlug(supabase, SLUG);
  const footerLegalQuery = footerLegalQueryFromLang(en ? "en" : "tr");

  if (!row) {
    return (
      <LegalPageLayout title="MyLoungers" footerLegalQuery={footerLegalQuery}>
        <p className="mb-4 leading-relaxed">Yasal metin yüklenemedi.</p>
      </LegalPageLayout>
    );
  }

  const { title, html } = pickYasalMetinForLang(row, en);

  return (
    <LegalPageLayout title={title} footerLegalQuery={footerLegalQuery}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </LegalPageLayout>
  );
}
