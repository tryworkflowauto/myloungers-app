"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "./arama.css";
import { supabase } from "@/lib/supabase";
import { aramaTabMatchesKategori, normalizeKategoriList } from "@/lib/tesisKategori";

const SearchBar = dynamic(() => import("./SearchBar"), { ssr: false });

/** Ana sayfa `data-cat` / arama `tip` sorgusu → sekme; `tesisler.kategori` ile eşleşir */
const TIP_QUERY_TO_TAB: Record<string, string> = {
  hotel: "Hotel",
  beach: "Beach Club",
  aqua: "Aqua Park",
};

type Card = {
  id: string;
  name: string;
  slug?: string;
  score: number;
  /** Ham `tesisler.kategori` (string | string[]) — filtre için */
  kategoriRaw: unknown;
  cat: string;
  stars: number;
  rev: number;
  loc: string;
  dist: string;
  feats: string[];
  price: number;
  avail: string;
  availTxt: string;
  badge: string;
  badgeTxt: string;
  img: string;
};

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
  const [activeTab, setActiveTab] = useState("Tümü");
  const [filterBadge, setFilterBadge] = useState(0);
  const [priceMax, setPriceMax] = useState(5000);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTesisler() {
      const { data, error } = await supabase
        .from("tesisler")
        .select("*");

      if (error) {
        console.error("Supabase 'tesisler' sorgu hatası:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setCards(
          data.map((t: Record<string, unknown>) => ({
            id: String(t.id),
            name: String(t.ad),
            slug: typeof t.slug === "string" ? t.slug : undefined,
            score: Number(t.puan) || 9.0,
            kategoriRaw: t.kategori,
            cat: normalizeKategoriList(t.kategori).join(", ") || "—",
            stars: 4,
            rev: 0,
            loc: `${t.ilce ?? ""}, ${t.sehir ?? ""}`,
            dist: "–",
            feats: [],
            price: 1000,
            avail: "ok",
            availTxt: "Müsait",
            badge: "",
            badgeTxt: "",
            img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&fit=crop",
          }))
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

    if (gps === "1") {
      setGpsOn(true);
      setActiveTags(["📍 GPS Konumu"]);
    } else if (konum) {
      setLocInput(konum);
      setActiveTags([`📍 ${konum}`]);
    }
    if (tarih) setDateVal(tarih);
    if (tip) {
      setTypeVal(tip);
      const tab = TIP_QUERY_TO_TAB[tip.toLowerCase()];
      if (tab) setActiveTab(tab);
    } else {
      setTypeVal("");
      setActiveTab("Tümü");
    }
  }, [searchParams]);

  function toggleGPS() {
    setGpsOn(!gpsOn);
    if (!gpsOn) setLocInput("");
  }

  function toggleFav(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setFavs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function getFilteredCards(): Card[] {
    let result = cards.filter((c) => aramaTabMatchesKategori(activeTab, c.kategoriRaw));
    result = result.filter((c) => c.price <= priceMax);
    return result;
  }

  const filtered = cards
    .filter((c) => aramaTabMatchesKategori(activeTab, c.kategoriRaw))
    .filter((c) => c.price <= priceMax);

  const TABS = [
    { label: "🏖️ Tümü", key: "Tümü", count: 8 },
    { label: "🌊 Beach Club", key: "Beach Club", count: 5 },
    { label: "🏨 Hotel", key: "Hotel", count: 2 },
    { label: "💦 Aqua Park", key: "Aqua Park", count: 1 },
    { label: "🏕️ Tatil Köyü", key: "Tatil Köyü", count: 0 },
    { label: "🗺️ Harita", key: "Harita", count: null },
  ];

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
            {["📌 Önerilen","⭐ Puana Göre","💰 Fiyat: Düşük → Yüksek","💰 Fiyat: Yüksek → Düşük","📍 Mesafeye Göre","💬 Yorum Sayısı"].map(s => <option key={s}>{s}</option>)}
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
          {filtered.map(c => (
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
                  <div className="card-score">{c.score}</div>
                </div>
                <div className="card-meta">
                  <span className="card-cat">{c.cat}</span>
                  <span className="card-stars">{"★".repeat(c.stars)}{"☆".repeat(5-c.stars)}</span>
                  <span className="card-rev">{c.rev} yorum</span>
                </div>
                <div className="card-loc">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {c.loc}<span className="card-dist">📍 {c.dist} km</span>
                </div>
                <div className="card-feats">{c.feats.map(f => <span key={f} className="card-feat">{f}</span>)}</div>
                <div className="card-footer">
                  <div>
                    <div className="card-price-from">başlangıç</div>
                    <div className="card-price-val">₺{c.price.toLocaleString("tr-TR")}</div>
                    <div className="card-price-unit">/ şezlong / gün</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <div className={`avail ${c.avail}`}>
                      <div className={`avail-dot dot-${c.avail}`} />
                      {c.avail==="ok" ? "✓" : c.avail==="few" ? "⚡" : "✗"} {c.availTxt}
                    </div>
                    <button
                      className="card-btn"
                      disabled={c.avail==="full"}
                      onClick={e => {
                        e.stopPropagation();
                        const targetSlug = c.slug || c.id;
                        router.push(`/tesis/${targetSlug}`);
                      }}
                    >
                      {c.avail==="full" ? "Dolu" : "Şezlong Seç →"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button className="pg-btn">&#8249;</button>
          {[1,2,3].map(n => <button key={n} className={`pg-btn${n===1?" on":""}`}>{n}</button>)}
          <span style={{ color: "var(--i3)", fontSize: ".8rem", padding: "0 6px" }}>...</span>
          <button className="pg-btn">12</button>
          <button className="pg-btn">&#8250;</button>
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
              {[["Bodrum","3"],["Marmaris","1"],["Fethiye","1"],["Antalya","1"],["Çeşme","1"],["Kuşadası","1"]].map(([city, cnt]) => (
                <label key={city} className="fc"><input type="checkbox" /><span className="fc-lbl">{city}</span><span className="fc-cnt">{cnt}</span></label>
              ))}
            </div>
            <div className="fg">
              <div className="fg-title">🏖️ Tesis Tipi</div>
              {[["Beach Club","5"],["Hotel","2"],["Aqua Park","1"],["Tatil Köyü","0"]].map(([t,c]) => (
                <label key={t} className="fc"><input type="checkbox" /><span className="fc-lbl">{t}</span><span className="fc-cnt">{c}</span></label>
              ))}
            </div>
            <div className="fg">
              <div className="fg-title">✅ Müsaitlik</div>
              <label className="fc"><input type="checkbox" /><span className="fc-lbl">Müsait</span><span className="fc-cnt">5</span></label>
              <label className="fc"><input type="checkbox" /><span className="fc-lbl">Az yer kaldı</span><span className="fc-cnt">3</span></label>
            </div>
            <div className="fg">
              <div className="fg-title">💰 Max Fiyat / Gün</div>
              <input type="range" className="frange" min={200} max={5000} step={100} value={priceMax} onChange={e => setPriceMax(+e.target.value)} />
              <div className="frange-vals"><span>₺200</span><span>₺{priceMax.toLocaleString("tr-TR")}</span></div>
            </div>
            <div className="fg">
              <div className="fg-title">⭐ Min Puan</div>
              <div className="ftags">
                {["8.0+","8.5+","9.0+","9.5+"].map(p => <button key={p} className="ftag">{p}</button>)}
              </div>
            </div>
            <div className="fg">
              <div className="fg-title">🏊 Özellikler</div>
              <div className="ftags">
                {["📶 Wi-Fi","🏊 Havuz","🍽️ Restoran","⛱️ Şemsiye","🌊 Denize sıfır","🍹 Bar","💆 Spa","🚗 Vale Park","🤿 Su Sporları","✈️ HVL Transfer"].map(f => (
                  <button key={f} className="ftag">{f}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="fp-footer">
            <button className="fp-clear" onClick={() => { setPriceMax(5000); setFpOpen(false); }}>✕ Temizle</button>
            <button className="fp-apply" onClick={() => setFpOpen(false)}>Sonuçları Gör →</button>
          </div>
        </div>
      )}

      {/* HARİTA FAB */}
      <button className="map-fab" onClick={() => alert("🗺️ Harita görünümü yakında!")}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
        Harita Görünümü
      </button>
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
