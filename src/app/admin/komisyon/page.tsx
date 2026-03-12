"use client";

import { useState, useEffect } from "react";
import { useAdminToast } from "../AdminToastContext";

const NAVY    = "#0A1628";
const TEAL    = "#0ABAB5";
const ORANGE  = "#F5821F";
const GRAY50  = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const GREEN   = "#10B981";
const RED     = "#EF4444";
const BLUE    = "#3B82F6";

// ── Types ─────────────────────────────────────────────────────────────────────
type Durum = "onaylandi" | "bekliyor" | "itiraz";
type MutabakatRow = {
  id: number; tesis: string; donem: string;
  hacimVal: number;   // raw number
  iyzicoOran: number; // e.g. 3
  mlOran: number;     // e.g. 5 (gross)
  ozelOran: number;   // per-tesis ML oran override, default 5
  ozelOranEdit: boolean;
  durum: Durum;
};

// ── Derived calculations ───────────────────────────────────────────────────────
function calcRow(r: MutabakatRow) {
  const iyzicoAmt   = Math.round(r.hacimVal * r.iyzicoOran / 100);
  const mlBrutAmt   = Math.round(r.hacimVal * r.ozelOran / 100);
  const mlNetAmt    = mlBrutAmt - iyzicoAmt;
  const isletmeAmt  = r.hacimVal - mlBrutAmt;
  return { iyzicoAmt, mlBrutAmt, mlNetAmt, isletmeAmt };
}

function fmt(n: number) {
  return "₺" + n.toLocaleString("tr-TR");
}

// ── Init data ─────────────────────────────────────────────────────────────────
const INIT_ROWS: MutabakatRow[] = [
  { id: 1, tesis: "Zuzuu Beach Hotel",  donem: "Mart 2026",  hacimVal: 148000, iyzicoOran: 3, mlOran: 5, ozelOran: 5, ozelOranEdit: false, durum: "onaylandi" },
  { id: 2, tesis: "Palmiye Beach Club", donem: "Mart 2026",  hacimVal: 68000,  iyzicoOran: 3, mlOran: 5, ozelOran: 5, ozelOranEdit: false, durum: "bekliyor"  },
  { id: 3, tesis: "Poseidon Lux",       donem: "Mart 2026",  hacimVal: 41000,  iyzicoOran: 3, mlOran: 5, ozelOran: 4, ozelOranEdit: false, durum: "bekliyor"  },
  { id: 4, tesis: "Aqua Blue",          donem: "Şubat 2026", hacimVal: 27000,  iyzicoOran: 3, mlOran: 5, ozelOran: 5, ozelOranEdit: false, durum: "itiraz"    },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminKomisyonPage() {
  const { showToast } = useAdminToast();

  // Para akışı hesaplayıcı
  const [akisTutar,    setAkisTutar]    = useState(2000);
  const [iyzicoOranG,  setIyzicoOranG]  = useState(3);    // global iyzico rate
  const [mlBrutOranG,  setMlBrutOranG]  = useState(5);    // global ML brut rate
  const [iyzicoEdit,   setIyzicoEdit]   = useState(false);
  const [mlEdit,       setMlEdit]       = useState(false);
  const [iyzicoTmp,    setIyzicoTmp]    = useState("3");
  const [mlTmp,        setMlTmp]        = useState("5");
  const [oranDirty,    setOranDirty]    = useState(false);

  // Mutabakatlar
  const [rows,         setRows]         = useState<MutabakatRow[]>(INIT_ROWS);
  const [gondModal,    setGondModal]    = useState(false);
  const [gorModal,     setGorModal]     = useState<MutabakatRow | null>(null);
  const [itirazModal,  setItirazModal]  = useState<MutabakatRow | null>(null);

  // ESC
  useEffect(() => {
    function h(e: KeyboardEvent) {
      if (e.key === "Escape") { setGondModal(false); setGorModal(null); setItirazModal(null); }
    }
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ── Derived values for para akışı
  const iyzicoAmt  = Math.round(akisTutar * iyzicoOranG / 100);
  const mlNetAmt   = Math.round(akisTutar * (mlBrutOranG - iyzicoOranG) / 100);
  const mlBrutAmt  = Math.round(akisTutar * mlBrutOranG / 100);
  const isletmeAmt = akisTutar - mlBrutAmt;

  function saveOranlar() {
    const iyP = parseFloat(iyzicoTmp); const iy = isNaN(iyP) || iyP < 0 ? 0 : iyP;
    const mlP = parseFloat(mlTmp);     const ml = isNaN(mlP) || mlP < 0 ? 0 : mlP;
    setIyzicoOranG(iy); setMlBrutOranG(ml);
    setIyzicoEdit(false); setMlEdit(false);
    setOranDirty(false);
    showToast("✅ Oranlar kaydedildi!", GREEN);
  }

  // ── Row helpers
  function setOzelOran(id: number, val: string) {
    setRows(p => p.map(r => r.id === id ? { ...r, ozelOran: parseFloat(val) || 0 } : r));
  }
  function toggleOzelEdit(id: number) {
    setRows(p => p.map(r => r.id === id ? { ...r, ozelOranEdit: !r.ozelOranEdit } : r));
  }
  function onayla(r: MutabakatRow) {
    setRows(p => p.map(x => x.id === r.id ? { ...x, durum: "onaylandi" as Durum } : x));
    setItirazModal(null);
    showToast("✅ İtiraz onaylandı — komisyon güncellendi", GREEN);
  }
  function reddet(r: MutabakatRow) {
    setRows(p => p.map(x => x.id === r.id ? { ...x, durum: "bekliyor" as Durum } : x));
    setItirazModal(null);
    showToast("✗ İtiraz reddedildi", RED);
  }

  // ── CSV Export
  function csvIndir() {
    const BOM = "\uFEFF";
    const header = ["Tesis","Dönem","İşlem Hacmi","iyzico Gideri","ML Komisyonu","İşletme Aktarımı","Özel Oran","Durum"];
    const dataRows = rows.map(r => {
      const c = calcRow(r);
      return [r.tesis, r.donem, fmt(r.hacimVal), fmt(c.iyzicoAmt), fmt(c.mlNetAmt), fmt(c.isletmeAmt), "%" + r.ozelOran, r.durum];
    });
    const csv = BOM + [header, ...dataRows].map(row => row.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "mutabakatlar.csv"; a.click();
    URL.revokeObjectURL(url);
    showToast("📥 Excel indirildi", GREEN);
  }

  const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" };
  const inlineInput: React.CSSProperties = { width: 44, padding: "3px 6px", border: `1.5px solid ${TEAL}`, borderRadius: 6, fontSize: 12, fontWeight: 700, textAlign: "center" };
  const thStyle: React.CSSProperties = { padding: "10px 14px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left", whiteSpace: "nowrap" };
  const tdStyle: React.CSSProperties = { padding: "11px 14px", borderTop: `1px solid ${GRAY100}`, fontSize: 12 };

  return (
    <div style={{ padding: "20px 24px" }}>

      {/* ── PARA AKIŞI HESAPLAYICI ─────────────────────────────────────────── */}
      <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>💸 Canlı Para Akışı Hesaplayıcı</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: GRAY400 }}>Tutarı veya oranları değiştir → anlık güncellenir</span>
            {oranDirty && (
              <button onClick={saveOranlar} style={{ padding: "5px 12px", fontSize: 11, fontWeight: 700, borderRadius: 8, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>💾 Kaydet</button>
            )}
          </div>
        </div>

        {/* Tutar input */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: GRAY50, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>Müşteri Ödeme Tutarı:</label>
          <input type="number" min={0} value={akisTutar} onChange={e => { const v = Number(e.target.value); setAkisTutar(v < 0 ? 0 : v); }} style={{ padding: "6px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 14, fontWeight: 800, color: BLUE, width: 120 }} />
          <span style={{ fontSize: 11, color: ORANGE, fontStyle: "italic" }}>← Şezlong kirası tutarını gir</span>
        </div>

        {/* Flow cards */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
          {/* Müşteri */}
          <div style={{ borderRadius: 12, padding: "14px 16px", textAlign: "center", minWidth: 130, background: "#EFF6FF", border: `2px solid #BFDBFE` }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>👤</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: BLUE }}>Müşteri</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: BLUE, marginTop: 3 }}>{fmt(akisTutar)}</div>
            <div style={{ fontSize: 10, marginTop: 1, color: GRAY600 }}>Kartından çekilir</div>
          </div>

          <span style={{ fontSize: 22, color: GRAY400, margin: "0 4px" }}>→</span>

          {/* iyzico */}
          <div style={{ borderRadius: 12, padding: "14px 16px", textAlign: "center", minWidth: 150, background: "#FEF2F2", border: `2px solid #FECACA` }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>🏦</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: RED }}>iyzico / Paratica</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: RED, marginTop: 3 }}>{fmt(iyzicoAmt)}</div>
            <div style={{ fontSize: 10, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              {iyzicoEdit ? (
                <input
                  type="number" min={0} max={50} value={iyzicoTmp}
                  onChange={e => { const v = e.target.value; setIyzicoTmp(v); setOranDirty(true); }}
                  onBlur={() => { const v = parseFloat(iyzicoTmp); setIyzicoOranG(isNaN(v) || v < 0 ? 0 : v); }}
                  autoFocus style={{ ...inlineInput, color: RED, borderColor: RED }}
                />
              ) : (
                <span
                  onClick={() => { setIyzicoEdit(true); setIyzicoTmp(String(iyzicoOranG)); setOranDirty(true); }}
                  style={{ cursor: "pointer", fontWeight: 700, color: RED, textDecoration: "underline dotted", fontSize: 11 }}
                  title="Tıkla: düzenle"
                >%{iyzicoOranG}</span>
              )}
              <span style={{ color: GRAY600 }}> işlem ücreti ✏️</span>
            </div>
          </div>

          <span style={{ fontSize: 22, color: GRAY400, margin: "0 4px" }}>+</span>

          {/* MyLoungers */}
          <div style={{ borderRadius: 12, padding: "14px 16px", textAlign: "center", minWidth: 180, background: "#F0FDF4", border: `2px solid #BBF7D0` }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>⚙️</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: GREEN }}>MyLoungers Net</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: GREEN, marginTop: 3 }}>{fmt(mlNetAmt)}</div>
            <div style={{ fontSize: 10, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 3, flexWrap: "wrap" }}>
              {mlEdit ? (
                <input
                  type="number" min={0} max={50} value={mlTmp}
                  onChange={e => { const v = e.target.value; setMlTmp(v); setOranDirty(true); }}
                  onBlur={() => { const v = parseFloat(mlTmp); setMlBrutOranG(isNaN(v) || v < 0 ? 0 : v); }}
                  autoFocus style={{ ...inlineInput, color: GREEN, borderColor: GREEN }}
                />
              ) : (
                <span
                  onClick={() => { setMlEdit(true); setMlTmp(String(mlBrutOranG)); setOranDirty(true); }}
                  style={{ cursor: "pointer", fontWeight: 700, color: GREEN, textDecoration: "underline dotted", fontSize: 11 }}
                  title="Tıkla: düzenle"
                >%{mlBrutOranG}</span>
              )}
              <span style={{ color: GRAY600 }}> brüt - %{iyzicoOranG} iyzico = %{mlBrutOranG - iyzicoOranG} ✏️</span>
            </div>
          </div>

          <span style={{ fontSize: 22, color: GRAY400, margin: "0 4px" }}>+</span>

          {/* İşletme */}
          <div style={{ borderRadius: 12, padding: "14px 16px", textAlign: "center", minWidth: 130, background: "#FFF7ED", border: `2px solid #FED7AA` }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>🏖️</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE }}>İşletme</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: ORANGE, marginTop: 3 }}>{fmt(isletmeAmt)}</div>
            <div style={{ fontSize: 10, marginTop: 1, color: GRAY600 }}>%{100 - mlBrutOranG} otomatik aktarım</div>
          </div>
        </div>

        {oranDirty && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, background: "#FFFBEB", border: `1px solid #FDE68A`, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#92400E" }}>
            ⚠️ Oran değişiklikleri henüz kaydedilmedi.
            <button onClick={saveOranlar} style={{ padding: "4px 12px", fontSize: 11, fontWeight: 700, borderRadius: 7, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>💾 Kaydet</button>
            <button onClick={() => { setIyzicoOranG(3); setMlBrutOranG(5); setIyzicoEdit(false); setMlEdit(false); setOranDirty(false); }} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: `1px solid ${GRAY200}`, background: "white", color: GRAY600, cursor: "pointer" }}>Geri Al</button>
          </div>
        )}

        <div style={{ marginTop: 12, background: GRAY50, borderRadius: 8, padding: "10px 14px", fontSize: 11, color: "#475569" }}>
          💡 <strong>Ek bakiye yüklemelerinde</strong> (sipariş harcaması): MyLoungers komisyon almaz, sadece iyzico %{iyzicoOranG} keser. İşletme net tutarın tamamını alır.
        </div>
      </div>

      {/* ── FİNANSAL ÖZET KARTLARI ────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { val: "₺42.6K", label: "Platform Net Geliri — Mart", sub: "↑ %18 geçen ay",          subColor: GREEN,  topColor: GREEN  },
          { val: "₺8.5K",  label: "iyzico Toplam Gideri — Mart", sub: "İşlem hacminin %3'ü",     subColor: RED,    topColor: RED    },
          { val: "₺284K",  label: "Toplam İşlem Hacmi — Mart",   sub: "Tüm tesisler birleşik",   subColor: TEAL,   topColor: TEAL   },
          { val: "₺261K",  label: "Toplam İşletme Aktarımı",     sub: "%92 otomatik aktarıldı",  subColor: ORANGE, topColor: ORANGE },
        ].map((f, i) => (
          <div key={i} style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: f.topColor }} />
            <div style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 3 }}>{f.val}</div>
            <div style={{ fontSize: 10, color: GRAY400, fontWeight: 600 }}>{f.label}</div>
            <div style={{ fontSize: 10, marginTop: 4, color: f.subColor }}>{f.sub}</div>
          </div>
        ))}
      </div>

      {/* ── AYLIK MUTABAKATLAR TABLOSU ─────────────────────────────────────── */}
      <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>📋 Aylık Mutabakatlar</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={csvIndir} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>📥 Excel İndir</button>
            <button onClick={() => setGondModal(true)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>📨 Tüm İşletmelere Gönder</button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: GRAY50 }}>
                <th style={thStyle}>Tesis</th>
                <th style={thStyle}>Dönem</th>
                <th style={thStyle}>İşlem Hacmi</th>
                <th style={thStyle}>iyzico Gideri</th>
                <th style={thStyle}>Özel Oran</th>
                <th style={thStyle}>ML Komisyonu</th>
                <th style={thStyle}>İşletme Aktarımı</th>
                <th style={thStyle}>Durum</th>
                <th style={thStyle}>Eylem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const c = calcRow(m);
                return (
                  <tr key={m.id} style={{ background: m.durum === "itiraz" ? "#FEF2F2" : undefined }}>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{m.tesis}</td>
                    <td style={tdStyle}>{m.donem}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{fmt(m.hacimVal)}</td>
                    <td style={{ ...tdStyle, color: RED }}>{fmt(c.iyzicoAmt)}</td>

                    {/* Özel Oran */}
                    <td style={tdStyle}>
                      {m.ozelOranEdit ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <input
                            type="number" value={m.ozelOran} min={0} max={30}
                            onChange={e => setOzelOran(m.id, e.target.value)}
                            style={{ width: 48, padding: "3px 6px", border: `1.5px solid ${TEAL}`, borderRadius: 6, fontSize: 12, fontWeight: 700, textAlign: "center" }}
                            autoFocus
                          />
                          <span style={{ fontSize: 11, color: GRAY400 }}>%</span>
                          <button onClick={() => { toggleOzelEdit(m.id); showToast("✅ Oran güncellendi", GREEN); }} style={{ padding: "2px 7px", fontSize: 10, fontWeight: 700, borderRadius: 5, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>✓</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontWeight: 700, color: m.ozelOran !== 5 ? ORANGE : NAVY }}>%{m.ozelOran}</span>
                          {m.ozelOran !== 5 && <span style={{ fontSize: 9, background: "#FFF7ED", color: ORANGE, padding: "1px 5px", borderRadius: 10, fontWeight: 700 }}>Özel</span>}
                          <button onClick={() => toggleOzelEdit(m.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: GRAY400, padding: "0 2px" }} title="Oranı düzenle">✏️</button>
                        </div>
                      )}
                    </td>

                    <td style={{ ...tdStyle, color: TEAL, fontWeight: 700 }}>{fmt(c.mlNetAmt)}</td>
                    <td style={{ ...tdStyle, color: GREEN, fontWeight: 700 }}>{fmt(c.isletmeAmt)}</td>

                    {/* Durum */}
                    <td style={tdStyle}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4, background: m.durum === "onaylandi" ? "#DCFCE7" : m.durum === "bekliyor" ? "#FEF3C7" : "#FEE2E2", color: m.durum === "onaylandi" ? "#16A34A" : m.durum === "bekliyor" ? "#D97706" : RED }}>
                        {m.durum === "onaylandi" ? "✅ Onaylandı" : m.durum === "bekliyor" ? "⏳ Bekliyor" : "⚠️ İtiraz Var"}
                      </span>
                    </td>

                    {/* Eylem */}
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button
                          onClick={() => setGorModal(m)}
                          style={{ padding: "4px 9px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}
                        >👁️ Görüntüle</button>
                        {m.durum === "bekliyor" && (
                          <button
                            onClick={() => showToast("📨 " + m.tesis + "'e ödeme hatırlatması gönderildi!", ORANGE)}
                            style={{ padding: "4px 9px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}
                          >📨 Hatırlat</button>
                        )}
                        {m.durum === "itiraz" && (
                          <button
                            onClick={() => setItirazModal(m)}
                            style={{ padding: "4px 9px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: "1px solid #FECACA", background: "#FEF2F2", color: RED, cursor: "pointer" }}
                          >⚠️ İnceleme Yap</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── GÖRÜNTÜLE MODAL ───────────────────────────────────────────────── */}
      {gorModal && (() => {
        const c = calcRow(gorModal);
        return (
          <div style={overlay} onClick={e => e.target === e.currentTarget && setGorModal(null)}>
            <div style={{ background: "white", borderRadius: 16, padding: 28, width: 460, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>📋 Komisyon Detayı</h3>
                <button onClick={() => setGorModal(null)} style={{ width: 28, height: 28, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
              <div style={{ background: GRAY50, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 2 }}>{gorModal.tesis}</div>
                <div style={{ fontSize: 11, color: GRAY400 }}>Dönem: {gorModal.donem}</div>
              </div>
              {[
                { label: "Toplam İşlem Hacmi",   val: fmt(gorModal.hacimVal), color: NAVY    },
                { label: "iyzico Gideri (%"+gorModal.iyzicoOran+")", val: fmt(c.iyzicoAmt), color: RED },
                { label: "ML Komisyonu Brüt (%"+gorModal.ozelOran+")", val: fmt(Math.round(gorModal.hacimVal * gorModal.ozelOran / 100)), color: TEAL },
                { label: "ML Net Komisyon",       val: fmt(c.mlNetAmt),       color: GREEN   },
                { label: "İşletme Aktarımı",      val: fmt(c.isletmeAmt),     color: ORANGE  },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${GRAY100}`, fontSize: 13 }}>
                  <span style={{ color: GRAY600 }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: row.color }}>{row.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
                <button onClick={() => setGorModal(null)} style={{ padding: "9px 28px", borderRadius: 9, fontSize: 13, fontWeight: 700, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>Kapat</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── İTİRAZ İNCELEME MODAL ────────────────────────────────────────── */}
      {itirazModal && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setItirazModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 480, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: RED }}>⚠️ İtiraz İnceleme</h3>
              <button onClick={() => setItirazModal(null)} style={{ width: 28, height: 28, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ background: "#FEF2F2", border: `1px solid #FECACA`, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{itirazModal.tesis}</div>
              <div style={{ fontSize: 11, color: GRAY400, marginTop: 2 }}>Dönem: {itirazModal.donem} · İşlem Hacmi: {fmt(itirazModal.hacimVal)}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 8 }}>İtiraz Konusu:</div>
              <div style={{ background: GRAY50, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: GRAY600, lineHeight: 1.6 }}>
                İşletme, uygulanan komisyon oranının sözleşmede belirtilen oranla uyuşmadığını belirtiyor. Özel oran anlaşmasının yeniden değerlendirilmesini talep ediyor.
              </div>
            </div>
            <div style={{ background: GRAY50, borderRadius: 9, padding: "12px 14px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: GRAY600 }}>Uygulanan Oran</span>
                <span style={{ fontWeight: 700, color: ORANGE }}>%{itirazModal.ozelOran}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: GRAY600 }}>ML Net Komisyon</span>
                <span style={{ fontWeight: 700, color: TEAL }}>{fmt(calcRow(itirazModal).mlNetAmt)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: GRAY600 }}>İşletme Aktarımı</span>
                <span style={{ fontWeight: 700, color: GREEN }}>{fmt(calcRow(itirazModal).isletmeAmt)}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setItirazModal(null)} style={{ padding: "9px 20px", borderRadius: 9, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => reddet(itirazModal)} style={{ padding: "9px 20px", borderRadius: 9, fontSize: 13, fontWeight: 700, border: `1px solid #FECACA`, background: "#FEF2F2", color: RED, cursor: "pointer" }}>✗ İtirazı Reddet</button>
              <button onClick={() => onayla(itirazModal)} style={{ padding: "9px 20px", borderRadius: 9, fontSize: 13, fontWeight: 700, border: "none", background: GREEN, color: "white", cursor: "pointer" }}>✓ İtirazı Onayla</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TÜM İŞLETMELERE GÖNDER ONAY MODAL ──────────────────────────── */}
      {gondModal && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setGondModal(false)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 400, maxWidth: "95vw", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📨</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 8 }}>Mutabakat E-postası Gönder</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 20 }}>
              <strong>{rows.length} işletmeye</strong> Mart 2026 dönemi mutabakat özeti gönderilecek. Emin misiniz?
            </p>
            <div style={{ background: GRAY50, borderRadius: 9, padding: "10px 14px", marginBottom: 20, textAlign: "left" }}>
              {rows.map(r => (
                <div key={r.id} style={{ fontSize: 12, color: GRAY600, padding: "3px 0", display: "flex", justifyContent: "space-between" }}>
                  <span>{r.tesis}</span>
                  <span style={{ fontWeight: 600 }}>{fmt(calcRow(r).isletmeAmt)} aktarım</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setGondModal(false)} style={{ padding: "9px 22px", borderRadius: 9, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => { setGondModal(false); showToast("📨 " + rows.length + " işletmeye mutabakat e-postası gönderildi!", TEAL); }} style={{ padding: "9px 22px", borderRadius: 9, fontSize: 13, fontWeight: 700, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>📨 Gönder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
