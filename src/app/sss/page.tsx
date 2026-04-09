"use client";

import Link from "next/link";
import { useState } from "react";

type FaqItem = {
  q: string;
  a: string;
};

const FAQS: FaqItem[] = [
  {
    q: "MyLoungers nedir?",
    a: "Türkiye'nin plaj kulüpleri, beach club'lar ve otel havuzları için online şezlong rezervasyon platformudur. Tek tıkla önceden rezervasyon yaptırabilir, gideceğiniz tesiste şezlongunuzun hazır olmasını sağlayabilirsiniz.",
  },
  {
    q: "Rezervasyon nasıl yapılır?",
    a: "Ana sayfadan bölge, tesis tipi ve tarih seçerek arama yapın. Beğendiğiniz tesisi seçin, şezlong konumunuzu belirleyin ve ödemeyi tamamlayın. Rezervasyon onayınız e-posta ile iletilir.",
  },
  {
    q: "Ödeme güvenli mi?",
    a: "Evet. Tüm ödemeler Paratika altyapısı üzerinden 3D Secure ile şifreli olarak işlenir. Kart bilgileriniz MyLoungers sisteminde saklanmaz.",
  },
  {
    q: "Rezervasyonumu nasıl iptal edebilirim?",
    a: "Profil sayfanızdaki Rezervasyonlarım bölümünden ilgili rezervasyonu bulup İptal Et butonuna tıklayabilirsiniz. İptal koşulları tesise göre değişiklik gösterebilir.",
  },
  {
    q: "İptal durumunda param iade edilir mi?",
    a: "İade politikası tesise ve rezervasyon tarihine göre değişir. Genel olarak rezervasyon tarihinden 48 saat önce yapılan iptallerde ücret iadesi yapılmaktadır.",
  },
  {
    q: "Hangi şehirlerde hizmet veriyorsunuz?",
    a: "Şu anda Bodrum, Antalya, Marmaris, Fethiye ve çevre ilçelerde aktif tesislerimiz bulunmaktadır. Yeni destinasyonlar sürekli eklenmektedir.",
  },
  {
    q: "Tesis sahibiyim, platformunuza nasıl katılabilirim?",
    a: "Ana sayfanın üst menüsündeki Başvuru Formu bağlantısına tıklayarak tesis başvurusu yapabilirsiniz. Ekibimiz en kısa sürede sizinle iletişime geçecektir.",
  },
  {
    q: "Mobil uygulama var mı?",
    a: "Evet, MyLoungers iOS ve Android uygulamaları yakında App Store ve Google Play'de kullanıma sunulacaktır.",
  },
];

export default function SssPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <main
      style={{
        background: "#F8FAFC",
        minHeight: "calc(100vh - 140px)",
        padding: "36px 16px 56px",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div
          style={{
            borderRadius: 18,
            background: "#0f172a",
            color: "#fff",
            padding: "16px 24px",
            boxShadow: "0 10px 30px rgba(10,186,181,.25)",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div>
              <h1 style={{ margin: "0 0 6px", fontSize: 30, lineHeight: 1.15, letterSpacing: "-.02em" }}>
                Sıkça Sorulan Sorular
              </h1>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.95 }}>
                Rezervasyon, ödeme ve iptal süreçleriyle ilgili en çok merak edilen sorular.
              </p>
            </div>
            <img src="/logo.png" alt="MyLoungers" style={{ height: 88, width: "auto", display: "block", filter: "brightness(0) invert(1)" }} />
          </div>
        </div>

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
            borderRadius: 16,
            border: "1px solid #E2E8F0",
            background: "#fff",
            overflow: "hidden",
            boxShadow: "0 6px 20px rgba(15,23,42,.06)",
          }}
        >
          {FAQS.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={item.q} style={{ borderBottom: i < FAQS.length - 1 ? "1px solid #EDF2F7" : "none" }}>
                <button
                  type="button"
                  onClick={() => setOpenIdx((prev) => (prev === i ? null : i))}
                  aria-expanded={isOpen}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    background: isOpen ? "#F0FDFA" : "#fff",
                    color: "#0A1628",
                    padding: "18px 18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  <span>{item.q}</span>
                  <span
                    aria-hidden
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "rgba(10,186,181,.12)",
                      color: "#089490",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {isOpen ? "-" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: "0 18px 18px",
                      color: "#475569",
                      fontSize: 15,
                      lineHeight: 1.7,
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}

