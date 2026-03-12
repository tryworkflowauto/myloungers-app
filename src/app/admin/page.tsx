"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "./AdminToastContext";

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
const BLUE   = "#3B82F6";
const PURPLE = "#7C3AED";

// ── Types ─────────────────────────────────────────────────────────────────────
type TesisDurum = "aktif" | "onay" | "askida";
type Tesis = {
  id: number; ad: string; lokasyon: string; emoji: string; emojiBg: string;
  durum: TesisDurum; sezlong: number;
  ciro?: string; komisyon?: string; puan?: number; puanYuzde?: number; sonAktivite: string;
};
type YorumTalep = { puan: number; tesis: string; kisi: string; metin: string; talep: string };

// ── Mock data ─────────────────────────────────────────────────────────────────
const INIT_TESISLER: Tesis[] = [
  { id: 1, ad: "Zuzuu Beach Hotel",  lokasyon: "📍 Bodrum", emoji: "🌊", emojiBg: "#E0F2FE", durum: "aktif", sezlong: 100, ciro: "₺148K", komisyon: "₺22.2K", puan: 9.2, puanYuzde: 92, sonAktivite: "2 dk önce" },
  { id: 2, ad: "Palmiye Beach Club", lokasyon: "📍 Bodrum", emoji: "☀️", emojiBg: "#FEF3C7", durum: "aktif", sezlong: 60,  ciro: "₺68K",  komisyon: "₺10.2K", puan: 8.8, puanYuzde: 88, sonAktivite: "14 dk önce" },
  { id: 3, ad: "Poseidon Lux",       lokasyon: "📍 Bodrum", emoji: "🔱", emojiBg: "#EDE9FE", durum: "aktif", sezlong: 45,  ciro: "₺41K",  komisyon: "₺6.1K",  puan: 9.5, puanYuzde: 95, sonAktivite: "1 saat önce" },
  { id: 4, ad: "Aqua Park Bodrum",   lokasyon: "📍 Bodrum", emoji: "🌊", emojiBg: "#FEE2E2", durum: "onay",  sezlong: 80,  sonAktivite: "Başvuru: 10 Mar" },
  { id: 5, ad: "Mavi Deniz Beach",   lokasyon: "📍 Bodrum", emoji: "🏖️", emojiBg: "#DBEAFE", durum: "onay",  sezlong: 35,  sonAktivite: "Başvuru: 9 Mar" },
];
const INIT_KOMISYON = [
  { tesis: "Zuzuu Beach",   ciro: "₺148K", oran: "%15", komisyon: "₺22.2K" },
  { tesis: "Palmiye Beach", ciro: "₺68K",  oran: "%15", komisyon: "₺10.2K" },
  { tesis: "Poseidon Lux",  ciro: "₺41K",  oran: "%15", komisyon: "₺6.1K"  },
];
const INIT_YORUMLAR: YorumTalep[] = [
  { puan: 4.1, tesis: "Zuzuu Beach",   kisi: "Hakan Ş.", metin: "Fiyatlar çok yüksek, hizmet berbat...", talep: "Talep: Hakaret içerdiği iddiası" },
  { puan: 6.2, tesis: "Palmiye Beach", kisi: "Selin A.", metin: "Beklediğim gibi değildi...",            talep: "Talep: Sahte yorum şüphesi" },
];

const STAT_DETAYLAR = [
  { baslik: "Aktif Tesisler", icerik: "Platforma kayıtlı ve aktif olarak hizmet veren tesisler. Bodrum: 8 · İstanbul: 3 · Antalya: 1" },
  { baslik: "Bu Ay Ciro",     icerik: "Zuzuu Beach: ₺148K · Palmiye: ₺68K · Poseidon: ₺41K · Diğer: ₺27K · Toplam: ₺284K" },
  { baslik: "Platform Komisyonu", icerik: "Mart 2026 komisyon geliri: ₺42.6K · Şubat 2026: ₺36.1K · Ocak 2026: ₺31.4K" },
  { baslik: "Aktif Müşteri",  icerik: "Platforma kayıtlı aktif müşteri sayısı. Bu hafta 124 yeni kayıt. Toplam rezervasyon: 4.822" },
  { baslik: "Ort. Tesis Puanı", icerik: "Tüm tesislerin ortalama müşteri puanı. En yüksek: Poseidon Lux 9.5 · En düşük: Palmiye 8.8" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const tesislerRef   = useRef<HTMLDivElement>(null);

  const [tesisler,        setTesisler]        = useState<Tesis[]>(INIT_TESISLER);
  const [yorumTalepleri,  setYorumTalepleri]  = useState<YorumTalep[]>(INIT_YORUMLAR);
  const [tesisAra,        setTesisAra]        = useState("");
  const [bannerGoster,    setBannerGoster]    = useState(true);
  const [highlightOnay,   setHighlightOnay]   = useState(false);

  // Modals
  const [onayModal,    setOnayModal]    = useState<Tesis | null>(null);
  const [reddetModal,  setReddetModal]  = useState<Tesis | null>(null);
  const [redSebebi,    setRedSebebi]    = useState("");
  const [yorumSilIdx,  setYorumSilIdx]  = useState<number | null>(null);
  const [statDetay,    setStatDetay]    = useState<number | null>(null);
  const [dropdownId,   setDropdownId]   = useState<number | null>(null);

  // ESC + outside-click to close dropdown
  useEffect(() => {
    function h(e: KeyboardEvent) {
      if (e.key === "Escape") { setOnayModal(null); setReddetModal(null); setYorumSilIdx(null); setStatDetay(null); setDropdownId(null); }
    }
    function c() { setDropdownId(null); }
    window.addEventListener("keydown", h);
    window.addEventListener("click", c);
    return () => { window.removeEventListener("keydown", h); window.removeEventListener("click", c); };
  }, []);

  // ── Filtered tesisler ────────────────────────────────────────────────────
  const filtrelenmisTesisler = tesisler.filter(t =>
    !tesisAra || t.ad.toLowerCase().includes(tesisAra.toLowerCase())
  );

  // ── Actions ───────────────────────────────────────────────────────────────
  function onaylaTesis(t: Tesis) {
    setTesisler(p => p.map(x => x.id === t.id ? { ...x, durum: "aktif" as TesisDurum } : x));
    setOnayModal(null);
    showToast("✅ " + t.ad + " onaylandı!", GREEN);
  }
  function reddetTesis(t: Tesis) {
    setTesisler(p => p.filter(x => x.id !== t.id));
    setReddetModal(null); setRedSebebi("");
    showToast("✗ " + t.ad + " başvurusu reddedildi", RED);
  }
  function askiyaAl(id: number) {
    setTesisler(p => p.map(x => x.id === id ? { ...x, durum: "askida" as TesisDurum } : x));
    setDropdownId(null);
    showToast("⏸ Tesis askıya alındı");
  }
  function silTesis(id: number) {
    setTesisler(p => p.filter(x => x.id !== id));
    setDropdownId(null);
    showToast("🗑️ Tesis silindi", RED);
  }
  function yorumSil(idx: number) {
    setYorumTalepleri(p => p.filter((_, i) => i !== idx));
    setYorumSilIdx(null);
    showToast("🗑️ Yorum silindi", RED);
  }
  function yorumTalepReddet(idx: number) {
    setYorumTalepleri(p => p.filter((_, i) => i !== idx));
    showToast("✗ Silme talebi reddedildi");
  }
  function paneleGir(t: Tesis) {
    showToast("🔑 " + t.ad + " paneline giriliyor…", TEAL);
    setTimeout(() => router.push("/isletme"), 800);
  }
  function inceleOnaylar() {
    setBannerGoster(false);
    setHighlightOnay(true);
    tesislerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => setHighlightOnay(false), 3000);
  }

  const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" };

  return (
    <>
      {/* STAT KARTLARI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { val: "12",    label: "Aktif Tesis",          sub: "↑ 2 bu ay eklendi", color: ORANGE },
          { val: "₺284K", label: "Bu Ay Ciro",           sub: "↑ %18 geçen ay",    color: TEAL   },
          { val: "₺42K",  label: "Platform Komisyonu",   sub: "↑ %18 geçen ay",    color: GREEN  },
          { val: "1.847", label: "Aktif Müşteri",        sub: "↑ 124 bu hafta",    color: BLUE   },
          { val: "9.2",   label: "Ort. Tesis Puanı",     sub: "↑ 0.3 bu ay",       color: PURPLE },
        ].map((s, i) => (
          <div
            key={i}
            onClick={() => setStatDetay(i)}
            style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: 16, position: "relative", overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
            <div style={{ fontSize: 26, fontWeight: 900, color: NAVY, marginBottom: 3 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: GRAY400, fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 10, fontWeight: 700, marginTop: 5, color: GREEN }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ONAY BANNER */}
      {bannerGoster && (
        <div style={{ background: "linear-gradient(135deg,#FEF3C7,#FFFBEB)", border: "1.5px solid #FDE68A", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 24 }}>⏳</span>
          <div style={{ flex: 1 }}>
            <strong style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#92400E" }}>2 Tesis Onay Bekliyor</strong>
            <span style={{ fontSize: 11, color: "#B45309" }}>Aqua Park Bodrum ve Mavi Deniz Beach başvuru yaptı</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setBannerGoster(false)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Sonra Bak</button>
            <button onClick={inceleOnaylar} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>İncele →</button>
          </div>
        </div>
      )}

      {/* TÜM TESİSLER */}
      <div ref={tesislerRef} style={{ background: "white", borderRadius: 14, border: `2px solid ${highlightOnay ? ORANGE : GRAY200}`, overflow: "hidden", marginBottom: 16, transition: "border-color 0.4s" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>🏖️ Tüm Tesisler</h3>
          <input
            type="text" placeholder="🔍 Tesis ara..." value={tesisAra}
            onChange={(e) => setTesisAra(e.target.value)}
            style={{ padding: "6px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 12, width: 150 }}
          />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: GRAY50 }}>
                {["Tesis","Durum","Şezlong","Bu Ay Ciro","Komisyon","Puan","Son Aktivite","Eylemler"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrelenmisTesisler.map((t) => (
                <tr key={t.id} style={{ background: t.durum === "onay" ? (highlightOnay ? "#FFF7ED" : "#FFFBEB") : t.durum === "askida" ? "#FFF1F2" : undefined, transition: "background 0.3s" }}>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: t.emojiBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{t.emoji}</div>
                      <div><div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{t.ad}</div><div style={{ fontSize: 11, color: GRAY400 }}>{t.lokasyon}</div></div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}` }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: t.durum === "aktif" ? "#DCFCE7" : t.durum === "askida" ? "#FEE2E2" : "#FEF3C7", color: t.durum === "aktif" ? "#16A34A" : t.durum === "askida" ? RED : "#D97706" }}>
                      ● {t.durum === "aktif" ? "Aktif" : t.durum === "askida" ? "Askıda" : "Onay Bekliyor"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}` }}>{t.sezlong} şzl</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}`, fontWeight: 700 }}>{t.durum === "aktif" ? t.ciro : "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}`, fontWeight: 700, color: t.durum === "aktif" ? GREEN : GRAY400 }}>{t.durum === "aktif" ? t.komisyon : "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}` }}>
                    {t.durum === "aktif" ? (
                      <>
                        <div style={{ width: 50, height: 4, background: GRAY200, borderRadius: 20, overflow: "hidden", display: "inline-block", verticalAlign: "middle", marginRight: 4 }}>
                          <div style={{ height: "100%", width: (t.puanYuzde ?? 0) + "%", borderRadius: 20, background: GREEN }} />
                        </div>
                        {t.puan}
                      </>
                    ) : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}`, color: GRAY400 }}>{t.sonAktivite}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}` }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "nowrap", alignItems: "center" }}>
                      {t.durum === "onay" && (
                        <>
                          <button onClick={() => setOnayModal(t)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: TEAL, color: "white", cursor: "pointer", whiteSpace: "nowrap" }}>✓ Onayla</button>
                          <button onClick={() => { setReddetModal(t); setRedSebebi(""); }} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid #FECACA`, background: "#FEF2F2", color: RED, cursor: "pointer", whiteSpace: "nowrap" }}>✗ Reddet</button>
                        </>
                      )}
                      <button
                        onClick={() => paneleGir(t)}
                        style={{ padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 700, background: "#F0FDF4", color: GREEN, border: `1px solid #BBF7D0`, cursor: "pointer", whiteSpace: "nowrap" }}
                      >🔑 {t.durum === "onay" ? "Kurulum" : "Panele Gir"}</button>
                      {/* ... dropdown */}
                      <div style={{ position: "relative" }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDropdownId(dropdownId === t.id ? null : t.id); }}
                          style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}
                        >···</button>
                        {dropdownId === t.id && (
                          <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", right: 0, top: 32, background: "white", borderRadius: 10, border: `1px solid ${GRAY200}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 50, minWidth: 150, overflow: "hidden" }}>
                            <button onClick={() => { setDropdownId(null); showToast("📋 Tesis detayı — Yakında aktif"); }} style={{ width: "100%", padding: "9px 14px", background: "none", border: "none", textAlign: "left", fontSize: 12, color: GRAY800, cursor: "pointer", fontWeight: 500 }}>📋 Detay Gör</button>
                            <button onClick={() => askiyaAl(t.id)} style={{ width: "100%", padding: "9px 14px", background: "none", border: "none", textAlign: "left", fontSize: 12, color: YELLOW, cursor: "pointer", fontWeight: 600 }}>⏸ Askıya Al</button>
                            <div style={{ height: 1, background: GRAY100 }} />
                            <button onClick={() => silTesis(t.id)} style={{ width: "100%", padding: "9px 14px", background: "none", border: "none", textAlign: "left", fontSize: 12, color: RED, cursor: "pointer", fontWeight: 600 }}>🗑️ Sil</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2 KOLON */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Komisyon Özeti */}
        <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}` }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>💰 Komisyon Özeti — Mart 2026</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: GRAY50 }}>
                {["Tesis","Ciro","Oran","Komisyon"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INIT_KOMISYON.map((k, i) => (
                <tr key={i}>
                  <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 600 }}>{k.tesis}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12 }}>{k.ciro}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12 }}><span style={{ background: "#F0FDF4", color: GREEN, padding: "2px 7px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{k.oran}</span></td>
                  <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: GREEN }}>{k.komisyon}</td>
                </tr>
              ))}
              <tr style={{ background: GRAY50, borderTop: `2px solid ${GRAY200}` }}>
                <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800 }}>TOPLAM</td>
                <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800 }}>₺284K</td>
                <td style={{ padding: "12px 16px", fontSize: 12 }}>—</td>
                <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 900, color: ORANGE }}>₺42.6K</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Yorum Silme Talepleri */}
        <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>⭐ Yorum Silme Talepleri</h3>
            <span style={{ fontSize: 10, color: GRAY400 }}>Sadece siz silebilirsiniz</span>
          </div>
          {yorumTalepleri.length === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center", color: GRAY400 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
              <p style={{ fontSize: 12, fontWeight: 600 }}>Bekleyen talep yok</p>
            </div>
          )}
          {yorumTalepleri.map((y, i) => (
            <div key={i} style={{ padding: "14px 16px", borderBottom: i < yorumTalepleri.length - 1 ? `1px solid ${GRAY100}` : "none" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: y.puan < 5 ? RED : YELLOW, color: "white", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 8 }}>{y.puan}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 2 }}>{y.tesis} — {y.kisi}</div>
                  <div style={{ fontSize: 11, color: GRAY600, marginBottom: 5 }}>{y.metin}</div>
                  <div style={{ fontSize: 10, color: GRAY400 }}>{y.talep}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button onClick={() => setYorumSilIdx(i)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid #FECACA`, background: "#FEF2F2", color: RED, cursor: "pointer" }}>🗑️ Sil</button>
                  <button onClick={() => yorumTalepReddet(i)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Reddet</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TESİS ONAY MODAL ──────────────────────────────────────────────── */}
      {onayModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setOnayModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 400, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Tesis Onaylanacak</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 20 }}>
              <strong style={{ color: NAVY }}>{onayModal.ad}</strong> onaylanacak ve sisteme dahil edilecek. Emin misiniz?
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setOnayModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => onaylaTesis(onayModal)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>✓ Onayla</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TESİS REDDET MODAL ────────────────────────────────────────────── */}
      {reddetModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setReddetModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 440, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Başvuruyu Reddet</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 16 }}>
              <strong style={{ color: RED }}>{reddetModal.ad}</strong> başvurusu reddedilecek.
            </p>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Red Sebebi (isteğe bağlı)</label>
            <textarea
              value={redSebebi} onChange={(e) => setRedSebebi(e.target.value)}
              placeholder="Belge eksikliği, uygunsuz lokasyon vb..."
              rows={4}
              style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setReddetModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => reddetTesis(reddetModal)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", background: RED, color: "white", cursor: "pointer" }}>✗ Reddet</button>
            </div>
          </div>
        </div>
      )}

      {/* ── YORUM SİL ONAY MODAL ──────────────────────────────────────────── */}
      {yorumSilIdx !== null && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setYorumSilIdx(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 380, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Yorumu Sil</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 6 }}>Bu yorumu silmek istediğinize emin misiniz?</p>
            <div style={{ background: GRAY50, borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: GRAY600, textAlign: "left" }}>
              <strong>{yorumTalepleri[yorumSilIdx]?.tesis} — {yorumTalepleri[yorumSilIdx]?.kisi}</strong><br />
              <span style={{ color: GRAY400 }}>{yorumTalepleri[yorumSilIdx]?.metin}</span>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setYorumSilIdx(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => yorumSil(yorumSilIdx)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", background: RED, color: "white", cursor: "pointer" }}>🗑️ Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STAT DETAY MODAL ──────────────────────────────────────────────── */}
      {statDetay !== null && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setStatDetay(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 400, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{STAT_DETAYLAR[statDetay].baslik}</h3>
              <button onClick={() => setStatDetay(null)} style={{ width: 28, height: 28, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: GRAY600, lineHeight: 1.6 }}>{STAT_DETAYLAR[statDetay].icerik}</p>
          </div>
        </div>
      )}
    </>
  );
}
