import type { Metadata } from "next";
import Link from "next/link";
import { KesfetBreadcrumb } from "../_components/KesfetShell";
import { SkuGrid } from "../_components/SkuCard";
import { fetchKesfetSkus, tesisDetailHref } from "../_lib/data";

export const metadata: Metadata = {
  title: "Bodrum Tekne Turları – Fiyatlar ve Rezervasyon | MyLoungers",
  description:
    "Bodrum'daki rezervasyona açık tekne turlarını inceleyin. Güncel fiyatları karşılaştırın, kalkış noktasını seçin ve online rezervasyon yapın.",
  openGraph: {
    title: "Bodrum Tekne Turları – Fiyatlar ve Rezervasyon | MyLoungers",
    description:
      "Bodrum'daki rezervasyona açık tekne turlarını inceleyin. Güncel fiyatları karşılaştırın, kalkış noktasını seçin ve online rezervasyon yapın.",
  },
  alternates: { canonical: "/kesfet/bodrum-tekne-turlari" },
};

export default async function BodrumTekneTurlariPage() {
  const skus = await fetchKesfetSkus("tekne");

  const itemList =
    skus.length === 0
      ? null
      : {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: skus.map((sku, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: sku.skuAd,
            url: `https://myloungers.com${tesisDetailHref(sku.tesisSlug)}`,
          })),
        };

  return (
    <>
      {itemList ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itemList).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <KesfetBreadcrumb
        items={[
          { href: "/", label: "Ana Sayfa" },
          { href: "/kesfet", label: "Keşfet" },
          { label: "Bodrum Tekne Turları" },
        ]}
      />
      <h1 className="kesfet-h1">Bodrum Tekne Turları</h1>
      <p className="kesfet-lead">
        Bodrum&apos;da rezervasyona açık tekne turu deneyimlerini tesis adı, bölge ve güncel fiyatla
        görüntüle. Fiyatlar canlı kayıtlardan gelir.
      </p>
      <div className="kesfet-inline-links">
        <Link href="/kesfet/bodrum-tekne-turu-fiyatlari">2026 tekne turu fiyatları →</Link>
        <Link href="/kesfet/firsatlar">Fırsatlar →</Link>
      </div>
      <SkuGrid
        skus={skus}
        emptyText="Şu an listelenecek aktif bir tekne turu bulunmuyor."
      />
    </>
  );
}
