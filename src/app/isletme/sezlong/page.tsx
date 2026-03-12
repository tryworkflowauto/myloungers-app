"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// HTML'deki :root değişkenleri
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
const BLUE = "#3B82F6";

// Mock data - HTML'deki gruplar objesiyle birebir
const GRUPLAR: Record<string, { prefix: string; count: number; color: string; durumlar: string[] }> = {
  gold: {
    prefix: "G",
    count: 10,
    color: "#8B5CF6",
    durumlar: ["dolu", "dolu", "dolu", "kilitli", "dolu", "dolu", "dolu", "kilitli", "dolu", "dolu"],
  },
  iskele: {
    prefix: "İ",
    count: 20,
    color: "#F59E0B",
    durumlar: [
      "dolu", "dolu", "bos", "dolu", "rezerve", "bos", "dolu", "bos", "dolu", "kilitli",
      "dolu", "bos", "rezerve", "bos", "dolu", "bakim", "bos", "kilitli", "bos", "bos",
    ],
  },
  vip: {
    prefix: "V",
    count: 40,
    color: "#F5821F",
    durumlar: [
      "dolu", "dolu", "bos", "dolu", "dolu", "bos", "dolu", "dolu", "rezerve", "bos",
      "dolu", "kilitli", "dolu", "bos", "dolu", "dolu", "bakim", "dolu", "bos", "dolu",
      "dolu", "bos", "dolu", "kilitli", "bos", "rezerve", "dolu", "dolu", "bos", "dolu",
      "bakim", "dolu", "dolu", "bos", "kilitli", "dolu", "bos", "dolu", "rezerve", "bos",
    ],
  },
  silver: {
    prefix: "S",
    count: 55,
    color: "#0ABAB5",
    durumlar: Array.from({ length: 55 }, (_, i) =>
      i % 9 === 0 ? "kilitli" : i % 7 === 0 ? "bakim" : i % 5 === 0 ? "rezerve" : i % 3 === 0 ? "bos" : "dolu"
    ),
  },
};

// Şezlong durumuna göre renkler - HTML CSS'inden
const SEZ_STYLES: Record<string, { bg: string; border: string; borderStyle?: "solid" | "dashed"; pillow: string; legs: string; noColor: string }> = {
  bos: { bg: "#DCFCE7", border: "#86EFAC", pillow: "#A7F3D0", legs: "#86EFAC", noColor: "#16A34A" },
  dolu: { bg: "#FFEDD5", border: "#FB923C", pillow: "#FED7AA", legs: "#FB923C", noColor: "#EA580C" },
  rezerve: { bg: "#DBEAFE", border: "#60A5FA", pillow: "#BFDBFE", legs: "#60A5FA", noColor: "#2563EB" },
  bakim: { bg: "#F1F5F9", border: "#CBD5E1", pillow: "#E2E8F0", legs: "#CBD5E1", noColor: "#94A3B8" },
  kilitli: { bg: "#EDE9FE", border: "#7C3AED", borderStyle: "dashed", pillow: "#DDD6FE", legs: "#7C3AED", noColor: "#7C3AED" },
};

const LEGEND_ITEMS = [
  { emoji: "🟢", label: "Boş", sub: "Rezervasyon yapılabilir", count: 41, countColor: GREEN },
  { emoji: "🟠", label: "Dolu", sub: "Aktif müşteri var", count: 74, countColor: ORANGE },
  { emoji: "🔵", label: "Rezerve", sub: "Gelecek rezervasyon", count: 8, countColor: BLUE },
  { emoji: "⚪", label: "Bakımda", sub: "Geçici kapalı", count: 10, countColor: GRAY400 },
  { emoji: "🔒", label: "İşletme Rezervi", sub: "Satın alınamaz", count: 7, countColor: "#7C3AED" },
];

const MOCK_GRUPLAR = [
  { name: "Silver", count: 55, color: "#0ABAB5", dolu: 38, bos: 17, fiyat: "₺1.000", doluluk: "69%" },
  { name: "VIP", count: 40, color: "#F5821F", dolu: 28, bos: 12, fiyat: "₺1.500", doluluk: "70%" },
  { name: "İskele", count: 20, color: "#F59E0B", dolu: 8, bos: 12, fiyat: "₺1.250", doluluk: "40%" },
  { name: "Gold", count: 10, color: "#8B5CF6", dolu: 10, bos: 0, fiyat: "₺2.000", doluluk: "100%" },
];

const MAP_BLOCKS = [
  { key: "gold", title: "Gold", sub: "Denize Sıfır VIP", icon: "⭐", gradient: "linear-gradient(135deg,#7C3AED,#8B5CF6)", doluluk: "100% Dolu", count: 10 },
  { key: "iskele", title: "İskele", sub: "Ahşap Platform", icon: "⚓", gradient: "linear-gradient(135deg,#D97706,#F59E0B)", doluluk: "40% Dolu", count: 20 },
  { key: "vip", title: "VIP", sub: "Birinci Sıra", icon: "🔥", gradient: "linear-gradient(135deg,#EA580C,#F5821F)", doluluk: "70% Dolu", count: 40 },
  { key: "silver", title: "Silver", sub: "Standart Bölge", icon: "🌊", gradient: "linear-gradient(135deg,#0891B2,#0ABAB5)", doluluk: "69% Dolu", count: 55 },
];

const DURUM_LABELS: Record<string, string> = {
  bos: "Boş",
  dolu: "Dolu",
  rezerve: "Rezerve",
  bakim: "Bakımda",
  kilitli: "İşletme Rezervi",
};

const COLOR_OPTS = ["#0ABAB5", "#F5821F", "#F59E0B", "#8B5CF6", "#EF4444", "#10B981", "#3B82F6", "#EC4899", "#0A1628"];

function SezlongItem({
  no,
  durum,
  grupKey,
  isSecili,
  onClick,
}: {
  no: string;
  durum: string;
  grupKey: string;
  isSecili: boolean;
  onClick: () => void;
}) {
  const s = SEZ_STYLES[durum] ?? SEZ_STYLES.bos;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={durum === "kilitli" ? "sezlong-item sezlong-kilitli" : "sezlong-item"}
      style={{
        position: "relative",
        cursor: durum === "kilitli" ? "not-allowed" : "pointer",
      }}
      title={`${no} — ${DURUM_LABELS[durum]}`}
    >
      <div
        className="sezlong-inner"
        style={{
          width: 52,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          transition: "transform 0.15s",
        }}
      >
        <div
          style={{
            width: 44,
            height: 36,
            borderRadius: "6px 6px 4px 4px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: s.bg,
            border: `2px ${s.borderStyle ?? "solid"} ${s.border}`,
            boxShadow: isSecili ? "0 0 0 3px var(--teal, #0ABAB5)" : undefined,
            transform: isSecili ? "scale(1.05)" : undefined,
          }}
        >
          {/* Yastık (::before) */}
          <div
            style={{
              position: "absolute",
              top: -8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 30,
              height: 14,
              borderRadius: "6px 6px 0 0",
              background: s.pillow,
            }}
          />
          {/* Numara */}
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              lineHeight: 1,
              color: s.noColor,
              position: "relative",
              zIndex: 1,
            }}
          >
            {durum === "kilitli" ? "🔒" : no}
          </span>
          {/* Müşteri ikonu (dolu ise) */}
          {durum === "dolu" && (
            <div
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 16,
                height: 16,
                background: ORANGE,
                borderRadius: "50%",
                border: "2px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 8,
                zIndex: 2,
              }}
            >
              👤
            </div>
          )}
          {/* Ayaklar (::after) */}
          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: "50%",
              transform: "translateX(-50%)",
              width: 36,
              height: 6,
              borderRadius: 3,
              background: s.legs,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function IsletmeSezlongPage() {
  const router = useRouter();
  const [seciliNo, setSeciliNo] = useState<string | null>(null);
  const [seciliGrup, setSeciliGrup] = useState<string | null>(null);
  const [seciliDurum, setSeciliDurum] = useState<string>("bos");
  const [modalOpen, setModalOpen] = useState(false);
  const [kilitliToastNo, setKilitliToastNo] = useState<string | null>(null);
  const [seciliRenk, setSeciliRenk] = useState("#0ABAB5");
  const [gruplar, setGruplar] = useState(MOCK_GRUPLAR);
  const [duzenleModal, setDuzenleModal] = useState<(typeof MOCK_GRUPLAR)[0] | null>(null);
  const [duzenleForm, setDuzenleForm] = useState({ name: "", count: "", color: "", fiyat: "" });
  const [silModal, setSilModal] = useState<(typeof MOCK_GRUPLAR)[0] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [cikisModal, setCikisModal] = useState(false);
  const [rezModal, setRezModal] = useState(false);
  const [rezForm, setRezForm] = useState({ musteriAdi: "", telefon: "", tarih: "", kisiSayisi: "" });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDuzenleModal(null);
        setSilModal(null);
        setCikisModal(false);
        setRezModal(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function openDuzenle(g: (typeof MOCK_GRUPLAR)[0]) {
    setDuzenleForm({ name: g.name, count: String(g.count), color: g.color, fiyat: g.fiyat });
    setDuzenleModal(g);
  }

  function saveDuzenle() {
    if (!duzenleModal) return;
    setGruplar((prev) =>
      prev.map((g) =>
        g.name === duzenleModal.name
          ? { ...g, name: duzenleForm.name, count: Number(duzenleForm.count), color: duzenleForm.color, fiyat: duzenleForm.fiyat }
          : g
      )
    );
    setDuzenleModal(null);
  }

  function silGrup() {
    if (!silModal) return;
    setGruplar((prev) => prev.filter((g) => g.name !== silModal.name));
    setSilModal(null);
  }

  function handleSezlongClick(no: string, grupKey: string, durum: string) {
    if (durum === "kilitli") {
      setKilitliToastNo(no);
      setTimeout(() => setKilitliToastNo(null), 2500);
      return;
    }
    setSeciliNo(no);
    setSeciliGrup(grupKey);
    setSeciliDurum(durum);
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
      {/* TOPBAR - HTML ile aynı */}
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
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Şezlong Haritası</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>125 şezlong • 74 dolu • 41 boş • 10 bakımda</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              border: `1px solid ${GRAY200}`,
              background: GRAY100,
              color: GRAY800,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            ➕ Grup Ekle
          </button>
          <button
            onClick={() => showToast("✅ Değişiklikler kaydedildi!")}
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
              transition: "all 0.2s",
            }}
          >
            💾 Değişiklikleri Kaydet
          </button>
          <select
            style={{
              padding: "7px 10px",
              border: `1px solid ${GRAY200}`,
              borderRadius: 8,
              fontSize: 12,
            }}
          >
            <option>Düzenleme Modu</option>
            <option>Görüntüleme Modu</option>
            <option>Müşteri Görünümü</option>
          </select>
        </div>
      </header>

      {/* PAGE LAYOUT */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* SOL ARAÇ PANELİ - tool-panel */}
        <div
          style={{
            width: 280,
            background: "white",
            borderRight: `1px solid ${GRAY200}`,
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          {/* Durum Göstergesi */}
          <div style={{ padding: 16, borderBottom: `1px solid ${GRAY100}` }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: GRAY400,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Durum Göstergesi
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {LEGEND_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="legend-item-hover"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      flexShrink: 0,
                      background: item.emoji === "🟢" ? "#DCFCE7" : item.emoji === "🟠" ? "#FFEDD5" : item.emoji === "🔵" ? "#DBEAFE" : item.emoji === "⚪" ? "#F1F5F9" : "#EDE9FE",
                      border: item.emoji === "🔒" ? "2px dashed #7C3AED" : item.emoji === "🟢" ? "2px solid #86EFAC" : item.emoji === "🟠" ? "2px solid #FB923C" : item.emoji === "🔵" ? "2px solid #60A5FA" : "2px solid #CBD5E1",
                    }}
                  >
                    {item.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: 12, fontWeight: 600, color: NAVY }}>{item.label}</strong>
                    <span style={{ fontSize: 10, color: GRAY400 }}>{item.sub}</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: item.countColor }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gruplar */}
          <div style={{ padding: 16, borderBottom: `1px solid ${GRAY100}` }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: GRAY400,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Gruplar
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {gruplar.map((g) => (
                <div
                  key={g.name}
                  style={{
                    border: `1.5px solid ${g.color}`,
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 12px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: 12, height: 12, borderRadius: 4, background: g.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, flex: 1 }}>{g.name}</span>
                    <span style={{ fontSize: 11, color: GRAY400 }}>{g.count} şezlong</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); openDuzenle(g); }}
                        style={{
                          width: 24,
                          height: 24,
                          border: "none",
                          background: GRAY100,
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 11,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSilModal(g); }}
                        style={{
                          width: 24,
                          height: 24,
                          border: "none",
                          background: GRAY100,
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 11,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "0 12px 10px",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 6,
                    }}
                  >
                    <div style={{ background: GRAY50, borderRadius: 6, padding: "6px 8px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ORANGE }}>{g.dolu}</div>
                      <div style={{ fontSize: 9, color: GRAY400 }}>Dolu</div>
                    </div>
                    <div style={{ background: GRAY50, borderRadius: 6, padding: "6px 8px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>{g.bos}</div>
                      <div style={{ fontSize: 9, color: GRAY400 }}>Boş</div>
                    </div>
                    <div style={{ background: GRAY50, borderRadius: 6, padding: "6px 8px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{g.fiyat}</div>
                      <div style={{ fontSize: 9, color: GRAY400 }}>Fiyat/gün</div>
                    </div>
                    <div style={{ background: GRAY50, borderRadius: 6, padding: "6px 8px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{g.doluluk}</div>
                      <div style={{ fontSize: 9, color: GRAY400 }}>Doluluk</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarih & Filtre */}
          <div style={{ padding: 16, borderBottom: `1px solid ${GRAY100}` }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: GRAY400,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Tarih & Filtre
            </div>
            <input
              type="date"
              defaultValue="2026-03-11"
              style={{
                width: "100%",
                padding: "8px 10px",
                border: `1px solid ${GRAY200}`,
                borderRadius: 8,
                fontSize: 12,
                marginBottom: 8,
              }}
            />
            <select
              style={{
                width: "100%",
                padding: "8px 10px",
                border: `1px solid ${GRAY200}`,
                borderRadius: 8,
                fontSize: 12,
                marginBottom: 8,
                background: "white",
              }}
            >
              <option>Tüm Gruplar</option>
              <option>Silver</option>
              <option>VIP</option>
              <option>İskele</option>
              <option>Gold</option>
            </select>
            <select
              style={{
                width: "100%",
                padding: "8px 10px",
                border: `1px solid ${GRAY200}`,
                borderRadius: 8,
                fontSize: 12,
                background: "white",
              }}
            >
              <option>Tüm Durumlar</option>
              <option>Sadece Boş</option>
              <option>Sadece Dolu</option>
              <option>Rezerve</option>
              <option>Bakımda</option>
            </select>
          </div>
        </div>

        {/* HARİTA ALANI */}
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
          {/* Deniz çubuğu */}
          <div
            style={{
              background: "linear-gradient(180deg, #0EA5E9 0%, #38BDF8 40%, #7DD3FC 100%)",
              minHeight: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "rgba(255,255,255,0.9)",
                letterSpacing: 6,
                textTransform: "uppercase",
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span className="sezlong-wave">🌊</span>
              <span>D E N İ Z</span>
              <span className="sezlong-wave">🌊</span>
            </div>
          </div>

          {/* Harita canvas */}
          <div style={{ flex: 1, padding: 24, position: "relative", minHeight: 500 }}>
            {MAP_BLOCKS.map((mb) => {
              const g = GRUPLAR[mb.key];
              if (!g) return null;

              return (
                <div
                  key={mb.key}
                  className="grup-block-hover"
                  style={{
                    marginBottom: 20,
                    borderRadius: 14,
                    overflow: "hidden",
                    border: "2px solid transparent",
                    transition: "border-color 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 16px",
                      color: "white",
                      background: mb.gradient,
                    }}
                  >
                    <strong style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>
                      {mb.icon} {mb.title} — {mb.sub}
                    </strong>
                    <span style={{ fontSize: 11, opacity: 0.8 }}>{mb.count} şezlong</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background: "rgba(255,255,255,0.2)",
                        padding: "3px 10px",
                        borderRadius: 20,
                      }}
                    >
                      {mb.doluluk}
                    </span>
                  </div>
                  <div style={{ background: "white", padding: 16 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {g.durumlar.map((durum, i) => {
                        const no = g.prefix + (i + 1);
                        const isSecili = seciliNo === no && seciliGrup === mb.key;
                        return (
                          <SezlongItem
                            key={no}
                            no={no}
                            durum={durum}
                            grupKey={mb.key}
                            isSecili={isSecili}
                            onClick={() => handleSezlongClick(no, mb.key, durum)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SAĞ BİLGİ PANELİ - info-panel */}
        <div
          style={{
            width: 260,
            background: "white",
            borderLeft: `1px solid ${GRAY200}`,
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <div style={{ padding: 16, background: NAVY, color: "white" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Şezlong Detayı</h3>
            <span style={{ fontSize: 11, opacity: 0.6 }}>Bir şezlonga tıklayın</span>
          </div>

          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${GRAY100}` }}>
            <div style={{ background: GRAY50, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: NAVY, marginBottom: 4 }}>
                {seciliNo ?? "—"}
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "white",
                  borderRadius: 20,
                  padding: "4px 10px",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 3,
                    background: seciliGrup ? GRUPLAR[seciliGrup]?.color ?? "#ccc" : "#ccc",
                  }}
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: NAVY }}>
                  {seciliGrup ? seciliGrup.charAt(0).toUpperCase() + seciliGrup.slice(1) : "Seçilmedi"}
                </span>
              </div>
              <select
                value={seciliDurum}
                onChange={(e) => setSeciliDurum(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: `1.5px solid ${GRAY200}`,
                  borderRadius: 8,
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                <option value="bos">🟢 Boş</option>
                <option value="dolu">🟠 Dolu</option>
                <option value="rezerve">🔵 Rezerve</option>
                <option value="bakim">⚪ Bakımda</option>
                <option value="kilitli">🔒 İşletme Rezervi</option>
              </select>
              <button
                onClick={() => showToast("✅ Değişiklikler kaydedildi!")}
                style={{
                  width: "100%",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  border: "none",
                  background: TEAL,
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                💾 Kaydet
              </button>
            </div>

            {seciliDurum === "dolu" && seciliNo && (
              <div
                style={{
                  background: "white",
                  border: `1px solid ${GRAY200}`,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Ahmet Yılmaz</div>
                <div style={{ fontSize: 11, color: GRAY400, marginBottom: 2 }}>📱 Giriş: 10:30</div>
                <div style={{ fontSize: 11, color: GRAY400, marginBottom: 2 }}>⏱️ Süre: 3 saat 20 dk</div>
                <div style={{ fontSize: 11, color: GRAY400, marginBottom: 2 }}>🍽️ Sipariş: 3 adet</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: TEAL, marginTop: 8 }}>₺1.350 Bakiye</div>
              </div>
            )}
          </div>

          {/* Hızlı İşlemler */}
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${GRAY100}` }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: GRAY400,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Hızlı İşlemler
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "📋 Rezervasyon Yap", action: () => setRezModal(true) },
                { label: "🍽️ Sipariş Gör", action: () => router.push("/isletme/siparisler") },
                { label: "💰 Bakiye Gör", action: () => router.push("/isletme/raporlar") },
                {
                  label: "🔧 Bakıma Al",
                  action: () => {
                    if (seciliNo) {
                      setSeciliDurum("bakim");
                      showToast(`🔧 ${seciliNo} bakıma alındı`);
                    } else {
                      showToast("Önce bir şezlong seçin");
                    }
                  },
                },
                { label: "📤 Çıkış Yaptır", action: () => { if (seciliNo) { setCikisModal(true); } else { showToast("Önce bir şezlong seçin"); } } },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="sezlong-quick-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: `1px solid ${GRAY200}`,
                    background: "white",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    color: GRAY800,
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bugün Özeti */}
          <div style={{ padding: "14px 16px" }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: GRAY400,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Bugün Özeti
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: GRAY50, borderRadius: 8, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: ORANGE }}>74</div>
                <div style={{ fontSize: 9, color: GRAY400, marginTop: 2 }}>Dolu</div>
              </div>
              <div style={{ background: GRAY50, borderRadius: 8, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: GREEN }}>41</div>
                <div style={{ fontSize: 9, color: GRAY400, marginTop: 2 }}>Boş</div>
              </div>
              <div style={{ background: GRAY50, borderRadius: 8, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>₺18K</div>
                <div style={{ fontSize: 9, color: GRAY400, marginTop: 2 }}>Gelir</div>
              </div>
              <div style={{ background: GRAY50, borderRadius: 8, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: TEAL }}>89</div>
                <div style={{ fontSize: 9, color: GRAY400, marginTop: 2 }}>Sipariş</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kilitli toast - HTML ile aynı */}
      {kilitliToastNo && (
        <div
          style={{
            position: "fixed",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#7C3AED",
            color: "white",
            padding: "12px 24px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 999,
            boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          🔒 {kilitliToastNo} — Bu şezlong işletme tarafından rezerve edilmiştir
        </div>
      )}

      {/* Grup Ekle Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              width: 400,
              maxWidth: "95vw",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 16 }}>➕ Yeni Grup Ekle</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 4 }}>Grup Adı</label>
              <input
                type="text"
                placeholder="örn: Platin, Sahil, İskele..."
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: `1.5px solid ${GRAY200}`,
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 4 }}>Şezlong Sayısı</label>
              <input
                type="number"
                placeholder="örn: 20"
                min={1}
                max={200}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: `1.5px solid ${GRAY200}`,
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 4 }}>Günlük Fiyat (₺)</label>
              <input
                type="number"
                placeholder="örn: 1500"
                min={0}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: `1.5px solid ${GRAY200}`,
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 4 }}>Konum / Açıklama</label>
              <input
                type="text"
                placeholder="örn: Denize sıfır, Gölgelik alan..."
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: `1.5px solid ${GRAY200}`,
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 4 }}>Grup Rengi</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {COLOR_OPTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSeciliRenk(c)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: c,
                      border: seciliRenk === c ? `2px solid ${NAVY}` : "2px solid transparent",
                      cursor: "pointer",
                      transform: seciliRenk === c ? "scale(1.2)" : "scale(1)",
                      transition: "all 0.15s",
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 4 }}>Ön Ödeme Tipi</label>
              <select
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: `1.5px solid ${GRAY200}`,
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                <option>Ön Ödemeli (Bakiye yüklenir)</option>
                <option>Sadece Sezlong Kiralama</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
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
                ✅ Grubu Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: NAVY, color: "white", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 500 }}>
          {toast}
        </div>
      )}

      {/* Çıkış Yaptır Onay Modal */}
      {cikisModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setCikisModal(false)}
        >
          <div
            style={{ background: "white", borderRadius: 14, width: 340, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "22px 20px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📤</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Çıkış Yaptır</h3>
              <p style={{ fontSize: 13, color: GRAY600, lineHeight: 1.5 }}>
                <strong style={{ color: NAVY }}>{seciliNo}</strong> numaralı şezlongtaki müşteriyi çıkış yaptırmak istediğinize emin misiniz?
              </p>
            </div>
            <div style={{ padding: "12px 20px 20px", display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => setCikisModal(false)} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button
                onClick={() => {
                  setCikisModal(false);
                  setSeciliDurum("bos");
                  showToast(`✅ ${seciliNo} şezlongu boşaltıldı`);
                }}
                style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}
              >
                Evet, Çıkış Yaptır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rezervasyon Oluştur Modal */}
      {rezModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setRezModal(false)}
        >
          <div
            style={{ background: "white", borderRadius: 16, width: 400, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>📋 Rezervasyon Oluştur</h3>
              <button onClick={() => setRezModal(false)} style={{ background: GRAY100, border: "none", borderRadius: 7, width: 26, height: 26, cursor: "pointer", fontSize: 13 }}>✕</button>
            </div>
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {seciliNo && (
                <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#1E40AF", fontWeight: 600 }}>
                  🏖️ Seçili Şezlong: {seciliNo}
                </div>
              )}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Müşteri Adı</label>
                <input type="text" value={rezForm.musteriAdi} onChange={(e) => setRezForm((f) => ({ ...f, musteriAdi: e.target.value }))} placeholder="Ad Soyad" style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Telefon</label>
                <input type="tel" value={rezForm.telefon} onChange={(e) => setRezForm((f) => ({ ...f, telefon: e.target.value }))} placeholder="+90 5xx xxx xx xx" style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Tarih</label>
                <input type="date" value={rezForm.tarih} onChange={(e) => setRezForm((f) => ({ ...f, tarih: e.target.value }))} style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Kişi Sayısı</label>
                <input type="number" min={1} value={rezForm.kisiSayisi} onChange={(e) => setRezForm((f) => ({ ...f, kisiSayisi: e.target.value }))} placeholder="2" style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${GRAY100}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setRezModal(false)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button
                onClick={() => {
                  setRezModal(false);
                  setRezForm({ musteriAdi: "", telefon: "", tarih: "", kisiSayisi: "" });
                  showToast("✅ Rezervasyon oluşturuldu!");
                }}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}
              >
                Rezervasyonu Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grubu Düzenle Modal */}
      {duzenleModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setDuzenleModal(null)}
        >
          <div
            style={{ background: "white", borderRadius: 14, width: 380, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>✏️ Grubu Düzenle</h3>
              <button onClick={() => setDuzenleModal(null)} style={{ background: GRAY100, border: "none", borderRadius: 7, width: 26, height: 26, cursor: "pointer", fontSize: 13 }}>✕</button>
            </div>
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Grup Adı</label>
                <input
                  type="text"
                  value={duzenleForm.name}
                  onChange={(e) => setDuzenleForm((f) => ({ ...f, name: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Şezlong Sayısı</label>
                <input
                  type="number"
                  min={1}
                  value={duzenleForm.count}
                  onChange={(e) => setDuzenleForm((f) => ({ ...f, count: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Renk</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {COLOR_OPTS.map((c) => (
                    <div
                      key={c}
                      onClick={() => setDuzenleForm((f) => ({ ...f, color: c }))}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: c,
                        cursor: "pointer",
                        border: duzenleForm.color === c ? "3px solid #0A1628" : "3px solid transparent",
                        boxSizing: "border-box",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Fiyat/gün</label>
                <input
                  type="text"
                  value={duzenleForm.fiyat}
                  onChange={(e) => setDuzenleForm((f) => ({ ...f, fiyat: e.target.value }))}
                  placeholder="₺1.000"
                  style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}
                />
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${GRAY100}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setDuzenleModal(null)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={saveDuzenle} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Grup Sil Onay Modal */}
      {silModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setSilModal(null)}
        >
          <div
            style={{ background: "white", borderRadius: 14, width: 340, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "20px 20px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Emin misiniz?</h3>
              <p style={{ fontSize: 13, color: GRAY600, lineHeight: 1.5 }}>
                <strong style={{ color: NAVY }}>{silModal.name}</strong> grubunu silmek istediğinize emin misiniz?
              </p>
            </div>
            <div style={{ padding: "12px 20px 20px", display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => setSilModal(null)} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={silGrup} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: "#EF4444", color: "white", cursor: "pointer" }}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* HTML ile aynı stiller */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes sezlong-wave {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .sezlong-wave { animation: sezlong-wave 2s ease-in-out infinite; }
          .sezlong-item:hover .sezlong-inner { transform: translateY(-3px); }
          .sezlong-kilitli:hover .sezlong-inner { transform: none; }
          .sezlong-quick-btn:hover { background: #0A1628 !important; color: white !important; border-color: #0A1628 !important; }
          .legend-item-hover:hover { background: #F8FAFC; }
          .grup-block-hover:hover { border-color: rgba(10,186,181,0.3); }
        `,
      }} />
    </div>
  );
}
