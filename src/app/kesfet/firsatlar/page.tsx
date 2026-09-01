import type { Metadata } from "next";
import Link from "next/link";
import { KesfetBreadcrumb } from "../_components/KesfetShell";
import { SkuGrid } from "../_components/SkuCard";
import { fetchAktifKampanyalar, fetchKesfetSkus, tesisDetailHref } from "../_lib/data";

export const metadata: Metadata = {
  title: "Bodrum Fırsatları ve Rezervasyona Açık Deneyimler | MyLoungers",
  description:
    "Bodrum'da tekne turu ve spa deneyimlerindeki güncel fırsatları kontrol edin. Rezervasyona açık deneyimleri ve gerçek fiyatları MyLoungers'ta keşfedin.",
  openGraph: {
    title: "Bodrum Fırsatları ve Rezervasyona Açık Deneyimler | MyLoungers",
    description:
      "Bodrum'da tekne turu ve spa deneyimlerindeki güncel fırsatları kontrol edin. Rezervasyona açık deneyimleri ve gerçek fiyatları MyLoungers'ta keşfedin.",
  },
};

function kampanyaTarih(bas: string | null, bit: string | null): string {
  if (!bas && !bit) return "";
  const a = bas ?? "…";
  const b = bit ?? "…";
  return `${a} — ${b}`;
}

export default async function FirsatlarPage() {
  const kampanyalar = await fetchAktifKampanyalar();

  if (kampanyalar.length > 0) {
    return (
      <>
        <KesfetBreadcrumb
          items={[
            { href: "/", label: "Ana Sayfa" },
            { href: "/kesfet", label: "Keşfet" },
            { label: "Fırsatlar" },
          ]}
        />
        <h1 className="kesfet-h1">Fırsatlar</h1>
        <p className="kesfet-lead">Şu an misafirlere gösterilen aktif kampanyalar.</p>
        <div className="kesfet-sku-grid">
          {kampanyalar.map((k) => (
            <Link key={k.id} href={tesisDetailHref(k.tesisSlug)} className="kesfet-kampanya">
              <h3>{k.ad}</h3>
              <p>
                {k.tesisAd}
                {k.indirimOrani > 0 ? ` · %${k.indirimOrani}` : ""}
              </p>
              {k.aciklama ? <p style={{ marginTop: 6 }}>{k.aciklama}</p> : null}
              {kampanyaTarih(k.baslangic, k.bitis) ? (
                <p style={{ marginTop: 6 }}>{kampanyaTarih(k.baslangic, k.bitis)}</p>
              ) : null}
            </Link>
          ))}
        </div>
      </>
    );
  }

  const skus = await fetchKesfetSkus("all");

  return (
    <>
      <KesfetBreadcrumb
        items={[
          { href: "/", label: "Ana Sayfa" },
          { href: "/kesfet", label: "Keşfet" },
          { label: "Fırsatlar" },
        ]}
      />
      <h1 className="kesfet-h1">Fırsatlar</h1>
      <div className="kesfet-empty">
        Şu an aktif özel fırsat bulunmuyor. Rezervasyona açık deneyimleri keşfedebilirsin.
      </div>
      <SkuGrid
        skus={skus}
        emptyText="Şu an listelenecek bir deneyim bulunmuyor."
      />
    </>
  );
}
