import type { Metadata } from "next";
import { KesfetBreadcrumb } from "../_components/KesfetShell";
import { SkuGrid } from "../_components/SkuCard";
import { fetchKesfetSkus, tesisDetailHref } from "../_lib/data";

export const metadata: Metadata = {
  title: "Bodrum Spa ve Masaj Hizmetleri | MyLoungers",
  description:
    "Bodrum'da masaj, hamam ve spa hizmetlerini keşfedin. Gerçek fiyatlarla, online rezervasyon imkanıyla MyLoungers'ta.",
  openGraph: {
    title: "Bodrum Spa ve Masaj Hizmetleri | MyLoungers",
    description:
      "Bodrum'da masaj, hamam ve spa hizmetlerini keşfedin. Gerçek fiyatlarla, online rezervasyon imkanıyla MyLoungers'ta.",
  },
  alternates: { canonical: "/kesfet/bodrum-spa-masaj" },
};

export default async function BodrumSpaMasajPage() {
  const skus = await fetchKesfetSkus("spa");

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
          { label: "Spa & Masaj" },
        ]}
      />
      <h1 className="kesfet-h1">Bodrum&apos;da Spa &amp; Masaj Hizmetlerini Keşfet</h1>
      <p className="kesfet-lead">
        Bodrum&apos;daki spa tesislerinin rezervasyona açık hizmetlerini, tesis adı ve güncel fiyatla
        incele.
      </p>
      <SkuGrid
        skus={skus}
        emptyText="Şu an listelenecek aktif bir spa hizmeti bulunmuyor."
      />
    </>
  );
}
