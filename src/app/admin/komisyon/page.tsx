"use client";

import { useState } from "react";
import { useAdminToast } from "../AdminToastContext";

const NAVY = "#0A1628";
const TEAL = "#0ABAB5";
const ORANGE = "#F5821F";
const GRAY50 = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8";
const GREEN = "#10B981";
const RED = "#EF4444";
const BLUE = "#3B82F6";

const MUTABAKATLAR = [
  { tesis: "Zuzuu Beach Hotel", donem: "Mart 2026", hacim: "₺148.000", iyzico: "₺4.440", ml: "₺7.400", isletme: "₺136.160", durum: "onaylandi" as const },
  { tesis: "Palmiye Beach Club", donem: "Mart 2026", hacim: "₺68.000", iyzico: "₺2.040", ml: "₺3.400", isletme: "₺62.560", durum: "bekliyor" as const },
  { tesis: "Poseidon Lux", donem: "Mart 2026", hacim: "₺41.000", iyzico: "₺1.230", ml: "₺2.050", isletme: "₺37.720", durum: "bekliyor" as const },
  { tesis: "Aqua Blue", donem: "Şubat 2026", hacim: "₺27.000", iyzico: "₺810", ml: "₺1.350", isletme: "₺24.840", durum: "itiraz" as const },
];

export default function AdminKomisyonPage() {
  const { showToast } = useAdminToast();
  const [akisTutar, setAkisTutar] = useState(2000);

  const iyzico = Math.round(akisTutar * 0.03);
  const myl = Math.round(akisTutar * 0.02);
  const isletme = Math.round(akisTutar * 0.92);

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* PARA AKIŞI */}
      <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>💸 Canlı Para Akışı Hesaplayıcı</div>
          <span style={{ fontSize: 11, color: GRAY400 }}>Tutarı değiştir → dağılım anında güncellenir</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: GRAY50, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>Müşteri Ödeme Tutarı:</label>
          <input type="number" value={akisTutar} onChange={(e) => setAkisTutar(Number(e.target.value) || 0)} style={{ padding: "6px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 14, fontWeight: 800, color: BLUE, width: 120 }} />
          <span style={{ fontSize: 11, color: ORANGE, fontStyle: "italic" }}>← Şezlong kirası tutarını gir</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
          {[
            { icon: "👤", isim: "Müşteri", tutar: "₺" + akisTutar.toLocaleString("tr-TR"), oran: "Kartından çekilir", bg: "#EFF6FF", border: "#BFDBFE", color: BLUE },
            { icon: "→", isim: "", tutar: "", oran: "", sep: true },
            { icon: "🏦", isim: "iyzico / Paratica", tutar: "₺" + iyzico.toLocaleString("tr-TR"), oran: "%3 işlem ücreti", bg: "#FEF2F2", border: "#FECACA", color: RED },
            { icon: "+", isim: "", tutar: "", oran: "", sep: true },
            { icon: "⚙️", isim: "MyLoungers Net", tutar: "₺" + myl.toLocaleString("tr-TR"), oran: "%5 brüt - %3 iyzico = %2", bg: "#F0FDF4", border: "#BBF7D0", color: GREEN },
            { icon: "+", isim: "", tutar: "", oran: "", sep: true },
            { icon: "🏖️", isim: "İşletme", tutar: "₺" + isletme.toLocaleString("tr-TR"), oran: "%92 otomatik aktarım", bg: "#FFF7ED", border: "#FED7AA", color: ORANGE },
          ].map((n, i) =>
            n.sep ? (
              <span key={i} style={{ fontSize: 22, color: GRAY400, margin: "0 4px" }}>{n.icon}</span>
            ) : (
              <div key={i} style={{ borderRadius: 12, padding: "14px 16px", textAlign: "center", minWidth: 130, background: n.bg, border: `2px solid ${n.border}` }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{n.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: n.color }}>{n.isim}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: n.color, marginTop: 3 }}>{n.tutar}</div>
                <div style={{ fontSize: 10, marginTop: 1 }}>{n.oran}</div>
              </div>
            )
          )}
        </div>
        <div style={{ marginTop: 12, background: GRAY50, borderRadius: 8, padding: "10px 14px", fontSize: 11, color: "#475569" }}>
          💡 <strong>Ek bakiye yüklemelerinde</strong> (sipariş harcaması): MyLoungers komisyon almaz, sadece iyzico %3 keser ve bu müşteriye yansıtılır. İşletme net tutarın tamamını alır.
        </div>
      </div>

      {/* FİNANSAL ÖZET */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { val: "₺42.6K", label: "Platform Net Geliri — Mart", sub: "↑ %18 geçen ay", subColor: GREEN, topColor: GREEN },
          { val: "₺8.5K", label: "iyzico Toplam Gideri — Mart", sub: "Toplam işlem hacminin %3'ü", subColor: RED, topColor: RED },
          { val: "₺284K", label: "Toplam İşlem Hacmi — Mart", sub: "Tüm tesisler birleşik", subColor: TEAL, topColor: TEAL },
          { val: "₺261K", label: "Toplam İşletme Aktarımı — Mart", sub: "%92 otomatik aktarıldı", subColor: ORANGE, topColor: ORANGE },
        ].map((f, i) => (
          <div key={i} style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: f.topColor }} />
            <div style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 3 }}>{f.val}</div>
            <div style={{ fontSize: 10, color: GRAY400, fontWeight: 600 }}>{f.label}</div>
            <div style={{ fontSize: 10, marginTop: 4, color: f.subColor }}>{f.sub}</div>
          </div>
        ))}
      </div>

      {/* MUTABAKATLAR */}
      <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>📋 Aylık Mutabakatlar</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: "#1E293B", cursor: "pointer" }}>📥 Excel İndir</button>
            <button onClick={() => showToast("📨 Tüm işletmelere mutabakat e-postası gönderildi!", TEAL)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>📨 Tüm İşletmelere Gönder</button>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: GRAY50 }}>
              <th style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Tesis</th>
              <th style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Dönem</th>
              <th style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>İşlem Hacmi</th>
              <th style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>iyzico Gideri</th>
              <th style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>ML Komisyonu</th>
              <th style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>İşletme Aktarımı</th>
              <th style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Durum</th>
              <th style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left" }}>Eylem</th>
            </tr>
          </thead>
          <tbody>
            {MUTABAKATLAR.map((m, i) => (
              <tr key={i} style={{ background: m.durum === "itiraz" ? "#FEF2F2" : undefined }}>
                <td style={{ padding: "11px 14px", fontWeight: 700, borderTop: `1px solid ${GRAY100}`, fontSize: 12 }}>{m.tesis}</td>
                <td style={{ padding: "11px 14px", borderTop: `1px solid ${GRAY100}`, fontSize: 12 }}>{m.donem}</td>
                <td style={{ padding: "11px 14px", fontWeight: 700, borderTop: `1px solid ${GRAY100}`, fontSize: 12 }}>{m.hacim}</td>
                <td style={{ padding: "11px 14px", color: RED, borderTop: `1px solid ${GRAY100}`, fontSize: 12 }}>{m.iyzico}</td>
                <td style={{ padding: "11px 14px", color: TEAL, fontWeight: 700, borderTop: `1px solid ${GRAY100}`, fontSize: 12 }}>{m.ml}</td>
                <td style={{ padding: "11px 14px", color: GREEN, fontWeight: 700, borderTop: `1px solid ${GRAY100}`, fontSize: 12 }}>{m.isletme}</td>
                <td style={{ padding: "11px 14px", borderTop: `1px solid ${GRAY100}`, fontSize: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4, background: m.durum === "onaylandi" ? "#DCFCE7" : m.durum === "bekliyor" ? "#FEF3C7" : "#FEE2E2", color: m.durum === "onaylandi" ? "#16A34A" : m.durum === "bekliyor" ? "#D97706" : RED }}>
                    {m.durum === "onaylandi" ? "✅ Onaylandı" : m.durum === "bekliyor" ? "⏳ Bekliyor" : "⚠️ İtiraz Var"}
                  </span>
                </td>
                <td style={{ padding: "11px 14px", borderTop: `1px solid ${GRAY100}`, fontSize: 12 }}>
                  {m.durum === "bekliyor" && <button onClick={() => showToast("📨 Hatırlatma e-postası gönderildi!", ORANGE)} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>📨 Hatırlat</button>}
                  {m.durum === "onaylandi" && <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: "#1E293B", cursor: "pointer" }}>Görüntüle</button>}
                  {m.durum === "itiraz" && <button style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "1px solid #FECACA", background: "#FEF2F2", color: RED, cursor: "pointer" }}>İnceleme Yap</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
