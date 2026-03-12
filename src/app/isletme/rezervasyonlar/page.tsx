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
const BLUE = "#3B82F6";
const YELLOW = "#F59E0B";

const TABLE_COLS = "50px 1fr 140px 120px 110px 120px 110px 100px";

// Mock data - HTML ile birebir
const MOCK_REZERVASYONLAR = [
  {
    id: "R001",
    no: "#001",
    musteri: "Ahmet Yılmaz",
    telefon: "0532 111 22 33",
    avatarColor: "linear-gradient(135deg,#0ABAB5,#0A1628)",
    avatarInits: "AY",
    sezlong: "S-12",
    sezlongSub: "Silver • 1 şezlong",
    tarih: "11 Mar 2026",
    tarihSub: "09:45 — Aktif",
    tip: "on",
    tipLabel: "💰 Ön Ödemeli",
    tutar: "₺1.000",
    tutarSub: "Bakiye: ₺640",
    tutarColor: NAVY,
    status: "aktif",
    statusLabel: "● Aktif",
    disabled: false,
    drawerData: { email: "ahmet@gmail.com", sezlong: "S-12 (Silver)", giris: "09:45", sure: "3s 42dk", yuklenen: "₺1.000", harcanan: "-₺360", bakiyePct: 64, kalan: "₺640", sonTarih: "10 Nisan 2026", siparisler: [{ no: "S12", urun: "2x Mojito, 1x Limonata", saat: "10:15 • İletildi ✓", tutar: "₺180" }, { no: "S12", urun: "1x Tavuk Şiş, 1x Salata", saat: "12:30 • İletildi ✓", tutar: "₺120" }, { no: "S12", urun: "2x Soğuk Kahve", saat: "13:20 • Hazırlanıyor...", tutar: "₺60" }] },
  },
  {
    id: "R002",
    no: "#002",
    musteri: "Fatma Demir",
    telefon: "0533 222 33 44",
    avatarColor: "linear-gradient(135deg,#F5821F,#0A1628)",
    avatarInits: "FD",
    sezlong: "V-3, V-4",
    sezlongSub: "VIP • 2 şezlong",
    tarih: "11 Mar 2026",
    tarihSub: "11:15 — Aktif",
    tip: "on",
    tipLabel: "💰 Ön Ödemeli",
    tutar: "₺3.000",
    tutarSub: "Bakiye: ₺2.150",
    tutarColor: NAVY,
    status: "aktif",
    statusLabel: "● Aktif",
    disabled: false,
    drawerData: { email: "fatma@gmail.com", sezlong: "V-3, V-4 (VIP)", giris: "11:15", sure: "2s 10dk", yuklenen: "₺3.000", harcanan: "-₺850", bakiyePct: 72, kalan: "₺2.150", sonTarih: "10 Nisan 2026", siparisler: [] },
  },
  {
    id: "R003",
    no: "#003",
    musteri: "Mehmet Kaya",
    telefon: "0535 333 44 55",
    avatarColor: "linear-gradient(135deg,#10B981,#0A1628)",
    avatarInits: "MK",
    sezlong: "G-1",
    sezlongSub: "Gold • 1 şezlong",
    tarih: "11 Mar 2026",
    tarihSub: "09:00 — Çıktı",
    tip: "sezlong",
    tipLabel: "🏖️ Sadece Sezlong",
    tutar: "₺2.000",
    tutarSub: "Tamamlandı",
    tutarColor: NAVY,
    status: "tamamlandi",
    statusLabel: "✓ Tamamlandı",
    disabled: false,
    drawerData: { email: "mehmet@gmail.com", sezlong: "G-1 (Gold)", giris: "09:00", sure: "4s 0dk", yuklenen: "—", harcanan: "—", bakiyePct: 0, kalan: "—", sonTarih: "", siparisler: [] },
  },
  {
    id: "R004",
    no: "#004",
    musteri: "Zeynep Arslan",
    telefon: "0536 444 55 66",
    avatarColor: "linear-gradient(135deg,#8B5CF6,#0A1628)",
    avatarInits: "ZA",
    sezlong: "İ-5, İ-6",
    sezlongSub: "İskele • 2 şezlong",
    tarih: "11 Mar 2026",
    tarihSub: "14:00 — Bekleniyor",
    tip: "on",
    tipLabel: "💰 Ön Ödemeli",
    tutar: "₺2.500",
    tutarSub: "Bakiye: ₺2.500",
    tutarColor: NAVY,
    status: "rezerve",
    statusLabel: "◔ Yaklaşan",
    disabled: false,
    drawerData: { email: "zeynep@gmail.com", sezlong: "İ-5, İ-6 (İskele)", giris: "14:00", sure: "—", yuklenen: "₺2.500", harcanan: "₺0", bakiyePct: 100, kalan: "₺2.500", sonTarih: "10 Nisan 2026", siparisler: [] },
  },
  {
    id: "R005",
    no: "#005",
    musteri: "Ali Koç",
    telefon: "0537 555 66 77",
    avatarColor: "linear-gradient(135deg,#EF4444,#0A1628)",
    avatarInits: "AK",
    sezlong: "S-22",
    sezlongSub: "Silver • 1 şezlong",
    tarih: "10 Mar 2026",
    tarihSub: "İptal edildi",
    tip: "sezlong",
    tipLabel: "🏖️ Sadece Sezlong",
    tutar: "₺1.000",
    tutarSub: "İade edildi",
    tutarColor: RED,
    status: "iptal",
    statusLabel: "✖ İptal",
    disabled: true,
    drawerData: { email: "ali@gmail.com", sezlong: "S-22 (Silver)", giris: "—", sure: "—", yuklenen: "—", harcanan: "—", bakiyePct: 0, kalan: "—", sonTarih: "", siparisler: [] },
  },
  {
    id: "R006",
    no: "#006",
    musteri: "Selin Erdoğan",
    telefon: "0538 666 77 88",
    avatarColor: "linear-gradient(135deg,#F59E0B,#0A1628)",
    avatarInits: "SE",
    sezlong: "V-8, V-9, V-10",
    sezlongSub: "VIP • 3 şezlong (Grup)",
    tarih: "11 Mar 2026",
    tarihSub: "10:30 — Aktif",
    tip: "on",
    tipLabel: "💰 Ön Ödemeli",
    tutar: "₺4.500",
    tutarSub: "Bakiye: ₺3.200",
    tutarColor: NAVY,
    status: "aktif",
    statusLabel: "● Aktif",
    disabled: false,
    drawerData: { email: "selin@gmail.com", sezlong: "V-8, V-9, V-10 (VIP)", giris: "10:30", sure: "2s 15dk", yuklenen: "₺4.500", harcanan: "-₺1.300", bakiyePct: 71, kalan: "₺3.200", sonTarih: "10 Nisan 2026", siparisler: [] },
  },
  {
    id: "R007",
    no: "#007",
    musteri: "Burak Taş",
    telefon: "0539 777 88 99",
    avatarColor: "linear-gradient(135deg,#3B82F6,#0A1628)",
    avatarInits: "BT",
    sezlong: "S-33",
    sezlongSub: "Silver • 1 şezlong",
    tarih: "12 Mar 2026",
    tarihSub: "11:00 — Yarın",
    tip: "on",
    tipLabel: "💰 Ön Ödemeli",
    tutar: "₺1.000",
    tutarSub: "Bakiye: ₺1.000",
    tutarColor: NAVY,
    status: "bekliyor",
    statusLabel: "◷ Bekliyor",
    disabled: false,
    drawerData: { email: "burak@gmail.com", sezlong: "S-33 (Silver)", giris: "11:00", sure: "—", yuklenen: "₺1.000", harcanan: "₺0", bakiyePct: 100, kalan: "₺1.000", sonTarih: "10 Nisan 2026", siparisler: [] },
  },
];

const TABS = [
  { key: "tumu", label: "Tümü", count: 47 },
  { key: "aktif", label: "Aktif", count: 28 },
  { key: "yaklasan", label: "Yaklaşan", count: 12 },
  { key: "tamamlandi", label: "Tamamlandı", count: 4 },
  { key: "iptal", label: "İptal", count: 3 },
];

export default function IsletmeRezervasyonlarPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRez, setDrawerRez] = useState<typeof MOCK_REZERVASYONLAR[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tumu");

  function openDrawer(r: typeof MOCK_REZERVASYONLAR[0]) {
    setDrawerRez(r);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDrawerRez(null);
  }

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background: GRAY100,
        color: GRAY800,
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
      }}
    >
      {/* TOPBAR */}
      <header
        style={{
          background: "white",
          borderBottom: `1px solid ${GRAY200}`,
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Rezervasyonlar</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>11 Mart 2026 • Toplam 47 rezervasyon</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "#F0FFFE",
              border: `1px solid ${TEAL}`,
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 10,
              fontWeight: 700,
              color: TEAL,
              marginLeft: 10,
            }}
          >
            💰 Ön Ödemeli Sistem
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: `1px solid ${GRAY200}`,
              background: GRAY100,
              color: GRAY800,
              cursor: "pointer",
            }}
          >
            📥 Excel İndir
          </button>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              background: TEAL,
              color: "white",
              cursor: "pointer",
            }}
          >
            ➕ Yeni Rezervasyon
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div style={{ padding: 24, flex: 1 }}>
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { icon: "📋", val: "47", lbl: "Toplam Bugün", valColor: NAVY },
            { icon: "✅", val: "28", lbl: "Aktif", valColor: GREEN },
            { icon: "🔵", val: "12", lbl: "Yaklaşan", valColor: BLUE },
            { icon: "❌", val: "3", lbl: "İptal", valColor: RED },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: 12,
                padding: "16px 18px",
                border: `1px solid ${GRAY200}`,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  background: i === 0 || i === 1 ? "#DCFCE7" : i === 2 ? "#DBEAFE" : "#FEE2E2",
                }}
              >
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.valColor, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: GRAY400, marginTop: 3 }}>{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FİLTRE */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            border: `1px solid ${GRAY200}`,
            padding: "14px 18px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="🔍  Müşteri adı, telefon veya rezervasyon no..."
            style={{
              flex: 1,
              minWidth: 200,
              padding: "8px 12px",
              border: `1px solid ${GRAY200}`,
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <input type="date" defaultValue="2026-03-11" style={{ padding: "8px 12px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }} />
          <select style={{ padding: "8px 12px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }}>
            <option>Tüm Gruplar</option>
            <option>Silver</option>
            <option>VIP</option>
            <option>İskele</option>
            <option>Gold</option>
          </select>
          <select style={{ padding: "8px 12px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }}>
            <option>Tüm Tipler</option>
            <option>Ön Ödemeli</option>
            <option>Sadece Sezlong</option>
          </select>
          <select style={{ padding: "8px 12px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }}>
            <option>Tüm Durumlar</option>
            <option>Aktif</option>
            <option>Yaklaşan</option>
            <option>Tamamlandı</option>
            <option>İptal</option>
          </select>
          <button
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: `1px solid ${GRAY200}`,
              background: GRAY100,
              color: GRAY800,
              cursor: "pointer",
            }}
          >
            🔄 Sıfırla
          </button>
        </div>

        {/* TAB BAR */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: GRAY100,
            borderRadius: 8,
            padding: 4,
            marginBottom: 16,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "7px 16px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                color: activeTab === t.key ? NAVY : GRAY600,
                background: activeTab === t.key ? "white" : "transparent",
                boxShadow: activeTab === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                border: "none",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {t.label}{" "}
              <span
                style={{
                  display: "inline-block",
                  background: activeTab === t.key ? TEAL : GRAY200,
                  color: activeTab === t.key ? "white" : GRAY800,
                  fontSize: 10,
                  padding: "1px 6px",
                  borderRadius: 10,
                  marginLeft: 4,
                }}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* TABLO */}
        <div
          style={{
            background: "white",
            borderRadius: 14,
            border: `1px solid ${GRAY200}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: TABLE_COLS,
              padding: "12px 18px",
              background: GRAY50,
              borderBottom: `1px solid ${GRAY200}`,
              gap: 8,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, letterSpacing: 0.5, textTransform: "uppercase" }}>#</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, letterSpacing: 0.5, textTransform: "uppercase" }}>Müşteri</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, letterSpacing: 0.5, textTransform: "uppercase" }}>Şezlong</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, letterSpacing: 0.5, textTransform: "uppercase" }}>Tarih</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, letterSpacing: 0.5, textTransform: "uppercase" }}>Tip</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, letterSpacing: 0.5, textTransform: "uppercase" }}>Tutar / Bakiye</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, letterSpacing: 0.5, textTransform: "uppercase" }}>Durum</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, letterSpacing: 0.5, textTransform: "uppercase", textAlign: "right" }}>İşlem</div>
          </div>

          {MOCK_REZERVASYONLAR.map((r) => (
            <div
              key={r.id}
              className="rez-table-row"
              onClick={() => !r.disabled && openDrawer(r)}
              style={{
                display: "grid",
                gridTemplateColumns: TABLE_COLS,
                padding: "14px 18px",
                borderBottom: `1px solid ${GRAY100}`,
                gap: 8,
                alignItems: "center",
                cursor: r.disabled ? "default" : "pointer",
                transition: "background 0.15s",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: GRAY400 }}>{r.no}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "white",
                    background: r.avatarColor,
                  }}
                >
                  {r.avatarInits}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{r.musteri}</div>
                  <div style={{ fontSize: 11, color: GRAY400 }}>{r.telefon}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{r.sezlong}</div>
                <div style={{ fontSize: 10, color: GRAY400, fontWeight: 400 }}>{r.sezlongSub}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: GRAY800 }}>{r.tarih}</div>
                <div style={{ fontSize: 10, color: GRAY400 }}>{r.tarihSub}</div>
              </div>
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "4px 8px",
                    borderRadius: 20,
                    background: r.tip === "on" ? "#DCFCE7" : "#DBEAFE",
                    color: r.tip === "on" ? "#16A34A" : "#2563EB",
                  }}
                >
                  {r.tipLabel}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: r.tutarColor }}>{r.tutar}</div>
                <div style={{ fontSize: 10, color: GRAY400, fontWeight: 400 }}>{r.tutarSub}</div>
              </div>
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "5px 10px",
                    borderRadius: 20,
                    background:
                      r.status === "aktif"
                        ? "#DCFCE7"
                        : r.status === "rezerve"
                        ? "#DBEAFE"
                        : r.status === "tamamlandi"
                        ? GRAY100
                        : r.status === "iptal"
                        ? "#FEE2E2"
                        : "#FEF3C7",
                    color:
                      r.status === "aktif"
                        ? "#16A34A"
                        : r.status === "rezerve"
                        ? "#2563EB"
                        : r.status === "tamamlandi"
                        ? GRAY600
                        : r.status === "iptal"
                        ? "#DC2626"
                        : "#D97706",
                  }}
                >
                  {r.statusLabel}
                </span>
              </div>
              <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                <button
                  className="rez-action-btn"
                  onClick={(e) => { e.stopPropagation(); !r.disabled && openDrawer(r); }}
                  style={{
                    width: 28,
                    height: 28,
                    border: `1px solid ${GRAY200}`,
                    background: "white",
                    borderRadius: 7,
                    cursor: r.disabled ? "not-allowed" : "pointer",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: r.disabled ? 0.4 : 1,
                  }}
                  title="Detay"
                >
                  👁️
                </button>
                <button
                  className="rez-action-btn"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: 28,
                    height: 28,
                    border: `1px solid ${GRAY200}`,
                    background: "white",
                    borderRadius: 7,
                    cursor: r.disabled ? "not-allowed" : "pointer",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: r.disabled ? 0.4 : 1,
                  }}
                  title="Düzenle"
                >
                  ✏️
                </button>
                <button
                  className="rez-action-btn"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: 28,
                    height: 28,
                    border: `1px solid ${GRAY200}`,
                    background: "white",
                    borderRadius: 7,
                    cursor: r.disabled ? "not-allowed" : "pointer",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: r.disabled ? 0.4 : 1,
                  }}
                  title="İptal"
                >
                  ✖️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SAYFALAMA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "0 4px" }}>
          <div style={{ fontSize: 12, color: GRAY400 }}>47 rezervasyondan 1-7 arası gösteriliyor</div>
          <div style={{ display: "flex", gap: 4 }}>
            <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>
              ‹ Önceki
            </button>
            <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>
              1
            </button>
            <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>
              2
            </button>
            <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>
              3
            </button>
            <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>
              Sonraki ›
            </button>
          </div>
        </div>
      </div>

      {/* DETAY DRAWER */}
      {drawerOpen && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 200,
            }}
            onClick={closeDrawer}
          />
          <div
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              width: 420,
              background: "white",
              zIndex: 201,
              overflowY: "auto",
              boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
              transform: "translateX(0)",
              transition: "transform 0.3s",
            }}
          >
            <div style={{ background: NAVY, padding: "20px 24px", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Rezervasyon {drawerRez?.id}</h3>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                  #{drawerRez?.id} • {drawerRez?.musteri}
                </div>
              </div>
              <button
                onClick={closeDrawer}
                style={{
                  width: 32,
                  height: 32,
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: 8,
                  color: "white",
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              {drawerRez?.drawerData && (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Müşteri Bilgileri</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, background: GRAY50, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          fontWeight: 700,
                          color: "white",
                          background: drawerRez.avatarColor,
                        }}
                      >
                        {drawerRez.avatarInits}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{drawerRez.musteri}</div>
                        <div style={{ fontSize: 12, color: GRAY400 }}>{drawerRez.telefon} • {drawerRez.drawerData.email}</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ background: GRAY50, borderRadius: 10, padding: 12 }}>
                        <div style={{ fontSize: 10, color: GRAY400, marginBottom: 4 }}>Şezlong</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{drawerRez.drawerData.sezlong}</div>
                      </div>
                      <div style={{ background: GRAY50, borderRadius: 10, padding: 12 }}>
                        <div style={{ fontSize: 10, color: GRAY400, marginBottom: 4 }}>Giriş Saati</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{drawerRez.drawerData.giris}</div>
                      </div>
                      <div style={{ background: GRAY50, borderRadius: 10, padding: 12 }}>
                        <div style={{ fontSize: 10, color: GRAY400, marginBottom: 4 }}>Süre</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{drawerRez.drawerData.sure}</div>
                      </div>
                      <div style={{ background: GRAY50, borderRadius: 10, padding: 12 }}>
                        <div style={{ fontSize: 10, color: GRAY400, marginBottom: 4 }}>Tesis Modu</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: TEAL }}>💰 Ön Ödemeli</div>
                      </div>
                    </div>
                  </div>

                  {drawerRez.tip === "on" && drawerRez.drawerData.yuklenen !== "—" && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Bakiye Durumu</div>
                      <div style={{ background: GRAY50, borderRadius: 12, padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: GRAY600 }}>Yüklenen Bakiye</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{drawerRez.drawerData.yuklenen}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: GRAY600 }}>Harcanan</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: RED }}>{drawerRez.drawerData.harcanan}</span>
                        </div>
                        <div style={{ background: GRAY100, borderRadius: 20, height: 10, margin: "8px 0", overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 20,
                              background: `linear-gradient(90deg,${TEAL},${GREEN})`,
                              width: `${drawerRez.drawerData.bakiyePct}%`,
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11, color: GRAY400 }}>Kalan Bakiye</span>
                          <span style={{ fontSize: 15, fontWeight: 800, color: TEAL }}>{drawerRez.drawerData.kalan}</span>
                        </div>
                        {drawerRez.drawerData.sonTarih && (
                          <div style={{ fontSize: 10, color: YELLOW, marginTop: 8 }}>⏰ Bakiye {drawerRez.drawerData.sonTarih}&apos;da sona eriyor</div>
                        )}
                      </div>
                    </div>
                  )}

                  {drawerRez.drawerData.siparisler && drawerRez.drawerData.siparisler.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Siparişler ({drawerRez.drawerData.siparisler.length} adet)</div>
                      {drawerRez.drawerData.siparisler.map((s, i) => (
                        <div
                          key={i}
                          style={{
                            background: GRAY50,
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div style={{ width: 30, height: 30, background: NAVY, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: TEAL }}>
                            {s.no}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{s.urun}</div>
                            <div style={{ fontSize: 10, color: GRAY400 }}>{s.saat}</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{s.tutar}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>İşlemler</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {["💰 Bakiye Yükle", "🏖️ Şezlong Değiştir", "📤 Çıkış Yaptır", "🧾 Fiş Yazdır"].map((label) => (
                        <button
                          key={label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "12px 16px",
                            borderRadius: 10,
                            border: `1px solid ${GRAY200}`,
                            background: "white",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            color: GRAY800,
                            textAlign: "left",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid #FEE2E2",
                          background: "white",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                          color: RED,
                          textAlign: "left",
                        }}
                      >
                        ✖ Rezervasyonu İptal Et
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* YENİ REZERVASYON MODAL */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
          }}
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              width: 500,
              maxWidth: "95vw",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 20 }}>➕ Yeni Rezervasyon</h3>

            <div
              style={{
                background: "#F0FFFE",
                border: `1.5px solid ${TEAL}`,
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>💰</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>Ön Ödemeli Sistem Aktif</div>
                <div style={{ fontSize: 11, color: GRAY600, marginTop: 2 }}>Sezlong bedeli müşterinin bakiyesine yüklenir. Fazla harcama olursa uygulama/web üzerinden ek ödeme alınır.</div>
              </div>
              <a href="#" style={{ fontSize: 10, color: TEAL, whiteSpace: "nowrap", textDecoration: "none" }}>Ayarı Değiştir →</a>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Müşteri Adı</label>
                <input type="text" placeholder="Ad Soyad" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Telefon</label>
                <input type="tel" placeholder="05xx xxx xx xx" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Grup</label>
                <select style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}>
                  <option>Silver</option>
                  <option>VIP</option>
                  <option>İskele</option>
                  <option>Gold</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Şezlong Seç</label>
                <select style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}>
                  <option>S-14 (Boş)</option>
                  <option>S-17 (Boş)</option>
                  <option>S-23 (Boş)</option>
                  <option>V-5 (Boş)</option>
                  <option>V-11 (Boş)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Tarih</label>
                <input type="date" defaultValue="2026-03-11" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Kişi Sayısı</label>
                <select style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} defaultValue="2">
                  <option value="1">1 Kişi</option>
                  <option value="2">2 Kişi</option>
                  <option value="3">3 Kişi</option>
                  <option value="4">4 Kişi</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Yüklenecek Bakiye (₺) — Ön ödemeli için</label>
              <input type="number" placeholder="örn: 1500" defaultValue={1000} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
            </div>

            <div style={{ background: GRAY50, borderRadius: 10, padding: 12, marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: GRAY600, marginBottom: 4 }}>
                <span>Sezlong Bedeli (Silver)</span>
                <span>₺1.000</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: GRAY600, marginBottom: 4 }}>
                <span>Yüklenecek Bakiye</span>
                <span>₺1.000</span>
              </div>
              <div style={{ height: 1, background: GRAY200, margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: NAVY }}>
                <span>Toplam Tahsilat</span>
                <span style={{ color: TEAL }}>₺2.000</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  border: `1px solid ${GRAY200}`,
                  background: GRAY100,
                  color: GRAY800,
                  cursor: "pointer",
                }}
              >
                İptal
              </button>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  border: "none",
                  background: TEAL,
                  color: "white",
                  cursor: "pointer",
                }}
              >
                ✅ Rezervasyonu Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .rez-table-row:hover { background: #F8FAFC !important; }
          .rez-action-btn:hover { background: #0A1628 !important; border-color: #0A1628 !important; color: white !important; }
        `,
      }} />
    </div>
  );
}
