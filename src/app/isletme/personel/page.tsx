"use client";

import { useState, useEffect } from "react";

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
const RED = "#EF4444";
const PURPLE = "#7C3AED";
const BLUE = "#3B82F6";

type RolType = "mudur" | "garson" | "mutfak" | "ozel";

const ROL_STYLES: Record<RolType, { bg: string; color: string }> = {
  mudur: { bg: "#F5F3FF", color: PURPLE },
  garson: { bg: "#DBEAFE", color: BLUE },
  mutfak: { bg: "#FEF3C7", color: "#92400E" },
  ozel: { bg: "#DCFCE7", color: "#166534" },
};
const ROL_LABELS: Record<RolType, string> = {
  mudur: "👑 Müdür", garson: "🛵 Garson", mutfak: "👨‍🍳 Mutfak", ozel: "⚙️ Özel Yetki",
};

const SEZ_TAG_STYLES: Record<string, { bg: string; color: string }> = {
  default: { bg: GRAY100, color: NAVY },
  vip: { bg: "#FFEDD5", color: "#C2410C" },
  gold: { bg: "#F5F3FF", color: PURPLE },
  iskele: { bg: "#FEF3C7", color: "#92400E" },
};

type PersonelStat = { v: string; l: string; vColor?: string };

type Personel = {
  id: number;
  inits: string;
  name: string;
  phone: string;
  rol: RolType;
  rolLabel: string;
  avatarBg: string;
  online: boolean;
  stats: PersonelStat[];
  sezlonglar: string[] | null;
  sezlongTitle: string | null;
  sezlongTags?: string[];
  sezlongOzel?: string[];
  noSezlong?: boolean;
  yetkiler: string[];
  yetkiKilitli: string[];
  aktif: boolean;
};

const INIT_PERSONELLER: Personel[] = [
  { id: 1, inits: "ES", name: "Emre Şahin", phone: "0532 100 11 22", rol: "mudur", rolLabel: "👑 Müdür", avatarBg: "linear-gradient(135deg,#7C3AED,#4C1D95)", online: true, stats: [{ v: "—", l: "Teslimat" }, { v: "—", l: "Ort. Süre" }, { v: "Tam", l: "Yetki", vColor: TEAL }], sezlonglar: null, sezlongTitle: null, yetkiler: ["Şezlong Haritası", "Rezervasyonlar", "Siparişler", "Menü Yönetimi", "Sezon & Fiyatlar", "Bakiye & Raporlar"], yetkiKilitli: [], aktif: true },
  { id: 2, inits: "MG", name: "Mehmet Güneş", phone: "0533 200 22 33", rol: "garson", rolLabel: "🛵 Garson", avatarBg: "linear-gradient(135deg,#0ABAB5,#065F46)", online: true, stats: [{ v: "34", l: "Teslimat", vColor: GREEN }, { v: "9dk", l: "Ort. Süre" }, { v: "₺280", l: "Tip", vColor: ORANGE }], sezlonglar: ["S-1","S-2","S-3","S-4","S-5","S-6","S-7","S-8","S-9","S-10"], sezlongTitle: "Atanan Şezlonglar", yetkiler: ["Siparişler", "Atanan Şezlonglar"], yetkiKilitli: ["Menü (Kilitli)", "Fiyatlar (Kilitli)"], aktif: true },
  { id: 3, inits: "AT", name: "Ayşe Toprak", phone: "0534 300 33 44", rol: "garson", rolLabel: "🛵 Garson", avatarBg: "linear-gradient(135deg,#F5821F,#92400E)", online: true, stats: [{ v: "28", l: "Teslimat", vColor: GREEN }, { v: "12dk", l: "Ort. Süre" }, { v: "₺350", l: "Tip", vColor: ORANGE }], sezlonglar: ["V-1","V-2","V-3","V-4","V-5","G-1","G-2"], sezlongTitle: "Atanan Şezlonglar", sezlongTags: ["vip","vip","vip","vip","vip","gold","gold"], yetkiler: ["Siparişler", "Atanan Şezlonglar", "Rezervasyonlar (Görüntüle)"], yetkiKilitli: ["Fiyatlar (Kilitli)"], aktif: true },
  { id: 4, inits: "CK", name: "Can Kılıç", phone: "0535 400 44 55", rol: "ozel", rolLabel: "⚙️ Özel Yetki", avatarBg: "linear-gradient(135deg,#10B981,#065F46)", online: true, stats: [{ v: "27", l: "Teslimat", vColor: GREEN }, { v: "11dk", l: "Ort. Süre" }, { v: "₺190", l: "Tip", vColor: ORANGE }], sezlonglar: ["İ-1","İ-2","İ-3","İ-4","İ-5","S-11","S-12","S-13"], sezlongTitle: "Atanan Şezlonglar", sezlongTags: ["iskele","iskele","iskele","iskele","iskele","default","default","default"], yetkiler: ["Siparişler", "Atanan Şezlonglar", "Menü (Görüntüle)"], yetkiKilitli: ["Fiyatlar (Kilitli)", "Personel (Kilitli)"], aktif: true },
  { id: 5, inits: "HA", name: "Hüseyin Avcı", phone: "0536 500 55 66", rol: "mutfak", rolLabel: "👨‍🍳 Mutfak", avatarBg: "linear-gradient(135deg,#F59E0B,#92400E)", online: true, stats: [{ v: "89", l: "Hazırlanan", vColor: GREEN }, { v: "8dk", l: "Ort. Hazırlama" }, { v: "Mutfak", l: "Erişim", vColor: TEAL }], sezlonglar: null, sezlongTitle: "Erişim Alanı", sezlongOzel: ["Mutfak Ekranı", "Sipariş Listesi"], yetkiler: ["Mutfak Paneli", "Sipariş Durumu Güncelle"], yetkiKilitli: ["Rezervasyonlar (Kilitli)", "Fiyatlar (Kilitli)"], aktif: true },
  { id: 6, inits: "BD", name: "Berk Doğan", phone: "0537 600 66 77", rol: "garson", rolLabel: "🛵 Garson", avatarBg: "linear-gradient(135deg,#94A3B8,#475569)", online: false, stats: [{ v: "0", l: "Bugün" }, { v: "—", l: "Ort. Süre" }, { v: "Pasif", l: "Durum", vColor: GRAY400 }], sezlonglar: null, sezlongTitle: "Atanan Şezlonglar", noSezlong: true, yetkiler: [], yetkiKilitli: ["Erişim Kapalı"], aktif: false },
];

const YETKI_SECTIONS = [
  { section: "🏖️ Şezlong Haritası", items: [{ name: "Haritayı Görüntüle", desc: "Şezlong durumlarını görebilir" }, { name: "Şezlong Durumu Değiştir", desc: "Dolu/boş/bakımda yapabilir" }, { name: "İşletme Rezervi Ayarla", desc: "Şezlong kilitleme/açma" }] },
  { section: "📋 Rezervasyonlar", items: [{ name: "Rezervasyonları Görüntüle", desc: "Listeyi okuyabilir" }, { name: "Rezervasyon Oluştur", desc: "Manuel rezervasyon ekleyebilir" }, { name: "Rezervasyon İptal Et", desc: "İptal işlemi yapabilir" }] },
  { section: "🍽️ Siparişler", items: [{ name: "Siparişleri Görüntüle", desc: "Aktif siparişleri görebilir" }, { name: "Sipariş Durumu Güncelle", desc: "Hazırlandı / Teslim edildi yapabilir" }] },
  { section: "🍹 Menü Yönetimi", items: [{ name: "Menüyü Görüntüle", desc: "Ürün listesini görebilir" }, { name: "Ürün Ekle / Düzenle", desc: "Menü içeriğini değiştirebilir" }] },
  { section: "💰 Sezon & Fiyatlar", items: [{ name: "Fiyatları Görüntüle", desc: "Mevcut fiyatları okuyabilir" }, { name: "Fiyat Güncelle", desc: "Sezlong ve ürün fiyatlarını değiştirebilir" }] },
  { section: "📊 Bakiye & Raporlar", items: [{ name: "Raporları Görüntüle", desc: "Günlük/aylık gelir raporları" }, { name: "Bakiye İşlemleri", desc: "Müşteri bakiyesini yükleyebilir/düzenleyebilir" }] },
];

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#0ABAB5,#065F46)", "linear-gradient(135deg,#F5821F,#92400E)",
  "linear-gradient(135deg,#7C3AED,#4C1D95)", "linear-gradient(135deg,#10B981,#065F46)",
  "linear-gradient(135deg,#F59E0B,#92400E)", "linear-gradient(135deg,#3B82F6,#1E3A8A)",
];

const emptyForm = { name: "", phone: "", rol: "garson" as RolType, sezlonglar: "", aktif: true };

// ── PersonelKart ────────────────────────────────────────────────────────────
function PersonelKart({ p, onEdit, onYetki, onToggle, onSil }: {
  p: Personel;
  onEdit: () => void;
  onYetki: () => void;
  onToggle: () => void;
  onSil: () => void;
}) {
  const rolStyle = ROL_STYLES[p.rol];
  return (
    <div className="personel-kart" style={{ background: "white", borderRadius: 16, border: `1.5px solid ${GRAY200}`, overflow: "hidden", transition: "all 0.2s", opacity: p.aktif ? 1 : 0.65 }}>
      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, borderBottom: `1px solid ${GRAY100}` }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "white", background: p.avatarBg }}>{p.inits}</div>
          <div style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: "50%", border: "2px solid white", background: p.online ? GREEN : GRAY300 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 3 }}>{p.name}</div>
          <div style={{ fontSize: 11, color: GRAY400 }}>{p.phone}</div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20, marginTop: 4, background: rolStyle.bg, color: rolStyle.color }}>{p.rolLabel}</span>
        </div>
        <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer", flexShrink: 0 }} title={p.aktif ? "Pasife al" : "Aktive et"}>
          <input type="checkbox" checked={p.aktif} onChange={onToggle} style={{ opacity: 0, width: 0, height: 0 }} />
          <span style={{ position: "absolute", inset: 0, background: p.aktif ? TEAL : GRAY300, borderRadius: 20, transition: "0.3s" }}>
            <span style={{ position: "absolute", width: 14, height: 14, left: 3, top: 3, background: "white", borderRadius: "50%", transition: "0.3s", transform: p.aktif ? "translateX(16px)" : "translateX(0)" }} />
          </span>
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderBottom: `1px solid ${GRAY100}` }}>
        {p.stats.map((s, i) => (
          <div key={i} style={{ padding: 12, textAlign: "center", borderRight: i < 2 ? `1px solid ${GRAY100}` : "none" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.vColor ?? NAVY }}>{s.v}</div>
            <div style={{ fontSize: 9, color: GRAY400, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {(p.sezlonglar || p.sezlongOzel || p.noSezlong) && (
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>{p.sezlongTitle ?? "Atanan Şezlonglar"}</div>
          {p.noSezlong ? (
            <div style={{ fontSize: 11, color: GRAY400, fontStyle: "italic" }}>Bugün atama yok</div>
          ) : p.sezlongOzel ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {p.sezlongOzel.map((s, i) => <span key={i} style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#FEF3C7", color: "#92400E" }}>{s}</span>)}
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {p.sezlonglar!.map((s, i) => {
                const tag = p.sezlongTags ? p.sezlongTags[i] : "default";
                const st = SEZ_TAG_STYLES[tag] ?? SEZ_TAG_STYLES.default;
                return <span key={i} style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: st.bg, color: st.color }}>{s}</span>;
              })}
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Yetkiler</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {p.yetkiler.map((y, i) => <span key={i} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(10,186,181,0.1)", color: TEAL, fontWeight: 600 }}>{y}</span>)}
          {p.yetkiKilitli.map((y, i) => <span key={i} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: GRAY100, color: GRAY400, fontWeight: 600 }}>{y}</span>)}
        </div>
      </div>

      <div style={{ padding: "12px 14px", display: "flex", gap: 8, alignItems: "center" }}>
        <button className="pk-action" onClick={onEdit} style={{ flex: 1, padding: 7, borderRadius: 8, border: `1px solid ${GRAY200}`, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: GRAY800 }}>✏️ Düzenle</button>
        <button className="pk-action" onClick={onYetki} style={{ flex: 1, padding: 7, borderRadius: 8, border: `1px solid ${GRAY200}`, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: GRAY800 }}>🔑 Yetkiler</button>
        <button className="pk-action pk-danger" onClick={onSil} style={{ flex: 1, padding: 7, borderRadius: 8, border: `1px solid ${GRAY200}`, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: GRAY800 }}>🗑️</button>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function IsletmePersonelPage() {
  const [personeller, setPersoneller] = useState<Personel[]>(INIT_PERSONELLER);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState<Personel | null>(null);
  const [silModal, setSilModal] = useState<Personel | null>(null);
  const [yetkiModal, setYetkiModal] = useState<Personel | null>(null);

  // Forms
  const [yeniForm, setYeniForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  // Yetki modal checks: flat map of yetki item name → boolean
  const [yetkiChecks, setYetkiChecks] = useState<Record<string, boolean>>({});

  // Stat filter
  const [statFiltre, setStatFiltre] = useState<"tumu" | "aktif" | "teslimat" | "sure">("tumu");

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ESC closes modals
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAddModalOpen(false); setEditModal(null);
        setSilModal(null); setYetkiModal(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────
  function toggleAktif(id: number) {
    setPersoneller((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = !p.aktif;
        showToast(next ? `✅ ${p.name} aktif yapıldı` : `⏸️ ${p.name} pasif yapıldı`);
        return { ...p, aktif: next };
      })
    );
  }

  function openEdit(p: Personel) {
    setEditForm({ name: p.name, phone: p.phone, rol: p.rol, sezlonglar: p.sezlonglar?.join(", ") ?? "", aktif: p.aktif });
    setEditModal(p);
  }

  function saveEdit() {
    if (!editModal) return;
    setPersoneller((prev) =>
      prev.map((p) =>
        p.id === editModal.id
          ? {
              ...p,
              name: editForm.name,
              phone: editForm.phone,
              rol: editForm.rol,
              rolLabel: ROL_LABELS[editForm.rol],
              aktif: editForm.aktif,
              sezlonglar: editForm.sezlonglar ? editForm.sezlonglar.split(",").map((s) => s.trim()).filter(Boolean) : p.sezlonglar,
              inits: editForm.name.split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join(""),
            }
          : p
      )
    );
    showToast(`✅ ${editForm.name} güncellendi`);
    setEditModal(null);
  }

  function saveYeni() {
    if (!yeniForm.name) return;
    const inits = yeniForm.name.split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
    const gradient = AVATAR_GRADIENTS[personeller.length % AVATAR_GRADIENTS.length];
    const sezlonglar = yeniForm.sezlonglar ? yeniForm.sezlonglar.split(",").map((s) => s.trim()).filter(Boolean) : null;
    const newP: Personel = {
      id: Date.now(),
      inits, name: yeniForm.name, phone: yeniForm.phone,
      rol: yeniForm.rol, rolLabel: ROL_LABELS[yeniForm.rol],
      avatarBg: gradient, online: false,
      stats: [{ v: "0", l: "Teslimat" }, { v: "—", l: "Ort. Süre" }, { v: "Yeni", l: "Durum", vColor: TEAL }],
      sezlonglar, sezlongTitle: sezlonglar ? "Atanan Şezlonglar" : null,
      noSezlong: !sezlonglar || sezlonglar.length === 0,
      yetkiler: yeniForm.rol === "mudur" ? ["Tüm Yetkiler"] : ["Siparişler"],
      yetkiKilitli: yeniForm.rol !== "mudur" ? ["Fiyatlar (Kilitli)"] : [],
      aktif: yeniForm.aktif,
    };
    setPersoneller((prev) => [newP, ...prev]);
    setYeniForm(emptyForm);
    setAddModalOpen(false);
    showToast(`✅ ${yeniForm.name} personel olarak eklendi`);
  }

  function silPersonel() {
    if (!silModal) return;
    setPersoneller((prev) => prev.filter((p) => p.id !== silModal.id));
    showToast(`🗑️ ${silModal.name} silindi`);
    setSilModal(null);
  }

  function openYetki(p: Personel) {
    // Build flat map of all yetki items: checked if it's in p.yetkiler
    const checks: Record<string, boolean> = {};
    YETKI_SECTIONS.forEach((sec) => {
      sec.items.forEach((item) => {
        checks[item.name] = p.yetkiler.includes(item.name);
      });
    });
    setYetkiChecks(checks);
    setYetkiModal(p);
  }

  function saveYetkiler() {
    if (!yetkiModal) return;
    const newYetkiler = Object.entries(yetkiChecks).filter(([, v]) => v).map(([k]) => k);
    setPersoneller((prev) =>
      prev.map((p) => p.id === yetkiModal.id ? { ...p, yetkiler: newYetkiler, yetkiKilitli: [] } : p)
    );
    showToast(`🔑 ${yetkiModal.name} yetkileri güncellendi`);
    setYetkiModal(null);
  }

  function csvIndir() {
    const headers = ["Ad Soyad", "Telefon", "Rol", "Aktif", "Teslimat", "Ort. Süre", "Yetkiler"];
    const rows = personeller.map((p) => [
      p.name, p.phone, p.rolLabel.replace(/[^\w\s]/g, "").trim(),
      p.aktif ? "Aktif" : "Pasif",
      p.stats[0]?.v ?? "—", p.stats[1]?.v ?? "—",
      p.yetkiler.join("; "),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "personel-raporu.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Filtered list ────────────────────────────────────────────────────────
  const goruntulenen = personeller.filter((p) => {
    if (statFiltre === "aktif") return p.aktif;
    if (statFiltre === "teslimat") {
      const v = Number(p.stats[0]?.v);
      return !isNaN(v) && v > 0;
    }
    return true;
  });

  // ── Stats ───────────────────────────────────────────────────────────────
  const aktifSayisi = personeller.filter((p) => p.aktif).length;
  const toplamTeslimat = personeller.reduce((sum, p) => {
    const v = Number(p.stats[0]?.v);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 };

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
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Personel Yönetimi</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>
            {personeller.length} personel • {aktifSayisi} aktif, {personeller.length - aktifSayisi} pasif
            {statFiltre !== "tumu" && <span style={{ color: TEAL, fontWeight: 600 }}> • Filtrelenmiş görünüm</span>}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {statFiltre !== "tumu" && (
            <button onClick={() => setStatFiltre("tumu")} style={{ padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: `1px solid ${TEAL}`, background: "rgba(10,186,181,0.08)", color: TEAL, cursor: "pointer" }}>
              ✕ Filtreyi Kaldır
            </button>
          )}
          <button onClick={csvIndir} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>
            📥 Rapor İndir
          </button>
          <button onClick={() => { setYeniForm(emptyForm); setAddModalOpen(true); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>
            ➕ Personel Ekle
          </button>
        </div>
      </header>

      <div style={{ padding: 24, flex: 1 }}>
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { key: "tumu", icon: "👥", val: String(personeller.length), lbl: "Toplam Personel", iconBg: "#DBEAFE", valColor: NAVY },
            { key: "aktif", icon: "✅", val: String(aktifSayisi), lbl: "Aktif Bugün", iconBg: "#DCFCE7", valColor: GREEN },
            { key: "teslimat", icon: "🛵", val: String(toplamTeslimat), lbl: "Toplam Teslimat", iconBg: "#FFEDD5", valColor: ORANGE },
            { key: "sure", icon: "⏱️", val: "11dk", lbl: "Ort. Teslimat Süresi", iconBg: "#F5F3FF", valColor: PURPLE },
          ].map((s) => (
            <div
              key={s.key}
              onClick={() => setStatFiltre(s.key as typeof statFiltre)}
              style={{ background: "white", borderRadius: 12, padding: "14px 16px", border: `1.5px solid ${statFiltre === s.key ? TEAL : GRAY200}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "all 0.15s", boxShadow: statFiltre === s.key ? "0 0 0 3px rgba(10,186,181,0.1)" : "none" }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: s.iconBg }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.valColor, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: statFiltre === s.key ? TEAL : GRAY400, marginTop: 3, fontWeight: statFiltre === s.key ? 700 : 400 }}>{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* PERSONEL GRID */}
        {goruntulenen.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: GRAY400 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Bu filtre için personel bulunamadı</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {goruntulenen.map((p) => (
              <PersonelKart
                key={p.id} p={p}
                onEdit={() => openEdit(p)}
                onYetki={() => openYetki(p)}
                onToggle={() => toggleAktif(p.id)}
                onSil={() => setSilModal(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── PERSONEL EKLE MODAL ──────────────────────────────────────────────── */}
      {addModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setAddModalOpen(false)}>
          <div style={{ background: "white", borderRadius: 16, width: 560, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "92vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${GRAY200}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>➕ Personel Ekle</h3>
              <button onClick={() => setAddModalOpen(false)} style={{ width: 30, height: 30, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <PersonelForm form={yeniForm} setForm={setYeniForm} inputStyle={inputStyle} labelStyle={labelStyle} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: "16px 24px", borderTop: `1px solid ${GRAY200}` }}>
              <button onClick={() => setAddModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={saveYeni} disabled={!yeniForm.name} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: !yeniForm.name ? GRAY200 : TEAL, color: !yeniForm.name ? GRAY400 : "white", cursor: !yeniForm.name ? "not-allowed" : "pointer" }}>✅ Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DÜZENLE MODAL ───────────────────────────────────────────────────── */}
      {editModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setEditModal(null)}>
          <div style={{ background: "white", borderRadius: 16, width: 560, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "92vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${GRAY200}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>✏️ Personeli Düzenle</h3>
                <div style={{ fontSize: 11, color: GRAY400, marginTop: 2 }}>{editModal.name}</div>
              </div>
              <button onClick={() => setEditModal(null)} style={{ width: 30, height: 30, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <PersonelForm form={editForm} setForm={setEditForm} inputStyle={inputStyle} labelStyle={labelStyle} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: "16px 24px", borderTop: `1px solid ${GRAY200}` }}>
              <button onClick={() => setEditModal(null)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={saveEdit} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>💾 Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SİL ONAY MODAL ──────────────────────────────────────────────────── */}
      {silModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setSilModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 380, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: silModal.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "white", margin: "0 auto 14px" }}>{silModal.inits}</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Personeli Sil</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 4 }}>Bu işlem geri alınamaz.</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{silModal.name}</p>
            <p style={{ fontSize: 12, color: GRAY400, marginBottom: 24 }}>{silModal.rolLabel} • {silModal.phone}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setSilModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Vazgeç</button>
              <button onClick={silPersonel} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", background: RED, color: "white", cursor: "pointer" }}>🗑️ Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* ── YETKİ MODAL ─────────────────────────────────────────────────────── */}
      {yetkiModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setYetkiModal(null)}>
          <div style={{ background: "white", borderRadius: 16, width: 580, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "92vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${GRAY200}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>🔑 Yetki Yönetimi</h3>
                <div style={{ fontSize: 11, color: GRAY400, marginTop: 2 }}>{yetkiModal.name} — {yetkiModal.rolLabel}</div>
              </div>
              <button onClick={() => setYetkiModal(null)} style={{ width: 30, height: 30, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              {/* Quick summary */}
              <div style={{ background: GRAY50, borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: GRAY600 }}>
                  {Object.values(yetkiChecks).filter(Boolean).length} yetki aktif
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setYetkiChecks((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, true])))} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${GRAY200}`, background: "white", cursor: "pointer", color: GRAY600 }}>Tümünü Seç</button>
                  <button onClick={() => setYetkiChecks((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, false])))} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${GRAY200}`, background: "white", cursor: "pointer", color: GRAY600 }}>Tümünü Kaldır</button>
                </div>
              </div>

              <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: "#92400E" }}>
                ⚠️ Yetki değişiklikleri personelin panele bir sonraki girişinde aktif olur.
              </div>
              <div style={{ border: `1px solid ${GRAY200}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", padding: "8px 14px", background: GRAY50, gap: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5 }}>Sayfa / İşlev</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5 }}>Erişim</span>
                </div>
                {YETKI_SECTIONS.map((sec, si) => (
                  <div key={si}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", padding: "11px 14px", background: GRAY50, gap: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: GRAY600 }}>{sec.section}</div>
                      <div />
                    </div>
                    {sec.items.map((item) => {
                      const checked = yetkiChecks[item.name] ?? false;
                      return (
                        <div key={item.name} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", padding: "11px 14px", borderBottom: `1px solid ${GRAY100}`, gap: 10 }}>
                          <div>
                            <strong style={{ display: "block", fontSize: 12, fontWeight: 600, color: NAVY }}>{item.name}</strong>
                            <span style={{ fontSize: 10, color: GRAY400 }}>{item.desc}</span>
                          </div>
                          <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }}>
                            <input type="checkbox" checked={checked} onChange={(e) => setYetkiChecks((prev) => ({ ...prev, [item.name]: e.target.checked }))} style={{ opacity: 0, width: 0, height: 0 }} />
                            <span style={{ position: "absolute", inset: 0, background: checked ? TEAL : GRAY300, borderRadius: 20, transition: "0.3s" }}>
                              <span style={{ position: "absolute", width: 14, height: 14, left: 3, top: 3, background: "white", borderRadius: "50%", transition: "0.3s", transform: checked ? "translateX(16px)" : "translateX(0)" }} />
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: "16px 24px", borderTop: `1px solid ${GRAY200}` }}>
              <button onClick={() => setYetkiModal(null)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={saveYetkiler} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>✅ Yetkileri Kaydet</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .personel-kart:hover { border-color: #0ABAB5 !important; box-shadow: 0 4px 20px rgba(10,186,181,0.12); }
          .pk-action:hover { background: #0A1628 !important; color: white !important; border-color: #0A1628 !important; }
          .pk-danger:hover { background: #EF4444 !important; border-color: #EF4444 !important; }
        `,
      }} />
    </div>
  );
}

// ── Shared PersonelForm ───────────────────────────────────────────────────
function PersonelForm({ form, setForm, inputStyle, labelStyle }: {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}) {
  const f = form;
  const set = (key: keyof typeof emptyForm, val: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Ad Soyad *</label>
          <input type="text" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Ad Soyad" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Telefon</label>
          <input type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="05xx xxx xx xx" style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Rol Seç</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {([
            { key: "garson", icon: "🛵", name: "Garson", desc: "Sipariş teslim" },
            { key: "mutfak", icon: "👨‍🍳", name: "Mutfak", desc: "Mutfak paneli" },
            { key: "mudur", icon: "👑", name: "Müdür", desc: "Tam erişim" },
            { key: "ozel", icon: "⚙️", name: "Özel", desc: "Özel yetki" },
          ] as const).map((r) => (
            <button key={r.key} type="button" onClick={() => set("rol", r.key)} style={{ border: `2px solid ${f.rol === r.key ? TEAL : GRAY200}`, borderRadius: 10, padding: "10px 8px", cursor: "pointer", textAlign: "center", background: f.rol === r.key ? "rgba(10,186,181,0.06)" : "transparent", transition: "all 0.2s" }}>
              <div style={{ fontSize: 20, marginBottom: 3 }}>{r.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>{r.name}</div>
              <div style={{ fontSize: 9, color: GRAY400, marginTop: 2 }}>{r.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {(f.rol === "garson" || f.rol === "ozel") && (
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Atanan Şezlonglar <span style={{ color: GRAY400, fontWeight: 400 }}>(virgülle ayırın — örn: S-1, S-2, V-3)</span></label>
          <input type="text" value={f.sezlonglar} onChange={(e) => set("sezlonglar", e.target.value)} placeholder="S-1, S-2, S-3..." style={inputStyle} />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: GRAY50, borderRadius: 10, padding: "12px 14px" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Aktif olarak ekle</div>
          <div style={{ fontSize: 11, color: GRAY400 }}>Hemen panele erişim verilir</div>
        </div>
        <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }}>
          <input type="checkbox" checked={f.aktif} onChange={(e) => set("aktif", e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
          <span style={{ position: "absolute", inset: 0, background: f.aktif ? TEAL : GRAY300, borderRadius: 20, transition: "0.3s" }}>
            <span style={{ position: "absolute", width: 14, height: 14, left: 3, top: 3, background: "white", borderRadius: "50%", transition: "0.3s", transform: f.aktif ? "translateX(16px)" : "translateX(0)" }} />
          </span>
        </label>
      </div>
    </>
  );
}
