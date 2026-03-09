"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import "./myloungers.css";

const SLIDER_IMGS = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=600&fit=crop",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&h=600&fit=crop",
  "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1920&h=600&fit=crop",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920&h=600&fit=crop",
  "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=1920&h=600&fit=crop",
];

const CAT_IMGS = [
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=400&fit=crop",
];

const TESIS_IMGS = [
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop",
];

const ILLER: Record<string, string[]> = {
  Adana: ["Seyhan", "Çukurova", "Yüreğir"],
  Ankara: ["Çankaya", "Keçiören", "Mamak", "Etimesgut"],
  Antalya: ["Muratpaşa", "Konyaaltı", "Alanya", "Manavgat", "Kemer", "Belek"],
  Muğla: ["Bodrum", "Yalıkavak", "Marmaris", "Fethiye", "Datça", "Milas"],
  İzmir: ["Konak", "Çeşme", "Karşıyaka", "Bornova"],
  Aydın: ["Didim", "Kuşadası", "Söke"],
};

const TESISLER = [
  { name: "Zuzuu Beach Hotel", il: "Bodrum (Muğla)", ilce: "Yalıkavak", type: "hotel" },
  { name: "Marmaris Aqua Resort", il: "Marmaris (Muğla)", ilce: "İçmeler", type: "aqua" },
  { name: "Fethiye Paradise Beach", il: "Fethiye (Muğla)", ilce: "Ölüdeniz", type: "beach" },
  { name: "Bodrum Blue Bay Hotel", il: "Bodrum (Muğla)", ilce: "Gümbet", type: "hotel" },
];

const LANG_OPTS = [
  { code: "TR", flag: "🇹🇷", name: "Türkçe" },
  { code: "EN", flag: "🇬🇧", name: "English" },
];

export default function Home() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState(LANG_OPTS[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [basvuruOpen, setBasvuruOpen] = useState(false);
  const [bmPane, setBmPane] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");
  const [srchRegion, setSrchRegion] = useState("");
  const [srchType, setSrchType] = useState("");
  const [srchDate, setSrchDate] = useState("");
  const [srchName, setSrchName] = useState("");
  const [panelRegion, setPanelRegion] = useState(false);
  const [panelType, setPanelType] = useState(false);
  const [panelDate, setPanelDate] = useState(false);
  const [panelName, setPanelName] = useState(false);
  const [activeIl, setActiveIl] = useState("");
  const [activeIlce, setActiveIlce] = useState("");
  const [ilSearch, setIlSearch] = useState("");
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlideIdx((s) => (s + 1) % SLIDER_IMGS.length), 5500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const start = Date.now();
    const dur = 5500;
    const step = () => {
      const p = Math.min(((Date.now() - start) / dur) * 100, 100);
      setBarWidth(p);
      if (p < 100) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [slideIdx]);

  const openPanel = useCallback((p: "region" | "type" | "date" | "name") => {
    setPanelRegion(p === "region");
    setPanelType(p === "type");
    setPanelDate(p === "date");
    setPanelName(p === "name");
  }, []);

  const closePanels = useCallback(() => {
    setPanelRegion(false);
    setPanelType(false);
    setPanelDate(false);
    setPanelName(false);
  }, []);

  const ilceler = activeIl && ILLER[activeIl] ? ILLER[activeIl] : [];
  const filteredIller = Object.keys(ILLER).filter((il) =>
    !ilSearch || il.toLowerCase().includes(ilSearch.toLowerCase())
  );

  return (
    <div>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-in">
          <Link href="/" className="logo-img-wrap">
            <img src="/logo.png" alt="MyLoungers" className="logo-img" />
          </Link>
          <div className="nav-cats">
            <button
              type="button"
              className={`nc ${activeCategory === "all" || activeCategory === "hotel" ? "on" : ""}`}
              onClick={() => setActiveCategory("hotel")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Hotel
            </button>
            <button
              type="button"
              className={`nc ${activeCategory === "beach" ? "on" : ""}`}
              onClick={() => setActiveCategory("beach")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              </svg>
              Beach Club
            </button>
            <button
              type="button"
              className={`nc ${activeCategory === "aqua" ? "on" : ""}`}
              onClick={() => setActiveCategory("aqua")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20" />
              </svg>
              Aqua Park
            </button>
            <button type="button" className="nc" onClick={() => setBasvuruOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
              Başvuru Formu
            </button>
          </div>
          <div className="nav-r">
            <div className={`lang-wrap ${langOpen ? "open" : ""}`}>
              <button
                type="button"
                className="lang-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setLangOpen(!langOpen);
                }}
              >
                <span className="flag">{lang.flag}</span>
                <span>{lang.code}</span>
                <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="lang-drop">
                {LANG_OPTS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={`lang-opt ${lang.code === l.code ? "active" : ""}`}
                    onClick={() => {
                      setLang(l);
                      setLangOpen(false);
                    }}
                  >
                    <span>{l.flag}</span>
                    <span className="lname">{l.name}</span>
                    {lang.code === l.code && <span className="lcheck">✓</span>}
                  </button>
                ))}
              </div>
            </div>
            <Link href="/giris" className="btn-login" id="btnLogin">Giriş Yap</Link>
            <Link href="/uye-ol" className="btn-signup" id="btnSignup">Üye Ol</Link>
          </div>
          <button
            type="button"
            className={`ham ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menü"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* MOB CATS */}
      <div className="mob-cats">
        <div className="mob-cats-in">
          <button type="button" className={`mcat ${activeCategory === "hotel" ? "on" : ""}`} onClick={() => setActiveCategory("hotel")}>Hotel</button>
          <button type="button" className={`mcat ${activeCategory === "beach" ? "on" : ""}`} onClick={() => setActiveCategory("beach")}>Beach Club</button>
          <button type="button" className={`mcat ${activeCategory === "aqua" ? "on" : ""}`} onClick={() => setActiveCategory("aqua")}>Aqua Park</button>
          <button type="button" className="mcat" onClick={() => setBasvuruOpen(true)}>Başvuru</button>
        </div>
      </div>

      {/* MOB MENU */}
      <div className={`mob-menu ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)}>
        <div className="mob-panel" onClick={(e) => e.stopPropagation()}>
          <div className="mob-panel-head">
            <img src="/logo.png" alt="MyLoungers" className="mob-panel-logo" />
            <button type="button" className="mob-close" onClick={() => setMenuOpen(false)}>×</button>
          </div>
          <div className="mob-btns">
            <button type="button" className="mob-btn-login">Giriş Yap</button>
            <button type="button" className="mob-btn-signup">Üye Ol</button>
          </div>
          <div className="mob-sec-title">Kategoriler</div>
          <button type="button" className="mob-link">Hotel</button>
          <button type="button" className="mob-link">Beach Club</button>
          <button type="button" className="mob-link">Aqua Park</button>
          <button type="button" className="mob-link" onClick={() => { setBasvuruOpen(true); setMenuOpen(false); }}>Başvuru Formu</button>
        </div>
      </div>

      {/* SLIDER */}
      <div className="bwrap" id="bwrap">
        {SLIDER_IMGS.map((src, i) => (
          <div key={i} className={`slide ${i === slideIdx ? "on" : ""}`}>
            <img src={src} alt="" className="slide-img" />
          </div>
        ))}
        <button type="button" className="sarr prev" id="sprev" onClick={() => setSlideIdx((s) => (s - 1 + SLIDER_IMGS.length) % SLIDER_IMGS.length)}>‹</button>
        <button type="button" className="sarr next" id="snext" onClick={() => setSlideIdx((s) => (s + 1) % SLIDER_IMGS.length)}>›</button>
        <div className="sdots">
          {SLIDER_IMGS.map((_, i) => (
            <button key={i} type="button" className={`dot ${i === slideIdx ? "on" : ""}`} onClick={() => setSlideIdx(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
        <div className="bprog">
          <div className="bbar" style={{ width: `${barWidth}%` }} />
        </div>
      </div>

      {/* BACKDROP */}
      <div className={`srch-backdrop ${panelRegion || panelType || panelDate || panelName ? "on" : ""}`} onClick={closePanels} />

      {/* SEARCH */}
      <div className="srch-wrap">
        <div className="srch-in" style={{ position: "relative" }}>
          <div className="srch-card">
            <div
              className={`sf ${panelRegion ? "active" : ""}`}
              data-panel="panelRegion"
              onClick={() => openPanel("region")}
              role="button"
              tabIndex={0}
            >
              <span className="sfl" id="sfl-region">Bölge</span>
              <span className={`sfv ${srchRegion ? "selected" : ""}`} id="sfv-region">{srchRegion || "Bodrum, Antalya, Marmaris..."}</span>
            </div>
            <div
              className={`sf ${panelType ? "active" : ""}`}
              data-panel="panelType"
              onClick={() => openPanel("type")}
              role="button"
              tabIndex={0}
            >
              <span className="sfl">Tesis Tipi</span>
              <span className={`sfv ${srchType ? "selected" : ""}`}>{srchType || "Hotel, Beach Club..."}</span>
            </div>
            <div
              className={`sf ${panelDate ? "active" : ""}`}
              data-panel="panelDate"
              onClick={() => openPanel("date")}
              role="button"
              tabIndex={0}
            >
              <span className="sfl">Tarih</span>
              <span className={`sfv ${srchDate ? "selected" : ""}`}>{srchDate || "Tarih seçin"}</span>
            </div>
            <div
              className={`sf ${panelName ? "active" : ""}`}
              data-panel="panelName"
              onClick={() => openPanel("name")}
              role="button"
              tabIndex={0}
            >
              <span className="sfl">Tesis Adı</span>
              <span className={`sfv ${srchName ? "selected" : ""}`}>{srchName || "Ara..."}</span>
            </div>
            <button
              type="button"
              className={`filter-btn ${filterOpen ? "active" : ""}`}
              onClick={() => setFilterOpen(true)}
            >
              <span className="filter-badge" style={{ display: "none" }}>0</span>
              <span>Filtre</span>
            </button>
            <button type="button" className="srch-btn">
              Tesis Ara
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </div>

          {/* Region panel */}
          <div className={`sf-panel ${panelRegion ? "open" : ""}`} id="panelRegion" style={{ position: "relative", top: 0, left: 0 }}>
            <div className="sf-panel-inn region-panel">
              <div className="region-cols">
                <div className="region-iller">
                  <div className="r-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                    <input type="text" placeholder="İl ara..." value={ilSearch} onChange={(e) => setIlSearch(e.target.value)} />
                  </div>
                  <div id="illerList">
                    {filteredIller.map((il) => (
                      <div
                        key={il}
                        className={`r-item ${activeIl === il ? "active" : ""}`}
                        onClick={() => { setActiveIl(il); setActiveIlce(""); }}
                      >
                        {il}<span className="r-arr">›</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="region-ilceler">
                  {activeIl ? (
                    <>
                      <div className="r-ilce-ttl">{activeIl}</div>
                      <div className={`r-ilce-item ${!activeIlce ? "sel" : ""}`} onClick={() => setActiveIlce("")}>Tümü</div>
                      {ilceler.map((ilce) => (
                        <div key={ilce} className={`r-ilce-item ${activeIlce === ilce ? "sel" : ""}`} onClick={() => setActiveIlce(ilce)}>{ilce}</div>
                      ))}
                    </>
                  ) : (
                    <div style={{ padding: "12px 14px", fontSize: ".75rem", color: "var(--ink3)" }}>İl seçin</div>
                  )}
                </div>
              </div>
              <div className="r-footer">
                <span className="r-footer-val" id="regionVal">{activeIlce ? `${activeIl} / ${activeIlce}` : activeIl || ""}</span>
                <button type="button" className="r-btn-clear" onClick={() => { setActiveIl(""); setActiveIlce(""); setSrchRegion(""); }}>Temizle</button>
                <button type="button" className="r-btn-ok" onClick={() => { setSrchRegion(activeIlce ? `${activeIl} / ${activeIlce}` : activeIl); closePanels(); }}>Tamam</button>
              </div>
            </div>
          </div>

          {/* Type panel */}
          <div className={`sf-panel ${panelType ? "open" : ""}`} id="panelType">
            <div className="sf-panel-inn type-panel">
              <div className="type-grid-p">
                {["Hotel", "Beach Club", "Aqua Park", "Tatil Köyü", "Pansiyon", "Havuzlu Tesis"].map((t, i) => (
                  <button key={i} type="button" className="tp-btn">{t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Date panel */}
          <div className={`sf-panel ${panelDate ? "open" : ""}`} id="panelDate">
            <div className="sf-panel-inn date-panel">
              <div className="cal-header">
                <span className="cal-month">Tarih Seçin</span>
              </div>
              <input type="date" onChange={(e) => { setSrchDate(e.target.value); closePanels(); }} />
            </div>
          </div>

          {/* Name panel */}
          <div className={`sf-panel ${panelName ? "open" : ""}`} id="panelName">
            <div className="sf-panel-inn name-panel">
              <div className="name-inp-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                <input type="text" className="name-inp" placeholder="Tesis adı yazın..." onChange={(e) => setSrchName(e.target.value)} />
              </div>
              <div className="name-suggestions">
                {TESISLER.slice(0, 4).map((t) => (
                  <div key={t.name} className="name-sug" onClick={() => { setSrchName(t.name); closePanels(); }}>
                    <span>{t.type === "hotel" ? "🏨" : t.type === "beach" ? "🏖️" : "💦"}</span>
                    <span>{t.name}</span>
                    <span className="name-sug-lbl">{t.il}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER OVERLAY */}
      <div className={`filter-overlay ${filterOpen ? "open" : ""}`} onClick={() => setFilterOpen(false)} />
      <div className={`filter-panel ${filterOpen ? "open" : ""}`}>
        <div className="fp-head">
          <div className="fp-title">Filtreler</div>
          <button type="button" className="fp-close" onClick={() => setFilterOpen(false)}>×</button>
        </div>
        <div className="fp-body">
          <div className="fp-section">
            <div className="fp-sec-title">Sıralama</div>
            <div className="fp-sort-grid">
              <button type="button" className="fp-sort-btn sel">Popüler</button>
              <button type="button" className="fp-sort-btn">Fiyat</button>
            </div>
          </div>
          <div className="fp-section">
            <div className="fp-sec-title">Fiyat Aralığı</div>
            <div className="fp-price-row">
              <div className="fp-price-box"><span className="fp-price-lbl">Min</span><span className="fp-price-val">₺0</span></div>
              <span className="fp-price-sep">-</span>
              <div className="fp-price-box"><span className="fp-price-lbl">Max</span><span className="fp-price-val">₺5000+</span></div>
            </div>
          </div>
          <div className="fp-section">
            <div className="fp-sec-title">Yıldız</div>
            <div className="fp-stars-row">
              {[4, 5].map((s) => (
                <button key={s} type="button" className="fp-star-btn">{s} ★</button>
              ))}
            </div>
          </div>
          <div className="fp-foot">
            <button type="button" className="fp-clear-btn">Temizle</button>
            <button type="button" className="fp-apply-btn" onClick={() => setFilterOpen(false)}>Uygula</button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stats-in">
          <div><span className="stn">100+</span><span className="stl" id="stl1">Aktif tesis</span></div>
          <div className="std" />
          <div><span className="stn">50K+</span><span className="stl" id="stl2">Rezervasyon</span></div>
          <div className="std" />
          <div><span className="stn">15</span><span className="stl" id="stl3">Destinasyon</span></div>
          <div className="std" />
          <div><span className="stn">4.9★</span><span className="stl" id="stl4">Ortalama puan</span></div>
          <div className="std" />
          <div><span className="stn">QR</span><span className="stl" id="stl5">Temassız giriş</span></div>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="sec">
        <div className="sec-row">
          <h2 className="sec-h" id="cat-title">Tesis Kategorileri</h2>
          <a href="/kategoriler" className="sec-a" id="cat-all">Tümünü gör →</a>
        </div>
        <div className="cat-grid">
          <div className="cat-card" data-cat="hotel" onClick={() => setActiveCategory("hotel")}>
            <img src={CAT_IMGS[0]} alt="Hotel" />
            <div className="cat-ov">
              <span className="cat-badge ct" id="cat1-badge">Popüler</span>
              <span className="cat-name" id="cat1-name">Hotel</span>
              <span className="cat-sub" id="cat1-sub">Konfor ve hizmet</span>
            </div>
          </div>
          <div className="cat-card" data-cat="beach" onClick={() => setActiveCategory("beach")}>
            <img src={CAT_IMGS[1]} alt="Beach Club" />
            <div className="cat-ov">
              <span className="cat-name" id="cat2-name">Beach Club</span>
              <span className="cat-sub" id="cat2-sub">Şezlong &amp; deniz keyfi</span>
            </div>
          </div>
          <div className="cat-card" data-cat="aqua" onClick={() => setActiveCategory("aqua")}>
            <img src={CAT_IMGS[2]} alt="Aqua Park" />
            <div className="cat-ov">
              <span className="cat-badge co" id="cat3-badge">Yeni</span>
              <span className="cat-name" id="cat3-name">Aqua Park</span>
              <span className="cat-sub" id="cat3-sub">Eğlence &amp; kaydırak</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAV / PRODUCTS */}
      <section className="sec">
        <div className="sec-row">
          <h2 className="sec-h" id="fav-title">En Çok Tercih Edilenler</h2>
          <a href="/arama" className="sec-a" id="fav-all">Tümünü gör →</a>
        </div>
        <div className="pgrid" id="tesisGrid">
          {TESISLER.map((t, i) => (
            <div
              key={t.name}
              className="pc"
              data-type={t.type}
              style={{ display: activeCategory !== "all" && activeCategory !== t.type ? "none" : undefined }}
            >
              <div className="pw0">
                <img src={TESIS_IMGS[i]} alt={t.name} />
                <span className="prat">★ 4.8</span>
                <span className="ptag">Günlük</span>
              </div>
              <div className="pn">{t.name}</div>
              <div className="pl">{t.ilce} / {t.il}</div>
              <div className="pf">
                <span className="pfc">Wi-Fi</span>
                <span className="pfc">Bar</span>
              </div>
              <div className="pp"><b>₺{i === 0 ? 450 : i === 1 ? 320 : i === 2 ? 280 : 395}</b><span> / gün</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* PLAN */}
      <section className="plan-sec">
        <div>
          <div className="plan-k" id="plan-tag">Şezlong Planı</div>
          <h2 id="plan-title">Tam istediğin şezlongu harita üzerinden seç</h2>
          <p className="pdesc" id="plan-desc">Tesis planında müsait şezlongları anlık görürsün.</p>
          <ul className="cl">
            <li id="plan-f1">Anlık müsaitlik durumu</li>
            <li id="plan-f2">Silver, Gold, VIP kategori fiyatları</li>
            <li id="plan-f3">İleri tarihli rezervasyon imkânı</li>
            <li id="plan-f4">Garson çağırma ve sipariş</li>
          </ul>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button type="button" className="btn-solid" id="plan-btn1">Tesis planını gör →</button>
            <button type="button" className="btn-ghost" id="plan-btn2">Daha fazla bilgi</button>
          </div>
        </div>
        <div className="pww">
          <div className="pwt">
            <span className="pwn">Zuzuu Beach Hotel</span>
            <span className="pwd">Şezlong Planı</span>
          </div>
          <div className="pwb">
            <div className="pwc" id="leg1">Müsait</div>
            <div className="lrow">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={`l ${i % 4 === 0 ? "lok" : i % 4 === 1 ? "lno" : "lpnd"}`}>{i % 4 === 0 ? "S" : i % 4 === 1 ? "R" : "T"}</div>
              ))}
            </div>
            <div className="pwc" id="leg2">Rezerve</div>
            <div className="pwc" id="leg3">Tadilat</div>
            <div className="pwc" id="leg4">Seçimim</div>
          </div>
          <div className="pwleg">
            <div className="pwl"><div className="pwld lok" /><span>Müsait</span></div>
            <div className="pwl"><div className="pwld lno" /><span>Rezerve</span></div>
            <div className="pwl"><div className="pwld lpnd" /><span>Tadilat</span></div>
            <div className="pwl"><div className="pwld lsel" /><span>Seçimim</span></div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="how">
        <div className="how-in">
          <h2 className="how-ttl" id="how-title">Nasıl <span>Çalışır?</span></h2>
          <p className="how-sub" id="how-sub">3 adımda şezlong rezervasyonu</p>
          <div className="hgrid">
            <div className="hs">
              <div className="hn"><span className="hn-num">1</span></div>
              <span className="hi">📍</span>
              <h3 id="how1-title">Tesis Seç</h3>
              <p id="how1-desc">Konum, tesis tipi veya tarihe göre filtrele.</p>
            </div>
            <div className="hs">
              <div className="hn"><span className="hn-num">2</span></div>
              <span className="hi">🪑</span>
              <h3 id="how2-title">Şezlong Seç</h3>
              <p id="how2-desc">Tesis planı üzerinden istediğin şezlongu seç.</p>
            </div>
            <div className="hs">
              <div className="hn"><span className="hn-num">3</span></div>
              <span className="hi">💳</span>
              <h3 id="how3-title">Öde &amp; Uzan</h3>
              <p id="how3-desc">Güvenli ödeme yap, QR kodunu göster.</p>
            </div>
          </div>
        </div>
      </section>

      {/* B2B */}
      <section className="b2b">
        <div className="b2b-in">
          <div>
            <div className="bm-tag" id="b2b-tag">Tesis Sahipleri İçin</div>
            <h2 id="b2b-title">Tesisinizi MyLoungers&apos;a ekleyin</h2>
            <p className="desc" id="b2b-desc">Otel, beach club veya plaj işletmenizi platforma ekleyin.</p>
            <div className="b2b-acts">
              <button type="button" className="btn-solid" id="b2b-btn1" onClick={() => setBasvuruOpen(true)}>Başvuru Formu →</button>
              <button type="button" className="btn-ghost" id="b2b-btn2">Demo İzle</button>
            </div>
          </div>
          <div className="b2bcards">
            <div className="b2bc">
              <div className="b2bi">📈</div>
              <div>
                <h4 id="b2b1-title">Doluluk Oranını Artır</h4>
                <p id="b2b1-desc">Sezon boyunca %90+ doluluk oranı hedefleyin, her şezlong gelir getirsin.</p>
              </div>
            </div>
            <div className="b2bc">
              <div className="b2bi">💳</div>
              <div>
                <h4 id="b2b2-title">Online Ödeme &amp; Raporlama</h4>
                <p id="b2b2-desc">iyzico altyapısıyla tahsilatlar otomatik, raporlar anlık — kasaya dokunmadan.</p>
              </div>
            </div>
            <div className="b2bc">
              <div className="b2bi">🌟</div>
              <div>
                <h4 id="b2b3-title">Ücretsiz Tesis Sayfası</h4>
                <p id="b2b3-desc">Fotoğraf, harita, şezlong planı — tesisiniz 10 dakikada yayında.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="rev">
        <div className="sec-row">
          <h2 className="sec-h" id="rev-title">Kullanıcılar Ne Diyor?</h2>
          <a href="/yorumlar" className="sec-a" id="rev-all">Tüm yorumlar →</a>
        </div>
        <div className="rgrid">
          <div className="rc">
            <div className="rc-dest" id="rev1-dest">🏖️ Bodrum · Zuzuu Beach Hotel</div>
            <div className="rc-stars">★★★★★</div>
            <p className="rc-text" id="rev1-text">Bodrum tatilinde şezlong için saatlerce beklemek zorunda kalmadık!</p>
            <div className="rc-auth">
              <div className="rc-av">AY</div>
              <div>
                <div className="rc-name">Ayşe Y.</div>
                <div className="rc-loc" id="rev1-loc">İstanbul · Doğrulanmış</div>
              </div>
            </div>
          </div>
          <div className="rc">
            <div className="rc-dest" id="rev2-dest">🏊 Marmaris · Aqua Resort</div>
            <div className="rc-stars">★★★★★</div>
            <p className="rc-text" id="rev2-text">QR kod ile giriş süper. Kasaya uğramak yok, kuyruk yok!</p>
            <div className="rc-auth">
              <div className="rc-av">MK</div>
              <div>
                <div className="rc-name">Mehmet K.</div>
                <div className="rc-loc" id="rev2-loc">Ankara · Doğrulanmış</div>
              </div>
            </div>
          </div>
          <div className="rc">
            <div className="rc-dest" id="rev3-dest">🌊 Fethiye · Paradise Beach</div>
            <div className="rc-stars">★★★★★</div>
            <p className="rc-text" id="rev3-text">Denize en yakın şezlongu seçebildim. Uygulama çok kolay!</p>
            <div className="rc-auth">
              <div className="rc-av">ZD</div>
              <div>
                <div className="rc-name">Zeynep D.</div>
                <div className="rc-loc" id="rev3-loc">İzmir · Doğrulanmış</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="ft">
          <div>
            <img src="/logo.png" alt="MyLoungers" className="fl-logo" />
            <p className="fd" id="footer-desc">Türkiye&apos;nin şezlong rezervasyon platformu.</p>
            <div className="fa">
              <a href="#" className="fapp">🍎 App Store</a>
              <a href="#" className="fapp">🤖 Google Play</a>
            </div>
          </div>
          <div className="fcol">
            <h5 id="ft-p">Platform</h5>
            <ul>
              <li><a href="/arama" id="ft-p1">Tesisleri Keşfet</a></li>
              <li><a href="/harita" id="ft-p2">Harita ile Ara</a></li>
              <li><a href="/nasil-calisir" id="ft-p3">Nasıl Çalışır?</a></li>
              <li><a href="/rezervasyonlarim" id="ft-p4">Rezervasyon Takibi</a></li>
            </ul>
          </div>
          <div className="fcol">
            <h5 id="ft-c">Kurumsal</h5>
            <ul>
              <li><a href="/b2b/basvuru" id="ft-c1">Tesis Başvurusu</a></li>
              <li><a href="/hakkimizda" id="ft-c2">Hakkımızda</a></li>
              <li><a href="/iletisim" id="ft-c3">İletişim</a></li>
            </ul>
          </div>
          <div className="fcol">
            <h5 id="ft-s">Destek</h5>
            <ul>
              <li><a href="/kvkk" id="ft-s1">KVKK Metni</a></li>
              <li><a href="/gizlilik" id="ft-s2">Gizlilik</a></li>
              <li><a href="/iptal-iade" id="ft-s3">İptal &amp; İade</a></li>
            </ul>
          </div>
        </div>
        <div className="fb">
          <span id="ft-copy">© 2025 MyLoungers · BGS İnteraktif</span>
          <span id="ft-made">🇹🇷 Türkiye&apos;de yapıldı</span>
        </div>
      </footer>

      {/* BASVURU MODAL */}
      <div className={`basvuru-overlay ${basvuruOpen ? "open" : ""}`} onClick={() => setBasvuruOpen(false)}>
        <div className="basvuru-modal" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="bm-close-btn" onClick={() => setBasvuruOpen(false)}>×</button>
          <div className="bm-left">
            <div className="bm-tag">Tesis Sahipleri</div>
            <h2 className="bm-ttl">Tesisinizi <span>MyLoungers</span>&apos;a ekleyin</h2>
            <p className="bm-desc">Platformumuzla rezervasyonlarınızı kolayca yönetin.</p>
            <div className="bm-feats">
              <div className="bm-feat">
                <div className="bm-feat-ico">✓</div>
                <div><div className="bm-feat-ttl">Ücretsiz Kurulum</div><div className="bm-feat-desc">Sözleşme yok</div></div>
              </div>
              <div className="bm-feat">
                <div className="bm-feat-ico">✓</div>
                <div><div className="bm-feat-ttl">7/24 Destek</div><div className="bm-feat-desc">Her zaman yanınızdayız</div></div>
              </div>
            </div>
            <div className="bm-ref">
              <div className="bm-ref-stars">★★★★★</div>
              <p className="bm-ref-text">&quot;MyLoungers ile doluluk oranımız %40 arttı.&quot;</p>
              <div className="bm-ref-auth">
                <div className="bm-ref-av">ZK</div>
                <div><div className="bm-ref-name">Zeynep K.</div><div className="bm-ref-role">Tesis Sahibi</div></div>
              </div>
            </div>
            <div className="bm-trust">
              <div className="bm-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Ücretsiz Kurulum</div>
              <div className="bm-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>7/24 Destek</div>
              <div className="bm-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Sözleşme YOK</div>
            </div>
          </div>
          <div className="bm-right">
            <div className="bm-steps">
              <div className={`bm-step ${bmPane >= 1 ? "active" : ""} ${bmPane > 1 ? "done" : ""}`}><div className="bm-sn">{bmPane > 1 ? "✓" : "1"}</div><div className="bm-sl">İşletme</div></div>
              <div className={`bm-step ${bmPane >= 2 ? "active" : ""} ${bmPane > 2 ? "done" : ""}`}><div className="bm-sn">{bmPane > 2 ? "✓" : "2"}</div><div className="bm-sl">Tesis</div></div>
              <div className={`bm-step ${bmPane >= 3 ? "active" : ""}`}><div className="bm-sn">3</div><div className="bm-sl">İletişim</div></div>
            </div>
            <div className="bm-prog"><div className="bm-pb" style={{ width: bmPane === 1 ? "33%" : bmPane === 2 ? "66%" : "99%" }} /></div>
            {bmPane === 1 && (
              <div className="bm-pane on">
                <div className="bm-pttl">İşletme Bilgileri</div>
                <div className="bm-psub">Tesisiniz hakkında temel bilgileri girin.</div>
                <div className="bfg">
                  <label className="bfl">İşletme Adı *</label>
                  <div className="biw"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="1" /><path d="M16 22V12H8v10" /><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" /></svg><input className="bfi" type="text" placeholder="Örn: Zuzuu Beach Club" /></div>
                </div>
                <div className="bfg">
                  <label className="bfl">Tesis Türü *</label>
                  <div className="tgrid">
                    {["Hotel", "Beach Club", "Aqua Park", "Pansiyon", "Tatil Köyü", "Havuzlu Tesis"].map((t, i) => (
                      <button key={i} type="button" className={`tbtn ${i === 0 ? "sel" : ""}`}><span className="ti">{["🏨", "🏖️", "💦", "🏠", "🌴", "🏊"][i]}</span>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="bfg2">
                  <div><label className="bfl">Şehir *</label><select className="bfs"><option value="">Seçiniz</option><option>Bodrum</option><option>Antalya</option><option>Marmaris</option></select></div>
                  <div><label className="bfl">İlçe / Bölge</label><input className="bfi" type="text" placeholder="Örn: Yalıkavak" /></div>
                </div>
                <div className="bm-nav">
                  <div />
                  <button type="button" className="bm-next" onClick={() => setBmPane(2)}>Devam Et <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg></button>
                </div>
              </div>
            )}
            {bmPane === 2 && (
              <div className="bm-pane on">
                <div className="bm-pttl">Tesis Detayları</div>
                <div className="bm-psub">Kapasite ve özellikler hakkında bilgi verin.</div>
                <div className="bfg"><label className="bfl">Şezlong Kapasitesi: <span>50</span> adet</label><div className="cap-w"><input type="range" className="cap-s" min={5} max={500} defaultValue={50} step={5} /><div className="cap-v">50</div></div></div>
                <div className="bm-nav">
                  <button type="button" className="bm-prev" onClick={() => setBmPane(1)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg> Geri</button>
                  <button type="button" className="bm-next" onClick={() => setBmPane(3)}>Devam Et <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg></button>
                </div>
              </div>
            )}
            {bmPane === 3 && (
              <div className="bm-pane on">
                <div className="bm-pttl">İletişim Bilgileri</div>
                <div className="bm-psub">Sizi en kısa sürede arayalım.</div>
                <div className="bfg2">
                  <div><label className="bfl">Ad *</label><input className="bfi" type="text" placeholder="Adınız" /></div>
                  <div><label className="bfl">Soyad *</label><input className="bfi" type="text" placeholder="Soyadınız" /></div>
                </div>
                <div className="bfg"><label className="bfl">Telefon *</label><div className="biw"><input className="bfi" type="tel" placeholder="+90 5XX XXX XX XX" /></div></div>
                <div className="bfg"><label className="bfl">E-posta</label><div className="biw"><input className="bfi" type="email" placeholder="ornek@isletme.com" /></div></div>
                <div className="bm-nav" style={{ flexDirection: "column", gap: 7, alignItems: "stretch" }}>
                  <button type="button" className="bm-sub">🚀 Başvurumu Tamamla</button>
                  <button type="button" className="bm-prev" style={{ justifyContent: "center" }} onClick={() => setBmPane(2)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg> Geri</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
