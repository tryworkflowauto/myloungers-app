"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LogoutModal from "@/components/LogoutModal";
import { SIPARIS_DURUM } from "@/lib/constants";

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

type SiparisDurum = "yeni" | "hazirlaniyor" | "hazir" | "yolda" | "teslim_edildi" | "iptal";
type TabKey = "hazir" | "yolda" | "teslim_edildi";

type UrunSatir = {
  isim: string;
  adet: number;
  fiyat: number;
};

type SiparisKart = {
  id: string;
  durum: SiparisDurum;
  sezlongId: string | null;
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
  atananUuids: string[];
  yetkiler: string[];
};

type SezlongOption = {
  id: string;
  numara: string;
  grupId: string;
  grupAd: string;
  label: string;
};

function formatTl(v: number): string {
  return `₺${Number(v || 0).toLocaleString("tr-TR")}`;
}

function normalizeKod(v: unknown): string {
  return String(v ?? "").trim().toUpperCase();
}

// Sadece sezlong UUID'lerini döndürür (atanan_sezlonglar alanı)
function extractAtananSezlongIds(personel: any): string[] {
  const raw = personel?.atanan_sezlonglar;
  const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.value) ? raw.value : []);
  return list.filter((x: unknown): x is string => typeof x === "string" && x.trim() !== "");
}

// Sadece izin string'lerini döndürür (yetkiler alanı)
function extractYetkilerArray(personel: any): string[] {
  const raw = personel?.yetkiler;
  const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.value) ? raw.value : []);
  return list.filter((x: unknown): x is string => typeof x === "string" && x.trim() !== "");
}

function rowToKart(s: any): SiparisKart {
  const created = s?.created_at ? new Date(s.created_at) : new Date();
  const sureDakika = Math.max(1, Math.round((Date.now() - created.getTime()) / 60000));

  const rezervasyon = s?.rezervasyonlar ?? {};
  // Gerçek sezlong bağlantısı: rezervasyonlar.sezlong_id (UUID)
  const sezlongId = String(rezervasyon?.sezlong_id || "").trim() || null;
  const baslik = `Sipariş #${String(s?.id ?? "").slice(-4) || "0000"}`;

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
    sezlongId,
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

const T = {
  BG: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
  CARD_BG: "rgba(255,255,255,0.04)",
  CARD_BORDER: "rgba(255,255,255,0.08)",
  ACCENT: "#0ABAB5",
  AVATAR_BG: "linear-gradient(135deg, #0ABAB5, #0891B2)",
  BTN_GRADIENT: "linear-gradient(135deg, #0ABAB5, #0891B2)",
  TEXT: "white",
  TEXT_SUB: "rgba(255,255,255,0.75)",
  TEXT_MUTED: "rgba(255,255,255,0.5)",
  TEXT_FAINT: "rgba(255,255,255,0.4)",
  GREEN: "#6EE7B7",
  GREEN_BG: "rgba(16,185,129,0.2)",
  BLUE: "#93C5FD",
  BLUE_BG: "rgba(59,130,246,0.2)",
  RED: "#F87171",
  RED_BG: "rgba(239,68,68,0.12)",
};

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

  const [garsonAdi, setGarsonAdi] = useState("");
  const [garsonlar, setGarsonlar] = useState<GarsonOption[]>([]);
  const [activeGarsonId, setActiveGarsonId] = useState<string | null>(null);
  const [kendiUuids, setKendiUuids] = useState<string[]>([]);
  const [kendiYetkiler, setKendiYetkiler] = useState<string[]>([]);
  const [sezlongOptions, setSezlongOptions] = useState<SezlongOption[]>([]);
  const [sezlongPanelAcik, setSezlongPanelAcik] = useState(false);
  const [aktivCagrilar, setAktivCagrilar] = useState<any[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const previousHazirCountRef = useRef(0);
  const prevCagriIdsRef = useRef<Set<string>>(new Set());

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

  function playCagriSesi() {
    if (!sesAcik || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.value = 880;
      osc1.type = "sine";
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.01);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 587.33;
      osc2.type = "sine";
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.3);
      gain2.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.31);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.9);
      osc2.start(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 0.9);

      setTimeout(() => {
        try {
          const osc3 = ctx.createOscillator();
          const gain3 = ctx.createGain();
          osc3.connect(gain3);
          gain3.connect(ctx.destination);
          osc3.frequency.value = 880;
          osc3.type = "sine";
          gain3.gain.setValueAtTime(0, ctx.currentTime);
          gain3.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
          gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc3.start(ctx.currentTime);
          osc3.stop(ctx.currentTime + 0.3);
        } catch { /* no-op */ }
      }, 1000);
    } catch (e) {
      console.warn("Ses oynatılamadı:", e);
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
        .select("id, rol, tesis_id, ad, soyad")
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

      const ad = String((kullanici as any).ad || "").trim();
      const soyad = String((kullanici as any).soyad || "").trim();
      setGarsonAdi([ad, soyad].filter(Boolean).join(" "));
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
      // Personel listesi
      const { data: garsonRows, error } = await supabase
        .from("personel")
        .select("id, ad, kullanici_id, rol, atanan_sezlonglar, yetkiler, aktif")
        .eq("tesis_id", tesisId)
        .eq("rol", "garson");
      if (cancelled) return;
      if (error) {
        console.error("garson personel fetch error:", JSON.stringify(error, null, 2));
        setGarsonlar([]);
        setKendiUuids([]);
        setKendiYetkiler([]);
        return;
      }

      // Sezlong listesi (UUID → label dönüşümü için)
      // DB: sezlonglar.grup_id FK → sezlong_gruplari(id, ad)
      const { data: sezRows, error: sezErr } = await supabase
        .from("sezlonglar")
        .select("id, numara, sezlong_gruplari(id, ad)")
        .eq("tesis_id", tesisId)
        .order("numara", { ascending: true });
      if (cancelled) return;
      if (sezErr) console.error("garson sezlong fetch error:", JSON.stringify(sezErr, null, 2));

      const opts: SezlongOption[] = (sezRows ?? []).map((s: any) => {
        const numara = String(s.numara ?? "");
        const grupId = String(s.sezlong_gruplari?.id ?? "");
        const grupAd = String(s.sezlong_gruplari?.ad ?? "").trim();
        const label = grupAd && numara ? `${grupAd.charAt(0).toUpperCase()}-${numara}` : numara;
        return { id: String(s.id), numara, grupId, grupAd, label };
      });
      setSezlongOptions(opts);

      const options: GarsonOption[] = (garsonRows ?? []).map((g: any) => ({
        id: String(g.id),
        ad: String(g.ad || "Garson"),
        atananUuids: extractAtananSezlongIds(g),
        yetkiler: extractYetkilerArray(g),
      }));
      setGarsonlar(options);

      const kendi = (garsonRows ?? []).find((g: any) => String(g.kullanici_id || "") === String(currentUserId || ""));
      if (rol === "garson") {
        setKendiUuids(kendi ? extractAtananSezlongIds(kendi) : []);
        setKendiYetkiler(kendi ? extractYetkilerArray(kendi) : []);
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

  const activeUuids = useMemo(() => {
    if (rol === "garson") return kendiUuids;
    const secilen = garsonlar.find((g) => g.id === activeGarsonId);
    return secilen?.atananUuids ?? [];
  }, [rol, kendiUuids, garsonlar, activeGarsonId]);

  const activeYetkiler = useMemo(() => {
    if (rol === "garson") return kendiYetkiler;
    const secilen = garsonlar.find((g) => g.id === activeGarsonId);
    return secilen?.yetkiler ?? [];
  }, [rol, kendiYetkiler, garsonlar, activeGarsonId]);

  useEffect(() => {
    if (!tesisId) {
      setRows([]);
      previousHazirCountRef.current = 0;
      return;
    }

    async function fetchWithJoinOrFallback(): Promise<any[]> {
      // Aktif siparişler (hazir/yolda) tarih bağımsız + bugünkü teslim_edildi
      const bugunBaslangic = new Date();
      bugunBaslangic.setHours(0, 0, 0, 0);
      const bugunBaslangicIso = bugunBaslangic.toISOString();
      const orFilter = `durum.neq.${SIPARIS_DURUM.TESLIM_EDILDI},and(durum.eq.${SIPARIS_DURUM.TESLIM_EDILDI},created_at.gte.${bugunBaslangicIso})`;

      // Gerçek bağlantı: siparisler.rezervasyon_id → rezervasyonlar.sezlong_id (UUID)
      const { data: joinedRows, error: joinedErr } = await supabase
        .from("siparisler")
        .select("id, rezervasyon_id, created_at, durum, toplam, notlar, musteri_adi, siparis_kalemleri(ad, adet, fiyat), rezervasyonlar(musteri_adi, telefon, kullanici_id, sezlong_id, kullanicilar(ad, soyad, telefon))")
        .eq("tesis_id", tesisId)
        .or(orFilter)
        .order("created_at", { ascending: true });
      if (!joinedErr) return joinedRows ?? [];

      console.error("garson joined fetch error:", JSON.stringify(joinedErr, null, 2));

      // Fallback: ayrı sorgular
      const { data: sipRows, error: sipErr } = await supabase
        .from("siparisler")
        .select("id, rezervasyon_id, created_at, durum, toplam, notlar, musteri_adi, siparis_kalemleri(ad, adet, fiyat)")
        .eq("tesis_id", tesisId)
        .or(orFilter)
        .order("created_at", { ascending: true });
      if (sipErr) {
        console.error("garson fallback siparis fetch error:", JSON.stringify(sipErr, null, 2));
        return [];
      }

      const rezIds = Array.from(new Set((sipRows ?? []).map((x: any) => x.rezervasyon_id).filter(Boolean)));
      const { data: rezRows } = rezIds.length
        ? await supabase.from("rezervasyonlar").select("id, musteri_adi, telefon, sezlong_id, kullanici_id").in("id", rezIds)
        : { data: [] as any[] };

      const userIds = Array.from(new Set((rezRows ?? []).map((x: any) => x.kullanici_id).filter(Boolean)));
      const { data: userRows } = userIds.length
        ? await supabase.from("kullanicilar").select("id, ad, soyad, telefon").in("id", userIds)
        : { data: [] as any[] };

      const rezMap = new Map<string, any>((rezRows ?? []).map((r: any) => [String(r.id), r]));
      const userMap = new Map<string, any>((userRows ?? []).map((u: any) => [String(u.id), u]));

      return (sipRows ?? []).map((s: any) => {
        const rez = s?.rezervasyon_id ? rezMap.get(String(s.rezervasyon_id)) ?? null : null;
        const usr = rez?.kullanici_id ? userMap.get(String(rez.kullanici_id)) ?? null : null;
        return {
          ...s,
          rezervasyonlar: rez
            ? {
                musteri_adi: rez.musteri_adi,
                telefon: rez.telefon,
                kullanici_id: rez.kullanici_id,
                sezlong_id: rez.sezlong_id,
                kullanicilar: usr ? { ad: usr.ad, soyad: usr.soyad, telefon: usr.telefon } : null,
              }
            : null,
        };
      });
    }

    async function fetchRows() {
      const rawRows = await fetchWithJoinOrFallback();

      // Debug: rezervasyonlar.sezlong_id ve activeUuids karşılaştırması
      if (rawRows.length > 0) {
        const ornekRez = rawRows[0]?.rezervasyonlar;
        console.log("garson/debug sezlong_id örnek:", ornekRez?.sezlong_id, "| activeUuids:", activeUuids.slice(0, 3));
      }

      let mapped = rawRows.map(rowToKart);

      // Bölge kısıtı: garson yalnızca atanan şezlonglardaki siparişleri görür.
      // Atanan şezlong yoksa hiçbir sipariş gösterilmez.
      if (rol === "garson") {
        if (activeUuids.length === 0) {
          mapped = [];
        } else {
          const atananIds = new Set(activeUuids.map((u) => u.toLowerCase()));
          mapped = mapped.filter((m) => m.sezlongId && atananIds.has(m.sezlongId.toLowerCase()));
        }
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
  }, [tesisId, activeUuids, sezlongOptions, sesAcik]);

  useEffect(() => {
    if (!tesisId) return;

    const activeUuidSet = new Set(activeUuids.map((u) => u.toLowerCase()));

    async function fetchCagrilar() {
      const { data, error } = await supabase
        .from("bildirimler")
        .select("id, tesis_id, sezlong_id, created_at, okundu, baslik, mesaj, yanit_tarihi, yanit_suresi_saniye, varis_tarihi, varis_suresi_saniye")
        .eq("tesis_id", tesisId)
        .eq("tip", "garson_cagri")
        .is("varis_tarihi", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("garson cagri fetch error:", JSON.stringify(error, null, 2));
        return;
      }

      const filtered = (data ?? []).filter(
        (b: any) => b.sezlong_id && activeUuidSet.has(String(b.sezlong_id).toLowerCase())
      );

      const newIds = filtered.map((c: any) => String(c.id));
      const prevIds = prevCagriIdsRef.current;
      const hasBrandNew = newIds.some((id: string) => !prevIds.has(id));
      if (hasBrandNew && prevIds.size > 0) {
        playCagriSesi();
      }
      prevCagriIdsRef.current = new Set(newIds);

      setAktivCagrilar(filtered);
    }

    fetchCagrilar();

    const channel = supabase
      .channel(`garson-cagri-${tesisId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bildirimler", filter: `tesis_id=eq.${tesisId}` },
        () => fetchCagrilar()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tesisId, activeUuids]);

  async function handleYoldaCiktim(cagriId: string, createdAt: string) {
    const now = new Date();
    const sureSaniye = Math.round((now.getTime() - new Date(createdAt).getTime()) / 1000);

    const { error } = await supabase
      .from("bildirimler")
      .update({
        okundu: true,
        yanit_tarihi: now.toISOString(),
        yanit_suresi_saniye: sureSaniye,
      })
      .eq("id", cagriId);

    if (!error) {
      setAktivCagrilar((prev) =>
        prev.map((c) =>
          c.id === cagriId
            ? { ...c, yanit_tarihi: now.toISOString(), okundu: true, yanit_suresi_saniye: sureSaniye }
            : c
        )
      );
    }
  }

  async function handleGeldim(cagriId: string, createdAt: string) {
    const now = new Date();
    const sureSaniye = Math.round((now.getTime() - new Date(createdAt).getTime()) / 1000);

    const { error } = await supabase
      .from("bildirimler")
      .update({
        varis_tarihi: now.toISOString(),
        varis_suresi_saniye: sureSaniye,
      })
      .eq("id", cagriId);

    if (!error) {
      setAktivCagrilar((prev) => prev.filter((c) => c.id !== cagriId));
    }
  }

  async function durumGuncelle(id: string, yeniDurum: SiparisDurum, msg: string) {
    const { error } = await supabase.from("siparisler").update({ durum: yeniDurum }).eq("id", id);
    if (error) {
      console.error("garson durum update error:", JSON.stringify(error, null, 2));
      showToast("❌ Sipariş güncellenemedi");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, durum: yeniDurum } : r)));
    if (yeniDurum === SIPARIS_DURUM.HAZIR) setTab(SIPARIS_DURUM.HAZIR);
    else if (yeniDurum === SIPARIS_DURUM.YOLDA) setTab(SIPARIS_DURUM.YOLDA);
    else if (yeniDurum === SIPARIS_DURUM.TESLIM_EDILDI) setTab(SIPARIS_DURUM.TESLIM_EDILDI);
    showToast(msg);
  }

  const counts = useMemo(() => {
    return {
      hazir: rows.filter((r) => r.durum === SIPARIS_DURUM.HAZIR).length,
      yolda: rows.filter((r) => r.durum === SIPARIS_DURUM.YOLDA).length,
      teslim_edildi: rows.filter((r) => r.durum === SIPARIS_DURUM.TESLIM_EDILDI).length,
    };
  }, [rows]);

  const activeRows = useMemo(() => rows.filter((r) => r.durum === tab), [rows, tab]);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: T.BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: T.TEXT_MUTED, fontSize: 14 }}>Yükleniyor...</div>
      </div>
    );
  }

  // Yardımcı: avatar baş harfleri
  const garsonInits = garsonAdi.split(" ").map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("") || "G";

  // Yardımcı: atanan grup adları + toplam şezlong özeti
  const aktifGruplar = [...new Set(
    activeUuids
      .map((uuid) => sezlongOptions.find((o) => o.id.toLowerCase() === uuid.toLowerCase())?.grupAd)
      .filter((g): g is string => !!g)
  )];
  const sezlongOzet = aktifGruplar.length > 0
    ? `${aktifGruplar.join(" · ")} · ${activeUuids.length} şezlong`
    : "Şezlong atanmamış";

  // Yardımcı: atanan şezlong grupları (UI için)
  function buildGrupMap() {
    const grupMap = new Map<string, { grupAd: string; items: SezlongOption[] }>();
    activeUuids.forEach((uuid) => {
      const opt = sezlongOptions.find((o) => o.id.toLowerCase() === uuid.toLowerCase());
      if (!opt) return;
      const key = opt.grupId || opt.grupAd || "__";
      if (!grupMap.has(key)) grupMap.set(key, { grupAd: opt.grupAd, items: [] });
      grupMap.get(key)!.items.push(opt);
    });
    return Array.from(grupMap.values());
  }

  return (
    <div style={{ background: T.BG, minHeight: "100vh" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: 20 }}>

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Avatar */}
            <div style={{ width: 44, height: 44, borderRadius: 14, background: T.AVATAR_BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white", flexShrink: 0 }}>
              {garsonInits}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: T.TEXT }}>{garsonAdi || "Garson Paneli"}</div>
              <div style={{ fontSize: 11, color: T.TEXT_MUTED, marginTop: 2 }}>{sezlongOzet}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* İşletmeci / admin garson seçici */}
            {(rol === "isletmeci" || rol === "admin") && (
              <select
                value={activeGarsonId ?? ""}
                onChange={(e) => setActiveGarsonId(e.target.value || null)}
                style={{ background: "rgba(255,255,255,0.07)", color: "white", border: `0.5px solid ${T.CARD_BORDER}`, borderRadius: 10, padding: "7px 10px", fontSize: 12, fontWeight: 500 }}
              >
                {garsonlar.map((g) => <option key={g.id} value={g.id} style={{ background: "#1E293B" }}>{g.ad}</option>)}
              </select>
            )}
            {/* Ses toggle */}
            <button
              onClick={() => setSesAcik((v) => !v)}
              style={{ background: "rgba(255,255,255,0.06)", border: `0.5px solid ${T.CARD_BORDER}`, borderRadius: 10, padding: "8px 10px", cursor: "pointer", color: sesAcik ? T.ACCENT : T.TEXT_MUTED, fontSize: 14, lineHeight: 1 }}
            >
              {sesAcik ? "🔊" : "🔇"}
            </button>
            {/* Saat */}
            <div style={{ background: "rgba(255,255,255,0.05)", border: `0.5px solid ${T.CARD_BORDER}`, borderRadius: 12, padding: "8px 14px", fontSize: 13, color: T.TEXT, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
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

        {/* ── ÇAĞRI BANNER ─────────────────────────────────────────────────── */}
        {aktivCagrilar.map((c: any) => {
          const sezOpt = c.sezlong_id
            ? sezlongOptions.find((o) => o.id.toLowerCase() === String(c.sezlong_id).toLowerCase())
            : null;
          const sezLabel = sezOpt?.label ?? (c.sezlong_id ? "Şezlong" : "");
          const created = c.created_at ? new Date(c.created_at) : null;
          const dakikaOnce = created
            ? Math.max(0, Math.round((Date.now() - created.getTime()) / 60000))
            : null;
          const zamanMetni = dakikaOnce !== null
            ? dakikaOnce === 0 ? "Az önce" : `${dakikaOnce} dk önce`
            : "";
          const isAşama1 = !c.okundu && !c.yanit_tarihi;
          const isAşama2 = c.yanit_tarihi && !c.varis_tarihi;
          return (
            <div key={c.id} style={{ background: T.RED_BG, border: "0.5px solid rgba(239,68,68,0.35)", borderRadius: 14, padding: "13px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.RED, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#FCA5A5", fontWeight: 500 }}>
                  {sezLabel ? `${sezLabel} — Garson çağrısı` : (c.baslik || "Garson çağrısı")}
                </div>
                <div style={{ fontSize: 11, color: "rgba(252,165,165,0.7)", marginTop: 2 }}>{zamanMetni}</div>
              </div>
              {isAşama1 && (
                <button
                  onClick={() => handleYoldaCiktim(String(c.id), c.created_at)}
                  style={{ background: "#10B981", color: "white", border: "none", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Yolda ✓
                </button>
              )}
              {isAşama2 && (
                <button
                  onClick={() => handleGeldim(String(c.id), c.created_at)}
                  style={{ background: "#0891B2", color: "white", border: "none", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Geldim ✓
                </button>
              )}
            </div>
          );
        })}

        {/* ── ÖZET SEKMESİ ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 6, background: T.CARD_BG, padding: 4, borderRadius: 12, marginBottom: 16 }}>
          {([
            { key: "hazir" as TabKey, label: "Hazır", count: counts.hazir, activeColor: T.GREEN, activeBg: T.GREEN_BG },
            { key: "yolda" as TabKey, label: "Yolda", count: counts.yolda, activeColor: T.BLUE, activeBg: T.BLUE_BG },
            { key: "teslim_edildi" as TabKey, label: "Teslim", count: counts.teslim_edildi, activeColor: T.TEXT_MUTED, activeBg: "rgba(255,255,255,0.08)" },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ flex: 1, padding: 9, textAlign: "center", border: "none", cursor: "pointer", background: tab === t.key ? t.activeBg : "transparent", borderRadius: 9 }}
            >
              <div style={{ fontSize: 16, fontWeight: 500, color: T.TEXT }}>{t.count}</div>
              <div style={{ fontSize: 11, color: tab === t.key ? t.activeColor : T.TEXT_MUTED }}>{t.label}</div>
            </button>
          ))}
        </div>

        {/* ── SİPARİŞ LİSTESİ ─────────────────────────────────────────────── */}
        {activeRows.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 20px", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
            Bu sekmede sipariş yok
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {activeRows.map((k) => {
              const sezOpt = k.sezlongId ? sezlongOptions.find((o) => o.id.toLowerCase() === k.sezlongId!.toLowerCase()) : null;
              const sezLabel = sezOpt?.label ?? "";
              const sezGrupAd = sezOpt?.grupAd ?? "";
              const kartBaslik = sezLabel || (k.sezlongId ? "Şezlong bilinmiyor" : k.baslik);
              const urunOzet = k.urunler.map((u) => `${u.isim} ×${u.adet}`).join(" · ");
              const acil = k.durum === "hazir" && k.sureDakika >= 5;

              const ct = k.durum === "hazir" ? {
                bg: T.CARD_BG,
                border: acil ? "rgba(239,68,68,0.6)" : T.CARD_BORDER,
                badgeBg: T.GREEN_BG, badgeColor: T.GREEN, badgeText: "HAZIR",
                sureColor: T.GREEN, sureText: `${k.sureDakika} dk`,
                btnBg: T.BTN_GRADIENT, btnText: "Teslim al →",
                btnClick: () => durumGuncelle(k.id, SIPARIS_DURUM.YOLDA, "🏃 Sipariş alındı, yola çıkıldı"),
              } : k.durum === "yolda" ? {
                bg: "rgba(59,130,246,0.08)",
                border: "rgba(59,130,246,0.25)",
                badgeBg: T.BLUE_BG, badgeColor: T.BLUE, badgeText: "YOLDA",
                sureColor: T.BLUE, sureText: "taşınıyor",
                btnBg: "#10B981", btnText: "Teslim edildi ✓",
                btnClick: () => durumGuncelle(k.id, SIPARIS_DURUM.TESLIM_EDILDI, "✅ Sipariş teslim edildi"),
              } : {
                bg: "rgba(255,255,255,0.02)",
                border: "rgba(255,255,255,0.06)",
                badgeBg: "rgba(255,255,255,0.1)", badgeColor: T.TEXT_MUTED, badgeText: "TESLİM",
                sureColor: T.TEXT_FAINT, sureText: "teslim edildi",
                btnBg: null as string | null, btnText: null as string | null,
                btnClick: null as (() => void) | null,
              };

              return (
                <div
                  key={k.id}
                  style={{ background: ct.bg, border: `0.5px solid ${ct.border}`, borderRadius: 14, padding: "14px 16px", opacity: k.durum === SIPARIS_DURUM.TESLIM_EDILDI ? 0.6 : 1 }}
                >
                  {/* Üst satır: badge + sezlong + süre */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ background: ct.badgeBg, color: ct.badgeColor, padding: "3px 9px", borderRadius: 7, fontSize: 10, fontWeight: 500, letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                        {ct.badgeText}
                      </span>
                      {acil && (
                        <span style={{ background: "rgba(239,68,68,0.2)", color: T.RED, padding: "3px 9px", borderRadius: 7, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>ACİL</span>
                      )}
                      <span style={{ fontSize: 15, fontWeight: 500, color: T.TEXT }}>{kartBaslik}</span>
                      {sezGrupAd && <span style={{ fontSize: 11, color: T.TEXT_FAINT }}>{sezGrupAd}</span>}
                    </div>
                    <span style={{ fontSize: 11, color: ct.sureColor, fontWeight: 500, whiteSpace: "nowrap" }}>{ct.sureText}</span>
                  </div>

                  {/* Müşteri adı + telefon */}
                  {(() => {
                    const isTeslim = k.durum === SIPARIS_DURUM.TESLIM_EDILDI;
                    const gercekMusteri = k.musteri !== "Misafir";
                    // Teslim durumunda sadece gerçek müşteri göster (Misafir'i gizle)
                    if (isTeslim && !gercekMusteri) return null;
                    if (!gercekMusteri && !k.telefon) return null;
                    const ikonRenk = isTeslim ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.5)";
                    const musteriRenk = isTeslim ? "rgba(255,255,255,0.55)" : (gercekMusteri ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)");
                    const telefonRenk = isTeslim ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.4)";
                    return (
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ikonRenk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                          </svg>
                          <span style={{
                            fontSize: 13, fontWeight: 500,
                            color: musteriRenk,
                            fontStyle: !gercekMusteri ? "italic" : "normal",
                          }}>
                            {k.musteri}
                          </span>
                        </div>
                        {k.telefon && (
                          <div style={{ fontSize: 11, color: telefonRenk, marginTop: 2, paddingLeft: 19 }}>
                            {k.telefon}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Ürün özeti */}
                  <div style={{ fontSize: 13, color: T.TEXT_SUB, marginBottom: ct.btnText ? 12 : 0 }}>
                    {urunOzet || "Ürün bilgisi yok"}
                  </div>

                  {/* Not */}
                  {k.not && (
                    <div style={{ padding: "8px 10px", background: "rgba(245,158,11,0.12)", border: "0.5px solid rgba(245,158,11,0.3)", borderRadius: 8, fontSize: 12, color: "#FCD34D", marginTop: 8, marginBottom: ct.btnText ? 12 : 0 }}>
                      📝 {k.not}
                    </div>
                  )}

                  {/* Aksiyon butonu */}
                  {ct.btnText && (
                    <button
                      onClick={ct.btnClick!}
                      style={{ width: "100%", background: ct.btnBg!, border: "none", borderRadius: 10, padding: 10, color: "white", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                    >
                      {ct.btnText}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── ATANAN ŞEZLONGLAR — collapse edilebilir ──────────────────────── */}
        <div style={{ marginBottom: 10 }}>
          <button
            onClick={() => setSezlongPanelAcik((v) => !v)}
            style={{ width: "100%", background: T.CARD_BG, border: `0.5px solid ${T.CARD_BORDER}`, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: 0.8, textTransform: "uppercase" }}>Bölgem</span>
              <span style={{ fontSize: 12, color: T.TEXT_SUB }}>{sezlongOzet}</span>
            </div>
            <span style={{ fontSize: 11, color: T.TEXT_MUTED }}>{sezlongPanelAcik ? "▲" : "▼"}</span>
          </button>

          {sezlongPanelAcik && (
            <div style={{ background: T.CARD_BG, border: `0.5px solid ${T.CARD_BORDER}`, borderRadius: 12, padding: "12px 14px", marginTop: 4 }}>
              {activeUuids.length === 0 ? (
                <div style={{ fontSize: 12, color: T.TEXT_MUTED, fontStyle: "italic" }}>Henüz şezlong atanmamış</div>
              ) : (() => {
                const gruplar = buildGrupMap();
                if (gruplar.length === 0) return <div style={{ fontSize: 12, color: T.TEXT_MUTED, fontStyle: "italic" }}>Şezlong bilgisi yükleniyor…</div>;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {gruplar.map((g) => (
                      <div key={g.grupAd || "grup"}>
                        <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.6)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>
                          {g.grupAd || "Grup"}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {g.items.map((opt) => (
                            <span key={opt.id} style={{ background: "rgba(255,255,255,0.08)", color: "white", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500 }}>
                              {opt.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* ── YETKİLER ────────────────────────────────────────────────────── */}
        {activeYetkiler.length > 0 && (
          <div style={{ background: T.CARD_BG, border: `0.5px solid ${T.CARD_BORDER}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>Yetkiler</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {activeYetkiler.map((y) => (
                <span key={y} style={{ background: "rgba(16,185,129,0.15)", color: T.GREEN, padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500 }}>{y}</span>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── TOAST ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: "rgba(10,186,181,0.15)", backdropFilter: "blur(8px)", border: "0.5px solid rgba(10,186,181,0.4)", color: "white", padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600, zIndex: 300, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 400px) {
          body { font-size: 13px; }
        }
        select option { background: #1E293B; color: white; }
      ` }} />

      {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} />}
    </div>
  );
}

