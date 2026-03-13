"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import "../myloungers.css";
import "./hotel.css";

const LANG_OPTS = [
  { code: "TR", flag: "🇹🇷", name: "Türkçe" },
  { code: "EN", flag: "🇬🇧", name: "English" },
  { code: "RU", flag: "🇷🇺", name: "Русский" },
  { code: "DE", flag: "🇩🇪", name: "Deutsch" },
];

const HOTEL_CARDS = [
  {
    name: "Zuzuu Beach Hotel",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop",
    location: "Bodrum, Yalıkavak",
    stars: 5,
    loungerPrice: 450,
    tags: ["Havuz", "Spa", "Wi-Fi", "Bar", "Plaj"],
  },
  {
    name: "Bodrum Blue Bay Hotel",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=400&fit=crop",
    location: "Bodrum, Gümbet",
    stars: 4,
    loungerPrice: 320,
    tags: ["Havuz", "Spa", "Restoran", "Animasyon"],
  },
];

export default function HotelPage() {
  const { data: session } = useSession();
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState(LANG_OPTS[0]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const prevScrollRestoration = history.scrollRestoration;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    const t = setTimeout(() => window.scrollTo(0, 0), 50);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      if ("scrollRestoration" in history) history.scrollRestoration = prevScrollRestoration;
    };
  }, []);

  return (
    <div className="hotel-page">
      {/* NAV */}
      <nav className="nav">
        <div className="nav-in">
          <Link href="/" className="logo-img-wrap">
            <img src="/logo.png" alt="MyLoungers" className="logo-img" />
          </Link>
          <div className="nav-cats">
            <Link href="/hotel" className="nc on hotel-nav-active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="15" rx="1" />
                <path d="M16 22V12H8v10" />
                <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
              </svg>
              Hotel
            </Link>
            <Link href="/beach-club" className="nc">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 4C14 4 11 6 10 9L3 21" />
                <path d="M22 4C19 4 16 6 15 9L8 21" />
                <path d="M7 21h14" />
                <circle cx="19" cy="4" r="1" fill="currentColor" />
              </svg>
              Beach Club
            </Link>
            <Link href="/aqua-park" className="nc">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0" />
                <path d="M2 17c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0" />
                <path d="M2 7c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0" />
              </svg>
              Aqua Park
            </Link>
            <Link href="/basvuru" className="nc">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Başvuru Formu
            </Link>
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
            {session ? (
              <>
                <span className="nav-user">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  type="button"
                  className="btn-login"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link href="/giris" className="btn-login">Giriş Yap</Link>
                <Link href="/uye-ol" className="btn-signup hotel-btn-signup">Üye Ol</Link>
              </>
            )}
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
      <div className="mob-cats hotel-mob-cats">
        <div className="mob-cats-in">
          <Link href="/hotel" className="mcat on hotel-tab-active">Hotel</Link>
          <Link href="/beach-club" className="mcat">Beach Club</Link>
          <Link href="/aqua-park" className="mcat">Aqua Park</Link>
          <Link href="/basvuru" className="mcat">Başvuru</Link>
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
            {session ? (
              <>
                <div className="mob-user">
                  {session.user?.name || session.user?.email}
                </div>
                <button
                  type="button"
                  className="mob-btn-login"
                  style={{ textDecoration: "none", flex: 1, textAlign: "center" }}
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link href="/giris" className="mob-btn-login" style={{ textDecoration: "none", flex: 1, textAlign: "center" }}>Giriş Yap</Link>
                <Link href="/uye-ol" className="mob-btn-signup" style={{ textDecoration: "none", flex: 1, textAlign: "center" }}>Üye Ol</Link>
              </>
            )}
          </div>
          <div className="mob-sec-title">Kategoriler</div>
          <Link href="/hotel" className="mob-link" onClick={() => setMenuOpen(false)}>Hotel</Link>
          <Link href="/beach-club" className="mob-link" onClick={() => setMenuOpen(false)}>Beach Club</Link>
          <Link href="/aqua-park" className="mob-link" onClick={() => setMenuOpen(false)}>Aqua Park</Link>
          <Link href="/basvuru" className="mob-link" onClick={() => setMenuOpen(false)}>Başvuru Formu</Link>
        </div>
      </div>

      {/* TABS */}
      <div className="hotel-tabs-wrap">
        <div className="hotel-tabs-in">
          <Link href="/hotel" className="hotel-tab hotel-tab-active">
            Hotel
          </Link>
          <Link href="/beach-club" className="hotel-tab">
            Beach Club
          </Link>
          <Link href="/aqua-park" className="hotel-tab">
            Aqua Park
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <section className="sec hotel-sec">
        <h2 className="sec-h">Bodrum Otelleri</h2>
        <div className="hotel-grid">
          {HOTEL_CARDS.map((hotel) => (
            <Link key={hotel.name} href="#" className="hotel-card">
              <div className="hotel-card-img-wrap">
                <img src={hotel.image} alt={hotel.name} />
                <span className="hotel-card-stars">★ {hotel.stars}</span>
              </div>
              <div className="hotel-card-body">
                <h3 className="hotel-card-name">{hotel.name}</h3>
                <div className="hotel-card-location">📍 {hotel.location}</div>
                <div className="hotel-card-tags">
                  {hotel.tags.map((tag) => (
                    <span key={tag} className="hotel-card-tag">{tag}</span>
                  ))}
                </div>
                <div className="hotel-card-price">
                  <b>₺{hotel.loungerPrice}</b>
                  <span> / gün</span>
                </div>
                <span className="hotel-card-btn">Rezervasyon Yap</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
