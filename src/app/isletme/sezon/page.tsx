"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

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
const BLUE = "#3B82F6";
const PURPLE = "#7C3AED";
const YELLOW = "#F59E0B";

// ── Types ─────────────────────────────────────────────────────────────────────
type SezonItem = {
  id: string;
  name: string;
  bas: string;
  bit: string;
  dot: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  borderColor?: string;
  rowBg?: string;
  opacity?: number;
};

type FiyatRow = {
  id: string;
  name: string;
  sub: string;
  color: string;
  erken: number;
  yuksek: number;
  normal: number;
  minGun: number;
  anlikColor: string;
};

type KampanyaDurum = "aktif" | "planli" | "tamamlandi" | "durduruldu";

type Kampanya = {
  id: number;
  name: string;
  bas: string;
  bit: string;
  tip: "oran" | "sabit";
  indirimOran: number;
  sabitFiyatlar: Record<string, number>;
  gruplar: string[];
  musteriGoster: boolean;
  headerBg: string;
  durum: KampanyaDurum;
};

// ── Helpers for mapping from DB ───────────────────────────────────────────────
const SEZON_RENK_PALETI = [BLUE, ORANGE, TEAL, PURPLE, GREEN, GRAY300];
function sezonBadge(bas: string, bit: string, aktif: boolean): { badge: string; badgeBg: string; badgeColor: string; borderColor?: string; rowBg?: string; opacity?: number } {
  const now = new Date();
  const nowStr = now.toISOString().slice(0, 10);
  const bitDate = new Date(bit + "T00:00:00");
  const basDate = new Date(bas + "T00:00:00");
  if (aktif && nowStr >= bas && nowStr <= bit) return { badge: "Şu an aktif", badgeBg: "#DBEAFE", badgeColor: "#1E40AF", borderColor: BLUE, rowBg: "#EFF6FF" };
  if (bitDate > now && basDate > now) return { badge: "Yaklaşıyor", badgeBg: "#FFEDD5", badgeColor: "#C2410C" };
  if (basDate > now) return { badge: "Planlandı", badgeBg: "#F0FFFE", badgeColor: TEAL };
  return { badge: "Kapalı", badgeBg: GRAY100, badgeColor: GRAY600, opacity: 0.6 };
}
const GRUP_AD_IKON: Record<string, string> = { Gold: "⭐", VIP: "🔥", İskele: "⚓", Silver: "🌊" };
function grupDisplayName(ad: string): string {
  const icon = GRUP_AD_IKON[ad] || "🏖️";
  return `${icon} ${ad}`;
}

const INIT_KAMPANYALAR: Kampanya[] = [];

const GRUP_COLORS: Record<string, { bg: string; text: string }> = {
  "⭐ Gold":    { bg: "#F5F3FF", text: PURPLE   },
  "🔥 VIP":    { bg: "#FFEDD5", text: "#C2410C" },
  "⚓ İskele": { bg: "#FEF3C7", text: "#92400E" },
  "🌊 Silver": { bg: "#DBEAFE", text: "#1E40AF" },
};
const GRUPLAR_LIST = ["⭐ Gold", "🔥 VIP", "⚓ İskele", "🌊 Silver"];
const SEZON_RENKLERI = [BLUE, ORANGE, TEAL, PURPLE, GREEN, GRAY300];
const DEFAULT_FIYAT = 1000;

// ── Helpers ────────────────────────────────────────────────────────────────────
const MONTHS_TR = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
function fmtTarih(bas: string, bit: string) {
  const b = new Date(bas + "T00:00:00"), e = new Date(bit + "T00:00:00");
  return `${b.getDate()} ${MONTHS_TR[b.getMonth()]} — ${e.getDate()} ${MONTHS_TR[e.getMonth()]} ${e.getFullYear()}`;
}
function chipOf(d: KampanyaDurum) {
  return { aktif: "● Aktif", planli: "◷ Planlandı", tamamlandi: "✓ Tamamlandı", durduruldu: "⏸ Durduruldu" }[d];
}
function kalanGun(bit: string) {
  const diff = Math.round((new Date(bit + "T00:00:00").getTime() - new Date("2026-03-10").getTime()) / 86400000);
  return diff > 0 ? `${diff} gün` : null;
}

const emptySezonForm = { name: "", bas: "", bit: "", renk: BLUE };
const emptyKampForm  = { name: "", bas: "2026-03-11", bit: "2026-03-31", tip: "oran" as "oran"|"sabit", indirimOran: 20, sabitFiyatlar: {} as Record<string,number>, gruplar: ["⭐ Gold","🔥 VIP","🌊 Silver"], musteriGoster: true };

// ── Component ─────────────────────────────────────────────────────────────────
export default function IsletmeSezonPage() {
  const { data: session } = useSession();
  const tesisId = (session?.user as { tesis_id?: string } | undefined)?.tesis_id ?? null;

  const [loading, setLoading] = useState(true);
  const [sezonlar, setSezonlar]     = useState<SezonItem[]>([]);
  const [fiyatlar, setFiyatlar]     = useState<FiyatRow[]>([]);
  const [kampanyalar, setKampanyalar] = useState<Kampanya[]>(INIT_KAMPANYALAR);
  const [kampanyaLoading, setKampanyaLoading] = useState(false);
  const [seciliSezon, setSeciliSezon] = useState("erken");

  // Genel Ayarlar (controlled)
  const [genelAyarlar, setGA] = useState({ minRezSure: 2, erkenIndirim: 10, grupBonus: 15, sonDakikaToggle: true, sonDakikaPct: 20, iptalPolitika: "24 saat öncesine kadar tam iade", ozelSaat: 6 });
  const setGAf = <K extends keyof typeof genelAyarlar>(k: K, v: typeof genelAyarlar[K]) => setGA(p => ({ ...p, [k]: v }));

  // Sezon modal
  const [sezonModal, setSezonModal]       = useState(false);
  const [editSezon, setEditSezon]         = useState<SezonItem | null>(null);
  const [sezonForm, setSezonForm]         = useState(emptySezonForm);

  // Kampanya modal
  const [kampModal, setKampModal]         = useState(false);
  const [editKamp, setEditKamp]           = useState<Kampanya | null>(null);
  const [kampForm, setKampForm]           = useState(emptyKampForm);

  // Confirmation modals
  const [durdurModal, setDurdurModal]     = useState<Kampanya | null>(null);
  const [baslatModal, setBaslatModal]     = useState<Kampanya | null>(null);
  const [silModal, setSilModal]           = useState<Kampanya | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  // Load sezonlar + sezlong_gruplari from Supabase
  useEffect(() => {
    if (!tesisId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase.from("sezonlar").select("id, ad, baslangic, bitis, aktif").eq("tesis_id", tesisId).order("baslangic", { ascending: true }),
      supabase.from("sezlong_gruplari").select("id, ad, renk, kapasite, fiyat").eq("tesis_id", tesisId),
    ]).then(([sezonRes, grupRes]) => {
      if (cancelled) return;
      const sezonRows = (sezonRes.data ?? []) as { id: string; ad: string; baslangic: string; bitis: string; aktif: boolean }[];
      const grupRows = (grupRes.data ?? []) as { id: string; ad: string; renk: string; kapasite: number; fiyat: number | null }[];
      const today = new Date().toISOString().slice(0, 10);
      setSezonlar(sezonRows.map((r, i) => {
        const bas = r.baslangic || "";
        const bit = r.bitis || "";
        const b = sezonBadge(bas, bit, r.aktif ?? true);
        return {
          id: r.id,
          name: r.ad,
          bas,
          bit,
          dot: SEZON_RENK_PALETI[i % SEZON_RENK_PALETI.length],
          ...b,
        };
      }));
      setFiyatlar(grupRows.map((r) => {
        const f = Number(r.fiyat) || DEFAULT_FIYAT;
        const color = r.renk || TEAL;
        return {
          id: r.id,
          name: grupDisplayName(r.ad),
          sub: `${r.kapasite ?? 0} şezlong`,
          color,
          erken: f,
          yuksek: f,
          normal: f,
          minGun: 1,
          anlikColor: color,
        };
      }));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [tesisId]);

  // Kampanyalar: Supabase'ten çek
  async function fetchKampanyalar() {
    if (!tesisId) {
      setKampanyalar([]);
      return;
    }
    setKampanyaLoading(true);
    try {
      const { data, error } = await supabase
        .from("kampanyalar")
        .select("id, ad, aciklama, indirim_orani, baslangic_tarihi, bitis_tarihi, durum")
        .eq("tesis_id", tesisId)
        .order("created_at", { ascending: false });
      if (error || !data) {
        if (error) console.error("Kampanyalar çekilemedi:", error);
        setKampanyalar([]);
        return;
      }
      const rows = (data as any[]).map((r) => {
        const bas = (r.baslangic_tarihi as string | null) ?? "";
        const bit = (r.bitis_tarihi as string | null) ?? "";
        const headerBg = "linear-gradient(135deg," + ORANGE + ",#C2410C)";
        const durum: KampanyaDurum =
          r.durum === "planli" || r.durum === "tamamlandi" || r.durum === "durduruldu" ? r.durum : "aktif";
        return {
          id: String(r.id),
          name: r.ad ?? "Kampanya",
          bas,
          bit,
          tip: "oran" as const,
          indirimOran: Number(r.indirim_orani ?? 0),
          sabitFiyatlar: {},
          gruplar: [],
          musteriGoster: true,
          headerBg,
          durum,
        } as Kampanya;
      });
      setKampanyalar(rows);
    } finally {
      setKampanyaLoading(false);
    }
  }

  useEffect(() => {
    fetchKampanyalar();
  }, [tesisId]);

  // Genel Ayarlar: tesisler tablosundan yükle
  useEffect(() => {
    if (!tesisId) return;
    supabase
      .from("tesisler")
      .select("min_rezervasyon_suresi, erken_rezervasyon_indirimi, grup_rezervasyon_bonusu, son_dakika_indirimi, son_dakika_aktif, iptal_politikasi")
      .eq("id", tesisId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          console.error("Genel ayarlar yüklenemedi:", error);
          return;
        }
        const iptal = (data as any).iptal_politikasi as string | null;
        const isOzel = iptal && !["24 saat öncesine kadar tam iade", "48 saat öncesine kadar tam iade", "İade yok", "%50 iade"].includes(iptal);
        let ozelSaat = genelAyarlar.ozelSaat;
        if (isOzel) {
          const lower = iptal.toLowerCase();
          const saatIndex = lower.indexOf("saat");
          if (saatIndex > 0) {
            const before = lower.slice(0, saatIndex).trim();
            const parts = before.split(" ");
            const last = parts[parts.length - 1];
            const num = Number(last);
            if (!Number.isNaN(num) && num > 0) {
              ozelSaat = Math.min(168, Math.max(1, num));
            }
          }
        }
        setGA({
          minRezSure: Number((data as any).min_rezervasyon_suresi ?? genelAyarlar.minRezSure),
          erkenIndirim: Number((data as any).erken_rezervasyon_indirimi ?? genelAyarlar.erkenIndirim),
          grupBonus: Number((data as any).grup_rezervasyon_bonusu ?? genelAyarlar.grupBonus),
          sonDakikaToggle: Boolean((data as any).son_dakika_aktif ?? genelAyarlar.sonDakikaToggle),
          sonDakikaPct: Number((data as any).son_dakika_indirimi ?? genelAyarlar.sonDakikaPct),
          iptalPolitika: isOzel ? "ozel" : (iptal || genelAyarlar.iptalPolitika),
          ozelSaat,
        });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tesisId]);

  // ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSezonModal(false); setKampModal(false);
      setDurdurModal(null); setBaslatModal(null); setSilModal(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ── Sezon actions ──────────────────────────────────────────────────────────
  function openSezonEkle() { setEditSezon(null); setSezonForm(emptySezonForm); setSezonModal(true); }
  function openSezonDuzenle(s: SezonItem) { setEditSezon(s); setSezonForm({ name: s.name, bas: s.bas, bit: s.bit, renk: s.dot }); setSezonModal(true); }
  async function saveSezon() {
    const { name, bas, bit, renk } = sezonForm;
    if (!name || !bas || !bit || !tesisId) return;
    if (editSezon) {
      const { error } = await supabase.from("sezonlar").update({ ad: name, baslangic: bas, bitis: bit }).eq("id", editSezon.id);
      if (error) { showToast("❌ Sezon güncellenemedi"); return; }
      setSezonlar(p => p.map(s => s.id === editSezon.id ? { ...s, name, bas, bit, dot: renk } : s));
      showToast(`✅ "${name}" sezonu güncellendi`);
    } else {
      const tesisIdStr = typeof tesisId === "string" ? tesisId.trim() : String(tesisId);
      const payload = { tesis_id: tesisIdStr, ad: name, baslangic: bas, bitis: bit, aktif: true };
      console.log("[saveSezon] insert payload:", { tesis_id: tesisIdStr, tesis_id_length: tesisIdStr.length, ad: name, baslangic: bas, bitis: bit });
      const { data, error } = await supabase.from("sezonlar").insert(payload).select("id, ad, baslangic, bitis, aktif").single();
      if (error) {
        console.error("[saveSezon] Supabase insert error:", error);
        showToast(`❌ Sezon eklenemedi: ${error.message ?? JSON.stringify(error)}`);
        return;
      }
      if (!data) { showToast("❌ Sezon eklenemedi"); return; }
      const r = data as { id: string; ad: string; baslangic: string; bitis: string; aktif: boolean };
      const b = sezonBadge(r.baslangic, r.bitis, r.aktif);
      setSezonlar(p => [...p, { id: r.id, name: r.ad, bas: r.baslangic, bit: r.bitis, dot: renk, ...b }]);
      showToast(`✅ "${name}" sezonu eklendi`);
    }
    setSezonModal(false);
  }

  // ── Fiyat / Genel ──────────────────────────────────────────────────────────
  function updateFiyat(id: string, key: keyof FiyatRow, value: number) {
    setFiyatlar(p => p.map(f => f.id === id ? { ...f, [key]: value } : f));
  }
  function anlikFiyat(f: FiyatRow) {
    const v = seciliSezon === "yuksek" ? f.yuksek : seciliSezon === "normal" ? f.normal : f.erken;
    return `₺${v.toLocaleString("tr-TR")}`;
  }
  async function kaydetDegisiklikler() {
    for (const f of fiyatlar) {
      const val = seciliSezon === "yuksek" ? f.yuksek : seciliSezon === "normal" ? f.normal : f.erken;
      await supabase.from("sezlong_gruplari").update({ fiyat: val }).eq("id", f.id);
    }
    showToast("✅ Değişiklikler kaydedildi!");
  }

  async function kaydetGenelAyarlar() {
    if (!tesisId) {
      showToast("❌ Kayıt başarısız");
      return;
    }
    const iptal_politikasi =
      genelAyarlar.iptalPolitika === "ozel"
        ? `${genelAyarlar.ozelSaat} saat öncesine kadar tam iade`
        : genelAyarlar.iptalPolitika;
    const { error } = await supabase
      .from("tesisler")
      .update({
        min_rezervasyon_suresi: genelAyarlar.minRezSure,
        erken_rezervasyon_indirimi: genelAyarlar.erkenIndirim,
        grup_rezervasyon_bonusu: genelAyarlar.grupBonus,
        son_dakika_indirimi: genelAyarlar.sonDakikaPct,
        son_dakika_aktif: genelAyarlar.sonDakikaToggle,
        iptal_politikasi,
      })
      .eq("id", tesisId);
    if (error) {
      console.error("Genel ayarlar kaydedilemedi:", error);
      showToast("❌ Kayıt başarısız");
      return;
    }
    showToast("✅ Kaydedildi!");
  }

  // ── Kampanya actions ───────────────────────────────────────────────────────
  function openKampEkle() { setEditKamp(null); setKampForm(emptyKampForm); setKampModal(true); }
  function openKampDuzenle(k: Kampanya) {
    setEditKamp(k);
    setKampForm({ name: k.name, bas: k.bas, bit: k.bit, tip: k.tip, indirimOran: k.indirimOran, sabitFiyatlar: k.sabitFiyatlar, gruplar: k.gruplar, musteriGoster: k.musteriGoster });
    setKampModal(true);
  }
  async function saveKampanya() {
    if (!kampForm.name || !tesisId) {
      showToast("❌ Kayıt başarısız");
      return;
    }
    const payload = {
      tesis_id: tesisId,
      ad: kampForm.name,
      aciklama: "", // mevcut formda ayrı açıklama alanı yok
      indirim_orani: kampForm.indirimOran,
      baslangic_tarihi: kampForm.bas || null,
      bitis_tarihi: kampForm.bit || null,
      durum: "aktif",
    };
    const { error } = await supabase.from("kampanyalar").insert(payload);
    if (error) {
      console.error("Kampanya kaydedilemedi:", error);
      showToast("❌ Kayıt başarısız");
      return;
    }
    showToast(`✅ "${kampForm.name}" kampanyası oluşturuldu`);
    setKampModal(false);
    fetchKampanyalar();
  }
  function toggleGrupInForm(g: string) {
    setKampForm(p => ({ ...p, gruplar: p.gruplar.includes(g) ? p.gruplar.filter(x => x !== g) : [...p.gruplar, g] }));
  }
  function kopyala(k: Kampanya) {
    setKampanyalar(p => [...p, { ...k, id: Date.now(), name: `${k.name} (Kopya)`, durum: "planli" }]);
    showToast(`🔄 "${k.name}" kopyalandı — taslak oluşturuldu`);
  }

  // ── Shared styles ──────────────────────────────────────────────────────────
  const inputCls: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1.5px solid " + GRAY200, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" };
  const labelCls: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 };
  const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 };
  const modalBox = (w = 540): React.CSSProperties => ({ background: "white", borderRadius: 16, width: w, maxWidth: "95vw", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" });

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", flexDirection: "column", minHeight: "100%" }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, background: NAVY, color: "white", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {/* TOPBAR */}
      <header style={{ background: "white", borderBottom: "1px solid " + GRAY200, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Sezon & Fiyatlar</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>2026 Sezonu • Şu an: Erken Sezon</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={openKampEkle} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>🎯 Kampanya Oluştur</button>
          <button onClick={kaydetDegisiklikler} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>💾 Değişiklikleri Kaydet</button>
        </div>
      </header>

      <div style={{ padding: 24, flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* SEZON TANIMLARI */}
          <div style={{ background: "white", borderRadius: 14, border: "1px solid " + GRAY200, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid " + GRAY100, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>📅 Sezon Tanımları</h3>
              <button onClick={openSezonEkle} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "1px solid " + GRAY200, background: GRAY100, color: GRAY800, cursor: "pointer" }}>➕ Sezon Ekle</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>2026 Yıl Görünümü</div>
              <div style={{ background: GRAY100, borderRadius: 12, height: 36, position: "relative", overflow: "hidden", marginBottom: 6 }}>
                <div style={{ position: "absolute", left: 0,       top: 0, bottom: 0, width: "16.5%", background: GRAY300, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white" }}>Kapalı</div>
                <div style={{ position: "absolute", left: "16.5%", top: 0, bottom: 0, width: "25%",   background: BLUE,    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white" }}>Erken</div>
                <div style={{ position: "absolute", left: "41.5%", top: 0, bottom: 0, width: "25%",   background: ORANGE,  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white" }}>Yüksek</div>
                <div style={{ position: "absolute", left: "66.5%", top: 0, bottom: 0, width: "16.5%", background: TEAL,    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white" }}>Normal</div>
                <div style={{ position: "absolute", left: "83%",   top: 0, bottom: 0, width: "17%",   background: GRAY300, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white" }}>Kapalı</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0 2px", fontSize: 9, color: GRAY400 }}>
                <span>Oca</span><span>Mar</span><span>Haz</span><span>Eyl</span><span>Kas</span><span>Ara</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
                {sezonlar.map((s) => (
                  <div key={s.id} style={{ border: "1.5px solid " + (s.borderColor ?? GRAY200), borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, background: s.rowBg ?? "transparent", opacity: s.opacity ?? 1 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: s.dot }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block", fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2 }}>{s.name}</strong>
                      <span style={{ fontSize: 11, color: GRAY400 }}>{fmtTarih(s.bas, s.bit)}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: s.badgeBg, color: s.badgeColor }}>{s.badge}</span>
                    <button onClick={() => openSezonDuzenle(s)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "1px solid " + GRAY200, background: GRAY100, color: GRAY800, cursor: "pointer" }}>✏️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GENEL AYARLAR */}
          <div style={{ background: "white", borderRadius: 14, border: "1px solid " + GRAY200, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid " + GRAY100 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>⚙️ Genel Ayarlar</h3>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Minimum Rezervasyon Süresi */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: GRAY50, borderRadius: 10 }}>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Minimum Rezervasyon Süresi</div><div style={{ fontSize: 11, color: GRAY400 }}>Müşteri en az kaç saat önceden rezervasyon yapabilir</div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="number" value={genelAyarlar.minRezSure} onChange={(e) => setGAf("minRezSure", Number(e.target.value))} min={0} style={{ width: 70, padding: "7px 10px", border: "1.5px solid " + GRAY200, borderRadius: 8, fontSize: 12, textAlign: "center" }} />
                  <span style={{ fontSize: 12, color: GRAY600 }}>saat</span>
                </div>
              </div>
              {/* Erken Rezervasyon İndirimi */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: GRAY50, borderRadius: 10 }}>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Erken Rezervasyon İndirimi</div><div style={{ fontSize: 11, color: GRAY400 }}>3+ gün önceden yapılan rezervasyonlara indirim</div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="number" value={genelAyarlar.erkenIndirim} onChange={(e) => setGAf("erkenIndirim", Number(e.target.value))} min={0} max={50} style={{ width: 60, padding: "7px 10px", border: "1.5px solid " + GRAY200, borderRadius: 8, fontSize: 12, textAlign: "center" }} />
                  <span style={{ fontSize: 12, color: GRAY600 }}>%</span>
                </div>
              </div>
              {/* Grup Rezervasyon Bonusu */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: GRAY50, borderRadius: 10 }}>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Grup Rezervasyon Bonusu</div><div style={{ fontSize: 11, color: GRAY400 }}>4+ şezlong aynı anda rezerve edilirse</div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="number" value={genelAyarlar.grupBonus} onChange={(e) => setGAf("grupBonus", Number(e.target.value))} min={0} max={50} style={{ width: 60, padding: "7px 10px", border: "1.5px solid " + GRAY200, borderRadius: 8, fontSize: 12, textAlign: "center" }} />
                  <span style={{ fontSize: 12, color: GRAY600 }}>%</span>
                </div>
              </div>
              {/* Son Dakika İndirimi */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: GRAY50, borderRadius: 10 }}>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Son Dakika İndirimi</div><div style={{ fontSize: 11, color: GRAY400 }}>Gün içi boş kalan şezlonglara otomatik indirim</div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer", flexShrink: 0 }}>
                    <input type="checkbox" checked={genelAyarlar.sonDakikaToggle} onChange={(e) => setGAf("sonDakikaToggle", e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: "absolute", inset: 0, background: genelAyarlar.sonDakikaToggle ? TEAL : GRAY300, borderRadius: 20, transition: "0.3s" }}>
                      <span style={{ position: "absolute", width: 14, height: 14, left: 3, top: 3, background: "white", borderRadius: "50%", transition: "0.3s", transform: genelAyarlar.sonDakikaToggle ? "translateX(16px)" : "translateX(0)" }} />
                    </span>
                  </label>
                  <input type="number" value={genelAyarlar.sonDakikaPct} onChange={(e) => setGAf("sonDakikaPct", Number(e.target.value))} min={0} max={50} disabled={!genelAyarlar.sonDakikaToggle} style={{ width: 60, padding: "7px 10px", border: "1.5px solid " + GRAY200, borderRadius: 8, fontSize: 12, textAlign: "center", opacity: genelAyarlar.sonDakikaToggle ? 1 : 0.4 }} />
                  <span style={{ fontSize: 12, color: GRAY600 }}>%</span>
                </div>
              </div>
              {/* İptal Politikası */}
              <div style={{ padding: "12px 14px", background: GRAY50, borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div><div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>İptal Politikası</div><div style={{ fontSize: 11, color: GRAY400 }}>Rezervasyon iptalinde iade süresi</div></div>
                  <select value={genelAyarlar.iptalPolitika} onChange={(e) => setGAf("iptalPolitika", e.target.value)} style={{ padding: "7px 10px", border: "1px solid " + GRAY200, borderRadius: 8, fontSize: 12 }}>
                    <option>24 saat öncesine kadar tam iade</option>
                    <option>48 saat öncesine kadar tam iade</option>
                    <option>İade yok</option>
                    <option>%50 iade</option>
                    <option value="ozel">✏️ Özel Süre Belirle</option>
                  </select>
                </div>
                {genelAyarlar.iptalPolitika === "ozel" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid " + GRAY200 }}>
                    <span style={{ fontSize: 12, color: GRAY600, whiteSpace: "nowrap" }}>İade süresi:</span>
                    <input
                      type="number"
                      value={genelAyarlar.ozelSaat}
                      onChange={(e) => setGAf("ozelSaat", Math.min(168, Math.max(1, Number(e.target.value))))}
                      min={1} max={168}
                      style={{ width: 70, padding: "7px 10px", border: "1.5px solid " + TEAL, borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: "center" }}
                    />
                    <span style={{ fontSize: 12, color: GRAY600, whiteSpace: "nowrap" }}>saat öncesine kadar tam iade</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: GRAY400 }}>1 – 168 saat arası</span>
                  </div>
                )}
              </div>
              <button onClick={kaydetGenelAyarlar} style={{ padding: "9px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer", alignSelf: "flex-end" }}>💾 Kaydet</button>
            </div>
          </div>
        </div>

        {/* FİYAT TABLOSU */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid " + GRAY200, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid " + GRAY100, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>💰 Grup Fiyatları</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: GRAY400 }}>Sezon seç:</span>
              <select value={seciliSezon} onChange={(e) => setSeciliSezon(e.target.value)} style={{ padding: "6px 10px", border: "1px solid " + GRAY200, borderRadius: 8, fontSize: 12 }}>
                <option value="erken">🔵 Erken Sezon</option>
                <option value="yuksek">🟠 Yüksek Sezon</option>
                <option value="normal">🟢 Normal Sezon</option>
              </select>
              <button onClick={kaydetDegisiklikler} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>💾 Kaydet</button>
            </div>
          </div>
          <div style={{ padding: "0 8px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Grup","Erken Sezon","Yüksek Sezon","Normal Sezon","Min. Süre","Anlık Fiyat"].map((h) => (
                    <th key={h} style={{ fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 14px", textAlign: "left", background: GRAY50, borderBottom: "1px solid " + GRAY200 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fiyatlar.map((g) => (
                  <tr key={g.id} style={{ transition: "background 0.15s" }}>
                    <td style={{ padding: "12px 14px", borderBottom: "1px solid " + GRAY100 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: g.color }} />
                        <div><div style={{ fontWeight: 700, fontSize: 13 }}>{g.name}</div><div style={{ fontSize: 10, color: GRAY400 }}>{g.sub}</div></div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: "1px solid " + GRAY100 }}>
                      <input type="number" value={g.erken} onChange={(e) => updateFiyat(g.id, "erken", Number(e.target.value))} style={{ width: 90, padding: "7px 10px", border: "1.5px solid " + (seciliSezon === "erken" ? TEAL : GRAY200), borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: "right" }} />
                      <span style={{ fontSize: 11, color: GRAY400 }}> ₺</span>
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: "1px solid " + GRAY100 }}>
                      <input type="number" value={g.yuksek} onChange={(e) => updateFiyat(g.id, "yuksek", Number(e.target.value))} style={{ width: 90, padding: "7px 10px", border: "1.5px solid " + (seciliSezon === "yuksek" ? TEAL : GRAY200), borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: "right" }} />
                      <span style={{ fontSize: 11, color: GRAY400 }}> ₺</span>
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: "1px solid " + GRAY100 }}>
                      <input type="number" value={g.normal} onChange={(e) => updateFiyat(g.id, "normal", Number(e.target.value))} style={{ width: 90, padding: "7px 10px", border: "1.5px solid " + (seciliSezon === "normal" ? TEAL : GRAY200), borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: "right" }} />
                      <span style={{ fontSize: 11, color: GRAY400 }}> ₺</span>
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: "1px solid " + GRAY100 }}>
                      <input type="number" value={g.minGun} onChange={(e) => updateFiyat(g.id, "minGun", Number(e.target.value))} style={{ width: 70, padding: "7px 10px", border: "1.5px solid " + GRAY200, borderRadius: 8, fontSize: 12, textAlign: "center" }} />
                      <span style={{ fontSize: 11, color: GRAY400 }}> gün</span>
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: "1px solid " + GRAY100, fontSize: 15, fontWeight: 900, color: g.anlikColor }}>{anlikFiyat(g)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* KAMPANYALAR */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid " + GRAY200, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid " + GRAY100, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>🎯 Kampanyalar</h3>
            <button onClick={openKampEkle} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>➕ Kampanya Oluştur</button>
          </div>
          <div style={{ padding: 20 }}>
            {kampanyaLoading ? (
              <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: GRAY400 }}>Kampanyalar yükleniyor...</div>
            ) : kampanyalar.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: GRAY400 }}>Henüz kampanya oluşturulmadı</div>
            ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {kampanyalar.map((k) => {
                const chip = chipOf(k.durum);
                const chipOn = k.durum === "aktif";
                const isTamamlandi = k.durum === "tamamlandi";
                const kalan = k.durum === "planli" ? kalanGun(k.bit) : null;
                return (
                  <div key={k.id} style={{ borderRadius: 14, overflow: "hidden", border: "1.5px solid " + GRAY200, opacity: isTamamlandi ? 0.65 : 1 }}>
                    <div style={{ padding: "14px 16px", color: "white", position: "relative", background: k.headerBg }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 20, position: "absolute", top: 12, left: 14, background: chipOn ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)", color: chipOn ? "white" : "rgba(255,255,255,0.7)" }}>{chip}</span>
                      <div style={{ marginTop: 18 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>{k.name}</h4>
                        <span style={{ fontSize: 11, opacity: 0.85 }}>{fmtTarih(k.bas, k.bit)}</span>
                      </div>
                      <div style={{ position: "absolute", top: 12, right: 12, background: "white", borderRadius: 10, padding: "6px 12px", fontSize: 16, fontWeight: 900, color: k.tip === "oran" ? ORANGE : GRAY600 }}>
                        {k.tip === "oran" ? "%" + k.indirimOran : "Sabit"}
                      </div>
                    </div>
                    <div style={{ padding: "14px 16px", background: "white" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 12 }}>
                        <span style={{ color: GRAY400 }}>İndirim Tipi</span>
                        <span style={{ fontWeight: 700, color: NAVY }}>{k.tip === "oran" ? "Oran İndirimi" : "Sabit Fiyat"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 12 }}>
                        <span style={{ color: GRAY400 }}>Uygulanan Gruplar</span>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {k.gruplar.map((gr) => {
                            const gc = GRUP_COLORS[gr] ?? { bg: GRAY100, text: GRAY600 };
                            const label = gr.split(" ").slice(1).join(" ") || gr;
                            return <span key={gr} style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: gc.bg, color: gc.text }}>{label}</span>;
                          })}
                        </div>
                      </div>
                      {k.musteriGoster && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}><span style={{ color: GRAY400 }}>Müşteri Görünümü</span><span style={{ fontWeight: 700, color: GREEN }}>✓ Gösteriliyor</span></div>}
                      {kalan && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}><span style={{ color: GRAY400 }}>Kalan Süre</span><span style={{ fontWeight: 700, color: PURPLE }}>{kalan}</span></div>}
                      {k.durum === "durduruldu" && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}><span style={{ color: GRAY400 }}>Durum</span><span style={{ fontWeight: 700, color: GRAY400 }}>Durduruldu</span></div>}
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── SEZON MODAL ────────────────────────────────────────────────────────── */}
      {sezonModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setSezonModal(false)}>
          <div style={modalBox(440)} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid " + GRAY200, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{editSezon ? "✏️ Sezonu Düzenle" : "📅 Sezon Ekle"}</h3>
              <button onClick={() => setSezonModal(false)} style={{ width: 30, height: 30, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelCls}>Sezon Adı *</label>
                <input type="text" value={sezonForm.name} onChange={(e) => setSezonForm(p => ({ ...p, name: e.target.value }))} placeholder="örn: Erken Sezon, Yüksek Sezon..." style={inputCls} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelCls}>Başlangıç Tarihi *</label>
                  <input type="date" value={sezonForm.bas} onChange={(e) => setSezonForm(p => ({ ...p, bas: e.target.value }))} style={inputCls} />
                </div>
                <div>
                  <label style={labelCls}>Bitiş Tarihi *</label>
                  <input type="date" value={sezonForm.bit} onChange={(e) => setSezonForm(p => ({ ...p, bit: e.target.value }))} style={inputCls} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelCls}>Renk</label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {SEZON_RENKLERI.map((c) => (
                    <div key={c} onClick={() => setSezonForm(p => ({ ...p, renk: c }))} style={{ width: 32, height: 32, borderRadius: 10, background: c, cursor: "pointer", border: "3px solid " + (sezonForm.renk === c ? NAVY : "transparent"), transition: "border 0.15s", boxShadow: sezonForm.renk === c ? "0 0 0 2px white inset" : "none" }} />
                  ))}
                </div>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: GRAY50, borderRadius: 10 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: sezonForm.renk }} />
                  <span style={{ fontSize: 12, color: GRAY600 }}>Seçili renk önizlemesi</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: "16px 24px", borderTop: "1px solid " + GRAY200 }}>
              <button onClick={() => setSezonModal(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid " + GRAY200, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={saveSezon} disabled={!sezonForm.name || !sezonForm.bas || !sezonForm.bit} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: !sezonForm.name || !sezonForm.bas || !sezonForm.bit ? GRAY200 : TEAL, color: !sezonForm.name || !sezonForm.bas || !sezonForm.bit ? GRAY400 : "white", cursor: !sezonForm.name || !sezonForm.bas || !sezonForm.bit ? "not-allowed" : "pointer" }}>✅ {editSezon ? "Güncelle" : "Sezon Ekle"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── KAMPANYA MODAL ─────────────────────────────────────────────────────── */}
      {kampModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setKampModal(false)}>
          <div style={modalBox(540)} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid " + GRAY200, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{editKamp ? "✏️ Kampanya Düzenle" : "🎯 Yeni Kampanya Oluştur"}</h3>
              <button onClick={() => setKampModal(false)} style={{ width: 30, height: 30, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              {/* İsim */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelCls}>Kampanya Adı <span style={{ color: GRAY400, fontWeight: 400 }}>(Müşteride görünür)</span></label>
                <input type="text" value={kampForm.name} onChange={(e) => setKampForm(p => ({ ...p, name: e.target.value }))} placeholder="örn: Bahar İndirimi, Yaz Açılış..." style={inputCls} />
              </div>
              {/* Tarihler */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelCls}>Başlangıç Tarihi</label>
                  <input type="date" value={kampForm.bas} onChange={(e) => setKampForm(p => ({ ...p, bas: e.target.value }))} style={inputCls} />
                </div>
                <div>
                  <label style={labelCls}>Bitiş Tarihi</label>
                  <input type="date" value={kampForm.bit} onChange={(e) => setKampForm(p => ({ ...p, bit: e.target.value }))} style={inputCls} />
                </div>
              </div>
              {/* İndirim tipi */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelCls}>İndirim Tipi</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {([
                    { key: "oran", icon: "%", name: "Oran İndirimi", desc: "Mevcut fiyattan % indirim" },
                    { key: "sabit", icon: "₺", name: "Sabit Fiyat", desc: "Her grup için sabit fiyat gir" },
                  ] as const).map((op) => (
                    <button key={op.key} type="button" onClick={() => setKampForm(p => ({ ...p, tip: op.key }))} style={{ border: "2px solid " + (kampForm.tip === op.key ? ORANGE : GRAY200), borderRadius: 10, padding: 12, cursor: "pointer", textAlign: "center", background: kampForm.tip === op.key ? "#FFF9F5" : "transparent" }}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{op.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{op.name}</div>
                      <div style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>{op.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Oran input */}
              {kampForm.tip === "oran" && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelCls}>İndirim Oranı</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="number" value={kampForm.indirimOran} onChange={(e) => setKampForm(p => ({ ...p, indirimOran: Number(e.target.value) }))} min={1} max={90} style={{ width: 120, padding: "10px 12px", border: "1.5px solid " + GRAY200, borderRadius: 8, fontSize: 13 }} />
                    <span style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>%</span>
                    <span style={{ fontSize: 11, color: GRAY400 }}>indirim uygulanacak</span>
                  </div>
                </div>
              )}
              {/* Sabit fiyatlar */}
              {kampForm.tip === "sabit" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  {GRUPLAR_LIST.map((gr) => (
                    <div key={gr}>
                      <label style={labelCls}>{gr} Sabit Fiyat</label>
                      <input type="number" value={kampForm.sabitFiyatlar[gr] ?? ""} onChange={(e) => setKampForm(p => ({ ...p, sabitFiyatlar: { ...p.sabitFiyatlar, [gr]: Number(e.target.value) } }))} placeholder="₺" style={inputCls} />
                    </div>
                  ))}
                </div>
              )}
              {/* Gruplar */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelCls}>Uygulanan Gruplar</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {GRUPLAR_LIST.map((gr) => {
                    const gc = GRUP_COLORS[gr] ?? { bg: GRAY100, text: GRAY600 };
                    const checked = kampForm.gruplar.includes(gr);
                    return (
                      <label key={gr} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "1.5px solid " + (checked ? TEAL : GRAY200), borderRadius: 10, cursor: "pointer", background: checked ? "rgba(10,186,181,0.04)" : "white" }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleGrupInForm(gr)} style={{ accentColor: TEAL, width: 16, height: 16 }} />
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: gc.text }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{gr}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              {/* Müşteri göster */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelCls}>Müşteri Tarafında Göster</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: GRAY50, padding: 12, borderRadius: 10 }}>
                  <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }}>
                    <input type="checkbox" checked={kampForm.musteriGoster} onChange={(e) => setKampForm(p => ({ ...p, musteriGoster: e.target.checked }))} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: "absolute", inset: 0, background: kampForm.musteriGoster ? TEAL : GRAY300, borderRadius: 20, transition: "0.3s" }}>
                      <span style={{ position: "absolute", width: 14, height: 14, left: 3, top: 3, background: "white", borderRadius: "50%", transition: "0.3s", transform: kampForm.musteriGoster ? "translateX(16px)" : "translateX(0)" }} />
                    </span>
                  </label>
                  <span style={{ fontSize: 12, color: GRAY600 }}>Rezervasyon sayfasında kampanya adı ve indirimi göster</span>
                </div>
              </div>
              {/* Önizleme */}
              {kampForm.tip === "oran" && kampForm.indirimOran > 0 && kampForm.gruplar.length > 0 && (
                  <div style={{ background: GRAY50, borderRadius: 10, padding: 14, border: "1px solid " + GRAY200 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Fiyat Önizleme (%{kampForm.indirimOran} indirim)</div>
                  {kampForm.gruplar.slice(0, 3).map((gr) => {
                    const fObj = fiyatlar.find(function(f) { return f.name === gr; }); const base = fObj ? (fObj.erken ?? 0) : 0;
                    const disc = Math.round(base * (1 - kampForm.indirimOran / 100));
                    return base > 0 ? (
                      <div key={gr} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: GRAY600 }}>{gr}</span>
                        <span><s style={{ color: GRAY400 }}>₺{base.toLocaleString("tr-TR")}</s> → <strong style={{ color: ORANGE }}>₺{disc.toLocaleString("tr-TR")}</strong></span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: "16px 24px", borderTop: "1px solid " + GRAY200 }}>
              <button onClick={() => setKampModal(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid " + GRAY200, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => { saveKampanya(); }} disabled={!kampForm.name} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: !kampForm.name ? GRAY200 : ORANGE, color: !kampForm.name ? GRAY400 : "white", cursor: !kampForm.name ? "not-allowed" : "pointer" }}>
                {editKamp ? "💾 Güncelle" : "🚀 Kampanyayı Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DURDUR ONAY MODAL ──────────────────────────────────────────────────── */}
      {durdurModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setDurdurModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 380, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏸</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Kampanyayı Durdur</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 4 }}>Bu kampanya durdurulacak:</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 20 }}>{durdurModal.name}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setDurdurModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid " + GRAY200, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Vazgeç</button>
              <button onClick={() => { setKampanyalar(p => p.map(k => k.id === durdurModal.id ? { ...k, durum: "durduruldu" } : k)); showToast(`⏸ "${durdurModal.name}" durduruldu`); setDurdurModal(null); }} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", background: YELLOW, color: "white", cursor: "pointer" }}>⏸ Durdur</button>
            </div>
          </div>
        </div>
      )}

      {/* ── BAŞLAT ONAY MODAL ──────────────────────────────────────────────────── */}
      {baslatModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setBaslatModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 380, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>▶️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Kampanyayı Başlat</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 4 }}>Bu kampanya hemen aktif olacak:</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 20 }}>{baslatModal.name}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setBaslatModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid " + GRAY200, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Vazgeç</button>
              <button onClick={() => { setKampanyalar(p => p.map(k => k.id === baslatModal.id ? { ...k, durum: "aktif" } : k)); showToast(`▶ "${baslatModal.name}" başlatıldı`); setBaslatModal(null); }} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", background: GREEN, color: "white", cursor: "pointer" }}>▶ Şimdi Başlat</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SİL ONAY MODAL ────────────────────────────────────────────────────── */}
      {silModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setSilModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 380, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Kampanyayı Sil</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 4 }}>Bu işlem geri alınamaz.</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 20 }}>{silModal.name}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setSilModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid " + GRAY200, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Vazgeç</button>
              <button onClick={() => { setKampanyalar(p => p.filter(k => k.id !== silModal.id)); showToast(`🗑️ "${silModal.name}" silindi`); setSilModal(null); }} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", background: RED, color: "white", cursor: "pointer" }}>🗑️ Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






