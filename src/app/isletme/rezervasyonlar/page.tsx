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
const BLUE = "#3B82F6";
const YELLOW = "#F59E0B";

const TABLE_COLS = "50px 1fr 140px 120px 110px 120px 110px 100px";
const SAYFA_BASINA = 7;

type Rezervasyon = {
  id: string;
  no: string;
  musteri: string;
  telefon: string;
  avatarColor: string;
  avatarInits: string;
  sezlong: string;
  sezlongSub: string;
  tarih: string;
  tarihISO: string;
  tarihSub: string;
  tip: string;
  tipLabel: string;
  tutar: string;
  tutarSub: string;
  tutarColor: string;
  status: string;
  statusLabel: string;
  disabled: boolean;
  drawerData: {
    email: string;
    sezlong: string;
    giris: string;
    sure: string;
    yuklenen: string;
    harcanan: string;
    bakiyePct: number;
    kalan: string;
    sonTarih: string;
    siparisler: { no: string; urun: string; saat: string; tutar: string }[];
  };
};

const MOCK_REZERVASYONLAR: Rezervasyon[] = [
  {
    id: "R001", no: "#001", musteri: "Ahmet Yılmaz", telefon: "0532 111 22 33",
    avatarColor: "linear-gradient(135deg,#0ABAB5,#0A1628)", avatarInits: "AY",
    sezlong: "S-12", sezlongSub: "Silver • 1 şezlong",
    tarih: "11 Mar 2026", tarihISO: "2026-03-11", tarihSub: "09:45 — Aktif",
    tip: "on", tipLabel: "💰 Ön Ödemeli",
    tutar: "₺1.000", tutarSub: "Bakiye: ₺640", tutarColor: NAVY,
    status: "aktif", statusLabel: "● Aktif", disabled: false,
    drawerData: { email: "ahmet@gmail.com", sezlong: "S-12 (Silver)", giris: "09:45", sure: "3s 42dk", yuklenen: "₺1.000", harcanan: "-₺360", bakiyePct: 64, kalan: "₺640", sonTarih: "10 Nisan 2026", siparisler: [{ no: "S12", urun: "2x Mojito, 1x Limonata", saat: "10:15 • İletildi ✓", tutar: "₺180" }, { no: "S12", urun: "1x Tavuk Şiş, 1x Salata", saat: "12:30 • İletildi ✓", tutar: "₺120" }, { no: "S12", urun: "2x Soğuk Kahve", saat: "13:20 • Hazırlanıyor...", tutar: "₺60" }] },
  },
  {
    id: "R002", no: "#002", musteri: "Fatma Demir", telefon: "0533 222 33 44",
    avatarColor: "linear-gradient(135deg,#F5821F,#0A1628)", avatarInits: "FD",
    sezlong: "V-3, V-4", sezlongSub: "VIP • 2 şezlong",
    tarih: "11 Mar 2026", tarihISO: "2026-03-11", tarihSub: "11:15 — Aktif",
    tip: "on", tipLabel: "💰 Ön Ödemeli",
    tutar: "₺3.000", tutarSub: "Bakiye: ₺2.150", tutarColor: NAVY,
    status: "aktif", statusLabel: "● Aktif", disabled: false,
    drawerData: { email: "fatma@gmail.com", sezlong: "V-3, V-4 (VIP)", giris: "11:15", sure: "2s 10dk", yuklenen: "₺3.000", harcanan: "-₺850", bakiyePct: 72, kalan: "₺2.150", sonTarih: "10 Nisan 2026", siparisler: [] },
  },
  {
    id: "R003", no: "#003", musteri: "Mehmet Kaya", telefon: "0535 333 44 55",
    avatarColor: "linear-gradient(135deg,#10B981,#0A1628)", avatarInits: "MK",
    sezlong: "G-1", sezlongSub: "Gold • 1 şezlong",
    tarih: "11 Mar 2026", tarihISO: "2026-03-11", tarihSub: "09:00 — Çıktı",
    tip: "sezlong", tipLabel: "🏖️ Sadece Sezlong",
    tutar: "₺2.000", tutarSub: "Tamamlandı", tutarColor: NAVY,
    status: "tamamlandi", statusLabel: "✓ Tamamlandı", disabled: false,
    drawerData: { email: "mehmet@gmail.com", sezlong: "G-1 (Gold)", giris: "09:00", sure: "4s 0dk", yuklenen: "—", harcanan: "—", bakiyePct: 0, kalan: "—", sonTarih: "", siparisler: [] },
  },
  {
    id: "R004", no: "#004", musteri: "Zeynep Arslan", telefon: "0536 444 55 66",
    avatarColor: "linear-gradient(135deg,#8B5CF6,#0A1628)", avatarInits: "ZA",
    sezlong: "İ-5, İ-6", sezlongSub: "İskele • 2 şezlong",
    tarih: "11 Mar 2026", tarihISO: "2026-03-11", tarihSub: "14:00 — Bekleniyor",
    tip: "on", tipLabel: "💰 Ön Ödemeli",
    tutar: "₺2.500", tutarSub: "Bakiye: ₺2.500", tutarColor: NAVY,
    status: "rezerve", statusLabel: "◔ Yaklaşan", disabled: false,
    drawerData: { email: "zeynep@gmail.com", sezlong: "İ-5, İ-6 (İskele)", giris: "14:00", sure: "—", yuklenen: "₺2.500", harcanan: "₺0", bakiyePct: 100, kalan: "₺2.500", sonTarih: "10 Nisan 2026", siparisler: [] },
  },
  {
    id: "R005", no: "#005", musteri: "Ali Koç", telefon: "0537 555 66 77",
    avatarColor: "linear-gradient(135deg,#EF4444,#0A1628)", avatarInits: "AK",
    sezlong: "S-22", sezlongSub: "Silver • 1 şezlong",
    tarih: "10 Mar 2026", tarihISO: "2026-03-10", tarihSub: "İptal edildi",
    tip: "sezlong", tipLabel: "🏖️ Sadece Sezlong",
    tutar: "₺1.000", tutarSub: "İade edildi", tutarColor: RED,
    status: "iptal", statusLabel: "✖ İptal", disabled: true,
    drawerData: { email: "ali@gmail.com", sezlong: "S-22 (Silver)", giris: "—", sure: "—", yuklenen: "—", harcanan: "—", bakiyePct: 0, kalan: "—", sonTarih: "", siparisler: [] },
  },
  {
    id: "R006", no: "#006", musteri: "Selin Erdoğan", telefon: "0538 666 77 88",
    avatarColor: "linear-gradient(135deg,#F59E0B,#0A1628)", avatarInits: "SE",
    sezlong: "V-8, V-9, V-10", sezlongSub: "VIP • 3 şezlong (Grup)",
    tarih: "11 Mar 2026", tarihISO: "2026-03-11", tarihSub: "10:30 — Aktif",
    tip: "on", tipLabel: "💰 Ön Ödemeli",
    tutar: "₺4.500", tutarSub: "Bakiye: ₺3.200", tutarColor: NAVY,
    status: "aktif", statusLabel: "● Aktif", disabled: false,
    drawerData: { email: "selin@gmail.com", sezlong: "V-8, V-9, V-10 (VIP)", giris: "10:30", sure: "2s 15dk", yuklenen: "₺4.500", harcanan: "-₺1.300", bakiyePct: 71, kalan: "₺3.200", sonTarih: "10 Nisan 2026", siparisler: [] },
  },
  {
    id: "R007", no: "#007", musteri: "Burak Taş", telefon: "0539 777 88 99",
    avatarColor: "linear-gradient(135deg,#3B82F6,#0A1628)", avatarInits: "BT",
    sezlong: "S-33", sezlongSub: "Silver • 1 şezlong",
    tarih: "12 Mar 2026", tarihISO: "2026-03-12", tarihSub: "11:00 — Yarın",
    tip: "on", tipLabel: "💰 Ön Ödemeli",
    tutar: "₺1.000", tutarSub: "Bakiye: ₺1.000", tutarColor: NAVY,
    status: "bekliyor", statusLabel: "◷ Bekliyor", disabled: false,
    drawerData: { email: "burak@gmail.com", sezlong: "S-33 (Silver)", giris: "11:00", sure: "—", yuklenen: "₺1.000", harcanan: "₺0", bakiyePct: 100, kalan: "₺1.000", sonTarih: "10 Nisan 2026", siparisler: [] },
  },
];

const TABS = [
  { key: "tumu", label: "Tümü" },
  { key: "aktif", label: "Aktif" },
  { key: "yaklasan", label: "Yaklaşan" },
  { key: "tamamlandi", label: "Tamamlandı" },
  { key: "iptal", label: "İptal" },
];

const emptyYeniForm = {
  musteriAdi: "", telefon: "", grup: "Silver", sezlongNo: "",
  tarih: "2026-03-11", saat: "09:00", kisiSayisi: "2", odeme: "on",
};

const emptyEditForm = {
  musteriAdi: "", telefon: "", grup: "Silver", sezlongNo: "",
  tarih: "", saat: "", kisiSayisi: "2", odeme: "on",
};

export default function IsletmeRezervasyonlarPage() {
  const [rezervasyonlar, setRezervasyonlar] = useState<Rezervasyon[]>(MOCK_REZERVASYONLAR);

  // Drawer (detail view)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRez, setDrawerRez] = useState<Rezervasyon | null>(null);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editModal, setEditModal] = useState<Rezervasyon | null>(null);
  const [iptalModal, setIptalModal] = useState<Rezervasyon | null>(null);

  // Forms
  const [yeniForm, setYeniForm] = useState(emptyYeniForm);
  const [editForm, setEditForm] = useState(emptyEditForm);

  // Filters
  const [aramaMetni, setAramaMetni] = useState("");
  const [filtreTarih, setFiltreTarih] = useState("");
  const [filtreGrup, setFiltreGrup] = useState("");
  const [filtreTip, setFiltreTip] = useState("");
  const [filtreDurum, setFiltreDurum] = useState("");
  const [activeTab, setActiveTab] = useState("tumu");

  // Pagination
  const [sayfa, setSayfa] = useState(1);

  // ESC key closes all modals/drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false); setDrawerRez(null);
        setModalOpen(false);
        setEditModal(null);
        setIptalModal(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Reset page when filters change
  useEffect(() => { setSayfa(1); }, [aramaMetni, filtreTarih, filtreGrup, filtreTip, filtreDurum, activeTab]);

  // ── FILTERING ──────────────────────────────────────────────────────────────
  const filtrelenmis = rezervasyonlar.filter((r) => {
    // Tab
    if (activeTab === "aktif" && r.status !== "aktif") return false;
    if (activeTab === "yaklasan" && r.status !== "rezerve" && r.status !== "bekliyor") return false;
    if (activeTab === "tamamlandi" && r.status !== "tamamlandi") return false;
    if (activeTab === "iptal" && r.status !== "iptal") return false;
    // Search
    if (aramaMetni) {
      const q = aramaMetni.toLowerCase();
      if (
        !r.musteri.toLowerCase().includes(q) &&
        !r.telefon.includes(q) &&
        !r.no.toLowerCase().includes(q)
      ) return false;
    }
    // Date
    if (filtreTarih && r.tarihISO !== filtreTarih) return false;
    // Group
    if (filtreGrup && !r.sezlongSub.toLowerCase().includes(filtreGrup.toLowerCase())) return false;
    // Tip
    if (filtreTip === "on" && r.tip !== "on") return false;
    if (filtreTip === "sezlong" && r.tip !== "sezlong") return false;
    // Durum
    if (filtreDurum && r.status !== filtreDurum) return false;
    return true;
  });

  // Tab counts (from full list, not filtered)
  const tabCounts = {
    tumu: rezervasyonlar.length,
    aktif: rezervasyonlar.filter((r) => r.status === "aktif").length,
    yaklasan: rezervasyonlar.filter((r) => r.status === "rezerve" || r.status === "bekliyor").length,
    tamamlandi: rezervasyonlar.filter((r) => r.status === "tamamlandi").length,
    iptal: rezervasyonlar.filter((r) => r.status === "iptal").length,
  };

  // Pagination
  const toplamSayfa = Math.max(1, Math.ceil(filtrelenmis.length / SAYFA_BASINA));
  const sayfadakiler = filtrelenmis.slice((sayfa - 1) * SAYFA_BASINA, sayfa * SAYFA_BASINA);

  // ── ACTIONS ────────────────────────────────────────────────────────────────
  function openDrawer(r: Rezervasyon) {
    setDrawerRez(r); setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false); setDrawerRez(null);
  }

  function openEdit(r: Rezervasyon) {
    const saatMatch = r.tarihSub.match(/^\d{2}:\d{2}/);
    setEditForm({
      musteriAdi: r.musteri,
      telefon: r.telefon,
      grup: r.sezlongSub.split(" •")[0],
      sezlongNo: r.sezlong,
      tarih: r.tarihISO,
      saat: saatMatch ? saatMatch[0] : "",
      kisiSayisi: "2",
      odeme: r.tip,
    });
    setEditModal(r);
  }

  function saveEdit() {
    if (!editModal) return;
    setRezervasyonlar((prev) =>
      prev.map((r) =>
        r.id === editModal.id
          ? {
              ...r,
              musteri: editForm.musteriAdi,
              telefon: editForm.telefon,
              sezlong: editForm.sezlongNo,
              tip: editForm.odeme,
              tipLabel: editForm.odeme === "on" ? "💰 Ön Ödemeli" : "🏖️ Sadece Sezlong",
            }
          : r
      )
    );
    setEditModal(null);
  }

  function iptalEt() {
    if (!iptalModal) return;
    setRezervasyonlar((prev) =>
      prev.map((r) =>
        r.id === iptalModal.id
          ? { ...r, status: "iptal", statusLabel: "✖ İptal", disabled: true, tarihSub: "İptal edildi", tutarSub: "İade edildi", tutarColor: RED }
          : r
      )
    );
    setIptalModal(null);
  }

  function saveYeni() {
    const newId = "R" + String(rezervasyonlar.length + 1).padStart(3, "0");
    const grupColors: Record<string, string> = {
      Silver: "linear-gradient(135deg,#0ABAB5,#0A1628)",
      VIP: "linear-gradient(135deg,#F5821F,#0A1628)",
      İskele: "linear-gradient(135deg,#F59E0B,#0A1628)",
      Gold: "linear-gradient(135deg,#8B5CF6,#0A1628)",
    };
    const inits = yeniForm.musteriAdi.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
    const newRez: Rezervasyon = {
      id: newId,
      no: "#" + String(rezervasyonlar.length + 1).padStart(3, "0"),
      musteri: yeniForm.musteriAdi,
      telefon: yeniForm.telefon,
      avatarColor: grupColors[yeniForm.grup] ?? grupColors.Silver,
      avatarInits: inits || "YM",
      sezlong: yeniForm.sezlongNo || `${yeniForm.grup[0]}-${rezervasyonlar.length + 1}`,
      sezlongSub: `${yeniForm.grup} • 1 şezlong`,
      tarih: new Date(yeniForm.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }),
      tarihISO: yeniForm.tarih,
      tarihSub: `${yeniForm.saat} — Bekleniyor`,
      tip: yeniForm.odeme,
      tipLabel: yeniForm.odeme === "on" ? "💰 Ön Ödemeli" : "🏖️ Sadece Sezlong",
      tutar: "₺0",
      tutarSub: "Yeni",
      tutarColor: NAVY,
      status: "bekliyor",
      statusLabel: "◷ Bekliyor",
      disabled: false,
      drawerData: { email: "", sezlong: `${yeniForm.sezlongNo} (${yeniForm.grup})`, giris: yeniForm.saat, sure: "—", yuklenen: "—", harcanan: "—", bakiyePct: 0, kalan: "—", sonTarih: "", siparisler: [] },
    };
    setRezervasyonlar((prev) => [newRez, ...prev]);
    setYeniForm(emptyYeniForm);
    setModalOpen(false);
  }

  function excelIndir() {
    const headers = ["No", "Müşteri", "Telefon", "Şezlong", "Grup", "Tarih", "Saat", "Tip", "Tutar", "Durum"];
    const rows = filtrelenmis.map((r) => [
      r.no, r.musteri, r.telefon, r.sezlong, r.sezlongSub.split(" •")[0],
      r.tarih, r.tarihSub.split(" — ")[0], r.tipLabel.replace(/[^\w\s]/g, ""),
      r.tutar, r.statusLabel.replace(/[^\w\s]/g, ""),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "rezervasyonlar.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px",
    border: `1.5px solid ${GRAY200}`, borderRadius: 8,
    fontSize: 13, outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5,
  };

  // ── STATUS STYLE HELPERS ───────────────────────────────────────────────────
  function statusBg(status: string) {
    if (status === "aktif") return "#DCFCE7";
    if (status === "rezerve") return "#DBEAFE";
    if (status === "tamamlandi") return GRAY100;
    if (status === "iptal") return "#FEE2E2";
    return "#FEF3C7";
  }
  function statusColor(status: string) {
    if (status === "aktif") return "#16A34A";
    if (status === "rezerve") return "#2563EB";
    if (status === "tamamlandi") return GRAY600;
    if (status === "iptal") return "#DC2626";
    return "#D97706";
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", flexDirection: "column", minHeight: "100%" }}>

      {/* TOPBAR */}
      <header style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Rezervasyonlar</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>
            11 Mart 2026 • Toplam {rezervasyonlar.length} rezervasyon
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#F0FFFE", border: `1px solid ${TEAL}`, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: TEAL, marginLeft: 10 }}>
            💰 Ön Ödemeli Sistem
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={excelIndir}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}
          >
            📥 Excel İndir
          </button>
          <button
            onClick={() => setModalOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}
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
            { icon: "📋", val: String(tabCounts.tumu), lbl: "Toplam Bugün", valColor: NAVY },
            { icon: "✅", val: String(tabCounts.aktif), lbl: "Aktif", valColor: GREEN },
            { icon: "🔵", val: String(tabCounts.yaklasan), lbl: "Yaklaşan", valColor: BLUE },
            { icon: "❌", val: String(tabCounts.iptal), lbl: "İptal", valColor: RED },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", borderRadius: 12, padding: "16px 18px", border: `1px solid ${GRAY200}`, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: i === 0 || i === 1 ? "#DCFCE7" : i === 2 ? "#DBEAFE" : "#FEE2E2" }}>
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
        <div style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <input
            type="text"
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            placeholder="🔍  Müşteri adı, telefon veya rezervasyon no..."
            style={{ flex: 1, minWidth: 200, padding: "8px 12px", border: `1px solid ${aramaMetni ? TEAL : GRAY200}`, borderRadius: 8, fontSize: 12, outline: "none" }}
          />
          <input
            type="date"
            value={filtreTarih}
            onChange={(e) => setFiltreTarih(e.target.value)}
            style={{ padding: "8px 12px", border: `1px solid ${filtreTarih ? TEAL : GRAY200}`, borderRadius: 8, fontSize: 12 }}
          />
          <select
            value={filtreGrup}
            onChange={(e) => setFiltreGrup(e.target.value)}
            style={{ padding: "8px 12px", border: `1px solid ${filtreGrup ? TEAL : GRAY200}`, borderRadius: 8, fontSize: 12 }}
          >
            <option value="">Tüm Gruplar</option>
            <option value="Silver">Silver</option>
            <option value="VIP">VIP</option>
            <option value="İskele">İskele</option>
            <option value="Gold">Gold</option>
          </select>
          <select
            value={filtreTip}
            onChange={(e) => setFiltreTip(e.target.value)}
            style={{ padding: "8px 12px", border: `1px solid ${filtreTip ? TEAL : GRAY200}`, borderRadius: 8, fontSize: 12 }}
          >
            <option value="">Tüm Tipler</option>
            <option value="on">Ön Ödemeli</option>
            <option value="sezlong">Sadece Sezlong</option>
          </select>
          <select
            value={filtreDurum}
            onChange={(e) => setFiltreDurum(e.target.value)}
            style={{ padding: "8px 12px", border: `1px solid ${filtreDurum ? TEAL : GRAY200}`, borderRadius: 8, fontSize: 12 }}
          >
            <option value="">Tüm Durumlar</option>
            <option value="aktif">Aktif</option>
            <option value="rezerve">Yaklaşan</option>
            <option value="bekliyor">Bekliyor</option>
            <option value="tamamlandi">Tamamlandı</option>
            <option value="iptal">İptal</option>
          </select>
          <button
            onClick={() => { setAramaMetni(""); setFiltreTarih(""); setFiltreGrup(""); setFiltreTip(""); setFiltreDurum(""); setActiveTab("tumu"); }}
            style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}
          >
            🔄 Sıfırla
          </button>
        </div>

        {/* TAB BAR */}
        <div style={{ display: "flex", gap: 4, background: GRAY100, borderRadius: 8, padding: 4, marginBottom: 16 }}>
          {TABS.map((t) => {
            const count = tabCounts[t.key as keyof typeof tabCounts];
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{ padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: activeTab === t.key ? NAVY : GRAY600, background: activeTab === t.key ? "white" : "transparent", boxShadow: activeTab === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none", border: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" }}
              >
                {t.label}{" "}
                <span style={{ display: "inline-block", background: activeTab === t.key ? TEAL : GRAY200, color: activeTab === t.key ? "white" : GRAY800, fontSize: 10, padding: "1px 6px", borderRadius: 10, marginLeft: 4 }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* TABLO */}
        <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: TABLE_COLS, padding: "12px 18px", background: GRAY50, borderBottom: `1px solid ${GRAY200}`, gap: 8 }}>
            {["#", "Müşteri", "Şezlong", "Tarih", "Tip", "Tutar / Bakiye", "Durum", "İşlem"].map((h, i) => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: GRAY400, letterSpacing: 0.5, textTransform: "uppercase", textAlign: i === 7 ? "right" : "left" }}>{h}</div>
            ))}
          </div>

          {sayfadakiler.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: GRAY400, fontSize: 13 }}>
              Sonuç bulunamadı. Filtreleri değiştirin.
            </div>
          ) : (
            sayfadakiler.map((r) => (
              <div
                key={r.id}
                className="rez-table-row"
                onClick={() => !r.disabled && openDrawer(r)}
                style={{ display: "grid", gridTemplateColumns: TABLE_COLS, padding: "14px 18px", borderBottom: `1px solid ${GRAY100}`, gap: 8, alignItems: "center", cursor: r.disabled ? "default" : "pointer", transition: "background 0.15s", opacity: r.disabled ? 0.7 : 1 }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: GRAY400 }}>{r.no}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", background: r.avatarColor, flexShrink: 0 }}>
                    {r.avatarInits}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{r.musteri}</div>
                    <div style={{ fontSize: 11, color: GRAY400 }}>{r.telefon}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{r.sezlong}</div>
                  <div style={{ fontSize: 10, color: GRAY400 }}>{r.sezlongSub}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: GRAY800 }}>{r.tarih}</div>
                  <div style={{ fontSize: 10, color: GRAY400 }}>{r.tarihSub}</div>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 20, background: r.tip === "on" ? "#DCFCE7" : "#DBEAFE", color: r.tip === "on" ? "#16A34A" : "#2563EB" }}>
                    {r.tipLabel}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: r.tutarColor }}>{r.tutar}</div>
                  <div style={{ fontSize: 10, color: GRAY400 }}>{r.tutarSub}</div>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "5px 10px", borderRadius: 20, background: statusBg(r.status), color: statusColor(r.status) }}>
                    {r.statusLabel}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                  {/* Detay */}
                  <button
                    className="rez-action-btn"
                    onClick={(e) => { e.stopPropagation(); openDrawer(r); }}
                    title="Detay"
                    style={{ width: 28, height: 28, border: `1px solid ${GRAY200}`, background: "white", borderRadius: 7, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    👁️
                  </button>
                  {/* Düzenle */}
                  <button
                    className="rez-action-btn"
                    onClick={(e) => { e.stopPropagation(); if (!r.disabled) openEdit(r); }}
                    title="Düzenle"
                    style={{ width: 28, height: 28, border: `1px solid ${GRAY200}`, background: "white", borderRadius: 7, cursor: r.disabled ? "not-allowed" : "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", opacity: r.disabled ? 0.4 : 1 }}
                  >
                    ✏️
                  </button>
                  {/* İptal */}
                  <button
                    className="rez-action-btn"
                    onClick={(e) => { e.stopPropagation(); if (!r.disabled) setIptalModal(r); }}
                    title="İptal"
                    style={{ width: 28, height: 28, border: `1px solid ${GRAY200}`, background: "white", borderRadius: 7, cursor: r.disabled ? "not-allowed" : "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", opacity: r.disabled ? 0.4 : 1 }}
                  >
                    ✖️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* SAYFALAMA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "0 4px" }}>
          <div style={{ fontSize: 12, color: GRAY400 }}>
            {filtrelenmis.length} rezervasyondan{" "}
            {filtrelenmis.length === 0 ? "0" : (sayfa - 1) * SAYFA_BASINA + 1}–{Math.min(sayfa * SAYFA_BASINA, filtrelenmis.length)} arası gösteriliyor
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button
              onClick={() => setSayfa((p) => Math.max(1, p - 1))}
              disabled={sayfa === 1}
              style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: sayfa === 1 ? GRAY100 : "white", color: sayfa === 1 ? GRAY400 : GRAY800, cursor: sayfa === 1 ? "not-allowed" : "pointer" }}
            >
              ‹ Önceki
            </button>
            {Array.from({ length: toplamSayfa }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setSayfa(p)}
                style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: p === sayfa ? "none" : `1px solid ${GRAY200}`, background: p === sayfa ? TEAL : GRAY100, color: p === sayfa ? "white" : GRAY800, cursor: "pointer" }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setSayfa((p) => Math.min(toplamSayfa, p + 1))}
              disabled={sayfa === toplamSayfa}
              style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: sayfa === toplamSayfa ? GRAY100 : "white", color: sayfa === toplamSayfa ? GRAY400 : GRAY800, cursor: sayfa === toplamSayfa ? "not-allowed" : "pointer" }}
            >
              Sonraki ›
            </button>
          </div>
        </div>
      </div>

      {/* DETAY DRAWER */}
      {drawerOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200 }} onClick={closeDrawer} />
          <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 420, background: "white", zIndex: 201, overflowY: "auto", boxShadow: "-4px 0 24px rgba(0,0,0,0.15)" }}>
            <div style={{ background: NAVY, padding: "20px 24px", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Rezervasyon {drawerRez?.id}</h3>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>#{drawerRez?.id} • {drawerRez?.musteri}</div>
              </div>
              <button onClick={closeDrawer} style={{ width: 32, height: 32, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, color: "white", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              {drawerRez?.drawerData && (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Müşteri Bilgileri</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, background: GRAY50, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white", background: drawerRez.avatarColor }}>
                        {drawerRez.avatarInits}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{drawerRez.musteri}</div>
                        <div style={{ fontSize: 12, color: GRAY400 }}>{drawerRez.telefon} • {drawerRez.drawerData.email}</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        { label: "Şezlong", val: drawerRez.drawerData.sezlong },
                        { label: "Giriş Saati", val: drawerRez.drawerData.giris },
                        { label: "Süre", val: drawerRez.drawerData.sure },
                        { label: "Tip", val: drawerRez.tipLabel },
                      ].map((item) => (
                        <div key={item.label} style={{ background: GRAY50, borderRadius: 10, padding: 12 }}>
                          <div style={{ fontSize: 10, color: GRAY400, marginBottom: 4 }}>{item.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{item.val}</div>
                        </div>
                      ))}
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
                          <div style={{ height: "100%", borderRadius: 20, background: `linear-gradient(90deg,${TEAL},${GREEN})`, width: `${drawerRez.drawerData.bakiyePct}%` }} />
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

                  {drawerRez.drawerData.siparisler.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Siparişler ({drawerRez.drawerData.siparisler.length} adet)</div>
                      {drawerRez.drawerData.siparisler.map((s, i) => (
                        <div key={i} style={{ background: GRAY50, borderRadius: 10, padding: 12, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, background: NAVY, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: TEAL }}>{s.no}</div>
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
                        <button key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, border: `1px solid ${GRAY200}`, background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, color: GRAY800, textAlign: "left" }}>
                          {label}
                        </button>
                      ))}
                      <button
                        onClick={() => { closeDrawer(); setIptalModal(drawerRez); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, border: "1px solid #FEE2E2", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, color: RED, textAlign: "left" }}
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: 520, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>➕ Yeni Rezervasyon</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: GRAY400 }}>✕</button>
            </div>

            <div style={{ background: "#F0FFFE", border: `1.5px solid ${TEAL}`, borderRadius: 10, padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>💰</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>Ön Ödemeli Sistem Aktif</div>
                <div style={{ fontSize: 11, color: GRAY600, marginTop: 2 }}>Sezlong bedeli müşterinin bakiyesine yüklenir.</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Müşteri Adı *</label>
                <input type="text" value={yeniForm.musteriAdi} onChange={(e) => setYeniForm((f) => ({ ...f, musteriAdi: e.target.value }))} placeholder="Ad Soyad" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Telefon *</label>
                <input type="tel" value={yeniForm.telefon} onChange={(e) => setYeniForm((f) => ({ ...f, telefon: e.target.value }))} placeholder="05xx xxx xx xx" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Şezlong Grubu</label>
                <select value={yeniForm.grup} onChange={(e) => setYeniForm((f) => ({ ...f, grup: e.target.value }))} style={inputStyle}>
                  <option>Silver</option>
                  <option>VIP</option>
                  <option>İskele</option>
                  <option>Gold</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Şezlong No</label>
                <input type="text" value={yeniForm.sezlongNo} onChange={(e) => setYeniForm((f) => ({ ...f, sezlongNo: e.target.value }))} placeholder="örn: S-14" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Tarih *</label>
                <input type="date" value={yeniForm.tarih} onChange={(e) => setYeniForm((f) => ({ ...f, tarih: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Saat</label>
                <input type="time" value={yeniForm.saat} onChange={(e) => setYeniForm((f) => ({ ...f, saat: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Kişi Sayısı</label>
                <select value={yeniForm.kisiSayisi} onChange={(e) => setYeniForm((f) => ({ ...f, kisiSayisi: e.target.value }))} style={inputStyle}>
                  <option value="1">1 Kişi</option>
                  <option value="2">2 Kişi</option>
                  <option value="3">3 Kişi</option>
                  <option value="4">4 Kişi</option>
                  <option value="5">5+ Kişi</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Ödeme Tipi</label>
              <select value={yeniForm.odeme} onChange={(e) => setYeniForm((f) => ({ ...f, odeme: e.target.value }))} style={inputStyle}>
                <option value="on">💰 Ön Ödemeli</option>
                <option value="sezlong">🏖️ Sadece Şezlong</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => { setModalOpen(false); setYeniForm(emptyYeniForm); }} style={{ padding: "9px 18px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>
                İptal
              </button>
              <button
                onClick={saveYeni}
                disabled={!yeniForm.musteriAdi || !yeniForm.telefon}
                style={{ padding: "9px 18px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: !yeniForm.musteriAdi || !yeniForm.telefon ? GRAY200 : TEAL, color: !yeniForm.musteriAdi || !yeniForm.telefon ? GRAY400 : "white", cursor: !yeniForm.musteriAdi || !yeniForm.telefon ? "not-allowed" : "pointer" }}
              >
                ✅ Rezervasyonu Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DÜZENLE MODAL */}
      {editModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setEditModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: 520, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>✏️ Rezervasyonu Düzenle — {editModal.no}</h3>
              <button onClick={() => setEditModal(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: GRAY400 }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Müşteri Adı</label>
                <input type="text" value={editForm.musteriAdi} onChange={(e) => setEditForm((f) => ({ ...f, musteriAdi: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Telefon</label>
                <input type="tel" value={editForm.telefon} onChange={(e) => setEditForm((f) => ({ ...f, telefon: e.target.value }))} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Şezlong Grubu</label>
                <select value={editForm.grup} onChange={(e) => setEditForm((f) => ({ ...f, grup: e.target.value }))} style={inputStyle}>
                  <option>Silver</option>
                  <option>VIP</option>
                  <option>İskele</option>
                  <option>Gold</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Şezlong No</label>
                <input type="text" value={editForm.sezlongNo} onChange={(e) => setEditForm((f) => ({ ...f, sezlongNo: e.target.value }))} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Tarih</label>
                <input type="date" value={editForm.tarih} onChange={(e) => setEditForm((f) => ({ ...f, tarih: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Saat</label>
                <input type="time" value={editForm.saat} onChange={(e) => setEditForm((f) => ({ ...f, saat: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Kişi Sayısı</label>
                <select value={editForm.kisiSayisi} onChange={(e) => setEditForm((f) => ({ ...f, kisiSayisi: e.target.value }))} style={inputStyle}>
                  <option value="1">1 Kişi</option>
                  <option value="2">2 Kişi</option>
                  <option value="3">3 Kişi</option>
                  <option value="4">4 Kişi</option>
                  <option value="5">5+ Kişi</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Ödeme Tipi</label>
              <select value={editForm.odeme} onChange={(e) => setEditForm((f) => ({ ...f, odeme: e.target.value }))} style={inputStyle}>
                <option value="on">💰 Ön Ödemeli</option>
                <option value="sezlong">🏖️ Sadece Şezlong</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setEditModal(null)} style={{ padding: "9px 18px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>
                İptal
              </button>
              <button onClick={saveEdit} style={{ padding: "9px 18px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>
                💾 Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İPTAL ONAY MODAL */}
      {iptalModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setIptalModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 400, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 10 }}>Rezervasyonu İptal Et</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 6 }}>Bu işlem geri alınamaz. Emin misiniz?</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 24 }}>
              {iptalModal.no} — {iptalModal.musteri}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setIptalModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>
                Vazgeç
              </button>
              <button onClick={iptalEt} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", background: RED, color: "white", cursor: "pointer" }}>
                ✖ Evet, İptal Et
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
