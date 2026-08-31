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
        <svg className="kesfet-hero-art" viewBox="0 0 520 340" aria-hidden>
          <g className="kesfet-art-waves" fill="none" stroke="#0ABAB5" strokeWidth="1.4" strokeLinecap="round">
            <path d="M240 268c28-14 52-14 80 0s52 14 80 0 52-14 80 0" />
            <path d="M250 288c26-12 50-12 76 0s50 12 76 0 50-12 76 0" />
            <path d="M270 306c22-10 44-10 68 0s44 10 68 0 44-10 68 0" />
          </g>
          <g className="kesfet-art-lotus" fill="none" stroke="#9BE7E3" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
            <path d="M438 198s-38-24-38-56c0-18 14-30 28-32 0 14 7 28 10 36 3-8 10-22 10-36 14 2 28 14 28 32 0 32-38 56-38 56z" />
            <path d="M418 164c8 6 14 10 20 10s12-4 20-10" />
          </g>
          <g className="kesfet-art-boat" fill="none" stroke="#7FDBD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M292 214c18 22 48 34 86 34 34 0 60-10 78-26" />
            <path d="M308 214h132c-8 14-28 24-66 24s-58-10-66-24z" />
            <path d="M372 214V118" />
            <path d="M372 124l62 78H372z" />
            <path d="M372 132l-48 70h48" />
            <circle cx="372" cy="114" r="4" />
          </g>
          <g className="kesfet-art-compass" fill="none" stroke="#C8F4F1" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="318" cy="96" r="46" />
            <circle cx="318" cy="96" r="34" />
            <path d="M318 50v8M318 134v8M272 96h8M356 96h8" />
            <path d="M318 62l8 34-8 34-8-34z" />
            <path d="M286 96l32 8 32-8-32-8z" />
            <circle cx="318" cy="96" r="4" fill="#0ABAB5" stroke="none" />
          </g>
        </svg>
        <div className="kesfet-hero-copy">
          <h1>MyLoungers Keşfet</h1>
          <p>
            Bodrum&apos;da tekne turu ve spa deneyimlerini canlı fiyatlarla incele, fırsatları takip
            et, rehberlerden yola çık.
          </p>
        </div>
        <div className="kesfet-hero-curve" />
      </section>

      <div className="kesfet-hub-grid">
        <Link href="/kesfet/bodrum-tekne-turlari" className="kesfet-hub-card kesfet-hub-teal">
          <span className="kesfet-hub-icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
              <path d="M12 8l2 4-2 4-2-4z" />
            </svg>
          </span>
          <h3>Deneyimleri Keşfet</h3>
          <p>Tekne turlarını ve spa deneyimlerini keşfet.</p>
          <span className="kesfet-hub-cta">Keşfetmeye Başla →</span>
        </Link>
        <Link href="/kesfet/firsatlar" className="kesfet-hub-card kesfet-hub-orange">
          <span className="kesfet-hub-icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.2 6.6H21l-5.4 4 2.1 6.4L12 15.5 6.3 19l2.1-6.4L3 8.6h6.8z" />
            </svg>
          </span>
          <h3>Fırsatları Yakala</h3>
          <p>Güncel fırsatları ve rezervasyona açık deneyimleri gör.</p>
          <span className="kesfet-hub-cta">Fırsatları Gör →</span>
        </Link>
        <Link href="/kesfet/rehberler" className="kesfet-hub-card kesfet-hub-purple">
          <span className="kesfet-hub-icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          </span>
          <h3>MyLoungers Rehberleri</h3>
          <p>Deneyimini seçmeden önce faydalı rehberlere göz at.</p>
          <span className="kesfet-hub-cta">Rehberleri Keşfet →</span>
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
