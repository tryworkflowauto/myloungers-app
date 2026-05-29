"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "./arama.css";
import { supabase } from "@/lib/supabase";
import { readSiteLangFromStorage, type SiteLang } from "@/lib/site-lang";
import { normalizeKategoriList } from "@/lib/tesisKategori";
import { buildYerEtiketiHaritasi, getSeatUnitLabelDinamik } from "@/lib/tesisTipleriDb";

const SearchBar = dynamic(() => import("./SearchBar"), { ssr: false });

const TUMU_TAB_KEY = "Tümü";

type AktifTesisTipi = {
  id: string;
  slug: string;
  ad: string;
  db_value: string;
  sira: number;
  ikon: string | null;
  yer_etiketi: string | null;
};

/** tesisler.kategori içinde db_value exact match */
function tesisHasDbValue(k: unknown, dbValue: string): boolean {
  if (!dbValue) return false;
  return normalizeKategoriList(k).some((part) => part === dbValue);
}

function matchesAramaTab(
  activeTab: string,
  kategoriRaw: unknown,
  aktifTipler: AktifTesisTipi[],
): boolean {
  if (activeTab === TUMU_TAB_KEY) return true;
  const tip = aktifTipler.find((t) => t.slug === activeTab);
  if (!tip) return true;
  return tesisHasDbValue(kategoriRaw, tip.db_value);
}

const SORT_MESAFE = "📍 Mesafeye Göre";

/** Ana sayfa `filterSort` indeksi → arama `sortVal` */
const SIRA_PARAM_TO_SORT: Record<number, string> = {
  0: "📌 Önerilen",
  1: "💰 Fiyat: Düşük → Yüksek",
  2: "💰 Fiyat: Yüksek → Düşük",
  3: "⭐ Puana Göre",
};

/** Ana sayfa FEATURE_OPTS indeksi → `tesisler.ozellikler` anahtarı (yoksa null) */
const OZELLIK_INDEX_TO_KEY: (string | null)[] = [
  "havuz",
  "wifi",
  "deniz",
  "restoran",
  "bar",
  null,
  "otopark",
  "taksi",
];

function parseOzelliklerField(v: unknown): string[] | null {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string" && v.trim()) {
    try {
      const p = JSON.parse(v) as unknown;
      if (Array.isArray(p)) return p.map((x) => String(x).trim()).filter(Boolean);
    } catch {
      /* ignore */
    }
  }
  return null;
}

function minScoreFromPuanParam(puanParam: string | null): number | null {
  if (!puanParam) return null;
  const idx = Number.parseInt(puanParam, 10);
  if (idx === 1) return 3;
  if (idx === 2) return 4;
  if (idx === 3) return 4.5;
  return null;
}

function parseTesisCoord(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** İki nokta arası mesafe (km) — Haversine */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type Card = {
  id: string;
  name: string;
  slug?: string;
  score: number | null;
  /** Ham `tesisler.kategori` (string | string[]) — filtre için */
  kategoriRaw: unknown;
  cat: string;
  sehir: string;
  stars: number;
  rev: number | null;
  loc: string;
  dist: string;
  enlem: number | null;
  boylam: number | null;
  /** km; yalnızca GPS modunda dolu */
  distanceKm: number | null;
  feats: string[];
  /** `tesisler.ozellikler` — kolon yoksa null */
  ozellikler: string[] | null;
  price: number | null;
  avail: string;
  availTxt: string;
  badge: string;
  badgeTxt: string;
  img: string;
  aktif: boolean | null;
};

function tesisRowImage(t: Record<string, unknown>): string {
  const fotos = t.fotograflar;
  if (Array.isArray(fotos) && fotos.length > 0 && fotos[0] && typeof fotos[0] === "object" && fotos[0] !== null) {
    const src = (fotos[0] as { src?: string }).src;
    if (typeof src === "string" && src.trim()) return src;
  }
  return "/logo.png";
}

function tesisRowPrice(t: Record<string, unknown>): number | null {
  for (const k of ["gunluk_fiyat", "baslangic_fiyat", "min_fiyat", "fiyat", "sezlong_fiyat"] as const) {
    const v = t[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = parseFloat(String(v).replace(",", "."));
      if (!Number.isNaN(n) && Number.isFinite(n)) return n;
    }
  }
  return null;
}

function AramaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [navUser, setNavUser] = useState<{ name: string } | null>(null);

  const [locInput, setLocInput] = useState("");
  const [gpsOn, setGpsOn] = useState(false);
  const [km, setKm] = useState(10);
  const [typeVal, setTypeVal] = useState("");
  const [dateVal, setDateVal] = useState("");
  const [kisiVal, setKisiVal] = useState("2 Kişi");
  const [sortVal, setSortVal] = useState("Önerilen");
  const [viewMode, setViewMode] = useState<"list"|"grid">("list");
  const [fpOpen, setFpOpen] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>(TUMU_TAB_KEY);
  const [aktifTipler, setAktifTipler] = useState<AktifTesisTipi[]>([]);
  const [filterBadge, setFilterBadge] = useState(0);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(5000);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [loading, setLoading] = useState(true);
  const [siteLang, setSiteLang] = useState<SiteLang>(() =>
    typeof window !== "undefined" ? readSiteLangFromStorage() : "tr"
  );

  useEffect(() => {
    const sync = () => setSiteLang(readSiteLangFromStorage());
    sync();
    window.addEventListener("myloungers_langchange", sync);
    return () => window.removeEventListener("myloungers_langchange", sync);
  }, []);

  useEffect(() => {
    async function fetchAktifTipler() {
      const { data, error } = await supabase
        .from("tesis_tipleri")
        .select("id, slug, ad, db_value, sira, ikon, yer_etiketi")
        .eq("aktif", true)
        .order("sira", { ascending: true });

      if (error) {
        console.error("[arama] tesis_tipleri sorgu hatası:", error);
        return;
      }
      setAktifTipler((data ?? []) as AktifTesisTipi[]);
    }

    void fetchAktifTipler();
  }, []);

  useEffect(() => {
    async function fetchTesisler() {
      const { data, error } = await supabase
        .from("tesisler")
        .select("*")
        .eq("aktif", true);

      if (error) {
        console.error("Supabase 'tesisler' sorgu hatası:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setCards(
          data.map((t: Record<string, unknown>) => {
            const puanNum = Number(t.puan);
            const score = Number.isFinite(puanNum) ? puanNum : null;
            const stars = score !== null ? Math.min(5, Math.max(0, Math.round(score / 2))) : 0;
            const yorumRaw = t.yorum_sayisi;
            const rev =
              typeof yorumRaw === "number" && Number.isFinite(yorumRaw)
                ? yorumRaw
                : null;
            const aktif = typeof t.aktif === "boolean" ? t.aktif : null;
            const ilce = String(t.ilce ?? "").trim();
            const sehir = String(t.sehir ?? "").trim();
            const loc = [ilce, sehir].filter(Boolean).join(", ") || "";
            const price = tesisRowPrice(t);
            return {
              id: String(t.id),
              name: String(t.ad ?? ""),
              slug: typeof t.slug === "string" ? t.slug : undefined,
              score,
              kategoriRaw: t.kategori,
              cat: normalizeKategoriList(t.kategori).join(", ") || "—",
              sehir,
              stars,
              rev,
              loc,
              dist: "",
              enlem: parseTesisCoord(t.enlem),
              boylam: parseTesisCoord(t.boylam),
              distanceKm: null,
              feats: [],
              ozellikler: parseOzelliklerField(t.ozellikler),
              price,
              avail: aktif === false ? "full" : "ok",
              availTxt: aktif === false ? "Kapalı" : "—",
              badge: "",
              badgeTxt: "",
              img: tesisRowImage(t),
              aktif,
            };
          })
        );
      }

      setLoading(false);
    }

    fetchTesisler();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadNavUser() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) {
        if (!cancelled) setNavUser(null);
        return;
      }
      let { data: k } = await supabase
        .from("kullanicilar")
        .select("ad, soyad, email")
        .eq("id", user.id)
        .maybeSingle();
      if (!k && user.email) {
        const r = await supabase
          .from("kullanicilar")
          .select("ad, soyad, email")
          .eq("email", user.email)
          .maybeSingle();
        k = r.data;
      }
      const name =
        k?.ad && k?.soyad
          ? `${k.ad} ${k.soyad}`
          : k?.ad || k?.email || user.email?.split("@")[0] || "Kullanıcı";
      if (!cancelled) setNavUser({ name });
    }
    loadNavUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadNavUser();
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const konum = searchParams.get("konum");
    const tip = searchParams.get("tip");
    const tarih = searchParams.get("tarih");
    const gps = searchParams.get("gps");
    const kmParam = searchParams.get("km");
    const sira = searchParams.get("sira");
    const fiyatMinParam = searchParams.get("fiyatMin");
    const fiyatMaxParam = searchParams.get("fiyatMax");

    if (gps === "1") {
      setGpsOn(true);
      if (!sira) setSortVal(SORT_MESAFE);
      if (kmParam) {
        const kmNum = Number.parseInt(kmParam, 10);
        if (Number.isFinite(kmNum) && kmNum >= 1 && kmNum <= 50) setKm(kmNum);
      }
    } else if (konum) {
      setLocInput(konum);
      setActiveTags([`📍 ${konum}`]);
    }
    if (sira) {
      const siraIdx = Number.parseInt(sira, 10);
      if (Number.isFinite(siraIdx) && SIRA_PARAM_TO_SORT[siraIdx]) {
        setSortVal(SIRA_PARAM_TO_SORT[siraIdx]);
      }
    }
    if (fiyatMinParam) {
      const n = Number.parseInt(fiyatMinParam, 10);
      if (Number.isFinite(n) && n >= 0) setPriceMin(n);
    } else {
      setPriceMin(0);
    }
    if (fiyatMaxParam) {
      const n = Number.parseInt(fiyatMaxParam, 10);
      if (Number.isFinite(n) && n > 0) setPriceMax(n);
    } else {
      setPriceMax(5000);
    }
    if (tarih) setDateVal(tarih);
    if (tip) {
      setTypeVal(tip);
      const tipNorm = tip.trim().toLowerCase();
      const matched = aktifTipler.find((t) => t.slug.toLowerCase() === tipNorm);
      setActiveTab(matched ? matched.slug : TUMU_TAB_KEY);
    } else {
      setTypeVal("");
      setActiveTab(TUMU_TAB_KEY);
    }
  }, [searchParams, aktifTipler]);

  const ozellikParam = searchParams.get("ozellik");
  const requiredOzellikKeys = useMemo(() => {
    if (!ozellikParam?.trim()) return [];
    return ozellikParam
      .split(",")
      .map((s) => Number.parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n))
      .map((idx) => OZELLIK_INDEX_TO_KEY[idx])
      .filter((k): k is string => typeof k === "string" && k.length > 0);
  }, [ozellikParam]);

  const ozellikColumnAvailable = useMemo(
    () => cards.some((c) => c.ozellikler != null),
    [cards],
  );

  useEffect(() => {
    if (requiredOzellikKeys.length > 0 && !ozellikColumnAvailable) {
      console.info("[arama] özellik kolonu yok — ozellik filtresi atlandı");
    }
  }, [requiredOzellikKeys, ozellikColumnAvailable]);

  useEffect(() => {
    if (searchParams.get("gps") !== "1") {
      setGpsStatus("idle");
      setUserCoords(null);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("error");
      setUserCoords(null);
      setActiveTags(["📍 Konum alınamadı"]);
      return;
    }

    let cancelled = false;
    setGpsStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus("ready");
        setActiveTags(["📍 GPS Konumu"]);
      },
      () => {
        if (cancelled) return;
        setGpsStatus("error");
        setUserCoords(null);
        setActiveTags(["📍 Konum alınamadı"]);
      },
      { timeout: 10000, enableHighAccuracy: false },
    );

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const handleAraClick = useCallback(() => {
    const params = new URLSearchParams();
    if (gpsOn) {
      params.set("gps", "1");
      params.set("km", String(km));
    } else if (locInput.trim()) {
      params.set("konum", locInput.trim());
    }
    if (typeVal) params.set("tip", typeVal);
    if (dateVal) params.set("tarih", dateVal);
    const qs = params.toString();
    router.push(qs ? `/arama?${qs}` : "/arama");
  }, [gpsOn, locInput, typeVal, dateVal, km, router]);

  function toggleGPS() {
    setGpsOn(!gpsOn);
    if (!gpsOn) setLocInput("");
  }

  function toggleFav(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setFavs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const gpsMode = searchParams.get("gps") === "1";

  const cardsForList = useMemo(() => {
    if (!gpsMode || gpsStatus !== "ready" || !userCoords) {
      return cards;
    }
    return cards.map((c) => {
      if (c.enlem == null || c.boylam == null) {
        return { ...c, dist: "", distanceKm: null };
      }
      const distanceKm = haversineKm(userCoords.lat, userCoords.lng, c.enlem, c.boylam);
      return {
        ...c,
        distanceKm,
        dist: distanceKm.toFixed(1),
      };
    });
  }, [cards, gpsMode, gpsStatus, userCoords]);

  const puanParam = searchParams.get("puan");
  const minScoreFilter = minScoreFromPuanParam(puanParam);

  const filtered = useMemo(() => {
    let list = cardsForList
      .filter((c) => matchesAramaTab(activeTab, c.kategoriRaw, aktifTipler))
      .filter((c) => {
        if (c.price == null) return true;
        return c.price >= priceMin && c.price <= priceMax;
      });

    if (minScoreFilter != null) {
      list = list.filter((c) => c.score != null && c.score >= minScoreFilter);
    }

    if (ozellikColumnAvailable && requiredOzellikKeys.length > 0) {
      list = list.filter((c) => {
        const oz = c.ozellikler;
        if (!oz?.length) return false;
        const set = new Set(oz.map((x) => x.toLowerCase()));
        return requiredOzellikKeys.every((k) => set.has(k.toLowerCase()));
      });
    }

    if (gpsMode && gpsStatus === "ready" && userCoords) {
      const radiusKm = Math.max(1, Math.min(50, km));
      list = list.filter((c) => c.distanceKm == null || c.distanceKm <= radiusKm);
    }

    if (sortVal === SORT_MESAFE && gpsMode && gpsStatus === "ready" && userCoords) {
      list = [...list].sort((a, b) => {
        const da = a.distanceKm;
        const db = b.distanceKm;
        if (da == null && db == null) return 0;
        if (da == null) return 1;
        if (db == null) return -1;
        return da - db;
      });
    } else if (sortVal === "⭐ Puana Göre") {
      list = [...list].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    } else if (sortVal === "💰 Fiyat: Düşük → Yüksek") {
      list = [...list].sort((a, b) => {
        const pa = a.price ?? Number.POSITIVE_INFINITY;
        const pb = b.price ?? Number.POSITIVE_INFINITY;
        return pa - pb;
      });
    } else if (sortVal === "💰 Fiyat: Yüksek → Düşük") {
      list = [...list].sort((a, b) => {
        const pa = a.price ?? -1;
        const pb = b.price ?? -1;
        return pb - pa;
      });
    } else if (sortVal === "💬 Yorum Sayısı") {
      list = [...list].sort((a, b) => (b.rev ?? 0) - (a.rev ?? 0));
    }

    return list;
  }, [
    cardsForList,
    activeTab,
    aktifTipler,
    priceMin,
    priceMax,
    minScoreFilter,
    ozellikColumnAvailable,
    requiredOzellikKeys,
    gpsMode,
    gpsStatus,
    userCoords,
    km,
    sortVal,
  ]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { [TUMU_TAB_KEY]: cards.length };
    for (const tip of aktifTipler) {
      counts[tip.slug] = cards.filter((card) => tesisHasDbValue(card.kategoriRaw, tip.db_value)).length;
    }
    return counts;
  }, [cards, aktifTipler]);

  const yerEtiketiHaritasi = useMemo(
    () => buildYerEtiketiHaritasi(aktifTipler),
    [aktifTipler],
  );

  const TABS = useMemo(() => {
    const tumuLabel = siteLang === "en" ? "All" : TUMU_TAB_KEY;
    const tumuTab = {
      key: TUMU_TAB_KEY,
      label: `🏖️ ${tumuLabel}`,
      count: tabCounts[TUMU_TAB_KEY] ?? cards.length,
    };
    const tipTabs = aktifTipler.map((tip) => ({
      key: tip.slug,
      label: `${tip.ikon?.trim() || "🏷️"} ${tip.ad}`,
      count: tabCounts[tip.slug] ?? 0,
    }));
    return [tumuTab, ...tipTabs];
  }, [aktifTipler, tabCounts, siteLang, cards.length]);

  const uniqueCities = useMemo(() => {
    const s = new Set<string>();
    cards.forEach((c) => {
      if (c.sehir.trim()) s.add(c.sehir.trim());
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b, "tr"));
  }, [cards]);

  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <img src="/logo.png" alt="MyLoungers" style={{ height: 44, width: "auto" }} />
        </Link>
        <Link href="/" className="nav-back">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Ana Sayfa
        </Link>
        <span style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {navUser ? (
            <>
              <Link
                href="/profil"
                style={{
                  fontSize: ".8rem",
                  fontWeight: 600,
                  color: "var(--i2)",
                  textDecoration: "none",
                }}
              >
                {navUser.name}
              </Link>
              <button
                style={{ padding: "7px 16px", border: "none", borderRadius: 50, fontSize: ".78rem", fontWeight: 700, color: "#fff", background: "var(--or)", cursor: "pointer" }}
                onClick={() => void supabase.auth.signOut()}
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link href="/profil" style={{ padding: "7px 16px", border: "1.5px solid var(--bd)", borderRadius: 50, fontSize: ".78rem", fontWeight: 700, color: "var(--i2)", background: "#fff", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Profilim</Link>
              <button
                style={{ padding: "7px 16px", border: "none", borderRadius: 50, fontSize: ".78rem", fontWeight: 700, color: "#fff", background: "var(--or)", cursor: "pointer" }}
                onClick={() => router.push("/giris")}
              >
                Giriş Yap
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-wrap">
          <div className="hero-title">🔍 Tesis Ara</div>
          <div className="hero-sub">Beach club, hotel ve aqua park — Türkiye geneli</div>
        </div>
      </div>

      {/* SEARCH BAR — beyaz kart toolbar */}
      <div className="arama-srch-wrap">
        <div className="arama-srch-in">
          <SearchBar
            locInput={locInput}
            onLocInputChange={setLocInput}
            gpsOn={gpsOn}
            onToggleGPS={toggleGPS}
            typeVal={typeVal}
            onTypeValChange={setTypeVal}
            dateVal={dateVal}
            onDateValChange={setDateVal}
            kisiVal={kisiVal}
            onKisiValChange={setKisiVal}
            km={km}
            onKmChange={setKm}
            onSearch={handleAraClick}
          />
        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        <div className="tabs-inner">
          {TABS.map(t => (
            <div key={t.key} className={`tab${activeTab === t.key ? " on" : ""}`} onClick={() => setActiveTab(t.key)}>
              {t.label}{t.count !== null ? ` (${t.count})` : ""}
            </div>
          ))}
        </div>
      </div>

      {/* SAYFA */}
      <div className="page">
        <div className="rbar">
          <div className="rbar-info"><b>{filtered.length}</b> tesis listeleniyor</div>
          <button className="filter-open-btn" onClick={() => setFpOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            Filtrele
            {filterBadge > 0 && <div className="filter-badge">{filterBadge}</div>}
          </button>
          <select className="sort-sel" value={sortVal} onChange={e => setSortVal(e.target.value)}>
            {["📌 Önerilen","⭐ Puana Göre","💰 Fiyat: Düşük → Yüksek","💰 Fiyat: Yüksek → Düşük",SORT_MESAFE,"💬 Yorum Sayısı"].map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="view-btns">
            <button className={`vbtn${viewMode==="list"?" on":""}`} onClick={() => setViewMode("list")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
            <button className={`vbtn${viewMode==="grid"?" on":""}`} onClick={() => setViewMode("grid")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
          </div>
        </div>

        {activeTags.length > 0 && (
          <div className="af-wrap">
            {activeTags.map(t => (
              <div key={t} className="af-tag" onClick={() => setActiveTags(prev => prev.filter(x => x !== t))}>
                {t} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
            ))}
          </div>
        )}

        <div className={`cards${viewMode==="grid"?" grid":""}`}>
          {loading && <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8", fontSize: ".9rem" }}>Tesisler yükleniyor…</div>}
          {!loading && filtered.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8", fontSize: ".9rem" }}>Tesis bulunamadı</div>}
          {filtered.map((c) => {
            const birim = getSeatUnitLabelDinamik(c.kategoriRaw, yerEtiketiHaritasi);
            const birimLower = birim.toLocaleLowerCase("tr-TR");
            return (
            <div
              key={c.id}
              className="card"
              onClick={() => {
                // Slug varsa onu kullan, yoksa id ile fallback
                const targetSlug = c.slug || c.id;
                router.push(`/tesis/${targetSlug}`);
              }}
            >
              <div className="card-img">
                <img src={c.img} alt={c.name} />
                {c.badge && <span className={`card-badge badge-${c.badge}`}>{c.badgeTxt}</span>}
                <button className="card-fav" onClick={e => toggleFav(c.id, e)}>{favs.has(c.id) ? "❤️" : "🤍"}</button>
              </div>
              <div className="card-body">
                <div className="card-top">
                  <div className="card-name">{c.name}</div>
                  <div className="card-score">{c.score !== null ? c.score.toFixed(1) : "—"}</div>
                </div>
                <div className="card-meta">
                  <span className="card-cat">{c.cat}</span>
                  {c.score !== null && (
                    <span className="card-stars">{"★".repeat(c.stars)}{"☆".repeat(5 - c.stars)}</span>
                  )}
                  {c.rev !== null && c.rev > 0 && <span className="card-rev">{c.rev} yorum</span>}
                </div>
                <div className="card-loc">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {c.loc || "—"}
                  {c.dist ? <span className="card-dist">📍 {c.dist} km</span> : null}
                </div>
                <div className="card-feats">{c.feats.map(f => <span key={f} className="card-feat">{f}</span>)}</div>
                <div className="card-footer">
                  <div>
                    <div className="card-price-from">başlangıç</div>
                    <div className="card-price-val">{c.price !== null ? `₺${c.price.toLocaleString("tr-TR")}` : "—"}</div>
                    <div className="card-price-unit">/ {birimLower} / gün</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    {typeof c.aktif === "boolean" && (
                      <div className={`avail ${c.avail}`}>
                        <div className={`avail-dot dot-${c.avail}`} />
                        {c.avail === "ok" ? "✓" : c.avail === "few" ? "⚡" : "✗"} {c.availTxt}
                      </div>
                    )}
                    <button
                      className="card-btn"
                      disabled={c.avail === "full"}
                      onClick={e => {
                        e.stopPropagation();
                        const targetSlug = c.slug || c.id;
                        router.push(`/tesis/${targetSlug}`);
                      }}
                    >
                      {c.avail === "full" ? "Dolu" : `${birim} Seç →`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

      </div>

      {/* FİLTRE PANELİ */}
      {fpOpen && <div className="fp-overlay" onClick={() => setFpOpen(false)} />}
      {fpOpen && (
        <div className="fp">
          <div className="fp-head">
            <span className="fp-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              Filtreler
            </span>
            <button className="fp-close" onClick={() => setFpOpen(false)}>✕</button>
          </div>
          <div className="fp-body">
            <div className="fg">
              <div className="fg-title">🏙️ Şehir</div>
              {uniqueCities.length === 0 ? (
                <div style={{ fontSize: ".78rem", color: "var(--i3)" }}>Liste yüklenince şehirler burada görünür.</div>
              ) : (
                uniqueCities.map((city) => (
                  <label key={city} className="fc">
                    <input type="checkbox" readOnly />
                    <span className="fc-lbl">{city}</span>
                    <span className="fc-cnt">{cards.filter((c) => c.sehir === city).length}</span>
                  </label>
                ))
              )}
            </div>
            <div className="fg">
              <div className="fg-title">🏖️ Tesis Tipi</div>
              {aktifTipler.length === 0 ? (
                <div style={{ fontSize: ".78rem", color: "var(--i3)" }}>Tesis tipleri yüklenince burada görünür.</div>
              ) : (
                aktifTipler.map((tip) => (
                  <label key={tip.slug} className="fc">
                    <input type="checkbox" readOnly />
                    <span className="fc-lbl">{tip.ad}</span>
                    <span className="fc-cnt">{tabCounts[tip.slug] ?? 0}</span>
                  </label>
                ))
              )}
            </div>
            <div className="fg">
              <div className="fg-title">💰 Max Fiyat / Gün</div>
              <input type="range" className="frange" min={200} max={5000} step={100} value={priceMax} onChange={e => setPriceMax(+e.target.value)} />
              <div className="frange-vals"><span>₺200</span><span>₺{priceMax.toLocaleString("tr-TR")}</span></div>
            </div>
          </div>
          <div className="fp-footer">
            <button className="fp-clear" onClick={() => { setPriceMax(5000); setFpOpen(false); }}>✕ Temizle</button>
            <button className="fp-apply" onClick={() => setFpOpen(false)}>Sonuçları Gör →</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function AramaPage() {
  return (
    <Suspense fallback={null}>
      <AramaContent />
    </Suspense>
  );
}
