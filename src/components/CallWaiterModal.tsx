"use client";

import { useEffect } from "react";

interface CallWaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tesisAdi: string;
}

export default function CallWaiterModal({ isOpen, onClose, onConfirm, tesisAdi }: CallWaiterModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
          borderRadius: 16, padding: 24, maxWidth: 380, width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          textAlign: "center",
          animation: "cwm-in 0.15s ease-out",
        }}
      >
        {/* Çan ikonu */}
        <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F5821F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>

        {/* Başlık */}
        <div style={{ fontSize: 16, fontWeight: 500, color: "white", marginBottom: 6 }}>
          Garson çağırılsın mı?
        </div>

        {/* Açıklama */}
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 20, lineHeight: 1.5 }}>
          {tesisAdi} garsonuna çağrı gönderilecek.
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
            onClick={onConfirm}
            style={{
              flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 500,
              background: "#F5821F", border: "none", color: "white", cursor: "pointer",
            }}
          >
            Çağır
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cwm-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      ` }} />
    </div>
  );
}
