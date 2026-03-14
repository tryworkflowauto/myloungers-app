"use client";

import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

// HTML :root ile birebir
const NAVY = "#0A1628";
const TEAL = "#0ABAB5";
const ORANGE = "#F5821F";
const GREEN = "#10B981";
const RED = "#EF4444";
const YELLOW = "#F59E0B";
const BLUE = "#3B82F6";
const PURPLE = "#7C3AED";
const GRAY50 = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY300 = "#CBD5E1";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const GOLD_PURPLE = "#8B5CF6";

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const GUNLER = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

type SezonData = {
  ad: string;
  tesis: string;
  baslangic: string;
  bitis: string;
  kalanGun: number;
  doluluk: number;
  haftalikGelir: string;
  hava: { derece: number; durum: string; ruzgar: string; deniz: string };
};

type StatItem = {
  etiket: string;
  ikon: string;
  deger: string;
  ek?: string;
  sub: string;
  change: string;
  changeClass: "up" | "neutral" | "down";
  renk: string;
};

type DolulukGrubu = {
  ad: string;
  ikon: string;
  sayi: number;
  dolu: number;
  bos: number;
  yuzde: number;
  renk: string;
};

type RezervasyonItem = {
  baslik: string;
  detay: string;
  saat: string;
  bg: string;
  initials: string;
};

type YorumItem = {
  puan: number;
  isim: string;
  tarih: string;
  text: string;
  pozitif: boolean;
};

type SiparisItem = {
  no: string;
  urunler: string;
  musteri: string;
  sure: string;
  sureTip: string;
  durum: string;
  durumTip: string;
};

const MOCK_UYARILAR = [
  { ikon: "🍽️", baslik: "5 Bekleyen Sipariş", detay: "En eskisi 18 dk önce", renk: "turuncu", href: "/isletme/siparisler" },
  { ikon: "⭐", baslik: "3 Cevaplanmayan Yorum", detay: "1 şikayet içeriyor", renk: "kirmizi", href: "/isletme/yorumlar" },
  { ikon: "💰", baslik: "5 Bakiye Sona Eriyor", detay: "3 gün içinde · ₺3.840", renk: "sari", href: "/isletme/raporlar" },
  { ikon: "📋", baslik: "Yarın 8 Rezervasyon", detay: "İlk giriş saat 09:00", renk: "mavi", href: "/isletme/rezervasyonlar" },
];

const MOCK_SIPARISLER: SiparisItem[] = [
  { no: "S-22", urunler: "Mojito × 2 · Nachos", musteri: "Ayşe Y. · Silver", sure: "18dk", sureTip: "danger", durum: "Yeni", durumTip: "yeni" },
  { no: "V-3", urunler: "Izgara Levrek · Rosé", musteri: "Fatma D. · VIP", sure: "12dk", sureTip: "warn", durum: "Hazırlanıyor", durumTip: "hazir" },
  { no: "İ-5", urunler: "Limonata × 3", musteri: "Mehmet K. · İskele", sure: "4dk", sureTip: "ok", durum: "Hazırlanıyor", durumTip: "hazir" },
  { no: "G-1", urunler: "Kahvaltı Tabağı × 2", musteri: "Banu K. · Gold", sure: "2dk", sureTip: "ok", durum: "Yeni", durumTip: "yeni" },
];

const MOCK_BAKIYE = [
  { initials: "BK", isim: "Banu Koç", detay: "₺120 kalan · S-22", gun: 5 },
  { initials: "SE", isim: "Selin Erdoğan", detay: "₺3.200 kalan · V-8,9,10", gun: 3 },
];

const GRUP_IKONLAR: Record<string, string> = { Gold: "⭐", VIP: "🔥", İskele: "⚓", Silver: "🌊" };
const RENK_PALETI = [GOLD_PURPLE, ORANGE, YELLOW, TEAL, BLUE, PURPLE];

// TODO: API'den çekilecek
const HIZLI_EYLEMLER = [
  { ikon: "📋", label: "Rezervasyon Oluştur", href: "/isletme/rezervasyonlar" },
  { ikon: "🏖️", label: "Şezlong Haritası", href: "/isletme/sezlong-haritasi" },
  { ikon: "🍽️", label: "Siparişlere Git", href: "/isletme/siparisler" },
  { ikon: "💬", label: "Yorumları Cevapla", href: "/isletme/yorumlar" },
];

function formatTarihShort(d: Date): string {
  return `${d.getDate()} ${AYLAR[d.getMonth()].slice(0, 3)}`;
}

function formatSezonTarih(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${AYLAR[d.getMonth()]} ${d.getFullYear()}`;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";
}

export default function IsletmeDashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const tesisId = (session?.user as { tesis_id?: string } | undefined)?.tesis_id ?? null;

  const [loading, setLoading] = useState(true);
  const [sezonData, setSezonData] = useState<SezonData | null>(null);
  const [statData, setStatData] = useState<StatItem[]>([]);
  const [dolulukGruplari, setDolulukGruplari] = useState<DolulukGrubu[]>([]);
  const [dolulukLegend, setDolulukLegend] = useState({ dolu: 0, rezerve: 0, bos: 0, bakim: 0 });
  const [rezervasyonlar, setRezervasyonlar] = useState<RezervasyonItem[]>([]);
  const [yorumlar, setYorumlar] = useState<YorumItem[]>([]);

  const [tarih, setTarih] = useState("");
  const [saat, setSaat] = useState("--:--");
  const [rezervasyonModalOpen, setRezervasyonModalOpen] = useState(false);
  const [rezForm, setRezForm] = useState({ musteriAdi: "", telefon: "", sezlongGrubu: "Gold", sezlongNo: "", tarih: "", kisiSayisi: "" });
  const [siparisDetayModal, setSiparisDetayModal] = useState<SiparisItem | null>(null);

  useEffect(() => {
    const now = new Date();
    setTarih(`${now.getDate()} ${AYLAR[now.getMonth()]} ${now.getFullYear()} · ${GUNLER[now.getDay()]}`);
    const guncelle = () => {
      const n = new Date();
      setSaat(`${n.getHours().toString().padStart(2, "0")}:${n.getMinutes().toString().padStart(2, "0")}`);
    };
    guncelle();
    const t = setInterval(guncelle, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRezervasyonModalOpen(false);
        setSiparisDetayModal(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!tesisId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);

      const [tesisRes, sezonRes, gruplarRes, sezlonglarRes, rezRes, yorumRes, siparisRes] = await Promise.all([
        supabase.from("tesisler").select("id, ad").eq("id", tesisId).maybeSingle(),
        supabase.from("sezonlar").select("id, ad, baslangic, bitis").eq("tesis_id", tesisId).eq("aktif", true).order("bitis", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("sezlong_gruplari").select("id, ad, renk").eq("tesis_id", tesisId),
        supabase.from("sezlonglar").select("id, grup_id, durum").eq("tesis_id", tesisId),
        supabase.from("rezervasyonlar").select("id, baslangic_tarih, bitis_tarih, kisi_sayisi, kullanici_id, kullanicilar(ad)").eq("tesis_id", tesisId).gte("bitis_tarih", today).order("baslangic_tarih", { ascending: true }).limit(10),
        supabase.from("yorumlar").select("id, puan, yorum, created_at, kullanici_id, kullanicilar(ad)").eq("tesis_id", tesisId).eq("durum", "aktif").order("created_at", { ascending: false }).limit(5),
        supabase.from("siparisler").select("id, durum, created_at").eq("tesis_id", tesisId).gte("created_at", `${today}T00:00:00Z`),
      ]);

      if (cancelled) return;

      const tesis = (tesisRes.data as { id: string; ad: string } | null) ?? null;
      const tesisAdi = tesis?.ad ?? "Tesis";
      const sezon = sezonRes.data as { ad: string; baslangic: string; bitis: string } | null;
      const gruplar = (gruplarRes.data ?? []) as { id: string; ad: string; renk: string }[];
      const sezlonglar = (sezlonglarRes.data ?? []) as { id: string; grup_id: string; durum: string }[];
      const doluN = sezlonglar.filter((s) => s.durum === "dolu").length;
      const rezerveN = sezlonglar.filter((s) => s.durum === "rezerve").length;
      const bosN = sezlonglar.filter((s) => s.durum === "bos").length;
      const bakimN = sezlonglar.filter((s) => s.durum === "bakim").length;
      setDolulukLegend({ dolu: doluN, rezerve: rezerveN, bos: bosN, bakim: bakimN });
      const rezList = (rezRes.data ?? []) as any[];
      const yorumList = (yorumRes.data ?? []) as any[];
      const siparisBugun = (siparisRes.data ?? []) as { durum: string }[];

      const now = new Date();
      let kalanGun = 0;
      let baslangicStr = "";
      let bitisStr = "";
      if (sezon?.baslangic && sezon?.bitis) {
        const bitisDate = new Date(sezon.bitis);
        kalanGun = Math.max(0, Math.ceil((bitisDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
        baslangicStr = formatSezonTarih(sezon.baslangic);
        bitisStr = formatSezonTarih(sezon.bitis);
      }

      const grupMap = new Map<string, { toplam: number; dolu: number }>();
      for (const g of gruplar) {
        grupMap.set(g.id, { toplam: 0, dolu: 0 });
      }
      for (const s of sezlonglar) {
        const g = grupMap.get(s.grup_id);
        if (g) {
          g.toplam += 1;
          if (s.durum === "dolu" || s.durum === "rezerve") g.dolu += 1;
        }
      }

      const toplamSezlong = sezlonglar.length;
      const doluSezlong = sezlonglar.filter((s) => s.durum === "dolu" || s.durum === "rezerve").length;
      const dolulukYuzde = toplamSezlong > 0 ? Math.round((doluSezlong / toplamSezlong) * 100) : 0;

      setSezonData({
        ad: sezon?.ad ?? "Sezon",
        tesis: tesisAdi,
        baslangic: baslangicStr || "—",
        bitis: bitisStr || "—",
        kalanGun,
        doluluk: dolulukYuzde,
        haftalikGelir: "₺—",
        hava: { derece: 24, durum: "Açık", ruzgar: "12 km/s", deniz: "Sakin" },
      });

      setStatData([
        { etiket: "Günlük Gelir", ikon: "💰", deger: "₺—", sub: "Bugün", change: "—", changeClass: "neutral", renk: "teal" },
        { etiket: "Aktif Şezlonglar", ikon: "🏖️", deger: String(doluSezlong), ek: `/${toplamSezlong}`, sub: `${toplamSezlong - doluSezlong} boş şezlong`, change: "= Veri", changeClass: "neutral", renk: "orange" },
        { etiket: "Tamamlanan Sipariş", ikon: "🍽️", deger: String(siparisBugun.filter((s) => s.durum === "teslim").length), sub: "Bugün", change: "—", changeClass: "neutral", renk: "green" },
        { etiket: "Aktif Müşteri", ikon: "👥", deger: "—", sub: "Tesiste", change: "—", changeClass: "neutral", renk: "purple" },
      ]);

      const dolulukList: DolulukGrubu[] = gruplar.map((g, i) => {
        const st = grupMap.get(g.id) ?? { toplam: 0, dolu: 0 };
        const bos = st.toplam - st.dolu;
        const yuzde = st.toplam > 0 ? Math.round((st.dolu / st.toplam) * 100) : 0;
        return {
          ad: g.ad,
          ikon: GRUP_IKONLAR[g.ad] ?? "🏖️",
          sayi: st.toplam,
          dolu: st.dolu,
          bos,
          yuzde,
          renk: g.renk || RENK_PALETI[i % RENK_PALETI.length],
        };
      });
      setDolulukGruplari(dolulukList);

      const rezItems: RezervasyonItem[] = rezList.map((r, i) => {
        const ad = (r as any).kullanicilar?.ad ?? "Misafir";
        const saatStr = r.baslangic_tarih?.includes("T") ? new Date(r.baslangic_tarih).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "—";
        return {
          baslik: ad,
          detay: `${r.kisi_sayisi ?? 0} Kişi`,
          saat: saatStr,
          bg: RENK_PALETI[i % RENK_PALETI.length],
          initials: getInitials(ad),
        };
      });
      setRezervasyonlar(rezItems);

      const yorumItems: YorumItem[] = yorumList.map((y) => {
        const isim = (y as any).kullanicilar?.ad ?? "Anonim";
        const tarihStr = y.created_at ? formatTarihShort(new Date(y.created_at)) : "—";
        return {
          puan: Number(y.puan),
          isim,
          tarih: tarihStr,
          text: y.yorum ?? "",
          pozitif: Number(y.puan) >= 7,
        };
      });
      setYorumlar(yorumItems);

      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [tesisId, sessionStatus]);

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800 }}>
        <div style={{ fontSize: 14, color: GRAY600 }}>Yükleniyor...</div>
      </div>
    );
  }

  if (!tesisId) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800 }}>
        <div style={{ fontSize: 14, color: GRAY600 }}>Bu sayfa için tesis atanmamış. Lütfen personel hesabınızla giriş yapın.</div>
      </div>
    );
  }

  const sezon = sezonData ?? {
    ad: "Sezon",
    tesis: "Tesis",
    baslangic: "—",
    bitis: "—",
    kalanGun: 0,
    doluluk: 0,
    haftalikGelir: "₺—",
    hava: { derece: 24, durum: "Açık", ruzgar: "12 km/s", deniz: "Sakin" },
  };

  return (
    <div className="flex flex-col min-h-full" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800 }}>
      {/* TOPBAR — .topbar exact match */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between"
        style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60 }}
      >
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Dashboard</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>{tarih || "—"}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div
            style={{ fontSize: 13, fontWeight: 800, color: TEAL, background: "rgba(10,186,181,0.1)", padding: "6px 12px", borderRadius: 8 }}
          >
            {saat}
          </div>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg text-white transition-colors cursor-pointer"
            style={{ background: TEAL, padding: "8px 14px", fontSize: 12, fontWeight: 600 }}
            onClick={() => setRezervasyonModalOpen(true)}
          >
            <Plus size={14} />
            Hızlı Rezervasyon
          </button>
        </div>
      </header>

      {/* CONTENT — .content padding 20px 24px */}
      <div className="flex-1" style={{ padding: "20px 24px" }}>
        {/* SEZON BANNER — .sezon-banner exact */}
        <div
          className="flex flex-wrap items-center justify-between gap-4"
          style={{
            marginBottom: 20,
            background: "linear-gradient(135deg,#0A1628 0%,#0d2244 50%,#0a3d3b 100%)",
            borderRadius: 14,
            padding: "18px 24px",
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "white", marginBottom: 3 }}>🌸 {sezon.ad}</h2>
            <span style={{ fontSize: 12, color: GRAY400 }}>{sezon.tesis} · {sezon.baslangic} — {sezon.bitis}</span>
          </div>
          <div className="flex gap-7">
            <div><div style={{ fontSize: 24, fontWeight: 900, color: TEAL }}>{sezon.kalanGun}</div><div style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>Kalan Gün</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 900, color: ORANGE }}>%{sezon.doluluk}</div><div style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>Doluluk</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 900, color: GREEN }}>{sezon.haftalikGelir}</div><div style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>Haftalık Gelir</div></div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "12px 18px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22 }}>☀️</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "white" }}>{sezon.hava.derece}°</div>
            <div style={{ fontSize: 11, color: GRAY400, marginTop: 2 }}>Bodrum · {sezon.hava.durum}</div>
            <div style={{ fontSize: 9, color: GRAY400, marginTop: 3 }}>💨 {sezon.hava.ruzgar} · 🌊 {sezon.hava.deniz}</div>
          </div>
        </div>

        {/* UYARILAR — .uyari-row, .uyari-kart + turuncu/kirmizi/sari/mavi + renkleri */}
        <div className="flex gap-2.5 mb-5 flex-wrap">
          {MOCK_UYARILAR.map((u, i) => {
            const styles: Record<string, { bg: string; border: string; strong: string; span: string }> = {
              turuncu: { bg: "#FFF7ED", border: "#FED7AA", strong: "#C2410C", span: "#EA580C" },
              kirmizi: { bg: "#FEF2F2", border: "#FECACA", strong: "#991B1B", span: "#DC2626" },
              sari: { bg: "#FFFBEB", border: "#FDE68A", strong: "#92400E", span: "#D97706" },
              mavi: { bg: "#EFF6FF", border: "#BFDBFE", strong: "#1E40AF", span: "#2563EB" },
            };
            const s = styles[u.renk];
            return (
              <Link
                key={i}
                href={u.href}
                className="flex-1 min-w-[200px] rounded-xl flex items-center gap-2.5 cursor-pointer"
                style={{ background: s.bg, border: `1.5px solid ${s.border}`, padding: "12px 16px", textDecoration: "none", color: "inherit" }}
              >
                <span style={{ fontSize: 22 }}>{u.ikon}</span>
                <div>
                  <strong style={{ display: "block", fontSize: 12, fontWeight: 700, color: s.strong }}>{u.baslik}</strong>
                  <span style={{ fontSize: 11, opacity: 0.8, color: s.span }}>{u.detay}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* STAT KARTLARI — .stat-grid, .stat-kart teal/orange/green/purple */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
          {(statData.length ? statData : [{ etiket: "—", ikon: "💰", deger: "—", sub: "—", change: "—", changeClass: "neutral" as const, renk: "teal" }]).map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-[14px] relative overflow-hidden"
              style={{ border: `1px solid ${GRAY200}`, padding: "18px 20px" }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: s.renk === "teal" ? TEAL : s.renk === "orange" ? ORANGE : s.renk === "green" ? GREEN : PURPLE }}
              />
              <div style={{ fontSize: 11, color: GRAY400, fontWeight: 600, marginBottom: 8 }}>{s.ikon} {s.etiket}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: NAVY, lineHeight: 1, marginBottom: 4 }}>
                {s.deger}<span style={{ fontSize: 16, color: GRAY400, fontWeight: 600 }}>{s.ek || ""}</span>
              </div>
              <div style={{ fontSize: 11, color: GRAY400 }}>{s.sub}</div>
              <div
                className="inline-flex items-center gap-0.5 rounded-[20px] mt-1.5"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 7px",
                  background: s.changeClass === "up" ? "#DCFCE7" : s.changeClass === "neutral" ? GRAY100 : "#DCFCE7",
                  color: s.changeClass === "up" ? "#16A34A" : s.changeClass === "neutral" ? GRAY600 : "#16A34A",
                }}
              >
                {s.change}
              </div>
            </div>
          ))}
        </div>

        {/* DOLULUK WRAP — .doluluk-wrap (HTML'de doluluk-legend + grup-doluluk) */}
        <div
          className="mb-5 rounded-[14px]"
          style={{ background: "white", border: `1px solid ${GRAY200}`, padding: "18px 20px" }}
        >
          <div className="flex gap-4 flex-wrap mb-3.5">
            <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: GRAY600 }}><div className="w-2.5 h-2.5 rounded-sm" style={{ background: ORANGE }} />Dolu ({dolulukLegend.dolu})</div>
            <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: GRAY600 }}><div className="w-2.5 h-2.5 rounded-sm" style={{ background: BLUE }} />Rezerve ({dolulukLegend.rezerve})</div>
            <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: GRAY600 }}><div className="w-2.5 h-2.5 rounded-sm" style={{ background: GREEN }} />Boş ({dolulukLegend.bos})</div>
            <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: GRAY600 }}><div className="w-2.5 h-2.5 rounded-sm" style={{ background: GRAY300 }} />Bakım ({dolulukLegend.bakim})</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {dolulukGruplari.map((g, i) => (
              <div
                key={i}
                className="rounded-[10px] p-3"
                style={{ background: GRAY50, border: `1px solid ${GRAY200}` }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{g.ikon} {g.ad} ({g.sayi})</div>
                <div className="rounded-[20px] h-1.5 overflow-hidden mb-1" style={{ background: GRAY200 }}>
                  <div className="h-full rounded-[20px]" style={{ width: `${g.yuzde}%`, background: g.renk }} />
                </div>
                <div style={{ fontSize: 10, color: GRAY400 }} className="flex justify-between"><span>{g.dolu} dolu</span><span>{g.bos} boş</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* HIZLI EYLEMLER — .hizli-grid, .hizli-btn, emoji yerine lucide */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {HIZLI_EYLEMLER.map((h, i) => {
            const cardStyle = {
              background: "white" as const,
              border: `1.5px solid ${GRAY200}`,
              padding: "16px 12px",
            };
            const commonProps = {
              className: "flex flex-col items-center gap-2 cursor-pointer transition-all rounded-xl",
              style: cardStyle,
              onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.borderColor = TEAL;
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(10,186,181,0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              },
              onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.borderColor = GRAY200;
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.transform = "";
              },
            };
            if (h.label === "Rezervasyon Oluştur") {
              return (
                <div key={i} {...commonProps} onClick={() => setRezervasyonModalOpen(true)} role="button">
                  <span style={{ fontSize: 26 }}>{h.ikon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: NAVY, textAlign: "center" }}>{h.label}</span>
                </div>
              );
            }
            return (
              <Link key={i} href={h.href} {...commonProps}>
                <span style={{ fontSize: 26 }}>{h.ikon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: NAVY, textAlign: "center" }}>{h.label}</span>
              </Link>
            );
          })}
        </div>

        {/* 3 KOLON — .three-col */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* AKTİF SİPARİŞLER — .kart, .kart-header, .siparis-row */}
          <div className="bg-white rounded-[14px] overflow-hidden" style={{ border: `1px solid ${GRAY200}` }}>
            <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}` }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>🍽️ Aktif Siparişler</h3>
              <span style={{ fontSize: 10, fontWeight: 700, color: ORANGE, background: "#FFF7ED", padding: "2px 8px", borderRadius: 20 }}>5 Bekliyor</span>
            </div>
            {MOCK_SIPARISLER.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 cursor-pointer last:border-b-0"
                style={{ padding: "11px 18px", borderBottom: `1px solid ${GRAY100}` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = GRAY50; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                onClick={() => setSiparisDetayModal(s)}
              >
                <div
                  className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[11px] font-extrabold flex-shrink-0"
                  style={{ background: NAVY, color: TEAL }}
                >
                  {s.no}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{s.urunler}</div>
                  <div style={{ fontSize: 10, color: GRAY400 }}>{s.musteri}</div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 20,
                    background: s.sureTip === "ok" ? "#DCFCE7" : s.sureTip === "warn" ? "#FEF3C7" : "#FEE2E2",
                    color: s.sureTip === "ok" ? "#16A34A" : s.sureTip === "warn" ? "#D97706" : RED,
                  }}
                >
                  {s.sure}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 20,
                    background: s.durumTip === "yeni" ? "#EFF6FF" : "#FEF3C7",
                    color: s.durumTip === "yeni" ? BLUE : "#D97706",
                  }}
                >
                  {s.durum}
                </span>
              </div>
            ))}
            <div style={{ padding: "10px 18px", borderTop: `1px solid ${GRAY100}` }}>
              <Link href="/isletme/siparisler" className="block w-full rounded-lg text-center" style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, background: GRAY100, color: GRAY800, border: `1px solid ${GRAY200}`, textDecoration: "none" }}>
                Tüm Siparişleri Gör →
              </Link>
            </div>
          </div>

          {/* YARIN REZERVASYONLAR */}
          <div className="bg-white rounded-[14px] overflow-hidden" style={{ border: `1px solid ${GRAY200}` }}>
            <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}` }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>📅 Yaklaşan Rezervasyonlar</h3>
              <span style={{ fontSize: 10, fontWeight: 700, color: BLUE, background: "#EFF6FF", padding: "2px 8px", borderRadius: 20 }}>{rezervasyonlar.length} Rezervasyon</span>
            </div>
            {rezervasyonlar.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 cursor-pointer last:border-b-0"
                style={{ padding: "11px 18px", borderBottom: `1px solid ${GRAY100}` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = GRAY50; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
              >
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0"
                  style={{ background: r.bg }}
                >
                  {r.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{r.baslik}</div>
                  <div style={{ fontSize: 10, color: GRAY400 }}>{r.detay}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEAL }}>{r.saat}</span>
              </div>
            ))}
            <div style={{ padding: "10px 18px", borderTop: `1px solid ${GRAY100}` }}>
              <Link href="/isletme/rezervasyonlar" className="block w-full rounded-lg text-center" style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, background: GRAY100, color: GRAY800, border: `1px solid ${GRAY200}`, textDecoration: "none" }}>
                Tüm Rezervasyonlar →
              </Link>
            </div>
          </div>

          {/* YORUMLAR + BAKİYE */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[14px] overflow-hidden" style={{ border: `1px solid ${GRAY200}` }}>
              <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}` }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>⭐ Son Yorumlar</h3>
                <span style={{ fontSize: 10, fontWeight: 700, color: RED, background: "#FEF2F2", padding: "2px 8px", borderRadius: 20 }}>{yorumlar.length} Yorum</span>
              </div>
              {yorumlar.map((y, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 cursor-pointer last:border-b-0"
                  style={{
                    padding: "11px 18px",
                    borderBottom: `1px solid ${GRAY100}`,
                    background: !y.pozitif ? "#FEF2F2" : undefined,
                  }}
                  onMouseEnter={(e) => { if (y.pozitif) e.currentTarget.style.background = GRAY50; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = !y.pozitif ? "#FEF2F2" : ""; }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      padding: "3px 8px",
                      borderRadius: 8,
                      color: "white",
                      background: y.pozitif ? GREEN : RED,
                      flexShrink: 0,
                    }}
                  >
                    {y.puan}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 10, fontWeight: 700, color: !y.pozitif ? RED : NAVY, marginBottom: 2 }}>
                      {!y.pozitif ? "⚠️ " : ""}{y.isim} · {y.tarih}
                    </div>
                    <div style={{ fontSize: 12, color: GRAY600, lineHeight: 1.5 }}>{y.text}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: "10px 18px", borderTop: `1px solid ${GRAY100}` }}>
                <Link href="/isletme/yorumlar" className="block w-full rounded-lg text-center" style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, background: GRAY100, color: GRAY800, border: `1px solid ${GRAY200}`, textDecoration: "none" }}>
                  Yorumları Cevapla →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-[14px] overflow-hidden" style={{ border: `1px solid ${GRAY200}` }}>
              <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}` }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>💰 Sona Yakın Bakiyeler</h3>
                <span style={{ fontSize: 10, fontWeight: 700, color: YELLOW, background: "#FFFBEB", padding: "2px 8px", borderRadius: 20 }}>5 Müşteri</span>
              </div>
              {MOCK_BAKIYE.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 cursor-pointer last:border-b-0"
                  style={{ padding: "11px 18px", borderBottom: `1px solid ${GRAY100}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = GRAY50; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                >
                  <div
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0"
                    style={{ background: i === 0 ? RED : PURPLE }}
                  >
                    {b.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{b.isim}</div>
                    <div style={{ fontSize: 10, color: GRAY400 }}>{b.detay}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "#FEE2E2", color: RED }}>
                    ⚠️ {b.gun} Gün
                  </span>
                </div>
              ))}
              <div style={{ padding: "10px 18px", borderTop: `1px solid ${GRAY100}` }}>
                <Link href="/isletme/raporlar" className="block w-full rounded-lg text-center" style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, background: GRAY100, color: GRAY800, border: `1px solid ${GRAY200}`, textDecoration: "none" }}>
                  Bakiye Raporuna Git →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sipariş Detay Modal */}
      {siparisDetayModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setSiparisDetayModal(null)}
        >
          <div
            style={{ background: "white", borderRadius: 14, width: 340, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>🍽️ Sipariş Detayı</h3>
              <button onClick={() => setSiparisDetayModal(null)} style={{ background: GRAY100, border: "none", borderRadius: 8, width: 28, height: 28, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <div style={{ padding: "18px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: NAVY, color: TEAL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{siparisDetayModal.no}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{siparisDetayModal.musteri}</div>
                  <div style={{ fontSize: 12, color: GRAY600, marginTop: 2 }}>{siparisDetayModal.urunler}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: siparisDetayModal.sureTip === "ok" ? "#DCFCE7" : siparisDetayModal.sureTip === "warn" ? "#FEF3C7" : "#FEE2E2", color: siparisDetayModal.sureTip === "ok" ? "#16A34A" : siparisDetayModal.sureTip === "warn" ? "#D97706" : RED }}>{siparisDetayModal.sure}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: siparisDetayModal.durumTip === "yeni" ? "#EFF6FF" : "#FEF3C7", color: siparisDetayModal.durumTip === "yeni" ? BLUE : "#D97706" }}>{siparisDetayModal.durum}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setSiparisDetayModal(null)} style={{ flex: 1, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Hazırlandı</button>
                <button onClick={() => setSiparisDetayModal(null)} style={{ flex: 1, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>Teslim Et</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rezervasyon Modal */}
      {rezervasyonModalOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setRezervasyonModalOpen(false)}
        >
          <div
            style={{ background: "white", borderRadius: 16, width: 400, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${GRAY100}` }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>Yeni Rezervasyon Oluştur</h2>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Müşteri Adı</label>
                <input
                  type="text"
                  value={rezForm.musteriAdi}
                  onChange={(e) => setRezForm((f) => ({ ...f, musteriAdi: e.target.value }))}
                  placeholder="Ad Soyad"
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Telefon</label>
                <input
                  type="tel"
                  value={rezForm.telefon}
                  onChange={(e) => setRezForm((f) => ({ ...f, telefon: e.target.value }))}
                  placeholder="+90 5xx xxx xx xx"
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Şezlong Grubu</label>
                <select
                  value={rezForm.sezlongGrubu}
                  onChange={(e) => setRezForm((f) => ({ ...f, sezlongGrubu: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, background: "white" }}
                >
                  <option value="Gold">Gold</option>
                  <option value="VIP">VIP</option>
                  <option value="İskele">İskele</option>
                  <option value="Silver">Silver</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Şezlong No</label>
                <input
                  type="text"
                  value={rezForm.sezlongNo}
                  onChange={(e) => setRezForm((f) => ({ ...f, sezlongNo: e.target.value }))}
                  placeholder="örn: S-22"
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Tarih</label>
                <input
                  type="date"
                  value={rezForm.tarih}
                  onChange={(e) => setRezForm((f) => ({ ...f, tarih: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
                />
              </div>
              <div style={{ marginBottom: 0 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Kişi Sayısı</label>
                <input
                  type="number"
                  min={1}
                  value={rezForm.kisiSayisi}
                  onChange={(e) => setRezForm((f) => ({ ...f, kisiSayisi: e.target.value }))}
                  placeholder="2"
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
                />
              </div>
            </div>
            <div style={{ padding: "14px 24px", borderTop: `1px solid ${GRAY100}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setRezervasyonModalOpen(false)}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}
              >
                İptal
              </button>
              <button
                onClick={() => { /* TODO: API'ye kaydet */ setRezervasyonModalOpen(false); setRezForm({ musteriAdi: "", telefon: "", sezlongGrubu: "Gold", sezlongNo: "", tarih: "", kisiSayisi: "" }); }}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}
              >
                Rezervasyonu Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
