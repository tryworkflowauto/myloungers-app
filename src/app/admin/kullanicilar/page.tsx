"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAdminToast } from "../AdminToastContext";

const NAVY = "#0A1628"; const TEAL = "#0ABAB5";
const GRAY50 = "#F8FAFC"; const GRAY100 = "#F1F5F9"; const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8"; const GRAY600 = "#475569"; const GRAY800 = "#1E293B";
const GREEN = "#10B981"; const RED = "#EF4444";

type Rol = "müşteri" | "işletme" | "admin";
type Durum = "aktif" | "pasif";
type Kullanici = { id: string; ad: string; email: string; tesis: string; rol: Rol; kayit: string; durum: Durum; avatarBg: string; inits: string; siparisler?: number; };

const AVATAR_BGS = ["#DBEAFE", "#FEF3C7", "#DCFCE7", "#EDE9FE", "#FEE2E2", "#F0FDF4", "#FFF7ED", "#CFFAFE", "#FCE7F3"];

function mapKullaniciRow(row: Record<string, unknown>, index: number): Kullanici {
  const ad = typeof row.ad === "string" ? row.ad : "";
  const soyad = typeof row.soyad === "string" ? row.soyad : "";
  const fullName = [ad, soyad].filter(Boolean).join(" ").trim() || ad || "—";
  const tesisler = row.tesisler as { ad?: string | null } | null | undefined;
  const tesisAd = tesisler?.ad && String(tesisler.ad).trim() !== "" ? String(tesisler.ad) : "—";
  const rolRaw = String(row.rol ?? "").toLowerCase();
  let rol: Rol = "müşteri";
  if (rolRaw === "admin") rol = "admin";
  else if (rolRaw === "işletme" || rolRaw === "isletme" || rolRaw === "isletmeci") rol = "işletme";
  const created = row.created_at ? new Date(String(row.created_at)) : null;
  const kayit = created && !Number.isNaN(created.getTime())
    ? created.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const parts = fullName.split(/\s+/).filter(Boolean);
  const inits =
    parts.length >= 2
      ? ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase().slice(0, 2)
      : fullName.slice(0, 2).toUpperCase() || "?";
  return {
    id: String(row.id),
    ad: fullName,
    email: typeof row.email === "string" ? row.email : "",
    tesis: tesisAd,
    rol,
    kayit,
    durum: "aktif",
    avatarBg: AVATAR_BGS[index % AVATAR_BGS.length],
    inits,
  };
}

export default function AdminKullanicilarPage() {
  const { showToast } = useAdminToast();
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([]);
  const [ara, setAra] = useState("");
  const [filtreRol, setFiltreRol] = useState("tumu");
  const [filtreDurum, setFiltreDurum] = useState("tumu");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("kullanicilar")
        .select("id, ad, soyad, email, rol, created_at, tesisler(ad)")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error("Kullanicilar fetch error", error);
        return;
      }
      const rows = (data ?? []) as Record<string, unknown>[];
      setKullanicilar(rows.map((r, i) => mapKullaniciRow(r, i)));
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const liste = kullanicilar.filter(k => {
    const araOk = !ara || k.ad.toLowerCase().includes(ara.toLowerCase()) || k.email.toLowerCase().includes(ara.toLowerCase());
    const rolOk = filtreRol === "tumu" || k.rol === filtreRol;
    const durumOk = filtreDurum === "tumu" || k.durum === filtreDurum;
    return araOk && rolOk && durumOk;
  });

  function toggleDurum(id: string) {
    const k = kullanicilar.find((x) => x.id === id);
    if (!k) return;
    const next = k.durum === "aktif" ? "pasif" : "aktif";
    showToast((next === "aktif" ? "✅ " : "⏸ ") + k.ad + " " + (next === "aktif" ? "aktifleştirildi" : "pasife alındı"), next === "aktif" ? GREEN : undefined);
  }

  const ROL_COLORS: Record<Rol, { bg: string; color: string }> = {
    admin:    { bg: "#EDE9FE", color: "#7C3AED" },
    işletme:  { bg: "#DBEAFE", color: "#1D4ED8" },
    müşteri:  { bg: "#DCFCE7", color: "#15803D" },
  };

  const selStyle: React.CSSProperties = { padding: "8px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 12, background: "white", cursor: "pointer" };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>👤 Kullanıcı Yönetimi</h2><p style={{ fontSize: 12, color: GRAY400 }}>Tüm kayıtlı kullanıcılar</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" placeholder="🔍 Ad veya email ara..." value={ara} onChange={e => setAra(e.target.value)} style={{ padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 12, width: 200 }} />
          <select value={filtreRol} onChange={e => setFiltreRol(e.target.value)} style={selStyle}>
            <option value="tumu">Tüm Roller</option>
            <option value="müşteri">Müşteri</option>
            <option value="işletme">İşletme</option>
            <option value="admin">Admin</option>
          </select>
          <select value={filtreDurum} onChange={e => setFiltreDurum(e.target.value)} style={selStyle}>
            <option value="tumu">Tüm Durumlar</option>
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
          </select>
        </div>
      </div>

      <div style={{ fontSize: 11, color: GRAY400, marginBottom: 10 }}>{liste.length} kullanıcı gösteriliyor</div>

      <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: GRAY50 }}>
                {["Kullanıcı","E-posta","Tesis","Rol","Kayıt Tarihi","Durum","Eylem"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liste.length === 0 && (
                <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: GRAY400 }}>Kullanıcı bulunamadı</td></tr>
              )}
              {liste.map(k => (
                <tr key={k.id}>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: k.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: NAVY }}>{k.inits}</div>
                      <span style={{ fontWeight: 600, color: NAVY }}>{k.ad}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}`, color: GRAY600 }}>{k.email}</td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}`, color: GRAY600 }}>{k.tesis}</td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}` }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: ROL_COLORS[k.rol].bg, color: ROL_COLORS[k.rol].color }}>
                      {k.rol.charAt(0).toUpperCase() + k.rol.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}`, color: GRAY400 }}>{k.kayit}</td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}` }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: k.durum === "aktif" ? "#DCFCE7" : "#FEE2E2", color: k.durum === "aktif" ? "#16A34A" : RED }}>
                      ● {k.durum === "aktif" ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}` }}>
                    <button onClick={() => toggleDurum(k.id)} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>
                      {k.durum === "aktif" ? "⏸ Pasife Al" : "▶ Aktifleştir"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
