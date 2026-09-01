import type { Metadata } from "next";
import Link from "next/link";
import { KesfetBreadcrumb } from "../_components/KesfetShell";
import {
  fetchKesfetSkus,
  formatKesfetFiyat,
  skuLoc,
  tesisDetailHref,
  type KesfetSku,
} from "../_lib/data";

export const metadata: Metadata = {
  title: "Bodrum Tekne Turu Fiyatları | MyLoungers",
  description:
    "Bodrum tekne turu fiyatlarını kişi başı ve tüm tekne seçenekleriyle karşılaştırın. Güncel fiyatları inceleyin ve online rezervasyon yapın.",
  openGraph: {
    title: "Bodrum Tekne Turu Fiyatları | MyLoungers",
    description:
      "Bodrum tekne turu fiyatlarını kişi başı ve tüm tekne seçenekleriyle karşılaştırın. Güncel fiyatları inceleyin ve online rezervasyon yapın.",
  },
  alternates: { canonical: "/kesfet/bodrum-tekne-turu-fiyatlari" },
};

function PriceTable({ rows }: { rows: KesfetSku[] }) {
  if (rows.length === 0) {
    return <div className="kesfet-empty">Bu fiyat grubunda kayıt bulunmuyor.</div>;
  }
  return (
    <div className="kesfet-table-wrap">
      <table className="kesfet-table">
        <thead>
          <tr>
            <th>Tesis</th>
            <th>Hizmet</th>
            <th>Bölge</th>
            <th>Fiyat</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((sku) => (
            <tr key={sku.id}>
              <td>
                <Link href={tesisDetailHref(sku.tesisSlug)}>{sku.tesisAd}</Link>
              </td>
              <td>{sku.skuAd}</td>
              <td>{skuLoc(sku) || "—"}</td>
              <td>{formatKesfetFiyat(sku)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function BodrumTekneTuruFiyatlariPage() {
  const skus = await fetchKesfetSkus("tekne");
  const sabit = skus.filter((s) => s.tumTekneSabitFiyat);
  const kisiBasi = skus.filter((s) => !s.tumTekneSabitFiyat);

  return (
    <>
      <KesfetBreadcrumb
        items={[
          { href: "/", label: "Ana Sayfa" },
          { href: "/kesfet", label: "Keşfet" },
          { href: "/kesfet/bodrum-tekne-turlari", label: "Tekne Turları" },
          { label: "Fiyatlar" },
        ]}
      />
      <h1 className="kesfet-h1">Bodrum Tekne Turu Fiyatları 2026</h1>
      <p className="kesfet-lead">
        Aşağıdaki fiyatlar canlı kayıtlardan alınır. Tüm tekne sabit fiyatlar ile kişi başı fiyatlar
        ayrı listelenir.
      </p>
      <div className="kesfet-inline-links">
        <Link href="/kesfet/bodrum-tekne-turlari">Tekne turlarını kart olarak gör →</Link>
        <Link href="/kesfet/firsatlar">Fırsatlar →</Link>
      </div>

      <section className="kesfet-sec">
        <h2 className="kesfet-h2">Tüm tekne sabit fiyatlar</h2>
        <PriceTable rows={sabit} />
      </section>

      <section className="kesfet-sec">
        <h2 className="kesfet-h2">Kişi başı fiyatlar</h2>
        <PriceTable rows={kisiBasi} />
      </section>
    </>
  );
}
