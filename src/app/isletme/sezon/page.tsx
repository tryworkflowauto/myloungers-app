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
const BLUE = "#3B82F6";
const PURPLE = "#7C3AED";
const YELLOW = "#F59E0B";

// Mock - Sezon listesi
const SEZONLAR = [
  { name: "Erken Sezon", tarih: "1 Mart — 31 Mayıs 2026", dot: BLUE, badge: "Şu an aktif", badgeBg: "#DBEAFE", badgeColor: "#1E40AF", borderColor: BLUE, rowBg: "#EFF6FF" },
  { name: "Yüksek Sezon", tarih: "1 Haziran — 31 Ağustos 2026", dot: ORANGE, badge: "Yaklaşıyor", badgeBg: "#FFEDD5", badgeColor: "#C2410C" },
  { name: "Normal Sezon", tarih: "1 Eylül — 31 Ekim 2026", dot: TEAL, badge: "Planlandı", badgeBg: "#F0FFFE", badgeColor: TEAL },
  { name: "Kapalı Dönem", tarih: "1 Kasım — 28 Şubat 2027", dot: GRAY300, badge: "Kapalı", badgeBg: GRAY100, badgeColor: GRAY600, opacity: 0.6 },
];

// Mock - Fiyat tablosu (Erken sezon seçili)
const FIYAT_GRUPLAR = [
  { name: "⭐ Gold", sub: "10 şezlong • Denize sıfır", color: "#8B5CF6", erken: 2000, yuksek: 2800, normal: 1600, minGun: 1, anlik: "₺2.000", anlikColor: PURPLE },
  { name: "🔥 VIP", sub: "40 şezlong • Birinci sıra", color: ORANGE, erken: 1500, yuksek: 2200, normal: 1200, minGun: 1, anlik: "₺1.500", anlikColor: ORANGE },
  { name: "⚓ İskele", sub: "20 şezlong • Ahşap platform", color: YELLOW, erken: 1250, yuksek: 1800, normal: 950, minGun: 1, anlik: "₺1.250", anlikColor: YELLOW },
  { name: "🌊 Silver", sub: "55 şezlong • Standart bölge", color: TEAL, erken: 1000, yuksek: 1400, normal: 750, minGun: 1, anlik: "₺1.000", anlikColor: TEAL },
];

// Mock - Kampanyalar
const KAMPANYALAR = [
  { id: 1, name: "🌸 Bahar Kampanyası", tarih: "1 Mart — 31 Mayıs 2026", indirim: "%20", indirimColor: ORANGE, headerBg: `linear-gradient(135deg,${ORANGE},#C2410C)`, chip: "● Aktif", chipOn: true, tip: "Oran İndirimi", gruplar: ["Silver", "VIP"], gruplarColors: ["#DBEAFE", "#FFEDD5"], gruplarTextColors: ["#1E40AF", "#C2410C"], musteriGoster: true, preview: { silver: { eski: "₺1.000", yeni: "₺800" } }, btns: ["✏️ Düzenle", "⏸ Durdur", "🗑️"] },
  { id: 2, name: "☀️ Yaz Açılış", tarih: "1 — 7 Haziran 2026", indirim: "%30", indirimColor: PURPLE, headerBg: `linear-gradient(135deg,${PURPLE},#4C1D95)`, chip: "◷ Planlandı", chipOn: false, tip: "Oran İndirimi", gruplar: ["Silver", "VIP", "İskele", "Gold"], gruplarColors: ["#DBEAFE", "#FFEDD5", "#FEF3C7", "#F5F3FF"], gruplarTextColors: ["#1E40AF", "#C2410C", "#92400E", PURPLE], kalanSure: "82 gün", btns: ["✏️ Düzenle", "▶ Şimdi Başlat", "🗑️"] },
  { id: 3, name: "🎉 Yılbaşı Özel", tarih: "1 — 7 Ocak 2026", indirim: "Sabit", indirimColor: GRAY600, headerBg: `linear-gradient(135deg,${GRAY400},${GRAY600})`, chip: "✓ Tamamlandı", chipOn: false, tip: "Sabit Fiyat", gruplar: ["Silver"], gruplarColors: [GRAY100], gruplarTextColors: [GRAY600], sabitFiyat: "₺750", pasif: true, btns: ["✏️ Düzenle", "🔄 Kopyala", "🗑️"], firstBtnDisabled: true },
];

export default function IsletmeSezonPage() {
  const [kampanyaModalOpen, setKampanyaModalOpen] = useState(false);
  const [sezonModalOpen, setSezonModalOpen] = useState(false);
  const [indirimTip, setIndirimTip] = useState<"oran" | "sabit">("oran");
  const [seciliSezon, setSeciliSezon] = useState("erken");

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", flexDirection: "column", minHeight: "100%" }}>
      {/* TOPBAR */}
      <header style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Sezon & Fiyatlar</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>2026 Sezonu • Şu an: Erken Sezon</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setKampanyaModalOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>🎯 Kampanya Oluştur</button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>💾 Değişiklikleri Kaydet</button>
        </div>
      </header>

      <div style={{ padding: 24, flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* SEZON TANIMLARI */}
          <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>📅 Sezon Tanımları</h3>
              <button onClick={() => setSezonModalOpen(true)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>➕ Sezon Ekle</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>2026 Yıl Görünümü</div>
              <div style={{ background: GRAY100, borderRadius: 12, height: 36, position: "relative", overflow: "hidden", marginBottom: 6 }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "16.5%", background: GRAY300, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white" }}>Kapalı</div>
                <div style={{ position: "absolute", left: "16.5%", top: 0, bottom: 0, width: "25%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white" }}>Erken</div>
                <div style={{ position: "absolute", left: "41.5%", top: 0, bottom: 0, width: "25%", background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white" }}>Yüksek</div>
                <div style={{ position: "absolute", left: "66.5%", top: 0, bottom: 0, width: "16.5%", background: TEAL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white" }}>Normal</div>
                <div style={{ position: "absolute", left: "83%", top: 0, bottom: 0, width: "17%", background: GRAY300, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white" }}>Kapalı</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0 2px", fontSize: 9, color: GRAY400 }}>
                <span>Oca</span><span>Mar</span><span>Haz</span><span>Eyl</span><span>Kas</span><span>Ara</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
                {SEZONLAR.map((s, i) => (
                  <div key={i} style={{ border: `1.5px solid ${s.borderColor ?? GRAY200}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, background: s.rowBg ?? "transparent", opacity: s.opacity ?? 1 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: s.dot }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block", fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2 }}>{s.name}</strong>
                      <span style={{ fontSize: 11, color: GRAY400 }}>{s.tarih}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: s.badgeBg, color: s.badgeColor }}>{s.badge}</span>
                    <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>✏️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GENEL AYARLAR */}
          <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${GRAY100}` }}><h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>⚙️ Genel Ayarlar</h3></div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Minimum Rezervasyon Süresi", sub: "Müşteri en az kaç saat önceden rezervasyon yapabilir", val: 2, unit: "saat", type: "number" as const },
                { label: "Erken Rezervasyon İndirimi", sub: "3+ gün önceden yapılan rezervasyonlara indirim", val: 10, unit: "%", type: "number" as const },
                { label: "Grup Rezervasyon Bonusu", sub: "4+ şezlong aynı anda rezerve edilirse", val: 15, unit: "%", type: "number" as const },
                { label: "Son Dakika İndirimi", sub: "Gün içi boş kalan şezlonglara otomatik indirim", val: 20, unit: "%", type: "toggle" as const },
                { label: "İptal Politikası", sub: "Rezervasyon iptalinde iade süresi", type: "select" as const },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: GRAY50, borderRadius: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: GRAY400 }}>{a.sub}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {a.type === "toggle" && (
                      <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer", flexShrink: 0 }}>
                        <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: "absolute", inset: 0, background: TEAL, borderRadius: 20 }}>
                          <span style={{ position: "absolute", width: 14, height: 14, left: 3, top: 3, background: "white", borderRadius: "50%", transform: "translateX(16px)" }} />
                        </span>
                      </label>
                    )}
                    {a.type === "number" && <input type="number" defaultValue={a.val} min={0} max={a.unit === "%" ? 50 : undefined} style={{ width: a.unit === "saat" ? 70 : 60, padding: "7px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 12, textAlign: a.unit === "saat" ? "center" : "center" }} />}
                    {a.type === "number" && <span style={{ fontSize: 12, color: GRAY600 }}>{a.unit}</span>}
                    {a.type === "toggle" && <><input type="number" defaultValue={a.val} min={0} max={50} style={{ width: 60, padding: "7px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 12, textAlign: "center" }} /><span style={{ fontSize: 12, color: GRAY600 }}>%</span></>}
                    {a.type === "select" && (
                      <select style={{ padding: "7px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }}>
                        <option>24 saat öncesine kadar tam iade</option>
                        <option>48 saat öncesine kadar tam iade</option>
                        <option>İade yok</option>
                        <option>%50 iade</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FİYAT TABLOSU */}
        <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>💰 Grup Fiyatları</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: GRAY400 }}>Sezon seç:</span>
              <select value={seciliSezon} onChange={(e) => setSeciliSezon(e.target.value)} style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }}>
                <option value="erken">🔵 Erken Sezon</option>
                <option value="yuksek">🟠 Yüksek Sezon</option>
                <option value="normal">🟢 Normal Sezon</option>
              </select>
            </div>
          </div>
          <div style={{ padding: "0 8px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 14px", textAlign: "left", background: GRAY50, borderBottom: `1px solid ${GRAY200}` }}>Grup</th>
                  <th style={{ fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 14px", textAlign: "left", background: GRAY50, borderBottom: `1px solid ${GRAY200}` }}>Günlük Fiyat</th>
                  <th style={{ fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 14px", textAlign: "left", background: GRAY50, borderBottom: `1px solid ${GRAY200}` }}>Yüksek Sezon</th>
                  <th style={{ fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 14px", textAlign: "left", background: GRAY50, borderBottom: `1px solid ${GRAY200}` }}>Normal Sezon</th>
                  <th style={{ fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 14px", textAlign: "left", background: GRAY50, borderBottom: `1px solid ${GRAY200}` }}>Min. Süre</th>
                  <th style={{ fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 14px", textAlign: "left", background: GRAY50, borderBottom: `1px solid ${GRAY200}` }}>Anlık Fiyat</th>
                </tr>
              </thead>
              <tbody>
                {FIYAT_GRUPLAR.map((g, i) => (
                  <tr key={i} style={{ transition: "background 0.15s" }}>
                    <td style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}`, fontSize: 13 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: g.color }} />
                        <div><div style={{ fontWeight: 700, fontSize: 13 }}>{g.name}</div><div style={{ fontSize: 10, color: GRAY400 }}>{g.sub}</div></div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}` }}><input type="number" defaultValue={g.erken} style={{ width: 90, padding: "7px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: "right" }} /> <span style={{ fontSize: 11, color: GRAY400 }}>₺</span></td>
                    <td style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}` }}><input type="number" defaultValue={g.yuksek} style={{ width: 90, padding: "7px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: "right" }} /> <span style={{ fontSize: 11, color: GRAY400 }}>₺</span></td>
                    <td style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}` }}><input type="number" defaultValue={g.normal} style={{ width: 90, padding: "7px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: "right" }} /> <span style={{ fontSize: 11, color: GRAY400 }}>₺</span></td>
                    <td style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}` }}><input type="number" defaultValue={g.minGun} style={{ width: 70, padding: "7px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 12, textAlign: "center" }} /> <span style={{ fontSize: 11, color: GRAY400 }}>gün</span></td>
                    <td style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}`, fontSize: 15, fontWeight: 900, color: g.anlikColor }}>{g.anlik}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* KAMPANYALAR */}
        <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>🎯 Kampanyalar</h3>
            <button onClick={() => setKampanyaModalOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>➕ Kampanya Oluştur</button>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {KAMPANYALAR.map((k) => (
                <div key={k.id} style={{ borderRadius: 14, overflow: "hidden", border: `1.5px solid ${GRAY200}`, transition: "all 0.2s", opacity: k.pasif ? 0.6 : 1 }}>
                  <div style={{ padding: "14px 16px", color: "white", position: "relative", background: k.headerBg }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 20, position: "absolute", top: 12, left: 14, background: k.chipOn ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)", color: k.chipOn ? "white" : "rgba(255,255,255,0.7)" }}>{k.chip}</span>
                    <div style={{ marginTop: 18 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>{k.name}</h4>
                      <span style={{ fontSize: 11, opacity: 0.85 }}>{k.tarih}</span>
                    </div>
                    <div style={{ position: "absolute", top: 12, right: 12, background: "white", borderRadius: 10, padding: "6px 12px", fontSize: 16, fontWeight: 900, color: k.indirimColor }}>{k.indirim}</div>
                  </div>
                  <div style={{ padding: "14px 16px", background: "white" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 12 }}><span style={{ color: GRAY400 }}>İndirim Tipi</span><span style={{ fontWeight: 700, color: NAVY }}>{k.tip}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 12 }}>
                      <span style={{ color: GRAY400 }}>Uygulanan Gruplar</span>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {k.gruplar.map((gr, gi) => <span key={gi} style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: k.gruplarColors[gi], color: k.gruplarTextColors[gi] }}>{gr}</span>)}
                      </div>
                    </div>
                    {k.musteriGoster && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}><span style={{ color: GRAY400 }}>Müşteri Görünümü</span><span style={{ fontWeight: 700, color: GREEN }}>✓ Gösteriliyor</span></div>}
                    {k.kalanSure && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}><span style={{ color: GRAY400 }}>Kalan Süre</span><span style={{ fontWeight: 700, color: PURPLE }}>{k.kalanSure}</span></div>}
                    {k.preview && <div style={{ borderTop: `1px solid ${GRAY100}`, paddingTop: 8, marginTop: 4 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span style={{ color: GRAY400 }}>Silver: <s style={{ color: GRAY400 }}>₺1.000</s></span><span style={{ fontWeight: 700, color: ORANGE }}>₺800</span></div></div>}
                    {k.sabitFiyat && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}><span style={{ color: GRAY400 }}>Silver Sabit Fiyat</span><span style={{ fontWeight: 700, color: NAVY }}>{k.sabitFiyat}</span></div>}
                  </div>
                  <div style={{ padding: "10px 16px", background: GRAY50, borderTop: `1px solid ${GRAY100}`, display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {k.btns.map((b, bi) => (
                      <button key={bi} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${GRAY200}`, background: "white", cursor: k.firstBtnDisabled && bi === 0 ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 600, opacity: k.firstBtnDisabled && bi === 0 ? 0.5 : 1 }}>{b}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KAMPANYA MODAL */}
      {kampanyaModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setKampanyaModalOpen(false)}>
          <div style={{ background: "white", borderRadius: 16, width: 540, maxWidth: "95vw", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${GRAY200}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>🎯 Yeni Kampanya Oluştur</h3>
              <button onClick={() => setKampanyaModalOpen(false)} style={{ width: 30, height: 30, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Kampanya Adı <span style={{ color: GRAY400, fontWeight: 400 }}>(Müşteride görünür)</span></label>
                <input type="text" placeholder="örn: Bahar İndirimi, Yaz Açılış..." style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Başlangıç Tarihi</label><input type="date" defaultValue="2026-03-11" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} /></div>
                <div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Bitiş Tarihi</label><input type="date" defaultValue="2026-03-31" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} /></div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>İndirim Tipi</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { key: "oran", icon: "%", name: "Oran İndirimi", desc: "Mevcut fiyattan % indirim" },
                    { key: "sabit", icon: "₺", name: "Sabit Fiyat", desc: "Her grup için sabit fiyat gir" },
                  ].map((op) => (
                    <button key={op.key} type="button" onClick={() => setIndirimTip(op.key as typeof indirimTip)} style={{ border: `2px solid ${indirimTip === op.key ? ORANGE : GRAY200}`, borderRadius: 10, padding: 12, cursor: "pointer", textAlign: "center", background: indirimTip === op.key ? "#FFF9F5" : "transparent" }}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{op.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{op.name}</div>
                      <div style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>{op.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              {indirimTip === "oran" && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>İndirim Oranı</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="number" placeholder="örn: 20" min={1} max={90} style={{ width: 120, padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
                    <span style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>%</span>
                    <span style={{ fontSize: 11, color: GRAY400 }}>indirim uygulanacak</span>
                  </div>
                </div>
              )}
              {indirimTip === "sabit" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  {["⭐ Gold", "🔥 VIP", "⚓ İskele", "🌊 Silver"].map((gr) => (
                    <div key={gr}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>{gr} Sabit Fiyat</label><input type="number" placeholder="₺" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} /></div>
                  ))}
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Uygulanan Gruplar</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[{ n: "⭐ Gold", c: "#8B5CF6" }, { n: "🔥 VIP", c: ORANGE }, { n: "⚓ İskele", c: YELLOW }, { n: "🌊 Silver", c: TEAL }].map((g) => (
                    <label key={g.n} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 10, cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked={g.n !== "⚓ İskele"} style={{ accentColor: TEAL, width: 16, height: 16 }} />
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: g.c }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{g.n}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Müşteri Tarafında Göster</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: GRAY50, padding: 12, borderRadius: 10 }}>
                  <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: "absolute", inset: 0, background: TEAL, borderRadius: 20 }}><span style={{ position: "absolute", width: 14, height: 14, left: 3, top: 3, background: "white", borderRadius: "50%", transform: "translateX(16px)" }} /></span>
                  </label>
                  <span style={{ fontSize: 12, color: GRAY600 }}>Rezervasyon sayfasında kampanya adı ve indirimi göster</span>
                </div>
              </div>
              <div style={{ background: GRAY50, borderRadius: 10, padding: 14, border: `1px solid ${GRAY200}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Fiyat Önizleme (%20 indirim)</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}><span style={{ color: GRAY600 }}>⭐ Gold</span><span><s style={{ color: GRAY400 }}>₺2.000</s> → <strong style={{ color: ORANGE }}>₺1.600</strong></span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}><span style={{ color: GRAY600 }}>🔥 VIP</span><span><s style={{ color: GRAY400 }}>₺1.500</s> → <strong style={{ color: ORANGE }}>₺1.200</strong></span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderTop: `1px solid ${GRAY200}`, paddingTop: 6 }}><span style={{ color: GRAY600 }}>🌊 Silver</span><span><s style={{ color: GRAY400 }}>₺1.000</s> → <strong style={{ color: ORANGE }}>₺800</strong></span></div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: "16px 24px", borderTop: `1px solid ${GRAY200}` }}>
              <button onClick={() => setKampanyaModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => setKampanyaModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>💾 Taslak Kaydet</button>
              <button onClick={() => setKampanyaModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>🚀 Kampanyayı Başlat</button>
            </div>
          </div>
        </div>
      )}

      {/* SEZON EKLE MODAL */}
      {sezonModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setSezonModalOpen(false)}>
          <div style={{ background: "white", borderRadius: 16, width: 440, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${GRAY200}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>📅 Sezon Ekle</h3>
              <button onClick={() => setSezonModalOpen(false)} style={{ width: 30, height: 30, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Sezon Adı</label><input type="text" placeholder="örn: Erken Sezon, Yüksek Sezon..." style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}><div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Başlangıç</label><input type="date" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} /></div><div><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Bitiş</label><input type="date" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} /></div></div>
              <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Renk</label><div style={{ display: "flex", gap: 8 }}>{[BLUE, ORANGE, TEAL, PURPLE, GREEN].map((c, i) => <div key={i} style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: "pointer", border: i === 0 ? "2px solid " + NAVY : "2px solid transparent" }}></div>)}</div></div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: "16px 24px", borderTop: `1px solid ${GRAY200}` }}>
              <button onClick={() => setSezonModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => setSezonModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>✅ Sezon Ekle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
