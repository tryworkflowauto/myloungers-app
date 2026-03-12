"use client";

import { useState } from "react";
import { useAdminToast } from "./AdminToastContext";

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

export default function AdminPage() {
  const { showToast } = useAdminToast();
  const [tesisAra, setTesisAra] = useState("");

  const filtrelenmisTesisler = tesisAra ? TESISLER.filter((t) => t.ad.toLowerCase().includes(tesisAra.toLowerCase())) : TESISLER;

  return (
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

      {/* TÜM TESİSLER - font-size 12px */}
      <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>🏖️ Tüm Tesisler</h3>
          <input type="text" placeholder="🔍 Tesis ara..." value={tesisAra} onChange={(e) => setTesisAra(e.target.value)} style={{ padding: "6px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 12, width: 150 }} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: GRAY50 }}>
                <th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Tesis</th>
                <th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Durum</th>
                <th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Şezlong</th>
                <th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Bu Ay Ciro</th>
                <th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Komisyon</th>
                <th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Puan</th>
                <th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Son Aktivite</th>
                <th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Eylemler</th>
              </tr>
            </thead>
            <tbody>
              {filtrelenmisTesisler.map((t) => (
                <tr key={t.id} style={{ background: t.durum === "onay" ? "#FFFBEB" : undefined }}>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: t.emojiBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{t.emoji}</div>
                      <div><div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{t.ad}</div><div style={{ fontSize: 11, color: GRAY400 }}>{t.lokasyon}</div></div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}` }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: t.durum === "aktif" ? "#DCFCE7" : "#FEF3C7", color: t.durum === "aktif" ? "#16A34A" : "#D97706" }}>● {t.durum === "aktif" ? "Aktif" : "Onay Bekliyor"}</span>
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

      {/* 2 KOLON - Komisyon Özeti font-size 12px */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}` }}><h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>💰 Komisyon Özeti — Mart 2026</h3></div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr style={{ background: GRAY50 }}><th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Tesis</th><th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Ciro</th><th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Oran</th><th style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Komisyon</th></tr></thead>
            <tbody>
              {KOMISYON_OZET.map((k, i) => (
                <tr key={i}><td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 600 }}>{k.tesis}</td><td style={{ padding: "12px 16px", fontSize: 12 }}>{k.ciro}</td><td style={{ padding: "12px 16px", fontSize: 12 }}><span style={{ background: "#F0FDF4", color: GREEN, padding: "2px 7px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{k.oran}</span></td><td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: GREEN }}>{k.komisyon}</td></tr>
              ))}
              <tr style={{ background: GRAY50, borderTop: `2px solid ${GRAY200}` }}><td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800 }}>TOPLAM</td><td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800 }}>₺284K</td><td style={{ padding: "12px 16px", fontSize: 12 }}>—</td><td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 900, color: ORANGE }}>₺42.6K</td></tr>
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
  );
}
