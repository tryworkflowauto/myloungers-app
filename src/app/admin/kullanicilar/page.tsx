"use client";

import { useState } from "react";
import { useAdminToast } from "../AdminToastContext";

const NAVY = "#0A1628"; const TEAL = "#0ABAB5";
const GRAY50 = "#F8FAFC"; const GRAY100 = "#F1F5F9"; const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8"; const GRAY600 = "#475569"; const GRAY800 = "#1E293B";
const GREEN = "#10B981"; const RED = "#EF4444";

type Rol = "müşteri" | "işletme" | "admin";
type Durum = "aktif" | "pasif";
type Kullanici = { id: number; ad: string; email: string; tesis: string; rol: Rol; kayit: string; durum: Durum; avatarBg: string; inits: string; siparisler?: number; };

const INIT: Kullanici[] = [
  { id: 1, ad: "Zafer Bakır",    email: "zafer@zuzuu.com",     tesis: "Zuzuu Beach Hotel",  rol: "işletme", kayit: "12 Oca 2025", durum: "aktif", avatarBg: "#DBEAFE", inits: "ZB", siparisler: 0 },
  { id: 2, ad: "Ahmet Yılmaz",  email: "ahmet@palmiye.com",   tesis: "Palmiye Beach Club", rol: "işletme", kayit: "3 Şub 2025",  durum: "aktif", avatarBg: "#FEF3C7", inits: "AY" },
  { id: 3, ad: "Emre Kaya",     email: "emre.kaya@gmail.com", tesis: "—",                  rol: "müşteri", kayit: "20 Şub 2025", durum: "aktif", avatarBg: "#DCFCE7", inits: "EK", siparisler: 14 },
  { id: 4, ad: "Selin Çelik",   email: "selin.c@gmail.com",   tesis: "—",                  rol: "müşteri", kayit: "5 Mar 2025",  durum: "aktif", avatarBg: "#EDE9FE", inits: "SÇ", siparisler: 7 },
  { id: 5, ad: "Berk Doğan",    email: "berk.d@hotmail.com",  tesis: "—",                  rol: "müşteri", kayit: "10 Mar 2025", durum: "pasif", avatarBg: "#FEE2E2", inits: "BD", siparisler: 2 },
  { id: 6, ad: "Caner Arslan",  email: "caner@poseidon.com",  tesis: "Poseidon Lux",       rol: "işletme", kayit: "15 Mar 2025", durum: "aktif", avatarBg: "#F0FDF4", inits: "CA" },
  { id: 7, ad: "Superadmin",    email: "admin@myloungers.com","tesis": "—",                rol: "admin",   kayit: "1 Oca 2025",  durum: "aktif", avatarBg: "#FFF7ED", inits: "SA" },
  { id: 8, ad: "Mert Özcan",    email: "mert.o@gmail.com",    tesis: "—",                  rol: "müşteri", kayit: "1 Mar 2025",  durum: "aktif", avatarBg: "#CFFAFE", inits: "MÖ", siparisler: 22 },
  { id: 9, ad: "Elif Şahin",   email: "elif.s@gmail.com",    tesis: "—",                  rol: "müşteri", kayit: "22 Şub 2025", durum: "aktif", avatarBg: "#FCE7F3", inits: "EŞ", siparisler: 5 },
];

export default function AdminKullanicilarPage() {
  const { showToast } = useAdminToast();
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>(INIT);
  const [ara, setAra] = useState("");
  const [filtreRol, setFiltreRol] = useState("tumu");
  const [filtreDurum, setFiltreDurum] = useState("tumu");

  const liste = kullanicilar.filter(k => {
    const araOk = !ara || k.ad.toLowerCase().includes(ara.toLowerCase()) || k.email.toLowerCase().includes(ara.toLowerCase());
    const rolOk = filtreRol === "tumu" || k.rol === filtreRol;
    const durumOk = filtreDurum === "tumu" || k.durum === filtreDurum;
    return araOk && rolOk && durumOk;
  });

  function toggleDurum(id: number) {
    setKullanicilar(p => p.map(k => {
      if (k.id !== id) return k;
      const next = k.durum === "aktif" ? "pasif" : "aktif";
      showToast((next === "aktif" ? "✅ " : "⏸ ") + k.ad + " " + (next === "aktif" ? "aktifleştirildi" : "pasife alındı"), next === "aktif" ? GREEN : undefined);
      return { ...k, durum: next as Durum };
    }));
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
