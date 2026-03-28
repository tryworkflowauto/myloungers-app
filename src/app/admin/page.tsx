"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "./AdminToastContext";
import { supabase } from "@/lib/supabase";

const NAVY   = "#0A1628";
const TEAL   = "#0ABAB5";
const ORANGE = "#F5821F";
const GRAY50  = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const GREEN  = "#10B981";
const RED    = "#EF4444";
const YELLOW = "#F59E0B";
const BLUE   = "#3B82F6";
const PURPLE = "#7C3AED";

type TesisDurum = "aktif" | "onay" | "askida";
type BasvuruPayload = {
  id: string;
  isletme_adi: string;
  sehir: string;
  ilce: string | null;
  tesis_tipi: string;
  tam_adres: string | null;
  ad_soyad: string;
  telefon: string;
  email: string | null;
};
type BasvuruRow = {
  id: string;
  isletme_adi: string;
  sehir: string;
  ilce: string | null;
  tesis_tipi: string;
  kapasite: number;
  tam_adres: string | null;
  ad_soyad: string;
  telefon: string;
  email: string | null;
  created_at?: string | null;
};
type Tesis = {
  id: string;
  basvuru?: BasvuruPayload;
  ad: string;
  lokasyon: string;
  emoji: string;
  emojiBg: string;
  durum: TesisDurum;
  sezlong: number;
  ciro?: string;
  komisyon?: string;
  puan?: number;
  puanYuzde?: number;
  sonAktivite: string;
};
type YorumTalep = { id: string; puan: number; tesis: string; kisi: string; metin: string; talep: string };

type KomisyonSatir = { tesis: string; ciro: string; oran: string; komisyon: string };

type StatModalData = {
  aktifSay: number;
  aktifTesisler: { ad: string; sehir: string; ciro: string; puan: string }[];
  sehirOzet: { sehir: string; adet: number }[];
  buAyCiroToplam: number;
  ciroBar: { ad: string; tl: number; ciroK: number; renk: string }[];
  platformKomisyonToplam: number;
  komisyonSatirlari: { ad: string; ciro: string; kom: string }[];
  musteriSay: number;
  ortPuan: number;
  tesisPuanSirasi: { ad: string; puan: number; yorum: number }[];
};

const EMOJI_ROT = ["🌊", "☀️", "🔱", "🏖️", "🌴"];
const BG_ROT = ["#E0F2FE", "#FEF3C7", "#EDE9FE", "#DBEAFE", "#FEE2E2"];

function fmtK(n: number) {
  if (!Number.isFinite(n) || n <= 0) return "₺0";
  if (n >= 1_000_000) return "₺" + (n / 1_000_000).toFixed(1).replace(".", ",") + "M";
  if (n >= 1000) return "₺" + Math.round(n / 1000) + "K";
  return "₺" + Math.round(n).toLocaleString("tr-TR");
}

function basvuruToPayload(b: BasvuruRow): BasvuruPayload {
  return {
    id: b.id,
    isletme_adi: b.isletme_adi,
    sehir: b.sehir,
    ilce: b.ilce,
    tesis_tipi: b.tesis_tipi,
    tam_adres: b.tam_adres,
    ad_soyad: b.ad_soyad,
    telefon: b.telefon,
    email: b.email,
  };
}

function mapBasvuruToTesis(b: BasvuruRow, index: number): Tesis {
  const created = b.created_at ? new Date(b.created_at) : null;
  const tarihStr = created && !Number.isNaN(created.getTime())
    ? created.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
    : "—";
  return {
    id: `b-${b.id}`,
    basvuru: basvuruToPayload(b),
    ad: b.isletme_adi || "—",
    lokasyon: `📍 ${b.sehir || "—"}`,
    emoji: EMOJI_ROT[index % EMOJI_ROT.length],
    emojiBg: BG_ROT[index % BG_ROT.length],
    durum: "onay",
    sezlong: typeof b.kapasite === "number" ? b.kapasite : Number(b.kapasite || 0),
    sonAktivite: `Başvuru: ${tarihStr}`,
  };
}

// ── Rich stat modal content ────────────────────────────────────────────────
function StatModalContent({ idx, onClose, data }: { idx: number; onClose: () => void; data: StatModalData | null }) {
  const NAVY2 = "#0A1628"; const TEAL2 = "#0ABAB5"; const ORANGE2 = "#F5821F";
  const G50 = "#F8FAFC"; const G100 = "#F1F5F9"; const G200 = "#E2E8F0"; const G400 = "#94A3B8"; const G600 = "#475569";
  const GREEN2 = "#10B981"; const RED2 = "#EF4444"; const BLUE2 = "#3B82F6"; const PURPLE2 = "#7C3AED";
  const rowStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${G100}` };
  const badge = (c: string, txt: string) => <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: c + "22", color: c }}>{txt}</span>;

  const d = data;

  if (idx === 0 && d) return (
    <>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY2, marginBottom: 4 }}>🏖️ {d.aktifSay} Aktif Tesis</h3>
      <p style={{ fontSize: 11, color: G400, marginBottom: 14 }}>Platforma kayıtlı ve aktif hizmet veren tesisler</p>
      {d.aktifTesisler.map((t, i) => (
        <div key={i} style={rowStyle}>
          <div><div style={{ fontSize: 13, fontWeight: 600, color: NAVY2 }}>{t.ad}</div><div style={{ fontSize: 10, color: G400 }}>📍 {t.sehir}</div></div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{t.ciro}</span>
            <span style={{ fontSize: 11, color: "#F59E0B" }}>★ {t.puan}</span>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 14, padding: "10px 14px", background: G50, borderRadius: 9 }}>
        {d.sehirOzet.map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: i ? 4 : 0 }}>
            <span style={{ color: G600 }}>{s.sehir}</span><strong>{s.adet} tesis</strong>
          </div>
        ))}
      </div>
    </>
  );

  if (idx === 1 && d) return (
    <>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY2, marginBottom: 4 }}>💰 Bu Ay Ciro — {fmtK(d.buAyCiroToplam)}</h3>
      <p style={{ fontSize: 11, color: G400, marginBottom: 14 }}>Tesis bazlı ciro dağılımı</p>
      {d.ciroBar.map((t, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: NAVY2, fontWeight: 600 }}>{t.ad}</span>
            <span style={{ fontWeight: 700 }}>₺{t.ciroK}K</span>
          </div>
          <div style={{ height: 7, background: G200, borderRadius: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: (d.buAyCiroToplam > 0 ? (t.tl / d.buAyCiroToplam) * 100 : 0) + "%", background: t.renk, borderRadius: 20 }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", padding: "10px 14px", background: G50, borderRadius: 9, fontWeight: 700 }}>
        <span>Toplam</span><span>{fmtK(d.buAyCiroToplam)}</span>
      </div>
    </>
  );

  if (idx === 2 && d) return (
    <>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY2, marginBottom: 4 }}>📊 Platform Komisyonu — {fmtK(d.platformKomisyonToplam)}</h3>
      <p style={{ fontSize: 11, color: G400, marginBottom: 14 }}>Tesis bazlı %5 komisyon detayı</p>
      {d.komisyonSatirlari.map((r, i) => (
        <div key={i} style={rowStyle}>
          <span style={{ fontSize: 13, color: NAVY2 }}>{r.ad}</span>
          <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
            <span style={{ color: G400 }}>{r.ciro}</span>
            <span style={{ color: G400 }}>%5</span>
            <span style={{ fontWeight: 700, color: GREEN2 }}>{r.kom}</span>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, padding: "10px 14px", background: G50, borderRadius: 9, fontWeight: 700 }}>
        <span>Toplam</span><span style={{ color: GREEN2 }}>{fmtK(d.platformKomisyonToplam)}</span>
      </div>
    </>
  );

  if (idx === 3 && d) return (
    <>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY2, marginBottom: 4 }}>👥 {d.musteriSay.toLocaleString("tr-TR")} Aktif Müşteri</h3>
      <p style={{ fontSize: 11, color: G400, marginBottom: 14 }}>kullanicilar tablosu</p>
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ padding: "10px 14px", background: G50, borderRadius: 9, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: BLUE2 }}>{d.musteriSay.toLocaleString("tr-TR")}</div>
          <div style={{ fontSize: 10, color: G400 }}>Kayıtlı Müşteri</div>
        </div>
        <div style={{ padding: "10px 14px", background: G50, borderRadius: 9, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: GREEN2 }}>{fmtK(d.buAyCiroToplam)}</div>
          <div style={{ fontSize: 10, color: G400 }}>Bu Ay Ciro</div>
        </div>
      </div>
    </>
  );

  if (idx === 4 && d) return (
    <>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY2, marginBottom: 4 }}>⭐ {d.ortPuan.toFixed(1)} Ort. Tesis Puanı</h3>
      <p style={{ fontSize: 11, color: G400, marginBottom: 14 }}>Müşteri değerlendirmelerine göre tesis sıralaması</p>
      {d.tesisPuanSirasi.map((t, i) => (
        <div key={i} style={rowStyle}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: NAVY2 }}>{t.ad}</div>
            <div style={{ fontSize: 10, color: G400 }}>{t.yorum} yorum</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 80, height: 5, background: G200, borderRadius: 20, overflow: "hidden" }}>
              <div style={{ height: "100%", width: (t.puan / 10 * 100) + "%", background: t.puan >= 9 ? GREEN2 : t.puan >= 8 ? ORANGE2 : RED2, borderRadius: 20 }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: t.puan >= 9 ? GREEN2 : t.puan >= 8 ? ORANGE2 : RED2 }}>{t.puan}</span>
          </div>
        </div>
      ))}
    </>
  );

  return null;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const tesislerRef   = useRef<HTMLDivElement>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [tesisler,        setTesisler]        = useState<Tesis[]>([]);
  const [yorumTalepleri,  setYorumTalepleri]  = useState<YorumTalep[]>([]);
  const [basvuruBekleyen, setBasvuruBekleyen]  = useState<BasvuruRow[]>([]);
  const [komisyonSatirlari, setKomisyonSatirlari] = useState<KomisyonSatir[]>([]);
  const [komisyonToplamCiro, setKomisyonToplamCiro] = useState(0);
  const [komisyonToplamKom, setKomisyonToplamKom] = useState(0);
  const [donemLabel, setDonemLabel] = useState("");
  const [statModalData, setStatModalData] = useState<StatModalData | null>(null);
  const [aktifTesisSayisi, setAktifTesisSayisi] = useState(0);
  const [buAyCiro, setBuAyCiro] = useState(0);
  const [platformKomisyon, setPlatformKomisyon] = useState(0);
  const [musteriSayisi, setMusteriSayisi] = useState(0);
  const [ortTesisPuani, setOrtTesisPuani] = useState(0);

  const [tesisAra,        setTesisAra]        = useState("");
  const [bannerGoster,    setBannerGoster]    = useState(true);
  const [highlightOnay,   setHighlightOnay]   = useState(false);

  const [onayModal,    setOnayModal]    = useState<Tesis | null>(null);
  const [reddetModal,  setReddetModal]  = useState<Tesis | null>(null);
  const [redSebebi,    setRedSebebi]    = useState("");
  const [yorumSilId,  setYorumSilId]  = useState<string | null>(null);
  const [statDetay,    setStatDetay]    = useState<number | null>(null);
  const [dropdownId,   setDropdownId]   = useState<string | null>(null);

  async function loadDashboardData() {
    const now = new Date();
    const y = now.getFullYear();
    const mo = now.getMonth();
    const start = new Date(y, mo, 1, 0, 0, 0, 0);
    const end = new Date(y, mo + 1, 0, 23, 59, 59, 999);
    const monthLong = start.toLocaleDateString("tr-TR", { month: "long" });
    const label = monthLong.charAt(0).toUpperCase() + monthLong.slice(1) + " " + y;
    setDonemLabel(label);

    const [
      tesisRes,
      basvuruRes,
      yorumRes,
      rezRes,
      kullaniciCountRes,
    ] = await Promise.all([
      supabase.from("tesisler").select("id, ad, sehir, aktif, kapasite, puan").order("ad", { ascending: true }),
      supabase.from("basvurular").select("*").eq("durum", "beklemede").order("id", { ascending: false }),
      supabase.from("yorumlar").select("id, tesis_id, musteri_adi, puan, yorum, sikayet_var, tesisler(ad)").eq("sikayet_var", true),
      supabase.from("rezervasyonlar").select("tesis_id, toplam_tutar, created_at").gte("created_at", start.toISOString()).lte("created_at", end.toISOString()),
      supabase.from("kullanicilar").select("*", { count: "exact", head: true }).eq("rol", "musteri"),
    ]);

    let musteriCt = kullaniciCountRes.count ?? 0;
    if (kullaniciCountRes.error) {
      const r2 = await supabase.from("kullanicilar").select("*", { count: "exact", head: true });
      musteriCt = r2.count ?? 0;
    }
    setMusteriSayisi(musteriCt);

    const basRows = (basvuruRes.data ?? []) as BasvuruRow[];
    setBasvuruBekleyen(basRows);

    const byTesis = new Map<string, number>();
    for (const r of rezRes.data ?? []) {
      const raw = (r as { tesis_id?: unknown }).tesis_id;
      if (raw == null) continue;
      const tid = String(raw);
      const amt = Number((r as { toplam_tutar?: unknown }).toplam_tutar ?? 0);
      byTesis.set(tid, (byTesis.get(tid) ?? 0) + (Number.isFinite(amt) ? amt : 0));
    }

    let ciroBuAy = 0;
    for (const v of byTesis.values()) ciroBuAy += v;
    setBuAyCiro(ciroBuAy);

    const tesisData = (tesisRes.data ?? []) as Record<string, unknown>[];
    let aktifSay = 0;
    let puanTop = 0;
    let puanN = 0;
    const komRows: KomisyonSatir[] = [];
    let komSum = 0;

    const mappedTesis: Tesis[] = tesisData.map((t, index) => {
      const id = String(t.id);
      const aktif = t.aktif === true;
      if (aktif) aktifSay++;
      const kap = typeof t.kapasite === "number" ? t.kapasite : Number(t.kapasite ?? 0);
      const puanRaw = t.puan;
      const puanNum = typeof puanRaw === "number" ? puanRaw : puanRaw != null ? Number(puanRaw) : NaN;
      if (Number.isFinite(puanNum)) {
        puanTop += puanNum;
        puanN++;
      }
      const hacim = byTesis.get(id) ?? 0;
      const komTut = Math.round(hacim * 0.05);
      komSum += komTut;
      komRows.push({
        tesis: typeof t.ad === "string" && t.ad ? t.ad : "—",
        ciro: fmtK(hacim),
        oran: "%5",
        komisyon: fmtK(komTut),
      });
      const puanDisp = Number.isFinite(puanNum) ? puanNum : undefined;
      return {
        id,
        ad: typeof t.ad === "string" ? t.ad : "—",
        lokasyon: `📍 ${typeof t.sehir === "string" && t.sehir ? t.sehir : "—"}`,
        emoji: EMOJI_ROT[index % EMOJI_ROT.length],
        emojiBg: BG_ROT[index % BG_ROT.length],
        durum: aktif ? ("aktif" as TesisDurum) : ("askida" as TesisDurum),
        sezlong: kap,
        ciro: aktif ? fmtK(hacim) : undefined,
        komisyon: aktif ? fmtK(komTut) : undefined,
        puan: puanDisp,
        puanYuzde: puanDisp !== undefined ? Math.min(100, puanDisp * 10) : undefined,
        sonAktivite: "—",
      };
    });

    setAktifTesisSayisi(aktifSay);
    setOrtTesisPuani(puanN > 0 ? puanTop / puanN : 0);
    setKomisyonSatirlari(komRows);
    setKomisyonToplamCiro(ciroBuAy);
    setKomisyonToplamKom(komSum);
    setPlatformKomisyon(komSum);

    const basvuruMapped = basRows.map((b, i) => mapBasvuruToTesis(b, i));
    setTesisler([...basvuruMapped, ...mappedTesis]);

    const yt: YorumTalep[] = [];
    if (!yorumRes.error && yorumRes.data) {
      for (const row of yorumRes.data as Record<string, unknown>[]) {
        const nested = row.tesisler as { ad?: string } | null | undefined;
        yt.push({
          id: String(row.id),
          puan: Number(row.puan ?? 0) || 0,
          tesis: nested?.ad ?? "—",
          kisi: String(row.musteri_adi ?? "Misafir"),
          metin: String(row.yorum ?? ""),
          talep: "Şikayet / silme talebi",
        });
      }
    }
    setYorumTalepleri(yt);

    const aktifListe = mappedTesis.filter((t) => t.durum === "aktif");
    const sehirMap = new Map<string, number>();
    for (const t of aktifListe) {
      const sehir = t.lokasyon.replace(/^📍\s*/, "") || "Diğer";
      sehirMap.set(sehir, (sehirMap.get(sehir) ?? 0) + 1);
    }
    const sehirOzet = Array.from(sehirMap.entries()).map(([sehir, adet]) => ({ sehir, adet }));

    const sortedCiro = [...aktifListe]
      .map((t) => ({ ad: t.ad, tl: byTesis.get(t.id) ?? 0 }))
      .sort((a, b) => b.tl - a.tl);
    const renkler = [TEAL, ORANGE, PURPLE, GRAY400];
    const ciroBar = sortedCiro.slice(0, 4).map((x, i) => ({
      ad: x.ad,
      tl: x.tl,
      ciroK: x.tl >= 1000 ? Math.round(x.tl / 1000 * 10) / 10 : Math.round(x.tl),
      renk: renkler[i % renkler.length],
    }));

    const komisyonModalSatir = sortedCiro.slice(0, 8).map((x) => ({
      ad: x.ad,
      ciro: fmtK(x.tl),
      kom: fmtK(Math.round(x.tl * 0.05)),
    }));

    const puanSirasi = [...mappedTesis]
      .filter((t) => t.puan !== undefined)
      .sort((a, b) => (b.puan ?? 0) - (a.puan ?? 0))
      .slice(0, 8)
      .map((t) => ({ ad: t.ad, puan: t.puan ?? 0, yorum: 0 }));

    setStatModalData({
      aktifSay: aktifSay,
      aktifTesisler: aktifListe.slice(0, 12).map((t) => ({
        ad: t.ad,
        sehir: t.lokasyon.replace(/^📍\s*/, ""),
        ciro: t.ciro ?? "₺0",
        puan: t.puan != null ? String(t.puan) : "—",
      })),
      sehirOzet: sehirOzet.length ? sehirOzet : [{ sehir: "—", adet: 0 }],
      buAyCiroToplam: ciroBuAy,
      ciroBar: ciroBar.length ? ciroBar : [{ ad: "—", tl: 0, ciroK: 0, renk: GRAY400 }],
      platformKomisyonToplam: komSum,
      komisyonSatirlari: komisyonModalSatir,
      musteriSay: musteriCt,
      ortPuan: puanN > 0 ? puanTop / puanN : 0,
      tesisPuanSirasi: puanSirasi.length ? puanSirasi : [{ ad: "—", puan: 0, yorum: 0 }],
    });
  }

  useEffect(() => {
    let cancelled = false;
    async function checkAdmin() {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (cancelled) return;
      if (authErr || !authData?.user) {
        router.push('/giris');
        return;
      }
      const { data } = await supabase
        .from('kullanicilar')
        .select('rol')
        .eq('email', authData.user.email)
        .single();
      if (cancelled) return;
      if (data?.rol !== 'admin') {
        router.push('/');
        return;
      }
      await loadDashboardData();
      if (cancelled) return;
      setAuthLoading(false);
    }
    checkAdmin();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function h(e: KeyboardEvent) {
      if (e.key === "Escape") { setOnayModal(null); setReddetModal(null); setYorumSilId(null); setStatDetay(null); setDropdownId(null); }
    }
    function c() { setDropdownId(null); }
    window.addEventListener("keydown", h);
    window.addEventListener("click", c);
    return () => { window.removeEventListener("keydown", h); window.removeEventListener("click", c); };
  }, []);

  const filtrelenmisTesisler = tesisler.filter(t =>
    !tesisAra || t.ad.toLowerCase().includes(tesisAra.toLowerCase())
  );

  const statCards = useMemo(() => {
    const sub = "—";
    return [
      { val: String(aktifTesisSayisi), label: "Aktif Tesis", sub, color: ORANGE },
      { val: fmtK(buAyCiro), label: "Bu Ay Ciro", sub, color: TEAL },
      { val: fmtK(platformKomisyon), label: "Platform Komisyonu", sub, color: GREEN },
      { val: musteriSayisi.toLocaleString("tr-TR"), label: "Aktif Müşteri", sub, color: BLUE },
      { val: ortTesisPuani > 0 ? ortTesisPuani.toFixed(1) : "—", label: "Ort. Tesis Puanı", sub, color: PURPLE },
    ];
  }, [aktifTesisSayisi, buAyCiro, platformKomisyon, musteriSayisi, ortTesisPuani]);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: GRAY600 }}>
        Yükleniyor...
      </div>
    );
  }

  async function onaylaTesis(t: Tesis) {
    if (!t.basvuru) return;
    const res = await fetch("/api/admin/onayla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ basvuru: t.basvuru }),
    });
    if (!res.ok) {
      showToast("Onay başarısız", RED);
      return;
    }
    setOnayModal(null);
    showToast("✅ " + t.ad + " onaylandı!", GREEN);
    await loadDashboardData();
  }
  async function reddetTesis(t: Tesis) {
    if (!t.basvuru) return;
    const { error } = await supabase.from("basvurular").update({ durum: "reddedildi" }).eq("id", t.basvuru.id);
    if (error) {
      showToast("Reddetme başarısız", RED);
      return;
    }
    setReddetModal(null); setRedSebebi("");
    showToast("✗ " + t.ad + " başvurusu reddedildi", RED);
    await loadDashboardData();
  }
  async function askiyaAl(id: string) {
    const res = await fetch("/api/admin/tesis-durum", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, aktif: false }),
    });
    if (!res.ok) {
      showToast("Askıya alınamadı", RED);
      return;
    }
    setTesisler(p => p.map(x => x.id === id ? { ...x, durum: "askida" as TesisDurum } : x));
    setDropdownId(null);
    showToast("⏸ Tesis askıya alındı");
    await loadDashboardData();
  }
  async function silTesis(id: string) {
    const { error } = await supabase.from("tesisler").delete().eq("id", id);
    if (error) {
      showToast("Silinemedi", RED);
      return;
    }
    setTesisler(p => p.filter(x => x.id !== id));
    setDropdownId(null);
    showToast("🗑️ Tesis silindi", RED);
    await loadDashboardData();
  }
  async function yorumSil(yid: string) {
    const { error } = await supabase.from("yorumlar").delete().eq("id", yid);
    if (error) {
      showToast("Silinemedi", RED);
      return;
    }
    setYorumTalepleri(p => p.filter(y => y.id !== yid));
    setYorumSilId(null);
    showToast("🗑️ Yorum silindi", RED);
  }
  async function yorumTalepReddet(yid: string) {
    const { error } = await supabase.from("yorumlar").update({ sikayet_var: false }).eq("id", yid);
    if (error) {
      showToast("Güncellenemedi", RED);
      return;
    }
    setYorumTalepleri(p => p.filter(y => y.id !== yid));
    showToast("✗ Silme talebi reddedildi");
  }
  function paneleGir(t: Tesis) {
    showToast("🔑 " + t.ad + " paneline giriliyor…", TEAL);
    setTimeout(() => router.push("/isletme"), 800);
  }
  function inceleOnaylar() {
    setBannerGoster(false);
    setHighlightOnay(true);
    tesislerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => setHighlightOnay(false), 3000);
  }

  const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" };

  const bekleyenAdlar = basvuruBekleyen.slice(0, 2).map((b) => b.isletme_adi).filter(Boolean);
  const bekleyenMetin = bekleyenAdlar.length === 0
    ? "Bekleyen başvuru yok"
    : bekleyenAdlar.length === 1
      ? `${bekleyenAdlar[0]} başvuru yaptı`
      : `${bekleyenAdlar[0]} ve ${bekleyenAdlar[1]} başvuru yaptı`;

  return (
    <>
      {/* STAT KARTLARI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {statCards.map((s, i) => (
          <div
            key={i}
            onClick={() => setStatDetay(i)}
            style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: 16, position: "relative", overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
            <div style={{ fontSize: 26, fontWeight: 900, color: NAVY, marginBottom: 3 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: GRAY400, fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 10, fontWeight: 700, marginTop: 5, color: GREEN }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ONAY BANNER */}
      {bannerGoster && (
        <div style={{ background: "linear-gradient(135deg,#FEF3C7,#FFFBEB)", border: "1.5px solid #FDE68A", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 24 }}>⏳</span>
          <div style={{ flex: 1 }}>
            <strong style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#92400E" }}>{basvuruBekleyen.length} Tesis Onay Bekliyor</strong>
            <span style={{ fontSize: 11, color: "#B45309" }}>{bekleyenMetin}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setBannerGoster(false)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Sonra Bak</button>
            <button onClick={inceleOnaylar} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>İncele →</button>
          </div>
        </div>
      )}

      {/* TÜM TESİSLER */}
      <div ref={tesislerRef} style={{ background: "white", borderRadius: 14, border: `2px solid ${highlightOnay ? ORANGE : GRAY200}`, overflow: "hidden", marginBottom: 16, transition: "border-color 0.4s" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>🏖️ Tüm Tesisler</h3>
          <input
            type="text" placeholder="🔍 Tesis ara..." value={tesisAra}
            onChange={(e) => setTesisAra(e.target.value)}
            style={{ padding: "6px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 12, width: 150 }}
          />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: GRAY50 }}>
                {["Tesis","Durum","Şezlong","Bu Ay Ciro","Komisyon","Puan","Son Aktivite","Eylemler"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrelenmisTesisler.map((t) => (
                <tr key={t.id} style={{ background: t.durum === "onay" ? (highlightOnay ? "#FFF7ED" : "#FFFBEB") : t.durum === "askida" ? "#FFF1F2" : undefined, transition: "background 0.3s" }}>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: t.emojiBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{t.emoji}</div>
                      <div><div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{t.ad}</div><div style={{ fontSize: 11, color: GRAY400 }}>{t.lokasyon}</div></div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}` }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: t.durum === "aktif" ? "#DCFCE7" : t.durum === "askida" ? "#FEE2E2" : "#FEF3C7", color: t.durum === "aktif" ? "#16A34A" : t.durum === "askida" ? RED : "#D97706" }}>
                      ● {t.durum === "aktif" ? "Aktif" : t.durum === "askida" ? "Askıda" : "Onay Bekliyor"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}` }}>{t.sezlong} şzl</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}`, fontWeight: 700 }}>{t.durum === "aktif" ? t.ciro : "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}`, fontWeight: 700, color: t.durum === "aktif" ? GREEN : GRAY400 }}>{t.durum === "aktif" ? t.komisyon : "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}` }}>
                    {t.durum === "aktif" ? (
                      <>
                        <div style={{ width: 50, height: 4, background: GRAY200, borderRadius: 20, overflow: "hidden", display: "inline-block", verticalAlign: "middle", marginRight: 4 }}>
                          <div style={{ height: "100%", width: (t.puanYuzde ?? 0) + "%", borderRadius: 20, background: GREEN }} />
                        </div>
                        {t.puan}
                      </>
                    ) : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}`, color: GRAY400 }}>{t.sonAktivite}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, borderTop: `1px solid ${GRAY100}` }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "nowrap", alignItems: "center" }}>
                      {t.durum === "onay" && (
                        <>
                          <button onClick={() => setOnayModal(t)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: TEAL, color: "white", cursor: "pointer", whiteSpace: "nowrap" }}>✓ Onayla</button>
                          <button onClick={() => { setReddetModal(t); setRedSebebi(""); }} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid #FECACA`, background: "#FEF2F2", color: RED, cursor: "pointer", whiteSpace: "nowrap" }}>✗ Reddet</button>
                        </>
                      )}
                      <button
                        onClick={() => paneleGir(t)}
                        style={{ padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 700, background: "#F0FDF4", color: GREEN, border: `1px solid #BBF7D0`, cursor: "pointer", whiteSpace: "nowrap" }}
                      >🔑 {t.durum === "onay" ? "Kurulum" : "Panele Gir"}</button>
                      {/* ... dropdown */}
                      <div style={{ position: "relative" }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDropdownId(dropdownId === t.id ? null : t.id); }}
                          style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}
                        >···</button>
                        {dropdownId === t.id && (
                          <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", right: 0, top: 32, background: "white", borderRadius: 10, border: `1px solid ${GRAY200}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 50, minWidth: 150, overflow: "hidden" }}>
                            <button onClick={() => { setDropdownId(null); showToast("📋 Tesis detayı — Yakında aktif"); }} style={{ width: "100%", padding: "9px 14px", background: "none", border: "none", textAlign: "left", fontSize: 12, color: GRAY800, cursor: "pointer", fontWeight: 500 }}>📋 Detay Gör</button>
                            {t.durum !== "onay" && (
                              <button onClick={() => askiyaAl(t.id)} style={{ width: "100%", padding: "9px 14px", background: "none", border: "none", textAlign: "left", fontSize: 12, color: YELLOW, cursor: "pointer", fontWeight: 600 }}>⏸ Askıya Al</button>
                            )}
                            <div style={{ height: 1, background: GRAY100 }} />
                            {t.durum !== "onay" && (
                              <button onClick={() => silTesis(t.id)} style={{ width: "100%", padding: "9px 14px", background: "none", border: "none", textAlign: "left", fontSize: 12, color: RED, cursor: "pointer", fontWeight: 600 }}>🗑️ Sil</button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2 KOLON */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Komisyon Özeti */}
        <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}` }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>💰 Komisyon Özeti — {donemLabel}</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: GRAY50 }}>
                {["Tesis","Ciro","Oran","Komisyon"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {komisyonSatirlari.map((k, i) => (
                <tr key={i}>
                  <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 600 }}>{k.tesis}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12 }}>{k.ciro}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12 }}><span style={{ background: "#F0FDF4", color: GREEN, padding: "2px 7px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{k.oran}</span></td>
                  <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800, color: GREEN }}>{k.komisyon}</td>
                </tr>
              ))}
              <tr style={{ background: GRAY50, borderTop: `2px solid ${GRAY200}` }}>
                <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800 }}>TOPLAM</td>
                <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 800 }}>{fmtK(komisyonToplamCiro)}</td>
                <td style={{ padding: "12px 16px", fontSize: 12 }}>—</td>
                <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 900, color: ORANGE }}>{fmtK(komisyonToplamKom)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Yorum Silme Talepleri */}
        <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>⭐ Yorum Silme Talepleri</h3>
            <span style={{ fontSize: 10, color: GRAY400 }}>Sadece siz silebilirsiniz</span>
          </div>
          {yorumTalepleri.length === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center", color: GRAY400 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
              <p style={{ fontSize: 12, fontWeight: 600 }}>Bekleyen talep yok</p>
            </div>
          )}
          {yorumTalepleri.map((y, i) => (
            <div key={y.id} style={{ padding: "14px 16px", borderBottom: i < yorumTalepleri.length - 1 ? `1px solid ${GRAY100}` : "none" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ background: y.puan < 5 ? RED : YELLOW, color: "white", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 8 }}>{y.puan}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 2 }}>{y.tesis} — {y.kisi}</div>
                  <div style={{ fontSize: 11, color: GRAY600, marginBottom: 5 }}>{y.metin}</div>
                  <div style={{ fontSize: 10, color: GRAY400 }}>{y.talep}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button onClick={() => setYorumSilId(y.id)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid #FECACA`, background: "#FEF2F2", color: RED, cursor: "pointer" }}>🗑️ Sil</button>
                  <button onClick={() => yorumTalepReddet(y.id)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Reddet</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TESİS ONAY MODAL ──────────────────────────────────────────────── */}
      {onayModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setOnayModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 400, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Tesis Onaylanacak</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 20 }}>
              <strong style={{ color: NAVY }}>{onayModal.ad}</strong> onaylanacak ve sisteme dahil edilecek. Emin misiniz?
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setOnayModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => onaylaTesis(onayModal)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>✓ Onayla</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TESİS REDDET MODAL ────────────────────────────────────────────── */}
      {reddetModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setReddetModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 440, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Başvuruyu Reddet</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 16 }}>
              <strong style={{ color: RED }}>{reddetModal.ad}</strong> başvurusu reddedilecek.
            </p>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Red Sebebi (isteğe bağlı)</label>
            <textarea
              value={redSebebi} onChange={(e) => setRedSebebi(e.target.value)}
              placeholder="Belge eksikliği, uygunsuz lokasyon vb..."
              rows={4}
              style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setReddetModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => reddetTesis(reddetModal)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", background: RED, color: "white", cursor: "pointer" }}>✗ Reddet</button>
            </div>
          </div>
        </div>
      )}

      {/* ── YORUM SİL ONAY MODAL ──────────────────────────────────────────── */}
      {yorumSilId !== null && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setYorumSilId(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 380, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Yorumu Sil</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 6 }}>Bu yorumu silmek istediğinize emin misiniz?</p>
            <div style={{ background: GRAY50, borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: GRAY600, textAlign: "left" }}>
              <strong>{yorumTalepleri.find(x => x.id === yorumSilId)?.tesis} — {yorumTalepleri.find(x => x.id === yorumSilId)?.kisi}</strong><br />
              <span style={{ color: GRAY400 }}>{yorumTalepleri.find(x => x.id === yorumSilId)?.metin}</span>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setYorumSilId(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => yorumSilId && yorumSil(yorumSilId)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", background: RED, color: "white", cursor: "pointer" }}>🗑️ Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STAT DETAY MODAL ──────────────────────────────────────────────── */}
      {statDetay !== null && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setStatDetay(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: 440, maxWidth: "95vw", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <button onClick={() => setStatDetay(null)} style={{ width: 28, height: 28, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <StatModalContent idx={statDetay} onClose={() => setStatDetay(null)} data={statModalData} />
          </div>
        </div>
      )}
    </>
  );
}
