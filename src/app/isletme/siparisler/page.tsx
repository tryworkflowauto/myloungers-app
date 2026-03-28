"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

type Garson = { id?: string; name: string; inits: string; color: string };

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

const GARSON_COLORS = [TEAL, ORANGE, "#7C3AED", BLUE, GREEN, YELLOW];

function garsonInits(ad: string): string {
  const parts = (ad || "").trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "—";
}

function mapSiparisToItem(
  s: any,
  garsonMap: Map<string, Garson>,
  index: number
): SiparisItem {
  const id = String(s.id);
  const created = s.created_at ? new Date(s.created_at) : new Date();
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffM = Math.floor(diffMs / 60000);
  let timer = `${diffM} dk`;
  let timerClass: "ok" | "warn" | "late" = "ok";
  if (diffM > 10) timerClass = "late";
  else if (diffM > 5) timerClass = "warn";
  const saat = created.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const grupAd = s.sezlonglar?.sezlong_gruplari?.ad?.trim() ?? "";
  const numara = s.sezlonglar?.numara;
  const sezlongStr = grupAd && numara != null ? `${grupAd.charAt(0)}${numara}` : numara != null ? String(numara) : "—";
  const bg = s.sezlonglar?.sezlong_gruplari?.renk?.trim() || TEAL;
  const kalemler = (s.siparis_kalemleri ?? []) as { ad?: string; fiyat?: number; adet?: number }[];
  const urunler = kalemler.map((k) => ({
    adet: Number(k.adet ?? 1),
    ad: (k.ad ?? "").trim() || "—",
    fiyat: `₺${Number(k.fiyat ?? 0).toLocaleString("tr-TR")}`,
  }));
  const toplam = Number(s.toplam ?? 0);
  const tutar = `₺${toplam.toLocaleString("tr-TR")}`;
  const garsonId = s.garson_id ? String(s.garson_id) : null;
  const garson = garsonId ? garsonMap.get(garsonId) ?? null : null;
  const durum = (s.durum ?? "bekliyor") as string;
  const isYeni = durum === "bekliyor";
  const musteri = s.rezervasyonlar?.musteri_adi?.trim() || "Misafir";
  const kisi = 1;

  return {
    id,
    sezlong: sezlongStr,
    grup: grupAd || "—",
    kisi,
    musteri,
    timer: durum === "teslim" ? `✓ ${diffM} dk` : timer,
    timerClass: durum === "teslim" ? "ok" : timerClass,
    saat,
    bg,
    urunler: urunler.length ? urunler : [{ adet: 1, ad: "—", fiyat: "₺0" }],
    garson: garson ? { ...garson, name: garson.name } : null,
    tutar,
    isYeni,
    opacity: durum === "teslim" ? 0.75 : 1,
  };
}

function mapSiparisToGecmis(s: any, garsonMap: Map<string, Garson>, no: string): GecmisItem {
  const created = s.created_at ? new Date(s.created_at) : new Date();
  const grupAd = s.sezlonglar?.sezlong_gruplari?.ad?.trim() ?? "";
  const numara = s.sezlonglar?.numara;
  const sezlongStr = grupAd && numara != null ? `${grupAd}-${numara} (${grupAd})` : numara != null ? String(numara) : "—";
  const kalemler = (s.siparis_kalemleri ?? []) as { ad?: string; adet?: number }[];
  const urunlerStr = kalemler.map((k) => `${k.adet ?? 1}x ${k.ad ?? "—"}`).join(", ");
  const saat = created.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const durum = (s.durum ?? "teslim") as string;
  const garsonId = s.garson_id ? String(s.garson_id) : null;
  const garson: Garson = garsonId && garsonMap.get(garsonId)
    ? garsonMap.get(garsonId)!
    : { inits: "—", name: "Atanmadı", color: GRAY400 };
  const toplam = Number(s.toplam ?? 0);
  const tutar = `₺${toplam.toLocaleString("tr-TR")}`;

  return {
    id: String(s.id),
    no,
    urunler: urunlerStr || "—",
    sezlong: sezlongStr,
    saat: durum === "iptal" ? `${saat} → İptal` : `${saat} → Teslim`,
    garson,
    tutar,
    durum: durum === "iptal" ? "iptal" : "teslim",
    tutarColor: durum === "iptal" ? RED : undefined,
  };
}

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
  const router = useRouter();
  const [tesisId, setTesisId] = useState<string | null>(null);

  const [yeniList, setYeniList] = useState<SiparisItem[]>([]);
  const [hazirList, setHazirList] = useState<SiparisItem[]>([]);
  const [teslimList, setTeslimList] = useState<SiparisItem[]>([]);
  const [gecmisList, setGecmisList] = useState<GecmisItem[]>([]);
  const [garsonlarList, setGarsonlarList] = useState<Garson[]>([]);
  const [loading, setLoading] = useState(true);
  const [gunlukCiroStr, setGunlukCiroStr] = useState("₺0");

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
  const [gecmisTarih, setGecmisTarih] = useState(() => new Date().toISOString().slice(0, 10));
  const [gecmisGarson, setGecmisGarson] = useState("");
  const [gecmisDurum, setGecmisDurum] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadTesis() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) {
        if (!cancelled) setTesisId(null);
        return;
      }
      let { data: k } = await supabase
        .from("kullanicilar")
        .select("tesis_id")
        .eq("id", user.id)
        .maybeSingle();
      if (!k && user.email) {
        const r = await supabase
          .from("kullanicilar")
          .select("tesis_id")
          .eq("email", user.email)
          .maybeSingle();
        k = r.data;
      }
      const tid = k?.tesis_id != null ? String(k.tesis_id) : null;
      if (!cancelled) setTesisId(tid);
    }
    loadTesis();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadTesis();
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // ESC closes all modals
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/giris'); return; }
      supabase.from('kullanicilar').select('rol').eq('email', user.email).single().then(({ data }) => {
        if (data?.rol !== 'isletmeci' && data?.rol !== 'admin') router.push('/');
      });
    });

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIptalModal(null); setGarsonModal(null); setDetayModal(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  // Personel (garsonlar)
  useEffect(() => {
    if (!tesisId) {
      setGarsonlarList([]);
      return;
    }
    supabase
      .from("personel")
      .select("id, ad")
      .eq("tesis_id", tesisId)
      .eq("rol", "garson")
      .eq("aktif", true)
      .then(({ data }) => {
        const list = (data ?? []).map((p: any, i: number) => ({
          id: String(p.id),
          name: (p.ad ?? "").trim() || "Garson",
          inits: garsonInits(p.ad ?? ""),
          color: GARSON_COLORS[i % GARSON_COLORS.length],
        }));
        setGarsonlarList(list);
      });
  }, [tesisId]);

  // Bugünkü siparişler + kalemler
  useEffect(() => {
    if (!tesisId) {
      setYeniList([]);
      setHazirList([]);
      setTeslimList([]);
      setGecmisList([]);
      setGunlukCiroStr("₺0");
      setLoading(false);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    let cancelled = false;
    setLoading(true);
    supabase
      .from("siparisler")
      .select(`
        id, tesis_id, garson_id, durum, toplam, created_at,
        sezlonglar(numara, sezlong_gruplari(ad, renk)),
        rezervasyonlar(musteri_adi),
        siparis_kalemleri(ad, fiyat, adet)
      `)
      .eq("tesis_id", tesisId)
      .gte("created_at", `${today}T00:00:00`)
      .order("created_at", { ascending: false })
      .then(({ data: siparisData, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Siparişler fetch error:", error);
          setYeniList([]);
          setHazirList([]);
          setTeslimList([]);
          setGecmisList([]);
          setGunlukCiroStr("₺0");
          setLoading(false);
          return;
        }
        supabase.from("personel").select("id, ad").eq("tesis_id", tesisId).then(({ data: personelData }) => {
          if (cancelled) return;
          const garsonMap = new Map<string, Garson>();
          (personelData ?? []).forEach((p: any, i: number) => {
            garsonMap.set(String(p.id), {
              id: String(p.id),
              name: (p.ad ?? "").trim() || "Garson",
              inits: garsonInits(p.ad ?? ""),
              color: GARSON_COLORS[i % GARSON_COLORS.length],
            });
          });
          const rows = (siparisData ?? []) as any[];
          const yeni: SiparisItem[] = [];
          const hazir: SiparisItem[] = [];
          const teslim: SiparisItem[] = [];
          const gecmis: GecmisItem[] = [];
          let gecmisNo = rows.filter((r: any) => r.durum === "teslim" || r.durum === "iptal").length + 80;
          rows.forEach((s, i) => {
            const item = mapSiparisToItem(s, garsonMap, i);
            if (s.durum === "bekliyor") yeni.push(item);
            else if (s.durum === "hazirlaniyor") hazir.push(item);
            else if (s.durum === "teslim") {
              teslim.push(item);
              gecmis.push(mapSiparisToGecmis(s, garsonMap, "#" + String(gecmisNo--).padStart(3, "0")));
            } else if (s.durum === "iptal") {
              gecmis.push(mapSiparisToGecmis(s, garsonMap, "#" + String(gecmisNo--).padStart(3, "0")));
            }
          });
          const ciroTamam = rows
            .filter((r: any) => r.durum === "teslim_edildi" || r.durum === "tamamlandi")
            .reduce((acc: number, r: any) => acc + Number(r.toplam ?? 0), 0);
          setGunlukCiroStr(`₺${ciroTamam.toLocaleString("tr-TR")}`);
          setYeniList(yeni);
          setHazirList(hazir);
          setTeslimList(teslim);
          setGecmisList(gecmis);
          setLoading(false);
        });
      });
    return () => { cancelled = true; };
  }, [tesisId]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Actions ──────────────────────────────────────────────────────────────
  async function hazirlamaAl(order: SiparisItem) {
    const { error } = await supabase.from("siparisler").update({ durum: "hazirlaniyor" }).eq("id", order.id);
    if (error) {
      console.error("hazirlamaAl error:", error);
      return;
    }
    setYeniList((p) => p.filter((x) => x.id !== order.id));
    setHazirList((p) => [{ ...order, isYeni: false, timer: "0 dk", timerClass: "ok" }, ...p]);
    showToast("🍳 Sipariş hazırlamaya alındı!");
  }

  async function teslimEt(order: SiparisItem) {
    const { error } = await supabase.from("siparisler").update({ durum: "teslim" }).eq("id", order.id);
    if (error) {
      console.error("teslimEt error:", error);
      return;
    }
    setHazirList((p) => p.filter((x) => x.id !== order.id));
    const teslimItem: SiparisItem = { ...order, opacity: 0.75, timer: "✓ " + order.timer, timerClass: "ok" };
    setTeslimList((p) => [teslimItem, ...p]);
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

  async function iptalOnayla() {
    if (!iptalModal) return;
    const { order, from } = iptalModal;
    const { error } = await supabase.from("siparisler").update({ durum: "iptal" }).eq("id", order.id);
    if (error) {
      console.error("iptalOnayla error:", error);
      return;
    }
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

  async function garsonAta(garson: Garson) {
    if (!garsonModal || !garson.id) return;
    const { order, from } = garsonModal;
    const { error } = await supabase.from("siparisler").update({ garson_id: garson.id }).eq("id", order.id);
    if (error) {
      console.error("garsonAta error:", error);
      return;
    }
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
          <span style={{ fontSize: 11, color: GRAY400 }}>{new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} • <span style={{ color: GREEN, fontWeight: 700 }}>● Canlı</span></span>
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
            {garsonlarList.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
          </select>
          {(filtreGrup || filtreGarson) && (
            <button onClick={() => { setFiltreGrup(""); setFiltreGarson(""); }} style={{ padding: "7px 10px", borderRadius: 8, fontSize: 12, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY600, cursor: "pointer" }}>
              ✕
            </button>
          )}
        </div>
      </header>

      <div style={{ padding: "20px 24px", flex: 1 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, color: GRAY400, fontSize: 14 }}>Yükleniyor…</div>
        ) : (
        <>
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { icon: "🆕", val: String(yeniList.length), lbl: "Yeni Sipariş", valColor: YELLOW, iconBg: "#FEF3C7" },
            { icon: "🍳", val: String(hazirList.length), lbl: "Hazırlanıyor", valColor: BLUE, iconBg: "#DBEAFE" },
            { icon: "✅", val: String(gecmisList.filter((g) => g.durum === "teslim").length + teslimList.length), lbl: "Teslim Edildi", valColor: GREEN, iconBg: "#DCFCE7" },
            { icon: "💰", val: gunlukCiroStr, lbl: "Günlük Ciro", valColor: ORANGE, iconBg: "#FFEDD5" },
            { icon: "⏱️", val: "0 dk", lbl: "Ort. Teslimat", valColor: "#7C3AED", iconBg: "#F5F3FF" },
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
                {garsonlarList.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
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
              {garsonlarList.map((g) => {
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
