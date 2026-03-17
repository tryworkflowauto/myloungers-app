"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type TesisRow = Record<string, any>;

const MN = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

type SzlStatus = "avail" | "full" | "rsv" | "maint" | "lock";

type ZoneDef = {
  key: string;
  prefix: string;
  label: string;
  icon: string;
  pw: number;
  pe: number;
  gradient: string;
  statuses: SzlStatus[];
};

function isWE(dt: Date) {
  const dow = dt.getDay();
  return dow === 0 || dow === 6;
}
function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}
function fmtDate(d: Date) {
  return d.getDate() + " " + MN[d.getMonth()] + " " + d.getFullYear();
}
function fmtRange(start: Date | null, end: Date | null) {
  if (!start) return "";
  if (!end) return fmtDate(start);
  return fmtDate(start) + " – " + fmtDate(end);
}

type SelSzl = { no: string; zoneKey: string; price: number };

export default function TesisDetailPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();

  const [row, setRow] = useState<TesisRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zones, setZones] = useState<ZoneDef[]>([]);

  const [fav, setFav] = useState(false);
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({
    about: true, feats: true, plan: true, szl: true,
    video: true, transport: true, rules: true, reviews: true,
  });
  const [calDt, setCalDt] = useState(new Date());
  const [selStart, setSelStart] = useState<Date | null>(null);
  const [selEnd, setSelEnd] = useState<Date | null>(null);
  const [paxCount, setPaxCount] = useState(1);
  const [selSzls, setSelSzls] = useState<SelSzl[]>([]);
  const [videoUrl, setVideoUrl] = useState(row?.video_url || "");
  const [videoEmbed, setVideoEmbed] = useState<string | null>(null);
  const [avail, setAvail] = useState<Record<string, string>>({});
  const szlRef = useRef<HTMLDivElement>(null);

  function mapDbDurumToStatus(durum: string | null | undefined): SzlStatus {
    switch ((durum || "").toLowerCase()) {
      case "dolu":
        return "full";
      case "rezerve":
        return "rsv";
      case "bakim":
      case "bakım":
        return "maint";
      case "kilitli":
        return "lock";
      case "bos":
      case "boş":
      default:
        return "avail";
    }
  }

  // Supabase'den tesisi çek
  useEffect(() => {
    async function fetchTesis() {
      if (!slug) return;
      setLoading(true);
      setError(null);

      let fetched: TesisRow | null = null;

      const slugResult = await supabase
        .from("tesisler")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      const slugColMissing = slugResult.error && (slugResult.error as any).code === "42703";

      if (!slugResult.error && slugResult.data) {
        fetched = slugResult.data;
      } else if (slugColMissing || (!slugResult.data && !slugResult.error)) {
        const asNumber = Number(slug);
        const idFilterValue = Number.isNaN(asNumber) ? slug : asNumber;

        const idResult = await supabase
          .from("tesisler")
          .select("*")
          .eq("id", idFilterValue)
          .maybeSingle();

        if (idResult.error) {
          console.error("Supabase 'tesisler' detay ID hatası:", idResult.error);
          setError("Tesis bilgisi yüklenirken bir hata oluştu.");
          setLoading(false);
          return;
        }

        fetched = idResult.data;
      } else if (slugResult.error) {
        console.error("Supabase 'tesisler' detay slug hatası:", slugResult.error);
        setError("Tesis bilgisi yüklenirken bir hata oluştu.");
        setLoading(false);
        return;
      }

      if (!fetched) {
        setError("Bu sluga ait tesis bulunamadı.");
        setLoading(false);
        return;
      }

      setRow(fetched);
      setLoading(false);
    }

    fetchTesis();
  }, [slug]);

  // Supabase'den şezlong grupları ve şezlongları çek
  useEffect(() => {
    if (!row) return;
    let cancelled = false;

    async function fetchSezlongData() {
      if (!row) return;
      const tesisId = row.id;

      const { data: grupRows, error: grupErr } = await supabase
        .from("sezlong_gruplari")
        .select("id, ad, renk, kapasite, fiyat")
        .eq("tesis_id", tesisId);

      const { data: sezRows, error: sezErr } = await supabase
        .from("sezlonglar")
        .select("id, grup_id, numara, durum")
        .eq("tesis_id", tesisId);

      if (cancelled || grupErr || !grupRows) return;

      const byGrup = new Map<string, { id: string; numara: number; durum: string | null }[]>();
      (sezRows ?? []).forEach((s) => {
        if (!byGrup.has(s.grup_id)) byGrup.set(s.grup_id, []);
        byGrup.get(s.grup_id)!.push({
          id: s.id as string,
          numara: s.numara as number,
          durum: (s.durum as string) ?? null,
        });
      });

      const zoneList: ZoneDef[] = (grupRows as any[]).map((g, index) => {
        const key = g.id as string;
        const ad: string = (g.ad as string) || `Grup ${index + 1}`;
        const kapasite: number = (g.kapasite as number) || 0;
        const renk: string = (g.renk as string) || "#0ABAB5";
        const fiyatNum: number = (g.fiyat as number) || 0;
        const prefix = ad.charAt(0).toUpperCase() || "S";
        const icon = "🏖️";
        const gradient = `linear-gradient(135deg,${renk},${renk}CC)`;

        const list = (byGrup.get(key) ?? []).sort((a, b) => a.numara - b.numara);
        const statuses: SzlStatus[] = [];
        for (let i = 1; i <= kapasite; i++) {
          const rec = list.find((s) => s.numara === i);
          statuses.push(mapDbDurumToStatus(rec?.durum));
        }

        return {
          key,
          prefix,
          label: ad,
          icon,
          pw: fiyatNum,
          pe: fiyatNum,
          gradient,
          statuses,
        };
      });

      if (!cancelled) {
        setZones(zoneList);
      }
    }

    fetchSezlongData();

    return () => {
      cancelled = true;
    };
  }, [row?.id]);

  // Mock müsaitlik üret
  useEffect(() => {
    const a: Record<string, string> = {};
    for (let mo = 0; mo < 3; mo++) {
      const d = new Date();
      d.setMonth(d.getMonth() + mo);
      const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      for (let day = 1; day <= dim; day++) {
        const k = d.getFullYear() + "-" + d.getMonth() + "-" + day;
        const r = Math.random();
        a[k] = r < 0.07 ? "full" : r < 0.2 ? "few" : "ok";
      }
    }
    setAvail(a);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lbOpen) return;
      if (e.key === "Escape") setLbOpen(false);
      if (e.key === "ArrowLeft") setLbIdx((i) => (i - 1 + HOTEL.images.length) % HOTEL.images.length);
      if (e.key === "ArrowRight") setLbIdx((i) => (i + 1) % HOTEL.images.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lbOpen]);

  function togglePanel(key: string) {
    setOpenPanels((p) => ({ ...p, [key]: !p[key] }));
  }

  function pickDate(day: number, month: number, year: number) {
    const clicked = new Date(year, month, day);
    if (!selStart || selEnd || clicked < selStart) {
      setSelStart(clicked);
      setSelEnd(null);
      setSelSzls([]);
    } else {
      setSelEnd(clicked);
      setTimeout(() => {
        szlRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }

  function pickSzl(no: string, zoneKey: string, status: SzlStatus, pw: number, pe: number) {
    if (!selStart) {
      alert("Lütfen önce giriş tarihini seçin.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (status !== "avail") return;
    const price = selStart && isWE(selStart) ? pe : pw;
    const exists = selSzls.findIndex((s) => s.no === no);
    if (exists > -1) {
      setSelSzls((prev) => prev.filter((_, i) => i !== exists));
      return;
    }
    if (selSzls.length >= paxCount) {
      alert("Maksimum " + paxCount + " şezlong seçebilirsiniz.\nKişi sayısını artırmak için + butonunu kullanın.");
      return;
    }
    setSelSzls((prev) => [...prev, { no, zoneKey, price }]);
  }

  function clearAll() {
    setSelStart(null);
    setSelEnd(null);
    setSelSzls([]);
    setPaxCount(1);
  }

  async function goRes() {
    if (!selStart) { alert("Lütfen giriş tarihini seçin."); return; }
    if (selSzls.length === 0) { alert("Lütfen en az 1 şezlong seçin."); return; }
    function padZ(n: number) { return String(n).padStart(2, "0"); }
    const startStr = selStart.getFullYear() + "-" + padZ(selStart.getMonth() + 1) + "-" + padZ(selStart.getDate());
    const endStr = selEnd
      ? selEnd.getFullYear() + "-" + padZ(selEnd.getMonth() + 1) + "-" + padZ(selEnd.getDate())
      : startStr;
    const gunSayisi = days;
    const sezlonglar = selSzls.map(s => s.no).join(",");
    const toplamFiyat = total;

    // Supabase üzerinde rezervasyon kaydı oluştur
    try {
      const { error: rezError } = await supabase.from("rezervasyonlar").insert({
        tesis_id: row?.id ?? null,
        kullanici_id: null,           // (isteğe göre giriş yapan kullanıcı id'si ile doldurulabilir)
        sezlong_id: null,             // çoklu seçimde ayrı tabloya taşınabilir; şimdilik boş
        baslangic_tarih: startStr,
        bitis_tarih: endStr,
        kisi_sayisi: selSzls.length,
        toplam_tutar: toplamFiyat,
        durum: "bekliyor",
      });
      if (rezError) {
        console.error("Rezervasyon oluşturma hatası:", rezError);
      }
    } catch (e) {
      console.error("Rezervasyon oluşturma beklenmeyen hata:", e);
    }

    const params = new URLSearchParams({
      tesis: HOTEL.name,
      tarihBaslangic: startStr,
      tarihBitis: endStr,
      gun: String(gunSayisi),
      sezlonglar,
      kisi: String(selSzls.length),
      fiyat: String(toplamFiyat),
    });
    router.push("/odeme?" + params.toString());
  }

  function loadVideo() {
    let raw = videoUrl.trim();
    if (!raw) return;
    let embed = raw;
    if (raw.includes("youtube.com/watch")) {
      const vid = raw.split("v=")[1]?.split("&")[0];
      if (vid) embed = "https://www.youtube.com/embed/" + vid + "?autoplay=1";
    } else if (raw.includes("youtu.be/")) {
      embed = "https://www.youtube.com/embed/" + raw.split("youtu.be/")[1].split("?")[0] + "?autoplay=1";
    } else if (raw.includes("vimeo.com/")) {
      embed = "https://player.vimeo.com/video/" + raw.split("vimeo.com/")[1].split("?")[0] + "?autoplay=1";
    }
    setVideoEmbed(embed);
  }

  const days = selStart && selEnd ? daysBetween(selStart, selEnd) : selStart ? 1 : 0;
  const total = selSzls.reduce((a, s) => a + s.price * Math.max(days, 1), 0);
  const szlNames = selSzls.map((s) => s.no).join(", ");
  const units = [...new Set(selSzls.map((s) => "₺" + s.price.toLocaleString("tr-TR")))].join(" / ");

  const calYear = calDt.getFullYear();
  const calMonth = calDt.getMonth();
  const firstDay = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const dim = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  function calDayClass(day: number) {
    const td = new Date(calYear, calMonth, day);
    const k = calYear + "-" + calMonth + "-" + day;
    const avv = avail[k] || "ok";
    let cls = "cald";
    if (td < todayMidnight) return cls + " dis";
    if (td.toDateString() === today.toDateString()) cls += " tod";
    if (avv === "full") return cls + " full";
    if (avv === "few") cls += " few";
    const isS = selStart && td.toDateString() === selStart.toDateString();
    const isE = selEnd && td.toDateString() === selEnd.toDateString();
    const inR = selStart && selEnd && td > selStart && td < selEnd;
    if (isS && isE) cls += " rng-se";
    else if (isS) cls += " rng-s";
    else if (isE) cls += " rng-e";
    else if (inR) cls += " rng-m";
    return cls;
  }

  const SZL_ST: Record<SzlStatus | "sel", { bg:string; bdr:string; dsh:boolean; pillow:string; legs:string; nc:string }> = {
    avail: { bg:"#DCFCE7", bdr:"#86EFAC", dsh:false, pillow:"#A7F3D0", legs:"#86EFAC", nc:"#16A34A" },
    full:  { bg:"#FFEDD5", bdr:"#FB923C", dsh:false, pillow:"#FED7AA", legs:"#FB923C", nc:"#EA580C" },
    rsv:   { bg:"#DBEAFE", bdr:"#60A5FA", dsh:false, pillow:"#BFDBFE", legs:"#60A5FA", nc:"#2563EB" },
    maint: { bg:"#F1F5F9", bdr:"#CBD5E1", dsh:false, pillow:"#E2E8F0", legs:"#CBD5E1", nc:"#94A3B8" },
    lock:  { bg:"#EDE9FE", bdr:"#7C3AED", dsh:true,  pillow:"#DDD6FE", legs:"#7C3AED", nc:"#7C3AED" },
    sel:   { bg:"#FFF7ED", bdr:"#F5821F", dsh:false, pillow:"#FDBA74", legs:"#F5821F", nc:"#F5821F" },
  };

  function SzlGrid({ zoneKey, prefix, statuses, pw, pe }: { zoneKey:string; prefix:string; statuses:SzlStatus[]; pw:number; pe:number }) {
    return (
      <div style={{ display:"flex", flexWrap:"wrap", gap:10, padding:"16px 18px" }}>
        {statuses.map((status, i) => {
          const no = prefix + (i + 1);
          const isSel = selSzls.some(s => s.no === no);
          const ss = SZL_ST[isSel ? "sel" : status];
          const canClick = status === "avail";
          const statusLabel: Record<SzlStatus, string> = { avail:"Boş", full:"Dolu", rsv:"Rezerve", maint:"Bakımda", lock:"Kilitli" };
          return (
            <div
              key={no}
              onClick={() => canClick && pickSzl(no, zoneKey, status, pw, pe)}
              title={no + " — " + statusLabel[status]}
              style={{ position:"relative", cursor:canClick?"pointer":"not-allowed", marginTop:8, marginBottom:6, transition:"transform 0.12s" }}
              onMouseEnter={e => canClick && ((e.currentTarget as HTMLDivElement).style.transform="scale(1.1)")}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform="scale(1)")}
            >
              <div style={{ position:"absolute", top:-9, left:"50%", transform:"translateX(-50%)", width:28, height:11, borderRadius:"5px 5px 0 0", background:ss.pillow, zIndex:0 }} />
              <div style={{ width:42, height:33, borderRadius:"5px 5px 4px 4px", background:ss.bg, border:`2px ${ss.dsh?"dashed":"solid"} ${ss.bdr}`, position:"relative", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:isSel?"0 0 0 2px rgba(245,130,31,.5)":undefined, zIndex:1 }}>
                <span style={{ fontSize:9, fontWeight:800, color:ss.nc, zIndex:2, position:"relative" }}>
                  {status==="lock" ? "🔒" : no}
                </span>
                {status === "full" && (
                  <div style={{ position:"absolute", top:-5, right:-5, width:14, height:14, borderRadius:"50%", background:"#F5821F", border:"2px solid white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, zIndex:3 }}>👤</div>
                )}
              </div>
              <div style={{ position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%)", width:34, height:5, borderRadius:3, background:ss.legs, zIndex:0 }} />
            </div>
          );
        })}
      </div>
    );
  }

  // Supabase satırından görsel & temel bilgiler
  // Galeri: row.fotograflar kolonundan { id, src } şeklinde geliyor
  let images: string[] = [];
  const rawFotos = (row as any)?.fotograflar;
  if (Array.isArray(rawFotos)) {
    images = rawFotos
      .map((f: any) => (f && typeof f.src === "string" ? f.src : null))
      .filter(Boolean) as string[];
  }
  if (images.length === 0) {
    images = ["/logo.png"];
  }

  const HOTEL = {
    name: (row?.ad as string) || (row?.name as string) || "Tesis adı yakında",
    stars: typeof row?.yildiz === "number" ? row.yildiz : 4,
    score: typeof row?.puan === "number" ? row.puan : 9.6,
    reviews: typeof row?.yorum_sayisi === "number" ? row.yorum_sayisi : 0,
    address:
      (row?.adres as string) ||
      [row?.ilce, row?.sehir].filter(Boolean).join(", ") ||
      "Adres bilgisi yakında",
    mapsUrl:
      (row?.maps_url as string) ||
      `https://maps.google.com/?q=${encodeURIComponent((row?.ad as string) || "Bodrum")}`,
    mapsEmbed:
      (row?.maps_embed as string) ||
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6374!2d27.2718!3d37.1026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14be4d31c2b3f9b7%3A0x0!2sBodrum!5e0!3m2!1str!2str!4v1",
    images,
  };

  // KATEGORİ BADGELERI (row.kategoriler veya row.kategori)
  let kategoriBadges: string[] = [];
  const rawKat = (row as any)?.kategoriler ?? (row as any)?.kategori;
  if (rawKat) {
    try {
      const parsed =
        Array.isArray(rawKat) ? rawKat :
        typeof rawKat === "string" ? JSON.parse(rawKat) :
        [];
      if (Array.isArray(parsed)) {
        kategoriBadges = parsed.map((k: any) => String(k));
      }
    } catch {
      // JSON parse hatası: stringi virgüle göre böl
      kategoriBadges = String(rawKat)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  // TESİS İMKANLARI (Supabase)
  type ImkanRow = { name?: string; emoji?: string; active?: boolean };
  let imkanlar: ImkanRow[] = [];
  if ((row as any)?.imkanlar) {
    try {
      const raw = (row as any).imkanlar;
      const parsed =
        Array.isArray(raw) ? raw :
        typeof raw === "string" ? JSON.parse(raw) :
        [];
      if (Array.isArray(parsed) && parsed.length > 0) {
        imkanlar = (parsed as ImkanRow[]).filter((it) => it && it.active);
      }
    } catch {
      imkanlar = [];
    }
  }

  // ÇALIŞMA SAATLERİ (Supabase + fallback)
  const defaultSaat = "09:00 — 19:00";
  type Saatler = { hafta_ici?: string; hafta_sonu?: string };
  let saatler: Saatler | null = null;
  if ((row as any)?.calisma_saatleri) {
    const raw = (row as any).calisma_saatleri;
    try {
      saatler =
        typeof raw === "string" ? JSON.parse(raw) as Saatler :
        (raw as Saatler);
    } catch {
      saatler = null;
    }
  }

  // KURALLAR & KAMPANYALAR (Supabase + fallback)
  const defaultKurallar: { icon: string; text: string }[] = [
    { icon: "🚫", text: "Evcil hayvan kabul edilmez" },
    { icon: "🚫", text: "Dışarıdan yiyecek/içecek getirilmez" },
    { icon: "🚫", text: "18 yaş altı 21:00'dan sonra tesis içinde bulunamaz" },
    { icon: "✅", text: "Giriş: 09:00 — Çıkış: 19:00" },
    { icon: "✅", text: "İptal: 48 saat öncesine kadar ücretsiz" },
  ];
  const defaultKampanyalar: { icon: string; text: string }[] = [
    { icon: "🌟", text: "Erken Rezervasyon: 30 gün öncesi %10 indirim" },
    { icon: "🌟", text: "Grup (5+): %15 indirim" },
    { icon: "🌟", text: "Hafta içi 3 gün full: Kahvaltı dahil" },
    { icon: "🌟", text: "Sadakat: 5. rezervasyonda %20 indirim" },
  ];

  function parseIconTextArray(raw: any): { icon: string; text: string }[] {
    try {
      const parsed =
        Array.isArray(raw) ? raw :
        typeof raw === "string" ? JSON.parse(raw) :
        [];
      if (!Array.isArray(parsed)) return [];
      return parsed as { icon: string; text: string }[];
    } catch {
      return [];
    }
  }

  const parsedKurallar = row ? parseIconTextArray((row as any).kurallar) : [];
  const parsedKampanyalar = row ? parseIconTextArray((row as any).kampanya_notlari) : [];

  const btnDisabled = !selStart || selSzls.length === 0;
  const btnText = !selStart ? "Tarih Seçerek Başlayın"
    : selSzls.length === 0 ? "🛏 Haritadan Şezlong Seç"
    : "📅 Rezervasyonu Tamamla →";

  if (loading) {
    return (
      <>
        <div style={{ padding: "60px 20px", textAlign: "center", color: "#6B7280", fontSize: ".9rem" }}>
          Tesis bilgileri yükleniyor…
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div style={{ padding: "60px 20px", textAlign: "center", color: "#6B7280", fontSize: ".9rem" }}>
          <div style={{ marginBottom: 8 }}>⚠️ {error}</div>
          <button
            type="button"
            onClick={() => router.push("/arama")}
            style={{
              borderRadius: 999,
              border: "none",
              padding: "7px 14px",
              fontSize: "0.78rem",
              fontWeight: 700,
              background: "#0A1628",
              color: "white",
              cursor: "pointer",
            }}
          >
            Tesis Ara
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --navy:#0A1628;--teal:#0ABAB5;--tdk:#0D8C89;--tlt:#E6F7F7;--or:#F5821F;--wh:#fff;
          --bg:#F4F6F9;--bd:#E5E7EB;--i2:#374151;--i3:#6B7280;
          --r2:12px;--r3:16px;--r4:20px;
          --sh:0 1px 4px rgba(0,0,0,.07);--sh2:0 4px 20px rgba(0,0,0,.12);
        }
        body{font-family:sans-serif;background:var(--bg);color:var(--navy);font-size:15px;line-height:1.55}
        .nav{background:var(--wh);border-bottom:1px solid var(--bd);position:sticky;top:0;z-index:200;height:64px;display:flex;align-items:center;padding:0 24px;gap:16px;box-shadow:var(--sh)}
        .nav-logo{height:40px;cursor:pointer}
        .nav-back{display:flex;align-items:center;gap:6px;font-size:.78rem;font-weight:700;color:var(--i3);text-decoration:none;border:1.5px solid var(--bd);padding:6px 12px;border-radius:9px;transition:all .12s}
        .nav-back:hover{border-color:var(--navy);color:var(--navy)}
        .nav-sp{flex:1}
        .nav-profil{display:flex;align-items:center;font-size:.78rem;font-weight:700;color:var(--i3);text-decoration:none;border:1.5px solid var(--bd);padding:7px 14px;border-radius:10px;transition:all .12s}
        .nav-profil:hover{border-color:var(--navy);color:var(--navy)}
        .fav-btn{display:flex;align-items:center;gap:6px;font-size:.78rem;font-weight:700;color:var(--i3);background:none;border:1.5px solid var(--bd);padding:7px 14px;border-radius:10px;cursor:pointer;transition:all .12s}
        .fav-btn.on{border-color:#EF4444;color:#EF4444;background:#FEF2F2}
        .wrap{max-width:1240px;margin:0 auto;padding:0 20px}
        .bc{padding:14px 0;display:flex;align-items:center;gap:6px;font-size:.72rem;color:var(--i3)}
        .bc a{color:var(--i3);text-decoration:none}.bc a:hover{color:var(--teal)}
        .bc-sep{color:var(--bd)}
        .th{padding-bottom:16px}
        .th-name{font-size:1.85rem;font-weight:900;color:var(--navy);line-height:1.15;letter-spacing:-.03em}
        .th-meta{display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap}
        .stars{color:#F59E0B;font-size:1rem;letter-spacing:2px}
        .score-badge{background:var(--teal);color:#fff;font-size:.78rem;font-weight:900;padding:4px 10px;border-radius:8px}
        .verified{background:#DCFCE7;color:#15803D;font-size:.7rem;font-weight:700;padding:3px 8px;border-radius:6px;border:1px solid #86EFAC}
        .cat-tag{background:var(--tlt);color:var(--tdk);font-size:.7rem;font-weight:700;padding:3px 10px;border-radius:50px;border:1px solid #B2EBEA}
        .th-addr{font-size:.78rem;color:var(--i3);margin-top:6px;display:flex;align-items:center;gap:5px}
        .gall{display:grid;grid-template-columns:3fr 1fr 1fr;grid-template-rows:240px 240px;gap:6px;border-radius:var(--r4);overflow:hidden;margin-bottom:28px}
        .gp{overflow:hidden;position:relative;background:#E5E7EB;cursor:pointer}
        .gp img{width:100%;height:100%;object-fit:cover;transition:transform .3s;display:block}
        .gp:hover img{transform:scale(1.04)}
        .gp-main{grid-row:1/3;grid-column:1}
        .gp-tr{grid-row:1;grid-column:2}
        .gp-mr{grid-row:1;grid-column:3}
        .gp-bl{grid-row:2;grid-column:2}
        .gp-br{grid-row:2;grid-column:3}
        .gp-overlay{position:absolute;inset:0;background:rgba(10,22,40,.55);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#fff;pointer-events:none}
        .gp-overlay-t{font-size:.88rem;font-weight:800}
        .gp-overlay-s{font-size:.68rem;opacity:.75}
        .layout{display:grid;grid-template-columns:1fr 360px;gap:28px;align-items:start}
        .main-col{display:flex;flex-direction:column;gap:20px}
        .sidebar{position:sticky;top:76px;display:flex;flex-direction:column;gap:16px}
        .panel{background:var(--wh);border:1px solid var(--bd);border-radius:var(--r4);overflow:hidden;box-shadow:var(--sh)}
        .ph{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;cursor:pointer;user-select:none;gap:12px}
        .ph:hover{background:#FAFAFA}
        .ph-l{display:flex;align-items:center;gap:12px}
        .ph-ic{font-size:1.3rem;flex-shrink:0}
        .ph-title{font-size:.92rem;font-weight:800;color:var(--navy)}
        .ph-sub{font-size:.7rem;color:var(--i3);margin-top:2px}
        .ch{width:18px;height:18px;flex-shrink:0;color:var(--i3);transition:transform .2s}
        .ch-open{transform:rotate(180deg)}
        .pb{border-top:1px solid var(--bd)}
        .about-p{font-size:.85rem;color:var(--i2);line-height:1.7;margin-bottom:10px}
        .feat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .feat-item{display:flex;align-items:center;gap:8px;font-size:.8rem;color:var(--i2)}
        .feat-ic{width:32px;height:32px;background:var(--tlt);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
        .schema{border-radius:16px;overflow:hidden;border:2px solid var(--bd);margin-top:8px}
        .plan-svg-wrap{padding:16px;background:linear-gradient(180deg,#EBF8FF 0%,#E0F2FE 100%)}
        .plan-legend{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px;border-top:1px solid var(--bd);background:#FAFAFA}
        .plan-leg-item{display:flex;align-items:center;gap:5px;font-size:.68rem;font-weight:700;color:var(--i2)}
        .plan-leg-dot{width:12px;height:12px;border-radius:3px;flex-shrink:0}
        .plan-zone{cursor:pointer;transition:opacity .15s}
        .plan-zone:hover{opacity:.82}
        .bldz{background:var(--navy);padding:11px;text-align:center;font-size:.6rem;font-weight:800;color:rgba(255,255,255,.28);letter-spacing:.18em;text-transform:uppercase}
        .gh{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px}
        .gh-title{font-size:.75rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}
        .iz .gh-title{color:var(--navy)}.vipz .gh-title{color:#6D28D9}.slvz .gh-title{color:var(--i2)}
        .gh-price{text-align:right}
        .gh-pw{font-size:.67rem;color:var(--i3)}
        .gh-we{font-size:.7rem;font-weight:700}
        .iz .gh-we{color:var(--navy)}.vipz .gh-we{color:#7C3AED}.slvz .gh-we{color:var(--or)}
        .schema{background:#fff}
        .srows{display:flex;flex-direction:column;gap:8px}
        .srow{display:flex;align-items:center;gap:6px}
        .rl{font-size:.6rem;font-weight:900;width:14px;text-align:right;flex-shrink:0;line-height:44px;color:var(--i3)}
        .rl-v{color:#7C3AED}.rl-s{color:var(--i3)}
        .su{display:flex;flex-wrap:wrap;gap:5px}
        .video-wrap{border-radius:0 0 14px 14px;overflow:hidden;background:#111}
        .video-ph{min-height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:linear-gradient(135deg,#0c4a6e,#1e3a5f)}
        .video-ph-ic{width:72px;height:72px;background:rgba(255,255,255,.15);border-radius:50%;display:flex;align-items:center;justify-content:center}
        .video-ph-t{font-size:.88rem;font-weight:700;color:rgba(255,255,255,.7)}
        .video-url-bar{display:flex;gap:8px;padding:14px 16px;background:#F9FAFB;border-top:1px solid var(--bd)}
        .video-url-bar input{flex:1;border:1.5px solid var(--bd);border-radius:9px;padding:9px 12px;font-size:.78rem;outline:none;color:var(--navy)}
        .video-url-bar input:focus{border-color:var(--teal)}
        .video-url-bar button{background:var(--teal);color:#fff;border:none;border-radius:9px;padding:9px 16px;font-size:.78rem;font-weight:700;cursor:pointer;white-space:nowrap}
        .video-frame{position:relative;aspect-ratio:16/9}
        .video-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:none}
        .video-close{position:absolute;top:8px;right:8px;z-index:10;background:rgba(0,0,0,.65);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:.85rem;display:flex;align-items:center;justify-content:center}
        .rules-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .rules-col h4{font-size:.75rem;font-weight:900;text-transform:uppercase;letter-spacing:.07em;color:var(--i3);margin-bottom:10px}
        .rule-item{display:flex;align-items:flex-start;gap:7px;font-size:.78rem;color:var(--i2);margin-bottom:8px;line-height:1.5}
        .score-big{font-size:3rem;font-weight:900;color:var(--teal);line-height:1}
        .score-label{font-size:.7rem;color:var(--i3);margin-top:4px}
        .score-bars{flex:1}
        .score-bar-row{display:flex;align-items:center;gap:8px;margin-bottom:5px;font-size:.72rem;color:var(--i3)}
        .score-bar-bg{flex:1;height:6px;background:#F3F4F6;border-radius:3px;overflow:hidden}
        .score-bar-fill{height:100%;background:var(--teal);border-radius:3px}
        .review-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}
        .review-card{background:#FAFAFA;border:1px solid var(--bd);border-radius:var(--r2);padding:14px}
        .rc-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}
        .rc-av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:800;color:#fff;flex-shrink:0}
        .rc-name{font-size:.8rem;font-weight:800;color:var(--navy)}
        .rc-date{font-size:.67rem;color:var(--i3)}
        .rc-score{background:var(--teal);color:#fff;font-size:.67rem;font-weight:900;padding:2px 7px;border-radius:6px}
        .rc-text{font-size:.77rem;color:var(--i2);line-height:1.55}
        .rcard{background:var(--wh);border:1px solid var(--bd);border-radius:var(--r4);overflow:hidden;box-shadow:var(--sh2)}
        .sb-steps{display:flex;border-bottom:1px solid var(--bd);background:#FAFAFA}
        .sb-step{flex:1;padding:11px 4px;text-align:center;border-bottom:3px solid transparent;transition:all .15s}
        .sb-step.act{border-bottom-color:var(--or);background:var(--wh)}
        .sb-step-ic{font-size:.95rem;margin-bottom:2px}
        .sb-step-n{font-size:.58rem;font-weight:900;color:var(--i3);text-transform:uppercase;letter-spacing:.06em}
        .sb-step.act .sb-step-n{color:var(--or)}
        .sb-step-v{font-size:.72rem;font-weight:800;color:var(--i3)}
        .sb-step.act .sb-step-v{color:var(--navy)}
        .calb{padding:18px 16px 0}
        .caln{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .calnb{background:none;border:1.5px solid var(--bd);border-radius:9px;width:32px;height:32px;cursor:pointer;font-size:1.1rem;color:var(--i3);transition:all .12s}
        .calnb:hover{border-color:var(--navy);color:var(--navy)}
        .calm{font-size:.92rem;font-weight:800;color:var(--navy)}
        .calg{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px}
        .caldl{font-size:.6rem;font-weight:800;color:var(--i3);text-align:center;padding:3px 0}
        .cald{font-size:.72rem;font-weight:600;text-align:center;padding:7px 1px;border-radius:7px;cursor:pointer;border:none;background:none;width:100%;color:var(--i2);position:relative;transition:background .1s,color .1s}
        .cald:hover:not(:disabled){background:var(--tlt);color:var(--tdk)}
        .cald.tod{font-weight:900;color:var(--tdk)}
        .cald.dis{color:#D1D5DB;cursor:default}
        .cald.full{color:#FCA5A5;text-decoration:line-through;cursor:not-allowed}
        .cald.few{color:var(--or);font-weight:800}
        .cald.few::after,.cald.full::after{content:'';position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%}
        .cald.few::after{background:var(--or)}
        .cald.full::after{background:#FCA5A5}
        .cald.rng-s{background:var(--or);color:#fff;font-weight:900;border-radius:7px 0 0 7px}
        .cald.rng-e{background:var(--or);color:#fff;font-weight:900;border-radius:0 7px 7px 0}
        .cald.rng-se{background:var(--or);color:#fff;font-weight:900;border-radius:7px}
        .cald.rng-m{background:#FFF0E0;color:var(--or)}
        .cal-leg{display:flex;gap:8px;padding:0 16px 10px;flex-wrap:wrap}
        .cal-lgi{display:flex;align-items:center;gap:4px;font-size:.6rem;color:var(--i3)}
        .cal-lgd{width:8px;height:8px;border-radius:50%}
        .cal-hint{margin:0 16px 10px;padding:8px 12px;background:#FFF8F2;border:1px solid #FED7AA;border-radius:9px;font-size:.7rem;color:#92400E;font-weight:600;text-align:center}
        .pax-row{display:flex;align-items:center;justify-content:space-between;padding:11px 16px;background:var(--bg);border-top:1px solid var(--bd);border-bottom:1px solid var(--bd)}
        .pax-lbl{font-size:.78rem;font-weight:800;color:var(--navy)}
        .pax-sub{font-size:.63rem;color:var(--i3);margin-top:1px}
        .pax-ctrl{display:flex;align-items:center}
        .pax-btn{width:32px;height:32px;border:1.5px solid var(--bd);background:var(--wh);border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;transition:all .12s;display:flex;align-items:center;justify-content:center;color:var(--i2)}
        .pax-btn:hover:not(:disabled){border-color:var(--or);color:var(--or);background:#FFF8F2}
        .pax-btn:disabled{color:var(--bd);cursor:not-allowed}
        .pax-num{width:40px;text-align:center;font-size:1rem;font-weight:900;color:var(--navy)}
        .szl-bar{display:flex;align-items:center;justify-content:space-between;padding:9px 16px;background:var(--tlt);border-top:1px solid #B2EBEA}
        .szl-bar-t{font-size:.7rem;font-weight:800;color:var(--tdk)}
        .szl-bar-n{font-size:.8rem;font-weight:900;color:var(--tdk)}
        .bsum{margin:10px 16px;border:1.5px solid var(--bd);border-radius:13px;overflow:hidden}
        .bsum-head{background:linear-gradient(135deg,#F5821F,#DC6C10);padding:8px 13px;display:flex;align-items:center;justify-content:space-between}
        .bsum-ht{font-size:.67rem;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:.07em}
        .bsum-clr{background:none;border:none;color:rgba(255,255,255,.75);cursor:pointer;font-size:.75rem}
        .bsum-clr:hover{color:#fff}
        .bsum-rows{padding:10px 13px;display:flex;flex-direction:column;gap:5px}
        .bsum-row{display:flex;justify-content:space-between;align-items:center;font-size:.75rem;color:var(--i2)}
        .bsum-row b{color:var(--navy);font-weight:800}
        .bsum-total{font-size:.86rem;font-weight:900;padding-top:7px;border-top:1.5px solid var(--bd);margin-top:2px}
        .bsum-total span:last-child{color:var(--or);font-size:.98rem}
        .res-btn{margin:10px 16px 12px;width:calc(100% - 32px);padding:14px;background:linear-gradient(135deg,#F5821F,#DC6C10);color:#fff;border:none;border-radius:12px;font-size:.88rem;font-weight:900;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 16px rgba(245,130,31,.35)}
        .res-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(245,130,31,.45)}
        .res-btn:disabled{background:#E5E7EB;color:#9CA3AF;cursor:not-allowed;transform:none;box-shadow:none}
        .res-trust{padding:0 16px 14px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;border-top:1px solid var(--bg);padding-top:11px}
        .res-tri{display:flex;align-items:center;gap:4px;font-size:.6rem;color:var(--i3);font-weight:600}
        .map-card{background:var(--wh);border:1px solid var(--bd);border-radius:var(--r4);overflow:hidden;box-shadow:var(--sh)}
        .map-top{padding:12px 16px;display:flex;align-items:center;justify-content:space-between}
        .map-lbl{font-size:.8rem;font-weight:800;color:var(--navy)}
        .map-sub{font-size:.67rem;color:var(--i3);margin-top:1px}
        .map-link{font-size:.7rem;font-weight:700;color:var(--tdk);text-decoration:none;display:flex;align-items:center;gap:3px}
        .map-embed{width:100%;height:190px;border:none;display:block;filter:saturate(.85)}
        .bcard{background:linear-gradient(135deg,#E5F9F8,#F0FBF9);border:1.5px solid var(--teal);border-radius:var(--r4);padding:16px;display:flex;align-items:center;gap:12px;box-shadow:var(--sh)}
        .bcard-i{font-size:2rem;flex-shrink:0}
        .bcard-t{font-size:.85rem;font-weight:800;color:var(--tdk);line-height:1.3}
        .bcard-s{font-size:.67rem;color:var(--i3);margin-top:3px;line-height:1.5}
        .bb{position:fixed;bottom:0;left:0;right:0;background:var(--navy);color:#fff;padding:14px 24px;display:flex;align-items:center;gap:16px;z-index:300;box-shadow:0 -4px 20px rgba(0,0,0,.2)}
        .bb-i{flex:1;font-size:.78rem;color:rgba(255,255,255,.75)}
        .bb-i b{color:#fff}
        .bb-p{font-size:1.1rem;font-weight:900;color:var(--or)}
        .bb-btn{background:var(--or);color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:.82rem;font-weight:800;cursor:pointer;white-space:nowrap}
        .lb{display:flex;position:fixed;inset:0;background:rgba(0,0,0,.93);z-index:500;align-items:center;justify-content:center}
        .lb-x{position:absolute;top:16px;right:16px;background:rgba(255,255,255,.15);border:none;color:#fff;width:42px;height:42px;border-radius:50%;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center}
        .lb-x:hover{background:rgba(255,255,255,.25)}
        .lbn{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.15);border:none;color:#fff;width:52px;height:52px;border-radius:50%;cursor:pointer;font-size:2.2rem;display:flex;align-items:center;justify-content:center}
        .lbn:hover{background:rgba(255,255,255,.25)}
        .lbn-p{left:16px}.lbn-n{right:16px}
        .lb-inner{display:flex;flex-direction:column;align-items:center;gap:12px;max-width:90vw}
        .lb-inner img{max-width:88vw;max-height:80vh;object-fit:contain;border-radius:12px;display:block}
        .lb-cnt{font-size:.75rem;font-weight:700;color:rgba(255,255,255,.45)}
        @media(max-width:1100px){.layout{grid-template-columns:1fr}.sidebar{position:static}}
        @media(max-width:768px){
          .th-name{font-size:1.4rem}
          .gall{grid-template-columns:1fr 1fr;grid-template-rows:170px 170px}
          .gp-main{grid-row:1;grid-column:1/3}
          .gp-bl,.gp-br{display:none}
          .review-grid,.rules-grid,.feat-grid{grid-template-columns:1fr}
        }
        @media(max-width:480px){.wrap{padding:0 12px}.gall{grid-template-rows:140px 140px}}
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <Link href="/">
          <img className="nav-logo" src="/logo.png" alt="MyLoungers" />
        </Link>
        <Link href="/arama" className="nav-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Aramaya Dön
        </Link>
        <span className="nav-sp" />
        <Link href="/profil" className="nav-profil">Profilim</Link>
        <button className={`fav-btn${fav ? " on" : ""}`} onClick={() => setFav(!fav)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          {fav ? "Kaydedildi" : "Kaydet"}
        </button>
      </nav>

      <div className="wrap">
        {/* BREADCRUMB */}
        <div className="bc">
          <Link href="/">Ana Sayfa</Link><span className="bc-sep">›</span>
          <span>Hotel</span><span className="bc-sep">›</span>
          <span>{HOTEL.name}</span>
        </div>

        {/* HEADER */}
        <div className="th">
          <div className="th-name">{HOTEL.name}</div>
          <div className="th-meta">
            <span className="stars">{"★".repeat(HOTEL.stars)}{"☆".repeat(5 - HOTEL.stars)}</span>
            <span className="score-badge">{HOTEL.score.toFixed(1)} / 10</span>
            <span className="verified">✓ Doğrulandı</span>
            {kategoriBadges.length > 0 && kategoriBadges.map((kat) => (
              <span key={kat} className="cat-tag">🏖 {kat}</span>
            ))}
            {HOTEL.reviews > 0 && (
              <span style={{ fontSize: ".75rem", color: "var(--i3)" }}>{HOTEL.reviews} değerlendirme</span>
            )}
          </div>
          <div className="th-addr">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {HOTEL.address} &nbsp;·&nbsp;
            <a href={HOTEL.mapsUrl} target="_blank" rel="noreferrer" style={{ color: "var(--tdk)", fontWeight: 700, textDecoration: "none" }}>Haritada gör</a>
          </div>
        </div>

        {/* GALERİ */}
        <div className="gall">
          {[0,1,2,3].map((i) => (
            <div key={i} className={`gp gp-${["main","tr","mr","bl"][i]}`} onClick={() => { setLbIdx(i); setLbOpen(true); }}>
              <img src={HOTEL.images[i] ?? HOTEL.images[0]} alt={HOTEL.name} />
            </div>
          ))}
          <div className="gp gp-br" onClick={() => { setLbIdx(0); setLbOpen(true); }}>
            <img src={HOTEL.images[4] ?? HOTEL.images[0]} alt={HOTEL.name} />
            <div className="gp-overlay">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <div className="gp-overlay-t">Tüm Fotoğraflar</div>
              <div className="gp-overlay-s">{HOTEL.images.length} fotoğraf</div>
            </div>
          </div>
        </div>

        {/* LAYOUT */}
        <div className="layout">
          <div className="main-col">

            {/* HAKKINDA */}
            <div className="panel">
              <div className="ph" onClick={() => togglePanel("about")}>
                <div className="ph-l"><span className="ph-ic">📍</span><div><div className="ph-title">Tesis Hakkında</div><div className="ph-sub">{HOTEL.name}</div></div></div>
                <svg className={`ch${openPanels.about ? " ch-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {openPanels.about && (
                <div className="pb" style={{ padding: 20 }}>
                  {(((row as any)?.kisa_aciklama) || ((row as any)?.detayli_aciklama)) && (
                    <p className="about-p">
                      {(row as any)?.kisa_aciklama && (
                        <span>{(row as any).kisa_aciklama}</span>
                      )}
                      {(row as any)?.detayli_aciklama && (
                        <>
                          {(row as any)?.kisa_aciklama && <br /><br />}
                          <span>{(row as any).detayli_aciklama}</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* İMKANLAR */}
            <div className="panel">
              <div className="ph" onClick={() => togglePanel("feats")}>
                <div className="ph-l"><span className="ph-ic">✨</span><div><div className="ph-title">Tesis İmkânları</div><div className="ph-sub">Öne çıkan özellikler</div></div></div>
                <svg className={`ch${openPanels.feats ? " ch-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {openPanels.feats && <div className="pb" style={{ padding: 20 }}>
                {imkanlar.length === 0 ? (
                  <p style={{ fontSize: ".8rem", color: "var(--i3)" }}>Henüz eklenmedi.</p>
                ) : (
                  <div className="feat-grid">
                    {imkanlar.map((it) => (
                      <div key={it.name} className="feat-item">
                        <div className="feat-ic">{it.emoji || "•"}</div>
                        {it.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>}
            </div>

            {/* YERLEŞİM PLANI */}
            <div className="panel">
              <div className="ph" onClick={() => togglePanel("plan")}>
                <div className="ph-l"><span className="ph-ic">🗺️</span><div><div className="ph-title">Tesis Yerleşim Planı</div><div className="ph-sub">Bölgeye tıklayarak şezlong seçin</div></div></div>
                <svg className={`ch${openPanels.plan ? " ch-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {openPanels.plan && <div className="pb" style={{ padding: 16 }}>
                <div style={{ borderRadius: 16, overflow: "hidden", border: "2px solid var(--bd)" }}>
                  <div className="plan-svg-wrap">
                    <svg viewBox="0 0 520 320" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", display: "block" }}>
                      <defs>
                        <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0C4A6E"/><stop offset="100%" stopColor="#0EA5E9"/>
                        </linearGradient>
                      </defs>
                      <rect x="0" y="0" width="520" height="85" fill="url(#seaG)" rx="12"/>
                      <text x="260" y="18" fontSize="8" fontWeight="800" fill="rgba(255,255,255,.3)" textAnchor="middle" letterSpacing="5">🌊  D E N İ Z  🌊</text>
                      <path d="M0 55 Q130 45 260 55 Q390 65 520 55" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/>
                      <g className="plan-zone" onClick={() => szlRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                        <rect x="155" y="22" width="210" height="50" rx="8" fill="#1D4ED8" stroke="#93C5FD" strokeWidth="2"/>
                        <text x="260" y="43" fontSize="11" fontWeight="800" fill="#fff" textAnchor="middle">⚓ İSKELE</text>
                        <text x="260" y="58" fontSize="8.5" fill="rgba(255,255,255,.8)" textAnchor="middle">30 şezlong · ₺1.250–1.500</text>
                      </g>
                      <rect x="240" y="72" width="40" height="18" rx="3" fill="#2563EB" opacity=".6"/>
                      <rect x="0" y="85" width="520" height="145" fill="#E8C97A"/>
                      <g className="plan-zone" onClick={() => szlRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                        <rect x="25" y="92" width="470" height="55" rx="10" fill="#7C3AED" stroke="#C4B5FD" strokeWidth="2"/>
                        <text x="260" y="115" fontSize="12" fontWeight="800" fill="#fff" textAnchor="middle">💎 VIP BÖLGE</text>
                        <text x="260" y="131" fontSize="8.5" fill="rgba(255,255,255,.85)" textAnchor="middle">20 şezlong (D–E sırası) · ₺1.500–2.000</text>
                      </g>
                      <g className="plan-zone" onClick={() => szlRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                        <rect x="25" y="155" width="470" height="65" rx="10" fill="#059669" stroke="#6EE7B7" strokeWidth="2"/>
                        <text x="260" y="182" fontSize="12" fontWeight="800" fill="#fff" textAnchor="middle">⭐ SILVER BÖLGE</text>
                        <text x="260" y="198" fontSize="8.5" fill="rgba(255,255,255,.85)" textAnchor="middle">50 şezlong (F–J sırası) · ₺1.000–1.250</text>
                      </g>
                      <rect x="145" y="228" width="230" height="20" rx="6" fill="rgba(0,0,0,.12)"/>
                      <text x="260" y="242" fontSize="8.5" fontWeight="700" fill="rgba(0,0,0,.45)" textAnchor="middle">👆 Bölgeye tıklayarak şezlong seçin</text>
                      <rect x="0" y="250" width="520" height="70" fill="#1E293B"/>
                      <rect x="50" y="258" width="110" height="52" rx="8" fill="#38BDF8" stroke="#7DD3FC" strokeWidth="1.5"/>
                      <text x="105" y="280" fontSize="9" fontWeight="800" fill="#fff" textAnchor="middle">🏊 HAVUZ</text>
                      <text x="105" y="294" fontSize="7.5" fill="rgba(255,255,255,.65)" textAnchor="middle">Misafirlere açık</text>
                      <rect x="185" y="258" width="150" height="52" rx="8" fill="#374151" stroke="#6B7280" strokeWidth="1.5"/>
                      <text x="260" y="280" fontSize="9" fontWeight="800" fill="#fff" textAnchor="middle">🍽️ RESTORAN</text>
                      <text x="260" y="294" fontSize="7.5" fill="rgba(255,255,255,.65)" textAnchor="middle">Beach Bar & Café</text>
                      <rect x="360" y="258" width="110" height="52" rx="8" fill="#374151" stroke="#6B7280" strokeWidth="1.5"/>
                      <text x="415" y="280" fontSize="9" fontWeight="800" fill="#fff" textAnchor="middle">🏨 TESİS</text>
                      <text x="415" y="294" fontSize="7.5" fill="rgba(255,255,255,.65)" textAnchor="middle">Resepsiyon</text>
                      <text x="260" y="316" fontSize="7" fontWeight="900" fill="rgba(255,255,255,.25)" textAnchor="middle" letterSpacing="3">TESİS BİNASI</text>
                    </svg>
                  </div>
                  <div className="plan-legend">
                    {[["#1D4ED8","İskele (30)"],["#7C3AED","VIP (20)"],["#059669","Silver (50)"],["#22C55E","Müsait"],["#EF4444","Dolu"],["#F97316","Bakım"],["#F5821F","Seçili"]].map(([c,l]) => (
                      <div key={l} className="plan-leg-item"><div className="plan-leg-dot" style={{ background: c }}></div>{l}</div>
                    ))}
                  </div>
                </div>
              </div>}
            </div>

            {/* ŞEZLONG DÜZENİ */}
            <div className="panel" ref={szlRef}>
              <div className="ph" onClick={() => togglePanel("szl")}>
                <div className="ph-l"><span className="ph-ic">🏖️</span><div><div className="ph-title">Şezlong Düzeni</div><div className="ph-sub">100 şezlong · İskele · VIP · Silver</div></div></div>
                <svg className={`ch${openPanels.szl ? " ch-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {openPanels.szl && <div className="pb" style={{ padding: 22 }}>
                <div className="schema">
                  <div style={{ background:"linear-gradient(180deg,#0C4A6E,#0369A1 55%,#38BDF8)", padding:"18px 20px 14px", textAlign:"center" }}>
                    <div style={{ color:"rgba(255,255,255,.22)", fontSize:".6rem", fontWeight:900, textTransform:"uppercase", letterSpacing:".2em", marginBottom:4 }}>🌊 🌊 🌊</div>
                    <div style={{ color:"#fff", fontSize:".85rem", fontWeight:900, letterSpacing:".28em", opacity:.85 }}>~ D E N İ Z ~</div>
                  </div>
                  {zones.map((z, zi) => (
                    <div key={z.key} style={{ borderTop: zi > 0 ? "1px solid #E5E7EB" : undefined }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 18px", background:z.gradient }}>
                        <div style={{ fontWeight:800, fontSize:13, color:"white" }}>{z.icon} {z.label} — {z.prefix}1–{z.prefix}{z.statuses.length}</div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,.7)" }}>Hafta içi / Hafta sonu</div>
                          <div style={{ fontSize:12, fontWeight:800, color:"white" }}>₺{z.pw.toLocaleString("tr-TR")} / ₺{z.pe.toLocaleString("tr-TR")}</div>
                        </div>
                      </div>
                      <div style={{ background:"white" }}>
                        <SzlGrid zoneKey={z.key} prefix={z.prefix} statuses={z.statuses} pw={z.pw} pe={z.pe} />
                      </div>
                    </div>
                  ))}
                  <div className="bldz">🏨  TESİS BİNASI</div>
                </div>
                <p style={{ fontSize: ".68rem", color: "var(--i3)", marginTop: 12, textAlign: "center", lineHeight: 2, display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
                  {[["#DCFCE7","#86EFAC","Boş"],["#FFEDD5","#FB923C","Dolu"],["#DBEAFE","#60A5FA","Rezerve"],["#F1F5F9","#CBD5E1","Bakım"],["#EDE9FE","#7C3AED","Kilitli"],["#FFF7ED","#F5821F","Seçili"]].map(([bg,bdr,lbl])=>(
                    <span key={lbl} style={{ background:bg, border:`1.5px solid ${bdr}`, borderRadius:5, padding:"2px 9px", fontWeight:700 }}>{lbl}</span>
                  ))}
                </p>
                <p style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--i3)", textAlign: "center", marginTop: 10 }}>
                  📅 {selStart ? fmtRange(selStart, selEnd) + (selEnd ? "" : " (tek gün)") : "Rezervasyon için tarih seçin"}
                </p>
              </div>}
            </div>

            {/* VİDEO */}
            <div className="panel">
              <div className="ph" onClick={() => togglePanel("video")}>
                <div className="ph-l"><span className="ph-ic">🎬</span><div><div className="ph-title">Tesis Videosu</div><div className="ph-sub">YouTube veya Vimeo URL yapıştırın</div></div></div>
                <svg className={`ch${openPanels.video ? " ch-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {openPanels.video && <div className="pb" style={{ padding: 0 }}>
                <div className="video-wrap">
                  {videoEmbed ? (
                    <div className="video-frame">
                      <button className="video-close" onClick={() => setVideoEmbed(null)}>✕</button>
                      <iframe src={videoEmbed} allowFullScreen title="video" />
                    </div>
                  ) : (
                    <div className="video-ph">
                      <div className="video-ph-ic"><svg width="40" height="40" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                      <div className="video-ph-t">Video URL girin ve Yükle'ye tıklayın</div>
                    </div>
                  )}
                </div>
                <div className="video-url-bar">
                  <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                  <button onClick={loadVideo}>Yükle</button>
                </div>
              </div>}
            </div>

            {/* ULAŞIM */}
            <div className="panel">
              <div className="ph" onClick={() => togglePanel("transport")}>
                <div className="ph-l"><span className="ph-ic">🚌</span><div><div className="ph-title">Ulaşım Rehberi</div><div className="ph-sub">Dolmuş & Taksi</div></div></div>
                <svg className={`ch${openPanels.transport ? " ch-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {openPanels.transport && <div className="pb" style={{ padding: 20 }}>
                <div className="ul-grid">
                  <div className="ul-card taxi-card">
                    <div className="ul-head"><span className="ul-head-ic">🚖</span><div><div className="ul-head-t">Taksi</div><div className="ul-head-s">En hızlı seçenek</div></div></div>
                    <div className="ul-rows">
                      <div className="ul-row"><span className="ul-row-ic">📍</span><div><b>Merkeze Uzaklık</b>{row?.merkez_uzaklik ?? "Bodrum merkeze ~15 dk"}</div></div>
                      <div className="ul-row"><span className="ul-row-ic">✈️</span><div><b>Havalimanına Uzaklık</b>{row?.havalimani_uzaklik ?? "Milas-Bodrum Havalimanı ~45 dk"}</div></div>
                      <div className="ul-row"><span className="ul-row-ic">📞</span><div><b>Taksi Telefon</b><a href={`tel:${row?.taksi_tel ?? "+90252316XXXX"}`}>{row?.taksi_tel ?? "0252 316 XX XX"}</a></div></div>
                      <span className="ul-badge badge-or">⏱ 7/24 hizmet</span>
                    </div>
                  </div>
                  <div className="ul-card dolmus-card">
                    <div className="ul-head"><span className="ul-head-ic">🚐</span><div><div className="ul-head-t">Dolmuş</div><div className="ul-head-s">Ekonomik · Yerel</div></div></div>
                    <div className="ul-rows">
                      <div className="ul-row"><span className="ul-row-ic">🔵</span><div><b>Hat / Güzergah</b>{row?.dolmus_hat ?? "Bodrum - Yalıkavak"}</div></div>
                      <div className="ul-row"><span className="ul-row-ic">🕐</span><div><b>Sefer Saatleri</b>{row?.dolmus_saat ?? "07:00 – 22:00"}</div></div>
                      <div className="ul-row"><span className="ul-row-ic">📍</span><div><b>İniş noktası</b>{row?.dolmus_durak ?? "Marina durağı · 5 dk yürüyüş"}</div></div>
                      <span className="ul-badge badge-green">✓ En uygun fiyat</span>
                    </div>
                  </div>
                </div>
              </div>}
            </div>

            {/* KURALLAR */}
            <div className="panel">
              <div className="ph" onClick={() => togglePanel("rules")}>
                <div className="ph-l"><span className="ph-ic">📋</span><div><div className="ph-title">Bilinmesi Gerekenler</div><div className="ph-sub">Kurallar & Kampanyalar</div></div></div>
                <svg className={`ch${openPanels.rules ? " ch-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {openPanels.rules && <div className="pb" style={{ padding: 20 }}>
                <div className="rules-grid">
                  <div className="rules-col">
                    <h4>🚫 Kurallar</h4>
                    {(parsedKurallar.length ? parsedKurallar : defaultKurallar).map((item) => (
                      <div key={item.text} className="rule-item"><span>{item.icon}</span>{item.text}</div>
                    ))}
                  </div>
                  <div className="rules-col">
                    <h4>🎁 Kampanyalar</h4>
                    {(parsedKampanyalar.length ? parsedKampanyalar : defaultKampanyalar).map((item) => (
                      <div key={item.text} className="rule-item"><span>{item.icon}</span>{item.text}</div>
                    ))}
                  </div>
                </div>
              </div>}
            </div>

            {/* YORUMLAR (mock) */}
            <div className="panel">
              <div className="ph" onClick={() => togglePanel("reviews")}>
                <div className="ph-l"><span className="ph-ic">⭐</span><div><div className="ph-title">Kullanıcı Yorumları</div><div className="ph-sub">{HOTEL.reviews || 0} doğrulanmış yorum</div></div></div>
                <svg className={`ch${openPanels.reviews ? " ch-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {openPanels.reviews && <div className="pb" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
                  <div style={{ textAlign: "center" }}><div className="score-big">{HOTEL.score.toFixed(1)}</div><div className="score-label">{HOTEL.reviews || 0} yorum</div></div>
                  <div className="score-bars">
                    {[["Konum",98],["Temizlik",96],["Hizmet",94],["Fiyat/Değer",90]].map(([l,v]) => (
                      <div key={l as string} className="score-bar-row">
                        <span style={{ width: 60 }}>{l}</span>
                        <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: v + "%" }} /></div>
                        <span>{(v as number / 10).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>}
            </div>

          </div>

          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="rcard">
              <div className="sb-steps">
                <div className={`sb-step${selStart ? " act" : ""}`}>
                  <div className="sb-step-ic">📅</div>
                  <div className="sb-step-n">Tarih</div>
                  <div className="sb-step-v">{selStart ? selStart.getDate() + " " + MN[selStart.getMonth()].substr(0,3) + (selEnd ? " – " + selEnd.getDate() + " " + MN[selEnd.getMonth()].substr(0,3) : " →") : "Seç"}</div>
                </div>
                <div className={`sb-step${selSzls.length > 0 ? " act" : ""}`}>
                  <div className="sb-step-ic">🛏</div>
                  <div className="sb-step-n">Şezlong</div>
                  <div className="sb-step-v">{selSzls.length > 0 ? selSzls.length + " seçildi" : "Seç"}</div>
                </div>
                <div className="sb-step">
                  <div className="sb-step-ic">👥</div>
                  <div className="sb-step-n">Kişi</div>
                  <div className="sb-step-v">{paxCount} Kişi</div>
                </div>
              </div>

              <div className="calb">
                <div className="caln">
                  <button className="calnb" onClick={() => { const d = new Date(calDt); d.setMonth(d.getMonth() - 1); setCalDt(d); }}>‹</button>
                  <span className="calm">{MN[calMonth]} {calYear}</span>
                  <button className="calnb" onClick={() => { const d = new Date(calDt); d.setMonth(d.getMonth() + 1); setCalDt(d); }}>›</button>
                </div>
                <div className="calg">
                  {["Pt","Sa","Ça","Pe","Cu","Ct","Pz"].map((d) => <div key={d} className="caldl">{d}</div>)}
                  {Array.from({ length: firstDay }, (_, i) => <button key={"e" + i} className="cald" disabled />)}
                  {Array.from({ length: dim }, (_, i) => {
                    const day = i + 1;
                    const cls = calDayClass(day);
                    const disabled = cls.includes("dis") || cls.includes("full");
                    return <button key={day} className={cls} disabled={disabled} onClick={() => pickDate(day, calMonth, calYear)}>{day}</button>;
                  })}
                </div>
              </div>
              <div className="cal-leg">
                <div className="cal-lgi"><div className="cal-lgd" style={{ background: "var(--tlt)", border: "1px solid var(--teal)" }}></div>Müsait</div>
                <div className="cal-lgi"><div className="cal-lgd" style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}></div>Az yer</div>
                <div className="cal-lgi"><div className="cal-lgd" style={{ background: "#FEE2E2", border: "1px solid #FCA5A5" }}></div>Dolu</div>
                <div className="cal-lgi"><div className="cal-lgd" style={{ background: "var(--or)" }}></div>Seçili aralık</div>
              </div>

              {selStart && !selEnd && <div className="cal-hint">📅 İsteğe bağlı: bitiş tarihi seçin (seçmezseniz tek gün)</div>}

              {selStart && (
                <div className="pax-row">
                  <div><div className="pax-lbl">👥 Kişi Sayısı</div><div className="pax-sub">Maks. 5 · Her kişi 1 şezlong</div></div>
                  <div className="pax-ctrl">
                    <button className="pax-btn" disabled={paxCount === 1} onClick={() => setPaxCount((p) => Math.max(1, p - 1))}>−</button>
                    <span className="pax-num">{paxCount}</span>
                    <button className="pax-btn" disabled={paxCount === 5} onClick={() => setPaxCount((p) => Math.min(5, p + 1))}>+</button>
                  </div>
                </div>
              )}

              {selStart && (
                <div className="szl-bar">
                  <span className="szl-bar-t">Seçilen şezlong</span>
                  <span className="szl-bar-n">{selSzls.length} / {paxCount}</span>
                </div>
              )}

              {selSzls.length > 0 && selStart && (
                <div className="bsum">
                  <div className="bsum-head">
                    <span className="bsum-ht">Rezervasyon Özeti</span>
                    <button className="bsum-clr" onClick={clearAll}>✕ Temizle</button>
                  </div>
                  <div className="bsum-rows">
                    <div className="bsum-row"><span>Tarih</span><b>{fmtRange(selStart, selEnd)}{!selEnd ? " (tek gün)" : ""}</b></div>
                    <div className="bsum-row"><span>Süre</span><b>{days} gün</b></div>
                    <div className="bsum-row"><span>Şezlong(lar)</span><b>{szlNames}</b></div>
                    <div className="bsum-row"><span>Kişi sayısı</span><b>{selSzls.length} kişi / şezlong</b></div>
                    <div className="bsum-row"><span>Birim fiyat / gün</span><b>{units} / gün</b></div>
                    <div className="bsum-row bsum-total"><span>Toplam</span><span>₺{total.toLocaleString("tr-TR")}</span></div>
                  </div>
                </div>
              )}

              <button className="res-btn" disabled={btnDisabled} onClick={goRes}>{btnText}</button>
              <div className="res-trust">
                {["Ücretsiz iptal","Güvenli ödeme","Anında onay"].map((t) => (
                  <div key={t} className="res-tri">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 9, height: 9, color: "#16A34A" }}><polyline points="20 6 9 17 4 12"/></svg>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* HARİTA */}
            <div className="map-card">
              <div className="map-top">
                <div><div className="map-lbl">📍 Konum</div><div className="map-sub">{HOTEL.address}</div></div>
                <a href={HOTEL.mapsUrl} target="_blank" rel="noreferrer" className="map-link">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Google Maps
                </a>
              </div>
              <iframe className="map-embed" src={HOTEL.mapsEmbed} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="map" />
            </div>

            {/* ROZET */}
            <div className="bcard">
              <div className="bcard-i">🏆</div>
              <div>
                <div className="bcard-t">Bölgenin Öne Çıkan Tesislerinden</div>
                <div className="bcard-s">
                  {HOTEL.reviews || 0} doğrulanmış rezervasyon ·
                  {" "}⭐⭐⭐⭐⭐ &nbsp;{HOTEL.score.toFixed(1)} / 10 ortalama
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BANNER */}
      {selSzls.length > 0 && selStart && (
        <div className="bb">
          <div className="bb-i">Seçilen: <b>{szlNames}</b> &nbsp;·&nbsp; <b>{days} gün</b>{!selEnd ? " (tek gün)" : ""}</div>
          <div className="bb-p">₺{total.toLocaleString("tr-TR")}</div>
          <button className="bb-btn" onClick={goRes}>Rezervasyonu Tamamla →</button>
        </div>
      )}

      {/* LİGHTBOX */}
      {lbOpen && (
        <div className="lb">
          <button className="lb-x" onClick={() => setLbOpen(false)}>✕</button>
          <button className="lbn lbn-p" onClick={() => setLbIdx((i) => (i - 1 + HOTEL.images.length) % HOTEL.images.length)}>‹</button>
          <div className="lb-inner">
            <img src={HOTEL.images[lbIdx]} alt={HOTEL.name} />
            <div className="lb-cnt">{lbIdx + 1} / {HOTEL.images.length}</div>
          </div>
          <button className="lbn lbn-n" onClick={() => setLbIdx((i) => (i + 1) % HOTEL.images.length)}>›</button>
        </div>
      )}
    </>
  );
}

