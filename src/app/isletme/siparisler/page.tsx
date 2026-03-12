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

// Mock data - Yeni Siparişler
const YENI_SIPARISLER = [
  { sezlong: "V3", grup: "VIP", kisi: 2, musteri: "Fatma D.", timer: "2 dk", timerClass: "late", saat: "13:48", bg: "#F5821F", urunler: [{ adet: 2, ad: "Mojito", fiyat: "₺120" }, { adet: 1, ad: "Tavuk Şiş", fiyat: "₺85" }, { adet: 1, ad: "Salata", fiyat: "₺45" }], garson: null, tutar: "₺250", isYeni: true },
  { sezlong: "G2", grup: "Gold", kisi: 1, musteri: "Mehmet K.", timer: "5 dk", timerClass: "warn", saat: "13:45", bg: "#8B5CF6", urunler: [{ adet: 1, ad: "Soğuk Kahve", fiyat: "₺45" }, { adet: 2, ad: "Su (0.5L)", fiyat: "₺20" }], garson: null, tutar: "₺65", isYeni: true },
  { sezlong: "S22", grup: "Silver", kisi: 3, musteri: "Ahmet Y.", timer: "1 dk", timerClass: "ok", saat: "13:49", bg: "#0ABAB5", urunler: [{ adet: 3, ad: "Limonata", fiyat: "₺90" }, { adet: 1, ad: "Balık & Patates", fiyat: "₺120" }], garson: null, tutar: "₺210", isYeni: true },
];

// Mock data - Hazırlanıyor
const HAZIRLANIYOR = [
  { sezlong: "İ5", grup: "İskele", kisi: 2, musteri: "Zeynep A.", timer: "8 dk", timerClass: "warn", saat: "13:42", bg: "#F59E0B", urunler: [{ adet: 2, ad: "Piña Colada", fiyat: "₺160" }, { adet: 1, ad: "Nachos", fiyat: "₺65" }], garson: { inits: "MG", name: "Mehmet G.", color: TEAL }, tutar: "₺225", isYeni: false },
  { sezlong: "V9", grup: "VIP", kisi: 3, musteri: "Selin E.", timer: "14 dk", timerClass: "late", saat: "13:36", bg: "#F5821F", urunler: [{ adet: 3, ad: "Izgara Levrek", fiyat: "₺450" }, { adet: 2, ad: "Beyaz Şarap", fiyat: "₺280" }, { adet: 1, ad: "Meze Tabağı", fiyat: "₺95" }], garson: { inits: "AT", name: "Ayşe T.", color: ORANGE }, tutar: "₺825", isYeni: false },
  { sezlong: "S14", grup: "Silver", kisi: 1, musteri: "Burak T.", timer: "4 dk", timerClass: "ok", saat: "13:46", bg: "#0ABAB5", urunler: [{ adet: 1, ad: "Burger", fiyat: "₺95" }, { adet: 1, ad: "Ayran", fiyat: "₺15" }], garson: { inits: "CK", name: "Can K.", color: "#7C3AED" }, tutar: "₺110", isYeni: false },
];

// Mock data - Teslim Edildi (son 2)
const TESLIM_EDILDI = [
  { sezlong: "S8", grup: "Silver", kisi: 1, musteri: "Ali K.", timer: "✓ 9 dk", timerClass: "ok", saat: "13:38", bg: "#10B981", urunler: [{ adet: 2, ad: "Soğuk Kahve", fiyat: "₺90" }], garson: { inits: "MG", name: "Mehmet G. • 13:29→13:38", color: TEAL }, tutar: "₺90", opacity: 0.75, isYeni: false },
  { sezlong: "G1", grup: "Gold", kisi: 1, musteri: "Mehmet K.", timer: "✓ 7 dk", timerClass: "ok", saat: "13:22", bg: "#8B5CF6", urunler: [{ adet: 1, ad: "Izgara Levrek", fiyat: "₺150" }, { adet: 1, ad: "Rosé Şarap", fiyat: "₺180" }], garson: { inits: "AT", name: "Ayşe T. • 13:15→13:22", color: ORANGE }, tutar: "₺330", opacity: 0.75, isYeni: false },
];

// Mock data - Geçmiş
const GECMIS_SIPARISLER = [
  { no: "#089", urunler: "2x Soğuk Kahve", sezlong: "S-8 (Silver)", saat: "13:29 → 13:38", garson: { inits: "MG", name: "Mehmet G.", color: TEAL }, tutar: "₺90", durum: "teslim" },
  { no: "#088", urunler: "1x Levrek, 1x Rosé", sezlong: "G-1 (Gold)", saat: "13:15 → 13:22", garson: { inits: "AT", name: "Ayşe T.", color: ORANGE }, tutar: "₺330", durum: "teslim" },
  { no: "#087", urunler: "3x Limonata, 1x Salata", sezlong: "V-12 (VIP)", saat: "13:05 → 13:18", garson: { inits: "CK", name: "Can K.", color: "#7C3AED" }, tutar: "₺165", durum: "teslim" },
  { no: "#086", urunler: "2x Mojito", sezlong: "İ-3 (İskele)", saat: "12:50 → İptal", garson: { inits: "MG", name: "Mehmet G.", color: TEAL }, tutar: "₺120", durum: "iptal", tutarColor: RED },
];

type Garson = { name: string; inits: string; color: string };
type SiparisKart = Omit<typeof YENI_SIPARISLER[0], "garson"> & { garson: Garson | null; opacity?: number };

function SiparisKart({ s, headerBg, showActions, primaryBtn, secondaryBtn }: { s: SiparisKart; headerBg: string; showActions: boolean; primaryBtn: string; secondaryBtn?: string }) {
  return (
    <div
      className="siparis-kart"
      style={{
        borderRadius: 12,
        border: `1.5px solid ${GRAY200}`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
        opacity: s.opacity ?? 1,
      }}
    >
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", background: headerBg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "white", background: s.bg }}>
            {s.sezlong}
          </div>
          <div>
            <strong style={{ display: "block", fontSize: 13, fontWeight: 700, color: NAVY }}>{s.musteri}</strong>
            <span style={{ fontSize: 10, color: GRAY400 }}>{s.grup} • {s.kisi} kişi</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 20,
              background: s.timerClass === "late" ? "#FEE2E2" : s.timerClass === "warn" ? "#FEF3C7" : "#DCFCE7",
              color: s.timerClass === "late" ? RED : s.timerClass === "warn" ? "#D97706" : "#16A34A",
            }}
          >
            {s.timer}
          </div>
          <div style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>{s.saat}</div>
        </div>
      </div>
      <div style={{ padding: "0 12px 10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {s.urunler.map((u, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: i < s.urunler.length - 1 ? `1px solid ${GRAY100}` : "none" }}>
              <div style={{ width: 22, height: 22, background: NAVY, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white" }}>{u.adet}</div>
              <div style={{ fontSize: 12, color: GRAY800, flex: 1 }}>{u.ad}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>{u.fiyat}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", background: GRAY50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: GRAY600 }}>
          {s.garson ? (
            <>
              <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white", background: s.garson.color }}>{s.garson.inits}</div>
              <span>{s.garson.name}</span>
            </>
          ) : (
            <span>Garson atanmadı</span>
          )}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>{s.tutar}</div>
      </div>
      {showActions && (
        <div style={{ padding: "8px 12px", display: "flex", gap: 6, borderTop: `1px solid ${GRAY100}` }}>
          <button style={{ flex: 1, padding: 7, borderRadius: 8, border: "none", background: TEAL, color: "white", cursor: "pointer", fontSize: 11, fontWeight: 600 }} onClick={(e) => e.stopPropagation()}>{primaryBtn}</button>
          <button style={{ flex: 1, padding: 7, borderRadius: 8, border: s.isYeni ? "none" : `1px solid ${GRAY200}`, background: s.isYeni ? "#FEE2E2" : GRAY100, color: s.isYeni ? RED : GRAY800, cursor: "pointer", fontSize: 11, fontWeight: 600 }} onClick={(e) => e.stopPropagation()}>{secondaryBtn ?? "Garson Değiştir"}</button>
        </div>
      )}
    </div>
  );
}

export default function IsletmeSiparislerPage() {
  const [activeTab, setActiveTab] = useState<"aktif" | "gecmis">("aktif");

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", flexDirection: "column", minHeight: "100%" }}>
      {/* TOPBAR */}
      <header style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Siparişler</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>11 Mart 2026 • <span style={{ color: GREEN, fontWeight: 700 }}>● Canlı</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>📥 Bugünü İndir</button>
          <select style={{ padding: "7px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }}>
            <option>Tüm Gruplar</option>
            <option>Gold</option>
            <option>VIP</option>
            <option>İskele</option>
            <option>Silver</option>
          </select>
          <select style={{ padding: "7px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }}>
            <option>Tüm Garsonlar</option>
            <option>Mehmet G.</option>
            <option>Ayşe T.</option>
            <option>Can K.</option>
          </select>
        </div>
      </header>

      <div style={{ padding: "20px 24px", flex: 1 }}>
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { icon: "🆕", val: "5", lbl: "Yeni Sipariş", valColor: YELLOW, iconBg: "#FEF3C7" },
            { icon: "🍳", val: "8", lbl: "Hazırlanıyor", valColor: BLUE, iconBg: "#DBEAFE" },
            { icon: "✅", val: "89", lbl: "Teslim Edildi", valColor: GREEN, iconBg: "#DCFCE7" },
            { icon: "💰", val: "₺18.4K", lbl: "Günlük Ciro", valColor: ORANGE, iconBg: "#FFEDD5" },
            { icon: "⏱️", val: "12dk", lbl: "Ort. Teslimat", valColor: "#7C3AED", iconBg: "#F5F3FF" },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", borderRadius: 12, padding: "14px 16px", border: `1px solid ${GRAY200}`, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: s.iconBg }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.valColor, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: GRAY400, marginTop: 3 }}>{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* TAB */}
        <div style={{ display: "flex", gap: 4, background: GRAY100, borderRadius: 8, padding: 4, marginBottom: 16 }}>
          <button onClick={() => setActiveTab("aktif")} style={{ padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: activeTab === "aktif" ? NAVY : GRAY600, background: activeTab === "aktif" ? "white" : "transparent", boxShadow: activeTab === "aktif" ? "0 1px 4px rgba(0,0,0,0.1)" : "none", border: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" }}>
            Aktif <span style={{ display: "inline-block", background: RED, color: "white", fontSize: 10, padding: "1px 6px", borderRadius: 10, marginLeft: 4 }}>13</span>
          </button>
          <button onClick={() => setActiveTab("gecmis")} style={{ padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: activeTab === "gecmis" ? NAVY : GRAY600, background: activeTab === "gecmis" ? "white" : "transparent", boxShadow: activeTab === "gecmis" ? "0 1px 4px rgba(0,0,0,0.1)" : "none", border: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" }}>
            Tamamlanan <span style={{ display: "inline-block", background: activeTab === "gecmis" ? TEAL : GRAY200, color: activeTab === "gecmis" ? "white" : GRAY800, fontSize: 10, padding: "1px 6px", borderRadius: 10, marginLeft: 4 }}>89</span>
          </button>
        </div>

        {/* AKTİF - KANBAN */}
        {activeTab === "aktif" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, alignItems: "start" }}>
            {/* Yeni Siparişler */}
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #F59E0B", background: "#FFFBEB" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>🆕 Yeni Siparişler</h3>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "#FEF3C7", color: "#92400E" }}>5</span>
              </div>
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
                {YENI_SIPARISLER.map((s, i) => (
                  <SiparisKart key={i} s={s} headerBg="#FFFBEB" showActions primaryBtn="✓ Hazırlamaya Al" secondaryBtn="✖ İptal" />
                ))}
              </div>
            </div>

            {/* Hazırlanıyor */}
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #3B82F6", background: "#EFF6FF" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1E40AF" }}>🍳 Hazırlanıyor</h3>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "#DBEAFE", color: "#1E40AF" }}>8</span>
              </div>
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
                {HAZIRLANIYOR.map((s, i) => (
                  <SiparisKart key={i} s={s} headerBg="#EFF6FF" showActions primaryBtn="🛵 Teslim Et" secondaryBtn="Garson Değiştir" />
                ))}
              </div>
            </div>

            {/* Teslim Edildi */}
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #10B981", background: "#F0FDF4" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>✅ Teslim Edildi</h3>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "#DCFCE7", color: "#166534" }}>89 bugün</span>
              </div>
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
                {TESLIM_EDILDI.map((s, i) => (
                  <SiparisKart key={i} s={s} headerBg="#F0FDF4" showActions={false} primaryBtn="" secondaryBtn="" />
                ))}
                <div style={{ textAlign: "center", padding: 10 }}>
                  <button onClick={() => setActiveTab("gecmis")} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Tümünü Gör (89) →</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GEÇMİŞ */}
        {activeTab === "gecmis" && (
          <>
            <div style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <input type="text" placeholder="🔍  Şezlong no, müşteri..." style={{ flex: 1, minWidth: 180, padding: "7px 12px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }} />
              <input type="date" defaultValue="2026-03-11" style={{ padding: "7px 12px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }} />
              <select style={{ padding: "7px 12px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }}>
                <option>Tüm Garsonlar</option>
                <option>Mehmet G.</option>
                <option>Ayşe T.</option>
                <option>Can K.</option>
              </select>
              <select style={{ padding: "7px 12px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }}>
                <option>Tüm Durumlar</option>
                <option>Teslim Edildi</option>
                <option>İptal</option>
              </select>
            </div>

            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 100px 120px 100px 100px", padding: "12px 16px", background: GRAY50, borderBottom: `1px solid ${GRAY200}`, gap: 8 }}>
                {["#", "Ürünler", "Şezlong", "Saat", "Garson", "Tutar", "Durum"].map((th) => (
                  <div key={th} style={{ fontSize: 11, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5 }}>{th}</div>
                ))}
              </div>
              {GECMIS_SIPARISLER.map((r, i) => (
                <div key={i} className="gecmis-row" style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 100px 120px 100px 100px", padding: "12px 16px", borderBottom: `1px solid ${GRAY100}`, gap: 8, alignItems: "center", fontSize: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400 }}>{r.no}</div>
                  <div><strong style={{ fontSize: 12 }}>{r.urunler}</strong></div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{r.sezlong}</div>
                  <div style={{ fontSize: 11, color: GRAY400 }}>{r.saat}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white", background: r.garson.color }}>{r.garson.inits}</div>
                    <span style={{ fontSize: 11 }}>{r.garson.name}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: r.tutarColor ?? NAVY }}>{r.tutar}</div>
                  <div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 20, background: r.durum === "teslim" ? "#DCFCE7" : "#FEE2E2", color: r.durum === "teslim" ? "#16A34A" : RED }}>
                      {r.durum === "teslim" ? "✓ Teslim" : "✖ İptal"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, padding: "0 4px" }}>
              <div style={{ fontSize: 12, color: GRAY400 }}>89 siparişten 1-4 arası</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>‹</button>
                <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>1</button>
                <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>2</button>
                <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>›</button>
              </div>
            </div>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .siparis-kart:hover { border-color: #0ABAB5 !important; box-shadow: 0 2px 12px rgba(10,186,181,0.15); }
          .gecmis-row:hover { background: #F8FAFC !important; }
        `,
      }} />
    </div>
  );
}
