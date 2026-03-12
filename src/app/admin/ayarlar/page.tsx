"use client";

import { useState } from "react";
import { useAdminToast } from "../AdminToastContext";

const NAVY = "#0A1628"; const TEAL = "#0ABAB5";
const GRAY50 = "#F8FAFC"; const GRAY100 = "#F1F5F9"; const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8"; const GRAY600 = "#475569"; const GRAY800 = "#1E293B";
const GREEN = "#10B981";

export default function AdminAyarlarPage() {
  const { showToast } = useAdminToast();
  const [komisyonOrani, setKomisyonOrani] = useState("5");
  const [paraBirimi, setParaBirimi] = useState("TRY");
  const [smsAktif, setSmsAktif] = useState(true);
  const [emailAktif, setEmailAktif] = useState(true);
  const [smsSaglanici, setSmsSaglanici] = useState("netgsm");
  const [emailSaglanici, setEmailSaglanici] = useState("sendgrid");
  const [smsApiKey, setSmsApiKey] = useState("NGS-****-****");
  const [emailApiKey, setEmailApiKey] = useState("SG.****-****-****");
  const [rezervasyonOnay, setRezervasyon] = useState(true);
  const [odemeOnay, setOdemeOnay] = useState(true);
  const [yorumBildirim, setYorumBildirim] = useState(false);
  const [minRez, setMinRez] = useState("2");
  const [maxRez, setMaxRez] = useState("14");
  const [iptalSure, setIptalSure] = useState("24");

  function saveAll() { showToast("✅ Platform ayarları kaydedildi!", GREEN); }

  const sectionStyle: React.CSSProperties = { background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: "20px 24px", marginBottom: 16 };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 6 };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, boxSizing: "border-box" as const };
  const selStyle: React.CSSProperties = { ...inputStyle, background: "white", cursor: "pointer" };

  function Toggle({ val, setVal, label }: { val: boolean; setVal: (v: boolean) => void; label: string }) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${GRAY100}` }}>
        <span style={{ fontSize: 13, color: GRAY800 }}>{label}</span>
        <div onClick={() => setVal(!val)} style={{ width: 40, height: 22, borderRadius: 20, background: val ? TEAL : GRAY200, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
          <div style={{ position: "absolute", top: 3, left: val ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>⚙️ Platform Ayarları</h2><p style={{ fontSize: 12, color: GRAY400 }}>Sistem geneli yapılandırma</p></div>
        <button onClick={saveAll} style={{ padding: "9px 20px", borderRadius: 9, fontSize: 13, fontWeight: 700, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>💾 Tümünü Kaydet</button>
      </div>

      {/* Komisyon ve Ödeme */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 16, marginTop: 0 }}>💰 Komisyon & Ödeme</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Platform Komisyon Oranı (%)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="number" value={komisyonOrani} onChange={e => setKomisyonOrani(e.target.value)} min={1} max={30} style={{ ...inputStyle, width: 80 }} />
              <span style={{ fontSize: 13, color: GRAY600 }}>% (şu an <strong>%{komisyonOrani}</strong>)</span>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Para Birimi</label>
            <select value={paraBirimi} onChange={e => setParaBirimi(e.target.value)} style={selStyle}>
              <option value="TRY">🇹🇷 TRY — Türk Lirası</option>
              <option value="USD">🇺🇸 USD — Dolar</option>
              <option value="EUR">🇪🇺 EUR — Euro</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>İptal İadesi Süresi (saat)</label>
            <input type="number" value={iptalSure} onChange={e => setIptalSure(e.target.value)} min={1} max={168} style={{ ...inputStyle, width: 100 }} />
          </div>
        </div>
      </div>

      {/* SMS Ayarları */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 16, marginTop: 0 }}>📱 SMS Ayarları</h3>
        <Toggle val={smsAktif} setVal={setSmsAktif} label="SMS Bildirimleri Aktif" />
        <div style={{ opacity: smsAktif ? 1 : 0.5, pointerEvents: smsAktif ? "auto" : "none", marginTop: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>SMS Sağlayıcı</label>
              <select value={smsSaglanici} onChange={e => setSmsSaglanici(e.target.value)} style={selStyle}>
                <option value="netgsm">NetGSM</option>
                <option value="iletimerkezi">İleti Merkezi</option>
                <option value="twilio">Twilio</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>API Anahtarı</label>
              <input type="password" value={smsApiKey} onChange={e => setSmsApiKey(e.target.value)} style={inputStyle} placeholder="API key..." />
            </div>
          </div>
        </div>
      </div>

      {/* E-posta Ayarları */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 16, marginTop: 0 }}>📧 E-posta Ayarları</h3>
        <Toggle val={emailAktif} setVal={setEmailAktif} label="E-posta Bildirimleri Aktif" />
        <div style={{ opacity: emailAktif ? 1 : 0.5, pointerEvents: emailAktif ? "auto" : "none", marginTop: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>E-posta Sağlayıcı</label>
              <select value={emailSaglanici} onChange={e => setEmailSaglanici(e.target.value)} style={selStyle}>
                <option value="sendgrid">SendGrid</option>
                <option value="mailchimp">Mailchimp</option>
                <option value="ses">AWS SES</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>API Anahtarı</label>
              <input type="password" value={emailApiKey} onChange={e => setEmailApiKey(e.target.value)} style={inputStyle} placeholder="API key..." />
            </div>
          </div>
        </div>
      </div>

      {/* Bildirim Tercihleri */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4, marginTop: 0 }}>🔔 Bildirim Tercihleri</h3>
        <p style={{ fontSize: 11, color: GRAY400, marginBottom: 14 }}>Admin paneline gönderilecek bildirimler</p>
        <Toggle val={rezervasyonOnay} setVal={setRezervasyon} label="Yeni rezervasyon onay bildirimleri" />
        <Toggle val={odemeOnay} setVal={setOdemeOnay} label="Ödeme onay bildirimleri" />
        <Toggle val={yorumBildirim} setVal={setYorumBildirim} label="Yeni yorum bildirimleri" />
      </div>

      {/* Rezervasyon Kuralları */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 16, marginTop: 0 }}>📅 Rezervasyon Kuralları</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Min. Rezervasyon Süresi (gün)</label>
            <input type="number" value={minRez} onChange={e => setMinRez(e.target.value)} min={1} max={30} style={{ ...inputStyle, width: 100 }} />
          </div>
          <div>
            <label style={labelStyle}>Maks. Rezervasyon Süresi (gün)</label>
            <input type="number" value={maxRez} onChange={e => setMaxRez(e.target.value)} min={1} max={90} style={{ ...inputStyle, width: 100 }} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={saveAll} style={{ padding: "11px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>💾 Tümünü Kaydet</button>
      </div>
    </>
  );
}
