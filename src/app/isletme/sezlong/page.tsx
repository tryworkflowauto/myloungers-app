"use client";

import { useState } from "react";
import { Plus, Save } from "lucide-react";

const NAVY = "#0A1628";
const TEAL = "#0ABAB5";
const ORANGE = "#F5821F";
const GREEN = "#10B981";
const RED = "#EF4444";
const YELLOW = "#F59E0B";
const BLUE = "#3B82F6";
const GRAY50 = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const PURPLE = "#7C3AED";
const GOLD_PURPLE = "#8B5CF6";

// TODO: API'den çekilecek
const LEGEND_ITEMS = [
  { emoji: "🟢", label: "Boş", sub: "Rezervasyon yapılabilir", count: 41, color: GREEN },
  { emoji: "🟠", label: "Dolu", sub: "Aktif müşteri var", count: 74, color: ORANGE },
  { emoji: "🔵", label: "Rezerve", sub: "Gelecek rezervasyon", count: 8, color: BLUE },
  { emoji: "⚪", label: "Bakımda", sub: "Geçici kapalı", count: 10, color: GRAY400 },
  { emoji: "🔒", label: "İşletme Rezervi", sub: "Satın alınamaz", count: 7, color: PURPLE },
];

const MOCK_GRUPLAR = [
  { name: "Silver", count: 55, color: TEAL, dolu: 38, bos: 17, fiyat: "₺1.000", doluluk: "69%" },
  { name: "VIP", count: 40, color: ORANGE, dolu: 28, bos: 12, fiyat: "₺1.500", doluluk: "70%" },
  { name: "İskele", count: 20, color: YELLOW, dolu: 8, bos: 12, fiyat: "₺1.250", doluluk: "40%" },
  { name: "Gold", count: 10, color: GOLD_PURPLE, dolu: 10, bos: 0, fiyat: "₺2.000", doluluk: "100%" },
];

const DURUM_LABELS: Record<string, string> = {
  bos: "Boş",
  dolu: "Dolu",
  rezerve: "Rezerve",
  bakim: "Bakımda",
  kilitli: "İşletme Rezervi",
};

// TODO: API'den çekilecek
const GRUP_DATA: Record<string, { prefix: string; count: number; color: string; durumlar: string[] }> = {
  gold: {
    prefix: "G",
    count: 10,
    color: GOLD_PURPLE,
    durumlar: ["dolu", "dolu", "dolu", "kilitli", "dolu", "dolu", "dolu", "kilitli", "dolu", "dolu"],
  },
  iskele: {
    prefix: "İ",
    count: 20,
    color: YELLOW,
    durumlar: [
      "dolu", "dolu", "bos", "dolu", "rezerve", "bos", "dolu", "bos", "dolu", "kilitli",
      "dolu", "bos", "rezerve", "bos", "dolu", "bakim", "bos", "kilitli", "bos", "bos",
    ],
  },
  vip: {
    prefix: "V",
    count: 40,
    color: ORANGE,
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
    color: TEAL,
    durumlar: Array.from({ length: 55 }, (_, i) =>
      i % 9 === 0 ? "kilitli" : i % 7 === 0 ? "bakim" : i % 5 === 0 ? "rezerve" : i % 3 === 0 ? "bos" : "dolu"
    ),
  },
};

const MAP_GRUPLAR = [
  { key: "gold", title: "Gold", sub: "Denize Sıfır VIP", icon: "⭐", gradient: "linear-gradient(135deg,#7C3AED,#8B5CF6)", doluluk: "100% Dolu" },
  { key: "iskele", title: "İskele", sub: "Ahşap Platform", icon: "⚓", gradient: "linear-gradient(135deg,#D97706,#F59E0B)", doluluk: "40% Dolu" },
  { key: "vip", title: "VIP", sub: "Birinci Sıra", icon: "🔥", gradient: "linear-gradient(135deg,#EA580C,#F5821F)", doluluk: "70% Dolu" },
  { key: "silver", title: "Silver", sub: "Standart Bölge", icon: "🌊", gradient: "linear-gradient(135deg,#0891B2,#0ABAB5)", doluluk: "69% Dolu" },
];

const RENK_OPTS = ["#0ABAB5", "#F5821F", "#F59E0B", "#8B5CF6", "#EF4444", "#10B981", "#3B82F6", "#EC4899", "#0A1628"];

export default function IsletmeSezlongPage() {
  const [seciliNo, setSeciliNo] = useState<string | null>(null);
  const [seciliGrup, setSeciliGrup] = useState<string | null>(null);
  const [seciliDurum, setSeciliDurum] = useState<string>("bos");
  const [grupRenk, setGrupRenk] = useState<string>(TEAL);
  const [modalOpen, setModalOpen] = useState(false);
  const [kilitliToast, setKilitliToast] = useState(false);

  function handleSezlongClick(no: string, grupKey: string, durum: string) {
    if (durum === "kilitli") {
      setKilitliToast(true);
      setTimeout(() => setKilitliToast(false), 2500);
      return;
    }
    setSeciliNo(no);
    setSeciliGrup(grupKey);
    setSeciliDurum(durum);
  }

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800 }}
    >
      {/* TOPBAR */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between"
        style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60 }}
      >
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Şezlong Haritası</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>125 şezlong • 74 dolu • 41 boş • 10 bakımda</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border transition-colors"
            style={{ padding: "8px 14px", fontSize: 12, fontWeight: 600, background: GRAY100, color: GRAY800, border: `1px solid ${GRAY200}` }}
          >
            <Plus size={14} />
            Grup Ekle
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg text-white"
            style={{ padding: "8px 14px", fontSize: 12, fontWeight: 600, background: TEAL }}
          >
            <Save size={14} />
            Değişiklikleri Kaydet
          </button>
          <select
            style={{ padding: "7px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }}
          >
            <option>Düzenleme Modu</option>
            <option>Görüntüleme Modu</option>
            <option>Müşteri Görünümü</option>
          </select>
        </div>
      </header>

      {/* PAGE LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* SOL ARAÇ PANELİ */}
        <div
          style={{
            width: 280,
            background: "white",
            borderRight: `1px solid ${GRAY200}`,
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <div style={{ padding: 16, borderBottom: `1px solid ${GRAY100}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>
              Durum Göstergesi
            </div>
            <div className="flex flex-col gap-2">
              {LEGEND_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ padding: "8px 10px" }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                    style={{
                      background: item.emoji === "🟢" ? "#DCFCE7" : item.emoji === "🟠" ? "#FFEDD5" : item.emoji === "🔵" ? "#DBEAFE" : item.emoji === "⚪" ? "#F1F5F9" : "#EDE9FE",
                      border: `2px solid ${item.emoji === "🟢" ? "#86EFAC" : item.emoji === "🟠" ? "#FB923C" : item.emoji === "🔵" ? "#60A5FA" : item.emoji === "⚪" ? "#CBD5E1" : "#7C3AED"}`,
                      borderStyle: item.emoji === "🔒" ? "dashed" : "solid",
                    }}
                  >
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: GRAY400 }}>{item.sub}</div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: item.color }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 16, borderBottom: `1px solid ${GRAY100}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>
              Gruplar
            </div>
            <div className="flex flex-col gap-2">
              {MOCK_GRUPLAR.map((g) => (
                <div
                  key={g.name}
                  className="rounded-[10px] overflow-hidden"
                  style={{ border: `1.5px solid ${g.color}` }}
                >
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <div className="w-3 h-3 rounded flex-shrink-0" style={{ background: g.color }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, flex: 1 }}>{g.name}</span>
                    <span style={{ fontSize: 11, color: GRAY400 }}>{g.count} şezlong</span>
                    <div className="flex gap-1">
                      <button className="w-6 h-6 rounded-md flex items-center justify-center text-[11px]" style={{ background: GRAY100 }}>✏️</button>
                      <button className="w-6 h-6 rounded-md flex items-center justify-center text-[11px]" style={{ background: GRAY100 }}>🗑️</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 px-3 pb-2.5">
                    <div className="rounded-md p-1.5" style={{ background: GRAY50 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ORANGE }}>{g.dolu}</div>
                      <div style={{ fontSize: 9, color: GRAY400 }}>Dolu</div>
                    </div>
                    <div className="rounded-md p-1.5" style={{ background: GRAY50 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>{g.bos}</div>
                      <div style={{ fontSize: 9, color: GRAY400 }}>Boş</div>
                    </div>
                    <div className="rounded-md p-1.5" style={{ background: GRAY50 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{g.fiyat}</div>
                      <div style={{ fontSize: 9, color: GRAY400 }}>Fiyat/gün</div>
                    </div>
                    <div className="rounded-md p-1.5" style={{ background: GRAY50 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{g.doluluk}</div>
                      <div style={{ fontSize: 9, color: GRAY400 }}>Doluluk</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 16, borderBottom: `1px solid ${GRAY100}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>
              Tarih & Filtre
            </div>
            <input type="date" defaultValue="2026-03-11" className="w-full mb-2 rounded-lg border px-2.5 py-2 text-sm" style={{ borderColor: GRAY200 }} />
            <select className="w-full mb-2 rounded-lg border px-2.5 py-2 text-sm" style={{ borderColor: GRAY200 }}>
              <option>Tüm Gruplar</option>
              <option>Silver</option>
              <option>VIP</option>
              <option>İskele</option>
              <option>Gold</option>
            </select>
            <select className="w-full rounded-lg border px-2.5 py-2 text-sm" style={{ borderColor: GRAY200 }}>
              <option>Tüm Durumlar</option>
              <option>Sadece Boş</option>
              <option>Sadece Dolu</option>
              <option>Rezerve</option>
              <option>Bakımda</option>
            </select>
          </div>
        </div>

        {/* HARİTA ALANI */}
        <div className="flex-1 flex flex-col overflow-auto">
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
              className="flex items-center gap-3"
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "rgba(255,255,255,0.9)",
                letterSpacing: 6,
                textTransform: "uppercase",
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              <span className="animate-bounce">🌊</span>
              <span>D E N İ Z</span>
              <span className="animate-bounce">🌊</span>
            </div>
          </div>

          <div style={{ flex: 1, padding: 24, minHeight: 500 }}>
            {MAP_GRUPLAR.map((mg) => {
              const g = GRUP_DATA[mg.key];
              if (!g) return null;
              return (
                <div
                  key={mg.key}
                  className="mb-5 rounded-[14px] overflow-hidden border-2 border-transparent hover:border-teal-300/30 transition-colors"
                >
                  <div
                    className="flex items-center gap-2.5 px-4 py-2.5 text-white"
                    style={{ background: mg.gradient }}
                  >
                    <strong style={{ fontSize: 13, flex: 1 }}>{mg.icon} {mg.title} — {mg.sub}</strong>
                    <span style={{ fontSize: 11, opacity: 0.8 }}>{g.count} şezlong</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background: "rgba(255,255,255,0.2)",
                        padding: "3px 10px",
                        borderRadius: 20,
                      }}
                    >
                      {mg.doluluk}
                    </span>
                  </div>
                  <div style={{ background: "white", padding: 16 }}>
                    <div className="flex flex-wrap gap-2">
                      {g.durumlar.map((durum, i) => {
                        const no = `${g.prefix}${i + 1}`;
                        const isSecili = seciliNo === no && seciliGrup === mg.key;
                        return (
                          <div
                            key={no}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSezlongClick(no, mg.key, durum)}
                            className="sez"
                            style={{
                              cursor: durum === "kilitli" ? "not-allowed" : "pointer",
                              ...(isSecili && {
                                outline: `2px solid ${TEAL}`,
                                outlineOffset: 2,
                                borderRadius: 6,
                              }),
                            }}
                            title={`${no} — ${DURUM_LABELS[durum]}`}
                          >
                            <div
                              className="flex flex-col items-center gap-0.5 transition-transform hover:translate-y-[-3px]"
                              style={{ width: 52 }}
                            >
                              <div
                                className="w-11 h-9 rounded flex items-center justify-center relative"
                                style={{
                                  background: durum === "bos" ? "#DCFCE7" : durum === "dolu" ? "#FFEDD5" : durum === "rezerve" ? "#DBEAFE" : durum === "bakim" ? "#F1F5F9" : "#EDE9FE",
                                  border: `2px ${durum === "kilitli" ? "dashed" : "solid"} ${durum === "bos" ? "#86EFAC" : durum === "dolu" ? "#FB923C" : durum === "rezerve" ? "#60A5FA" : durum === "bakim" ? "#CBD5E1" : "#7C3AED"}`,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 9,
                                    fontWeight: 800,
                                    color: durum === "bos" ? "#16A34A" : durum === "dolu" ? "#EA580C" : durum === "rezerve" ? "#2563EB" : durum === "bakim" ? "#94A3B8" : "#7C3AED",
                                  }}
                                >
                                  {durum === "kilitli" ? "🔒" : no}
                                </span>
                                {durum === "dolu" && (
                                  <span
                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px]"
                                    style={{ background: ORANGE }}
                                  >
                                    👤
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SAĞ BİLGİ PANELİ */}
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
            <div
              className="rounded-xl p-3.5 mb-2.5"
              style={{ background: GRAY50 }}
            >
              <div style={{ fontSize: 28, fontWeight: 900, color: NAVY, marginBottom: 4 }}>
                {seciliNo ?? "—"}
              </div>
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-2.5"
                style={{ background: "white" }}
              >
                <div
                  className="w-2 h-2 rounded-sm"
                  style={{
                    background: seciliGrup ? GRUP_DATA[seciliGrup]?.color ?? "#ccc" : "#ccc",
                  }}
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: NAVY }}>
                  {seciliGrup ? seciliGrup.charAt(0).toUpperCase() + seciliGrup.slice(1) : "Seçilmedi"}
                </span>
              </div>
              <select
                value={seciliDurum}
                onChange={(e) => setSeciliDurum(e.target.value)}
                className="w-full rounded-lg border px-2.5 py-2 text-sm mb-2"
                style={{ borderColor: GRAY200 }}
              >
                <option value="bos">🟢 Boş</option>
                <option value="dolu">🟠 Dolu</option>
                <option value="rezerve">🔵 Rezerve</option>
                <option value="bakim">⚪ Bakımda</option>
                <option value="kilitli">🔒 İşletme Rezervi</option>
              </select>
              <button
                className="w-full py-2 rounded-lg text-white text-[11px] font-semibold flex items-center justify-center gap-1.5"
                style={{ background: TEAL }}
              >
                💾 Kaydet
              </button>
            </div>

            {seciliDurum === "dolu" && seciliNo && (
              <div
                className="rounded-[10px] p-3 border"
                style={{ background: "white", borderColor: GRAY200 }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Ahmet Yılmaz</div>
                <div style={{ fontSize: 11, color: GRAY400, marginBottom: 2 }}>📱 Giriş: 10:30</div>
                <div style={{ fontSize: 11, color: GRAY400, marginBottom: 2 }}>⏱️ Süre: 3 saat 20 dk</div>
                <div style={{ fontSize: 11, color: GRAY400, marginBottom: 2 }}>🍽️ Sipariş: 3 adet</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: TEAL, marginTop: 8 }}>₺1.350 Bakiye</div>
              </div>
            )}
          </div>

          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${GRAY100}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>
              Hızlı İşlemler
            </div>
            <div className="flex flex-col gap-1.5">
              {["📋 Rezervasyon Yap", "🍽️ Sipariş Gör", "💰 Bakiye Gör", "🔧 Bakıma Al", "📤 Çıkış Yaptır"].map((label) => (
                <button
                  key={label}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors"
                  style={{ borderColor: GRAY200, background: "white", color: GRAY800 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = GRAY800; }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>
              Bugün Özeti
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg p-2.5 text-center" style={{ background: GRAY50 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: ORANGE }}>74</div>
                <div style={{ fontSize: 9, color: GRAY400 }}>Dolu</div>
              </div>
              <div className="rounded-lg p-2.5 text-center" style={{ background: GRAY50 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: GREEN }}>41</div>
                <div style={{ fontSize: 9, color: GRAY400 }}>Boş</div>
              </div>
              <div className="rounded-lg p-2.5 text-center" style={{ background: GRAY50 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>₺18K</div>
                <div style={{ fontSize: 9, color: GRAY400 }}>Gelir</div>
              </div>
              <div className="rounded-lg p-2.5 text-center" style={{ background: GRAY50 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: TEAL }}>89</div>
                <div style={{ fontSize: 9, color: GRAY400 }}>Sipariş</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KİLİTLİ TOAST */}
      {kilitliToast && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2 rounded-xl px-6 py-3 text-white text-sm font-semibold shadow-lg transition-opacity"
          style={{ background: PURPLE, boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}
        >
          🔒 Bu şezlong işletme tarafından rezerve edilmiştir
        </div>
      )}

      {/* GRUP EKLE MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-[400px] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 16 }}>➕ Yeni Grup Ekle</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Grup Adı</label>
                <input type="text" placeholder="örn: Platin, Sahil, İskele..." className="w-full px-3 py-2 rounded-lg border text-[13px]" style={{ borderColor: GRAY200 }} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Şezlong Sayısı</label>
                <input type="number" placeholder="örn: 20" min={1} max={200} className="w-full px-3 py-2 rounded-lg border text-[13px]" style={{ borderColor: GRAY200 }} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Günlük Fiyat (₺)</label>
                <input type="number" placeholder="örn: 1500" min={0} className="w-full px-3 py-2 rounded-lg border text-[13px]" style={{ borderColor: GRAY200 }} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Konum / Açıklama</label>
                <input type="text" placeholder="örn: Denize sıfır, Gölgelik alan..." className="w-full px-3 py-2 rounded-lg border text-[13px]" style={{ borderColor: GRAY200 }} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-2">Grup Rengi</label>
                <div className="flex gap-1.5 flex-wrap">
                  {RENK_OPTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setGrupRenk(c)}
                      className="w-[22px] h-[22px] rounded-md border-2 transition-all"
                      style={{
                        background: c,
                        borderColor: grupRenk === c ? NAVY : "transparent",
                        transform: grupRenk === c ? "scale(1.2)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Ön Ödeme Tipi</label>
                <select className="w-full px-3 py-2 rounded-lg border text-[13px]" style={{ borderColor: GRAY200 }}>
                  <option>Ön Ödemeli (Bakiye yüklenir)</option>
                  <option>Sadece Sezlong Kiralama</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: GRAY100, color: GRAY800, border: `1px solid ${GRAY200}` }}
              >
                İptal
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: TEAL }}
              >
                ✅ Grubu Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
