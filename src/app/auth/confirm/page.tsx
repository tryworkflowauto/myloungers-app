"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "error" | "ready">("checking");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    const query = typeof window !== "undefined" ? window.location.search.slice(1) : "";
    const hashParams = new URLSearchParams(hash);
    const queryParams = new URLSearchParams(query);
    const access_token = hashParams.get("access_token") ?? queryParams.get("access_token") ?? "";

    if (!access_token) {
      setStatus("error");
      setMessage("Geçersiz bağlantı. access_token bulunamadı.");
      return;
    }

    (async () => {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token: access_token,
      });
      if (error) {
        console.error("setSession error", error);
        setStatus("error");
        setMessage(error.message || "Oturum başlatılamadı.");
        return;
      }
      if (data?.session) {
        setStatus("ready");
      } else {
        setStatus("error");
        setMessage("Oturum başlatılamadı.");
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!password || !password2) {
      setMessage("Lütfen şifre alanlarını doldurun.");
      return;
    }
    if (password !== password2) {
      setMessage("Şifreler eşleşmiyor.");
      return;
    }
    if (password.length < 8) {
      setMessage("Şifre en az 8 karakter olmalıdır.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error("updateUser error", error);
      setMessage(error.message || "Şifre güncellenemedi.");
      setSubmitting(false);
      return;
    }
    router.push("/isletme/dashboard");
    setSubmitting(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: 24, borderRadius: 16, background: "#020617", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", color: "#E5E7EB", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img src="/logo.png" alt="MyLoungers" style={{ height: 40, margin: "0 auto 10px" }} />
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Şifreni Belirle</h1>
          <p style={{ fontSize: 13, color: "#9CA3AF" }}>Şifreni belirleyerek işletme paneline giriş yapabilirsin.</p>
        </div>

        {status === "checking" && (
          <div style={{ padding: "12px 10px", borderRadius: 10, border: "1px solid #1E293B", fontSize: 13, color: "#9CA3AF" }}>
            Doğrulanıyor...
          </div>
        )}

        {status === "error" && (
          <div style={{ padding: "12px 10px", borderRadius: 10, background: "#1F2937", border: "1px solid #DC2626", fontSize: 13, color: "#FCA5A5" }}>
            {message}
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {message && (
              <div style={{ padding: "8px 10px", borderRadius: 8, background: "#111827", border: "1px solid #4B5563", fontSize: 12, color: "#F9FAFB" }}>
                {message}
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Yeni Şifre</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="En az 8 karakter"
                style={{ width: "100%", padding: "9px 11px", borderRadius: 9, border: "1px solid #334155", background: "#020617", color: "#E5E7EB", fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                placeholder="Şifreyi tekrar girin"
                style={{ width: "100%", padding: "9px 11px", borderRadius: 9, border: "1px solid #334155", background: "#020617", color: "#E5E7EB", fontSize: 13 }}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 4,
                padding: "10px 12px",
                borderRadius: 999,
                border: "none",
                background: submitting ? "#0F766E" : "#0D9488",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                cursor: submitting ? "default" : "pointer",
              }}
            >
              {submitting ? "Kaydediliyor..." : "Şifremi Belirle ve Devam Et →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
