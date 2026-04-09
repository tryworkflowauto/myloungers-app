import Link from "next/link";

const SECTIONS = [
  {
    title: "Biz Kimiz",
    icon: "🏢",
    text: "2014 yılında Sakarya Teknokent'te kurulan Reklamotv Bilişim Teknoloji olarak, Türkiye'nin dijital dönüşümüne katkı sağlayan yenilikçi çözümler geliştiriyoruz. On yılı aşkın teknoloji deneyimimizi turizm sektörüne taşıyarak 2024 yılında MyLoungers'ı hayata geçirdik. MyLoungers; plaj kulüpleri, beach club'lar ve otel havuzlarında şezlong rezervasyonunu dijitalleştiren, hem misafirlere hem tesis sahiplerine kolaylık sunan Türkiye'nin ilk ve lider platformudur.",
  },
  {
    title: "Misyonumuz",
    icon: "🎯",
    text: "Türkiye'nin tüm kıyı destinasyonlarında şezlong rezervasyonunu standart hale getirmek, tatilcilere stressiz bir deniz keyfi yaşatmak, tesis sahiplerine ise güçlü bir dijital yönetim altyapısı sunmak.",
  },
  {
    title: "Vizyonumuz",
    icon: "🚀",
    text: "Akdeniz'in lider şezlong rezervasyon platformu olarak, Türkiye'den dünyaya açılan bir turizm teknolojisi markası olmak.",
  },
];

export default function HakkimizdaPage() {
  return (
    <main
      style={{
        background: "#F8FAFC",
        minHeight: "calc(100vh - 140px)",
        padding: "36px 16px 56px",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <section
          style={{
            borderRadius: 18,
            background: "#0f172a",
            color: "#fff",
            padding: "16px 24px",
            boxShadow: "0 10px 30px rgba(10,186,181,.2)",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div>
              <h1 style={{ margin: "0 0 6px", fontSize: 30, lineHeight: 1.15, letterSpacing: "-.02em" }}>
                Hakkımızda
              </h1>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.95 }}>
                Türkiye'nin şezlong rezervasyon platformu
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
            gap: 14,
          }}
        >
          {SECTIONS.map((item) => (
            <article
              key={item.title}
              style={{
                borderRadius: 16,
                border: "1px solid #E2E8F0",
                background: "#fff",
                boxShadow: "0 6px 20px rgba(15,23,42,.06)",
                padding: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "#E6F7F7",
                    color: "#089490",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <h2 style={{ margin: 0, fontSize: 22, color: "#0A1628", letterSpacing: "-.01em" }}>{item.title}</h2>
              </div>
              <p style={{ margin: 0, color: "#475569", fontSize: 15, lineHeight: 1.75 }}>{item.text}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

