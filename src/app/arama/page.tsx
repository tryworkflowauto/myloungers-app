"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "./arama.css";

const SearchBar = dynamic(() => import("./SearchBar"), { ssr: false });

const CARDS = [
  { id:1, name:"Zuzuu Beach Hotel", score:9.6, cat:"Beach Club", stars:4, rev:128, loc:"Bodrum, Muğla", dist:"2.4", feats:["Özel İskele","Havuz","Beach Bar","Vale Park"], price:1000, avail:"ok", availTxt:"23 şezlong müsait", badge:"top", badgeTxt:"TOP 10", img:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&fit=crop" },
  { id:2, name:"Marmaris Beach Resort", score:9.2, cat:"Beach Club", stars:5, rev:94, loc:"Marmaris, Muğla", dist:"1.1", feats:["Deniz Manzarası","Restoran","Su Sporları"], price:850, avail:"few", availTxt:"8 şezlong kaldı", badge:"pop", badgeTxt:"Popüler", img:"https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&fit=crop" },
  { id:3, name:"Fethiye Paradise Club", score:9.0, cat:"Beach Club", stars:4, rev:47, loc:"Fethiye, Muğla", dist:"5.2", feats:["Özel Plaj","Havuz","Spa"], price:750, avail:"ok", availTxt:"41 şezlong müsait", badge:"new", badgeTxt:"Yeni", img:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&fit=crop" },
  { id:4, name:"Bodrum Luxury Suites", score:9.4, cat:"Hotel", stars:5, rev:203, loc:"Bodrum, Muğla", dist:"3.8", feats:["Infinity Havuz","Spa","Özel Plaj"], price:1800, avail:"few", availTxt:"5 şezlong kaldı", badge:"top", badgeTxt:"TOP 10", img:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&fit=crop" },
  { id:5, name:"Antalya Sunset Beach", score:8.8, cat:"Beach Club", stars:4, rev:76, loc:"Antalya", dist:"0.8", feats:["Özel Plaj","Beach Bar","Müzik"], price:650, avail:"ok", availTxt:"56 şezlong müsait", badge:"", badgeTxt:"", img:"https://images.unsplash.com/photo-1530538987395-032d1800fdd4?w=400&fit=crop" },
  { id:6, name:"Çeşme Aqua Resort", score:9.1, cat:"Aqua Park", stars:4, rev:31, loc:"Çeşme, İzmir", dist:"4.5", feats:["Su Parkı","Havuz","Çocuk Alanı"], price:550, avail:"full", availTxt:"Bu tarih dolu", badge:"new", badgeTxt:"Yeni", img:"https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&fit=crop" },
  { id:7, name:"Kuşadası Marina Hotel", score:8.9, cat:"Hotel", stars:5, rev:88, loc:"Kuşadası, Aydın", dist:"7.2", feats:["Marina Manzarası","Havuz","Restoran"], price:1200, avail:"ok", availTxt:"18 şezlong müsait", badge:"", badgeTxt:"", img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&fit=crop" },
  { id:8, name:"Kaş Panorama Beach", score:9.3, cat:"Beach Club", stars:4, rev:115, loc:"Kaş, Antalya", dist:"6.1", feats:["Kayalık Plaj","Dalış Merkezi"], price:900, avail:"few", availTxt:"12 şezlong kaldı", badge:"pop", badgeTxt:"Popüler", img:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&fit=crop" },
];

type Card = typeof CARDS[0];

function AramaContent() {
  const router = useRouter();

  const [locInput, setLocInput] = useState("");
  const [gpsOn, setGpsOn] = useState(false);
  const [km, setKm] = useState(10);
  const [typeVal, setTypeVal] = useState("");
  const [dateVal, setDateVal] = useState("");
  const [kisiVal, setKisiVal] = useState("2 Kişi");
  const [sortVal, setSortVal] = useState("Önerilen");
  const [viewMode, setViewMode] = useState<"list"|"grid">("list");
  const [fpOpen, setFpOpen] = useState(false);
  const [favs, setFavs] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState("Tümü");
  const [filterBadge, setFilterBadge] = useState(0);
  const [priceMax, setPriceMax] = useState(5000);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const konum = params.get("konum");
    const tip = params.get("tip");
    const tarih = params.get("tarih");
    const gps = params.get("gps");

    if (gps === "1") {
      setGpsOn(true);
      setActiveTags(["📍 GPS Konumu"]);
    } else if (konum) {
      setLocInput(konum);
      setActiveTags([`📍 ${konum}`]);
    }
    if (tarih) setDateVal(tarih);
    if (tip) setTypeVal(tip);
  }, []);

  function toggleGPS() {
    setGpsOn(!gpsOn);
    if (!gpsOn) setLocInput("");
  }

  function toggleFav(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setFavs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function getFilteredCards(): Card[] {
    let cards = [...CARDS];
    if (activeTab === "Beach Club") cards = cards.filter(c => c.cat === "Beach Club");
    else if (activeTab === "Hotel") cards = cards.filter(c => c.cat === "Hotel");
    else if (activeTab === "Aqua Park") cards = cards.filter(c => c.cat === "Aqua Park");
    cards = cards.filter(c => c.price <= priceMax);
    return cards;
  }

  const filtered = getFilteredCards();

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
          <Link href="/profil" style={{ padding: "7px 16px", border: "1.5px solid var(--bd)", borderRadius: 50, fontSize: ".78rem", fontWeight: 700, color: "var(--i2)", background: "#fff", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Profilim</Link>
          <button style={{ padding: "7px 16px", border: "none", borderRadius: 50, fontSize: ".78rem", fontWeight: 700, color: "#fff", background: "var(--or)", cursor: "pointer" }}>Giriş Yap</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-wrap">
          <div className="hero-title">🔍 Tesis Ara</div>
          <div className="hero-sub">Beach club, hotel ve aqua park — Türkiye geneli</div>
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
          {filtered.map(c => (
            <div key={c.id} className="card" onClick={() => router.push("/hotel/slug")}>
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
                    <button className="card-btn" disabled={c.avail==="full"} onClick={e => { e.stopPropagation(); router.push("/hotel/slug"); }}>
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
