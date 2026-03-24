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
const PURPLE = "#7C3AED";

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
];

const DONEM_STATS: Record<string, { toplam: string; sezlong: string; siparis: string; sonaEren: string; change: string }> = {
  bugun:  { toplam: "₺18.400",  sezlong: "₺11.200", siparis: "₺7.200",  sonaEren: "₺600",   change: "↑ %8 dünkü güne göre" },
  hafta:  { toplam: "₺148.400", sezlong: "₺89.500", siparis: "₺52.600", sonaEren: "₺6.300", change: "↑ %18 geçen haftaya göre" },
  ay:     { toplam: "₺375.000", sezlong: "₺225.000", siparis: "₺132.000", sonaEren: "₺18.000", change: "↑ %22 geçen aya göre" },
  yil:    { toplam: "₺1.280.000", sezlong: "₺768.000", siparis: "₺441.600", sonaEren: "₺70.400", change: "↑ %31 geçen yıla göre" },
};

// GRUP_GELIR ve ODEME_KANAL mock verileri kaldırıldı; ilgili bölümler şimdilik "Yakında" gösteriyor.

// GARSON_ROWS ve SAATLIK_TESLIMAT mock verileri kaldırıldı; Garson sekmesi Supabase'e bağlı.

// Ürün satışları için Supabase verisi kullanılacak; URUN_ROWS ve URUN_KATEGORILER mock'ları kaldırıldı.

type GunlukItem = {
  gun: string;
  teal: number;
  orange: number;
  tealVal: string;
  sipVal: number;
  sezVal: number;
  isToday: boolean;
  label?: string;
};

type TabKey = "gelir" | "bakiye" | "garson" | "urun";
type GarsonSort = "teslimat" | "sure" | "tip" | "puan";

type GarsonRow = {
  inits: string;
  name: string;
  rol: string;
  avatarBg: string;
  teslimat: number;
  musteri: number;
  sureMin: number;
  sure: string;
  perf: number;
  puan: string;
  puanNum: number;
  tip: string;
  tipNum: number;
};

// ── Component ────────────────────────────────────────────────────────────────
export default function IsletmeRaporlarPage() {
  const router = useRouter();
  const [tesisId, setTesisId] = useState<string | null>(null);

  const [activeTab, setActiveTab]     = useState<TabKey>("gelir");
  const [donemGelir, setDonemGelir]   = useState("hafta");
  const [donemGarson, setDonemGarson] = useState("bugun");
  const [donemUrun, setDonemUrun]     = useState("hafta");

  // Date range
  const [tarihBaslangic, setTarihBaslangic] = useState("2026-03-01");
  const [tarihBitis, setTarihBitis]         = useState("2026-03-11");
  const [uygulanmisTarih, setUygulanmisTarih] = useState<{ bas: string; bit: string } | null>(null);

  // Bar chart tooltip
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  // Modals
  const [statDetay, setStatDetay]   = useState<{ label: string; val: string; items: { k: string; v: string }[] } | null>(null);

  // Garson sort
  const [garsonSort, setGarsonSort]   = useState<GarsonSort>("teslimat");
  const [garsonSortDir, setGarsonSortDir] = useState<"desc" | "asc">("desc");
  const [garsonRows, setGarsonRows] = useState<GarsonRow[]>([]);
  const [urunData, setUrunData] = useState<{ ad: string; kategori: string; satis: number; fiyat: number; toplam: number }[]>([]);
  const [urunLoading, setUrunLoading] = useState(false);
  const [urunStats, setUrunStats] = useState<{ toplamSiparis: number; toplamCiro: number; enCokSatan: string; enCokSatanAdet: number }>({
    toplamSiparis: 0,
    toplamCiro: 0,
    enCokSatan: "",
    enCokSatanAdet: 0,
  });

  // Ürün filter
  const [urunKat, setUrunKat] = useState("Tüm Kategoriler");

  // Gelir stat verileri (Supabase)
  const [sumRez, setSumRez] = useState(0);
  const [sumSip, setSumSip] = useState(0);
  const [gunlukChartData, setGunlukChartData] = useState<GunlukItem[]>([]);
  const [grupBazliGelirRows, setGrupBazliGelirRows] = useState<{ grup: string; toplam: number; rezervasyon: number }[]>([]);
  const [bakiyeRows, setBakiyeRows] = useState<any[]>([]);
  const [bakiyeSearch, setBakiyeSearch] = useState("");
  const [bakiyeDurum, setBakiyeDurum] = useState("");
  const [bakiyeData, setBakiyeData] = useState<{ musteri_adi: string; telefon: string; yuklenen: number; harcanan: number; kalan: number; son_tarih: string | null; durum: string }[]>([]);
  const [bakiyeLoading, setBakiyeLoading] = useState(false);
  const [riskliMusteri, setRiskliMusteri] = useState<{ sayi: number; toplam: number }>({ sayi: 0, toplam: 0 });

  // ESC closes modals
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setStatDetay(null); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const getTesisId = async () => {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (cancelled) return;
      if (authErr || !authData?.user) {
        setTesisId(null);
        return;
      }
      const { data: kullanici, error: kullaniciErr } = await supabase
        .from("kullanicilar")
        .select("tesis_id")
        .eq("id", authData.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (kullaniciErr || !kullanici?.tesis_id) {
        setTesisId(null);
        return;
      }
      setTesisId(String(kullanici.tesis_id));
    };
    getTesisId();
    return () => {
      cancelled = true;
    };
  }, []);

  // Supabase: rezervasyonlar + siparisler (toplamlar)
  useEffect(() => {
    if (!tesisId) {
      setSumRez(0);
      setSumSip(0);
      return;
    }
    supabase
      .from("rezervasyonlar")
      .select("toplam_tutar")
      .eq("tesis_id", tesisId)
      .then(({ data, error }) => {
        console.log("[sumRez] tesisId:", tesisId, "data:", data, "error:", error);
        if (error) {
          console.error("rezervasyonlar sum error:", error);
          setSumRez(0);
          return;
        }
        const total = (data ?? []).reduce((acc: number, r: any) => acc + Number(r.toplam_tutar ?? 0), 0);
        setSumRez(total);
      });
    supabase
      .from("siparisler")
      .select("toplam")
      .eq("tesis_id", tesisId)
      .then(({ data, error }) => {
        console.log("[sumSip] tesisId:", tesisId, "data:", data, "error:", error);
        if (error) {
          console.error("siparisler sum error:", error);
          setSumSip(0);
          return;
        }
        const total = (data ?? []).reduce((acc: number, r: any) => acc + Number(r.toplam ?? 0), 0);
        setSumSip(total);
      });
  }, [tesisId]);

  // Bakiye takibi: rezervasyonlar
  async function fetchBakiyeler() {
    if (!tesisId) {
      setBakiyeRows([]);
      setBakiyeData([]);
      setRiskliMusteri({ sayi: 0, toplam: 0 });
      return;
    }
    setBakiyeLoading(true);
    try {
      const { data, error } = await supabase
        .from("rezervasyonlar")
        .select("id, musteri_adi, telefon, sezlong_id, bakiye_yuklenen, bakiye_harcanan, bakiye_kalan, bakiye_son_tarih, durum, sezlonglar(numara, sezlong_gruplari(ad))")
        .eq("tesis_id", tesisId)
        .gt("bakiye_yuklenen", 0);
      if (error || !data) {
        if (error) console.error("bakiye fetch error:", error);
        setBakiyeRows([]);
        setBakiyeData([]);
        setRiskliMusteri({ sayi: 0, toplam: 0 });
        return;
      }
      const now = new Date();
      let riskToplam = 0;
      let riskSayi = 0;
      const yeniData: { musteri_adi: string; telefon: string; yuklenen: number; harcanan: number; kalan: number; son_tarih: string | null; durum: string }[] = [];
      const rows = data
        .slice()
        .sort((a, b) => Number((b as any).bakiye_kalan ?? 0) - Number((a as any).bakiye_kalan ?? 0))
        .map((r, idx) => {
          const kalanSayi = Number(r.bakiye_kalan ?? 0);
          const sonTarihStr = r.bakiye_son_tarih ?? null;
          const son = sonTarihStr ? new Date(sonTarihStr) : null;
          let durumKod: "aktif" | "yaklasan" | "suresi_gecti" | "bitti" = "aktif";
          let durumText = "Aktif";
          if (kalanSayi <= 0) {
            durumKod = "bitti";
            durumText = "Sona Erdi";
          } else if (son && son < now) {
            durumKod = "suresi_gecti";
            durumText = "Süresi Geçti";
          } else if (son && son <= new Date(now.getTime() + 7 * 86400000)) {
            durumKod = "yaklasan";
            durumText = "Yaklaşan";
          }
          if (durumKod === "suresi_gecti" || durumKod === "yaklasan") {
            riskSayi += 1;
            riskToplam += kalanSayi;
          }
          yeniData.push({
            musteri_adi: r.musteri_adi || "",
            telefon: r.telefon || "",
            yuklenen: Number(r.bakiye_yuklenen ?? 0),
            harcanan: Number(r.bakiye_harcanan ?? 0),
            kalan: kalanSayi,
            son_tarih: sonTarihStr,
            durum: durumText,
          });
          return {
            inits: (r.musteri_adi || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
            name: r.musteri_adi || "",
            sezlong: (() => {
              const num = (r as any).sezlonglar?.numara as number | undefined;
              const grupAd = (r as any).sezlonglar?.sezlong_gruplari?.ad?.trim() as string | undefined;
              if (num && grupAd) return `${grupAd.charAt(0)}-${num} • ${grupAd}`;
              if (num) return String(num);
              return "";
            })(),
            avatarBg: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length],
            yuklenen: `₺${Number(r.bakiye_yuklenen ?? 0).toLocaleString("tr-TR")}`,
            harcanan: `₺${Number(r.bakiye_harcanan ?? 0).toLocaleString("tr-TR")}`,
            kalan: `₺${kalanSayi.toLocaleString("tr-TR")}`,
            kalanSayi,
            kalanColor: kalanSayi <= 0 ? "#ef4444" : "#0ab5b5",
            sonTarih: sonTarihStr ?? "",
            sonTarihWarn: son ? son <= new Date(now.getTime() + 3 * 86400000) : false,
            sonTarihGray: !sonTarihStr,
            durum: durumKod,
            durumLabel:
              durumKod === "bitti"
                ? "✗ Sona Erdi"
                : durumKod === "suresi_gecti"
                ? "✗ Süresi Geçti"
                : durumKod === "yaklasan"
                ? "⚠ Yaklaşan"
                : "✓ Aktif",
            rowBg: null,
            opacity: 1,
          };
        });
      setBakiyeRows(rows);
      setBakiyeData(yeniData);
      setRiskliMusteri({ sayi: riskSayi, toplam: riskToplam });
    } finally {
      setBakiyeLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === "bakiye") {
      fetchBakiyeler();
    }
  }, [activeTab, tesisId]);

  // Garson performansı: personel + siparisler
  useEffect(() => {
    if (!tesisId) {
      setGarsonRows([]);
      return;
    }
    Promise.all([
      supabase
        .from("personel")
        .select("id, ad, rol")
        .eq("tesis_id", tesisId)
        .eq("rol", "garson"),
      supabase
        .from("siparisler")
        .select("garson_id, teslim_suresi, memnuniyet, toplam, created_at")
        .eq("tesis_id", tesisId),
    ]).then(([garsonRes, sipRes]) => {
      if (garsonRes.error) {
        console.error("garson fetch error:", garsonRes.error);
        setGarsonRows([]);
        return;
      }
      if (sipRes.error) {
        console.error("garson siparis fetch error:", sipRes.error);
        setGarsonRows([]);
        return;
      }
      const garsons = (garsonRes.data ?? []) as any[];
      const sips = (sipRes.data ?? []) as any[];
      const rows: GarsonRow[] = garsons.map((g, idx) => {
        const gid = String(g.id);
        const mySips = sips.filter((s) => String(s.garson_id) === gid);
        const teslimat = mySips.length;
        const musteri = teslimat; // şu an müşteri sayısı için ayrı alan yok, teslimat ile eşitleniyor
        const sureAvg =
          teslimat === 0
            ? 0
            : mySips.reduce((sum, s) => sum + Number(s.teslim_suresi ?? 0), 0) / teslimat;
        const puanAvg =
          teslimat === 0
            ? 0
            : mySips.reduce((sum, s) => sum + Number(s.memnuniyet ?? 0), 0) / teslimat;
        const tipToplam = mySips.reduce((sum, s) => sum + Number(s.toplam ?? 0), 0);
        const perf = teslimat === 0 ? 0 : Math.min(100, Math.round((teslimat / 50) * 100));
        const inits =
          (g.ad ?? "")
            .split(" ")
            .map((w: string) => w[0]?.toUpperCase() ?? "")
            .slice(0, 2)
            .join("") || "?";
        return {
          inits,
          name: g.ad ?? "Garson",
          rol: "🛵 Garson",
          avatarBg: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length],
          teslimat,
          musteri,
          sureMin: Math.round(sureAvg),
          sure: teslimat === 0 ? "—" : `${Math.round(sureAvg)}dk`,
          perf,
          puanNum: Number(puanAvg.toFixed(1)),
          puan: puanAvg === 0 ? "0.0" : puanAvg.toFixed(1),
          tipNum: tipToplam,
          tip: `₺${tipToplam.toLocaleString("tr-TR")}`,
        };
      });
      setGarsonRows(rows);
    });
  }, [tesisId]);

  // Ürün satışları: siparisler + siparis_kalemleri
  async function fetchUrunSatislari() {
    if (!tesisId) {
      setUrunData([]);
      setUrunStats({ toplamSiparis: 0, toplamCiro: 0, enCokSatan: "", enCokSatanAdet: 0 });
      return;
    }
    setUrunLoading(true);
    try {
      const now = new Date();
      let start = new Date();
      if (donemUrun === "bugun") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (donemUrun === "hafta") {
        start = new Date(now.getTime() - 7 * 86400000);
      } else {
        start = new Date(now.getTime() - 30 * 86400000);
      }
      const startIso = start.toISOString();
      const endIso = now.toISOString();

      const { data: siparisler, error: sipErr } = await supabase
        .from("siparisler")
        .select("id, created_at")
        .eq("tesis_id", tesisId)
        .gte("created_at", startIso)
        .lte("created_at", endIso);
      if (sipErr) {
        console.error("urun siparisler error:", sipErr);
        setUrunData([]);
        setUrunStats({ toplamSiparis: 0, toplamCiro: 0, enCokSatan: "", enCokSatanAdet: 0 });
        return;
      }
      const sipIds = (siparisler ?? []).map((s: any) => s.id);
      if (sipIds.length === 0) {
        setUrunData([]);
        setUrunStats({ toplamSiparis: 0, toplamCiro: 0, enCokSatan: "", enCokSatanAdet: 0 });
        return;
      }

      const { data: kalemler, error: kalemErr } = await supabase
        .from("siparis_kalemleri")
        .select("ad, fiyat, adet")
        .in("siparis_id", sipIds);
      if (kalemErr) {
        console.error("urun siparis_kalemleri error:", kalemErr);
        setUrunData([]);
        setUrunStats({ toplamSiparis: 0, toplamCiro: 0, enCokSatan: "", enCokSatanAdet: 0 });
        return;
      }

      const map = new Map<string, { ad: string; kategori: string; satis: number; fiyat: number; toplam: number }>();
      for (const k of kalemler ?? []) {
        const ad = (k as any).ad ?? "Bilinmeyen Ürün";
        const fiyat = Number((k as any).fiyat ?? 0);
        const adet = Number((k as any).adet ?? 0);
        const key = ad;
        const prev = map.get(key);
        if (!prev) {
          map.set(key, { ad, kategori: "Genel", satis: adet, fiyat, toplam: fiyat * adet });
        } else {
          prev.satis += adet;
          prev.toplam += fiyat * adet;
        }
      }

      const list = Array.from(map.values()).sort((a, b) => b.satis - a.satis);
      setUrunData(list);

      if (list.length === 0) {
        setUrunStats({ toplamSiparis: 0, toplamCiro: 0, enCokSatan: "", enCokSatanAdet: 0 });
      } else {
        const toplamSiparis = list.reduce((sum, u) => sum + u.satis, 0);
        const toplamCiro = list.reduce((sum, u) => sum + u.toplam, 0);
        setUrunStats({
          toplamSiparis,
          toplamCiro,
          enCokSatan: list[0].ad,
          enCokSatanAdet: list[0].satis,
        });
      }
    } finally {
      setUrunLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === "urun") {
      fetchUrunSatislari();
    }
  }, [activeTab, donemUrun, tesisId]);

  useEffect(() => {
    const now = new Date();
    let bas = new Date(now);
    let bit = new Date(now);

    if (donemGelir === "bugun") {
      bas = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      bit = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (donemGelir === "hafta") {
      const day = now.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      bas = new Date(now);
      bas.setDate(now.getDate() - diffToMonday);
      bit = new Date(bas);
      bit.setDate(bas.getDate() + 6);
    } else if (donemGelir === "ay") {
      bas = new Date(now.getFullYear(), now.getMonth(), 1);
      bit = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      bas = new Date(now.getFullYear(), 0, 1);
      bit = new Date(now.getFullYear(), 11, 31);
    }

    const basStr = `${bas.getFullYear()}-${String(bas.getMonth() + 1).padStart(2, "0")}-${String(bas.getDate()).padStart(2, "0")}`;
    const bitStr = `${bit.getFullYear()}-${String(bit.getMonth() + 1).padStart(2, "0")}-${String(bit.getDate()).padStart(2, "0")}`;
    setTarihBaslangic(basStr);
    setTarihBitis(bitStr);
    setUygulanmisTarih({ bas: basStr, bit: bitStr });
  }, [donemGelir]);

  useEffect(() => {
    if (!tesisId) { setBakiyeRows([]); return; }
    supabase
      .from("rezervasyonlar")
      .select("id, musteri_adi, telefon, sezlong_id, bakiye_yuklenen, bakiye_harcanan, bakiye_kalan, bakiye_son_tarih, durum, sezlonglar(numara, sezlong_gruplari(ad))")
      .eq("tesis_id", tesisId)
      .gt("bakiye_yuklenen", 0)
      .then(({ data, error }) => {
        if (error || !data) { setBakiyeRows([]); return; }
        setBakiyeRows(data.map((r, idx) => {
          const kalanSayi = Number(r.bakiye_kalan ?? 0);
          return {
            inits: (r.musteri_adi || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
            name: r.musteri_adi || "",
            sezlong: (() => {
              const num = (r as any).sezlonglar?.numara as number | undefined;
              const grupAd = (r as any).sezlonglar?.sezlong_gruplari?.ad?.trim() as string | undefined;
              if (num && grupAd) return `${grupAd.charAt(0)}-${num} • ${grupAd}`;
              if (num) return String(num);
              return "";
            })(),
            avatarBg: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length],
            yuklenen: `₺${Number(r.bakiye_yuklenen ?? 0).toLocaleString("tr-TR")}`,
            harcanan: `₺${Number(r.bakiye_harcanan ?? 0).toLocaleString("tr-TR")}`,
            kalan: `₺${kalanSayi.toLocaleString("tr-TR")}`,
            kalanSayi,
          kalanColor: kalanSayi <= 0 ? "#ef4444" : "#0ab5b5",
            sonTarih: r.bakiye_son_tarih ?? "",
            sonTarihWarn: r.bakiye_son_tarih ? new Date(r.bakiye_son_tarih) <= new Date(Date.now() + 3 * 86400000) : false,
            sonTarihGray: !r.bakiye_son_tarih,
          durum: kalanSayi <= 0
            ? "bitti"
            : (r.bakiye_son_tarih && new Date(r.bakiye_son_tarih) < new Date()
              ? "suresi_gecti"
              : (r.bakiye_son_tarih && new Date(r.bakiye_son_tarih) <= new Date(Date.now() + 3 * 86400000)
                ? "yaklasan"
                : "aktif")),
          durumLabel: kalanSayi <= 0
            ? "✗ Sona Erdi"
            : (r.bakiye_son_tarih && new Date(r.bakiye_son_tarih) < new Date()
              ? "✗ Süresi Geçti"
              : (r.bakiye_son_tarih && new Date(r.bakiye_son_tarih) <= new Date(Date.now() + 3 * 86400000)
                ? "⚠ Yaklaşan"
                : "✓ Aktif")),
            rowBg: null,
            opacity: 1,
          };
        }));
      });
  }, [tesisId]);

  useEffect(() => {
    async function fetchGunlukData() {
      if (!tesisId) {
        setGunlukChartData([]);
        return;
      }

      const now = new Date();
      let start = new Date(now);
      let end = new Date(now);
      if (donemGelir === "bugun") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      } else if (donemGelir === "hafta") {
        const day = now.getDay(); // 0: Pazar, 1: Pazartesi, ...
        const diffToMonday = day === 0 ? 6 : day - 1;
        start = new Date(now);
        start.setDate(now.getDate() - diffToMonday);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
      } else if (donemGelir === "ay") {
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else {
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      }

      const startIso = start.toISOString();
      const endIso = end.toISOString();
      console.log("[getGunlukData] date range:", { donemGelir, startIso, endIso });

      const [rezRes, sipRes] = await Promise.all([
        supabase
          .from("rezervasyonlar")
          .select("created_at, toplam_tutar")
          .eq("tesis_id", tesisId)
          .gte("created_at", startIso)
          .lte("created_at", endIso),
        supabase
          .from("siparisler")
          .select("created_at, toplam")
          .eq("tesis_id", tesisId)
          .gte("created_at", startIso)
          .lte("created_at", endIso),
      ]);

      console.log("[getGunlukData] rezervasyonlar raw:", {
        startIso,
        endIso,
        data: rezRes.data,
        error: rezRes.error,
      });
      console.log("[getGunlukData] siparisler raw:", {
        startIso,
        endIso,
        data: sipRes.data,
        error: sipRes.error,
      });

      if (rezRes.error || sipRes.error) {
        if (rezRes.error) console.error("gunluk rezervasyonlar error:", rezRes.error);
        if (sipRes.error) console.error("gunluk siparisler error:", sipRes.error);
        setGunlukChartData([]);
        return;
      }
      console.log("[getGunlukData] supabase row counts:", {
        rezervasyonlar: rezRes.data?.length ?? 0,
        siparisler: sipRes.data?.length ?? 0,
      });

      const monthsShort = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
      const weekdaysShort = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
      const bucket = new Map<string, { gun: string; sezVal: number; sipVal: number; isToday: boolean }>();

      const keyOf = (dt: Date) => {
        if (donemGelir === "yil") return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
        return dt.toISOString().slice(0, 10);
      };
      const labelOf = (dt: Date) => {
        if (donemGelir === "bugun") return String(dt.getHours()).padStart(2, "0");
        if (donemGelir === "hafta") return weekdaysShort[dt.getDay()];
        if (donemGelir === "ay") return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
        return monthsShort[dt.getMonth()];
      };

      if (donemGelir === "yil") {
        for (let m = 0; m < 12; m++) {
          const d = new Date(now.getFullYear(), m, 1);
          const key = keyOf(d);
          bucket.set(key, { gun: labelOf(d), sezVal: 0, sipVal: 0, isToday: m === now.getMonth() });
        }
      } else if (donemGelir === "bugun") {
        for (let h = 0; h < 24; h++) {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, 0, 0, 0);
          const key = `${d.toISOString().slice(0, 13)}:00`;
          bucket.set(key, { gun: String(h).padStart(2, "0"), sezVal: 0, sipVal: 0, isToday: h === now.getHours() });
        }
      } else {
        const days = donemGelir === "hafta" ? 7 : 30;
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const key = keyOf(d);
          bucket.set(key, { gun: labelOf(d), sezVal: 0, sipVal: 0, isToday: key === now.toISOString().slice(0, 10) });
        }
      }

      (rezRes.data ?? []).forEach((r: any) => {
        const dt = r.created_at ? new Date(r.created_at) : null;
        if (!dt) return;
        const key = donemGelir === "bugun" ? `${dt.toISOString().slice(0, 13)}:00` : keyOf(dt);
        if (!bucket.has(key)) return;
        bucket.get(key)!.sezVal += Number(r.toplam_tutar ?? 0);
      });

      (sipRes.data ?? []).forEach((s: any) => {
        const dt = s.created_at ? new Date(s.created_at) : null;
        if (!dt) return;
        const key = donemGelir === "bugun" ? `${dt.toISOString().slice(0, 13)}:00` : keyOf(dt);
        if (!bucket.has(key)) return;
        bucket.get(key)!.sipVal += Number(s.toplam ?? 0);
      });

      const maxSez = Math.max(1, ...Array.from(bucket.values()).map((v) => v.sezVal));
      const maxSip = Math.max(1, ...Array.from(bucket.values()).map((v) => v.sipVal));
      const rows: GunlukItem[] = Array.from(bucket.values()).map((v) => ({
        gun: v.gun,
        teal: Math.round((v.sezVal / maxSez) * 100),
        orange: Math.round((v.sipVal / maxSip) * 100),
        tealVal: `₺${v.sezVal.toLocaleString("tr-TR")}`,
        sezVal: v.sezVal,
        sipVal: v.sipVal,
        isToday: v.isToday,
      }));
      setGunlukChartData(rows);
    }
    fetchGunlukData();
  }, [donemGelir, tesisId]);

  useEffect(() => {
    async function fetchGrupBazliGelir() {
      if (!tesisId || !tarihBaslangic || !tarihBitis) {
        setGrupBazliGelirRows([]);
        return;
      }

      const startIso = `${tarihBaslangic}T00:00:00.000`;
      const endIso = `${tarihBitis}T23:59:59.999`;

      const { data, error } = await supabase
        .from("rezervasyonlar")
        .select("toplam_tutar, sezlonglar(sezlong_gruplari(ad))")
        .eq("tesis_id", tesisId)
        .gte("created_at", startIso)
        .lte("created_at", endIso);

      if (error) {
        console.error("grup bazli gelir fetch error:", error);
        setGrupBazliGelirRows([]);
        return;
      }

      const grouped = new Map<string, { toplam: number; rezervasyon: number }>();
      (data ?? []).forEach((r: any) => {
        const grupAd = (r as any)?.sezlonglar?.sezlong_gruplari?.ad?.trim() || "Grupsuz";
        const tutar = Number(r?.toplam_tutar ?? 0);
        const prev = grouped.get(grupAd) ?? { toplam: 0, rezervasyon: 0 };
        grouped.set(grupAd, { toplam: prev.toplam + tutar, rezervasyon: prev.rezervasyon + 1 });
      });

      const rows = Array.from(grouped.entries())
        .map(([grup, vals]) => ({ grup, toplam: vals.toplam, rezervasyon: vals.rezervasyon }))
        .sort((a, b) => b.toplam - a.toplam);

      setGrupBazliGelirRows(rows);
    }

    fetchGrupBazliGelir();
  }, [tesisId, tarihBaslangic, tarihBitis]);

  // ── Derived data ─────────────────────────────────────────────────────────
  function getGunlukData(): GunlukItem[] {
    console.log("[DEBUG] getGunlukData called, tesisId:", tesisId, "donem:", donemGelir);
    console.log("[getGunlukData] chart item count:", gunlukChartData.length);
    return gunlukChartData;
  }

  const donemStat = {
    toplam: `₺${(sumRez + sumSip).toLocaleString("tr-TR")}`,
    sezlong: `₺${sumRez.toLocaleString("tr-TR")}`,
    siparis: `₺${sumSip.toLocaleString("tr-TR")}`,
    sonaEren: "₺0",
    change: "",
  };

  const filteredBakiye = bakiyeRows.filter((r) => {
    if (bakiyeSearch && !r.name.toLowerCase().includes(bakiyeSearch.toLowerCase())) return false;
    if (bakiyeDurum && r.durum !== bakiyeDurum) return false;
    return true;
  });

  const riskRows = bakiyeRows.filter((r) => r.durum === "yaklasan" || r.durum === "suresi_gecti");
  const riskCount = riskliMusteri.sayi;
  const riskTotal = riskliMusteri.toplam;

  const sortedGarsonlar = [...garsonRows].sort((a, b) => {
    const dir = garsonSortDir === "desc" ? -1 : 1;
    if (garsonSort === "teslimat") return (a.teslimat - b.teslimat) * dir;
    if (garsonSort === "sure")     return (a.sureMin - b.sureMin) * dir;
    if (garsonSort === "tip")      return (a.tipNum - b.tipNum) * dir;
    if (garsonSort === "puan")     return (a.puanNum - b.puanNum) * dir;
    return 0;
  });

  const filteredUrunler = urunKat === "Tüm Kategoriler"
    ? urunData
    : urunData.filter((u) => u.kategori === urunKat);

  function toggleSort(key: GarsonSort) {
    if (garsonSort === key) setGarsonSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setGarsonSort(key); setGarsonSortDir("desc"); }
  }
  function sortIcon(key: GarsonSort) {
    if (garsonSort !== key) return " ↕";
    return garsonSortDir === "desc" ? " ↓" : " ↑";
  }

  // ── CSV export ────────────────────────────────────────────────────────────
  function csvIndir() {
    let rows: string[][] = [];
    let filename = "rapor.csv";
    if (activeTab === "gelir") {
      rows = [["Gün/Dönem", "Şezlong Geliri", "Sipariş Geliri"], ...getGunlukData().map((g: GunlukItem) => [g.gun, `₺${g.sezVal}`, `₺${String(g.sipVal)}`])];
      filename = "gelir-raporu.csv";
    } else if (activeTab === "bakiye") {
      rows = [["Müşteri", "Şezlong", "Yüklenen", "Harcanan", "Kalan", "Son Tarih", "Durum"]];
      filename = "bakiye-raporu.csv";
    } else if (activeTab === "garson") {
      rows = [["Garson", "Teslimat", "Müşteri", "Ort. Süre", "Tip"], ...garsonRows.map((g) => [g.name, String(g.teslimat), String(g.musteri), g.sure, g.tip])];
      filename = "garson-performans.csv";
    } else if (activeTab === "urun") {
      rows = [["Sıra", "Ürün", "Kategori", "Satış Adedi", "Birim Fiyat", "Toplam Gelir"], ...filteredUrunler.map((u, i) => [String(i + 1), u.ad, u.kategori, String(u.satis), String(u.fiyat), String(u.toplam)])];
      filename = "urun-satislari.csv";
    }
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Stat card detail builders ─────────────────────────────────────────────
  function openStatDetay(idx: number) {
    const s = donemStat;
    const sumRezText = `₺${sumRez.toLocaleString("tr-TR")}`;
    const sumSipText = `₺${sumSip.toLocaleString("tr-TR")}`;
    const items: Record<number, { label: string; val: string; items: { k: string; v: string }[] }> = {
      // Toplam Gelir
      0: {
        label: "Toplam Gelir",
        val: s.toplam,
        items: [
          { k: "Şezlong Geliri", v: sumRezText },
          { k: "Sipariş Geliri", v: sumSipText },
          { k: "Sona Eren Bakiye", v: "₺0" },
        ],
      },
      // Şezlong Geliri
      1: {
        label: "Şezlong Geliri",
        val: s.sezlong,
        items: [
          { k: "Toplam Şezlong Geliri", v: sumRezText },
          { k: "Grup detayı", v: "Yakında" },
        ],
      },
      // Sipariş Geliri
      2: {
        label: "Sipariş Geliri",
        val: s.siparis,
        items: [
          { k: "Toplam Sipariş Geliri", v: sumSipText },
          { k: "Kategori detayı", v: "Yakında" },
        ],
      },
      // Sona Eren Bakiye (şimdilik mock 0)
      3: {
        label: "Sona Eren Bakiye",
        val: s.sonaEren,
        items: [
          { k: "Sona eren müşteri", v: "0" },
          { k: "Yakın sona erecek (5 gün)", v: "0" },
          { k: "Toplam risk", v: "₺0" },
          { k: "İşletmeye geçen", v: s.sonaEren },
        ],
      },
    };
    setStatDetay(items[idx]);
  }

  // ── Time filter pills ─────────────────────────────────────────────────────
  function TimePills({ value, setValue, opts }: { value: string; setValue: (v: string) => void; opts: string[][] }) {
    return (
      <>
        {opts.map(([label, key]) => (
          <button key={key} onClick={() => setValue(key)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${GRAY200}`, background: value === key ? NAVY : "white", fontSize: 12, fontWeight: 600, cursor: "pointer", color: value === key ? "white" : GRAY600 }}>{label}</button>
        ))}
      </>
    );
  }

  function DateRange({ bas, bit, setBas, setBit }: { bas: string; bit: string; setBas: (v: string) => void; setBit: (v: string) => void }) {
    return (
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto" }}>
        <input type="date" value={bas} onChange={(e) => setBas(e.target.value)} style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 11 }} />
        <span style={{ fontSize: 11, color: GRAY400 }}>—</span>
        <input type="date" value={bit} onChange={(e) => setBit(e.target.value)} style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 11 }} />
        <button
          onClick={() => setUygulanmisTarih({ bas, bit })}
          style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}
        >Uygula</button>
        {uygulanmisTarih && <span style={{ fontSize: 10, color: TEAL, fontWeight: 600 }}>✓ {uygulanmisTarih.bas} – {uygulanmisTarih.bit}</span>}
      </div>
    );
  }

  // ── Bar chart ─────────────────────────────────────────────────────────────
  const gunlukData = getGunlukData();

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
            💡 Tip: Garsona Direkt —{" "}
            <button onClick={() => router.push("/isletme/sezon")} style={{ color: TEAL, textDecoration: "none", fontSize: 10, background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>
              Tesis Ayarları&apos;ndan Değiştir →
            </button>
          </span>
          <button onClick={csvIndir} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>📥 Excel İndir</button>
        </div>
      </header>

      <div style={{ padding: 24, flex: 1 }}>
        {/* TAB BAR */}
        <div style={{ display: "flex", gap: 4, background: GRAY100, borderRadius: 8, padding: 4, marginBottom: 20, width: "fit-content" }}>
          {([
            { key: "gelir" as TabKey, label: "📊 Gelir Raporu" },
            { key: "bakiye" as TabKey, label: "💰 Bakiye Takibi" },
            { key: "garson" as TabKey, label: "🛵 Garson Performansı" },
            { key: "urun" as TabKey, label: "🍽️ Ürün Satışları" },
          ]).map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: "8px 18px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: activeTab === t.key ? NAVY : GRAY600, background: activeTab === t.key ? "white" : "transparent", boxShadow: activeTab === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none", border: "none" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── GELİR RAPORU ──────────────────────────────────────────────────── */}
        {activeTab === "gelir" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <TimePills value={donemGelir} setValue={setDonemGelir} opts={[["Bugün","bugun"],["Bu Hafta","hafta"],["Bu Ay","ay"],["Bu Yıl","yil"]]} />
              <DateRange bas={tarihBaslangic} bit={tarihBitis} setBas={setTarihBaslangic} setBit={setTarihBitis} />
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
              {([
                { label: "Toplam Gelir",     val: donemStat.toplam,   sub: { bugun:"Bugün",hafta:"Bu hafta",ay:"Bu ay",yil:"Bu yıl" }[donemGelir]!, change: donemStat.change, up: true,  color: TEAL   },
                { label: "Şezlong Geliri",   val: donemStat.sezlong,  sub: "%60 toplam gelirin",    change: "↑ %12", up: true,  color: ORANGE  },
                { label: "Sipariş Geliri",   val: donemStat.siparis,  sub: "%35 toplam gelirin",    change: "↑ %24", up: true,  color: GREEN   },
                { label: "Sona Eren Bakiye", val: donemStat.sonaEren, sub: "İşletmeye geçen",       change: "↓ %5",  up: false, color: PURPLE  },
              ] as const).map((s, i) => (
                <div
                  key={i}
                  onClick={() => openStatDetay(i)}
                  style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: "18px 20px", position: "relative", overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                  <div style={{ fontSize: 11, color: GRAY400, fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: NAVY, marginBottom: 4, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: GRAY400 }}>{s.sub}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, marginTop: 6, background: s.up ? "#DCFCE7" : "#FEE2E2", color: s.up ? "#16A34A" : RED }}>{s.change}</div>
                  <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 9, color: GRAY400 }}>Detay →</div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 20, marginBottom: 16, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>
                  Günlük Gelir ({donemGelir === "bugun" ? "Bugün" : donemGelir === "hafta" ? "Bu Hafta" : donemGelir === "ay" ? "Bu Ay" : "Bu Yıl"})
                </h3>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: TEAL, display: "inline-block" }} />Şezlong</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: ORANGE, display: "inline-block" }} />Sipariş</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, paddingBottom: 24, borderBottom: `1px solid ${GRAY200}` }}>
                {gunlukData.map((g, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end", position: "relative" }}>
                    <div
                      style={{ width: "100%", height: `${g.teal}%`, background: g.isToday ? `linear-gradient(${TEAL},rgba(10,186,181,0.3))` : TEAL, borderRadius: "6px 6px 0 0", border: g.isToday ? `2px dashed ${TEAL}` : "none", position: "relative", minHeight: 20, cursor: "pointer" }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const parent = e.currentTarget.closest("[data-chart]") as HTMLElement | null;
                        const pRect = parent?.getBoundingClientRect();
                        setTooltip({ text: `${g.tealVal} — ${g.gun}`, x: rect.left - (pRect?.left ?? 0) + rect.width / 2, y: rect.top - (pRect?.top ?? 0) - 28 });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <span style={{ fontSize: 9, fontWeight: 700, color: g.isToday ? TEAL : GRAY600, position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>{g.tealVal}</span>
                    </div>
                    <div
                      style={{ width: "100%", height: `${g.orange}%`, background: g.isToday ? `linear-gradient(${ORANGE},rgba(245,130,31,0.3))` : ORANGE, borderRadius: "6px 6px 0 0", border: g.isToday ? `2px dashed ${ORANGE}` : "none", marginTop: 2, cursor: "pointer" }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const parent = e.currentTarget.closest("[data-chart]") as HTMLElement | null;
                        const pRect = parent?.getBoundingClientRect();
                        setTooltip({ text: `₺${(g.sipVal ?? 0).toLocaleString("tr")} Sipariş — ${g.gun}`, x: rect.left - (pRect?.left ?? 0) + rect.width / 2, y: rect.top - (pRect?.top ?? 0) - 28 });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                    <span style={{ fontSize: 9, color: g.isToday ? TEAL : GRAY400, marginTop: 4, whiteSpace: "nowrap" }}>{g.gun}{g.isToday ? " ●" : ""}</span>
                  </div>
                ))}
              </div>
              {/* Tooltip */}
              {tooltip && (
                <div style={{ position: "absolute", background: NAVY, color: "white", fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8, pointerEvents: "none", whiteSpace: "nowrap", left: tooltip.x, top: tooltip.y, transform: "translateX(-50%)", zIndex: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                  {tooltip.text}
                </div>
              )}
            </div>

            {/* Grup + Ödeme (yakında gerçek veriye bağlanacak) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 20, minHeight: 120 }}>
                {grupBazliGelirRows.length === 0 ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 80 }}>
                    <span style={{ fontSize: 12, color: GRAY400, fontStyle: "italic" }}>Bu tarih aralığında grup bazlı gelir verisi bulunamadı.</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(() => {
                      const maxToplam = Math.max(1, ...grupBazliGelirRows.map((r) => r.toplam));
                      const renkler = ["#0EA5E9", "#22C55E", "#F59E0B", "#8B5CF6", "#EF4444", "#14B8A6", "#6366F1", "#F97316"];
                      return grupBazliGelirRows.map((row, idx) => {
                        const yuzde = Math.max(6, Math.round((row.toplam / maxToplam) * 100));
                        const barRenk = renkler[idx % renkler.length];
                        return (
                          <div key={row.grup} style={{ borderBottom: `1px solid ${GRAY100}`, paddingBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                              <span style={{ color: "#374151", fontWeight: 600 }}>{row.grup}</span>
                              <span style={{ color: GRAY400 }}>{row.rezervasyon} rezervasyon</span>
                            </div>
                            <div style={{ width: "100%", height: 10, borderRadius: 999, background: "#F1F5F9", overflow: "hidden", marginBottom: 6 }}>
                              <div style={{ width: `${yuzde}%`, height: "100%", background: `linear-gradient(90deg, ${barRenk}, ${barRenk}CC)` }} />
                            </div>
                            <div style={{ textAlign: "right", fontSize: 12, fontWeight: 700, color: NAVY }}>
                              ₺{row.toplam.toLocaleString("tr-TR")}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 20, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120 }}>
                <span style={{ fontSize: 12, color: GRAY400, fontStyle: "italic" }}>Ödeme Kanalı raporu yakında burada olacak.</span>
              </div>
            </div>
          </>
        )}

        {/* ── BAKİYE TAKİBİ ─────────────────────────────────────────────────── */}
        {activeTab === "bakiye" && (
          <>
            {riskliMusteri.sayi > 0 && (
              <div style={{ background: "#FFFBEB", border: "1.5px solid #FCD34D", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 24 }}>⚠️</div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#92400E" }}>
                    {riskCount} müşterinin bakiyesi riskli durumda
                  </strong>
                  <span style={{ fontSize: 11, color: "#B45309" }}>
                    Toplam risk: ₺{riskTotal.toLocaleString("tr-TR")}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (riskRows.length === 0) return;
                    setStatDetay({
                      label: "Riskli Bakiyeler",
                      val: `₺${riskTotal.toLocaleString("tr-TR")}`,
                      items: riskRows.map((r) => ({
                        k: r.name,
                        v: `Kalan: ₺${Number(r.kalanSayi ?? 0).toLocaleString("tr-TR")} • Son: ${r.sonTarih || "-"}`,
                      })),
                    });
                  }}
                  style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}
                >
                  Bildirimleri Gör
                </button>
              </div>
            )}
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Aktif Bakiyeler</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="🔍 Müşteri ara..."
                    value={bakiyeSearch}
                    onChange={(e) => setBakiyeSearch(e.target.value)}
                    style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 11 }}
                  />
                  <select
                    value={bakiyeDurum}
                    onChange={(e) => setBakiyeDurum(e.target.value)}
                    style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 11 }}
                  >
                    <option value="">Tüm Durumlar</option>
                    <option value="yaklasan">Sona Yakın (3 gün)</option>
                    <option value="aktif">Aktif</option>
                    <option value="suresi_gecti">Süresi Geçti</option>
                    <option value="bitti">Sona Erdi</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 90px 110px 80px", padding: "12px 18px", background: GRAY50, borderBottom: `1px solid ${GRAY100}`, gap: 8, fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5 }}>
                <div>Müşteri</div><div>Yüklenen</div><div>Harcanan</div><div>Kalan</div><div>Son Kullanım</div><div>Durum</div>
              </div>
              {bakiyeLoading ? (
                <div style={{ padding: "30px 18px", textAlign: "center", fontSize: 12, color: GRAY400 }}>Yükleniyor...</div>
              ) : filteredBakiye.length === 0 ? (
                <div style={{ padding: "30px 18px", textAlign: "center", fontSize: 12, color: GRAY400 }}>Aktif bakiye bulunamadı</div>
              ) : (
                filteredBakiye.map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 90px 110px 80px", padding: "12px 18px", borderBottom: `1px solid ${GRAY100}`, gap: 8, alignItems: "center", fontSize: 12, background: (r as { rowBg?: string | null }).rowBg ?? "transparent", opacity: (r as { opacity?: number }).opacity ?? 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", background: r.avatarBg }}>{r.inits}</div>
                      <div><div style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{r.name}</div><div style={{ fontSize: 10, color: GRAY400 }}>{r.sezlong}</div></div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{r.yuklenen}</div>
                    <div style={{ color: RED }}>{r.harcanan}</div>
                    <div style={{ fontWeight: 800, color: r.kalanColor }}>{r.kalan}</div>
                    <div style={{ fontSize: 11, color: (r as { sonTarihWarn?: boolean }).sonTarihWarn ? RED : (r as { sonTarihGray?: boolean }).sonTarihGray ? GRAY400 : "inherit", fontWeight: (r as { sonTarihWarn?: boolean }).sonTarihWarn ? 700 : 400 }}>{(r as { sonTarihWarn?: boolean }).sonTarihWarn ? "⚠️ " : ""}{r.sonTarih}</div>
                    <div>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "3px 7px",
                          borderRadius: 20,
                          background:
                            r.durum === "aktif"
                              ? "#DCFCE7"
                              : r.durum === "yaklasan"
                              ? "#FEF3C7"
                              : "#FEE2E2",
                          color:
                            r.durum === "aktif"
                              ? "#16A34A"
                              : r.durum === "yaklasan"
                              ? "#D97706"
                              : RED,
                        }}
                      >
                        {r.durum === "aktif" ? "Aktif" : r.durum === "yaklasan" ? "Yaklaşan" : r.durum === "suresi_gecti" ? "Süresi Geçti" : "Sona Erdi"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── GARSON PERFORMANSI ─────────────────────────────────────────────── */}
        {activeTab === "garson" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <TimePills value={donemGarson} setValue={setDonemGarson} opts={[["Bugün","bugun"],["Bu Hafta","hafta"],["Bu Ay","ay"]]} />
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto" }}>
                <input type="date" defaultValue="2026-03-11" style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 11 }} />
                <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Uygula</button>
              </div>
            </div>
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Garson Performans Tablosu</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 10, color: GRAY400 }}>Başlığa tıkla → sırala</span>
                  <span style={{ fontSize: 10, display: "inline-flex", alignItems: "center", gap: 6, background: "#F0FFFE", border: `1px solid ${TEAL}`, borderRadius: 20, padding: "4px 12px", fontWeight: 600, color: TEAL }}>💡 Tip: Garsona Direkt</span>
                </div>
              </div>
              {sortedGarsonlar.length === 0 ? (
                <div style={{ padding: "24px 18px", textAlign: "center", fontSize: 12, color: GRAY400 }}>
                  Henüz garson verisi yok.
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 80px 80px 80px 80px 90px 80px", padding: "12px 18px", background: GRAY50, borderBottom: `1px solid ${GRAY100}`, gap: 8, fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    <div>Garson</div>
                    {([
                      { key: "teslimat" as GarsonSort, label: "Teslimat" },
                      { key: "teslimat" as GarsonSort, label: "Müşteri" },
                      { key: "sure" as GarsonSort, label: "Ort. Süre" },
                    ]).map((h, i) => (
                      <div key={i} onClick={() => toggleSort(i === 0 ? "teslimat" : i === 2 ? "sure" : "teslimat")} style={{ cursor: "pointer", userSelect: "none" }}>{h.label}{sortIcon(i === 0 ? "teslimat" : i === 2 ? "sure" : "teslimat")}</div>
                    ))}
                    <div>Performans</div>
                    <div>Memnuniyet</div>
                    <div onClick={() => toggleSort("tip")} style={{ cursor: "pointer", userSelect: "none" }}>Tip{sortIcon("tip")}</div>
                  </div>
                  {sortedGarsonlar.map((g, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 80px 80px 80px 80px 90px 80px", padding: "12px 18px", borderBottom: `1px solid ${GRAY100}`, gap: 8, alignItems: "center", fontSize: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", background: g.avatarBg }}>{g.inits}</div>
                        <div><div style={{ fontWeight: 600, color: NAVY }}>{g.name}</div><div style={{ fontSize: 10, color: GRAY400 }}>{g.rol}</div></div>
                      </div>
                      <div style={{ fontWeight: 800, color: GREEN, fontSize: 14 }}>{g.teslimat}</div>
                      <div style={{ fontWeight: 700 }}>{g.musteri}</div>
                      <div style={{ fontWeight: 700 }}>{g.sure}</div>
                      <div><div style={{ background: GRAY100, borderRadius: 20, height: 6, width: 60, overflow: "hidden" }}><div style={{ width: `${g.perf}%`, height: "100%", borderRadius: 20, background: `linear-gradient(90deg,${TEAL},${GREEN})` }} /></div></div>
                      <div style={{ color: YELLOW, fontSize: 11 }}>{"★".repeat(Math.floor(g.puanNum))}{"☆".repeat(5 - Math.floor(g.puanNum))} <span style={{ color: GRAY400, fontSize: 10 }}>{g.puan}</span></div>
                      <div style={{ fontWeight: 800, color: ORANGE }}>{g.tip}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 20, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 100 }}>
              <span style={{ fontSize: 12, color: GRAY400, fontStyle: "italic" }}>Saatlik Teslimat Dağılımı yakında burada olacak.</span>
            </div>
          </>
        )}

        {/* ── ÜRÜN SATIŞLARI ────────────────────────────────────────────────── */}
        {activeTab === "urun" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <TimePills value={donemUrun} setValue={setDonemUrun} opts={[["Bugün","bugun"],["Bu Hafta","hafta"],["Bu Ay","ay"]]} />
              <DateRange bas={tarihBaslangic} bit={tarihBitis} setBas={setTarihBaslangic} setBit={setTarihBitis} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
              {[
                {
                  label: "Toplam Sipariş",
                  val: urunStats.toplamSiparis.toLocaleString("tr-TR"),
                  sub: { bugun:"Bugün", hafta:"Bu hafta", ay:"Bu ay" }[donemUrun]!,
                  change: "",
                  color: TEAL,
                },
                {
                  label: "Sipariş Cirosu",
                  val: `₺${urunStats.toplamCiro.toLocaleString("tr-TR")}`,
                  sub: { bugun:"Bugün", hafta:"Bu hafta", ay:"Bu ay" }[donemUrun]!,
                  change: "",
                  color: ORANGE,
                },
                {
                  label: "En Çok Satan",
                  val: urunStats.enCokSatan || "—",
                  sub: urunStats.enCokSatanAdet > 0 ? `${urunStats.enCokSatanAdet} adet` : "Veri yok",
                  change: "",
                  color: GREEN,
                },
              ].map((s, i) => (
                <div key={i} style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                  <div style={{ fontSize: 11, color: GRAY400, fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: NAVY, marginBottom: 4, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: GRAY400 }}>{s.sub}</div>
                  {s.change && (
                    <div style={{ display: "inline-flex", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, marginTop: 6, background: "#DCFCE7", color: "#16A34A" }}>{s.change}</div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Ürün Bazlı Satış Raporu</h3>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: GRAY400 }}>{filteredUrunler.length} ürün</span>
                  <select
                    value={urunKat}
                    onChange={(e) => setUrunKat(e.target.value)}
                    style={{ padding: "6px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 11 }}
                  >
                    <option key="Tüm Kategoriler">Tüm Kategoriler</option>
                    {Array.from(new Set(urunData.map((u) => u.kategori)))
                      .filter((k) => k && k !== "Tüm Kategoriler")
                      .map((k) => (
                        <option key={k}>{k}</option>
                      ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 80px 80px 90px 100px", padding: "10px 18px", background: GRAY50, borderBottom: `1px solid ${GRAY100}`, gap: 8, fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5 }}>
                <div>#</div><div>Ürün</div><div>Satış</div><div>Fiyat</div><div>Toplam</div><div>Trend</div>
              </div>
              {urunLoading ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: GRAY400 }}>Yükleniyor...</div>
              ) : filteredUrunler.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: GRAY400 }}>Bu dönemde satış verisi bulunamadı</div>
              ) : (
                filteredUrunler.map((u, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "30px 1fr 80px 80px 90px 100px", padding: "10px 18px", borderBottom: `1px solid ${GRAY100}`, gap: 8, alignItems: "center", fontSize: 12 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < 3 ? 10 : 11, fontWeight: 800, background: i === 0 ? "#FEF3C7" : i === 1 ? "#F1F5F9" : i === 2 ? "#FFEDD5" : GRAY100, color: i === 0 ? "#D97706" : i === 1 ? GRAY600 : i === 2 ? ORANGE : GRAY600 }}>{i + 1}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div><div style={{ fontWeight: 700, fontSize: 12 }}>{u.ad}</div><div style={{ fontSize: 10, color: GRAY400 }}>{u.kategori}</div></div>
                    </div>
                    <div style={{ fontWeight: 800, color: GREEN }}>{u.satis}</div>
                    <div>{`₺${u.fiyat.toLocaleString("tr-TR")}`}</div>
                    <div style={{ fontWeight: 800, color: NAVY }}>{`₺${u.toplam.toLocaleString("tr-TR")}`}</div>
                    <div>—</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* ── MODAL: Stat Detay ──────────────────────────────────────────────── */}
      {statDetay && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setStatDetay(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 360, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{statDetay.label}</h3>
              <button onClick={() => setStatDetay(null)} style={{ width: 28, height: 28, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: TEAL, marginBottom: 20 }}>{statDetay.val}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {statDetay.items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: GRAY50, borderRadius: 10 }}>
                  <span style={{ fontSize: 12, color: GRAY600, fontWeight: 500 }}>{item.k}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{item.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
