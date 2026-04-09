import Link from "next/link";

const CONTACTS = [
  {
    icon: "📍",
    title: "Adres",
    value: "Sakarya Üniversitesi Teknoloji Geliştirme Bölgeleri (Teknokent) Esentepe Kampüsü B Blok No: B01",
  },
  {
    icon: "📞",
    title: "Telefon",
    value: "0541 826 08 26",
    href: "tel:+905418260826",
  },
  {
    icon: "✉️",
    title: "E-posta",
    value: "myloungers.info@gmail.com",
    href: "mailto:myloungers.info@gmail.com",
  },
];

export default function IletisimPage() {
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
                İletişim
              </h1>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.95 }}>
                Bizimle iletişime geçin
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

        <section style={{ display: "grid", gap: 12 }}>
          {CONTACTS.map((item) => (
            <article
              key={item.title}
              style={{
                borderRadius: 16,
                border: "1px solid #E2E8F0",
                background: "#fff",
                boxShadow: "0 6px 20px rgba(15,23,42,.06)",
                padding: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "#E6F7F7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <h2 style={{ margin: 0, fontSize: 20, color: "#0A1628", letterSpacing: "-.01em" }}>
                  {item.title}
                </h2>
              </div>
              {item.href ? (
                <a
                  href={item.href}
                  style={{
                    color: "#0ABAB5",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {item.value}
                </a>
              ) : (
                <p style={{ margin: 0, color: "#475569", fontSize: 15, lineHeight: 1.7 }}>
                  {item.value}
                </p>
              )}
            </article>
          ))}
        </section>

        <p style={{ margin: "14px 4px 0", fontSize: 13, color: "#64748B" }}>
          Hafta içi 09:00 - 18:00 saatleri arasında hizmet vermekteyiz.
        </p>
      </div>
    </main>
  );
}

