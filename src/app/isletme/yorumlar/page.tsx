"use client";

import { useState } from "react";

const NAVY = "#0A1628";
const TEAL = "#0ABAB5";
const ORANGE = "#F5821F";
const GRAY50 = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY300 = "#CBD5E1";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const GREEN = "#10B981";
const RED = "#EF4444";
const YELLOW = "#F59E0B";

// Mock - Puan barları
const PUAN_BARLARI = [
  { label: "Konum", deger: 9.8, width: 98 },
  { label: "Temizlik", deger: 9.6, width: 96 },
  { label: "Hizmet", deger: 9.4, width: 94 },
  { label: "Fiyat/Değer", deger: 9.0, width: 90 },
];

// Mock - Puan dağılımı
const PUAN_DAGILIM = [
  { yildiz: "★★★★★", width: 78, adet: 100 },
  { yildiz: "★★★★☆", width: 15, adet: 19 },
  { yildiz: "★★★☆☆", width: 5, adet: 6 },
  { yildiz: "★★☆☆☆", width: 2, adet: 2 },
  { yildiz: "★☆☆☆☆", width: 1, adet: 1 },
];

// Mock - Cevap şablonları
const SABLON_NORMAL = [
  { label: "👍 Teşekkür", metin: "Değerli misafirimiz, olumlu yorumunuz için çok teşekkür ederiz! Sizi tekrar ağırlamak için sabırsızlanıyoruz. 🏖️" },
  { label: "🌟 Sezon", metin: "Merhaba! Güzel geri bildiriminiz için teşekkürler. Ekibimizle paylaşacağız. Yeni sezona sizi bekliyoruz!" },
  { label: "😊 Genel", metin: "Sevgili misafirimiz, deneyiminizi bizimle paylaştığınız için teşekkür ederiz. Keyifli bir tatil geçirdiğinize memnun olduk!" },
];
const SABLON_SIKAYET = [
  { label: "🙏 Özür", metin: "Sayın misafirimiz, yaşadığınız deneyim için özür dileriz. Geri bildiriminizi dikkate alıyor ve ekibimizle değerlendireceğiz. Sizi daha iyi bir deneyimle ağırlamak isteriz." },
  { label: "✅ Önlem Alındı", metin: "Merhaba, yorumunuz için teşekkür ederiz. Belirttiğiniz konuları inceledik ve gerekli önlemleri aldık. Bizi tekrar ziyaret etmenizi umuyoruz." },
];

// Mock - Yorumlar
type YorumTip = "yeni" | "cevaplanmis" | "sikayet";
const YORUMLAR: Array<{
  id: number;
  tip: YorumTip;
  avatar: string;
  avatarBg: string;
  ad: string;
  tarih: string;
  dogrulandi: boolean;
  rezervasyon: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  puan: number;
  puanBg: string;
  yildiz: string;
  altPuanlar?: Array<{ label: string; deger: number }>;
  metin: string;
  cevap?: { label: string; metin: string };
}> = [
  {
    id: 1,
    tip: "yeni",
    avatar: "AY",
    avatarBg: "linear-gradient(135deg,#6366F1,#4338CA)",
    ad: "Ayşe Yıldız",
    tarih: "10 Mart 2026",
    dogrulandi: true,
    rezervasyon: "Silver Bölge · S-22",
    badge: "🔔 Yeni",
    badgeBg: "#FFF7ED",
    badgeColor: ORANGE,
    puan: 9.8,
    puanBg: TEAL,
    yildiz: "★★★★★",
    altPuanlar: [{ label: "Konum", deger: 10 }, { label: "Temizlik", deger: 9.5 }, { label: "Hizmet", deger: 10 }, { label: "Fiyat", deger: 9.5 }],
    metin: "Muhteşem deneyim! Şezlonglar çok rahat, personel ilgili ve güleryüzlü. Kahvaltı enfesti, özellikle börekler harika. Kesinlikle tekrar geleceğiz! 🌊",
  },
  {
    id: 2,
    tip: "yeni",
    avatar: "MK",
    avatarBg: "linear-gradient(135deg,#10B981,#065F46)",
    ad: "Mehmet Kaya",
    tarih: "9 Mart 2026",
    dogrulandi: true,
    rezervasyon: "İskele Bölge · İ-5",
    badge: "🔔 Yeni",
    badgeBg: "#FFF7ED",
    badgeColor: ORANGE,
    puan: 9.5,
    puanBg: TEAL,
    yildiz: "★★★★★",
    altPuanlar: [{ label: "Konum", deger: 10 }, { label: "Temizlik", deger: 9 }, { label: "Hizmet", deger: 9.5 }, { label: "Fiyat", deger: 9 }],
    metin: "İskele şezlongları harika. Denize çok yakın ve temiz. Garsonlar çok hızlı servis yapıyor. Kesinlikle tekrar geleceğim. Bodrum'da en sevdiğim yer oldu!",
  },
  {
    id: 3,
    tip: "sikayet",
    avatar: "SA",
    avatarBg: "linear-gradient(135deg," + RED + ",#7F1D1D)",
    ad: "Selin Arslan",
    tarih: "8 Mart 2026",
    dogrulandi: true,
    rezervasyon: "VIP Bölge · V-8",
    badge: "⚠️ Şikayet",
    badgeBg: "#FEF2F2",
    badgeColor: RED,
    puan: 5.2,
    puanBg: RED,
    yildiz: "★★★☆☆",
    altPuanlar: [{ label: "Konum", deger: 8 }, { label: "Temizlik", deger: 4 }, { label: "Hizmet", deger: 5 }, { label: "Fiyat", deger: 4 }],
    metin: "VIP bölge fiyatına göre beklentilerimi karşılamadı. Şezlonglar yeterince temiz değildi, garson 25 dakika sonra geldi. Fiyatlar çok yüksek bu hizmet için. Daha dikkatli olunmasını bekliyordum.",
  },
  {
    id: 4,
    tip: "cevaplanmis",
    avatar: "BT",
    avatarBg: "linear-gradient(135deg," + YELLOW + ",#92400E)",
    ad: "Burak Türk",
    tarih: "5 Mart 2026",
    dogrulandi: true,
    rezervasyon: "Silver · S-14",
    badge: "✓ Cevaplandı",
    badgeBg: "#DCFCE7",
    badgeColor: GREEN,
    puan: 9.7,
    puanBg: TEAL,
    yildiz: "★★★★★",
    metin: "Bodrum'da gittiğim en iyi beach club. Rezervasyon sistemi çok pratik, telefonsuz hallettim her şeyi. Garsonlar QR'dan siparişimi aldı, 10 dakikada geldi. Harika!",
    cevap: { label: "🏖️ İşletme Yanıtı · 6 Mart 2026", metin: "Değerli Burak Bey, güzel yorumunuz ve dijital deneyim hakkındaki geri bildiriminiz için çok teşekkür ederiz! MyLoungers sistemi sayesinde misafirlerimize daha hızlı hizmet verebilmekten mutluluk duyuyoruz. Yeni sezonda sizi bekliyoruz! 🌊" },
  },
];

export default function IsletmeYorumlarPage() {
  const [activeTab, setActiveTab] = useState("tum");
  const [cevapFormOpen, setCevapFormOpen] = useState<Record<number, boolean>>({});
  const [cevapMetin, setCevapMetin] = useState<Record<number, string>>({});
  const [cevaplar, setCevaplar] = useState<Record<number, { label: string; metin: string }>>({});
  const [duzenleModu, setDuzenleModu] = useState<Record<number, boolean>>({});

  const toggleCevapForm = (id: number) => {
    const opening = !cevapFormOpen[id];
    setCevapFormOpen((p) => ({ ...p, [id]: opening }));
    if (opening) {
      const mevcut = cevaplar[id] ?? YORUMLAR.find((y) => y.id === id)?.cevap;
      if (mevcut) {
        setCevapMetin((m) => ({ ...m, [id]: mevcut.metin }));
        setDuzenleModu((d) => ({ ...d, [id]: true }));
      } else {
        setCevapMetin((m) => ({ ...m, [id]: "" }));
        setDuzenleModu((d) => ({ ...d, [id]: false }));
      }
    }
  };

  const sablonEkle = (id: number, metin: string) => setCevapMetin((m) => ({ ...m, [id]: metin }));

  const cevapGonder = (id: number) => {
    const metin = cevapMetin[id]?.trim();
    if (!metin) return;
    setCevaplar((c) => ({ ...c, [id]: { label: "🏖️ İşletme Yanıtı · Şimdi", metin } }));
    setCevapFormOpen((o) => ({ ...o, [id]: false }));
    setCevapMetin((m) => ({ ...m, [id]: "" }));
    setDuzenleModu((d) => ({ ...d, [id]: false }));
  };

  const FILTRELER = [
    { key: "tum", label: "Tümü", count: 128 },
    { key: "bekleyen", label: "⏳ Bekleyen", count: 3, borderColor: ORANGE, textColor: ORANGE },
    { key: "cevaplanan", label: "✅ Cevaplanan", count: 112 },
    { key: "sikayet", label: "⚠️ Şikayetler", count: 2 },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", flexDirection: "column", minHeight: "100%" }}>
      {/* TOPBAR */}
      <header style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Kullanıcı Yorumları</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>128 yorum · 3 cevaplanmayı bekliyor · Yorumlar silinemez</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>📥 Excel İndir</button>
        </div>
      </header>

      <div style={{ padding: 24, flex: 1 }}>
        {/* PUAN KARTI */}
        <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 24, marginBottom: 16, display: "grid", gridTemplateColumns: "180px 1fr auto", gap: 32, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: TEAL, lineHeight: 1 }}>9.6</div>
            <div style={{ fontSize: 20, color: YELLOW, letterSpacing: 3, marginTop: 6 }}>★★★★★</div>
            <div style={{ fontSize: 12, color: GRAY400, marginTop: 4 }}>128 doğrulanmış yorum</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PUAN_BARLARI.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                <span style={{ width: 80, color: GRAY600, fontWeight: 600 }}>{b.label}</span>
                <div style={{ flex: 1, height: 8, background: GRAY100, borderRadius: 20, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: b.width + "%", background: `linear-gradient(90deg,${TEAL},${GREEN})`, borderRadius: 20 }} />
                </div>
                <span style={{ width: 28, fontWeight: 700, color: NAVY, textAlign: "right" }}>{b.deger}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 180 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, marginBottom: 8 }}>Puan Dağılımı</div>
            {PUAN_DAGILIM.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                <span style={{ width: 60, color: YELLOW }}>{d.yildiz}</span>
                <div style={{ flex: 1, height: 6, background: GRAY100, borderRadius: 20, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: d.width + "%", background: YELLOW, borderRadius: 20 }} />
                </div>
                <span style={{ width: 24, color: GRAY400, textAlign: "right", fontSize: 10 }}>{d.adet}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FİLTRE */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {FILTRELER.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveTab(f.key)}
              style={{
                padding: "7px 16px",
                borderRadius: 20,
                border: `1.5px solid ${activeTab === f.key ? NAVY : f.borderColor ?? GRAY200}`,
                background: activeTab === f.key ? NAVY : "white",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                color: activeTab === f.key ? "white" : f.textColor ?? GRAY600,
              }}
            >
              {f.label} <span style={{ fontSize: 10, opacity: activeTab === f.key ? 0.7 : 1 }}>({f.count})</span>
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <select style={{ padding: "7px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 12, background: "white" }}>
              <option>En Yeni</option>
              <option>En Eski</option>
              <option>En Yüksek Puan</option>
              <option>En Düşük Puan</option>
            </select>
            <select style={{ padding: "7px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 12, background: "white" }}>
              <option>Tüm Puanlar</option>
              <option>5 Yıldız</option>
              <option>4 Yıldız</option>
              <option>3 Yıldız ve altı</option>
            </select>
          </div>
        </div>

        {/* YORUM LİSTESİ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {YORUMLAR.map((y) => {
            const mevcutCevap = cevaplar[y.id] ?? y.cevap;
            const formAcik = cevapFormOpen[y.id];
            const isSikayet = y.tip === "sikayet";
            return (
              <div
                key={y.id}
                style={{
                  background: "white",
                  borderRadius: 14,
                  border: `1px solid ${GRAY200}`,
                  overflow: "hidden",
                  borderLeft: `3px solid ${mevcutCevap ? GREEN : isSikayet ? RED : ORANGE}`,
                }}
              >
                {isSikayet && (
                  <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 10, padding: "10px 14px", margin: "0 18px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#991B1B" }}>
                    ⚠️ Bu yorum düşük puan içeriyor — hızlı yanıt vermeniz önerilir.
                  </div>
                )}
                <div style={{ padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white", flexShrink: 0, background: y.avatarBg }}>{y.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{y.ad}</span>
                      <span style={{ fontSize: 11, color: GRAY400 }}>{y.tarih}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#DCFCE7", color: "#16A34A" }}>✓ {y.dogrulandi ? (y.tip === "yeni" ? "Doğrulanmış Rezervasyon" : "Doğrulanmış") : ""}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: GRAY100, color: GRAY600 }}>{y.rezervasyon}</span>
                      <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: y.badgeColor, background: y.badgeBg, padding: "2px 8px", borderRadius: 20 }}>{y.badge}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <span style={{ background: y.puanBg, color: "white", fontSize: 12, fontWeight: 900, padding: "3px 10px", borderRadius: 8 }}>{y.puan}</span>
                      <span style={{ color: isSikayet ? GRAY300 : YELLOW, fontSize: 13, letterSpacing: 2 }}>{y.yildiz}</span>
                      {y.altPuanlar && (
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          {y.altPuanlar.map((ap, ai) => (
                            <span key={ai} style={{ fontSize: 10, color: GRAY400 }}>{ap.label} <span style={{ fontWeight: 700, color: NAVY }}>{ap.deger}</span></span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: GRAY600, lineHeight: 1.6 }}>{y.metin}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => toggleCevapForm(y.id)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: mevcutCevap ? `1px solid ${GRAY200}` : "none", background: mevcutCevap ? GRAY100 : TEAL, color: mevcutCevap ? GRAY800 : "white", cursor: "pointer" }}>{mevcutCevap ? "✏️ Düzenle" : "💬 Cevapla"}</button>
                  </div>
                </div>

                {/* Mevcut cevap */}
                {mevcutCevap && !formAcik && (
                  <div style={{ padding: "12px 18px 12px 56px", background: "#F0FFFE", borderTop: "1px solid #CCFBF1" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: TEAL, marginBottom: 4 }}>{mevcutCevap.label}</div>
                    <div style={{ fontSize: 12, color: NAVY, lineHeight: 1.6 }}>{mevcutCevap.metin}</div>
                  </div>
                )}

                {/* Cevap formu */}
                {formAcik && (
                  <div style={{ padding: "12px 18px", borderTop: `1px solid ${GRAY100}`, background: GRAY50 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isSikayet ? RED : GRAY600, marginBottom: 6 }}>{isSikayet ? "⚠️ Şikayet Yanıtı — Dikkatli ve yapıcı bir dil kullanın" : "İşletme Cevabı"}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {(isSikayet ? SABLON_SIKAYET : SABLON_NORMAL).map((s, si) => (
                        <button key={si} onClick={() => sablonEkle(y.id, s.metin)} style={{ padding: "4px 10px", border: `1px solid ${GRAY200}`, borderRadius: 20, background: "white", fontSize: 10, fontWeight: 600, cursor: "pointer", color: GRAY600 }}>{s.label}</button>
                      ))}
                    </div>
                    <textarea value={cevapMetin[y.id] ?? ""} onChange={(e) => setCevapMetin((m) => ({ ...m, [y.id]: e.target.value }))} placeholder={isSikayet ? "Şikayete yanıtınızı yazın..." : "İşletme adına cevabınızı yazın..."} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 12, resize: "vertical", minHeight: 80 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <span style={{ fontSize: 10, color: GRAY400 }}>{duzenleModu[y.id] ? "Cevabı düzenleyip tekrar gönderin" : 'Müşteri sayfasında "İşletme Yanıtı" olarak görünecek'}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => toggleCevapForm(y.id)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
                        <button onClick={() => cevapGonder(y.id)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>{duzenleModu[y.id] ? "💾 Güncelle" : "📤 Gönder"}</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
