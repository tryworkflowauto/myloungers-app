"use client";

import { useState, useEffect } from "react";
import { useAdminToast } from "../AdminToastContext";
import { supabase } from "@/lib/supabase";

const NAVY = "#0A1628"; const TEAL = "#0ABAB5";
const GRAY50 = "#F8FAFC"; const GRAY100 = "#F1F5F9"; const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8"; const GRAY600 = "#475569"; const GRAY800 = "#1E293B";
const GREEN = "#10B981"; const RED = "#EF4444"; const ORANGE = "#F5821F";

type SikayetDurum = "bekliyor" | "islendi" | "reddedildi";
type Sikayet = { id: string; kaynak: "sikayetler" | "yorumlar"; tesis: string; musteri: string; yorum: string; sebep: string; tarih: string; durum: SikayetDurum; };

function fmtDate(v: unknown): string {
  if (v == null || v === "") return "—";
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function normalizeDurum(v: unknown): SikayetDurum {
  const s = String(v ?? "").toLowerCase();
  if (s.includes("redd")) return "reddedildi";
  if (s.includes("islendi") || s.includes("işlendi")) return "islendi";
  return "bekliyor";
}

function mapSikayetlerRow(r: Record<string, unknown>): Sikayet {
  return {
    id: String(r.id),
    kaynak: "sikayetler",
    tesis: String(r.tesis_adi ?? r.tesis ?? r.tesis_ad ?? "—"),
    musteri: String(r.musteri ?? r.musteri_adi ?? "—"),
    yorum: String(r.yorum ?? r.metin ?? ""),
    sebep: String(r.sebep ?? r.sikayet_sebebi ?? "Şikayet"),
    tarih: fmtDate(r.created_at ?? r.tarih),
    durum: normalizeDurum(r.durum),
  };
}

function mapYorumRow(r: Record<string, unknown>, sebepFromSikayetMetin: boolean): Sikayet {
  const nested = r.tesisler as { ad?: string } | null | undefined;
  const sebep =
    sebepFromSikayetMetin && typeof r.sikayet === "string" && r.sikayet.trim() !== ""
      ? r.sikayet
      : "Şikayet";
  return {
    id: String(r.id),
    kaynak: "yorumlar",
    tesis: nested?.ad ?? "—",
    musteri: String(r.musteri_adi ?? "Misafir"),
    yorum: String(r.yorum ?? ""),
    sebep,
    tarih: fmtDate(r.created_at),
    durum: normalizeDurum(r.durum),
  };
}

async function adminSikayetAction(action: "delete" | "reddet", kaynak: Sikayet["kaynak"], id: string) {
  const res = await fetch("/api/admin/sikayetler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, kaynak, id }),
  });
  return res.ok;
}

export default function AdminSikayetlerPage() {
  const { showToast } = useAdminToast();
  const [sikayetler, setSikayetler] = useState<Sikayet[]>([]);
  const [filtreDurum, setFiltreDurum] = useState("tumu");
  const [silModal, setSilModal] = useState<Sikayet | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sk = await supabase.from("sikayetler").select("*");
      if (cancelled) return;
      if (!sk.error && sk.data != null) {
        setSikayetler((sk.data as Record<string, unknown>[]).map(mapSikayetlerRow));
        return;
      }

      const r1 = await supabase
        .from("yorumlar")
        .select("id, tesis_id, musteri_adi, yorum, created_at, durum, sikayet_var, tesisler(ad)")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (!r1.error && r1.data != null) {
        const filtered = (r1.data as Record<string, unknown>[]).filter((row) => row.sikayet_var === true);
        setSikayetler(filtered.map((row) => mapYorumRow(row, false)));
        return;
      }

      const r2 = await supabase
        .from("yorumlar")
        .select("id, tesis_id, musteri_adi, yorum, created_at, durum, sikayet, tesisler(ad)")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (!r2.error && r2.data != null) {
        const filtered = (r2.data as Record<string, unknown>[]).filter((row) => {
          const s = row.sikayet;
          if (s == null) return false;
          if (typeof s === "boolean") return s;
          return String(s).trim() !== "";
        });
        setSikayetler(filtered.map((row) => mapYorumRow(row, true)));
        return;
      }

      setSikayetler([]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const liste = sikayetler.filter(s => filtreDurum === "tumu" || s.durum === filtreDurum);

  async function isleTalepSil(s: Sikayet) {
    const ok = await adminSikayetAction("delete", s.kaynak, s.id);
    if (!ok) return;
    setSikayetler(p => p.filter(x => x.id !== s.id));
    setSilModal(null); showToast("🗑️ Yorum silindi, şikayet işlendi", RED);
  }
  async function reddetTalep(id: string) {
    const s = sikayetler.find(x => x.id === id);
    if (!s) return;
    const ok = await adminSikayetAction("reddet", s.kaynak, id);
    if (!ok) return;
    setSikayetler(p => p.map(x => x.id === id ? { ...x, durum: "reddedildi" as SikayetDurum } : x));
    showToast("✗ Şikayet talebi reddedildi");
  }

  const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" };
  const selStyle: React.CSSProperties = { padding: "8px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 12, background: "white", cursor: "pointer" };

  const counts = { bekliyor: sikayetler.filter(s => s.durum === "bekliyor").length, islendi: sikayetler.filter(s => s.durum === "islendi").length, reddedildi: sikayetler.filter(s => s.durum === "reddedildi").length };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>🚨 Şikayet Yönetimi</h2><p style={{ fontSize: 12, color: GRAY400 }}>Yorum silme talepleri ve şikayetler</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={filtreDurum} onChange={e => setFiltreDurum(e.target.value)} style={selStyle}>
            <option value="tumu">Tüm Durumlar ({sikayetler.length})</option>
            <option value="bekliyor">Bekliyor ({counts.bekliyor})</option>
            <option value="islendi">İşlendi ({counts.islendi})</option>
            <option value="reddedildi">Reddedildi ({counts.reddedildi})</option>
          </select>
        </div>
      </div>

      {counts.bekliyor > 0 && (
        <div style={{ background: "#FFFBEB", border: `1px solid #FDE68A`, borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 12, color: "#92400E", fontWeight: 600 }}>
          ⚠️ {counts.bekliyor} bekleyen şikayet talebi inceleme bekliyor
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {liste.length === 0 && (
          <div style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: 40, textAlign: "center", color: GRAY400 }}>Şikayet bulunamadı</div>
        )}
        {liste.map(s => (
          <div key={s.id} style={{ background: s.durum === "bekliyor" ? "#FFFBEB" : "white", borderRadius: 12, border: `1.5px solid ${s.durum === "bekliyor" ? "#FDE68A" : GRAY200}`, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: TEAL, background: "#F0FDFA", padding: "2px 8px", borderRadius: 20 }}>{s.tesis}</span>
                  <span style={{ fontWeight: 600, color: NAVY, fontSize: 12 }}>{s.musteri}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#FEE2E2", color: RED, fontWeight: 700 }}>⚠️ {s.sebep}</span>
                  <span style={{ fontSize: 11, color: GRAY400 }}>{s.tarih}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700, background: s.durum === "bekliyor" ? "#FEF3C7" : s.durum === "islendi" ? "#DCFCE7" : "#F1F5F9", color: s.durum === "bekliyor" ? "#D97706" : s.durum === "islendi" ? "#15803D" : GRAY400 }}>
                    {s.durum === "bekliyor" ? "⏳ Bekliyor" : s.durum === "islendi" ? "✓ İşlendi" : "✗ Reddedildi"}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: GRAY600, margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>&ldquo;{s.yorum}&rdquo;</p>
              </div>
              {s.durum === "bekliyor" && (
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => setSilModal(s)} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 700, borderRadius: 8, border: "none", background: RED, color: "white", cursor: "pointer" }}>🗑️ Yorumu Sil</button>
                  <button onClick={() => reddetTalep(s.id)} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: "white", color: GRAY800, cursor: "pointer" }}>✗ Reddet</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {silModal && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setSilModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: 40, textAlign: "center", marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 10, textAlign: "center" }}>Yorumu Sil</h3>
            <div style={{ background: GRAY50, borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: GRAY400, marginBottom: 4 }}>Şikayet sebebi: <strong>{silModal.sebep}</strong></div>
              <p style={{ fontSize: 12, color: GRAY600, margin: 0, fontStyle: "italic" }}>&ldquo;{silModal.yorum}&rdquo;</p>
            </div>
            <p style={{ fontSize: 12, color: GRAY600, marginBottom: 16, textAlign: "center" }}>Bu yorumu silmek ve şikayeti işleme almak istediğinize emin misiniz?</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setSilModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => isleTalepSil(silModal)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", background: RED, color: "white", cursor: "pointer" }}>🗑️ Sil ve İşle</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
