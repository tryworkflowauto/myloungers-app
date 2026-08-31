import Link from "next/link";
import { SkuGrid } from "./_components/SkuCard";
import { fetchKesfetSkus, fetchYayindaRehberler } from "./_lib/data";

export default async function KesfetPage() {
  const [skus, rehberler] = await Promise.all([
    fetchKesfetSkus("all"),
    fetchYayindaRehberler(3),
  ]);

  return (
    <>
      <section className="kesfet-hero">
        <h1>MyLoungers Keşfet</h1>
        <p>
          Bodrum&apos;da tekne turu ve spa deneyimlerini canlı fiyatlarla incele, fırsatları takip
          et, rehberlerden yola çık.
        </p>
      </section>

      <div className="kesfet-hub-grid">
        <div className="kesfet-hub-card">
          <h3>Keşfet</h3>
          <p>Tekne turları ve spa &amp; masaj hizmetleri.</p>
          <div className="kesfet-hub-links">
            <Link href="/kesfet/bodrum-tekne-turlari">Tekne →</Link>
            <Link href="/kesfet/bodrum-spa-masaj">Spa →</Link>
          </div>
        </div>
        <Link href="/kesfet/firsatlar" className="kesfet-hub-card">
          <h3>Fırsatlar</h3>
          <p>Aktif kampanyalar ve rezervasyona açık deneyimler.</p>
        </Link>
        <Link href="/kesfet/rehberler" className="kesfet-hub-card">
          <h3>Rehberler</h3>
          <p>Bodrum tekne ve spa için yayınlanan rehberler.</p>
        </Link>
      </div>

      <section className="kesfet-sec">
        <h2 className="kesfet-h2">Rezervasyona hazır deneyimler</h2>
        <SkuGrid
          skus={skus}
          emptyText="Şu an listelenecek bir deneyim bulunmuyor. Tesis aramasından devam edebilirsin."
        />
      </section>

      {rehberler.length > 0 ? (
        <section className="kesfet-sec">
          <h2 className="kesfet-h2">MyLoungers rehberleri</h2>
          <div className="kesfet-sku-grid">
            {rehberler.map((r) => (
              <Link key={r.id} href={`/kesfet/rehberler/${r.slug}`} className="kesfet-rehber-card">
                <span className="kesfet-kategori-tag">
                  {r.kategori === "SPA" ? "Spa & Wellness" : "Tekne"}
                </span>
                <h3>{r.baslik}</h3>
                {r.ozet ? <p>{r.ozet}</p> : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div style={{ textAlign: "center", marginTop: 8 }}>
        <Link href="/arama" className="kesfet-cta">
          Tesis Aramaya Başla
        </Link>
      </div>
    </>
  );
}
