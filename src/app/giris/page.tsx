"use client";

import Link from "next/link";
import "./giris.css";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";

const COUNTRY_CODES = [
  { code: "TR", flag: "🇹🇷", dial: "+90" },
  { code: "US", flag: "🇺🇸", dial: "+1" },
  { code: "GB", flag: "🇬🇧", dial: "+44" },
  { code: "DE", flag: "🇩🇪", dial: "+49" },
  { code: "RU", flag: "🇷🇺", dial: "+7" },
];

export default function GirisPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [pane, setPane] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (tabParam === "register") setTab("register");
  }, [tabParam]);

  const handleOtpChange = (idx: number, v: string) => {
    if (v.length > 1) v = v.charAt(v.length - 1);
    const next = [...otp];
    next[idx] = v.replace(/\D/g, "");
    setOtp(next);
    if (v && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="giris-page">
      <div className="giris-bg">
        <div className="giris-bg-circle giris-circle-teal" />
        <div className="giris-bg-circle giris-circle-orange" />
      </div>
      <div className="giris-card-wrap">
        <div className="giris-card">
          <img src="/logo.png" alt="MyLoungers" className="giris-logo" />

          {/* PANE 1 — MAIN */}
          {pane === 1 && (
            <div className="giris-pane">
              <Link href="/" className="giris-back-link">← Ana Sayfaya Dön</Link>
              <h1 className="giris-title">Hoş Geldin ☀️</h1>
              <p className="giris-subtitle">Giriş yap veya hızlıca kayıt ol</p>

              <div className="giris-tabs">
                <button type="button" className={`giris-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Giriş Yap</button>
                <button type="button" className={`giris-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Kayıt Ol</button>
              </div>

              {tab === "login" && (
                <div className="giris-form">
                  <button type="button" className="giris-social-btn giris-google">
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google ile devam et
                    <span className="giris-badge">Popüler</span>
                  </button>
                  <button type="button" className="giris-social-btn giris-apple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c1.33-1.59 1.11-3.98-.07-5.36-1.23-1.37-3.15-1.86-4.63-1.4-1.78.59-3.25 2.08-3.33 2.18-.06.08-.12.17-.16.26-.28.6-.14 1.36.32 1.81.28.27.63.39 1.01.39.34 0 .69-.11 1.01-.31.03-.02 1.4-.94 2.37-.54.39.16.73.48.98.87.24.38.36.8.36 1.24 0 .43-.12.86-.36 1.24-.24.36-.56.68-.98.87-.54.22-1.09.33-1.65.33-.47 0-.95-.09-1.41-.27z"/></svg>
                    Apple ile devam et
                  </button>
                  <button type="button" className="giris-social-btn giris-phone" onClick={() => setPane(2)}>
                    📱 Telefon ile giriş
                  </button>
                  <div className="giris-divider">— veya e-posta ile —</div>
                  <input type="email" className="giris-input" placeholder="E-posta" />
                  <div className="giris-input-wrap">
                    <input type={showPass ? "text" : "password"} className="giris-input" placeholder="Şifre" />
                    <button type="button" className="giris-eye" onClick={() => setShowPass(!showPass)} aria-label="Şifreyi göster">
                      {showPass ? "🙈" : "👁"} 
                    </button>
                  </div>
                  <Link href="#" className="giris-forgot" onClick={(e) => { e.preventDefault(); setPane(4); }}>Şifremi Unuttum</Link>
                  <button type="button" className="giris-submit">Giriş Yap →</button>
                  <p className="giris-switch">Hesabın yok mu? <button type="button" className="giris-link" onClick={() => setTab("register")}>Kayıt ol</button></p>
                </div>
              )}

              {tab === "register" && (
                <div className="giris-form">
                  <button type="button" className="giris-social-btn giris-google">
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google ile devam et
                  </button>
                  <button type="button" className="giris-social-btn giris-apple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c1.33-1.59 1.11-3.98-.07-5.36-1.23-1.37-3.15-1.86-4.63-1.4-1.78.59-3.25 2.08-3.33 2.18-.06.08-.12.17-.16.26-.28.6-.14 1.36.32 1.81.28.27.63.39 1.01.39.34 0 .69-.11 1.01-.31.03-.02 1.4-.94 2.37-.54.39.16.73.48.98.87.24.38.36.8.36 1.24 0 .43-.12.86-.36 1.24-.24.36-.56.68-.98.87-.54.22-1.09.33-1.65.33-.47 0-.95-.09-1.41-.27z"/></svg>
                    Apple ile devam et
                  </button>
                  <div className="giris-divider">— veya e-posta ile —</div>
                  <input type="text" className="giris-input" placeholder="Ad Soyad" />
                  <input type="email" className="giris-input" placeholder="E-posta" />
                  <div className="giris-input-wrap">
                    <input type={showPass ? "text" : "password"} className="giris-input" placeholder="Şifre (min 8 karakter)" />
                    <button type="button" className="giris-eye" onClick={() => setShowPass(!showPass)} aria-label="Şifreyi göster">👁</button>
                  </div>
                  <button type="button" className="giris-submit">Kayıt Ol →</button>
                  <p className="giris-kvkk">
                    Kayıt olarak <Link href="/kvkk" className="giris-link">KVKK</Link> ve <Link href="/gizlilik" className="giris-link">Gizlilik</Link> metinlerini kabul etmiş olursunuz.
                  </p>
                  <p className="giris-switch">Zaten hesabın var mı? <button type="button" className="giris-link" onClick={() => setTab("login")}>Giriş yap</button></p>
                </div>
              )}
            </div>
          )}

          {/* PANE 2 — PHONE */}
          {pane === 2 && (
            <div className="giris-pane">
              <button type="button" className="giris-back-link" onClick={() => setPane(1)}>← Geri</button>
              <h1 className="giris-title">Telefon ile Giriş</h1>
              <div className="giris-phone-row">
                <select className="giris-country-select">
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.dial}>{c.flag} {c.dial}</option>
                  ))}
                </select>
                <input type="tel" className="giris-input giris-phone-input" placeholder="5XX XXX XX XX" />
              </div>
              <button type="button" className="giris-submit" onClick={() => setPane(3)}>SMS Kodu Gönder →</button>
            </div>
          )}

          {/* PANE 3 — OTP */}
          {pane === 3 && (
            <div className="giris-pane">
              <div className="giris-otp-header">
                <button type="button" className="giris-back-link" onClick={() => setPane(2)}>← Geri</button>
                <div className="giris-otp-dots"><span className="on" /><span /></div>
              </div>
              <h1 className="giris-title">Kodu Gir</h1>
              <div className="giris-otp-grid">
                {otp.map((v, i) => (
                  <input key={i} ref={(r) => { otpRefs.current[i] = r; }} type="text" inputMode="numeric" maxLength={1} value={v} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} className="giris-otp-input" />
                ))}
              </div>
              <button type="button" className="giris-otp-resend">Kod gelmedi mi? Tekrar gönder</button>
              <button type="button" className="giris-submit" onClick={() => setPane(5)}>Doğrula →</button>
            </div>
          )}

          {/* PANE 4 — PASSWORD RESET */}
          {pane === 4 && (
            <div className="giris-pane">
              <button type="button" className="giris-back-link" onClick={() => setPane(1)}>← Geri</button>
              <h1 className="giris-title">Şifreni Sıfırla</h1>
              <input type="email" className="giris-input" placeholder="E-posta" />
              <button type="button" className="giris-submit" onClick={() => setPane(5)}>Sıfırlama Linki Gönder →</button>
            </div>
          )}

          {/* PANE 5 — SUCCESS */}
          {pane === 5 && (
            <div className="giris-pane giris-success-pane">
              <div className="giris-success-icon">🎉</div>
              <h1 className="giris-title">Hoş Geldin!</h1>
              <p className="giris-success-desc">Hesabın hazır. Artık tesisleri keşfedebilir ve rezervasyon yapabilirsin.</p>
              <Link href="/" className="giris-submit giris-submit-link">Ana Sayfaya Git →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GirisLoading() {
  return (
    <div className="giris-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F6F9" }}>
      <div style={{ fontSize: "1rem", fontWeight: 700, color: "#374151" }}>Yükleniyor...</div>
    </div>
  );
}

export default function GirisPage() {
  return (
    <Suspense fallback={<GirisLoading />}>
      <GirisContent />
    </Suspense>
  );
}
