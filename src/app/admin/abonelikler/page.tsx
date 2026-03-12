"use client";

import { useState } from "react";

const NAVY = "#0A1628"; const TEAL = "#0ABAB5";
const GRAY50 = "#F8FAFC"; const GRAY100 = "#F1F5F9"; const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8"; const GRAY600 = "#475569"; const GRAY800 = "#1E293B";
const GREEN = "#10B981"; const RED = "#EF4444"; const ORANGE = "#F5821F";

type Plan = "Başlangıç" | "Büyüme" | "Kurumsal";
type AboDurum = "aktif" | "suresi-dolmus" | "iptal";
type Abonelik = { id: number; tesis: string; plan: Plan; baslangic: string; bitis: string; tutar: string; durum: AboDurum; emoji: string; emojiBg: string; };

const INIT: Abonelik[] = [
  { id: 1, tesis: "Zuzuu Beach Hotel",  plan: "Kurumsal",  baslangic: "1 Oca 2025", bitis: "31 Ara 2025", tutar: "₺2.400/ay",  durum: "aktif",          emoji: "🌊", emojiBg: "#E0F2FE" },
  { id: 2, tesis: "Palmiye Beach Club", plan: "Büyüme",    baslangic: "1 Şub 2025", bitis: "31 Oca 2026", tutar: "₺1.200/ay",  durum: "aktif",          emoji: "☀️", emojiBg: "#FEF3C7" },
  { id: 3, tesis: "Poseidon Lux",       plan: "Kurumsal",  baslangic: "1 Mar 2025", bitis: "28 Şub 2026", tutar: "₺2.400/ay",  durum: "aktif",          emoji: "🔱", emojiBg: "#EDE9FE" },
  { id: 4, tesis: "Olimpia Beach",      plan: "Başlangıç", baslangic: "1 Oca 2025", bitis: "31 Mar 2025", tutar: "₺490/ay",    durum: "suresi-dolmus",  emoji: "🌴", emojiBg: "#DCFCE7" },
  { id: 5, tesis: "Kemer Sea Club",     plan: "Büyüme",    baslangic: "1 Haz 2024", bitis: "31 May 2025", tutar: "₺1.200/ay",  durum: "iptal",          emoji: "⛵", emojiBg: "#FEF9C3" },
  { id: 6, tesis: "Aqua Park Bodrum",   plan: "Büyüme",    baslangic: "—",          bitis: "—",           tutar: "₺1.200/ay",  durum: "suresi-dolmus",  emoji: "🌊", emojiBg: "#FEE2E2" },
];

const PLAN_COLORS: Record<Plan, { bg: string; color: string }> = {
  "Başlangıç": { bg: "#DCFCE7", color: "#15803D" },
  "Büyüme":    { bg: "#DBEAFE", color: "#1D4ED8" },
  "Kurumsal":  { bg: "#EDE9FE", color: "#7C3AED" },
};

export default function AdminAboneliklerPage() {
  const [filtrePlan, setFiltrePlan] = useState("tumu");
  const [filtreDurum, setFiltreDurum] = useState("tumu");
  const [ara, setAra] = useState("");

  const liste = INIT.filter(a => {
    const planOk = filtrePlan === "tumu" || a.plan === filtrePlan;
    const durumOk = filtreDurum === "tumu" || a.durum === filtreDurum;
    const araOk = !ara || a.tesis.toLowerCase().includes(ara.toLowerCase());
    return planOk && durumOk && araOk;
  });

  const toplam = INIT.filter(a => a.durum === "aktif").reduce((sum) => sum + 1, 0);
  const aylikGelir = INIT.filter(a => a.durum === "aktif").map(a => parseInt(a.tutar.replace(/[^0-9]/g, ""))).reduce((s, v) => s + v, 0);

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
        <div style={cardStyle}><div style={{ fontSize: 11, fontWeight: 600, color: GRAY400, marginBottom: 4 }}>Süresi Dolan</div><div style={{ fontSize: 22, fontWeight: 800, color: ORANGE }}>{INIT.filter(a => a.durum === "suresi-dolmus").length}</div></div>
        <div style={cardStyle}><div style={{ fontSize: 11, fontWeight: 600, color: GRAY400, marginBottom: 4 }}>İptal Edilen</div><div style={{ fontSize: 22, fontWeight: 800, color: RED }}>{INIT.filter(a => a.durum === "iptal").length}</div></div>
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
