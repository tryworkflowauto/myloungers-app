"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const NAVY = "#0A1628"; const TEAL = "#0ABAB5";
const GRAY50 = "#F8FAFC"; const GRAY100 = "#F1F5F9"; const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8"; const GRAY600 = "#475569"; const GRAY800 = "#1E293B";
const GREEN = "#10B981"; const RED = "#EF4444"; const ORANGE = "#F5821F";

type Plan = "Başlangıç" | "Büyüme" | "Kurumsal";
type AboDurum = "aktif" | "suresi-dolmus" | "iptal";
type Abonelik = { id: string; tesis: string; plan: Plan; baslangic: string; bitis: string; tutar: string; durum: AboDurum; emoji: string; emojiBg: string; };

const PLAN_COLORS: Record<Plan, { bg: string; color: string }> = {
  "Başlangıç": { bg: "#DCFCE7", color: "#15803D" },
  "Büyüme":    { bg: "#DBEAFE", color: "#1D4ED8" },
  "Kurumsal":  { bg: "#EDE9FE", color: "#7C3AED" },
};

const EMOJI_ROT = ["🌊", "☀️", "🔱", "🌴", "⛵", "🌊"];
const BG_ROT = ["#E0F2FE", "#FEF3C7", "#EDE9FE", "#DCFCE7", "#FEF9C3", "#FEE2E2"];

function normalizePlan(v: unknown): Plan {
  const s = String(v ?? "").toLowerCase();
  if (s.includes("kurumsal")) return "Kurumsal";
  if (s.includes("büyüme") || s.includes("buyume")) return "Büyüme";
  if (s.includes("başlangıç") || s.includes("baslang")) return "Başlangıç";
  return "Başlangıç";
}

function normalizeDurum(v: unknown): AboDurum {
  const s = String(v ?? "").toLowerCase();
  if (s.includes("iptal")) return "iptal";
  if (s.includes("süre") || s.includes("dolmuş") || s.includes("doldu") || s.includes("suresi")) return "suresi-dolmus";
  return "aktif";
}

function fmtDate(v: unknown): string {
  if (v == null || v === "") return "—";
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function fmtTutarField(v: unknown): string {
  if (v == null || v === "") return "—";
  if (typeof v === "string" && /₺|tl/i.test(v)) return v.includes("/") ? v : v + "/ay";
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return "—";
  return "₺" + Math.round(n).toLocaleString("tr-TR") + "/ay";
}

function mapFromAboneliklerRow(row: Record<string, unknown>, index: number): Abonelik {
  const nested = row.tesisler as { ad?: string } | null | undefined;
  const tesis =
    (typeof row.tesis_adi === "string" && row.tesis_adi) ||
    (typeof row.tesis_ad === "string" && row.tesis_ad) ||
    (typeof row.tesis === "string" && row.tesis) ||
    nested?.ad ||
    "—";
  return {
    id: String(row.id ?? index),
    tesis,
    plan: normalizePlan(row.plan ?? row.abonelik_plani),
    baslangic: fmtDate(row.baslangic ?? row.abonelik_baslangic ?? row.baslangic_tarih),
    bitis: fmtDate(row.bitis ?? row.abonelik_bitis ?? row.bitis_tarih),
    tutar: fmtTutarField(row.tutar ?? row.abonelik_tutar ?? row.aylik_tutar),
    durum: normalizeDurum(row.durum ?? row.abonelik_durum),
    emoji: EMOJI_ROT[index % EMOJI_ROT.length],
    emojiBg: BG_ROT[index % BG_ROT.length],
  };
}

function mapFromTesisExtended(row: Record<string, unknown>, index: number): Abonelik {
  const ad = typeof row.ad === "string" ? row.ad : "—";
  return {
    id: String(row.id ?? index),
    tesis: ad,
    plan: normalizePlan(row.abonelik_plani),
    baslangic: fmtDate(row.abonelik_baslangic),
    bitis: fmtDate(row.abonelik_bitis),
    tutar: fmtTutarField(row.abonelik_tutar),
    durum: normalizeDurum(row.abonelik_durum),
    emoji: EMOJI_ROT[index % EMOJI_ROT.length],
    emojiBg: BG_ROT[index % BG_ROT.length],
  };
}

function mapFromTesisMinimal(row: Record<string, unknown>, index: number): Abonelik {
  const ad = typeof row.ad === "string" ? row.ad : "—";
  return {
    id: String(row.id ?? index),
    tesis: ad,
    plan: "Başlangıç",
    baslangic: "—",
    bitis: "—",
    tutar: "—",
    durum: "aktif",
    emoji: EMOJI_ROT[index % EMOJI_ROT.length],
    emojiBg: BG_ROT[index % BG_ROT.length],
  };
}

export default function AdminAboneliklerPage() {
  const [rows, setRows] = useState<Abonelik[]>([]);
  const [filtrePlan, setFiltrePlan] = useState("tumu");
  const [filtreDurum, setFiltreDurum] = useState("tumu");
  const [ara, setAra] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const aboRes = await supabase.from("abonelikler").select("*");
      if (cancelled) return;
      if (!aboRes.error && aboRes.data != null) {
        const rows = (aboRes.data as Record<string, unknown>[]).map((r, i) => mapFromAboneliklerRow(r, i));
        setRows(rows);
        return;
      }
      if (aboRes.error) console.error("abonelikler fetch", aboRes.error);

      const tesisFull = await supabase
        .from("tesisler")
        .select("id, ad, abonelik_plani, abonelik_baslangic, abonelik_bitis, abonelik_tutar, abonelik_durum");
      if (cancelled) return;
      if (!tesisFull.error && tesisFull.data != null) {
        const rows = (tesisFull.data as Record<string, unknown>[]).map((r, i) => mapFromTesisExtended(r, i));
        setRows(rows);
        return;
      }
      if (tesisFull.error) console.error("tesisler abonelik kolonları", tesisFull.error);

      const tesisMin = await supabase.from("tesisler").select("id, ad");
      if (cancelled) return;
      if (!tesisMin.error && tesisMin.data != null) {
        setRows((tesisMin.data as Record<string, unknown>[]).map((r, i) => mapFromTesisMinimal(r, i)));
        return;
      }
      if (tesisMin.error) console.error("tesisler minimal", tesisMin.error);
      setRows([]);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const liste = rows.filter(a => {
    const planOk = filtrePlan === "tumu" || a.plan === filtrePlan;
    const durumOk = filtreDurum === "tumu" || a.durum === filtreDurum;
    const araOk = !ara || a.tesis.toLowerCase().includes(ara.toLowerCase());
    return planOk && durumOk && araOk;
  });

  const toplam = rows.filter(a => a.durum === "aktif").length;
  const aylikGelir = rows
    .filter(a => a.durum === "aktif")
    .map(a => parseInt(a.tutar.replace(/[^0-9]/g, ""), 10))
    .filter((v) => !Number.isNaN(v))
    .reduce((s, v) => s + v, 0);

  const selStyle: React.CSSProperties = { padding: "8px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 12, background: "white", cursor: "pointer" };
  const cardStyle: React.CSSProperties = { background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: "16px 20px", flex: 1 };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>📄 Abonelik Yönetimi</h2><p style={{ fontSize: 12, color: GRAY400 }}>Platform abonelik planları</p></div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <div style={cardStyle}><div style={{ fontSize: 11, fontWeight: 600, color: GRAY400, marginBottom: 4 }}>Aktif Abonelik</div><div style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>{toplam}</div></div>
        <div style={cardStyle}><div style={{ fontSize: 11, fontWeight: 600, color: GRAY400, marginBottom: 4 }}>Aylık Abonelik Geliri</div><div style={{ fontSize: 22, fontWeight: 800, color: GREEN }}>₺{aylikGelir.toLocaleString("tr-TR")}</div></div>
        <div style={cardStyle}><div style={{ fontSize: 11, fontWeight: 600, color: GRAY400, marginBottom: 4 }}>Süresi Dolan</div><div style={{ fontSize: 22, fontWeight: 800, color: ORANGE }}>{rows.filter(a => a.durum === "suresi-dolmus").length}</div></div>
        <div style={cardStyle}><div style={{ fontSize: 11, fontWeight: 600, color: GRAY400, marginBottom: 4 }}>İptal Edilen</div><div style={{ fontSize: 22, fontWeight: 800, color: RED }}>{rows.filter(a => a.durum === "iptal").length}</div></div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input type="text" placeholder="🔍 Tesis ara..." value={ara} onChange={e => setAra(e.target.value)} style={{ padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 12, width: 200 }} />
        <select value={filtrePlan} onChange={e => setFiltrePlan(e.target.value)} style={selStyle}>
          <option value="tumu">Tüm Planlar</option>
          <option value="Başlangıç">Başlangıç</option>
          <option value="Büyüme">Büyüme</option>
          <option value="Kurumsal">Kurumsal</option>
        </select>
        <select value={filtreDurum} onChange={e => setFiltreDurum(e.target.value)} style={selStyle}>
          <option value="tumu">Tüm Durumlar</option>
          <option value="aktif">Aktif</option>
          <option value="suresi-dolmus">Süresi Dolmuş</option>
          <option value="iptal">İptal</option>
        </select>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: GRAY50 }}>
              {["Tesis","Plan","Başlangıç","Bitiş","Aylık Tutar","Durum"].map(h => (
                <th key={h} style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {liste.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: GRAY400 }}>Abonelik bulunamadı</td></tr>
            )}
            {liste.map(a => (
              <tr key={a.id}>
                <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: a.emojiBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{a.emoji}</div>
                    <span style={{ fontWeight: 700, color: NAVY }}>{a.tesis}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}` }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: PLAN_COLORS[a.plan].bg, color: PLAN_COLORS[a.plan].color }}>{a.plan}</span>
                </td>
                <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}`, color: GRAY600 }}>{a.baslangic}</td>
                <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}`, color: GRAY600 }}>{a.bitis}</td>
                <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}`, fontWeight: 700 }}>{a.tutar}</td>
                <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}` }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: a.durum === "aktif" ? "#DCFCE7" : a.durum === "iptal" ? "#FEE2E2" : "#FEF3C7", color: a.durum === "aktif" ? "#16A34A" : a.durum === "iptal" ? RED : "#D97706" }}>
                    ● {a.durum === "aktif" ? "Aktif" : a.durum === "iptal" ? "İptal" : "Süresi Dolmuş"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
