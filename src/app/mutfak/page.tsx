"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NAVY = "#0A1628";
const BG = "#F3F6FB";
const WHITE = "#FFFFFF";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const RED = "#EF4444";
const BLUE = "#3B82F6";
const ORANGE = "#F5821F";
const GREEN = "#10B981";

type SiparisDurum = "yeni" | "hazirlaniyor" | "hazir" | "yolda" | "verildi" | "iptal";
type TabKey = "yeni" | "hazirlaniyor" | "hazir" | "verildi";

type UrunSatir = {
  isim: string;
  adet: number;
  fiyat: number;
};

type SiparisKart = {
  id: string;
  durum: SiparisDurum;
  sezlong: string;
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
  const sezlong = grupAd && sezlongNo ? `${grupAd} - ${sezlongNo}` : (sezlongNo || String(s?.sezlong_no || "").trim());
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
    telefon,
    musteri: musteriAd || fallbackSiparis,
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
  const [tab, setTab] = useState<TabKey>("yeni");
  const [rows, setRows] = useState<SiparisKart[]>([]);
  const [sesAcik, setSesAcik] = useState(true);
  const [saat, setSaat] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const previousYeniCountRef = useRef(0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  function playYeniSiparisSesi() {
    if (!sesAcik || typeof window === "undefined") return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const audio = new AC();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "sine";
      osc.frequency.value = 900;
      gain.gain.value = 0.001;
      osc.connect(gain);
      gain.connect(audio.destination);
      const now = audio.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.24);
    } catch {
      // no-op
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
    return () => {
      cancelled = true;
    };
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
        .select("tesis_id")
        .eq("id", authData.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (kulErr || !kullanici?.tesis_id) {
        setTesisId(null);
        return;
      }
      setTesisId(String(kullanici.tesis_id));
    }
    loadTesisId();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!tesisId) {
      setRows([]);
      setTesisAd("Tesis");
      previousYeniCountRef.current = 0;
      return;
    }

    async function fetchSiparisler() {
      const now = new Date();
      const startTodayIso = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
      const { data: joinedData, error: joinedError } = await supabase
        .from("siparisler")
        .select("id, created_at, durum, notlar, sezlong_no, musteri_adi, toplam, rezervasyon_id, siparis_kalemleri(adet, ad, fiyat), rezervasyonlar(musteri_adi, telefon, rezervasyon_kodu, sezlong_id, kullanici_id, sezlonglar(no, sezlong_gruplari(ad)), kullanicilar(ad, soyad, telefon))")
        .eq("tesis_id", tesisId)
        .in("durum", ["yeni", "hazirlaniyor", "hazir", "yolda", "verildi"])
        .gte("created_at", startTodayIso)
        .order("created_at", { ascending: true });

      let data: any[] = joinedData ?? [];
      if (joinedError) {
        console.error("mutfak joined fetch error, fallback used:", joinedError);
        const { data: siparisData, error: siparisErr } = await supabase
          .from("siparisler")
          .select("id, created_at, durum, notlar, sezlong_no, musteri_adi, toplam, rezervasyon_id, siparis_kalemleri(adet, ad, fiyat)")
          .eq("tesis_id", tesisId)
          .in("durum", ["yeni", "hazirlaniyor", "hazir", "yolda", "verildi"])
          .gte("created_at", startTodayIso)
          .order("created_at", { ascending: true });
        if (siparisErr) {
          console.error("mutfak fallback siparis fetch error:", siparisErr);
          return;
        }

        const rezIds = Array.from(new Set((siparisData ?? []).map((x: any) => x.rezervasyon_id).filter(Boolean)));
        const { data: rezData } = rezIds.length
          ? await supabase
              .from("rezervasyonlar")
              .select("id, musteri_adi, telefon, rezervasyon_kodu, sezlong_id, kullanici_id")
              .in("id", rezIds)
          : { data: [] as any[] };

        const userIds = Array.from(new Set((rezData ?? []).map((x: any) => x.kullanici_id).filter(Boolean)));
        const { data: userData } = userIds.length
          ? await supabase
              .from("kullanicilar")
              .select("id, ad, soyad, telefon")
              .in("id", userIds)
          : { data: [] as any[] };

        const sezlongIds = Array.from(new Set((rezData ?? []).map((x: any) => x.sezlong_id).filter(Boolean)));
        const { data: sezlongData } = sezlongIds.length
          ? await supabase
              .from("sezlonglar")
              .select("id, no, sezlong_gruplari(ad)")
              .in("id", sezlongIds)
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
                  kullanicilar: usr
                    ? {
                        ad: usr.ad,
                        soyad: usr.soyad,
                        telefon: usr.telefon,
                      }
                    : null,
                  sezlonglar: sz ? { no: sz.no, sezlong_gruplari: { ad: sz?.sezlong_gruplari?.ad } } : null,
                }
              : null,
          };
        });
      }

      const mapped = (data ?? []).map(rowToKart);
      const yeniCount = mapped.filter((r) => r.durum === "yeni").length;
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
        if (error) {
          console.error("mutfak tesis ad fetch error:", error);
          setTesisAd("Tesis");
          return;
        }
        setTesisAd(data?.ad || "Tesis");
      });

    const channel = supabase
      .channel(`mutfak-siparisler-${tesisId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "siparisler", filter: `tesis_id=eq.${tesisId}` }, () => {
        fetchSiparisler();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tesisId, sesAcik]);

  async function durumGuncelle(id: string, yeniDurum: SiparisDurum, okMsg: string) {
    const { error } = await supabase.from("siparisler").update({ durum: yeniDurum }).eq("id", id);
    if (error) {
      console.error("mutfak durum guncelle error:", error);
      showToast("❌ Sipariş güncellenemedi");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, durum: yeniDurum } : r)));
    if (yeniDurum === "hazirlaniyor") setTab("hazirlaniyor");
    else if (yeniDurum === "hazir") setTab("hazir");
    else if (yeniDurum === "yolda" || yeniDurum === "verildi") setTab("verildi");
    showToast(okMsg);
  }

  const counts = useMemo(() => {
    return {
      yeni: rows.filter((r) => r.durum === "yeni").length,
      hazirlaniyor: rows.filter((r) => r.durum === "hazirlaniyor").length,
      hazir: rows.filter((r) => r.durum === "hazir").length,
      verildi: rows.filter((r) => r.durum === "yolda" || r.durum === "verildi").length,
    };
  }, [rows]);

  const activeRows = useMemo(() => {
    if (tab === "verildi") return rows.filter((r) => r.durum === "yolda" || r.durum === "verildi");
    return rows.filter((r) => r.durum === tab);
  }, [rows, tab]);

  if (authLoading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column" }}>
      <header style={{ background: NAVY, color: "white", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🍳</span>
          <strong style={{ fontSize: 15 }}>MUTFAK PANELİ</strong>
          <span style={{ fontSize: 12, color: "#A5B4FC" }}>{tesisAd}</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#67E8F9" }}>{saat}</span>
        </div>
        <button onClick={() => setSesAcik((v) => !v)} style={{ border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontWeight: 700, background: sesAcik ? "#22C55E" : "#334155", color: "white" }}>
          {sesAcik ? "🔊 Ses Açık" : "🔇 Ses Kapalı"}
        </button>
      </header>

      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {([
            { key: "yeni", label: "Yeni", count: counts.yeni, bg: "#FEE2E2", border: RED, color: "#991B1B" },
            { key: "hazirlaniyor", label: "Hazırlanıyor", count: counts.hazirlaniyor, bg: "#FFF7ED", border: ORANGE, color: "#9A3412" },
            { key: "hazir", label: "Hazır", count: counts.hazir, bg: "#DCFCE7", border: GREEN, color: "#14532D" },
            { key: "verildi", label: "Verildi", count: counts.verildi, bg: "#E2E8F0", border: GRAY400, color: "#334155" },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                border: `2px solid ${tab === t.key ? t.border : "transparent"}`,
                background: tab === t.key ? t.bg : WHITE,
                color: t.color,
                fontWeight: 800,
                padding: "10px 14px",
                borderRadius: 12,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {activeRows.length === 0 ? (
          <div style={{ background: WHITE, border: `1px solid ${GRAY200}`, borderRadius: 14, padding: "36px 20px", textAlign: "center", color: GRAY600, fontWeight: 600 }}>
            Bu sekmede sipariş yok.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, justifyItems: "start", alignItems: "start" }}>
            {activeRows.map((k) => {
              const acil = k.sureDakika >= 10 && (k.durum === "yeni" || k.durum === "hazirlaniyor");
              const theme =
                k.durum === "yeni"
                  ? { border: RED, bg: "#FFF1F2", head: "#EFF6FF" }
                  : k.durum === "hazirlaniyor"
                    ? { border: ORANGE, bg: "#FFF7ED", head: "#FFEDD5" }
                    : k.durum === "hazir"
                      ? { border: GREEN, bg: "#F0FDF4", head: "#DCFCE7" }
                      : { border: GRAY400, bg: "#F8FAFC", head: "#E2E8F0" };

              return (
                <div key={k.id} style={{ width: "100%", maxWidth: 440, border: `2px solid ${acil ? RED : theme.border}`, borderRadius: 14, background: theme.bg, overflow: "hidden", opacity: tab === "verildi" ? 0.78 : 1 }}>
                  <div style={{ background: theme.head, padding: "16px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 900, color: NAVY }}>{k.baslik}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: GRAY600, marginTop: 2 }}>{k.musteri}</div>
                      {k.telefon ? <div style={{ fontSize: 12, color: GRAY400, marginTop: 2 }}>{k.telefon}</div> : null}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: GRAY400 }}>{k.saat}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: GRAY600 }}>{k.sureDakika} dk önce</div>
                      {acil && (
                        <div style={{ display: "inline-flex", marginTop: 6, background: RED, color: "white", fontSize: 10, fontWeight: 900, padding: "3px 9px", borderRadius: 999 }}>
                          ACİL
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: "22px", borderTop: `1px solid ${GRAY200}` }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {k.urunler.length === 0 ? (
                        <div style={{ fontSize: 14, color: GRAY600 }}>Ürün detayı bulunamadı</div>
                      ) : (
                        k.urunler.map((u, i) => (
                          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 12, fontSize: 14, paddingBottom: 10, borderBottom: i < k.urunler.length - 1 ? `1px solid ${GRAY200}` : "none" }}>
                            <span style={{ color: NAVY, fontWeight: 700, fontSize: 15 }}>{u.isim}</span>
                            <span style={{ color: GRAY600, fontWeight: 700, fontSize: 14 }}>x {u.adet}</span>
                            <span style={{ color: GRAY600, fontWeight: 800, fontSize: 14 }}>{formatTl(u.fiyat)}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {k.not && (
                      <div style={{ marginTop: 14, padding: "10px 12px", background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: 10, fontSize: 13, color: "#92400E", fontWeight: 600 }}>
                        📝 {k.not}
                      </div>
                    )}

                    <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${GRAY200}`, paddingTop: 14 }}>
                      <span style={{ fontSize: 15, color: GRAY600, fontWeight: 800 }}>Toplam</span>
                      <span style={{ fontSize: 20, color: GREEN, fontWeight: 900 }}>{formatTl(k.toplam)}</span>
                    </div>

                    {k.durum === "yeni" && (
                      <button
                        onClick={() => durumGuncelle(k.id, "hazirlaniyor", "🍳 Sipariş hazırlanmaya alındı")}
                        style={{ marginTop: 16, width: "100%", border: "none", borderRadius: 10, padding: "14px 16px", cursor: "pointer", background: "#2563EB", color: "white", fontWeight: 900, fontSize: 15 }}
                      >
                        🔥 Hazırlamaya Başla
                      </button>
                    )}
                    {k.durum === "hazirlaniyor" && (
                      <button
                        onClick={() => durumGuncelle(k.id, "hazir", "✅ Sipariş hazır olarak işaretlendi")}
                        style={{ marginTop: 16, width: "100%", border: "none", borderRadius: 10, padding: "14px 16px", cursor: "pointer", background: GREEN, color: "white", fontWeight: 900, fontSize: 15 }}
                      >
                        ✅ Hazır
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <div style={{ position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)", background: NAVY, color: "white", padding: "10px 16px", borderRadius: 999, fontSize: 13, fontWeight: 800, zIndex: 300 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

