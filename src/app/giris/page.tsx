"use client";

import Link from "next/link";
import "./giris.css";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

function GirisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const tabParam = searchParams.get("tab");
  const [pane, setPane] = useState<1 | 4 | 5>(1);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam === "register") setTab("register");
  }, [tabParam]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(event, session?.user?.email);
      if (event === "SIGNED_IN" && session?.user) {
        subscription.unsubscribe();
        const { data: mevcut } = await supabase.from("kullanicilar").select("id").eq("email", session.user.email).single();
        if (!mevcut) {
          await supabase.from("kullanicilar").insert({
            id: session.user.id,
            ad: session.user.user_metadata?.full_name?.split(" ")[0] || session.user.email?.split("@")[0] || "Kullanici",
            soyad: session.user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
            email: session.user.email,
            rol: "musteri",
          });
        }
        const { data: kullanici } = await supabase.from("kullanicilar").select("rol").eq("email", session.user.email).single();
        const rol = (kullanici as any)?.rol;
        if (rol === "admin") window.location.href = "/admin";
        else if (rol === "isletmeci") window.location.href = "/isletme";
        else window.location.href = "/profil";
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleGoogleLogin() {
    setErrorMsg(null);
    setLoading(true);
    const redirectBase =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://myloungers.com";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectBase + "/auth/callback",
      },
    });
    if (error) {
      setErrorMsg("Google ile giriş başarısız.");
      setLoading(false);
    }
  }

  async function handleEmailLogin() {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (loginError || !loginData?.user) {
      setErrorMsg("E-posta veya şifre hatalı.");
      return;
    }
    if (loginData.user) {
      setSuccessMsg("Giriş başarılı, yönlendiriliyorsunuz…");

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.log("Supabase auth hatası veya kullanıcı yok:", authError);
        router.push("/profil");
        return;
      }

      const { data: kullanici } = await supabase
        .from('kullanicilar')
        .select('rol')
        .eq('email', authData.user.email)
        .single();

      if ((kullanici as any)?.rol === 'admin') router.push('/admin');
      else if ((kullanici as any)?.rol === 'isletmeci') router.push('/isletme');
      else router.push('/profil');
    }
  }

  async function handleRegister() {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const resp = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const json = await resp.json();
      if (!resp.ok || !json.ok) {
        setErrorMsg(json.error || "Kayıt oluşturulamadı.");
        setLoading(false);
        return;
      }
      setSuccessMsg("Kayıt başarılı, otomatik giriş yapılıyor…");

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: regEmail,
        password: regPassword,
      });
      setLoading(false);
      if (loginError) {
        console.log("Supabase login hatası (register sonrası):", loginError);
        router.push("/giris?tab=login");
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.log("Supabase auth hatası veya kullanıcı yok (register sonrası):", authError);
        router.push("/profil");
        return;
      }

      const { data: kullanici } = await supabase
        .from('kullanicilar')
        .select('rol')
        .eq('email', authData.user.email)
        .single();

      if ((kullanici as any)?.rol === 'admin') router.push('/admin');
      else if ((kullanici as any)?.rol === 'isletmeci') router.push('/isletme');
      else router.push('/profil');
    } catch (e) {
      console.error("Register error:", e);
      setErrorMsg("Sunucu hatası. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  }

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
                  <button type="button" className="giris-social-btn giris-google" onClick={handleGoogleLogin}>
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google ile devam et
                    <span className="giris-badge">Popüler</span>
                  </button>
                  <button type="button" className="giris-social-btn giris-apple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c1.33-1.59 1.11-3.98-.07-5.36-1.23-1.37-3.15-1.86-4.63-1.4-1.78.59-3.25 2.08-3.33 2.18-.06.08-.12.17-.16.26-.28.6-.14 1.36.32 1.81.28.27.63.39 1.01.39.34 0 .69-.11 1.01-.31.03-.02 1.4-.94 2.37-.54.39.16.73.48.98.87.24.38.36.8.36 1.24 0 .43-.12.86-.36 1.24-.24.36-.56.68-.98.87-.54.22-1.09.33-1.65.33-.47 0-.95-.09-1.41-.27z"/></svg>
                    Apple ile devam et
                  </button>
                  <div className="giris-divider">— veya e-posta ile —</div>
                  <input
                    type="email"
                    className="giris-input"
                    placeholder="E-posta"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <div className="giris-input-wrap">
                    <input
                      type={showPass ? "text" : "password"}
                      className="giris-input"
                      placeholder="Şifre"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button type="button" className="giris-eye" onClick={() => setShowPass(!showPass)} aria-label="Şifreyi göster">
                      {showPass ? "🙈" : "👁"} 
                    </button>
                  </div>
                  <Link href="#" className="giris-forgot" onClick={(e) => { e.preventDefault(); setPane(4); }}>Şifremi Unuttum</Link>
                  {errorMsg && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errorMsg}</p>}
                  {successMsg && <p style={{ color: "#16A34A", fontSize: 12, marginTop: 4 }}>{successMsg}</p>}
                  <button type="button" className="giris-submit" disabled={loading} onClick={handleEmailLogin}>
                    {loading ? "Giriş yapılıyor..." : "Giriş Yap →"}
                  </button>
                  <p className="giris-switch">Hesabın yok mu? <button type="button" className="giris-link" onClick={() => setTab("register")}>Kayıt ol</button></p>
                </div>
              )}

              {tab === "register" && (
                <div className="giris-form">
                  <button type="button" className="giris-social-btn giris-google" onClick={handleGoogleLogin}>
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google ile devam et
                  </button>
                  <button type="button" className="giris-social-btn giris-apple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c1.33-1.59 1.11-3.98-.07-5.36-1.23-1.37-3.15-1.86-4.63-1.4-1.78.59-3.25 2.08-3.33 2.18-.06.08-.12.17-.16.26-.28.6-.14 1.36.32 1.81.28.27.63.39 1.01.39.34 0 .69-.11 1.01-.31.03-.02 1.4-.94 2.37-.54.39.16.73.48.98.87.24.38.36.8.36 1.24 0 .43-.12.86-.36 1.24-.24.36-.56.68-.98.87-.54.22-1.09.33-1.65.33-.47 0-.95-.09-1.41-.27z"/></svg>
                    Apple ile devam et
                  </button>
                  <div className="giris-divider">— veya e-posta ile —</div>
                  <input
                    type="text"
                    className="giris-input"
                    placeholder="Ad Soyad"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                  />
                  <input
                    type="email"
                    className="giris-input"
                    placeholder="E-posta"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                  />
                  <div className="giris-input-wrap">
                    <input
                      type={showPass ? "text" : "password"}
                      className="giris-input"
                      placeholder="Şifre (min 8 karakter)"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                    />
                    <button type="button" className="giris-eye" onClick={() => setShowPass(!showPass)} aria-label="Şifreyi göster">👁</button>
                  </div>
                  {errorMsg && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errorMsg}</p>}
                  {successMsg && <p style={{ color: "#16A34A", fontSize: 12, marginTop: 4 }}>{successMsg}</p>}
                  <button type="button" className="giris-submit" disabled={loading} onClick={handleRegister}>
                    {loading ? "Kayıt oluşturuluyor..." : "Kayıt Ol →"}
                  </button>
                  <p className="giris-kvkk">
                    Kayıt olarak <Link href="/kvkk" className="giris-link">KVKK</Link> ve <Link href="/gizlilik" className="giris-link">Gizlilik</Link> metinlerini kabul etmiş olursunuz.
                  </p>
                  <p className="giris-switch">Zaten hesabın var mı? <button type="button" className="giris-link" onClick={() => setTab("login")}>Giriş yap</button></p>
                </div>
              )}
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
