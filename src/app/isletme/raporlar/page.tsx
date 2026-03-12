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

// Mock - Günlük gelir verisi (teal %, orange %)
const GUNLUK_GELIR = [
  { gun: "Pzt", teal: 60, orange: 28, tealVal: "₺18K" },
  { gun: "Sal", teal: 72, orange: 32, tealVal: "₺22K" },
  { gun: "Çar", teal: 55, orange: 24, tealVal: "₺17K" },
  { gun: "Per", teal: 80, orange: 38, tealVal: "₺24K" },
  { gun: "Cum", teal: 90, orange: 42, tealVal: "₺28K" },
  { gun: "Cmt", teal: 100, orange: 46, tealVal: "₺31K" },
  { gun: "Paz", teal: 52, orange: 22, tealVal: "₺18.4K", isToday: true },
];

const GRUP_GELIR = [
  { name: "⭐ Gold", tutar: "₺28.400", pct: 92 },
  { name: "🔥 VIP", tutar: "₺52.600", pct: 100 },
  { name: "⚓ İskele", tutar: "₺31.200", pct: 72 },
  { name: "🌊 Silver", tutar: "₺36.200", pct: 78 },
];

const ODEME_KANAL = [
  { name: "📱 Uygulama", pct: 64, tutar: "₺95K" },
  { name: "💳 Kart (Extra)", pct: 28, tutar: "₺41K" },
  { name: "💵 Nakit", pct: 8, tutar: "₺12K" },
];

const BAKIYE_ROWS = [
  { inits: "AY", name: "Ahmet Yılmaz", sezlong: "S-12 • Silver", avatarBg: "linear-gradient(135deg,#0ABAB5,#0A1628)", yuklenen: "₺1.000", harcanan: "₺360", kalan: "₺640", kalanColor: TEAL, sonTarih: "10 Nis 2026", durum: "ok", durumLabel: "✓ Aktif", rowBg: null },
  { inits: "FD", name: "Fatma Demir", sezlong: "V-3, V-4 • VIP", avatarBg: "linear-gradient(135deg,#F5821F,#0A1628)", yuklenen: "₺3.000", harcanan: "₺850", kalan: "₺2.150", kalanColor: TEAL, sonTarih: "10 Nis 2026", durum: "ok", durumLabel: "✓ Aktif", rowBg: null },
  { inits: "ZA", name: "Zeynep Arslan", sezlong: "İ-5, İ-6 • İskele", avatarBg: "linear-gradient(135deg,#F59E0B,#92400E)", yuklenen: "₺2.500", harcanan: "₺0", kalan: "₺2.500", kalanColor: TEAL, sonTarih: "10 Nis 2026", durum: "ok", durumLabel: "✓ Aktif", rowBg: null },
  { inits: "BK", name: "Banu Koç", sezlong: "S-22 • Silver", avatarBg: "linear-gradient(135deg,#EF4444,#7F1D1D)", yuklenen: "₺1.000", harcanan: "₺880", kalan: "₺120", kalanColor: YELLOW, sonTarih: "16 Mar 2026", sonTarihWarn: true, durum: "soon", durumLabel: "⏰ 5 Gün", rowBg: "#FFFBEB" },
  { inits: "SE", name: "Selin Erdoğan", sezlong: "V-8,9,10 • VIP", avatarBg: "linear-gradient(135deg,#7C3AED,#4C1D95)", yuklenen: "₺4.500", harcanan: "₺1.300", kalan: "₺3.200", kalanColor: YELLOW, sonTarih: "14 Mar 2026", sonTarihWarn: true, durum: "soon", durumLabel: "⏰ 3 Gün", rowBg: "#FFFBEB" },
  { inits: "AK", name: "Ali Koç", sezlong: "S-22 • Silver", avatarBg: GRAY400, yuklenen: "₺1.000", harcanan: "₺1.000", kalan: "₺0", kalanColor: GRAY400, sonTarih: "10 Mar 2026", sonTarihGray: true, durum: "exp", durumLabel: "✖ Sona Erdi", rowBg: null, opacity: 0.6 },
];

const GARSON_ROWS = [
  { inits: "MG", name: "Mehmet G.", rol: "🛵 Garson", avatarBg: "linear-gradient(135deg,#0ABAB5,#065F46)", teslimat: 34, musteri: 18, sure: "9dk", perf: 90, puan: "4.9", tip: "₺280" },
  { inits: "AT", name: "Ayşe T.", rol: "🛵 Garson", avatarBg: "linear-gradient(135deg,#F5821F,#92400E)", teslimat: 28, musteri: 14, sure: "12dk", perf: 72, puan: "4.6", tip: "₺350" },
  { inits: "CK", name: "Can K.", rol: "🛵 Garson", avatarBg: "linear-gradient(135deg,#7C3AED,#4C1D95)", teslimat: 27, musteri: 16, sure: "11dk", perf: 80, puan: "4.7", tip: "₺190" },
];

const SAATLIK_TESLIMAT = [
  { saat: "09", val: 4, pct: 20 },
  { saat: "10", val: 7, pct: 35 },
  { saat: "11", val: 11, pct: 55 },
  { saat: "12", val: 16, pct: 80, isOrange: true },
  { saat: "13", val: 20, pct: 100, isOrange: true },
  { saat: "14", val: 15, pct: 75 },
  { saat: "15", val: 12, pct: 60 },
  { saat: "16", val: 4, pct: 40 },
];

const URUN_ROWS = [
  { rank: "🥇", icon: "🍹", name: "Mojito", cat: "Alkollü İçecek", satis: 142, fiyat: "₺120", toplam: "₺17.040", trend: "↑ %18", trendUp: true },
  { rank: "🥈", icon: "🐟", name: "Izgara Levrek", cat: "Ana Yemek", satis: 98, fiyat: "₺150", toplam: "₺14.700", trend: "↑ %12", trendUp: true },
  { rank: "🥉", icon: "🍋", name: "Limonata", cat: "Soğuk İçecek", satis: 187, fiyat: "₺45", toplam: "₺8.415", trend: "↑ %8", trendUp: true },
  { rank: "4", icon: "🍷", name: "Rosé Şarap", cat: "Alkollü İçecek", satis: 44, fiyat: "₺180", toplam: "₺7.920", trend: "↓ %3", trendUp: false },
  { rank: "5", icon: "🍟", name: "Nachos", cat: "Atıştırmalık", satis: 96, fiyat: "₺65", toplam: "₺6.240", trend: "↑ %31", trendUp: true },
];

type TabKey = "gelir" | "bakiye" | "garson" | "urun";

export default function IsletmeRaporlarPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("gelir");
  const [donemGelir, setDonemGelir] = useState("hafta");
  const [donemGarson, setDonemGarson] = useState("bugun");
  const [donemUrun, setDonemUrun] = useState("hafta");

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", flexDirection: "column", minHeight: "100%" }}>
      {/* TOPBAR */}
      <header style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Bakiye & Raporlar</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>Zuzuu Beach Hotel • 2026</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#F0FFFE", border: `1px solid ${TEAL}`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: TEAL }}>
            💡 Tip: Garsona Direkt — <a href="#" style={{ color: TEAL, textDecoration: "none", fontSize: 10 }}>Tesis Ayarları&apos;ndan Değiştir →</a>
          </span>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>📥 Excel İndir</button>
        </div>
      </header>

      <div style={{ padding: 24, flex: 1 }}>
        {/* TAB BAR */}
        <div style={{ display: "flex", gap: 4, background: GRAY100, borderRadius: 8, padding: 4, marginBottom: 20, width: "fit-content" }}>
          {[
            { key: "gelir" as TabKey, label: "📊 Gelir Raporu" },
            { key: "bakiye" as TabKey, label: "💰 Bakiye Takibi" },
            { key: "garson" as TabKey, label: "🛵 Garson Performansı" },
            { key: "urun" as TabKey, label: "🍽️ Ürün Satışları" },
          ].map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: "8px 18px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: activeTab === t.key ? NAVY : GRAY600, background: activeTab === t.key ? "white" : "transparent", boxShadow: activeTab === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none", border: "none" }}>{t.label}</button>
          ))}
        </div>

        {/* GELİR RAPORU */}
        {activeTab === "gelir" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              {["Bugün", "Bu Hafta", "Bu Ay", "Bu Yıl"].map((d, i) => (
                <button key={d} onClick={() => setDonemGelir(["bugun", "hafta", "ay", "yil"][i])} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${GRAY200}`, background: donemGelir === ["bugun", "hafta", "ay", "yil"][i] ? NAVY : "white", fontSize: 12, fontWeight: 600, cursor: "pointer", color: donemGelir === ["bugun", "hafta", "ay", "yil"][i] ? "white" : GRAY600 }}>{d}</button>
              ))}
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto" }}>
                <input type="date" defaultValue="2026-03-01" style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 11 }} />
                <span style={{ fontSize: 11, color: GRAY400 }}>—</span>
                <input type="date" defaultValue="2026-03-11" style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 11 }} />
                <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Uygula</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Toplam Gelir", val: "₺148.400", sub: "Bu hafta", change: "↑ %18 geçen haftaya göre", up: true, color: TEAL },
                { label: "Şezlong Geliri", val: "₺89.500", sub: "%60 toplam gelirin", change: "↑ %12", up: true, color: ORANGE },
                { label: "Sipariş Geliri", val: "₺52.600", sub: "%35 toplam gelirin", change: "↑ %24", up: true, color: GREEN },
                { label: "Sona Eren Bakiye", val: "₺6.300", sub: "İşletmeye geçen", change: "↓ %5 geçen haftaya göre", up: false, color: PURPLE },
              ].map((s, i) => (
                <div key={i} style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                  <div style={{ fontSize: 11, color: GRAY400, fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: NAVY, marginBottom: 4, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: GRAY400 }}>{s.sub}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, marginTop: 6, background: s.up ? "#DCFCE7" : "#FEE2E2", color: s.up ? "#16A34A" : RED }}>{s.change}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Günlük Gelir (Bu Hafta)</h3>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: TEAL, display: "inline-block" }} />Şezlong</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: ORANGE, display: "inline-block" }} />Sipariş</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, paddingBottom: 24, borderBottom: `1px solid ${GRAY200}` }}>
                {GUNLUK_GELIR.map((g, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end", position: "relative" }}>
                    <div style={{ width: "100%", height: `${g.teal}%`, background: g.isToday ? `linear-gradient(${TEAL},rgba(10,186,181,0.3))` : TEAL, borderRadius: "6px 6px 0 0", border: g.isToday ? `2px dashed ${TEAL}` : "none", position: "relative", minHeight: 20 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: g.isToday ? TEAL : GRAY600, position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>{g.tealVal}</span>
                    </div>
                    <div style={{ width: "100%", height: `${g.orange}%`, background: g.isToday ? `linear-gradient(${ORANGE},rgba(245,130,31,0.3))` : ORANGE, borderRadius: "6px 6px 0 0", border: g.isToday ? `2px dashed ${ORANGE}` : "none", marginTop: 2 }} />
                    <span style={{ fontSize: 9, color: g.isToday ? TEAL : GRAY400, marginTop: 4, whiteSpace: "nowrap" }}>{g.gun}{g.isToday ? " ●" : ""}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 20 }}>
                <div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Grup Bazlı Gelir</h3></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {GRUP_GELIR.map((g, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{g.name}</span><span style={{ fontWeight: 700 }}>{g.tutar}</span></div>
                      <div style={{ background: GRAY100, borderRadius: 20, height: 8, overflow: "hidden" }}><div style={{ width: `${g.pct}%`, height: "100%", borderRadius: 20, background: i === 0 ? "linear-gradient(90deg,#7C3AED,#A78BFA)" : i === 1 ? "linear-gradient(90deg,#F5821F,#FCA5A5)" : i === 2 ? "linear-gradient(90deg,#F59E0B,#FCD34D)" : "linear-gradient(90deg,#0ABAB5,#67E8F9)" }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 20 }}>
                <div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Ödeme Kanalı</h3></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {ODEME_KANAL.map((o, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{o.name}</span><span style={{ fontWeight: 700 }}>%{o.pct} — {o.tutar}</span></div>
                      <div style={{ background: GRAY100, borderRadius: 20, height: 8, overflow: "hidden" }}><div style={{ width: `${o.pct}%`, height: "100%", borderRadius: 20, background: i === 0 ? `linear-gradient(90deg,${TEAL},${GREEN})` : i === 1 ? "linear-gradient(90deg,#3B82F6,#93C5FD)" : "linear-gradient(90deg,#94A3B8,#CBD5E1)" }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* BAKİYE TAKİBİ */}
        {activeTab === "bakiye" && (
          <>
            <div style={{ background: "#FFFBEB", border: "1.5px solid #FCD34D", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 24 }}>⚠️</div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#92400E" }}>5 müşterinin bakiyesi 5 gün içinde sona eriyor</strong>
                <span style={{ fontSize: 11, color: "#B45309" }}>Otomatik hatırlatma bildirimi gönderildi • Toplam ₺3.840 işletmeye geçecek</span>
              </div>
              <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Bildirimleri Gör</button>
            </div>

            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Aktif Bakiyeler</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" placeholder="🔍 Müşteri ara..." style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 11 }} />
                  <select style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 11 }}>
                    <option>Tüm Durumlar</option>
                    <option>Sona Yakın (5 gün)</option>
                    <option>Aktif</option>
                    <option>Sona Erdi</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 90px 110px 80px", padding: "12px 18px", background: GRAY50, borderBottom: `1px solid ${GRAY100}`, gap: 8, fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5 }}>
                <div>Müşteri</div><div>Yüklenen</div><div>Harcanan</div><div>Kalan</div><div>Son Kullanım</div><div>Durum</div>
              </div>
              {BAKIYE_ROWS.map((r, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 90px 110px 80px", padding: "12px 18px", borderBottom: `1px solid ${GRAY100}`, gap: 8, alignItems: "center", fontSize: 12, background: r.rowBg ?? "transparent", opacity: r.opacity ?? 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", background: r.avatarBg }}>{r.inits}</div>
                    <div><div style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{r.name}</div><div style={{ fontSize: 10, color: GRAY400 }}>{r.sezlong}</div></div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{r.yuklenen}</div>
                  <div style={{ color: RED }}>{r.harcanan}</div>
                  <div style={{ fontWeight: 800, color: r.kalanColor }}>{r.kalan}</div>
                  <div style={{ fontSize: 11, color: r.sonTarihWarn ? RED : r.sonTarihGray ? GRAY400 : "inherit", fontWeight: r.sonTarihWarn ? 700 : 400 }}>{r.sonTarihWarn ? "⚠️ " : ""}{r.sonTarih}</div>
                  <div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 20, background: r.durum === "ok" ? "#DCFCE7" : r.durum === "soon" ? "#FEF3C7" : "#FEE2E2", color: r.durum === "ok" ? "#16A34A" : r.durum === "soon" ? "#D97706" : RED }}>{r.durumLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* GARSON PERFORMANSI */}
        {activeTab === "garson" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              {["Bugün", "Bu Hafta", "Bu Ay"].map((d, i) => (
                <button key={d} onClick={() => setDonemGarson(["bugun", "hafta", "ay"][i])} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${GRAY200}`, background: donemGarson === ["bugun", "hafta", "ay"][i] ? NAVY : "white", fontSize: 12, fontWeight: 600, cursor: "pointer", color: donemGarson === ["bugun", "hafta", "ay"][i] ? "white" : GRAY600 }}>{d}</button>
              ))}
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto" }}>
                <input type="date" defaultValue="2026-03-11" style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 11 }} />
                <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Uygula</button>
              </div>
            </div>

            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Garson Performans Tablosu</h3>
                <span style={{ fontSize: 10, display: "inline-flex", alignItems: "center", gap: 6, background: "#F0FFFE", border: `1px solid ${TEAL}`, borderRadius: 20, padding: "4px 12px", fontWeight: 600, color: TEAL }}>💡 Tip: Garsona Direkt</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "180px 70px 80px 80px 80px 90px 80px", padding: "12px 18px", background: GRAY50, borderBottom: `1px solid ${GRAY100}`, gap: 8, fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5 }}>
                <div>Garson</div><div>Teslimat</div><div>Müşteri</div><div>Ort. Süre</div><div>Performans</div><div>Memnuniyet</div><div>Tip</div>
              </div>
              {GARSON_ROWS.map((g, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 70px 80px 80px 80px 90px 80px", padding: "12px 18px", borderBottom: `1px solid ${GRAY100}`, gap: 8, alignItems: "center", fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", background: g.avatarBg }}>{g.inits}</div>
                    <div><div style={{ fontWeight: 600, color: NAVY }}>{g.name}</div><div style={{ fontSize: 10, color: GRAY400 }}>{g.rol}</div></div>
                  </div>
                  <div style={{ fontWeight: 800, color: GREEN, fontSize: 14 }}>{g.teslimat}</div>
                  <div style={{ fontWeight: 700 }}>{g.musteri}</div>
                  <div style={{ fontWeight: 700 }}>{g.sure}</div>
                  <div><div style={{ background: GRAY100, borderRadius: 20, height: 6, width: 60, overflow: "hidden", display: "inline-block" }}><div style={{ width: `${g.perf}%`, height: "100%", borderRadius: 20, background: `linear-gradient(90deg,${TEAL},${GREEN})` }} /></div></div>
                  <div style={{ color: YELLOW, fontSize: 11 }}>★★★★{i === 1 ? "☆" : "★"} <span style={{ color: GRAY400, fontSize: 10 }}>{g.puan}</span></div>
                  <div style={{ fontWeight: 800, color: ORANGE }}>{g.tip}</div>
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "180px 70px 80px 80px 80px 90px 80px", padding: "12px 18px", background: GRAY50, borderTop: `2px solid ${GRAY200}`, gap: 8, alignItems: "center", fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: NAVY }}>Toplam / Ort.</div>
                <div style={{ fontWeight: 900, color: TEAL, fontSize: 15 }}>89</div>
                <div style={{ fontWeight: 700 }}>48</div>
                <div style={{ fontWeight: 700 }}>11dk</div>
                <div>—</div>
                <div style={{ color: YELLOW, fontSize: 11 }}>★★★★★ <span style={{ color: GRAY400, fontSize: 10 }}>4.7</span></div>
                <div style={{ fontWeight: 900, color: ORANGE, fontSize: 14 }}>₺820</div>
              </div>
            </div>

            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Saatlik Teslimat Dağılımı</h3>
                <span style={{ fontSize: 11, color: GRAY400 }}>Bugün</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, paddingBottom: 24, borderBottom: `1px solid ${GRAY200}` }}>
                {SAATLIK_TESLIMAT.map((s, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                    <div style={{ width: "100%", height: `${s.pct}%`, background: s.isOrange ? ORANGE : TEAL, borderRadius: "6px 6px 0 0", position: "relative", minHeight: 20 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: GRAY600, position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)" }}>{s.val}</span>
                    </div>
                    <span style={{ fontSize: 9, color: GRAY400, marginTop: 4 }}>{s.saat}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ÜRÜN SATIŞLARI */}
        {activeTab === "urun" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              {["Bugün", "Bu Hafta", "Bu Ay"].map((d, i) => (
                <button key={d} onClick={() => setDonemUrun(["bugun", "hafta", "ay"][i])} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${GRAY200}`, background: donemUrun === ["bugun", "hafta", "ay"][i] ? NAVY : "white", fontSize: 12, fontWeight: 600, cursor: "pointer", color: donemUrun === ["bugun", "hafta", "ay"][i] ? "white" : GRAY600 }}>{d}</button>
              ))}
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto" }}>
                <input type="date" defaultValue="2026-03-01" style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 11 }} />
                <span style={{ fontSize: 11, color: GRAY400 }}>—</span>
                <input type="date" defaultValue="2026-03-11" style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 11 }} />
                <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Uygula</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Toplam Sipariş", val: "623", sub: "Bu hafta", change: "↑ %21", color: TEAL },
                { label: "Sipariş Cirosu", val: "₺52.600", sub: "Bu hafta", change: "↑ %24", color: ORANGE },
                { label: "En Çok Satan", val: "Mojito", sub: "142 adet bu hafta", change: "↑ %18", color: GREEN },
              ].map((s, i) => (
                <div key={i} style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                  <div style={{ fontSize: 11, color: GRAY400, fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: NAVY, marginBottom: 4, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: GRAY400 }}>{s.sub}</div>
                  <div style={{ display: "inline-flex", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, marginTop: 6, background: "#DCFCE7", color: "#16A34A" }}>{s.change}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Ürün Bazlı Satış Raporu</h3>
                <select style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 11 }}>
                  <option>Tüm Kategoriler</option>
                  <option>İçecekler</option>
                  <option>Yemekler</option>
                  <option>Tatlılar</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 80px 80px 90px 100px", padding: "10px 18px", background: GRAY50, borderBottom: `1px solid ${GRAY100}`, gap: 8, fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5 }}>
                <div>#</div><div>Ürün</div><div>Satış</div><div>Fiyat</div><div>Toplam</div><div>Trend</div>
              </div>
                {URUN_ROWS.map((u, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "30px 1fr 80px 80px 90px 100px", padding: "10px 18px", borderBottom: `1px solid ${GRAY100}`, gap: 8, alignItems: "center", fontSize: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < 3 ? 10 : 11, fontWeight: 800, background: i === 0 ? "#FEF3C7" : i === 1 ? "#F1F5F9" : i === 2 ? "#FFEDD5" : GRAY100, color: i === 0 ? "#D97706" : i === 1 ? GRAY600 : i === 2 ? ORANGE : GRAY600 }}>{u.rank}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>{u.icon}</span><div><div style={{ fontWeight: 700, fontSize: 12 }}>{u.name}</div><div style={{ fontSize: 10, color: GRAY400 }}>{u.cat}</div></div></div>
                  <div style={{ fontWeight: 800, color: GREEN }}>{u.satis}</div>
                  <div>{u.fiyat}</div>
                  <div style={{ fontWeight: 800, color: NAVY }}>{u.toplam}</div>
                  <div style={{ color: u.trendUp ? GREEN : RED, fontWeight: 700, fontSize: 11 }}>{u.trend}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
