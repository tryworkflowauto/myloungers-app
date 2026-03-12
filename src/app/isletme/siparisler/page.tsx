"use client";

import { useState, useEffect } from "react";

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

type Garson = { name: string; inits: string; color: string };

type SiparisItem = {
  id: string;
  sezlong: string;
  grup: string;
  kisi: number;
  musteri: string;
  timer: string;
  timerClass: string;
  saat: string;
  bg: string;
  urunler: { adet: number; ad: string; fiyat: string }[];
  garson: Garson | null;
  tutar: string;
  isYeni: boolean;
  opacity?: number;
};

type GecmisItem = {
  id: string;
  no: string;
  urunler: string;
  sezlong: string;
  saat: string;
  garson: Garson;
  tutar: string;
  durum: string;
  tutarColor?: string;
};

const GARSONLAR: Garson[] = [
  { inits: "MG", name: "Mehmet G.", color: TEAL },
  { inits: "AT", name: "Ayşe T.", color: ORANGE },
  { inits: "CK", name: "Can K.", color: "#7C3AED" },
  { inits: "AR", name: "Ali R.", color: BLUE },
];

const INIT_YENI: SiparisItem[] = [
  { id: "Y1", sezlong: "V3", grup: "VIP", kisi: 2, musteri: "Fatma D.", timer: "2 dk", timerClass: "late", saat: "13:48", bg: "#F5821F", urunler: [{ adet: 2, ad: "Mojito", fiyat: "₺120" }, { adet: 1, ad: "Tavuk Şiş", fiyat: "₺85" }, { adet: 1, ad: "Salata", fiyat: "₺45" }], garson: null, tutar: "₺250", isYeni: true },
  { id: "Y2", sezlong: "G2", grup: "Gold", kisi: 1, musteri: "Mehmet K.", timer: "5 dk", timerClass: "warn", saat: "13:45", bg: "#8B5CF6", urunler: [{ adet: 1, ad: "Soğuk Kahve", fiyat: "₺45" }, { adet: 2, ad: "Su (0.5L)", fiyat: "₺20" }], garson: null, tutar: "₺65", isYeni: true },
  { id: "Y3", sezlong: "S22", grup: "Silver", kisi: 3, musteri: "Ahmet Y.", timer: "1 dk", timerClass: "ok", saat: "13:49", bg: "#0ABAB5", urunler: [{ adet: 3, ad: "Limonata", fiyat: "₺90" }, { adet: 1, ad: "Balık & Patates", fiyat: "₺120" }], garson: null, tutar: "₺210", isYeni: true },
];

const INIT_HAZIR: SiparisItem[] = [
  { id: "H1", sezlong: "İ5", grup: "İskele", kisi: 2, musteri: "Zeynep A.", timer: "8 dk", timerClass: "warn", saat: "13:42", bg: "#F59E0B", urunler: [{ adet: 2, ad: "Piña Colada", fiyat: "₺160" }, { adet: 1, ad: "Nachos", fiyat: "₺65" }], garson: { inits: "MG", name: "Mehmet G.", color: TEAL }, tutar: "₺225", isYeni: false },
  { id: "H2", sezlong: "V9", grup: "VIP", kisi: 3, musteri: "Selin E.", timer: "14 dk", timerClass: "late", saat: "13:36", bg: "#F5821F", urunler: [{ adet: 3, ad: "Izgara Levrek", fiyat: "₺450" }, { adet: 2, ad: "Beyaz Şarap", fiyat: "₺280" }, { adet: 1, ad: "Meze Tabağı", fiyat: "₺95" }], garson: { inits: "AT", name: "Ayşe T.", color: ORANGE }, tutar: "₺825", isYeni: false },
  { id: "H3", sezlong: "S14", grup: "Silver", kisi: 1, musteri: "Burak T.", timer: "4 dk", timerClass: "ok", saat: "13:46", bg: "#0ABAB5", urunler: [{ adet: 1, ad: "Burger", fiyat: "₺95" }, { adet: 1, ad: "Ayran", fiyat: "₺15" }], garson: { inits: "CK", name: "Can K.", color: "#7C3AED" }, tutar: "₺110", isYeni: false },
];

const INIT_TESLIM: SiparisItem[] = [
  { id: "T1", sezlong: "S8", grup: "Silver", kisi: 1, musteri: "Ali K.", timer: "✓ 9 dk", timerClass: "ok", saat: "13:38", bg: "#10B981", urunler: [{ adet: 2, ad: "Soğuk Kahve", fiyat: "₺90" }], garson: { inits: "MG", name: "Mehmet G. • 13:29→13:38", color: TEAL }, tutar: "₺90", opacity: 0.75, isYeni: false },
  { id: "T2", sezlong: "G1", grup: "Gold", kisi: 1, musteri: "Mehmet K.", timer: "✓ 7 dk", timerClass: "ok", saat: "13:22", bg: "#8B5CF6", urunler: [{ adet: 1, ad: "Izgara Levrek", fiyat: "₺150" }, { adet: 1, ad: "Rosé Şarap", fiyat: "₺180" }], garson: { inits: "AT", name: "Ayşe T. • 13:15→13:22", color: ORANGE }, tutar: "₺330", opacity: 0.75, isYeni: false },
];

const INIT_GECMIS: GecmisItem[] = [
  { id: "G1", no: "#089", urunler: "2x Soğuk Kahve", sezlong: "S-8 (Silver)", saat: "13:29 → 13:38", garson: { inits: "MG", name: "Mehmet G.", color: TEAL }, tutar: "₺90", durum: "teslim" },
  { id: "G2", no: "#088", urunler: "1x Levrek, 1x Rosé", sezlong: "G-1 (Gold)", saat: "13:15 → 13:22", garson: { inits: "AT", name: "Ayşe T.", color: ORANGE }, tutar: "₺330", durum: "teslim" },
  { id: "G3", no: "#087", urunler: "3x Limonata, 1x Salata", sezlong: "V-12 (VIP)", saat: "13:05 → 13:18", garson: { inits: "CK", name: "Can K.", color: "#7C3AED" }, tutar: "₺165", durum: "teslim" },
  { id: "G4", no: "#086", urunler: "2x Mojito", sezlong: "İ-3 (İskele)", saat: "12:50 → İptal", garson: { inits: "MG", name: "Mehmet G.", color: TEAL }, tutar: "₺120", durum: "iptal", tutarColor: RED },
];

// ── SiparisKart component ──────────────────────────────────────────────────
function SiparisKartComp({
  s, headerBg, showActions, primaryBtn, secondaryBtn,
  onCardClick, onPrimary, onSecondary,
}: {
  s: SiparisItem;
  headerBg: string;
  showActions: boolean;
  primaryBtn: string;
  secondaryBtn?: string;
  onCardClick?: () => void;
  onPrimary?: () => void;
  onSecondary?: () => void;
}) {
  return (
    <div
      className="siparis-kart"
      onClick={onCardClick}
      style={{ borderRadius: 12, border: `1.5px solid ${GRAY200}`, overflow: "hidden", cursor: "pointer", transition: "all 0.2s", opacity: s.opacity ?? 1 }}
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
          <div style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: s.timerClass === "late" ? "#FEE2E2" : s.timerClass === "warn" ? "#FEF3C7" : "#DCFCE7", color: s.timerClass === "late" ? RED : s.timerClass === "warn" ? "#D97706" : "#16A34A" }}>
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
            <span style={{ color: GRAY400 }}>Garson atanmadı</span>
          )}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>{s.tutar}</div>
      </div>
      {showActions && (
        <div style={{ padding: "8px 12px", display: "flex", gap: 6, borderTop: `1px solid ${GRAY100}` }}>
          <button
            style={{ flex: 1, padding: 7, borderRadius: 8, border: "none", background: TEAL, color: "white", cursor: "pointer", fontSize: 11, fontWeight: 600 }}
            onClick={(e) => { e.stopPropagation(); onPrimary?.(); }}
          >
            {primaryBtn}
          </button>
          <button
            style={{ flex: 1, padding: 7, borderRadius: 8, border: s.isYeni ? "none" : `1px solid ${GRAY200}`, background: s.isYeni ? "#FEE2E2" : GRAY100, color: s.isYeni ? RED : GRAY800, cursor: "pointer", fontSize: 11, fontWeight: 600 }}
            onClick={(e) => { e.stopPropagation(); onSecondary?.(); }}
          >
            {secondaryBtn ?? "Garson Değiştir"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function IsletmeSiparislerPage() {
  const [yeniList, setYeniList] = useState<SiparisItem[]>(INIT_YENI);
  const [hazirList, setHazirList] = useState<SiparisItem[]>(INIT_HAZIR);
  const [teslimList, setTeslimList] = useState<SiparisItem[]>(INIT_TESLIM);
  const [gecmisList, setGecmisList] = useState<GecmisItem[]>(INIT_GECMIS);

  const [activeTab, setActiveTab] = useState<"aktif" | "gecmis">("aktif");
  const [toast, setToast] = useState<string | null>(null);

  // Modals
  const [iptalModal, setIptalModal] = useState<{ order: SiparisItem; from: "yeni" | "hazir" } | null>(null);
  const [garsonModal, setGarsonModal] = useState<{ order: SiparisItem; from: "yeni" | "hazir" } | null>(null);
  const [detayModal, setDetayModal] = useState<SiparisItem | null>(null);

  // Filters (kanban header)
  const [filtreGrup, setFiltreGrup] = useState("");
  const [filtreGarson, setFiltreGarson] = useState("");

  // Filters (gecmis tab)
  const [gecmisArama, setGecmisArama] = useState("");
  const [gecmisTarih, setGecmisTarih] = useState("2026-03-11");
  const [gecmisGarson, setGecmisGarson] = useState("");
  const [gecmisDurum, setGecmisDurum] = useState("");

  // ESC closes all modals
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIptalModal(null); setGarsonModal(null); setDetayModal(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Actions ──────────────────────────────────────────────────────────────
  function hazirlamaAl(order: SiparisItem) {
    setYeniList((p) => p.filter((x) => x.id !== order.id));
    setHazirList((p) => [{ ...order, isYeni: false, timer: "0 dk", timerClass: "ok" }, ...p]);
    showToast("🍳 Sipariş hazırlamaya alındı!");
  }

  function teslimEt(order: SiparisItem) {
    setHazirList((p) => p.filter((x) => x.id !== order.id));
    const teslimItem: SiparisItem = { ...order, opacity: 0.75, timer: "✓ " + order.timer, timerClass: "ok" };
    setTeslimList((p) => [teslimItem, ...p]);
    // Add to gecmis
    const nextNo = "#" + String(gecmisList.length + 90).padStart(3, "0");
    const newGecmis: GecmisItem = {
      id: "NEW_" + Date.now(),
      no: nextNo,
      urunler: order.urunler.map((u) => `${u.adet}x ${u.ad}`).join(", "),
      sezlong: `${order.sezlong} (${order.grup})`,
      saat: `${order.saat} → Teslim`,
      garson: order.garson ?? { inits: "—", name: "Atanmadı", color: GRAY400 },
      tutar: order.tutar,
      durum: "teslim",
    };
    setGecmisList((p) => [newGecmis, ...p]);
    showToast("✅ Sipariş teslim edildi!");
  }

  function iptalOnayla() {
    if (!iptalModal) return;
    const { order, from } = iptalModal;
    if (from === "yeni") setYeniList((p) => p.filter((x) => x.id !== order.id));
    if (from === "hazir") setHazirList((p) => p.filter((x) => x.id !== order.id));
    const nextNo = "#" + String(gecmisList.length + 90).padStart(3, "0");
    const newGecmis: GecmisItem = {
      id: "IPT_" + Date.now(),
      no: nextNo,
      urunler: order.urunler.map((u) => `${u.adet}x ${u.ad}`).join(", "),
      sezlong: `${order.sezlong} (${order.grup})`,
      saat: `${order.saat} → İptal`,
      garson: order.garson ?? { inits: "—", name: "Atanmadı", color: GRAY400 },
      tutar: order.tutar,
      durum: "iptal",
      tutarColor: RED,
    };
    setGecmisList((p) => [newGecmis, ...p]);
    setIptalModal(null);
    showToast("❌ Sipariş iptal edildi.");
  }

  function garsonAta(garson: Garson) {
    if (!garsonModal) return;
    const { order, from } = garsonModal;
    const updater = (p: SiparisItem[]) => p.map((x) => x.id === order.id ? { ...x, garson } : x);
    if (from === "yeni") setYeniList(updater);
    if (from === "hazir") setHazirList(updater);
    setGarsonModal(null);
    showToast(`👤 Garson güncellendi: ${garson.name}`);
  }

  function csvIndir() {
    const headers = ["Sezlong", "Müşteri", "Grup", "Ürünler", "Tutar", "Garson", "Saat", "Durum"];
    const rows = [
      ...teslimList.map((s) => [s.sezlong, s.musteri, s.grup, s.urunler.map((u) => `${u.adet}x ${u.ad}`).join("; "), s.tutar, s.garson?.name ?? "—", s.saat, "Teslim Edildi"]),
      ...gecmisList.filter((g) => g.durum === "teslim").map((g) => [g.sezlong, "—", "—", g.urunler, g.tutar, g.garson.name, g.saat, "Teslim Edildi"]),
    ];
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "siparisler-bugun.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Filter helpers ────────────────────────────────────────────────────────
  function applyKanbanFilter(list: SiparisItem[]) {
    return list.filter((s) => {
      if (filtreGrup && s.grup !== filtreGrup) return false;
      if (filtreGarson && s.garson?.name !== filtreGarson) return false;
      return true;
    });
  }

  const filteredYeni = applyKanbanFilter(yeniList);
  const filteredHazir = applyKanbanFilter(hazirList);
  const filteredTeslim = applyKanbanFilter(teslimList);

  const filteredGecmis = gecmisList.filter((g) => {
    if (gecmisArama) {
      const q = gecmisArama.toLowerCase();
      if (!g.sezlong.toLowerCase().includes(q) && !g.urunler.toLowerCase().includes(q) && !g.no.includes(q)) return false;
    }
    if (gecmisGarson && g.garson.name !== gecmisGarson) return false;
    if (gecmisDurum && g.durum !== gecmisDurum) return false;
    return true;
  });

  const inputStyle: React.CSSProperties = { padding: "7px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12, outline: "none" };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", flexDirection: "column", minHeight: "100%" }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, background: NAVY, color: "white", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", transition: "all 0.3s" }}>
          {toast}
        </div>
      )}

      {/* TOPBAR */}
      <header style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Siparişler</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>11 Mart 2026 • <span style={{ color: GREEN, fontWeight: 700 }}>● Canlı</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={csvIndir} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>
            📥 Bugünü İndir
          </button>
          <select
            value={filtreGrup}
            onChange={(e) => setFiltreGrup(e.target.value)}
            style={{ ...inputStyle, border: `1px solid ${filtreGrup ? TEAL : GRAY200}` }}
          >
            <option value="">Tüm Gruplar</option>
            <option value="Gold">Gold</option>
            <option value="VIP">VIP</option>
            <option value="İskele">İskele</option>
            <option value="Silver">Silver</option>
          </select>
          <select
            value={filtreGarson}
            onChange={(e) => setFiltreGarson(e.target.value)}
            style={{ ...inputStyle, border: `1px solid ${filtreGarson ? TEAL : GRAY200}` }}
          >
            <option value="">Tüm Garsonlar</option>
            {GARSONLAR.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
          </select>
          {(filtreGrup || filtreGarson) && (
            <button onClick={() => { setFiltreGrup(""); setFiltreGarson(""); }} style={{ padding: "7px 10px", borderRadius: 8, fontSize: 12, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY600, cursor: "pointer" }}>
              ✕
            </button>
          )}
        </div>
      </header>

      <div style={{ padding: "20px 24px", flex: 1 }}>
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { icon: "🆕", val: String(yeniList.length), lbl: "Yeni Sipariş", valColor: YELLOW, iconBg: "#FEF3C7" },
            { icon: "🍳", val: String(hazirList.length), lbl: "Hazırlanıyor", valColor: BLUE, iconBg: "#DBEAFE" },
            { icon: "✅", val: String(gecmisList.filter((g) => g.durum === "teslim").length + teslimList.length), lbl: "Teslim Edildi", valColor: GREEN, iconBg: "#DCFCE7" },
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
          <button
            onClick={() => setActiveTab("aktif")}
            style={{ padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: activeTab === "aktif" ? NAVY : GRAY600, background: activeTab === "aktif" ? "white" : "transparent", boxShadow: activeTab === "aktif" ? "0 1px 4px rgba(0,0,0,0.1)" : "none", border: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" }}
          >
            Aktif{" "}
            <span style={{ display: "inline-block", background: RED, color: "white", fontSize: 10, padding: "1px 6px", borderRadius: 10, marginLeft: 4 }}>
              {yeniList.length + hazirList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("gecmis")}
            style={{ padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: activeTab === "gecmis" ? NAVY : GRAY600, background: activeTab === "gecmis" ? "white" : "transparent", boxShadow: activeTab === "gecmis" ? "0 1px 4px rgba(0,0,0,0.1)" : "none", border: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" }}
          >
            Tamamlanan{" "}
            <span style={{ display: "inline-block", background: activeTab === "gecmis" ? TEAL : GRAY200, color: activeTab === "gecmis" ? "white" : GRAY800, fontSize: 10, padding: "1px 6px", borderRadius: 10, marginLeft: 4 }}>
              {gecmisList.length + teslimList.length}
            </span>
          </button>
        </div>

        {/* AKTİF - KANBAN */}
        {activeTab === "aktif" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, alignItems: "start" }}>
            {/* Yeni Siparişler */}
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #F59E0B", background: "#FFFBEB" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>🆕 Yeni Siparişler</h3>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "#FEF3C7", color: "#92400E" }}>{filteredYeni.length}</span>
              </div>
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
                {filteredYeni.length === 0 && <div style={{ textAlign: "center", color: GRAY400, fontSize: 12, padding: 20 }}>Sipariş yok</div>}
                {filteredYeni.map((s) => (
                  <SiparisKartComp
                    key={s.id} s={s} headerBg="#FFFBEB" showActions primaryBtn="✓ Hazırlamaya Al" secondaryBtn="✖ İptal"
                    onCardClick={() => setDetayModal(s)}
                    onPrimary={() => hazirlamaAl(s)}
                    onSecondary={() => setIptalModal({ order: s, from: "yeni" })}
                  />
                ))}
              </div>
            </div>

            {/* Hazırlanıyor */}
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #3B82F6", background: "#EFF6FF" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1E40AF" }}>🍳 Hazırlanıyor</h3>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "#DBEAFE", color: "#1E40AF" }}>{filteredHazir.length}</span>
              </div>
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
                {filteredHazir.length === 0 && <div style={{ textAlign: "center", color: GRAY400, fontSize: 12, padding: 20 }}>Sipariş yok</div>}
                {filteredHazir.map((s) => (
                  <SiparisKartComp
                    key={s.id} s={s} headerBg="#EFF6FF" showActions primaryBtn="🛵 Teslim Et" secondaryBtn="Garson Değiştir"
                    onCardClick={() => setDetayModal(s)}
                    onPrimary={() => teslimEt(s)}
                    onSecondary={() => setGarsonModal({ order: s, from: "hazir" })}
                  />
                ))}
              </div>
            </div>

            {/* Teslim Edildi */}
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #10B981", background: "#F0FDF4" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>✅ Teslim Edildi</h3>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "#DCFCE7", color: "#166534" }}>{gecmisList.filter((g) => g.durum === "teslim").length + teslimList.length} bugün</span>
              </div>
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
                {filteredTeslim.map((s) => (
                  <SiparisKartComp
                    key={s.id} s={s} headerBg="#F0FDF4" showActions={false} primaryBtn="" secondaryBtn=""
                    onCardClick={() => setDetayModal(s)}
                  />
                ))}
                <div style={{ textAlign: "center", padding: 10 }}>
                  <button onClick={() => setActiveTab("gecmis")} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>
                    Tümünü Gör ({gecmisList.length + teslimList.length}) →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GEÇMİŞ */}
        {activeTab === "gecmis" && (
          <>
            <div style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <input
                type="text"
                value={gecmisArama}
                onChange={(e) => setGecmisArama(e.target.value)}
                placeholder="🔍  Şezlong no, sipariş no, ürün..."
                style={{ flex: 1, minWidth: 180, padding: "7px 12px", border: `1px solid ${gecmisArama ? TEAL : GRAY200}`, borderRadius: 8, fontSize: 12, outline: "none" }}
              />
              <input
                type="date"
                value={gecmisTarih}
                onChange={(e) => setGecmisTarih(e.target.value)}
                style={{ padding: "7px 12px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }}
              />
              <select
                value={gecmisGarson}
                onChange={(e) => setGecmisGarson(e.target.value)}
                style={{ padding: "7px 12px", border: `1px solid ${gecmisGarson ? TEAL : GRAY200}`, borderRadius: 8, fontSize: 12 }}
              >
                <option value="">Tüm Garsonlar</option>
                {GARSONLAR.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
              </select>
              <select
                value={gecmisDurum}
                onChange={(e) => setGecmisDurum(e.target.value)}
                style={{ padding: "7px 12px", border: `1px solid ${gecmisDurum ? TEAL : GRAY200}`, borderRadius: 8, fontSize: 12 }}
              >
                <option value="">Tüm Durumlar</option>
                <option value="teslim">Teslim Edildi</option>
                <option value="iptal">İptal</option>
              </select>
              {(gecmisArama || gecmisGarson || gecmisDurum) && (
                <button
                  onClick={() => { setGecmisArama(""); setGecmisGarson(""); setGecmisDurum(""); }}
                  style={{ padding: "7px 12px", borderRadius: 8, fontSize: 12, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY600, cursor: "pointer" }}
                >
                  🔄 Sıfırla
                </button>
              )}
            </div>

            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 100px 120px 100px 100px", padding: "12px 16px", background: GRAY50, borderBottom: `1px solid ${GRAY200}`, gap: 8 }}>
                {["#", "Ürünler", "Şezlong", "Saat", "Garson", "Tutar", "Durum"].map((th) => (
                  <div key={th} style={{ fontSize: 11, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5 }}>{th}</div>
                ))}
              </div>
              {filteredGecmis.length === 0 ? (
                <div style={{ padding: "30px 16px", textAlign: "center", color: GRAY400, fontSize: 13 }}>Sonuç bulunamadı.</div>
              ) : (
                filteredGecmis.map((r) => (
                  <div key={r.id} className="gecmis-row" style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 100px 120px 100px 100px", padding: "12px 16px", borderBottom: `1px solid ${GRAY100}`, gap: 8, alignItems: "center", fontSize: 12 }}>
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
                ))
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, padding: "0 4px" }}>
              <div style={{ fontSize: 12, color: GRAY400 }}>{filteredGecmis.length} sipariş gösteriliyor</div>
            </div>
          </>
        )}
      </div>

      {/* ── DETAY MODAL ───────────────────────────────────────────────────── */}
      {detayModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setDetayModal(null)}>
          <div style={{ background: "white", borderRadius: 16, width: 420, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{ background: detayModal.bg, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "white" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>
                  {detayModal.sezlong}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{detayModal.musteri}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>{detayModal.grup} • {detayModal.kisi} kişi</div>
                </div>
              </div>
              <button onClick={() => setDetayModal(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            {/* Body */}
            <div style={{ padding: 20, overflowY: "auto" }}>
              {/* Ürünler */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Sipariş İçeriği</div>
                <div style={{ background: GRAY50, borderRadius: 10, overflow: "hidden" }}>
                  {detayModal.urunler.map((u, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < detayModal.urunler.length - 1 ? `1px solid ${GRAY100}` : "none" }}>
                      <div style={{ width: 28, height: 28, background: NAVY, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}>{u.adet}</div>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: GRAY800 }}>{u.ad}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{u.fiyat}</div>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: GRAY100 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: GRAY600 }}>Toplam</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: TEAL }}>{detayModal.tutar}</span>
                  </div>
                </div>
              </div>
              {/* Bilgiler */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  { label: "Sipariş Saati", val: detayModal.saat },
                  { label: "Süre (tahmini)", val: detayModal.timer },
                  { label: "Grup", val: detayModal.grup },
                  { label: "Kişi Sayısı", val: String(detayModal.kisi) },
                ].map((item) => (
                  <div key={item.label} style={{ background: GRAY50, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: GRAY400, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{item.val}</div>
                  </div>
                ))}
              </div>
              {/* Garson */}
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Garson</div>
                {detayModal.garson ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: GRAY50, borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: detayModal.garson.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white" }}>{detayModal.garson.inits}</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{detayModal.garson.name}</span>
                  </div>
                ) : (
                  <div style={{ background: "#FEF3C7", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#92400E" }}>⚠️ Garson henüz atanmadı</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── İPTAL ONAY MODAL ─────────────────────────────────────────────── */}
      {iptalModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setIptalModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 380, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Sipariş İptal Edilsin mi?</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 6 }}>Bu işlem geri alınamaz.</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 22 }}>
              {iptalModal.order.sezlong} — {iptalModal.order.musteri}
            </p>
            <div style={{ background: GRAY50, borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
              {iptalModal.order.urunler.map((u, i) => (
                <div key={i} style={{ fontSize: 12, color: GRAY600 }}>{u.adet}x {u.ad} — {u.fiyat}</div>
              ))}
              <div style={{ fontSize: 14, fontWeight: 700, color: RED, marginTop: 6 }}>{iptalModal.order.tutar}</div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setIptalModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>
                Vazgeç
              </button>
              <button onClick={iptalOnayla} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", background: RED, color: "white", cursor: "pointer" }}>
                ✖ Evet, İptal Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GARSON DEĞİŞTİR MODAL ────────────────────────────────────────── */}
      {garsonModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setGarsonModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: 360, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>👤 Garson Değiştir</h3>
              <button onClick={() => setGarsonModal(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: GRAY400 }}>✕</button>
            </div>
            <div style={{ fontSize: 12, color: GRAY600, marginBottom: 14, background: GRAY50, padding: "8px 12px", borderRadius: 8 }}>
              <strong>{garsonModal.order.sezlong}</strong> — {garsonModal.order.musteri}
              {garsonModal.order.garson && (
                <span style={{ color: GRAY400 }}> (Mevcut: {garsonModal.order.garson.name})</span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {GARSONLAR.map((g) => {
                const isCurrent = garsonModal.order.garson?.name === g.name;
                return (
                  <button
                    key={g.name}
                    onClick={() => garsonAta(g)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, border: isCurrent ? `2px solid ${TEAL}` : `1px solid ${GRAY200}`, background: isCurrent ? "rgba(10,186,181,0.06)" : "white", cursor: "pointer", transition: "all 0.15s" }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: g.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}>{g.inits}</div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: NAVY, flex: 1, textAlign: "left" }}>{g.name}</span>
                    {isCurrent && <span style={{ fontSize: 11, color: TEAL, fontWeight: 700 }}>● Mevcut</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .siparis-kart:hover { border-color: #0ABAB5 !important; box-shadow: 0 2px 12px rgba(10,186,181,0.15); }
          .gecmis-row:hover { background: #F8FAFC !important; }
        `,
      }} />
    </div>
  );
}
