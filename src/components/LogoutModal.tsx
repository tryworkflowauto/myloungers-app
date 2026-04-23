"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface LogoutModalProps {
  onClose: () => void;
}

export default function LogoutModal({ onClose }: LogoutModalProps) {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/giris");
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
        justifyContent: "center", zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, #1E293B, #0F172A)",
          border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: 16, padding: 24, maxWidth: 360, width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          textAlign: "center",
          animation: "lm-in 0.15s ease-out",
        }}
      >
        {/* İkon */}
        <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0ABAB5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        {/* Başlık */}
        <div style={{ fontSize: 16, fontWeight: 500, color: "white", marginBottom: 6 }}>
          Çıkış yapmak istiyor musun?
        </div>

        {/* Açıklama */}
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 20, lineHeight: 1.5 }}>
          Oturumun kapanacak ve giriş sayfasına yönlendirileceksin.
        </div>

        {/* Butonlar */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 500,
              background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)",
              color: "white", cursor: "pointer",
            }}
          >
            İptal
          </button>
          <button
            onClick={handleLogout}
            style={{
              flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 500,
              background: "#EF4444", border: "none", color: "white", cursor: "pointer",
            }}
          >
            Çıkış yap
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes lm-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      ` }} />
    </div>
  );
}
