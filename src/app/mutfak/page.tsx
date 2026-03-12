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

type SiparisDurum = "yeni" | "hazirlaniyor" | "tamamlandi";
type UrunSatir    = { emoji: string; isim: string; adet: number; hazirlandi?: boolean };
type SiparisKart  = {
  id: string; barColor: string; sezlong: string; musteri: string;
  sure: number; sureLabel: "Bekleniyor" | "Hazırlanıyor" | "Hazırlandı";
  sureClass: "ok" | "warn" | "danger"; oncelikli?: boolean;
  urunler: UrunSatir[]; not?: string; teslimSaat?: string; durum: SiparisDurum;
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_YENI: SiparisKart[] = [
  { id: "s1", barColor: RED,    sezlong: "S-22", musteri: "Ayşe Y. · Silver",  sure: 22, sureLabel: "Bekleniyor", sureClass: "danger", oncelikli: true,  urunler: [{ emoji: "🍹", isim: "Mojito", adet: 2 }, { emoji: "🍟", isim: "Nachos", adet: 1 }], durum: "yeni" },
  { id: "s2", barColor: ORANGE, sezlong: "V-3",  musteri: "Fatma D. · VIP",    sure: 14, sureLabel: "Bekleniyor", sureClass: "warn",                       urunler: [{ emoji: "🐟", isim: "Izgara Levrek", adet: 2 }, { emoji: "🥗", isim: "Mevsim Salatası", adet: 1 }], durum: "yeni" },
  { id: "s3", barColor: YELLOW, sezlong: "İ-5",  musteri: "Mehmet K. · İskele",sure: 6,  sureLabel: "Bekleniyor", sureClass: "ok",                          urunler: [{ emoji: "🍋", isim: "Limonata", adet: 3 }, { emoji: "🍷", isim: "Rosé Şarap", adet: 1 }], not: "Limonatalar şekersiz olsun", durum: "yeni" },
  { id: "s4", barColor: TEAL,   sezlong: "G-1",  musteri: "Banu K. · Gold",    sure: 2,  sureLabel: "Bekleniyor", sureClass: "ok",                          urunler: [{ emoji: "🍳", isim: "Kahvaltı Tabağı", adet: 2 }, { emoji: "☕", isim: "Türk Kahvesi", adet: 2 }], durum: "yeni" },
];
const MOCK_HAZIRLANIYOR: SiparisKart[] = [
  { id: "h1", barColor: YELLOW, sezlong: "S-14", musteri: "Zeynep A. · Silver", sure: 8, sureLabel: "Hazırlanıyor", sureClass: "warn", urunler: [{ emoji: "🍋", isim: "Limonata", adet: 2, hazirlandi: true }, { emoji: "🍟", isim: "Nachos", adet: 1 }], durum: "hazirlaniyor" },
  { id: "h2", barColor: GREEN,  sezlong: "V-8",  musteri: "Selin E. · VIP",     sure: 4, sureLabel: "Hazırlanıyor", sureClass: "ok",   urunler: [{ emoji: "🍹", isim: "Mojito",   adet: 3 }, { emoji: "🥂", isim: "Şampanya", adet: 1 }], durum: "hazirlaniyor" },
];
const MOCK_TAMAMLANDI: SiparisKart[] = [
  { id: "t1", barColor: GRAY400, sezlong: "S-7",  musteri: "Can K. · Silver",  sure: 7,  sureLabel: "Hazırlandı", sureClass: "ok", urunler: [{ emoji: "🍹", isim: "Mojito", adet: 2, hazirlandi: true }], teslimSaat: "13:45'te teslim edildi", durum: "tamamlandi" },
  { id: "t2", barColor: GRAY400, sezlong: "İ-3",  musteri: "Ali M. · İskele",  sure: 11, sureLabel: "Hazırlandı", sureClass: "ok", urunler: [{ emoji: "🐟", isim: "Izgara Levrek", adet: 1, hazirlandi: true }, { emoji: "🥗", isim: "Salata", adet: 1, hazirlandi: true }], teslimSaat: "13:22'de teslim edildi", durum: "tamamlandi" },
  { id: "t3", barColor: GRAY400, sezlong: "V-4",  musteri: "Zeynep A.",         sure: 9,  sureLabel: "Hazırlandı", sureClass: "ok", urunler: [{ emoji: "🍷", isim: "Rosé Şarap", adet: 2, hazirlandi: true }], teslimSaat: "13:10'da teslim edildi", durum: "tamamlandi" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MutfakPage() {
  const [yeni,         setYeni]         = useState<SiparisKart[]>(MOCK_YENI);
  const [hazirlaniyor, setHazirlaniyor] = useState<SiparisKart[]>(MOCK_HAZIRLANIYOR);
  const [tamamlandi,   setTamamlandi]   = useState<SiparisKart[]>(MOCK_TAMAMLANDI);
  const [sesAcik,      setSesAcik]      = useState(true);
  const [saat,         setSaat]         = useState("");
  const [toast,        setToast]        = useState<string | null>(null);
  const [onayModal,    setOnayModal]    = useState<SiparisKart | null>(null);
  const [detayModal,   setDetayModal]   = useState<SiparisKart | null>(null);

  // Real-time clock (1-second interval)
  useEffect(() => {
    function tick() {
      const now = new Date();
      setSaat(now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0"));
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // ESC closes modals
  useEffect(() => {
    function h(e: KeyboardEvent) { if (e.key === "Escape") { setOnayModal(null); setDetayModal(null); } }
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  // ── ACİL auto-badge: sure >= 15 ──────────────────────────────────────────
  function isAcil(k: SiparisKart) { return k.sure >= 15 || k.oncelikli; }

  // ── Actions ───────────────────────────────────────────────────────────────
  function hazirlaBasla(kart: SiparisKart) {
    setYeni(p => p.filter(s => s.id !== kart.id));
    const yeniKart: SiparisKart = { ...kart, id: kart.id + "_h", sureLabel: "Hazırlanıyor", barColor: YELLOW, oncelikli: false, durum: "hazirlaniyor" };
    setHazirlaniyor(p => [yeniKart, ...p]);
    setOnayModal(null);
    showToast("🍳 Hazırlanıyor: " + kart.sezlong);
  }

  function tamamla(kart: SiparisKart) {
    setHazirlaniyor(p => p.filter(s => s.id !== kart.id));
    const now = new Date();
    const teslimSaat = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
    const tamamKart: SiparisKart = {
      ...kart, id: kart.id + "_t", barColor: GRAY400,
      sureLabel: "Hazırlandı",
      urunler: kart.urunler.map(u => ({ ...u, hazirlandi: true })),
      teslimSaat: teslimSaat + "'de garson aldı", durum: "tamamlandi",
    };
    setTamamlandi(p => [tamamKart, ...p]);
    if (detayModal?.id === kart.id) setDetayModal(null);
    showToast("✅ Sipariş garsona verildi! — " + kart.sezlong);
  }

  function toggleSes() {
    const next = !sesAcik;
    setSesAcik(next);
    showToast(next ? "🔊 Ses açıldı" : "🔇 Ses kapatıldı");
  }

  const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 };

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
          <div style={{ fontSize: 22, fontWeight: 900, color: TEAL, fontVariantNumeric: "tabular-nums", minWidth: 52 }}>{saat}</div>
          <div style={{ fontSize: 11, color: GRAY400 }}>Zuzuu Beach Hotel</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Stat kartlar — gerçek zamanlı */}
          {[
            { val: yeni.length,         label: "Yeni",              color: TEAL   },
            { val: hazirlaniyor.length, label: "Hazırlanıyor",      color: GREEN  },
            { val: tamamlandi.length,   label: "Bugün Tamamlanan",  color: GRAY400 },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 14px", textAlign: "center", minWidth: 52 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: s.color, transition: "all 0.3s" }}>{s.val}</div>
              <div style={{ fontSize: 9, color: GRAY400 }}>{s.label}</div>
            </div>
          ))}
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />
          <button
            onClick={toggleSes}
            style={{ background: sesAcik ? TEAL : "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "6px 12px", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s" }}
          >{sesAcik ? "🔊 Ses Açık" : "🔇 Ses Kapalı"}</button>
        </div>
      </header>

      {/* KOLONLAR */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: 10, flex: 1, overflow: "hidden" }}>

        {/* YENİ SİPARİŞLER */}
        <div style={{ display: "flex", flexDirection: "column", borderRadius: 14, overflow: "hidden", background: "#1a1f35" }}>
          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "#1e2540" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>🔴 Yeni Siparişler</div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(249,115,22,0.2)", color: ORANGE }}>{yeni.length} Sipariş</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {yeni.length === 0
              ? <EmptyState icon="📭" msg="Yeni sipariş yok" />
              : yeni.map(s => (
                  <SiparisKartComp
                    key={s.id} kart={s} isAcil={!!isAcil(s)}
                    onKartClick={() => setDetayModal(s)}
                    onHazirla={() => setOnayModal(s)}
                    onTamamla={() => {}}
                    isYeni
                  />
                ))
            }
          </div>
        </div>

        {/* HAZIRLANIYOR */}
        <div style={{ display: "flex", flexDirection: "column", borderRadius: 14, overflow: "hidden", background: "#1a2a1a" }}>
          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "#1e341e" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>🟡 Hazırlanıyor</div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(16,185,129,0.2)", color: GREEN }}>{hazirlaniyor.length} Sipariş</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {hazirlaniyor.length === 0
              ? <EmptyState icon="🍳" msg="Hazırlanan sipariş yok" />
              : hazirlaniyor.map(s => (
                  <SiparisKartComp
                    key={s.id} kart={s} isAcil={!!isAcil(s)}
                    onKartClick={() => setDetayModal(s)}
                    onHazirla={() => {}}
                    onTamamla={() => tamamla(s)}
                    isHazirlaniyor
                  />
                ))
            }
          </div>
        </div>

        {/* TAMAMLANANLAR */}
        <div style={{ display: "flex", flexDirection: "column", borderRadius: 14, overflow: "hidden", background: "#1a1a2a" }}>
          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "#1e1e34" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>✅ Tamamlananlar</div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(148,163,184,0.2)", color: GRAY400 }}>{tamamlandi.length} Bugün</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {tamamlandi.length === 0
              ? <EmptyState icon="✅" msg="Henüz tamamlanan yok" />
              : tamamlandi.map(s => (
                  <SiparisKartComp
                    key={s.id} kart={s} isAcil={false}
                    onKartClick={() => setDetayModal(s)}
                    onHazirla={() => {}} onTamamla={() => {}}
                    isTamamlandi
                  />
                ))
            }
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 64, left: "50%", transform: "translateX(-50%)", background: ORANGE, color: "white", padding: "12px 24px", borderRadius: 30, fontSize: 14, fontWeight: 800, zIndex: 500, boxShadow: "0 8px 24px rgba(245,130,31,0.4)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* ── HAZIRLAMAYA AL ONAY MODAL ───────────────────────────────────────── */}
      {onayModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setOnayModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 360, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🍳</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Hazırlamaya Al</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 6 }}>
              <strong style={{ color: NAVY }}>{onayModal.sezlong}</strong> — {onayModal.musteri}
            </p>
            <div style={{ background: GRAY50, borderRadius: 10, padding: "10px 14px", marginBottom: 20, textAlign: "left" }}>
              {onayModal.urunler.map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 13 }}>
                  <span>{u.emoji}</span>
                  <span style={{ flex: 1, fontWeight: 600, color: NAVY }}>{u.isim}</span>
                  <span style={{ color: GRAY400 }}>× {u.adet}</span>
                </div>
              ))}
              {onayModal.not && <div style={{ marginTop: 8, fontSize: 11, color: "#92400E", padding: "6px 8px", background: "#FEF3C7", borderRadius: 6 }}>⚠️ {onayModal.not}</div>}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setOnayModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => hazirlaBasla(onayModal)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>🍳 Hazırlamaya Al</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SİPARİŞ DETAY MODAL ─────────────────────────────────────────────── */}
      {detayModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setDetayModal(null)}>
          <div style={{ background: "white", borderRadius: 16, width: 400, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ height: 5, background: detayModal.barColor }} />
            <div style={{ background: NAVY, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(10,186,181,0.2)", border: `2px solid ${TEAL}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: TEAL }}>{detayModal.sezlong}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "white" }}>{detayModal.musteri}</div>
                  <div style={{ fontSize: 11, color: TEAL }}>{detayModal.durum === "yeni" ? "🔴 Yeni Sipariş" : detayModal.durum === "hazirlaniyor" ? "🟡 Hazırlanıyor" : "✅ Tamamlandı"}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {(() => {
                  const sc = detayModal.sureClass === "danger" ? RED : detayModal.sureClass === "warn" ? YELLOW : GREEN;
                  return <span style={{ fontSize: 18, fontWeight: 900, padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.1)", color: sc }}>{detayModal.sure}dk</span>;
                })()}
                <button onClick={() => setDetayModal(null)} style={{ width: 30, height: 30, border: "none", background: "rgba(255,255,255,0.1)", borderRadius: 8, color: "white", cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
            </div>

            <div style={{ padding: 18 }}>
              {/* ACİL badge */}
              {(detayModal.sure >= 15 || detayModal.oncelikli) && detayModal.durum !== "tamamlandi" && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: RED, color: "white", marginBottom: 12 }}>🔥 ACİL — En Uzun Bekleyen</div>
              )}

              {/* Ürünler */}
              <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, marginBottom: 8 }}>SİPARİŞ İÇERİĞİ</div>
              <div style={{ background: GRAY50, borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
                {detayModal.urunler.map((u, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < detayModal.urunler.length - 1 ? `1px solid ${GRAY200}` : "none" }}>
                    <span style={{ fontSize: 22 }}>{u.emoji}</span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: u.hazirlandi ? GRAY400 : NAVY, textDecoration: u.hazirlandi ? "line-through" : "none" }}>{u.isim}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: u.hazirlandi ? "white" : GRAY600, background: u.hazirlandi ? GREEN : GRAY100, padding: "2px 10px", borderRadius: 20 }}>× {u.adet}</span>
                  </div>
                ))}
              </div>

              {/* Not */}
              {detayModal.not && (
                <div style={{ marginBottom: 12, padding: "10px 12px", background: "#FEF3C7", borderRadius: 8, fontSize: 12, color: "#92400E", display: "flex", gap: 6 }}>
                  <span>⚠️</span><span><strong>Müşteri notu:</strong> {detayModal.not}</span>
                </div>
              )}

              {/* Teslim saati */}
              {detayModal.teslimSaat && (
                <div style={{ marginBottom: 12, padding: "8px 12px", background: "#DCFCE7", borderRadius: 8, fontSize: 12, color: "#16A34A", fontWeight: 600 }}>
                  ✓ {detayModal.teslimSaat}
                </div>
              )}

              {/* Aksiyon butonu */}
              {detayModal.durum === "yeni" && (
                <button onClick={() => { setDetayModal(null); setOnayModal(detayModal); }} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", background: ORANGE, color: "white" }}>🍳 Hazırlamaya Al</button>
              )}
              {detayModal.durum === "hazirlaniyor" && (
                <button onClick={() => { tamamla(detayModal); setDetayModal(null); }} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", background: GREEN, color: "white" }}>✅ Hazır — Garsona Ver</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ icon, msg }: { icon: string; msg: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.2)" }}>
      <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>{icon}</span>
      <p style={{ fontSize: 12, fontWeight: 600 }}>{msg}</p>
    </div>
  );
}

// ── Sipariş Kartı ─────────────────────────────────────────────────────────────
function SiparisKartComp({
  kart, onKartClick, onHazirla, onTamamla, isYeni, isHazirlaniyor, isTamamlandi, isAcil,
}: {
  kart: SiparisKart;
  onKartClick: () => void;
  onHazirla: () => void;
  onTamamla: () => void;
  isYeni?: boolean;
  isHazirlaniyor?: boolean;
  isTamamlandi?: boolean;
  isAcil: boolean;
}) {
  const sureColor = kart.sureClass === "danger" ? RED : kart.sureClass === "warn" ? YELLOW : GREEN;

  return (
    <div
      onClick={onKartClick}
      style={{
        background: isTamamlandi ? "#e5e7eb" : "white",
        borderRadius: 12, overflow: "hidden", cursor: "pointer",
        opacity: isTamamlandi ? 0.6 : 1,
        filter: isTamamlandi ? "grayscale(30%)" : undefined,
        boxShadow: isAcil && !isTamamlandi ? `0 0 0 2px ${RED}, 0 4px 16px rgba(239,68,68,0.3)` : undefined,
        transition: "opacity 0.2s",
      }}
    >
      <div style={{ height: 4, background: kart.barColor }} />
      <div style={{ padding: "10px 14px 8px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: isTamamlandi ? GRAY400 : NAVY }}>{kart.sezlong}</div>
          <div style={{ fontSize: 11, color: GRAY600, marginTop: 1 }}>{kart.musteri}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 900, display: "block", color: isTamamlandi ? GRAY400 : sureColor }}>{kart.sure}dk</span>
          <span style={{ fontSize: 9, color: GRAY400 }}>{kart.sureLabel}</span>
        </div>
      </div>

      {/* ACİL badge — auto for sure >= 15 */}
      {isAcil && !isTamamlandi && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: RED, color: "white", margin: "0 14px 8px" }}>
          🔥 ACİL — En Uzun Bekleyen
        </div>
      )}

      {/* Ürünler */}
      <div style={{ padding: "0 14px 10px" }}>
        {kart.urunler.map((u, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < kart.urunler.length - 1 ? `1px solid ${GRAY100}` : "none" }}>
            <span style={{ fontSize: 20 }}>{u.emoji}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: u.hazirlandi ? GRAY400 : NAVY, textDecoration: u.hazirlandi ? "line-through" : "none" }}>{u.isim}</span>
            <span style={{ fontSize: 13, fontWeight: 900, color: u.hazirlandi ? "white" : GRAY600, background: u.hazirlandi ? GREEN : GRAY100, padding: "2px 8px", borderRadius: 20 }}>× {u.adet}</span>
          </div>
        ))}
      </div>

      {/* Müşteri notu */}
      {kart.not && (
        <div style={{ margin: "0 14px 10px", padding: "8px 10px", background: "#FEF3C7", borderRadius: 8, fontSize: 11, color: "#92400E", display: "flex", gap: 6 }}>
          ⚠️ <span><strong>Müşteri notu:</strong> {kart.not}</span>
        </div>
      )}

      {/* Teslim saati */}
      {isTamamlandi && kart.teslimSaat && (
        <div style={{ padding: "6px 14px 10px", fontSize: 11, color: GRAY600, fontWeight: 600 }}>✓ {kart.teslimSaat}</div>
      )}

      {/* Aksiyon butonu — stop propagation so card click doesn't also fire */}
      {!isTamamlandi && (
        <div style={{ padding: "10px 14px", borderTop: `2px solid ${GRAY100}` }}>
          <button
            onClick={(e) => { e.stopPropagation(); isYeni ? onHazirla() : onTamamla(); }}
            style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", background: isYeni ? ORANGE : GREEN, color: "white" }}
          >
            {isYeni ? "🍳 Hazırlamaya Başla" : "✅ Hazır — Garsona Ver"}
          </button>
        </div>
      )}
    </div>
  );
}
