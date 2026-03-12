"use client";

import { useState } from "react";

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
const BLUE = "#3B82F6";
const PURPLE = "#7C3AED";
const SIDEBAR_W = 240;

// Mock - Tesisler
const TESISLER = [
  { id: 1, ad: "Zuzuu Beach Hotel", lokasyon: "📍 Bodrum", emoji: "🌊", emojiBg: "#E0F2FE", durum: "aktif" as const, sezlong: 100, ciro: "₺148K", komisyon: "₺22.2K", puan: 9.2, puanYuzde: 92, sonAktivite: "2 dk önce" },
  { id: 2, ad: "Palmiye Beach Club", lokasyon: "📍 Bodrum", emoji: "☀️", emojiBg: "#FEF3C7", durum: "aktif" as const, sezlong: 60, ciro: "₺68K", komisyon: "₺10.2K", puan: 8.8, puanYuzde: 88, sonAktivite: "14 dk önce" },
  { id: 3, ad: "Poseidon Lux", lokasyon: "📍 Bodrum", emoji: "🔱", emojiBg: "#EDE9FE", durum: "aktif" as const, sezlong: 45, ciro: "₺41K", komisyon: "₺6.1K", puan: 9.5, puanYuzde: 95, sonAktivite: "1 saat önce" },
  { id: 4, ad: "Aqua Park Bodrum", lokasyon: "📍 Bodrum", emoji: "🌊", emojiBg: "#FEE2E2", durum: "onay" as const, sezlong: 80, sonAktivite: "Başvuru: 10 Mar" },
  { id: 5, ad: "Mavi Deniz Beach", lokasyon: "📍 Bodrum", emoji: "🏖️", emojiBg: "#DBEAFE", durum: "onay" as const, sezlong: 35, sonAktivite: "Başvuru: 9 Mar" },
];

// Mock - Komisyon özeti
const KOMISYON_OZET = [
  { tesis: "Zuzuu Beach", ciro: "₺148K", oran: "%15", komisyon: "₺22.2K" },
  { tesis: "Palmiye Beach", ciro: "₺68K", oran: "%15", komisyon: "₺10.2K" },
  { tesis: "Poseidon Lux", ciro: "₺41K", oran: "%15", komisyon: "₺6.1K" },
];

// Mock - Yorum talepleri
const YORUM_TALEPLERI = [
  { puan: 4.1, tesis: "Zuzuu Beach", kisi: "Hakan Ş.", metin: "Fiyatlar çok yüksek, hizmet berbat...", talep: "Talep: Hakaret içerdiği iddiası" },
  { puan: 6.2, tesis: "Palmiye Beach", kisi: "Selin A.", metin: "Beklediğim gibi değildi...", talep: "Talep: Sahte yorum şüphesi" },
];

// Mock - Mutabakatlar
const MUTABAKATLAR = [
  { tesis: "Zuzuu Beach Hotel", donem: "Mart 2026", hacim: "₺148.000", iyzico: "₺4.440", ml: "₺7.400", isletme: "₺136.160", durum: "onaylandi" as const },
  { tesis: "Palmiye Beach Club", donem: "Mart 2026", hacim: "₺68.000", iyzico: "₺2.040", ml: "₺3.400", isletme: "₺62.560", durum: "bekliyor" as const },
  { tesis: "Poseidon Lux", donem: "Mart 2026", hacim: "₺41.000", iyzico: "₺1.230", ml: "₺2.050", isletme: "₺37.720", durum: "bekliyor" as const },
  { tesis: "Aqua Blue", donem: "Şubat 2026", hacim: "₺27.000", iyzico: "₺810", ml: "₺1.350", isletme: "₺24.840", durum: "itiraz" as const },
];

export default function AdminPage() {
  const [sayfa, setSayfa] = useState<"dashboard" | "komisyon">("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null);
  const [sifre, setSifre] = useState("MyL2026beach");
  const [akisTutar, setAkisTutar] = useState(2000);
  const [tesisAra, setTesisAra] = useState("");

  const showToast = (msg: string, color: string = GREEN) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const sifreYenile = () => {
    const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let s = "MyL";
    for (let i = 0; i < 7; i++) s += c[Math.floor(Math.random() * c.length)];
    setSifre(s);
  };

  const iyzico = Math.round(akisTutar * 0.03);
  const myl = Math.round(akisTutar * 0.02);
  const isletme = Math.round(akisTutar * 0.92);

  const filtrelenmisTesisler = tesisAra ? TESISLER.filter((t) => t.ad.toLowerCase().includes(tesisAra.toLowerCase())) : TESISLER;

  const NAV_ITEMS = [
    { key: "dashboard" as const, icon: "📊", label: "Dashboard" },
    { key: "dashboard" as const, icon: "🏖️", label: "Tesisler", badge: 2, badgeColor: ORANGE },
    { key: "dashboard" as const, icon: "👤", label: "Kullanıcılar" },
    { key: "komisyon" as const, icon: "💰", label: "Komisyon Takibi" },
    { key: "dashboard" as const, icon: "📄", label: "Abonelikler" },
    { key: "dashboard" as const, icon: "⭐", label: "Yorum Yönetimi", badge: 3, badgeColor: RED },
    { key: "dashboard" as const, icon: "🚨", label: "Şikayetler", badge: 1, badgeColor: RED },
    { key: "dashboard" as const, icon: "⚙️", label: "Platform Ayarları" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <aside style={{ width: SIDEBAR_W, background: "#060e1a", minHeight: "100vh", position: "fixed", left: 0, top: 0, display: "flex", flexDirection: "column", zIndex: 100 }}>
        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: ORANGE, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚙️</div>
            <div><span style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#fff" }}>MY LOUNGERS</span><span style={{ display: "block", fontSize: 10, color: ORANGE }}>Süper Admin</span></div>
          </div>
        </div>
        <div style={{ margin: "10px 16px", background: "rgba(245,130,31,0.15)", border: "1px solid rgba(245,130,31,0.3)", borderRadius: 8, padding: "7px 12px", fontSize: 11, fontWeight: 700, color: ORANGE }}>🔐 Platform Yöneticisi</div>
        <nav style={{ padding: "4px 0", flex: 1 }}>
          <div style={{ padding: "14px 16px 5px", fontSize: 9, fontWeight: 700, color: GRAY400 }}>Platform</div>
          {NAV_ITEMS.slice(0, 3).map((n) => (
            <div key={n.label} onClick={() => setSayfa(n.key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", cursor: "pointer", background: sayfa === n.key ? "rgba(245,130,31,0.12)" : "transparent", position: "relative", borderLeft: sayfa === n.key ? `3px solid ${ORANGE}` : "none", marginLeft: sayfa === n.key ? 0 : 3 }}>
              <div style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, fontSize: 14, background: sayfa === n.key ? "rgba(245,130,31,0.2)" : "transparent" }}>{n.icon}</div>
              <span style={{ fontSize: 13, color: sayfa === n.key ? ORANGE : "#CBD5E1", fontWeight: sayfa === n.key ? 600 : 500 }}>{n.label}</span>
              {n.badge && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 10, background: n.badgeColor, color: "white" }}>{n.badge}</span>}
            </div>
          ))}
          <div style={{ padding: "14px 16px 5px", fontSize: 9, fontWeight: 700, color: GRAY400 }}>Finans</div>
          {NAV_ITEMS.slice(3, 5).map((n) => (
            <div key={n.label} onClick={() => setSayfa(n.key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", cursor: "pointer", background: sayfa === n.key ? "rgba(245,130,31,0.12)" : "transparent" }}>
              <div style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, fontSize: 14 }}>{n.icon}</div>
              <span style={{ fontSize: 13, color: sayfa === n.key ? ORANGE : "#CBD5E1" }}>{n.label}</span>
            </div>
          ))}
          <div style={{ padding: "14px 16px 5px", fontSize: 9, fontWeight: 700, color: GRAY400 }}>Moderasyon</div>
          {NAV_ITEMS.slice(5, 7).map((n) => (
            <div key={n.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", cursor: "pointer" }}>
              <div style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, fontSize: 14 }}>{n.icon}</div>
              <span style={{ fontSize: 13, color: "#CBD5E1" }}>{n.label}</span>
              {n.badge && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 10, background: RED, color: "white" }}>{n.badge}</span>}
            </div>
          ))}
          <div style={{ padding: "14px 16px 5px", fontSize: 9, fontWeight: 700, color: GRAY400 }}>Sistem</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", cursor: "pointer" }}>
            <div style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, fontSize: 14 }}>⚙️</div>
            <span style={{ fontSize: 13, color: "#CBD5E1" }}>Platform Ayarları</span>
          </div>
        </nav>
        <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: ORANGE, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>ZB</div>
            <div><span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "white" }}>Zafer Bakır</span><span style={{ display: "block", fontSize: 10, color: GRAY400 }}>Süper Admin</span></div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: SIDEBAR_W, flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>Platform Yönetimi</h1>
            <span style={{ fontSize: 11, color: GRAY400 }}>MyLoungers Admin · 11 Mart 2026</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>📥 Rapor İndir</button>
            <button onClick={() => setModalOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>➕ Yeni Tesis Ekle</button>
          </div>
        </header>

        <div style={{ padding: "20px 24px", flex: 1 }}>
          {sayfa === "dashboard" ? (
            <>
              {/* STAT KARTLARI */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { val: "12", label: "Aktif Tesis", sub: "↑ 2 bu ay eklendi", color: ORANGE },
                  { val: "₺284K", label: "Bu Ay Ciro", sub: "↑ %18 geçen ay", color: TEAL },
                  { val: "₺42K", label: "Platform Komisyonu", sub: "↑ %18 geçen ay", color: GREEN },
                  { val: "1.847", label: "Aktif Müşteri", sub: "↑ 124 bu hafta", color: BLUE },
                  { val: "9.2", label: "Ort. Tesis Puanı", sub: "↑ 0.3 bu ay", color: PURPLE },
                ].map((s, i) => (
                  <div key={i} style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: 16, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                    <div style={{ fontSize: 26, fontWeight: 900, color: NAVY, marginBottom: 3 }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: GRAY400, fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, marginTop: 5, color: GREEN }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* ONAY BANNER */}
              <div style={{ background: "linear-gradient(135deg,#FEF3C7,#FFFBEB)", border: "1.5px solid #FDE68A", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>⏳</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#92400E" }}>2 Tesis Onay Bekliyor</strong>
                  <span style={{ fontSize: 11, color: "#B45309" }}>Aqua Park Bodrum ve Mavi Deniz Beach başvuru yaptı</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Sonra Bak</button>
                  <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>İncele →</button>
                </div>
              </div>

              {/* TÜM TESİSLER */}
              <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>🏖️ Tüm Tesisler</h3>
                  <input type="text" placeholder="🔍 Tesis ara..." value={tesisAra} onChange={(e) => setTesisAra(e.target.value)} style={{ padding: "6px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 12, width: 150 }} />
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: GRAY50 }}>
                        <th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Tesis</th>
                        <th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Durum</th>
                        <th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Şezlong</th>
                        <th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Bu Ay Ciro</th>
                        <th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Komisyon</th>
                        <th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Puan</th>
                        <th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Son Aktivite</th>
                        <th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Eylemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrelenmisTesisler.map((t) => (
                        <tr key={t.id} style={{ background: t.durum === "onay" ? "#FFFBEB" : undefined }}>
                          <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: t.emojiBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{t.emoji}</div>
                              <div><div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{t.ad}</div><div style={{ fontSize: 10, color: GRAY400 }}>{t.lokasyon}</div></div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", borderTop: `1px solid ${GRAY100}` }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: t.durum === "aktif" ? "#DCFCE7" : "#FEF3C7", color: t.durum === "aktif" ? "#16A34A" : "#D97706" }}>● {t.durum === "aktif" ? "Aktif" : "Onay Bekliyor"}</span>
                          </td>
                          <td style={{ padding: "12px 16px", borderTop: `1px solid ${GRAY100}` }}>{t.sezlong} şzl</td>
                          <td style={{ padding: "12px 16px", borderTop: `1px solid ${GRAY100}`, fontWeight: 700 }}>{t.durum === "aktif" ? t.ciro : "—"}</td>
                          <td style={{ padding: "12px 16px", borderTop: `1px solid ${GRAY100}`, fontWeight: 700, color: t.durum === "aktif" ? GREEN : GRAY400 }}>{t.durum === "aktif" ? t.komisyon : "—"}</td>
                          <td style={{ padding: "12px 16px", borderTop: `1px solid ${GRAY100}` }}>
                            {t.durum === "aktif" ? (
                              <>
                                <div style={{ width: 50, height: 4, background: GRAY200, borderRadius: 20, overflow: "hidden", display: "inline-block", verticalAlign: "middle", marginRight: 4 }}>
                                  <div style={{ height: "100%", width: (t.puanYuzde ?? 0) + "%", borderRadius: 20, background: GREEN }} />
                                </div>
                                {t.puan}
                              </>
                            ) : "—"}
                          </td>
                          <td style={{ padding: "12px 16px", borderTop: `1px solid ${GRAY100}`, color: GRAY400, fontSize: 11 }}>{t.sonAktivite}</td>
                          <td style={{ padding: "12px 16px", borderTop: `1px solid ${GRAY100}` }}>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {t.durum === "onay" && (
                                <>
                                  <button onClick={() => showToast(t.ad + " onaylandı!", GREEN)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>✓ Onayla</button>
                                  <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid #FECACA`, background: "#FEF2F2", color: RED, cursor: "pointer" }}>✗ Reddet</button>
                                </>
                              )}
                              <button onClick={() => showToast("Panele giriliyor: " + t.ad, TEAL)} style={{ padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 700, background: "#F0FDF4", color: GREEN, border: `1px solid #BBF7D0`, cursor: "pointer" }}>🔑 {t.durum === "onay" ? "Kurulum" : "Panele Gir"}</button>
                              <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>···</button>
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
                <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
                  <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}` }}><h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>💰 Komisyon Özeti — Mart 2026</h3></div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: GRAY50 }}><th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Tesis</th><th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Ciro</th><th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Oran</th><th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Komisyon</th></tr></thead>
                    <tbody>
                      {KOMISYON_OZET.map((k, i) => (
                        <tr key={i}><td style={{ padding: "12px 16px", fontWeight: 600 }}>{k.tesis}</td><td style={{ padding: "12px 16px" }}>{k.ciro}</td><td style={{ padding: "12px 16px" }}><span style={{ background: "#F0FDF4", color: GREEN, padding: "2px 7px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{k.oran}</span></td><td style={{ padding: "12px 16px", fontWeight: 800, color: GREEN }}>{k.komisyon}</td></tr>
                      ))}
                      <tr style={{ background: GRAY50, borderTop: `2px solid ${GRAY200}` }}><td style={{ padding: "12px 16px", fontWeight: 800 }}>TOPLAM</td><td style={{ padding: "12px 16px", fontWeight: 800 }}>₺284K</td><td style={{ padding: "12px 16px" }}>—</td><td style={{ padding: "12px 16px", fontWeight: 900, fontSize: 14, color: ORANGE }}>₺42.6K</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
                  <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>⭐ Yorum Silme Talepleri</h3>
                    <span style={{ fontSize: 10, color: GRAY400 }}>Sadece siz silebilirsiniz</span>
                  </div>
                  {YORUM_TALEPLERI.map((y, i) => (
                    <div key={i} style={{ padding: "14px 16px", borderBottom: i < YORUM_TALEPLERI.length - 1 ? `1px solid ${GRAY100}` : "none" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <span style={{ background: i === 0 ? RED : YELLOW, color: "white", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 8 }}>{y.puan}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 2 }}>{y.tesis} — {y.kisi}</div>
                          <div style={{ fontSize: 11, color: GRAY600, marginBottom: 5 }}>{y.metin}</div>
                          <div style={{ fontSize: 10, color: GRAY400 }}>{y.talep}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <button onClick={() => showToast("Yorum silindi", RED)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid #FECACA`, background: "#FEF2F2", color: RED, cursor: "pointer" }}>🗑️ Sil</button>
                          <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Reddet</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* KOMİSYON SAYFASI */
            <div style={{ padding: "20px 24px" }}>
              {/* PARA AKIŞI */}
              <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: "18px 20px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>💸 Canlı Para Akışı Hesaplayıcı</div>
                  <span style={{ fontSize: 11, color: GRAY400 }}>Tutarı değiştir → dağılım anında güncellenir</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: GRAY50, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>Müşteri Ödeme Tutarı:</label>
                  <input type="number" value={akisTutar} onChange={(e) => setAkisTutar(Number(e.target.value) || 0)} style={{ padding: "6px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 14, fontWeight: 800, color: BLUE, width: 120 }} />
                  <span style={{ fontSize: 11, color: ORANGE, fontStyle: "italic" }}>← Şezlong kirası tutarını gir</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
                  {[
                    { icon: "👤", isim: "Müşteri", tutar: "₺" + akisTutar.toLocaleString("tr-TR"), oran: "Kartından çekilir", bg: "#EFF6FF", border: "#BFDBFE", color: BLUE },
                    { icon: "→", isim: "", tutar: "", oran: "", sep: true },
                    { icon: "🏦", isim: "iyzico / Paratica", tutar: "₺" + iyzico.toLocaleString("tr-TR"), oran: "%3 işlem ücreti", bg: "#FEF2F2", border: "#FECACA", color: RED },
                    { icon: "+", isim: "", tutar: "", oran: "", sep: true },
                    { icon: "⚙️", isim: "MyLoungers Net", tutar: "₺" + myl.toLocaleString("tr-TR"), oran: "%5 brüt - %3 iyzico = %2", bg: "#F0FDF4", border: "#BBF7D0", color: GREEN },
                    { icon: "+", isim: "", tutar: "", oran: "", sep: true },
                    { icon: "🏖️", isim: "İşletme", tutar: "₺" + isletme.toLocaleString("tr-TR"), oran: "%92 otomatik aktarım", bg: "#FFF7ED", border: "#FED7AA", color: ORANGE },
                  ].map((n, i) =>
                    n.sep ? (
                      <span key={i} style={{ fontSize: 22, color: GRAY400, margin: "0 4px" }}>{n.icon}</span>
                    ) : (
                      <div key={i} style={{ borderRadius: 12, padding: "14px 16px", textAlign: "center", minWidth: 130, background: n.bg, border: `2px solid ${n.border}` }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>{n.icon}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: n.color }}>{n.isim}</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: n.color, marginTop: 3 }}>{n.tutar}</div>
                        <div style={{ fontSize: 10, marginTop: 1 }}>{n.oran}</div>
                      </div>
                    )
                  )}
                </div>
                <div style={{ marginTop: 12, background: GRAY50, borderRadius: 8, padding: "10px 14px", fontSize: 11, color: GRAY600 }}>
                  💡 <strong>Ek bakiye yüklemelerinde</strong> (sipariş harcaması): MyLoungers komisyon almaz, sadece iyzico %3 keser ve bu müşteriye yansıtılır. İşletme net tutarın tamamını alır.
                </div>
              </div>

              {/* FİNANSAL ÖZET */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { val: "₺42.6K", label: "Platform Net Geliri — Mart", sub: "↑ %18 geçen ay", subColor: GREEN, topColor: GREEN },
                  { val: "₺8.5K", label: "iyzico Toplam Gideri — Mart", sub: "Toplam işlem hacminin %3'ü", subColor: RED, topColor: RED },
                  { val: "₺284K", label: "Toplam İşlem Hacmi — Mart", sub: "Tüm tesisler birleşik", subColor: TEAL, topColor: TEAL },
                  { val: "₺261K", label: "Toplam İşletme Aktarımı — Mart", sub: "%92 otomatik aktarıldı", subColor: ORANGE, topColor: ORANGE },
                ].map((f, i) => (
                  <div key={i} style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: 16, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: f.topColor }} />
                    <div style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 3 }}>{f.val}</div>
                    <div style={{ fontSize: 10, color: GRAY400, fontWeight: 600 }}>{f.label}</div>
                    <div style={{ fontSize: 10, marginTop: 4, color: f.subColor }}>{f.sub}</div>
                  </div>
                ))}
              </div>

              {/* MUTABAKATLAR */}
              <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>📋 Aylık Mutabakatlar</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>📥 Excel İndir</button>
                    <button onClick={() => showToast("📨 Tüm işletmelere mutabakat e-postası gönderildi!", TEAL)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>📨 Tüm İşletmelere Gönder</button>
                  </div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: GRAY50 }}>
                      <th style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Tesis</th>
                      <th style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Dönem</th>
                      <th style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>İşlem Hacmi</th>
                      <th style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>iyzico Gideri</th>
                      <th style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>ML Komisyonu</th>
                      <th style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>İşletme Aktarımı</th>
                      <th style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Durum</th>
                      <th style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Eylem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MUTABAKATLAR.map((m, i) => (
                      <tr key={i} style={{ background: m.durum === "itiraz" ? "#FEF2F2" : undefined }}>
                        <td style={{ padding: "11px 14px", fontWeight: 700, borderTop: `1px solid ${GRAY100}` }}>{m.tesis}</td>
                        <td style={{ padding: "11px 14px", borderTop: `1px solid ${GRAY100}` }}>{m.donem}</td>
                        <td style={{ padding: "11px 14px", fontWeight: 700, borderTop: `1px solid ${GRAY100}` }}>{m.hacim}</td>
                        <td style={{ padding: "11px 14px", color: RED, borderTop: `1px solid ${GRAY100}` }}>{m.iyzico}</td>
                        <td style={{ padding: "11px 14px", color: TEAL, fontWeight: 700, borderTop: `1px solid ${GRAY100}` }}>{m.ml}</td>
                        <td style={{ padding: "11px 14px", color: GREEN, fontWeight: 700, borderTop: `1px solid ${GRAY100}` }}>{m.isletme}</td>
                        <td style={{ padding: "11px 14px", borderTop: `1px solid ${GRAY100}` }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4, background: m.durum === "onaylandi" ? "#DCFCE7" : m.durum === "bekliyor" ? "#FEF3C7" : "#FEE2E2", color: m.durum === "onaylandi" ? "#16A34A" : m.durum === "bekliyor" ? "#D97706" : RED }}>
                            {m.durum === "onaylandi" ? "✅ Onaylandı" : m.durum === "bekliyor" ? "⏳ Bekliyor" : "⚠️ İtiraz Var"}
                          </span>
                        </td>
                        <td style={{ padding: "11px 14px", borderTop: `1px solid ${GRAY100}` }}>
                          {m.durum === "bekliyor" && <button onClick={() => showToast("📨 Hatırlatma e-postası gönderildi!", ORANGE)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>📨 Hatırlat</button>}
                          {m.durum === "onaylandi" && <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Görüntüle</button>}
                          {m.durum === "itiraz" && <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid #FECACA`, background: "#FEF2F2", color: RED, cursor: "pointer" }}>İnceleme Yap</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div style={{ background: "white", borderRadius: 16, width: 680, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "white", zIndex: 10 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>➕ Yeni Tesis Ekle</h2>
                <p style={{ fontSize: 11, color: GRAY400, marginTop: 2 }}>Bilgileri siz doldurun, işletme sonradan tamamlayabilir</p>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: GRAY100, border: "none", borderRadius: 8, width: 30, height: 30, fontSize: 16, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${GRAY100}` }}>Temel Bilgiler</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {["Tesis Adı", "Tesis Türü", "İşletme Sahibi", "Telefon", "E-posta", "Şehir / İlçe"].map((l, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>{l}</label>
                      {l === "Tesis Türü" ? (
                        <select style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, background: "white" }}>
                          <option>Beach Club</option><option>Otel Plajı</option><option>Havuz Alanı</option>
                        </select>
                      ) : (
                        <input type="text" placeholder={l === "Tesis Adı" ? "örn: Aqua Beach Club" : l === "İşletme Sahibi" ? "Ad Soyad" : l === "Telefon" ? "+90 5xx xxx xx xx" : l === "E-posta" ? "isletme@email.com" : "örn: Bodrum / Yalıkavak"} style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${GRAY100}` }}>Kapasite ve Model</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Toplam Şezlong</label><input type="number" placeholder="örn: 80" style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} /></div>
                  <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>İşletme Modu</label><select style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, background: "white" }}><option>Ön Ödemeli Bakiye Sistemi</option><option>Sadece Şezlong Kiralama</option></select></div>
                  <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Komisyon Oranı</label><select style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, background: "white" }}><option>%15 Standart</option><option>%12 Premium Partner</option><option>%10 Özel Anlaşma</option></select></div>
                  <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Abonelik Paketi</label><select style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, background: "white" }}><option>Başlangıç 990 TL/ay</option><option>Büyüme 2.490 TL/ay</option><option>Kurumsal 4.990 TL/ay</option></select></div>
                </div>
              </div>
              <div style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${GRAY100}` }}>Panel Erişimi</div>
                <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Geçici Şifre</label><div style={{ display: "flex", gap: 8 }}><input type="text" value={sifre} onChange={(e) => setSifre(e.target.value)} style={{ flex: 1, padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} /><button onClick={sifreYenile} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>🔄 Yenile</button></div></div>
                <div style={{ fontSize: 11, color: GRAY400 }}>Panel linki ve şifre e-posta ile gönderilecek. İlk girişte değiştirmeleri istenecek.</div>
              </div>
            </div>
            <div style={{ padding: "14px 24px", borderTop: `1px solid ${GRAY100}`, display: "flex", justifyContent: "flex-end", gap: 8, position: "sticky", bottom: 0, background: "white" }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button style={{ padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Taslak Kaydet</button>
              <button onClick={() => { setModalOpen(false); showToast("Tesis oluşturuldu! Erişim bilgileri e-posta ile gönderildi.", ORANGE); }} style={{ padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>✓ Tesis Oluştur ve Paneli Aç</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.color, color: "white", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 500 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
