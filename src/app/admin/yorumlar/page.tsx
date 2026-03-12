"use client";

import { useState } from "react";
import { useAdminToast } from "../AdminToastContext";

const NAVY = "#0A1628"; const TEAL = "#0ABAB5";
const GRAY50 = "#F8FAFC"; const GRAY100 = "#F1F5F9"; const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8"; const GRAY600 = "#475569"; const GRAY800 = "#1E293B";
const GREEN = "#10B981"; const RED = "#EF4444"; const ORANGE = "#F5821F";

type Yorum = { id: number; tesis: string; musteri: string; puan: number; tarih: string; metin: string; sikayet: boolean; };

const INIT: Yorum[] = [
  { id: 1, tesis: "Zuzuu Beach Hotel",  musteri: "Emre K.",  puan: 9, tarih: "8 Mar 2026",  metin: "Harika bir deneyimdi, şezlonglar çok temizdi.", sikayet: false },
  { id: 2, tesis: "Palmiye Beach Club", musteri: "Selin Ç.", puan: 7, tarih: "7 Mar 2026",  metin: "Genel olarak iyiydi, personel güler yüzlüydü.", sikayet: false },
  { id: 3, tesis: "Zuzuu Beach Hotel",  musteri: "Mert Ö.",  puan: 3, tarih: "6 Mar 2026",  metin: "Beklentimin altındaydı, fiyatlar çok yüksek.", sikayet: true },
  { id: 4, tesis: "Poseidon Lux",       musteri: "Elif Ş.", puan: 10, tarih: "5 Mar 2026", metin: "Mükemmel, kesinlikle tekrar geleceğim!", sikayet: false },
  { id: 5, tesis: "Olimpia Beach",      musteri: "Deniz A.", puan: 6, tarih: "4 Mar 2026",  metin: "Fena değil ama biraz gürültülüydü.", sikayet: false },
  { id: 6, tesis: "Palmiye Beach Club", musteri: "Kaan B.",  puan: 2, tarih: "3 Mar 2026",  metin: "Berbat! Rezervasyon iptal edildi son dakikada.", sikayet: true },
  { id: 7, tesis: "Zuzuu Beach Hotel",  musteri: "Ayşe T.",  puan: 8, tarih: "2 Mar 2026",  metin: "Çok keyifli bir gündü, tavsiye ederim.", sikayet: false },
];

function Stars({ puan }: { puan: number }) {
  return (
    <span style={{ color: puan >= 7 ? "#F59E0B" : puan >= 4 ? ORANGE : RED, fontWeight: 700, fontSize: 13 }}>
      {"★".repeat(Math.round(puan / 2))}{"☆".repeat(5 - Math.round(puan / 2))} <span style={{ fontSize: 12, marginLeft: 2 }}>{puan}/10</span>
    </span>
  );
}

export default function AdminYorumlarPage() {
  const { showToast } = useAdminToast();
  const [yorumlar, setYorumlar] = useState<Yorum[]>(INIT);
  const [silModal, setSilModal] = useState<Yorum | null>(null);
  const [ara, setAra] = useState("");
  const [filtreTesis, setFiltreTesis] = useState("tumu");
  const [filtrePuan, setFiltrePuan] = useState("tumu");

  const tesisler = Array.from(new Set(INIT.map(y => y.tesis)));

  const liste = yorumlar.filter(y => {
    const araOk = !ara || y.musteri.toLowerCase().includes(ara.toLowerCase()) || y.metin.toLowerCase().includes(ara.toLowerCase());
    const tesisOk = filtreTesis === "tumu" || y.tesis === filtreTesis;
    const puanOk = filtrePuan === "tumu" || (filtrePuan === "yuksek" ? y.puan >= 8 : filtrePuan === "orta" ? y.puan >= 5 && y.puan < 8 : y.puan < 5);
    return araOk && tesisOk && puanOk;
  });

  function yorumSil(y: Yorum) {
    setYorumlar(p => p.filter(x => x.id !== y.id));
    setSilModal(null); showToast("🗑️ Yorum silindi", RED);
  }

  const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" };
  const selStyle: React.CSSProperties = { padding: "8px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 12, background: "white", cursor: "pointer" };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>⭐ Yorum Yönetimi</h2><p style={{ fontSize: 12, color: GRAY400 }}>Tüm tesislerin kullanıcı yorumları</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" placeholder="🔍 Müşteri veya metin ara..." value={ara} onChange={e => setAra(e.target.value)} style={{ padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 12, width: 200 }} />
          <select value={filtreTesis} onChange={e => setFiltreTesis(e.target.value)} style={selStyle}>
            <option value="tumu">Tüm Tesisler</option>
            {tesisler.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filtrePuan} onChange={e => setFiltrePuan(e.target.value)} style={selStyle}>
            <option value="tumu">Tüm Puanlar</option>
            <option value="yuksek">8-10 (Yüksek)</option>
            <option value="orta">5-7 (Orta)</option>
            <option value="dusuk">0-4 (Düşük)</option>
          </select>
        </div>
      </div>

      <div style={{ fontSize: 11, color: GRAY400, marginBottom: 10 }}>{liste.length} yorum — {liste.filter(y => y.sikayet).length} şikayet</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {liste.length === 0 && (
          <div style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: 40, textAlign: "center", color: GRAY400 }}>Yorum bulunamadı</div>
        )}
        {liste.map(y => (
          <div key={y.id} style={{ background: "white", borderRadius: 12, border: `1.5px solid ${y.sikayet ? "#FECACA" : GRAY200}`, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 14 }}>
            {y.sikayet && <div style={{ flexShrink: 0, background: "#FEE2E2", borderRadius: 8, padding: "4px 9px", fontSize: 10, fontWeight: 700, color: RED, alignSelf: "flex-start" }}>⚠️ ŞİKAYET</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: TEAL, background: "#F0FDFA", padding: "2px 8px", borderRadius: 20 }}>{y.tesis}</span>
                <span style={{ fontWeight: 600, color: NAVY, fontSize: 12 }}>{y.musteri}</span>
                <Stars puan={y.puan} />
                <span style={{ fontSize: 11, color: GRAY400 }}>{y.tarih}</span>
              </div>
              <p style={{ fontSize: 12, color: GRAY600, margin: 0, lineHeight: 1.5 }}>&ldquo;{y.metin}&rdquo;</p>
            </div>
            <button onClick={() => setSilModal(y)} style={{ flexShrink: 0, padding: "5px 11px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: `1px solid #FECACA`, background: "#FEF2F2", color: RED, cursor: "pointer" }}>🗑️ Sil</button>
          </div>
        ))}
      </div>

      {silModal && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setSilModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: 40, textAlign: "center", marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 8, textAlign: "center" }}>Yorumu Sil</h3>
            <div style={{ background: GRAY50, borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: GRAY400, marginBottom: 4 }}>{silModal.tesis} — {silModal.musteri} — {silModal.tarih}</div>
              <p style={{ fontSize: 12, color: GRAY600, margin: 0 }}>&ldquo;{silModal.metin}&rdquo;</p>
            </div>
            <p style={{ fontSize: 12, color: GRAY600, marginBottom: 16, textAlign: "center" }}>Bu yorumu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setSilModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => yorumSil(silModal)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", background: RED, color: "white", cursor: "pointer" }}>🗑️ Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
