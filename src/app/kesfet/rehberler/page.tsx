import type { Metadata } from "next";
import Link from "next/link";
import { KesfetBreadcrumb } from "../_components/KesfetShell";
import { fetchYayindaRehberler, type KesfetRehber } from "../_lib/data";

export const metadata: Metadata = {
  title: "Bodrum Tekne ve Spa Rehberleri | MyLoungers",
  description:
    "Tekne turu seçimi ve spa deneyimleri hakkında faydalı rehberlerle doğru kararı verin, gerçek rezervasyon seçeneklerine ulaşın.",
  openGraph: {
    title: "Bodrum Tekne ve Spa Rehberleri | MyLoungers",
    description:
      "Tekne turu seçimi ve spa deneyimleri hakkında faydalı rehberlerle doğru kararı verin, gerçek rezervasyon seçeneklerine ulaşın.",
  },
  alternates: { canonical: "/kesfet/rehberler" },
};

function RehberList({ items }: { items: KesfetRehber[] }) {
  return (
    <div className="kesfet-sku-grid">
      {items.map((r) => (
        <Link key={r.id} href={`/kesfet/rehberler/${r.slug}`} className="kesfet-rehber-card">
          <h3>{r.baslik}</h3>
          {r.ozet ? <p>{r.ozet}</p> : null}
        </Link>
      ))}
    </div>
  );
}

export default async function RehberlerPage() {
  const rehberler = await fetchYayindaRehberler();
  const tekne = rehberler.filter((r) => r.kategori === "TEKNE");
  const spa = rehberler.filter((r) => r.kategori === "SPA");

  return (
    <>
      <KesfetBreadcrumb
        items={[
          { href: "/", label: "Ana Sayfa" },
          { href: "/kesfet", label: "Keşfet" },
          { label: "Rehberler" },
        ]}
      />
      <h1 className="kesfet-h1">MyLoungers Rehberleri</h1>
      {rehberler.length === 0 ? (
        <div className="kesfet-empty">
          Şu an yayınlanmış bir rehber bulunmuyor. Tekne turları ve spa hizmetlerine Keşfet
          üzerinden ulaşabilirsin.
        </div>
      ) : (
        <>
          {tekne.length > 0 ? (
            <section className="kesfet-sec">
              <h2 className="kesfet-h2">Tekne</h2>
              <RehberList items={tekne} />
            </section>
          ) : null}
          {spa.length > 0 ? (
            <section className="kesfet-sec">
              <h2 className="kesfet-h2">Spa &amp; Wellness</h2>
              <RehberList items={spa} />
            </section>
          ) : null}
        </>
      )}
    </>
  );
}
