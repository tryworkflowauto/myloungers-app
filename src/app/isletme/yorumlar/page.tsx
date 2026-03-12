"use client";

import { useState, useEffect } from "react";

const NAVY   = "#0A1628";
const TEAL   = "#0ABAB5";
const ORANGE = "#F5821F";
const GRAY50  = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const GREEN  = "#10B981";
const RED    = "#EF4444";
const YELLOW = "#F59E0B";

// ── Static display data ───────────────────────────────────────────────────────
const PUAN_BARLARI = [
  { label: "Konum",      deger: 9.8, width: 98 },
  { label: "Temizlik",   deger: 9.6, width: 96 },
  { label: "Hizmet",     deger: 9.4, width: 94 },
  { label: "Fiyat/Değer",deger: 9.0, width: 90 },
];
const PUAN_DAGILIM = [
  { yildiz: "★★★★★", width: 78, adet: 100, stars: 5 },
  { yildiz: "★★★★☆", width: 15, adet: 19,  stars: 4 },
  { yildiz: "★★★☆☆", width: 5,  adet: 6,   stars: 3 },
  { yildiz: "★★☆☆☆", width: 2,  adet: 2,   stars: 2 },
  { yildiz: "★☆☆☆☆", width: 1,  adet: 1,   stars: 1 },
];

const SABLON_NORMAL: { label: string; metin: string }[] = [
  { label: "👍 Teşekkür", metin: "Değerli misafirimiz, olumlu yorumunuz için çok teşekkür ederiz! Sizi tekrar ağırlamak için sabırsızlanıyoruz. 🏖️" },
  { label: "🌟 Sezon",    metin: "Merhaba! Güzel geri bildiriminiz için teşekkürler. Ekibimizle paylaşacağız. Yeni sezona sizi bekliyoruz!" },
  { label: "😊 Genel",    metin: "Sevgili misafirimiz, deneyiminizi bizimle paylaştığınız için teşekkür ederiz. Keyifli bir tatil geçirdiğinize memnun olduk!" },
];
const SABLON_SIKAYET: { label: string; metin: string }[] = [
  { label: "🙏 Özür",       metin: "Sayın misafirimiz, yaşadığınız deneyim için özür dileriz. Geri bildiriminizi dikkate alıyor ve ekibimizle değerlendireceğiz. Sizi daha iyi bir deneyimle ağırlamak isteriz." },
  { label: "✅ Önlem Alındı", metin: "Merhaba, yorumunuz için teşekkür ederiz. Belirttiğiniz konuları inceledik ve gerekli önlemleri aldık. Bizi tekrar ziyaret etmenizi umuyoruz." },
];

// ── Types ─────────────────────────────────────────────────────────────────────
type YorumTip = "yeni" | "cevaplanmis" | "sikayet";
type Cevap    = { label: string; metin: string };
type Yorum = {
  id:         number;
  tip:        YorumTip;
  avatar:     string;
  avatarBg:   string;
  ad:         string;
  tarih:      string;
  tarihSira:  number; // for sorting
  dogrulandi: boolean;
  rezervasyon:string;
  badge:      string;
  badgeBg:    string;
  badgeColor: string;
  puan:       number;
  puanBg:     string;
  yildiz:     string;
  yildizSayi: number;
  altPuanlar?:Array<{ label: string; deger: number }>;
  metin:      string;
  cevap?:     Cevap;
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const INIT_YORUMLAR: Yorum[] = [
  {
    id: 1, tip: "yeni",
    avatar: "AY", avatarBg: "linear-gradient(135deg,#6366F1,#4338CA)",
    ad: "Ayşe Yıldız", tarih: "10 Mart 2026", tarihSira: 4, dogrulandi: true,
    rezervasyon: "Silver Bölge · S-22",
    badge: "🔔 Yeni", badgeBg: "#FFF7ED", badgeColor: ORANGE,
    puan: 9.8, puanBg: TEAL, yildiz: "★★★★★", yildizSayi: 5,
    altPuanlar: [{ label: "Konum", deger: 10 }, { label: "Temizlik", deger: 9.5 }, { label: "Hizmet", deger: 10 }, { label: "Fiyat", deger: 9.5 }],
    metin: "Muhteşem deneyim! Şezlonglar çok rahat, personel ilgili ve güleryüzlü. Kahvaltı enfesti, özellikle börekler harika. Kesinlikle tekrar geleceğiz! 🌊",
  },
  {
    id: 2, tip: "yeni",
    avatar: "MK", avatarBg: "linear-gradient(135deg,#10B981,#065F46)",
    ad: "Mehmet Kaya", tarih: "9 Mart 2026", tarihSira: 3, dogrulandi: true,
    rezervasyon: "İskele Bölge · İ-5",
    badge: "🔔 Yeni", badgeBg: "#FFF7ED", badgeColor: ORANGE,
    puan: 9.5, puanBg: TEAL, yildiz: "★★★★★", yildizSayi: 5,
    altPuanlar: [{ label: "Konum", deger: 10 }, { label: "Temizlik", deger: 9 }, { label: "Hizmet", deger: 9.5 }, { label: "Fiyat", deger: 9 }],
    metin: "İskele şezlongları harika. Denize çok yakın ve temiz. Garsonlar çok hızlı servis yapıyor. Kesinlikle tekrar geleceğim. Bodrum'da en sevdiğim yer oldu!",
  },
  {
    id: 3, tip: "sikayet",
    avatar: "SA", avatarBg: `linear-gradient(135deg,${RED},#7F1D1D)`,
    ad: "Selin Arslan", tarih: "8 Mart 2026", tarihSira: 2, dogrulandi: true,
    rezervasyon: "VIP Bölge · V-8",
    badge: "⚠️ Şikayet", badgeBg: "#FEF2F2", badgeColor: RED,
    puan: 5.2, puanBg: RED, yildiz: "★★★☆☆", yildizSayi: 3,
    altPuanlar: [{ label: "Konum", deger: 8 }, { label: "Temizlik", deger: 4 }, { label: "Hizmet", deger: 5 }, { label: "Fiyat", deger: 4 }],
    metin: "VIP bölge fiyatına göre beklentilerimi karşılamadı. Şezlonglar yeterince temiz değildi, garson 25 dakika sonra geldi. Fiyatlar çok yüksek bu hizmet için. Daha dikkatli olunmasını bekliyordum.",
  },
  {
    id: 4, tip: "cevaplanmis",
    avatar: "BT", avatarBg: `linear-gradient(135deg,${YELLOW},#92400E)`,
    ad: "Burak Türk", tarih: "5 Mart 2026", tarihSira: 1, dogrulandi: true,
    rezervasyon: "Silver · S-14",
    badge: "✓ Cevaplandı", badgeBg: "#DCFCE7", badgeColor: GREEN,
    puan: 9.7, puanBg: TEAL, yildiz: "★★★★★", yildizSayi: 5,
    metin: "Bodrum'da gittiğim en iyi beach club. Rezervasyon sistemi çok pratik, telefonsuz hallettim her şeyi. Garsonlar QR'dan siparişimi aldı, 10 dakikada geldi. Harika!",
    cevap: { label: "🏖️ İşletme Yanıtı · 6 Mart 2026", metin: "Değerli Burak Bey, güzel yorumunuz ve dijital deneyim hakkındaki geri bildiriminiz için çok teşekkür ederiz! MyLoungers sistemi sayesinde misafirlerimize daha hızlı hizmet verebilmekten mutluluk duyuyoruz. Yeni sezonda sizi bekliyoruz! 🌊" },
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function IsletmeYorumlarPage() {
  const [yorumlar,      setYorumlar]      = useState<Yorum[]>(INIT_YORUMLAR);
  const [activeTab,     setActiveTab]     = useState("tum");
  const [siralama,      setSiralama]      = useState("en_yeni");
  const [puanFiltresi,  setPuanFiltresi]  = useState("tum");
  const [cevapFormOpen, setCevapFormOpen] = useState<Record<number, boolean>>({});
  const [cevapMetin,    setCevapMetin]    = useState<Record<number, string>>({});
  const [duzenleModu,   setDuzenleModu]   = useState<Record<number, boolean>>({});
  const [toast,         setToast]         = useState<string | null>(null);
  const [detayModal,    setDetayModal]    = useState<Yorum | null>(null);
  const [detayCevap,    setDetayCevap]    = useState("");
  const [detayFormOpen, setDetayFormOpen] = useState(false);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  // ESC closes modal
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { setDetayModal(null); setDetayFormOpen(false); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function getMevcutCevap(y: Yorum): Cevap | undefined { return y.cevap; }
  function hasCevap(y: Yorum): boolean { return !!getMevcutCevap(y); }

  // ── Tab counts ────────────────────────────────────────────────────────────
  const counts = {
    tum:        yorumlar.length,
    bekleyen:   yorumlar.filter(y => !hasCevap(y) && y.tip !== "sikayet").length + yorumlar.filter(y => !hasCevap(y) && y.tip === "sikayet").length,
    cevaplanan: yorumlar.filter(y => hasCevap(y)).length,
    sikayet:    yorumlar.filter(y => y.tip === "sikayet").length,
  };

  const FILTRELER = [
    { key: "tum",        label: "Tümü",           count: counts.tum        },
    { key: "bekleyen",   label: "⏳ Bekleyen",     count: counts.bekleyen,   borderColor: ORANGE, textColor: ORANGE },
    { key: "cevaplanan", label: "✅ Cevaplanan",   count: counts.cevaplanan },
    { key: "sikayet",    label: "⚠️ Şikayetler",  count: counts.sikayet    },
  ];

  // ── Filtering + sorting ───────────────────────────────────────────────────
  const filtrelenmis = yorumlar
    .filter(y => {
      if (activeTab === "bekleyen")   return !hasCevap(y);
      if (activeTab === "cevaplanan") return  hasCevap(y);
      if (activeTab === "sikayet")    return y.tip === "sikayet";
      return true;
    })
    .filter(y => {
      if (puanFiltresi === "tum") return true;
      const stars = parseInt(puanFiltresi);
      return y.yildizSayi === stars;
    })
    .sort((a, b) => {
      if (siralama === "en_yeni")   return b.tarihSira - a.tarihSira;
      if (siralama === "en_eski")   return a.tarihSira - b.tarihSira;
      if (siralama === "en_yuksek") return b.puan - a.puan;
      if (siralama === "en_dusuk")  return a.puan - b.puan;
      return 0;
    });

  // ── Cevap actions (inline) ────────────────────────────────────────────────
  function toggleCevapForm(id: number) {
    const opening = !cevapFormOpen[id];
    setCevapFormOpen(p => ({ ...p, [id]: opening }));
    if (opening) {
      const y = yorumlar.find(x => x.id === id);
      const mevcut = y?.cevap;
      setCevapMetin(m => ({ ...m, [id]: mevcut?.metin ?? "" }));
      setDuzenleModu(d => ({ ...d, [id]: !!mevcut }));
    }
  }
  function sablonEkle(id: number, metin: string) { setCevapMetin(m => ({ ...m, [id]: metin })); }
  function cevapGonder(id: number) {
    const metin = cevapMetin[id]?.trim();
    if (!metin) return;
    const isDuzenle = duzenleModu[id];
    setYorumlar(ys => ys.map(y => y.id === id ? { ...y, cevap: { label: "🏖️ İşletme Yanıtı · Şimdi", metin }, tip: "cevaplanmis" as YorumTip, badge: "✓ Cevaplandı", badgeBg: "#DCFCE7", badgeColor: GREEN } : y));
    setCevapFormOpen(o => ({ ...o, [id]: false }));
    setCevapMetin(m => ({ ...m, [id]: "" }));
    setDuzenleModu(d => ({ ...d, [id]: false }));
    showToast(isDuzenle ? "💾 Cevap güncellendi!" : "📤 Cevap gönderildi!");
  }

  // ── Detail modal cevap ────────────────────────────────────────────────────
  function detayGonder() {
    if (!detayModal || !detayCevap.trim()) return;
    const id = detayModal.id;
    const updatedCevap: Cevap = { label: "🏖️ İşletme Yanıtı · Şimdi", metin: detayCevap.trim() };
    setYorumlar(ys => ys.map(y => y.id === id ? { ...y, cevap: updatedCevap, tip: "cevaplanmis" as YorumTip, badge: "✓ Cevaplandı", badgeBg: "#DCFCE7", badgeColor: GREEN } : y));
    setDetayModal(prev => prev ? { ...prev, cevap: updatedCevap } : prev);
    setDetayCevap("");
    setDetayFormOpen(false);
    showToast("📤 Cevap gönderildi!");
  }

  // ── CSV export ────────────────────────────────────────────────────────────
  function csvIndir() {
    const BOM = "\uFEFF";
    const header = ["Müşteri", "Puan", "Yıldız", "Tarih", "Rezervasyon", "Durum", "Yorum", "Cevap"];
    const rows = filtrelenmis.map(y => [
      y.ad, String(y.puan), String(y.yildizSayi), y.tarih, y.rezervasyon,
      hasCevap(y) ? "Cevaplandı" : y.tip === "sikayet" ? "Şikayet" : "Bekleyen",
      `"${y.metin.replace(/"/g, '""')}"`,
      y.cevap ? `"${y.cevap.metin.replace(/"/g, '""')}"` : "",
    ]);
    const csv = BOM + [header, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "yorumlar.csv"; a.click();
    URL.revokeObjectURL(url);
    showToast("📥 CSV indirildi");
  }

  // ── Render helpers ────────────────────────────────────────────────────────
  const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 };

  function CevapBlok({ y, compact }: { y: Yorum; compact?: boolean }) {
    const isSikayet = y.tip === "sikayet";
    const formAcik  = compact ? detayFormOpen : cevapFormOpen[y.id];
    const mevcutC   = getMevcutCevap(y);
    const curText   = compact ? detayCevap : (cevapMetin[y.id] ?? "");
    const setTxt    = compact
      ? (v: string) => setDetayCevap(v)
      : (v: string) => setCevapMetin(m => ({ ...m, [y.id]: v }));
    const isDuzenle = compact ? !!mevcutC : duzenleModu[y.id];
    const onGonder  = compact ? detayGonder : () => cevapGonder(y.id);
    const onIptal   = compact ? () => { setDetayFormOpen(false); setDetayCevap(""); } : () => toggleCevapForm(y.id);

    if (!formAcik) return null;
    return (
      <div style={{ padding: compact ? "12px 0 0" : "12px 18px", borderTop: `1px solid ${GRAY100}`, background: compact ? "transparent" : GRAY50 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: isSikayet ? RED : GRAY600, marginBottom: 6 }}>{isSikayet ? "⚠️ Şikayet Yanıtı — Dikkatli ve yapıcı bir dil kullanın" : "İşletme Cevabı"}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {(isSikayet ? SABLON_SIKAYET : SABLON_NORMAL).map((s, si) => (
            <button key={si} onClick={() => { compact ? sablonEkle(y.id, s.metin) && setDetayCevap(s.metin) : sablonEkle(y.id, s.metin); if (compact) setDetayCevap(s.metin); }} style={{ padding: "4px 10px", border: `1px solid ${GRAY200}`, borderRadius: 20, background: "white", fontSize: 10, fontWeight: 600, cursor: "pointer", color: GRAY600 }}>{s.label}</button>
          ))}
        </div>
        <textarea
          value={curText}
          onChange={(e) => setTxt(e.target.value)}
          placeholder={isSikayet ? "Şikayete yanıtınızı yazın..." : "İşletme adına cevabınızı yazın..."}
          style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 12, resize: "vertical", minHeight: 80 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span style={{ fontSize: 10, color: GRAY400 }}>{isDuzenle ? "Cevabı düzenleyip tekrar gönderin" : 'Müşteri sayfasında "İşletme Yanıtı" olarak görünecek'}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={onIptal} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
            <button onClick={onGonder} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>{isDuzenle ? "💾 Güncelle" : "📤 Gönder"}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", flexDirection: "column", minHeight: "100%" }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, background: NAVY, color: "white", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>{toast}</div>
      )}

      {/* TOPBAR */}
      <header style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Kullanıcı Yorumları</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>
            {filtrelenmis.length} yorum gösteriliyor · {counts.bekleyen} cevaplanmayı bekliyor · Yorumlar silinemez
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={csvIndir} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>📥 Excel İndir</button>
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
          {/* Puan dağılımı — clickable */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 180 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, marginBottom: 8 }}>Puan Dağılımı <span style={{ color: TEAL, fontStyle: "italic" }}>(filtrele)</span></div>
            {PUAN_DAGILIM.map((d, i) => {
              const isActive = puanFiltresi === String(d.stars);
              return (
                <div
                  key={i}
                  onClick={() => setPuanFiltresi(isActive ? "tum" : String(d.stars))}
                  style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, cursor: "pointer", padding: "2px 4px", borderRadius: 6, background: isActive ? "rgba(10,186,181,0.08)" : "transparent", border: isActive ? `1px solid ${TEAL}` : "1px solid transparent", transition: "all 0.15s" }}
                >
                  <span style={{ width: 60, color: isActive ? TEAL : YELLOW, fontWeight: isActive ? 700 : 400 }}>{d.yildiz}</span>
                  <div style={{ flex: 1, height: 6, background: GRAY100, borderRadius: 20, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: d.width + "%", background: isActive ? TEAL : YELLOW, borderRadius: 20 }} />
                  </div>
                  <span style={{ width: 24, color: isActive ? TEAL : GRAY400, textAlign: "right", fontSize: 10, fontWeight: isActive ? 700 : 400 }}>{d.adet}</span>
                </div>
              );
            })}
            {puanFiltresi !== "tum" && (
              <button onClick={() => setPuanFiltresi("tum")} style={{ marginTop: 4, fontSize: 10, color: TEAL, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "2px 4px" }}>✕ Filtreyi Kaldır</button>
            )}
          </div>
        </div>

        {/* FİLTRE BARI */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {FILTRELER.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveTab(f.key)}
              style={{
                padding: "7px 16px", borderRadius: 20,
                border: `1.5px solid ${activeTab === f.key ? NAVY : f.borderColor ?? GRAY200}`,
                background: activeTab === f.key ? NAVY : "white",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                color: activeTab === f.key ? "white" : f.textColor ?? GRAY600,
              }}
            >
              {f.label} <span style={{ fontSize: 10, opacity: activeTab === f.key ? 0.7 : 1 }}>({f.count})</span>
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <select value={siralama} onChange={(e) => setSiralama(e.target.value)} style={{ padding: "7px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 12, background: "white" }}>
              <option value="en_yeni">En Yeni</option>
              <option value="en_eski">En Eski</option>
              <option value="en_yuksek">En Yüksek Puan</option>
              <option value="en_dusuk">En Düşük Puan</option>
            </select>
            <select value={puanFiltresi} onChange={(e) => setPuanFiltresi(e.target.value)} style={{ padding: "7px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 12, background: "white" }}>
              <option value="tum">Tüm Puanlar</option>
              <option value="5">5 Yıldız</option>
              <option value="4">4 Yıldız</option>
              <option value="3">3 Yıldız</option>
              <option value="2">2 Yıldız</option>
              <option value="1">1 Yıldız</option>
            </select>
          </div>
        </div>

        {/* YORUM LİSTESİ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtrelenmis.length === 0 && (
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 40, textAlign: "center", color: GRAY400 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Bu filtreye uygun yorum bulunamadı</p>
            </div>
          )}
          {filtrelenmis.map((y) => {
            const mevcutCevap = getMevcutCevap(y);
            const formAcik    = cevapFormOpen[y.id];
            const isSikayet   = y.tip === "sikayet";
            return (
              <div
                key={y.id}
                style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", borderLeft: `3px solid ${mevcutCevap ? GREEN : isSikayet ? RED : ORANGE}` }}
              >
                {isSikayet && (
                  <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 10, padding: "10px 14px", margin: "12px 18px 0", display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#991B1B" }}>
                    ⚠️ Bu yorum düşük puan içeriyor — hızlı yanıt vermeniz önerilir.
                  </div>
                )}
                {/* Tıklanabilir alan */}
                <div
                  onClick={() => { setDetayModal(y); setDetayFormOpen(false); setDetayCevap(y.cevap?.metin ?? ""); }}
                  style={{ padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start", cursor: "pointer" }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white", flexShrink: 0, background: y.avatarBg }}>{y.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{y.ad}</span>
                      <span style={{ fontSize: 11, color: GRAY400 }}>{y.tarih}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#DCFCE7", color: "#16A34A" }}>✓ Doğrulanmış</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: GRAY100, color: GRAY600 }}>{y.rezervasyon}</span>
                      <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: y.badgeColor, background: y.badgeBg, padding: "2px 8px", borderRadius: 20 }}>{y.badge}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <span style={{ background: y.puanBg, color: "white", fontSize: 12, fontWeight: 900, padding: "3px 10px", borderRadius: 8 }}>{y.puan}</span>
                      <span style={{ color: isSikayet ? GRAY400 : YELLOW, fontSize: 13, letterSpacing: 2 }}>{y.yildiz}</span>
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
                  {/* Action button — stop propagation so card click doesn't fire */}
                  <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
                    <button
                      onClick={() => toggleCevapForm(y.id)}
                      style={{
                        padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, cursor: "pointer",
                        border: mevcutCevap ? `1px solid ${GRAY200}` : isSikayet ? "none" : "none",
                        background: mevcutCevap ? GRAY100 : isSikayet ? RED : TEAL,
                        color: mevcutCevap ? GRAY800 : "white",
                      }}
                    >
                      {mevcutCevap ? "✏️ Düzenle" : isSikayet ? "⚠️ Cevapla" : "💬 Cevapla"}
                    </button>
                  </div>
                </div>

                {/* Mevcut cevap */}
                {mevcutCevap && !formAcik && (
                  <div style={{ padding: "12px 18px 12px 56px", background: "#F0FFFE", borderTop: "1px solid #CCFBF1" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: TEAL, marginBottom: 4 }}>{mevcutCevap.label}</div>
                    <div style={{ fontSize: 12, color: NAVY, lineHeight: 1.6 }}>{mevcutCevap.metin}</div>
                  </div>
                )}

                {/* Cevap formu (inline) */}
                {formAcik && <CevapBlok y={y} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── YORUM DETAY MODAL ──────────────────────────────────────────────── */}
      {detayModal && (
        <div style={{ ...overlayStyle, alignItems: "flex-start", paddingTop: 24, overflowY: "auto" }} onClick={(e) => e.target === e.currentTarget && setDetayModal(null)}>
          <div style={{ background: "white", borderRadius: 16, width: 600, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", marginBottom: 24 }} onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY200}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white", background: detayModal.avatarBg }}>{detayModal.avatar}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{detayModal.ad}</div>
                  <div style={{ fontSize: 11, color: GRAY400 }}>{detayModal.tarih} · {detayModal.rezervasyon}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: detayModal.badgeColor, background: detayModal.badgeBg, padding: "2px 8px", borderRadius: 20 }}>{detayModal.badge}</span>
                <button onClick={() => setDetayModal(null)} style={{ width: 28, height: 28, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
            </div>

            {/* Puan + yıldız */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${GRAY100}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ background: detayModal.puanBg, color: "white", fontSize: 18, fontWeight: 900, padding: "4px 14px", borderRadius: 10 }}>{detayModal.puan}</span>
                <span style={{ color: detayModal.tip === "sikayet" ? GRAY400 : YELLOW, fontSize: 18, letterSpacing: 4 }}>{detayModal.yildiz}</span>
              </div>
              {detayModal.altPuanlar && (
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {detayModal.altPuanlar.map((ap, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, color: GRAY600, fontWeight: 600 }}>{ap.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 900, color: NAVY }}>{ap.deger}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Yorum metni */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${GRAY100}` }}>
              {detayModal.tip === "sikayet" && (
                <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: "#991B1B" }}>⚠️ Bu yorum düşük puan içeriyor — hızlı yanıt vermeniz önerilir.</div>
              )}
              <p style={{ fontSize: 14, color: GRAY600, lineHeight: 1.7 }}>{detayModal.metin}</p>
            </div>

            {/* Mevcut cevap */}
            {getMevcutCevap(detayModal) && !detayFormOpen && (
              <div style={{ padding: "14px 20px", background: "#F0FFFE", borderBottom: "1px solid #CCFBF1" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: TEAL, marginBottom: 6 }}>{getMevcutCevap(detayModal)!.label}</div>
                <div style={{ fontSize: 13, color: NAVY, lineHeight: 1.6 }}>{getMevcutCevap(detayModal)!.metin}</div>
              </div>
            )}

            {/* Cevap / Düzenle butonu */}
            {!detayFormOpen && (
              <div style={{ padding: "14px 20px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  onClick={() => setDetayFormOpen(true)}
                  style={{
                    padding: "8px 16px", fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: "pointer",
                    border: getMevcutCevap(detayModal) ? `1px solid ${GRAY200}` : "none",
                    background: getMevcutCevap(detayModal) ? GRAY100 : detayModal.tip === "sikayet" ? RED : TEAL,
                    color: getMevcutCevap(detayModal) ? GRAY800 : "white",
                  }}
                >
                  {getMevcutCevap(detayModal) ? "✏️ Cevabı Düzenle" : detayModal.tip === "sikayet" ? "⚠️ Şikayeti Cevapla" : "💬 Cevapla"}
                </button>
              </div>
            )}

            {/* Detay modalda cevap formu */}
            {detayFormOpen && (
              <div style={{ padding: "0 20px 20px" }}>
                <CevapBlok y={detayModal} compact />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
