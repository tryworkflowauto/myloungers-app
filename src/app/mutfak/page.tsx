"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LogoutModal from "@/components/LogoutModal";
import { SIPARIS_DURUM } from "@/lib/constants";

// ── THEME ────────────────────────────────────────────────────────────────────
const T = {
  BG: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
  CARD_BG: "rgba(255,255,255,0.04)",
  CARD_BORDER: "rgba(255,255,255,0.08)",
  AVATAR_BG: "linear-gradient(135deg, #0ABAB5, #0891B2)",
  ACCENT: "#0ABAB5",
  BTN_GRADIENT: "linear-gradient(135deg, #0ABAB5, #0891B2)",
  GREEN: "#6EE7B7",
  GREEN_BG: "rgba(16,185,129,0.2)",
  BLUE: "#93C5FD",
  BLUE_BG: "rgba(59,130,246,0.2)",
  AMBER: "#FDBA74",
  AMBER_BG: "rgba(251,146,60,0.2)",
  TEAL: "#5EEAD4",
  TEAL_BG: "rgba(10,186,181,0.2)",
  RED: "#FCA5A5",
  TEXT: "white",
  TEXT_SUB: "rgba(255,255,255,0.75)",
  TEXT_MUTED: "rgba(255,255,255,0.5)",
  TEXT_FAINT: "rgba(255,255,255,0.35)",
};

type SiparisDurum = "yeni" | "hazirlaniyor" | "hazir" | "yolda" | "teslim_edildi" | "iptal";
type TabKey = "yeni" | "hazirlaniyor" | "hazir" | "teslim_edildi";

type UrunSatir = {
  isim: string;
  adet: number;
  fiyat: number;
};

type SiparisKart = {
  id: string;
  durum: SiparisDurum;
  sezlong: string;
  sezlongGrup: string;
  telefon?: string;
  musteri: string;
  baslik: string;
  createdAt: string;
  saat: string;
  sureDakika: number;
  urunler: UrunSatir[];
  not?: string;
  toplam: number;
};

function formatTl(v: number): string {
  return `₺${Number(v || 0).toLocaleString("tr-TR")}`;
}

function rowToKart(s: any): SiparisKart {
  const created = s?.created_at ? new Date(s.created_at) : new Date();
  const sureDakika = Math.max(1, Math.round((Date.now() - created.getTime()) / 60000));
  const rezervasyon = s?.rezervasyonlar ?? {};
  const userAd = String(rezervasyon?.kullanicilar?.ad || "").trim();
  const userSoyad = String(rezervasyon?.kullanicilar?.soyad || "").trim();
  const userMusteri = `${userAd} ${userSoyad}`.trim();
  const rezMusteri = String(rezervasyon?.musteri_adi || "").trim();
  const siparisMusteri = String(s?.musteri_adi || "").trim();
  const musteriAd = rezMusteri || userMusteri || siparisMusteri;
  const grupAd = String(rezervasyon?.sezlonglar?.sezlong_gruplari?.ad || "").trim();
  const sezlongNoRaw = rezervasyon?.sezlonglar?.no ?? s?.sezlong_no;
  const sezlongNo = sezlongNoRaw != null && sezlongNoRaw !== "" ? String(sezlongNoRaw).trim() : "";
  const sezlong = sezlongNo ? (grupAd ? `${grupAd}-${sezlongNo}` : sezlongNo) : "";
  const telefon = String(rezervasyon?.telefon || rezervasyon?.kullanicilar?.telefon || "").trim() || undefined;
  const idStr = String(s?.id ?? "");
  const fallbackSiparis = `Sipariş #${idStr.slice(-3) || "000"}`;
  const baslik = sezlong || fallbackSiparis;
  const urunler: UrunSatir[] = (s?.siparis_kalemleri ?? []).map((k: any) => ({
    isim: (k?.ad || "").trim() || "Ürün",
    adet: Number(k?.adet ?? 1),
    fiyat: Number(k?.fiyat ?? 0),
  }));

  return {
    id: String(s?.id ?? ""),
    durum: (s?.durum as SiparisDurum) ?? "yeni",
    sezlong,
    sezlongGrup: grupAd,
    telefon,
    musteri: musteriAd || "Misafir",
    baslik,
    createdAt: s?.created_at || new Date().toISOString(),
    saat: created.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    sureDakika,
    urunler,
    not: s?.notlar || undefined,
    toplam: Number(s?.toplam ?? 0),
  };
}

export default function MutfakPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [tesisId, setTesisId] = useState<string | null>(null);
  const [tesisAd, setTesisAd] = useState("Tesis");
  const [mutfakAdi, setMutfakAdi] = useState("");
  const [tab, setTab] = useState<TabKey>("yeni");
  const [rows, setRows] = useState<SiparisKart[]>([]);
  const [sesAcik, setSesAcik] = useState(true);
  const [saat, setSaat] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [yeniSiparisTekrarAktif, setYeniSiparisTekrarAktif] = useState(false);
  const previousYeniCountRef = useRef(0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  function playYeniSiparisSesi() {
    if (!sesAcik || typeof window === "undefined") return;
    try {
      const audio = new window.Audio("/sounds/cagri.mp3");
      audio.volume = 1.0;
      audio.play().catch((err) => {
        console.log("[mutfak ses] autoplay blocked:", err);
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const playTone = (freq: number, start: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "square";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, ctx.currentTime + start);
            gain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + start + 0.05);
            gain.gain.setValueAtTime(0.8, ctx.currentTime + start + duration - 0.05);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + duration);
          };
          playTone(1000, 0, 0.18);
          playTone(1000, 0.25, 0.18);
          playTone(1000, 0.5, 0.18);
        } catch (e) {
          console.log("[mutfak ses] fallback başarısız:", e);
        }
      });
    } catch (e) {
      console.log("[mutfak ses] play error:", e);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function checkAuthRole() {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (cancelled) return;
      if (authErr || !authData?.user) {
        router.push("/giris");
        return;
      }
      const { data } = await supabase.from("kullanicilar").select("rol").eq("email", authData.user.email).single();
      if (cancelled) return;
      const rol = String(data?.rol || "").toLowerCase();
      if (rol !== "mutfak" && rol !== "isletmeci" && rol !== "admin") {
        router.push("/");
        return;
      }
      setAuthLoading(false);
    }
    checkAuthRole();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    function tick() {
      const now = new Date();
      setSaat(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadTesisId() {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (cancelled) return;
      if (authErr || !authData?.user) {
        setTesisId(null);
        return;
      }
      const { data: kullanici, error: kulErr } = await supabase
        .from("kullanicilar")
        .select("tesis_id, ad, soyad")
        .eq("id", authData.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (kulErr || !kullanici?.tesis_id) {
        setTesisId(null);
        return;
      }
      setTesisId(String(kullanici.tesis_id));
      const ad = String(kullanici.ad || "").trim();
      const soyad = String(kullanici.soyad || "").trim();
      setMutfakAdi(`${ad} ${soyad}`.trim());
    }
    loadTesisId();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!tesisId) {
      setRows([]);
      setTesisAd("Tesis");
      previousYeniCountRef.current = 0;
      return;
    }

    async function fetchSiparisler() {
      // Aktif siparişler (yeni/hazirlaniyor/hazir/yolda) tarih bağımsız + bugünkü teslim_edildi
      const bugunBaslangic = new Date();
      bugunBaslangic.setHours(0, 0, 0, 0);
      const bugunBaslangicIso = bugunBaslangic.toISOString();
      const orFilter = `durum.neq.${SIPARIS_DURUM.TESLIM_EDILDI},and(durum.eq.${SIPARIS_DURUM.TESLIM_EDILDI},created_at.gte.${bugunBaslangicIso})`;

      const { data: joinedData, error: joinedError } = await supabase
        .from("siparisler")
        .select("id, created_at, durum, notlar, sezlong_no, musteri_adi, toplam, rezervasyon_id, siparis_kalemleri(adet, ad, fiyat), rezervasyonlar(musteri_adi, telefon, rezervasyon_kodu, sezlong_id, kullanici_id, sezlonglar(no, sezlong_gruplari(ad)), kullanicilar(ad, soyad, telefon))")
        .eq("tesis_id", tesisId)
        .or(orFilter)
        .order("created_at", { ascending: true });

      let data: any[] = joinedData ?? [];
      if (joinedError) {
        console.error("mutfak joined fetch error, fallback used:", joinedError);
        const { data: siparisData, error: siparisErr } = await supabase
          .from("siparisler")
          .select("id, created_at, durum, notlar, sezlong_no, musteri_adi, toplam, rezervasyon_id, siparis_kalemleri(adet, ad, fiyat)")
          .eq("tesis_id", tesisId)
          .or(orFilter)
          .order("created_at", { ascending: true });
        if (siparisErr) {
          console.error("mutfak fallback siparis fetch error:", siparisErr);
          return;
        }

        const rezIds = Array.from(new Set((siparisData ?? []).map((x: any) => x.rezervasyon_id).filter(Boolean)));
        const { data: rezData } = rezIds.length
          ? await supabase.from("rezervasyonlar").select("id, musteri_adi, telefon, rezervasyon_kodu, sezlong_id, kullanici_id").in("id", rezIds)
          : { data: [] as any[] };

        const userIds = Array.from(new Set((rezData ?? []).map((x: any) => x.kullanici_id).filter(Boolean)));
        const { data: userData } = userIds.length
          ? await supabase.from("kullanicilar").select("id, ad, soyad, telefon").in("id", userIds)
          : { data: [] as any[] };

        const sezlongIds = Array.from(new Set((rezData ?? []).map((x: any) => x.sezlong_id).filter(Boolean)));
        const { data: sezlongData } = sezlongIds.length
          ? await supabase.from("sezlonglar").select("id, no, sezlong_gruplari(ad)").in("id", sezlongIds)
          : { data: [] as any[] };

        const rezMap = new Map<string, any>((rezData ?? []).map((r: any) => [String(r.id), r]));
        const sezMap = new Map<string, any>((sezlongData ?? []).map((s: any) => [String(s.id), s]));
        const userMap = new Map<string, any>((userData ?? []).map((u: any) => [String(u.id), u]));
        data = (siparisData ?? []).map((s: any) => {
          const rez = s?.rezervasyon_id ? rezMap.get(String(s.rezervasyon_id)) : null;
          const sz = rez?.sezlong_id ? sezMap.get(String(rez.sezlong_id)) : null;
          const usr = rez?.kullanici_id ? userMap.get(String(rez.kullanici_id)) : null;
          return {
            ...s,
            rezervasyonlar: rez
              ? {
                  musteri_adi: rez.musteri_adi,
                  telefon: rez.telefon,
                  rezervasyon_kodu: rez.rezervasyon_kodu,
                  kullanici_id: rez.kullanici_id,
                  kullanicilar: usr ? { ad: usr.ad, soyad: usr.soyad, telefon: usr.telefon } : null,
                  sezlonglar: sz ? { no: sz.no, sezlong_gruplari: { ad: sz?.sezlong_gruplari?.ad } } : null,
                }
              : null,
          };
        });
      }

      const mapped = (data ?? []).map(rowToKart);
      const yeniCount = mapped.filter((r) => r.durum === SIPARIS_DURUM.YENI).length;
      if (yeniCount > previousYeniCountRef.current) {
        playYeniSiparisSesi();
        showToast("🔔 Yeni sipariş geldi");
      }
      previousYeniCountRef.current = yeniCount;
      setRows(mapped);
    }

    fetchSiparisler();

    supabase
      .from("tesisler")
      .select("ad")
      .eq("id", tesisId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) { console.error("mutfak tesis ad fetch error:", error); setTesisAd("Tesis"); return; }
        setTesisAd(data?.ad || "Tesis");
      });

    const channel = supabase
      .channel(`mutfak-siparisler-${tesisId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "siparisler", filter: `tesis_id=eq.${tesisId}` }, () => {
        fetchSiparisler();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tesisId, sesAcik]);

  useEffect(() => {
    const yeniSiparisVar = rows.some((s: any) => s.durum === SIPARIS_DURUM.YENI);
    if (!yeniSiparisVar || !sesAcik) {
      setYeniSiparisTekrarAktif(false);
      return;
    }
    setYeniSiparisTekrarAktif(true);
    const interval = setInterval(() => {
      playYeniSiparisSesi();
    }, 10000);
    return () => clearInterval(interval);
  }, [rows, sesAcik]);

  async function durumGuncelle(id: string, yeniDurum: SiparisDurum, okMsg: string) {
    const { error } = await supabase.from("siparisler").update({ durum: yeniDurum }).eq("id", id);
    if (error) {
      console.error("mutfak durum guncelle error:", error);
      showToast("❌ Sipariş güncellenemedi");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, durum: yeniDurum } : r)));
    if (yeniDurum === SIPARIS_DURUM.HAZIRLANIYOR) setTab(SIPARIS_DURUM.HAZIRLANIYOR);
    else if (yeniDurum === SIPARIS_DURUM.HAZIR) setTab(SIPARIS_DURUM.HAZIR);
    else if (yeniDurum === SIPARIS_DURUM.YOLDA || yeniDurum === SIPARIS_DURUM.TESLIM_EDILDI) setTab(SIPARIS_DURUM.TESLIM_EDILDI);
    showToast(okMsg);
  }

  const counts = useMemo(() => ({
    yeni: rows.filter((r) => r.durum === SIPARIS_DURUM.YENI).length,
    hazirlaniyor: rows.filter((r) => r.durum === SIPARIS_DURUM.HAZIRLANIYOR).length,
    hazir: rows.filter((r) => r.durum === SIPARIS_DURUM.HAZIR).length,
    teslim_edildi: rows.filter((r) => r.durum === SIPARIS_DURUM.YOLDA || r.durum === SIPARIS_DURUM.TESLIM_EDILDI).length,
  }), [rows]);

  const activeRows = useMemo(() => {
    if (tab === SIPARIS_DURUM.TESLIM_EDILDI) {
      // Teslim sekmesi: en yeni üstte
      return [...rows.filter((r) => r.durum === SIPARIS_DURUM.YOLDA || r.durum === SIPARIS_DURUM.TESLIM_EDILDI)].reverse();
    }
    // Diğerleri: en eski önce (FIFO)
    return rows.filter((r) => r.durum === tab);
  }, [rows, tab]);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: T.BG, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14 }}>
        Yükleniyor...
      </div>
    );
  }

  const mutfakInits = mutfakAdi.split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("") || "M";

  return (
    <div style={{ background: T.BG, minHeight: "100vh" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: 20 }}>

        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: T.AVATAR_BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white", flexShrink: 0 }}>
              {mutfakInits}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: T.TEXT }}>{mutfakAdi || "Mutfak Paneli"}</div>
              <div style={{ fontSize: 11, color: T.TEXT_MUTED, marginTop: 2 }}>Mutfak · {tesisAd}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Ses toggle */}
            <button
              onClick={() => setSesAcik((v) => !v)}
              title={sesAcik ? "Sesi kapat" : "Sesi aç"}
              style={{ background: "rgba(255,255,255,0.06)", border: `0.5px solid ${T.CARD_BORDER}`, borderRadius: 10, padding: "8px 10px", cursor: "pointer", color: sesAcik ? T.ACCENT : T.TEXT_MUTED, fontSize: 14, lineHeight: 1 }}
            >
              {sesAcik ? "🔊" : "🔇"}
            </button>
            {/* Saat */}
            <div style={{ background: "rgba(255,255,255,0.05)", border: `0.5px solid ${T.CARD_BORDER}`, borderRadius: 12, padding: "8px 14px", fontSize: 13, color: T.TEXT, fontWeight: 500 }}>
              {saat}
            </div>
            {/* Çıkış */}
            <button
              onClick={() => setShowLogoutModal(true)}
              title="Çıkış yap"
              style={{ background: "rgba(255,255,255,0.05)", border: `0.5px solid ${T.CARD_BORDER}`, borderRadius: 12, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: T.TEXT_MUTED, fontSize: 12 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── ÖZET SEKMESİ ─────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 6, background: T.CARD_BG, padding: 4, borderRadius: 12, marginBottom: 16 }}>
          {([
            { key: "yeni" as TabKey,           label: "Yeni",        count: counts.yeni,          activeColor: T.AMBER, activeBg: T.AMBER_BG },
            { key: "hazirlaniyor" as TabKey,   label: "Hazırlanıyor", count: counts.hazirlaniyor, activeColor: T.TEAL,  activeBg: T.TEAL_BG  },
            { key: "hazir" as TabKey,          label: "Hazır",       count: counts.hazir,          activeColor: T.GREEN, activeBg: T.GREEN_BG },
            { key: "teslim_edildi" as TabKey,  label: "Teslim",      count: counts.teslim_edildi, activeColor: "rgba(255,255,255,0.6)", activeBg: "rgba(255,255,255,0.08)" },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ flex: 1, padding: 9, textAlign: "center", border: "none", cursor: "pointer", background: tab === t.key ? t.activeBg : "transparent", borderRadius: 9 }}
            >
              <div style={{ fontSize: 11, color: tab === t.key ? t.activeColor : T.TEXT_MUTED, marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: T.TEXT }}>{t.count}</div>
            </button>
          ))}
        </div>

        {/* ── SİPARİŞ LİSTESİ ──────────────────────────────────────────────── */}
        {activeRows.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 20px", color: T.TEXT_MUTED, fontSize: 14 }}>
            Bu sekmede sipariş yok
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {activeRows.map((k) => {
              const acil = k.durum === SIPARIS_DURUM.YENI && k.sureDakika >= 5;
              const isTeslim = k.durum === SIPARIS_DURUM.YOLDA || k.durum === SIPARIS_DURUM.TESLIM_EDILDI;

              type CardTheme = {
                badgeBg: string; badgeColor: string; badgeText: string;
                sureColor: string; border: string; bg: string;
                btnBg: string | null; btnText: string | null;
                btnClick: (() => void) | null;
              };

              const ct: CardTheme = k.durum === SIPARIS_DURUM.YENI ? {
                badgeBg: T.AMBER_BG, badgeColor: T.AMBER, badgeText: "YENİ",
                sureColor: T.AMBER,
                border: acil ? "rgba(239,68,68,0.4)" : T.CARD_BORDER,
                bg: T.CARD_BG,
                btnBg: T.BTN_GRADIENT, btnText: "Hazırlamaya al →",
                btnClick: () => durumGuncelle(k.id, SIPARIS_DURUM.HAZIRLANIYOR, "🍳 Sipariş hazırlanmaya alındı"),
              } : k.durum === SIPARIS_DURUM.HAZIRLANIYOR ? {
                badgeBg: T.TEAL_BG, badgeColor: T.TEAL, badgeText: "HAZIRLANIYOR",
                sureColor: T.TEAL,
                border: T.CARD_BORDER,
                bg: T.CARD_BG,
                btnBg: "#10B981", btnText: "Hazır ✓",
                btnClick: () => durumGuncelle(k.id, SIPARIS_DURUM.HAZIR, "✅ Sipariş hazır olarak işaretlendi"),
              } : k.durum === SIPARIS_DURUM.HAZIR ? {
                badgeBg: T.GREEN_BG, badgeColor: T.GREEN, badgeText: "HAZIR",
                sureColor: T.GREEN,
                border: T.CARD_BORDER,
                bg: T.CARD_BG,
                btnBg: null, btnText: null, btnClick: null,
              } : {
                badgeBg: "rgba(255,255,255,0.1)", badgeColor: T.TEXT_MUTED, badgeText: "TESLİM",
                sureColor: T.TEXT_FAINT,
                border: "rgba(255,255,255,0.06)",
                bg: "rgba(255,255,255,0.02)",
                btnBg: null, btnText: null, btnClick: null,
              };

              const urunOzet = k.urunler.map((u) => `${u.isim} ×${u.adet}`).join(" · ");
              const musteriGrey = k.musteri === "Misafir";

              return (
                <div
                  key={k.id}
                  style={{ background: ct.bg, border: `0.5px solid ${ct.border}`, borderRadius: 14, padding: "14px 16px", opacity: isTeslim ? 0.6 : 1 }}
                >
                  {/* Üst satır: badge + sezlong + süre */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ background: ct.badgeBg, color: ct.badgeColor, padding: "3px 9px", borderRadius: 7, fontSize: 10, fontWeight: 500, letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                        {ct.badgeText}
                      </span>
                      {acil && (
                        <span style={{ background: "rgba(239,68,68,0.2)", color: T.RED, padding: "3px 9px", borderRadius: 7, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>
                          ACİL
                        </span>
                      )}
                      <span style={{ fontSize: 15, fontWeight: 500, color: T.TEXT }}>{k.sezlong || k.baslik}</span>
                      {k.sezlongGrup && <span style={{ fontSize: 11, color: T.TEXT_FAINT }}>{k.sezlongGrup}</span>}
                    </div>
                    <span style={{ fontSize: 11, color: ct.sureColor, fontWeight: 500, whiteSpace: "nowrap" }}>{k.sureDakika} dk</span>
                  </div>

                  {/* Müşteri adı + telefon (Hazır ve Teslim'de gösterme) */}
                  {!isTeslim && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                        <span style={{ fontSize: 13, fontWeight: 500, color: musteriGrey ? T.TEXT_MUTED : "rgba(255,255,255,0.9)", fontStyle: musteriGrey ? "italic" : "normal" }}>
                          {k.musteri}
                        </span>
                      </div>
                      {k.telefon && (
                        <div style={{ fontSize: 11, color: T.TEXT_FAINT, marginTop: 2, paddingLeft: 19 }}>
                          {k.telefon}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ürün listesi (tam detay — mutfak için önemli) */}
                  <div style={{ marginBottom: ct.btnText || k.durum === SIPARIS_DURUM.HAZIR ? 12 : 0 }}>
                    {k.urunler.length === 0 ? (
                      <div style={{ fontSize: 13, color: T.TEXT_MUTED }}>Ürün bilgisi yok</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {k.urunler.map((u, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                            <span style={{ fontSize: 13, color: T.TEXT_SUB, flex: 1 }}>{u.isim}</span>
                            <span style={{ fontSize: 13, color: T.TEXT_MUTED, fontWeight: 600 }}>×{u.adet}</span>
                            <span style={{ fontSize: 12, color: T.TEXT_FAINT }}>{formatTl(u.fiyat)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Not */}
                  {k.not && (
                    <div style={{ padding: "8px 10px", background: "rgba(245,158,11,0.12)", border: "0.5px solid rgba(245,158,11,0.3)", borderRadius: 8, fontSize: 12, color: "#FCD34D", marginBottom: ct.btnText || k.durum === SIPARIS_DURUM.HAZIR ? 12 : 0 }}>
                      📝 {k.not}
                    </div>
                  )}

                  {/* Aksiyon butonu veya bilgi satırı */}
                  {ct.btnText && ct.btnClick ? (
                    <button
                      onClick={ct.btnClick}
                      style={{ width: "100%", background: ct.btnBg!, color: "white", border: "none", padding: 10, borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                    >
                      {ct.btnText}
                    </button>
                  ) : k.durum === SIPARIS_DURUM.HAZIR ? (
                    <div style={{ textAlign: "center", fontSize: 12, color: T.TEXT_MUTED, fontStyle: "italic" }}>
                      🛵 Garson tarafından alınacak
                    </div>
                  ) : isTeslim ? (
                    <div style={{ textAlign: "center", fontSize: 12, color: T.TEXT_FAINT, fontStyle: "italic" }}>
                      {urunOzet || "Teslim edildi"}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)", background: "#0F172A", border: "0.5px solid rgba(255,255,255,0.1)", color: "white", padding: "10px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500, zIndex: 300, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} />}
    </div>
  );
}
