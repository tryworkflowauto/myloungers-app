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
const GREEN = "#10B981";
const PURPLE = "#7C3AED";
const SLATE = "#64748B";

type SiparisDurum = "yeni" | "hazirlaniyor" | "hazir" | "yolda" | "verildi" | "iptal";
type TabKey = "hazir" | "yolda" | "verildi";

type UrunSatir = {
  isim: string;
  adet: number;
  fiyat: number;
};

type SiparisKart = {
  id: string;
  durum: SiparisDurum;
  sezlongKod: string;
  baslik: string;
  musteri: string;
  telefon?: string;
  createdAt: string;
  saat: string;
  sureDakika: number;
  urunler: UrunSatir[];
  not?: string;
  toplam: number;
};

type GarsonOption = {
  id: string;
  ad: string;
  atananKodlar: string[];
};

function formatTl(v: number): string {
  return `₺${Number(v || 0).toLocaleString("tr-TR")}`;
}

function normalizeKod(v: unknown): string {
  return String(v ?? "").trim().toUpperCase();
}

function extractAtananKodlar(personel: any): string[] {
  const rawAtanan = personel?.atanan_sezlonglar;
  const rawYetkiler = personel?.yetkiler;
  const listA = Array.isArray(rawAtanan) ? rawAtanan : (Array.isArray(rawAtanan?.value) ? rawAtanan.value : []);
  const listB = Array.isArray(rawYetkiler) ? rawYetkiler : (Array.isArray(rawYetkiler?.value) ? rawYetkiler.value : []);
  return [...listA, ...listB]
    .filter((x: unknown): x is string => typeof x === "string")
    .map(normalizeKod)
    .filter(Boolean);
}

function rowToKart(s: any): SiparisKart {
  const created = s?.created_at ? new Date(s.created_at) : new Date();
  const sureDakika = Math.max(1, Math.round((Date.now() - created.getTime()) / 60000));

  const rezervasyon = s?.rezervasyonlar ?? {};
  const grupAd = String(rezervasyon?.sezlonglar?.sezlong_gruplari?.ad || "").trim();
  const no = String(rezervasyon?.sezlonglar?.no || s?.sezlong_no || "").trim();
  const sezlongKod = String(s?.sezlong_no || no || "").trim();
  const baslik = grupAd && no ? `${grupAd} - ${no}` : (no || `Sipariş #${String(s?.id ?? "").slice(-3) || "000"}`);

  const userAd = String(rezervasyon?.kullanicilar?.ad || "").trim();
  const userSoyad = String(rezervasyon?.kullanicilar?.soyad || "").trim();
  const userAdSoyad = `${userAd} ${userSoyad}`.trim();
  const musteri = String(rezervasyon?.musteri_adi || "").trim() || userAdSoyad || "Misafir";
  const telefon = String(rezervasyon?.telefon || rezervasyon?.kullanicilar?.telefon || "").trim() || undefined;

  const urunler: UrunSatir[] = (s?.siparis_kalemleri ?? []).map((k: any) => ({
    isim: String(k?.ad || "Ürün").trim() || "Ürün",
    adet: Number(k?.adet ?? 1),
    fiyat: Number(k?.fiyat ?? 0),
  }));

  return {
    id: String(s?.id ?? ""),
    durum: (s?.durum as SiparisDurum) ?? "hazir",
    sezlongKod,
    baslik,
    musteri,
    telefon,
    createdAt: s?.created_at || new Date().toISOString(),
    saat: created.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    sureDakika,
    urunler,
    not: s?.not || s?.notlar || undefined,
    toplam: Number(s?.toplam ?? 0),
  };
}

export default function GarsonPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [tesisId, setTesisId] = useState<string | null>(null);
  const [rol, setRol] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("hazir");
  const [rows, setRows] = useState<SiparisKart[]>([]);
  const [sesAcik, setSesAcik] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [saat, setSaat] = useState("");

  const [garsonlar, setGarsonlar] = useState<GarsonOption[]>([]);
  const [activeGarsonId, setActiveGarsonId] = useState<string | null>(null);
  const [kendiKodlar, setKendiKodlar] = useState<string[]>([]);
  const previousHazirCountRef = useRef(0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  function playHazirSiparisSesi() {
    if (!sesAcik || typeof window === "undefined") return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const audio = new AC();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "triangle";
      osc.frequency.value = 840;
      gain.gain.value = 0.001;
      osc.connect(gain);
      gain.connect(audio.destination);
      const now = audio.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // no-op
    }
  }

  useEffect(() => {
    function tick() {
      const n = new Date();
      setSaat(`${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`);
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function initAuth() {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (cancelled) return;
      if (authErr || !authData?.user) {
        router.push("/giris");
        return;
      }

      const uid = authData.user.id;
      setCurrentUserId(uid);

      const { data: kullanici, error: kulErr } = await supabase
        .from("kullanicilar")
        .select("id, rol, tesis_id")
        .eq("id", uid)
        .maybeSingle();
      if (cancelled) return;
      if (kulErr || !kullanici?.tesis_id) {
        router.push("/");
        return;
      }

      const userRol = String(kullanici.rol || "").toLowerCase();
      if (userRol !== "garson" && userRol !== "isletmeci" && userRol !== "admin") {
        router.push("/");
        return;
      }

      setRol(userRol);
      setTesisId(String(kullanici.tesis_id));
      setAuthLoading(false);
    }
    initAuth();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!tesisId) return;

    let cancelled = false;
    async function loadGarsonContext() {
      const { data: garsonRows, error } = await supabase
        .from("personel")
        .select("id, ad, kullanici_id, rol, atanan_sezlonglar, yetkiler, aktif")
        .eq("tesis_id", tesisId)
        .eq("rol", "garson");
      if (cancelled) return;
      if (error) {
        console.error("garson personel fetch error:", JSON.stringify(error, null, 2));
        setGarsonlar([]);
        setKendiKodlar([]);
        return;
      }

      const options: GarsonOption[] = (garsonRows ?? []).map((g: any) => ({
        id: String(g.id),
        ad: String(g.ad || "Garson"),
        atananKodlar: extractAtananKodlar(g),
      }));
      setGarsonlar(options);

      const kendi = (garsonRows ?? []).find((g: any) => String(g.kullanici_id || "") === String(currentUserId || ""));
      if (rol === "garson") {
        const kodlar = kendi ? extractAtananKodlar(kendi) : [];
        setKendiKodlar(kodlar);
      } else {
        const first = options[0]?.id ?? null;
        setActiveGarsonId((prev) => prev ?? first);
      }
    }
    loadGarsonContext();
    return () => {
      cancelled = true;
    };
  }, [tesisId, rol, currentUserId]);

  const activeKodlar = useMemo(() => {
    if (rol === "garson") return kendiKodlar;
    const secilen = garsonlar.find((g) => g.id === activeGarsonId);
    return secilen?.atananKodlar ?? [];
  }, [rol, kendiKodlar, garsonlar, activeGarsonId]);

  useEffect(() => {
    if (!tesisId) {
      setRows([]);
      previousHazirCountRef.current = 0;
      return;
    }

    async function fetchWithJoinOrFallback(): Promise<any[]> {
      const now = new Date();
      const startTodayIso = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();

      const { data: joinedRows, error: joinedErr } = await supabase
        .from("siparisler")
        .select("id, rezervasyon_id, created_at, durum, toplam, notlar, sezlong_no, musteri_adi, siparis_kalemleri(ad, adet, fiyat), rezervasyonlar(musteri_adi, telefon, kullanici_id, sezlong_id, sezlonglar(no, sezlong_gruplari(ad)), kullanicilar(ad, soyad, telefon))")
        .eq("tesis_id", tesisId)
        .in("durum", ["hazir", "yolda", "verildi"])
        .gte("created_at", startTodayIso)
        .order("created_at", { ascending: true });
      if (!joinedErr) return joinedRows ?? [];

      console.error("garson joined fetch error:", JSON.stringify(joinedErr, null, 2));
      const { data: sipRows, error: sipErr } = await supabase
        .from("siparisler")
        .select("id, rezervasyon_id, created_at, durum, toplam, notlar, sezlong_no, musteri_adi, siparis_kalemleri(ad, adet, fiyat)")
        .eq("tesis_id", tesisId)
        .in("durum", ["hazir", "yolda", "verildi"])
        .gte("created_at", startTodayIso)
        .order("created_at", { ascending: true });
      if (sipErr) {
        console.error("garson fallback siparis fetch error:", JSON.stringify(sipErr, null, 2));
        return [];
      }

      const rezIds = Array.from(new Set((sipRows ?? []).map((x: any) => x.rezervasyon_id).filter(Boolean)));
      const { data: rezRows } = rezIds.length
        ? await supabase.from("rezervasyonlar").select("id, musteri_adi, telefon, sezlong_id, kullanici_id").in("id", rezIds)
        : { data: [] as any[] };

      const sezlongIds = Array.from(new Set((rezRows ?? []).map((x: any) => x.sezlong_id).filter(Boolean)));
      const { data: sezRows } = sezlongIds.length
        ? await supabase.from("sezlonglar").select("id, no, sezlong_gruplari(ad)").in("id", sezlongIds)
        : { data: [] as any[] };

      const userIds = Array.from(new Set((rezRows ?? []).map((x: any) => x.kullanici_id).filter(Boolean)));
      const { data: userRows } = userIds.length
        ? await supabase.from("kullanicilar").select("id, ad, soyad, telefon").in("id", userIds)
        : { data: [] as any[] };

      const rezMap = new Map<string, any>((rezRows ?? []).map((r: any) => [String(r.id), r]));
      const sezMap = new Map<string, any>((sezRows ?? []).map((z: any) => [String(z.id), z]));
      const userMap = new Map<string, any>((userRows ?? []).map((u: any) => [String(u.id), u]));

      return (sipRows ?? []).map((s: any) => {
        const rez = s?.rezervasyon_id ? rezMap.get(String(s.rezervasyon_id)) ?? null : null;
        const sez = rez?.sezlong_id ? sezMap.get(String(rez.sezlong_id)) ?? null : null;
        const usr = rez?.kullanici_id ? userMap.get(String(rez.kullanici_id)) ?? null : null;
        return {
          ...s,
          rezervasyonlar: rez
            ? {
                musteri_adi: rez.musteri_adi,
                telefon: rez.telefon,
                kullanici_id: rez.kullanici_id,
                sezlong_id: rez.sezlong_id,
                sezlonglar: sez ? { no: sez.no, sezlong_gruplari: { ad: sez?.sezlong_gruplari?.ad } } : null,
                kullanicilar: usr ? { ad: usr.ad, soyad: usr.soyad, telefon: usr.telefon } : null,
              }
            : null,
        };
      });
    }

    async function fetchRows() {
      const rawRows = await fetchWithJoinOrFallback();
      let mapped = rawRows.map(rowToKart);

      // Bölge kısıtı: sadece gerçek garsonda siparisler.sezlong_no IN atanan_sezlonglar.
      if (rol === "garson" && activeKodlar.length > 0) {
        const kodSet = new Set(activeKodlar.map(normalizeKod));
        mapped = mapped.filter((m) => kodSet.has(normalizeKod(m.sezlongKod)));
      }

      const hazirCount = mapped.filter((m) => m.durum === "hazir").length;
      if (hazirCount > previousHazirCountRef.current) {
        playHazirSiparisSesi();
        showToast("🔔 Yeni hazır sipariş geldi");
      }
      previousHazirCountRef.current = hazirCount;
      setRows(mapped);
    }

    fetchRows();

    const channel = supabase
      .channel(`garson-siparisler-${tesisId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "siparisler", filter: `tesis_id=eq.${tesisId}` }, () => {
        fetchRows();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tesisId, activeKodlar, sesAcik]);

  async function durumGuncelle(id: string, yeniDurum: SiparisDurum, msg: string) {
    const { error } = await supabase.from("siparisler").update({ durum: yeniDurum }).eq("id", id);
    if (error) {
      console.error("garson durum update error:", JSON.stringify(error, null, 2));
      showToast("❌ Sipariş güncellenemedi");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, durum: yeniDurum } : r)));
    if (yeniDurum === "hazir") setTab("hazir");
    else if (yeniDurum === "yolda") setTab("yolda");
    else if (yeniDurum === "verildi") setTab("verildi");
    showToast(msg);
  }

  const counts = useMemo(() => {
    return {
      hazir: rows.filter((r) => r.durum === "hazir").length,
      yolda: rows.filter((r) => r.durum === "yolda").length,
      verildi: rows.filter((r) => r.durum === "verildi").length,
    };
  }, [rows]);

  const activeRows = useMemo(() => rows.filter((r) => r.durum === tab), [rows, tab]);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column" }}>
      <header style={{ background: NAVY, color: "white", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🛵</span>
          <strong style={{ fontSize: 15 }}>GARSON PANELİ</strong>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#67E8F9" }}>{saat}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {(rol === "isletmeci" || rol === "admin") && (
            <select
              value={activeGarsonId ?? ""}
              onChange={(e) => setActiveGarsonId(e.target.value || null)}
              style={{ borderRadius: 10, border: "none", padding: "8px 10px", fontWeight: 700, color: NAVY }}
            >
              {garsonlar.map((g) => (
                <option key={g.id} value={g.id}>{`Aktif Garson: ${g.ad}`}</option>
              ))}
            </select>
          )}
          <button onClick={() => setSesAcik((v) => !v)} style={{ border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontWeight: 700, background: sesAcik ? "#22C55E" : "#334155", color: "white" }}>
            {sesAcik ? "🔊 Ses Açık" : "🔇 Ses Kapalı"}
          </button>
        </div>
      </header>

      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {([
            { key: "hazir", label: "Hazır", count: counts.hazir, bg: "#DCFCE7", border: GREEN, color: "#14532D" },
            { key: "yolda", label: "Yolda", count: counts.yolda, bg: "#F3E8FF", border: PURPLE, color: "#581C87" },
            { key: "verildi", label: "Teslim", count: counts.verildi, bg: "#E2E8F0", border: SLATE, color: "#334155" },
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
              const acil = k.durum === "hazir" && k.sureDakika >= 5;
              const theme =
                k.durum === "hazir"
                  ? { border: GREEN, bg: "#F0FDF4", head: "#DCFCE7", action: GREEN }
                  : k.durum === "yolda"
                    ? { border: PURPLE, bg: "#FAF5FF", head: "#F3E8FF", action: PURPLE }
                    : { border: SLATE, bg: "#F8FAFC", head: "#E2E8F0", action: SLATE };

              return (
                <div key={k.id} style={{ width: "100%", maxWidth: 440, border: `2px solid ${acil ? "#EF4444" : theme.border}`, borderRadius: 14, background: theme.bg, overflow: "hidden", opacity: k.durum === "verildi" ? 0.78 : 1 }}>
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
                        <div style={{ display: "inline-flex", marginTop: 6, background: "#EF4444", color: "white", fontSize: 10, fontWeight: 900, padding: "3px 9px", borderRadius: 999 }}>
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
                      <span style={{ fontSize: 20, color: theme.action, fontWeight: 900 }}>{formatTl(k.toplam)}</span>
                    </div>

                    {k.durum === "hazir" && (
                      <button
                        onClick={() => durumGuncelle(k.id, "yolda", "🏃 Sipariş alındı, yola çıkıldı")}
                        style={{ marginTop: 16, width: "100%", border: "none", borderRadius: 10, padding: "14px 16px", cursor: "pointer", background: PURPLE, color: "white", fontWeight: 900, fontSize: 15 }}
                      >
                        🏃 Aldım, Götürüyorum
                      </button>
                    )}
                    {k.durum === "yolda" && (
                      <button
                        onClick={() => durumGuncelle(k.id, "verildi", "✅ Sipariş teslim edildi")}
                        style={{ marginTop: 16, width: "100%", border: "none", borderRadius: 10, padding: "14px 16px", cursor: "pointer", background: GREEN, color: "white", fontWeight: 900, fontSize: 15 }}
                      >
                        ✅ Teslim Ettim
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

