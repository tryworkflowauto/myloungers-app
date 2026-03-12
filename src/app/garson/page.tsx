"use client";

import { useState } from "react";

const NAVY = "#0A1628";
const TEAL = "#0ABAB5";
const ORANGE = "#F5821F";
const GRAY50 = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const GREEN = "#10B981";
const RED = "#EF4444";
const YELLOW = "#F59E0B";
const BLUE = "#3B82F6";
const PURPLE = "#7C3AED";

type SiparisDurum = "yeni" | "hazirlaniyor" | "yolda" | "teslim";

type SiparisKart = {
  id: string;
  sezlong: string;
  musteri: string;
  bolge: string;
  kisi: number;
  sure: number;
  sureClass: "ok" | "warn" | "danger";
  durum: SiparisDurum;
  urunler: Array<{ emoji: string; isim: string; adet: number }>;
};

// Mock - Siparişler
const MOCK_SIPARISLER: SiparisKart[] = [
  { id: "s1", sezlong: "S-22", musteri: "Ayşe Yıldız", bolge: "Silver", kisi: 2, sure: 22, sureClass: "danger", durum: "yeni", urunler: [{ emoji: "🍹", isim: "Mojito", adet: 2 }, { emoji: "🍟", isim: "Nachos", adet: 1 }] },
  { id: "s2", sezlong: "İ-5", musteri: "Mehmet Kaya", bolge: "İskele", kisi: 2, sure: 11, sureClass: "warn", durum: "hazirlaniyor", urunler: [{ emoji: "🍋", isim: "Limonata", adet: 3 }, { emoji: "🍷", isim: "Rosé Şarap", adet: 1 }] },
  { id: "s3", sezlong: "S-14", musteri: "Banu Koç", bolge: "Silver", kisi: 3, sure: 6, sureClass: "ok", durum: "yolda", urunler: [{ emoji: "🐟", isim: "Izgara Levrek", adet: 2 }] },
];

// Mock - Şezlong grid
const SILVER_SZL = ["S-1", "S-2", "S-3", "S-4", "S-5", "S-6", "S-7", "S-8", "S-9", "S-10", "S-11", "S-12", "S-13", "S-14", "S-15", "S-22", "S-23", "S-24", "S-25", "S-26"];
const SILVER_DURUM: Record<string, "dolu" | "bos" | "rezerve" | "cagri"> = {
  "S-1": "dolu", "S-2": "dolu", "S-3": "bos", "S-4": "dolu", "S-5": "bos", "S-6": "dolu", "S-7": "rezerve", "S-8": "dolu", "S-9": "bos", "S-10": "dolu",
  "S-11": "dolu", "S-12": "bos", "S-13": "dolu", "S-14": "dolu", "S-15": "bos", "S-22": "cagri", "S-23": "dolu", "S-24": "bos", "S-25": "dolu", "S-26": "rezerve",
};
const ISKELE_SZL = ["İ-1", "İ-2", "İ-3", "İ-4", "İ-5", "İ-6", "İ-7", "İ-8", "İ-9", "İ-10", "İ-11", "İ-12", "İ-13", "İ-14", "İ-15"];
const ISKELE_DURUM: Record<string, "dolu" | "bos" | "rezerve"> = {
  "İ-1": "dolu", "İ-2": "dolu", "İ-3": "bos", "İ-4": "dolu", "İ-5": "dolu", "İ-6": "bos", "İ-7": "dolu", "İ-8": "rezerve", "İ-9": "bos", "İ-10": "dolu",
  "İ-11": "dolu", "İ-12": "bos", "İ-13": "dolu", "İ-14": "bos", "İ-15": "rezerve",
};

// Haftalık bar
const HAFTALIK = [
  { gun: "Pzt", h: 60 },
  { gun: "Sal", h: 75 },
  { gun: "Çar", h: 50 },
  { gun: "Per", h: 90 },
  { gun: "Cum", h: 100 },
  { gun: "Cmt", h: 80, color: ORANGE },
  { gun: "Paz", h: 55, dashed: true },
];

export default function GarsonPage() {
  const [sayfa, setSayfa] = useState<"siparisler" | "bolge" | "performans">("siparisler");
  const [aktif, setAktif] = useState(true);
  const [cagriGoster, setCagriGoster] = useState(true);
  const [siparisler, setSiparisler] = useState<SiparisKart[]>(MOCK_SIPARISLER);
  const [toast, setToast] = useState<string | null>(null);

  const siparisGuncelle = (id: string, yeniDurum: SiparisDurum) => {
    if (yeniDurum === "teslim") {
      setSiparisler((p) => p.filter((s) => s.id !== id));
      setToast("✅ Sipariş teslim edildi!");
      setTimeout(() => setToast(null), 2500);
      return;
    }
    setSiparisler((p) => p.map((s) => (s.id === id ? { ...s, durum: yeniDurum } : s)));
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, maxWidth: 420, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* TOPBAR */}
      <header style={{ background: NAVY, padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg," + TEAL + "," + ORANGE + ")", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white" }}>MG</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Mehmet Güneş</div>
            <div style={{ fontSize: 10, color: TEAL }}>🛵 Garson · Bölge: Silver & İskele</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setAktif(!aktif)} style={{ padding: "5px 12px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", background: aktif ? GREEN : GRAY400, color: "white" }}>● {aktif ? "Aktif" : "Pasif"}</button>
          <button style={{ position: "relative", background: "rgba(255,255,255,0.1)", border: "none", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>🔔<span style={{ position: "absolute", top: -2, right: -2, background: RED, color: "white", fontSize: 9, fontWeight: 800, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>2</span></button>
        </div>
      </header>

      {/* SCROLL ALAN */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 80px" }}>
        {/* SİPARİŞLER SAYFASI */}
        {sayfa === "siparisler" && (
          <>
            {cagriGoster && (
              <div style={{ background: "linear-gradient(135deg," + RED + ",#9B1C1C)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>🔔</span>
                  <div>
                    <strong style={{ display: "block", fontSize: 15, fontWeight: 800, color: "white" }}>Müşteri Çağırıyor!</strong>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Şezlong S-22 · Ayşe Y. · 1 dk önce</p>
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: 18, fontWeight: 900, color: "white" }}>S-22</span>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Silver Bölge · 2. Sıra</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>Not:</p>
                    <p style={{ fontSize: 12, color: "white" }}>&quot;Hesabı alabilir miyiz?&quot;</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setCagriGoster(false)} style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: "white", color: RED }}>✓ Geliyorum</button>
                  <button onClick={() => setCagriGoster(false)} style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,0.2)", color: "white" }}>Başkasına Yönlendir</button>
                </div>
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 700, color: GRAY400, marginBottom: 10 }}>Aktif Siparişler ({siparisler.length})</div>

            {siparisler.map((s) => (
              <SiparisKartComp key={s.id} siparis={s} onDurumGuncelle={siparisGuncelle} />
            ))}
          </>
        )}

        {/* BÖLGEM SAYFASI */}
        {sayfa === "bolge" && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: GRAY400, marginBottom: 10 }}>Atandığım Bölgeler</div>
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>🌊 Silver Bölge</h3>
                <span style={{ fontSize: 11, color: GRAY400 }}>22 Dolu · 8 Boş · <span style={{ color: RED, fontWeight: 700 }}>1 Çağrı</span></span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                {SILVER_SZL.map((sz) => {
                  const d = SILVER_DURUM[sz];
                  const st: Record<string, object> = { dolu: { background: "#FFF7ED", color: ORANGE, borderColor: "#FED7AA" }, bos: { background: "#F0FDF4", color: GREEN, borderColor: "#BBF7D0" }, rezerve: { background: "#EFF6FF", color: BLUE, borderColor: "#BFDBFE" }, cagri: { background: "#FEF2F2", color: RED, borderColor: "#FECACA" } };
                  return (
                    <div key={sz} style={{ borderRadius: 8, padding: "8px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${st[d]?.borderColor ?? "transparent"}`, ...st[d] }}>
                      <span style={{ fontSize: 14 }}>{d === "dolu" ? "🟠" : d === "bos" ? "🟢" : d === "rezerve" ? "🔵" : "🔴"}</span>
                      {sz}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>⚓ İskele Bölge</h3>
                <span style={{ fontSize: 11, color: GRAY400 }}>13 Dolu · 7 Boş</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                {ISKELE_SZL.map((sz) => {
                  const d = ISKELE_DURUM[sz];
                  const st: Record<string, object> = { dolu: { background: "#FFF7ED", color: ORANGE, borderColor: "#FED7AA" }, bos: { background: "#F0FDF4", color: GREEN, borderColor: "#BBF7D0" }, rezerve: { background: "#EFF6FF", color: BLUE, borderColor: "#BFDBFE" } };
                  return (
                    <div key={sz} style={{ borderRadius: 8, padding: "8px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${st[d]?.borderColor ?? "transparent"}`, ...st[d] }}>
                      <span style={{ fontSize: 14 }}>{d === "dolu" ? "🟠" : d === "bos" ? "🟢" : "🔵"}</span>
                      {sz}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "4px 0 10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: GRAY600 }}>🟠 Dolu</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: GRAY600 }}>🟢 Boş</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: GRAY600 }}>🔵 Rezerve</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: RED }}>🔴 Çağrı Var</div>
            </div>
          </>
        )}

        {/* PERFORMANS SAYFASI */}
        {sayfa === "performans" && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: GRAY400, marginBottom: 10 }}>Bugünkü Performans</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: 14 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: GREEN }}>34</div>
                <div style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>Teslimat</div>
              </div>
              <div style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: 14 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: BLUE }}>9dk</div>
                <div style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>Ort. Teslimat Süresi</div>
              </div>
              <div style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: 14 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: TEAL }}>18</div>
                <div style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>Hizmet Verilen Müşteri</div>
              </div>
              <div style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: 14 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: PURPLE }}>4.9</div>
                <div style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>⭐ Müşteri Puanı</div>
              </div>
              <div style={{ gridColumn: "1/3", background: "linear-gradient(135deg," + ORANGE + ",#C2410C)", borderRadius: 12, padding: 14, color: "white" }}>
                <div style={{ fontSize: 28, fontWeight: 900 }}>₺280</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>💰 Bugünkü Tip Kazancı</div>
                <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Direkt hesabına aktarılıyor</div>
              </div>
            </div>
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 12 }}>📈 Haftalık Teslimat</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                {HAFTALIK.map((h, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: h.color ?? TEAL, height: h.h + "%", border: h.dashed ? "2px dashed " + TEAL : undefined }} />
                    <span style={{ fontSize: 9, color: h.dashed ? TEAL : GRAY400 }}>{h.gun}{h.dashed ? "●" : ""}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}`, fontSize: 12, fontWeight: 700, color: NAVY }}>Son Teslimler</div>
              <div style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: `4px solid ${GREEN}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: GREEN, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>V-4</div>
                  <div><strong style={{ display: "block", fontSize: 13, fontWeight: 700, color: NAVY }}>Zeynep A.</strong><span style={{ fontSize: 11, color: GRAY400 }}>Teslim edildi · 13:45</span></div>
                </div>
                <span style={{ fontSize: 11, color: GREEN, fontWeight: 700 }}>✓ 8dk</span>
              </div>
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: `4px solid ${GREEN}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: GREEN, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>S-7</div>
                  <div><strong style={{ display: "block", fontSize: 13, fontWeight: 700, color: NAVY }}>Can K.</strong><span style={{ fontSize: 11, color: GRAY400 }}>Teslim edildi · 13:22</span></div>
                </div>
                <span style={{ fontSize: 11, color: GREEN, fontWeight: 700 }}>✓ 11dk</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ALT TAB BAR */}
      <div style={{ background: "white", borderTop: `1px solid ${GRAY200}`, display: "flex", position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, zIndex: 100 }}>
        {[
          { key: "siparisler" as const, icon: "🍽️", label: "Siparişler", badge: siparisler.length },
          { key: "bolge" as const, icon: "🏖️", label: "Bölgem", badge: cagriGoster ? 1 : undefined },
          { key: "performans" as const, icon: "📊", label: "Performans" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setSayfa(t.key)}
            style={{ flex: 1, padding: "10px 4px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", border: "none", background: "none", position: "relative" }}
          >
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: sayfa === t.key ? TEAL : GRAY400 }}>{t.label}</span>
            {t.badge !== undefined && t.badge > 0 && (
              <span style={{ position: "absolute", top: 6, marginLeft: 14, background: t.key === "bolge" ? RED : ORANGE, color: "white", fontSize: 9, fontWeight: 800, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: GREEN, color: "white", padding: "10px 20px", borderRadius: 20, fontSize: 13, fontWeight: 700, zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function SiparisKartComp({ siparis, onDurumGuncelle }: { siparis: SiparisKart; onDurumGuncelle: (id: string, durum: SiparisDurum) => void }) {
  const { durum } = siparis;
  const borderColor = durum === "yeni" ? ORANGE : durum === "hazirlaniyor" ? YELLOW : durum === "yolda" ? BLUE : GREEN;
  const sureBg = siparis.sureClass === "danger" ? "#FEE2E2" : siparis.sureClass === "warn" ? "#FEF3C7" : "#DCFCE7";
  const sureColor = siparis.sureClass === "danger" ? RED : siparis.sureClass === "warn" ? "#D97706" : "#16A34A";
  const chipStyle = durum === "yeni" ? { bg: "#EFF6FF", color: BLUE } : durum === "hazirlaniyor" ? { bg: "#FEF3C7", color: "#D97706" } : { bg: "#EDE9FE", color: PURPLE };

  const DurumAkisi = ({ done1, done2, active }: { done1?: boolean; done2?: boolean; active: "hazir" | "yolda" | "teslim" }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 14px", background: GRAY50, borderRadius: 10, marginTop: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, border: `2px solid ${done1 ? GREEN : GRAY200}`, background: done1 ? GREEN : "white" }}>✓</div>
        <div style={{ fontSize: 9, color: GRAY400, textAlign: "center" }}>Alındı</div>
      </div>
      <div style={{ flex: 1, height: 2, background: done1 ? GREEN : GRAY200, marginTop: -16 }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, border: `2px solid ${active === "hazir" ? TEAL : done2 ? GREEN : GRAY200}`, background: active === "hazir" ? TEAL : done2 ? GREEN : "white" }}>{active === "hazir" ? "⏳" : "✓"}</div>
        <div style={{ fontSize: 9, color: GRAY400, textAlign: "center" }}>Hazırlanıyor</div>
      </div>
      <div style={{ flex: 1, height: 2, background: done2 ? GREEN : GRAY200, marginTop: -16 }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, border: `2px solid ${active === "yolda" ? TEAL : GRAY200}`, background: active === "yolda" ? TEAL : "white" }}>🛵</div>
        <div style={{ fontSize: 9, color: GRAY400, textAlign: "center" }}>Yolda</div>
      </div>
      <div style={{ flex: 1, height: 2, background: GRAY200, marginTop: -16 }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, border: `2px solid ${active === "teslim" ? TEAL : GRAY200}`, background: active === "teslim" ? TEAL : "white" }}>✓</div>
        <div style={{ fontSize: 9, color: GRAY400, textAlign: "center" }}>Teslim</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 10, borderLeft: `4px solid ${borderColor}` }}>
      <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: NAVY, color: TEAL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>{siparis.sezlong}</div>
          <div>
            <strong style={{ display: "block", fontSize: 13, fontWeight: 700, color: NAVY }}>{siparis.musteri}</strong>
            <span style={{ fontSize: 11, color: GRAY400 }}>{siparis.bolge} · {siparis.kisi} Kişi</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 20, background: sureBg, color: sureColor }}>{siparis.sure}dk</span>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: chipStyle.bg, color: chipStyle.color }}>
            {durum === "yeni" ? "Yeni" : durum === "hazirlaniyor" ? "Hazırlanıyor" : "Yolda"}
          </span>
        </div>
      </div>
      <div style={{ padding: "0 14px 10px" }}>
        {siparis.urunler.map((u, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < siparis.urunler.length - 1 ? `1px solid ${GRAY100}` : "none" }}>
            <span style={{ fontSize: 18 }}>{u.emoji}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: NAVY }}>{u.isim}</span>
            <span style={{ fontSize: 12, color: GRAY400 }}>× {u.adet}</span>
          </div>
        ))}
      </div>
      {durum === "hazirlaniyor" && <DurumAkisi done1 active="hazir" />}
      {durum === "yolda" && <DurumAkisi done1 done2 active="yolda" />}
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${GRAY100}`, background: GRAY50 }}>
        {durum === "yeni" && <button onClick={() => onDurumGuncelle(siparis.id, "hazirlaniyor")} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: ORANGE, color: "white" }}>📋 Siparişi Aldım</button>}
        {durum === "hazirlaniyor" && <button onClick={() => onDurumGuncelle(siparis.id, "yolda")} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: BLUE, color: "white" }}>🛵 Yola Çıktım</button>}
        {durum === "yolda" && <button onClick={() => onDurumGuncelle(siparis.id, "teslim")} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: GREEN, color: "white" }}>✅ Teslim Ettim</button>}
      </div>
    </div>
  );
}
