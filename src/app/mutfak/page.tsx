"use client";

import { useState, useEffect } from "react";

const NAVY = "#0A1628";
const TEAL = "#0ABAB5";
const ORANGE = "#F5821F";
const GRAY50 = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const GREEN = "#10B981";
const RED = "#EF4444";
const YELLOW = "#F59E0B";

type SiparisDurum = "yeni" | "hazirlaniyor" | "tamamlandi";

type UrunSatir = {
  emoji: string;
  isim: string;
  adet: number;
  hazirlandi?: boolean;
};

type SiparisKart = {
  id: string;
  barColor: string;
  sezlong: string;
  musteri: string;
  sure: number;
  sureLabel: "Bekleniyor" | "Hazırlanıyor" | "Hazırlandı";
  sureClass: "ok" | "warn" | "danger";
  oncelikli?: boolean;
  urunler: UrunSatir[];
  not?: string;
  teslimSaat?: string;
  durum: SiparisDurum;
};

// Mock - Başlangıç siparişleri
const MOCK_YENI: SiparisKart[] = [
  {
    id: "s1",
    barColor: RED,
    sezlong: "S-22",
    musteri: "Ayşe Y. · Silver",
    sure: 22,
    sureLabel: "Bekleniyor",
    sureClass: "danger",
    oncelikli: true,
    urunler: [{ emoji: "🍹", isim: "Mojito", adet: 2 }, { emoji: "🍟", isim: "Nachos", adet: 1 }],
    durum: "yeni",
  },
  {
    id: "s2",
    barColor: ORANGE,
    sezlong: "V-3",
    musteri: "Fatma D. · VIP",
    sure: 14,
    sureLabel: "Bekleniyor",
    sureClass: "warn",
    urunler: [{ emoji: "🐟", isim: "Izgara Levrek", adet: 2 }, { emoji: "🥗", isim: "Mevsim Salatası", adet: 1 }],
    durum: "yeni",
  },
  {
    id: "s3",
    barColor: YELLOW,
    sezlong: "İ-5",
    musteri: "Mehmet K. · İskele",
    sure: 6,
    sureLabel: "Bekleniyor",
    sureClass: "ok",
    urunler: [{ emoji: "🍋", isim: "Limonata", adet: 3 }, { emoji: "🍷", isim: "Rosé Şarap", adet: 1 }],
    not: "Limonatalar şekersiz olsun",
    durum: "yeni",
  },
  {
    id: "s4",
    barColor: TEAL,
    sezlong: "G-1",
    musteri: "Banu K. · Gold",
    sure: 2,
    sureLabel: "Bekleniyor",
    sureClass: "ok",
    urunler: [{ emoji: "🍳", isim: "Kahvaltı Tabağı", adet: 2 }, { emoji: "☕", isim: "Türk Kahvesi", adet: 2 }],
    durum: "yeni",
  },
];

const MOCK_HAZIRLANIYOR: SiparisKart[] = [
  {
    id: "h1",
    barColor: YELLOW,
    sezlong: "S-14",
    musteri: "Zeynep A. · Silver",
    sure: 8,
    sureLabel: "Hazırlanıyor",
    sureClass: "warn",
    urunler: [{ emoji: "🍋", isim: "Limonata", adet: 2, hazirlandi: true }, { emoji: "🍟", isim: "Nachos", adet: 1 }],
    durum: "hazirlaniyor",
  },
  {
    id: "h2",
    barColor: GREEN,
    sezlong: "V-8",
    musteri: "Selin E. · VIP",
    sure: 4,
    sureLabel: "Hazırlanıyor",
    sureClass: "ok",
    urunler: [{ emoji: "🍹", isim: "Mojito", adet: 3 }, { emoji: "🥂", isim: "Şampanya", adet: 1 }],
    durum: "hazirlaniyor",
  },
];

const MOCK_TAMAMLANDI: SiparisKart[] = [
  { id: "t1", barColor: GRAY400, sezlong: "S-7", musteri: "Can K. · Silver", sure: 7, sureLabel: "Hazırlandı", sureClass: "ok", urunler: [{ emoji: "🍹", isim: "Mojito", adet: 2, hazirlandi: true }], teslimSaat: "13:45'te teslim edildi", durum: "tamamlandi" },
  { id: "t2", barColor: GRAY400, sezlong: "İ-3", musteri: "Ali M. · İskele", sure: 11, sureLabel: "Hazırlandı", sureClass: "ok", urunler: [{ emoji: "🐟", isim: "Izgara Levrek", adet: 1, hazirlandi: true }, { emoji: "🥗", isim: "Salata", adet: 1, hazirlandi: true }], teslimSaat: "13:22'de teslim edildi", durum: "tamamlandi" },
  { id: "t3", barColor: GRAY400, sezlong: "V-4", musteri: "Zeynep A.", sure: 9, sureLabel: "Hazırlandı", sureClass: "ok", urunler: [{ emoji: "🍷", isim: "Rosé Şarap", adet: 2, hazirlandi: true }], teslimSaat: "13:10'da teslim edildi", durum: "tamamlandi" },
];

export default function MutfakPage() {
  const [yeni, setYeni] = useState<SiparisKart[]>(MOCK_YENI);
  const [hazirlaniyor, setHazirlaniyor] = useState<SiparisKart[]>(MOCK_HAZIRLANIYOR);
  const [tamamlandi, setTamamlandi] = useState<SiparisKart[]>(MOCK_TAMAMLANDI);
  const [sesAcik, setSesAcik] = useState(true);
  const [saat, setSaat] = useState("14:32");
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setSaat(now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0"));
    };
    tick();
    const iv = setInterval(tick, 10000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (banner) {
      const t = setTimeout(() => setBanner(null), 3000);
      return () => clearTimeout(t);
    }
  }, [banner]);

  const hazirlaBasla = (kart: SiparisKart) => {
    setYeni((p) => p.filter((s) => s.id !== kart.id));
    const yeniKart: SiparisKart = {
      ...kart,
      id: kart.id + "_h",
      sureLabel: "Hazırlanıyor",
      barColor: YELLOW,
      oncelikli: false,
      durum: "hazirlaniyor",
    };
    setHazirlaniyor((p) => [yeniKart, ...p]);
    setBanner("🍳 Hazırlanıyor: " + kart.sezlong);
  };

  const tamamla = (kart: SiparisKart) => {
    setHazirlaniyor((p) => p.filter((s) => s.id !== kart.id));
    const now = new Date();
    const teslimSaat = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
    const tamamKart: SiparisKart = {
      ...kart,
      id: kart.id + "_t",
      barColor: GRAY400,
      urunler: kart.urunler.map((u) => ({ ...u, hazirlandi: true })),
      teslimSaat: teslimSaat + "'de garson aldı",
      durum: "tamamlandi",
    };
    setTamamlandi((p) => [tamamKart, ...p]);
    setBanner("✅ Garson bildirildi: " + kart.sezlong);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0f1923", color: GRAY800, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* TOPBAR */}
      <header style={{ background: NAVY, padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>🍳</span>
            <strong style={{ fontSize: 14, fontWeight: 800, color: "white" }}>MUTFAK PANELİ</strong>
          </div>
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ fontSize: 22, fontWeight: 900, color: TEAL, fontVariantNumeric: "tabular-nums" }}>{saat}</div>
          <div style={{ fontSize: 11, color: GRAY400 }}>Zuzuu Beach Hotel</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: TEAL }}>{yeni.length}</div>
            <div style={{ fontSize: 9, color: GRAY400 }}>Yeni</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: GREEN }}>{hazirlaniyor.length}</div>
            <div style={{ fontSize: 9, color: GRAY400 }}>Hazırlanıyor</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: GRAY400 }}>{tamamlandi.length}</div>
            <div style={{ fontSize: 9, color: GRAY400 }}>Bugün Tamamlanan</div>
          </div>
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />
          <button
            onClick={() => setSesAcik(!sesAcik)}
            style={{ background: sesAcik ? TEAL : "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "6px 12px", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            {sesAcik ? "🔊 Ses Açık" : "🔇 Ses Kapalı"}
          </button>
        </div>
      </header>

      {/* KOLONLAR */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: 10, flex: 1, overflow: "hidden" }}>
        {/* YENİ SİPARİŞLER */}
        <div style={{ display: "flex", flexDirection: "column", borderRadius: 14, overflow: "hidden", background: "#1a1f35" }}>
          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "#1e2540" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: 8 }}>🔴 Yeni Siparişler</div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(249,115,22,0.2)", color: ORANGE }}>{yeni.length} Sipariş</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {yeni.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.2)" }}>
                <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>📭</span>
                <p style={{ fontSize: 12, fontWeight: 600 }}>Yeni sipariş yok</p>
              </div>
            ) : (
              yeni.map((s) => (
                <SiparisKartComp
                  key={s.id}
                  kart={s}
                  onHazirla={() => hazirlaBasla(s)}
                  onTamamla={() => tamamla(s)}
                  isYeni
                />
              ))
            )}
          </div>
        </div>

        {/* HAZIRLANIYOR */}
        <div style={{ display: "flex", flexDirection: "column", borderRadius: 14, overflow: "hidden", background: "#1a2a1a" }}>
          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "#1e341e" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: 8 }}>🟡 Hazırlanıyor</div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(16,185,129,0.2)", color: GREEN }}>{hazirlaniyor.length} Sipariş</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {hazirlaniyor.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.2)" }}>
                <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>🍳</span>
                <p style={{ fontSize: 12, fontWeight: 600 }}>Hazırlanan sipariş yok</p>
              </div>
            ) : (
              hazirlaniyor.map((s) => (
                <SiparisKartComp
                  key={s.id}
                  kart={s}
                  onHazirla={() => {}}
                  onTamamla={() => tamamla(s)}
                  isHazirlaniyor
                />
              ))
            )}
          </div>
        </div>

        {/* TAMAMLANANLAR */}
        <div style={{ display: "flex", flexDirection: "column", borderRadius: 14, overflow: "hidden", background: "#1a1a2a" }}>
          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "#1e1e34" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: 8 }}>✅ Tamamlananlar</div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(148,163,184,0.2)", color: GRAY400 }}>{tamamlandi.length} Bugün</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {tamamlandi.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.2)" }}>
                <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>✅</span>
                <p style={{ fontSize: 12, fontWeight: 600 }}>Henüz tamamlanan yok</p>
              </div>
            ) : (
              tamamlandi.map((s) => (
                <SiparisKartComp key={s.id} kart={s} onHazirla={() => {}} onTamamla={() => {}} isTamamlandi />
              ))
            )}
          </div>
        </div>
      </div>

      {/* BANNER */}
      {banner && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: "50%",
            transform: "translateX(-50%)",
            background: ORANGE,
            color: "white",
            padding: "12px 24px",
            borderRadius: 30,
            fontSize: 14,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 200,
            boxShadow: "0 8px 24px rgba(245,130,31,0.4)",
          }}
        >
          {banner}
        </div>
      )}
    </div>
  );
}

function SiparisKartComp({
  kart,
  onHazirla,
  onTamamla,
  isYeni,
  isHazirlaniyor,
  isTamamlandi,
}: {
  kart: SiparisKart;
  onHazirla: () => void;
  onTamamla: () => void;
  isYeni?: boolean;
  isHazirlaniyor?: boolean;
  isTamamlandi?: boolean;
}) {
  const sureColor = kart.sureClass === "danger" ? RED : kart.sureClass === "warn" ? YELLOW : GREEN;
  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        overflow: "hidden",
        cursor: isTamamlandi ? "default" : "pointer",
        opacity: isTamamlandi ? 0.6 : 1,
        boxShadow: kart.oncelikli ? `0 0 0 2px ${RED}, 0 4px 16px rgba(239,68,68,0.3)` : undefined,
      }}
    >
      <div style={{ height: 4, background: kart.barColor }} />
      <div style={{ padding: "10px 14px 8px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: isTamamlandi ? GRAY400 : NAVY }}>{kart.sezlong}</div>
          <div style={{ fontSize: 11, color: GRAY600, marginTop: 1 }}>{kart.musteri}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 900, display: "block", color: sureColor }}>{kart.sure}dk</span>
          <span style={{ fontSize: 9, color: GRAY400 }}>{kart.sureLabel}</span>
        </div>
      </div>
      {kart.oncelikli && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: RED, color: "white", margin: "0 14px 8px" }}>🔥 ACİL — En Uzun Bekleyen</div>
      )}
      <div style={{ padding: "0 14px 10px" }}>
        {kart.urunler.map((u, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < kart.urunler.length - 1 ? `1px solid ${GRAY100}` : "none" }}>
            <span style={{ fontSize: 20 }}>{u.emoji}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: u.hazirlandi ? GRAY400 : NAVY, textDecoration: u.hazirlandi ? "line-through" : "none" }}>{u.isim}</span>
            <span style={{ fontSize: 13, fontWeight: 900, color: u.hazirlandi ? "white" : GRAY600, background: u.hazirlandi ? GREEN : GRAY100, padding: "2px 8px", borderRadius: 20 }}>× {u.adet}</span>
          </div>
        ))}
      </div>
      {kart.not && (
        <div style={{ margin: "0 14px 10px", padding: "8px 10px", background: "#FEF3C7", borderRadius: 8, fontSize: 11, color: "#92400E", display: "flex", gap: 6 }}>
          ⚠️ <span><strong>Müşteri notu:</strong> {kart.not}</span>
        </div>
      )}
      {isTamamlandi && kart.teslimSaat && (
        <div style={{ padding: "8px 14px 12px", fontSize: 11, color: GRAY400 }}>✓ {kart.teslimSaat}</div>
      )}
      {!isTamamlandi && (
        <div style={{ padding: "10px 14px", borderTop: `2px solid ${GRAY100}` }}>
          <button
            onClick={isYeni ? onHazirla : onTamamla}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              border: "none",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              background: isYeni ? ORANGE : GREEN,
              color: "white",
            }}
          >
            {isYeni ? "🍳 Hazırlamaya Başla" : "✅ Hazır — Garsona Ver"}
          </button>
        </div>
      )}
    </div>
  );
}
