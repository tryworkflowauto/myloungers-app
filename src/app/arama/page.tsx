"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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

export default function AramaPage() {
  const searchParams = useSearchParams();
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
  const [heroTitle, setHeroTitle] = useState("🔍 Tesis Ara");
  const [heroSub, setHeroSub] = useState("Beach club, hotel ve aqua park — Türkiye geneli");

  useEffect(() => {
    const konum = searchParams.get("konum");
    const tip = searchParams.get("tip");
    const tarih = searchParams.get("tarih");
    const gps = searchParams.get("gps");
    const kmParam = searchParams.get("km");

    if (gps === "1") {
      setGpsOn(true);
      setHeroTitle("📍 Konumunuza Yakın Tesisler");
      setHeroSub(`${kmParam || 10} km yarıçap içindeki tüm tesisler`);
      setActiveTags(["📍 GPS Konumu"]);
    } else if (konum) {
      setLocInput(konum);
      setHeroTitle(`🔍 ${konum} Tesisleri`);
      setHeroSub(`${konum} bölgesindeki tüm beach club, hotel ve tesisler`);
      setActiveTags([`📍 ${konum}`]);
    }
    if (tarih) setDateVal(tarih);
    if (tip) {
      setTypeVal(tip);
      const tabMap: Record<string, string> = { beach: "Beach Club", hotel: "Hotel", aqua: "Aqua Park", tatil: "Tatil Köyü" };
      if (tabMap[tip]) setActiveTab(tabMap[tip]);
    }
  }, [searchParams]);

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
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--navy:#0A1628;--teal:#0ABAB5;--tdk:#0D8C89;--tlt:#E6F7F7;--or:#F5821F;--wh:#fff;--bg:#F4F6F9;--bd:#E5E7EB;--i2:#374151;--i3:#6B7280;--r2:12px;--r3:16px;--r4:20px;--sh:0 1px 4px rgba(0,0,0,.07);--sh2:0 4px 20px rgba(0,0,0,.12)}
        body{font-family:sans-serif;background:var(--bg);color:var(--navy);font-size:15px;line-height:1.55}
        .nav{background:var(--wh);border-bottom:1px solid var(--bd);position:sticky;top:0;z-index:300;height:64px;display:flex;align-items:center;padding:0 24px;gap:12px;box-shadow:var(--sh)}
        .nav-logo{height:40px;cursor:pointer}
        .nav-back{display:flex;align-items:center;gap:6px;font-size:.78rem;font-weight:700;color:var(--i3);text-decoration:none;border:1.5px solid var(--bd);padding:6px 12px;border-radius:9px;transition:all .12s;white-space:nowrap}
        .nav-back:hover{border-color:var(--navy);color:var(--navy)}
        .hero{background:linear-gradient(135deg,var(--navy) 0%,#112240 55%,#0D3B6E 100%);padding:24px 24px 0;position:relative;overflow:hidden}
        .hero-wrap{max-width:1240px;margin:0 auto}
        .hero-title{font-size:1.4rem;font-weight:900;color:#fff;margin-bottom:3px}
        .hero-sub{font-size:.8rem;color:rgba(255,255,255,.5);margin-bottom:16px}
        .sbox{background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);border-radius:16px;padding:14px 16px;display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}
        .sf{display:flex;flex-direction:column;gap:4px;flex:1;min-width:140px}
        .sf label{font-size:.6rem;font-weight:800;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em}
        .sf-loc{display:flex;gap:6px}
        .sf input,.sf select{background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.15);border-radius:10px;padding:9px 12px;font-size:.82rem;color:#fff;outline:none;transition:border .12s;width:100%}
        .sf input::placeholder{color:rgba(255,255,255,.35)}
        .sf select{color:rgba(255,255,255,.75);cursor:pointer}
        .sf select option{background:var(--navy);color:#fff}
        .sf input:focus,.sf select:focus{border-color:var(--teal)}
        .gps-btn{background:rgba(10,186,181,.2);border:1.5px solid var(--teal);border-radius:10px;padding:9px 12px;cursor:pointer;color:var(--teal);flex-shrink:0;transition:all .12s;display:flex;align-items:center;gap:5px;font-size:.75rem;font-weight:700;white-space:nowrap}
        .gps-btn:hover{background:rgba(10,186,181,.3)}
        .gps-btn.on{background:var(--teal);color:#fff}
        .sbtn{background:var(--or);color:#fff;border:none;border-radius:12px;padding:11px 22px;font-size:.85rem;font-weight:900;cursor:pointer;align-self:flex-end;transition:all .15s;white-space:nowrap;display:flex;align-items:center;gap:6px;flex-shrink:0}
        .sbtn:hover{background:#DC6C10;transform:translateY(-1px)}
        .km-row{display:flex;align-items:center;gap:10px;padding:10px 16px;background:rgba(10,186,181,.08);border-top:1px solid rgba(255,255,255,.08)}
        .km-lbl{font-size:.72rem;font-weight:700;color:rgba(255,255,255,.6);white-space:nowrap}
        .km-slider{flex:1;accent-color:var(--teal)}
        .km-val{font-size:.78rem;font-weight:900;color:var(--teal);min-width:50px;text-align:right}
        .tabs{background:var(--navy);border-bottom:1px solid rgba(255,255,255,.08);padding:0 24px}
        .tabs-inner{max-width:1240px;margin:0 auto;display:flex;overflow-x:auto;scrollbar-width:none}
        .tabs-inner::-webkit-scrollbar{display:none}
        .tab{padding:12px 16px;font-size:.75rem;font-weight:700;color:rgba(255,255,255,.4);cursor:pointer;border-bottom:3px solid transparent;transition:all .15s;white-space:nowrap;flex-shrink:0}
        .tab:hover{color:rgba(255,255,255,.7)}
        .tab.on{color:#fff;border-bottom-color:var(--teal)}
        .page{max-width:1240px;margin:0 auto;padding:20px 20px 80px}
        .rbar{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap}
        .rbar-info{font-size:.8rem;color:var(--i3);flex:1}
        .rbar-info b{color:var(--navy);font-weight:900}
        .sort-sel{border:1.5px solid var(--bd);border-radius:9px;padding:7px 11px;font-size:.75rem;color:var(--navy);background:var(--wh);cursor:pointer;outline:none}
        .view-btns{display:flex;gap:4px}
        .vbtn{width:33px;height:33px;border:1.5px solid var(--bd);border-radius:8px;background:var(--wh);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--i3);transition:all .12s}
        .vbtn.on,.vbtn:hover{border-color:var(--navy);color:var(--navy)}
        .filter-open-btn{display:flex;align-items:center;gap:6px;background:var(--wh);border:1.5px solid var(--bd);border-radius:10px;padding:7px 14px;font-size:.78rem;font-weight:700;color:var(--navy);cursor:pointer;transition:all .12s;position:relative}
        .filter-open-btn:hover{border-color:var(--navy)}
        .filter-badge{position:absolute;top:-6px;right:-6px;background:var(--or);color:#fff;font-size:.55rem;font-weight:900;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center}
        .af-wrap{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
        .af-tag{display:inline-flex;align-items:center;gap:5px;background:var(--tlt);color:var(--tdk);border:1px solid #B2EBEA;font-size:.68rem;font-weight:700;padding:4px 10px;border-radius:50px;cursor:pointer}
        .af-tag:hover{background:#C0EFED}
        .cards{display:flex;flex-direction:column;gap:14px}
        .cards.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .card{background:var(--wh);border:1px solid var(--bd);border-radius:var(--r4);overflow:hidden;box-shadow:var(--sh);transition:all .18s;cursor:pointer;display:flex}
        .card:hover{box-shadow:var(--sh2);transform:translateY(-2px);border-color:#C8D0DA}
        .cards.grid .card{flex-direction:column}
        .card-img{width:220px;flex-shrink:0;position:relative;overflow:hidden;background:#E5E7EB}
        .cards.grid .card-img{width:100%;height:190px}
        .card-img img{width:100%;height:100%;object-fit:cover;transition:transform .3s;display:block}
        .card:hover .card-img img{transform:scale(1.04)}
        .card-badge{position:absolute;top:10px;left:10px;font-size:.58rem;font-weight:900;padding:3px 8px;border-radius:6px;text-transform:uppercase;letter-spacing:.05em;color:#fff}
        .badge-top{background:#7C3AED}
        .badge-pop{background:var(--or)}
        .badge-new{background:var(--teal)}
        .card-fav{position:absolute;top:10px;right:10px;width:30px;height:30px;background:rgba(255,255,255,.88);border-radius:50%;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;font-size:.85rem;backdrop-filter:blur(4px);transition:all .12s}
        .card-fav:hover{background:#fff}
        .card-body{flex:1;padding:15px 18px;display:flex;flex-direction:column;gap:5px;min-width:0}
        .card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
        .card-name{font-size:.98rem;font-weight:900;color:var(--navy);line-height:1.2}
        .card-score{background:var(--teal);color:#fff;font-size:.75rem;font-weight:900;padding:4px 9px;border-radius:8px;white-space:nowrap;flex-shrink:0}
        .card-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
        .card-cat{background:var(--tlt);color:var(--tdk);font-size:.63rem;font-weight:700;padding:2px 8px;border-radius:50px;border:1px solid #B2EBEA}
        .card-stars{color:#F59E0B;font-size:.72rem;letter-spacing:1px}
        .card-rev{font-size:.63rem;color:var(--i3)}
        .card-loc{font-size:.7rem;color:var(--i3);display:flex;align-items:center;gap:3px;margin-top:1px}
        .card-dist{font-size:.65rem;color:var(--tdk);font-weight:700;background:var(--tlt);padding:1px 6px;border-radius:5px;margin-left:4px}
        .card-feats{display:flex;gap:5px;flex-wrap:wrap;margin-top:3px}
        .card-feat{font-size:.63rem;color:var(--i2);background:var(--bg);padding:2px 7px;border-radius:5px;border:1px solid var(--bd)}
        .card-footer{margin-top:auto;padding-top:10px;border-top:1px solid var(--bg);display:flex;align-items:center;justify-content:space-between;gap:8px}
        .card-price-from{font-size:.58rem;color:var(--i3)}
        .card-price-val{font-size:1rem;font-weight:900;color:var(--navy);line-height:1.1}
        .card-price-unit{font-size:.58rem;color:var(--i3)}
        .avail{display:flex;align-items:center;gap:4px;font-size:.68rem;font-weight:700}
        .avail.ok{color:#16A34A}.avail.few{color:var(--or)}.avail.full{color:#DC2626}
        .avail-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
        .dot-ok{background:#22C55E}.dot-few{background:var(--or)}.dot-full{background:#EF4444}
        .card-btn{background:var(--navy);color:#fff;border:none;border-radius:9px;padding:8px 15px;font-size:.72rem;font-weight:800;cursor:pointer;transition:all .12s;white-space:nowrap}
        .card-btn:hover{background:var(--tdk)}
        .card-btn:disabled{background:#E5E7EB;color:#9CA3AF;cursor:not-allowed}
        .fp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:400;backdrop-filter:blur(2px)}
        .fp{position:fixed;top:0;right:0;width:360px;height:100vh;background:var(--wh);z-index:500;overflow-y:auto;box-shadow:-4px 0 24px rgba(0,0,0,.15);display:flex;flex-direction:column}
        .fp-head{padding:16px 20px;border-bottom:1px solid var(--bd);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--wh);z-index:1}
        .fp-title{font-size:.92rem;font-weight:900;color:var(--navy);display:flex;align-items:center;gap:8px}
        .fp-close{background:none;border:none;cursor:pointer;color:var(--i3);padding:4px;border-radius:6px;font-size:1.1rem}
        .fp-close:hover{background:var(--bg);color:var(--navy)}
        .fp-body{flex:1;overflow-y:auto;padding-bottom:80px}
        .fg{padding:16px 20px;border-bottom:1px solid var(--bd)}
        .fg-title{font-size:.68rem;font-weight:900;color:var(--i3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px}
        .fc{display:flex;align-items:center;gap:8px;margin-bottom:9px;cursor:pointer}
        .fc input[type=checkbox]{width:16px;height:16px;accent-color:var(--teal);cursor:pointer;flex-shrink:0}
        .fc input[type=radio]{width:16px;height:16px;accent-color:var(--or);cursor:pointer;flex-shrink:0}
        .fc-lbl{font-size:.8rem;color:var(--i2);flex:1}
        .fc-cnt{font-size:.63rem;font-weight:700;color:var(--i3);background:var(--bg);padding:1px 7px;border-radius:50px}
        .frange{width:100%;accent-color:var(--teal);cursor:pointer;margin-top:4px}
        .frange-vals{display:flex;justify-content:space-between;font-size:.68rem;color:var(--i3);margin-top:5px}
        .ftags{display:flex;gap:6px;flex-wrap:wrap}
        .ftag{border:1.5px solid var(--bd);background:none;border-radius:8px;padding:5px 11px;font-size:.72rem;font-weight:700;cursor:pointer;color:var(--i2);transition:all .12s}
        .ftag:hover,.ftag.on{border-color:var(--teal);background:var(--tlt);color:var(--tdk)}
        .fp-footer{position:sticky;bottom:0;background:var(--wh);border-top:1px solid var(--bd);padding:14px 20px;display:flex;gap:10px}
        .fp-apply{flex:1;background:var(--or);color:#fff;border:none;border-radius:11px;padding:12px;font-size:.85rem;font-weight:900;cursor:pointer}
        .fp-apply:hover{background:#DC6C10}
        .fp-clear{background:none;border:1.5px solid var(--bd);border-radius:11px;padding:12px 18px;font-size:.82rem;font-weight:700;cursor:pointer;color:var(--i3)}
        .fp-clear:hover{border-color:var(--navy);color:var(--navy)}
        .pagination{display:flex;align-items:center;justify-content:center;gap:6px;padding-top:20px}
        .pg-btn{width:36px;height:36px;border:1.5px solid var(--bd);border-radius:9px;background:var(--wh);cursor:pointer;font-size:.82rem;font-weight:700;color:var(--i3);transition:all .12s;display:flex;align-items:center;justify-content:center}
        .pg-btn:hover{border-color:var(--navy);color:var(--navy)}
        .pg-btn.on{background:var(--navy);color:#fff;border-color:var(--navy)}
        .map-fab{position:fixed;bottom:24px;right:24px;background:var(--navy);color:#fff;border:none;border-radius:50px;padding:12px 20px;font-size:.78rem;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:7px;box-shadow:0 4px 20px rgba(10,22,40,.3);transition:all .15s;z-index:200}
        .map-fab:hover{background:var(--tdk);transform:translateY(-2px)}
        @media(max-width:768px){
          .fp{width:100%}
          .sbox{flex-direction:column}
          .cards.grid{grid-template-columns:1fr}
          .card{flex-direction:column}
          .card-img{width:100%!important;height:170px}
          .page{padding:16px 12px 80px}
        }
      `}</style>

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
          <button style={{ padding: "7px 16px", border: "1.5px solid var(--bd)", borderRadius: 50, fontSize: ".78rem", fontWeight: 700, color: "var(--i2)", background: "#fff", cursor: "pointer" }}>Profilim</button>
          <button style={{ padding: "7px 16px", border: "none", borderRadius: 50, fontSize: ".78rem", fontWeight: 700, color: "#fff", background: "var(--or)", cursor: "pointer" }}>Giriş Yap</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-wrap">
          <div className="hero-title">{heroTitle}</div>
          <div className="hero-sub">{heroSub}</div>
          <div className="sbox">
            <div className="sf" style={{ flex: 2, minWidth: 180 }}>
              <label>Konum</label>
              <div className="sf-loc">
                <input type="text" value={locInput} onChange={e => setLocInput(e.target.value)} placeholder="Bodrum, Antalya, Marmaris..." disabled={gpsOn} />
                <button className={`gps-btn${gpsOn ? " on" : ""}`} onClick={toggleGPS}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
                  {gpsOn ? "✓ GPS" : "GPS"}
                </button>
              </div>
            </div>
            <div className="sf" style={{ minWidth: 130 }}>
              <label>Tesis Tipi</label>
              <select value={typeVal} onChange={e => setTypeVal(e.target.value)}>
                <option value="">Tümü</option>
                <option value="beach">Beach Club</option>
                <option value="hotel">Hotel</option>
                <option value="aqua">Aqua Park</option>
                <option value="tatil">Tatil Köyü</option>
              </select>
            </div>
            <div className="sf" style={{ minWidth: 130 }}>
              <label>Tarih</label>
              <input type="date" value={dateVal} onChange={e => setDateVal(e.target.value)} />
            </div>
            <div className="sf" style={{ minWidth: 100, maxWidth: 120 }}>
              <label>Kişi</label>
              <select value={kisiVal} onChange={e => setKisiVal(e.target.value)}>
                {["1 Kişi","2 Kişi","3 Kişi","4 Kişi","5+ Kişi"].map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <button className="sbtn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Ara
            </button>
          </div>
          {gpsOn && (
            <div className="km-row">
              <span className="km-lbl">📍 Çevremdeki tesisler — yarıçap:</span>
              <input type="range" className="km-slider" min={1} max={50} value={km} onChange={e => setKm(+e.target.value)} />
              <span className="km-val">{km} km</span>
            </div>
          )}
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
