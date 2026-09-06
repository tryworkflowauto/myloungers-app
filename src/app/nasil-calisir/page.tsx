import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nasıl Çalışır? | MyLoungers",
  description: "MyLoungers'ta 3 adımda tatil rezervasyonu: tesisi seçin, yerinizi belirleyin, güvenli ödeme ile onaylayın. Gerçek fiyatlar ve anlık müsaitlik.",
  alternates: { canonical: "/nasil-calisir" },
  openGraph: {
    title: "Nasıl Çalışır? | MyLoungers",
    description: "MyLoungers'ta 3 adımda tatil rezervasyonu: tesisi seçin, yerinizi belirleyin, güvenli ödeme ile onaylayın. Gerçek fiyatlar ve anlık müsaitlik.",
    url: "/nasil-calisir",
  },
};

const STEPS = [
  {
    title: "Tesis Seç",
    icon: "🔍",
    text: "Konum, tesis tipi veya tarihe göre filtrele. Gerçek kullanıcı yorumlarını ve puanlarını gör. Anlık müsaitlik durumunu kontrol et.",
  },
  {
    title: "Yerini Seç",
    icon: "📍",
    text: "Harita veya tesis planı üzerinden masanızı, şezlongunuzu, kabin veya seansınızı seçin. Konum, kategori veya paket tercihini yapın. İsterseniz birden fazla yeri aynı anda rezerve edin.",
  },
  {
    title: "Öde & Onayla",
    icon: "✅",
    text: "Güvenli ödeme yap, rezervasyon onayını göster. Rezervasyon kodu ile hızlı giriş.",
  },
];

export default function NasilCalisirPage() {
  return (
    <main
      style={{
        background: "#F8FAFC",
        minHeight: "calc(100vh - 140px)",
        padding: "36px 16px 56px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <section
          style={{
            borderRadius: 18,
            background: "#0f172a",
            color: "#fff",
            padding: "16px 24px",
            boxShadow: "0 10px 30px rgba(10,186,181,.2)",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div>
              <h1 style={{ margin: "0 0 6px", fontSize: 32, lineHeight: 1.15, letterSpacing: "-.02em" }}>
                Nasıl Çalışır?
              </h1>
              <p style={{ margin: 0, fontSize: 15, opacity: 0.95 }}>
                3 adımda tatil rezervasyonu
              </p>
            </div>
            <img
              src="/logo.png"
              alt="MyLoungers"
              style={{ height: 88, width: "auto", display: "block", filter: "brightness(0) invert(1)" }}
            />
          </div>
        </section>

        <div style={{ margin: "4px 0 14px" }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "#0ABAB5",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {STEPS.map((step) => (
            <article
              key={step.title}
              style={{
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 16,
                padding: 18,
                boxShadow: "0 6px 20px rgba(15,23,42,.06)",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "#E6F7F7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 12,
                }}
              >
                {step.icon}
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: 20, lineHeight: 1.2, color: "#0A1628" }}>
                {step.title}
              </h2>
              <p style={{ margin: 0, color: "#475569", fontSize: 15, lineHeight: 1.7 }}>
                {step.text}
              </p>
            </article>
          ))}
        </section>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link
            href="/arama"
            style={{
              textDecoration: "none",
              background: "#0ABAB5",
              color: "#fff",
              borderRadius: 12,
              padding: "13px 24px",
              fontSize: 15,
              fontWeight: 800,
              boxShadow: "0 8px 20px rgba(10,186,181,.3)",
            }}
          >
            Tesis Aramaya Başla
          </Link>
        </div>
      </div>
    </main>
  );
}

