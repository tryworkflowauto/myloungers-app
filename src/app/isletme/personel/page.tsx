"use client";

import { useState } from "react";

const NAVY = "#0A1628";
const TEAL = "#0ABAB5";
const ORANGE = "#F5821F";
const GRAY50 = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY300 = "#CBD5E1";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const GREEN = "#10B981";
const RED = "#EF4444";
const YELLOW = "#F59E0B";
const BLUE = "#3B82F6";
const PURPLE = "#7C3AED";

type RolType = "mudur" | "garson" | "mutfak" | "ozel";

const ROL_STYLES: Record<RolType, { bg: string; color: string }> = {
  mudur: { bg: "#F5F3FF", color: PURPLE },
  garson: { bg: "#DBEAFE", color: BLUE },
  mutfak: { bg: "#FEF3C7", color: "#92400E" },
  ozel: { bg: "#DCFCE7", color: "#166534" },
};

const SEZ_TAG_STYLES: Record<string, { bg: string; color: string }> = {
  default: { bg: GRAY100, color: NAVY },
  vip: { bg: "#FFEDD5", color: "#C2410C" },
  gold: { bg: "#F5F3FF", color: PURPLE },
  iskele: { bg: "#FEF3C7", color: "#92400E" },
};

// Mock data - Personel
const PERSONELLER = [
  {
    id: 1,
    inits: "ES",
    name: "Emre Şahin",
    phone: "0532 100 11 22",
    rol: "mudur" as RolType,
    rolLabel: "👑 Müdür",
    avatarBg: "linear-gradient(135deg,#7C3AED,#4C1D95)",
    online: true,
    stats: [
      { v: "—", l: "Teslimat" },
      { v: "—", l: "Ort. Süre" },
      { v: "Tam", l: "Yetki", vColor: TEAL },
    ],
    sezlonglar: null,
    sezlongTitle: null,
    yetkiler: ["Şezlong Haritası", "Rezervasyonlar", "Siparişler", "Menü Yönetimi", "Sezon & Fiyatlar", "Bakiye & Raporlar"],
    yetkiKilitli: [],
    aktif: true,
  },
  {
    id: 2,
    inits: "MG",
    name: "Mehmet Güneş",
    phone: "0533 200 22 33",
    rol: "garson" as RolType,
    rolLabel: "🛵 Garson",
    avatarBg: "linear-gradient(135deg,#0ABAB5,#065F46)",
    online: true,
    stats: [
      { v: "34", l: "Teslimat", vColor: GREEN },
      { v: "9dk", l: "Ort. Süre" },
      { v: "₺280", l: "Tip", vColor: ORANGE },
    ],
    sezlonglar: ["S-1", "S-2", "S-3", "S-4", "S-5", "S-6", "S-7", "S-8", "S-9", "S-10"],
    sezlongTag: "default",
    yetkiler: ["Siparişler", "Atanan Şezlonglar"],
    yetkiKilitli: ["Menü (Kilitli)", "Fiyatlar (Kilitli)"],
    aktif: true,
  },
  {
    id: 3,
    inits: "AT",
    name: "Ayşe Toprak",
    phone: "0534 300 33 44",
    rol: "garson" as RolType,
    rolLabel: "🛵 Garson",
    avatarBg: "linear-gradient(135deg,#F5821F,#92400E)",
    online: true,
    stats: [
      { v: "28", l: "Teslimat", vColor: GREEN },
      { v: "12dk", l: "Ort. Süre" },
      { v: "₺350", l: "Tip", vColor: ORANGE },
    ],
    sezlonglar: ["V-1", "V-2", "V-3", "V-4", "V-5", "G-1", "G-2"],
    sezlongTags: ["vip", "vip", "vip", "vip", "vip", "gold", "gold"],
    yetkiler: ["Siparişler", "Atanan Şezlonglar", "Rezervasyonlar (Görüntüle)"],
    yetkiKilitli: ["Fiyatlar (Kilitli)"],
    aktif: true,
  },
  {
    id: 4,
    inits: "CK",
    name: "Can Kılıç",
    phone: "0535 400 44 55",
    rol: "ozel" as RolType,
    rolLabel: "⚙️ Özel Yetki",
    avatarBg: "linear-gradient(135deg,#10B981,#065F46)",
    online: true,
    stats: [
      { v: "27", l: "Teslimat", vColor: GREEN },
      { v: "11dk", l: "Ort. Süre" },
      { v: "₺190", l: "Tip", vColor: ORANGE },
    ],
    sezlonglar: ["İ-1", "İ-2", "İ-3", "İ-4", "İ-5", "S-11", "S-12", "S-13"],
    sezlongTags: ["iskele", "iskele", "iskele", "iskele", "iskele", "default", "default", "default"],
    yetkiler: ["Siparişler", "Atanan Şezlonglar", "Menü (Görüntüle)"],
    yetkiKilitli: ["Fiyatlar (Kilitli)", "Personel (Kilitli)"],
    aktif: true,
  },
  {
    id: 5,
    inits: "HA",
    name: "Hüseyin Avcı",
    phone: "0536 500 55 66",
    rol: "mutfak" as RolType,
    rolLabel: "👨‍🍳 Mutfak",
    avatarBg: "linear-gradient(135deg,#F59E0B,#92400E)",
    online: true,
    stats: [
      { v: "89", l: "Hazırlanan", vColor: GREEN },
      { v: "8dk", l: "Ort. Hazırlama" },
      { v: "Mutfak", l: "Erişim", vColor: TEAL },
    ],
    sezlonglar: null,
    sezlongTitle: "Erişim Alanı",
    sezlongOzel: ["Mutfak Ekranı", "Sipariş Listesi"],
    yetkiler: ["Mutfak Paneli", "Sipariş Durumu Güncelle"],
    yetkiKilitli: ["Rezervasyonlar (Kilitli)", "Fiyatlar (Kilitli)"],
    aktif: true,
  },
  {
    id: 6,
    inits: "BD",
    name: "Berk Doğan",
    phone: "0537 600 66 77",
    rol: "garson" as RolType,
    rolLabel: "🛵 Garson",
    avatarBg: "linear-gradient(135deg,#94A3B8,#475569)",
    online: false,
    stats: [
      { v: "0", l: "Bugün" },
      { v: "—", l: "Ort. Süre" },
      { v: "Pasif", l: "Durum", vColor: GRAY400 },
    ],
    sezlonglar: null,
    sezlongTitle: "Atanan Şezlonglar",
    noSezlong: true,
    yetkiler: [],
    yetkiKilitli: ["Erişim Kapalı"],
    aktif: false,
  },
];

const YETKI_SECTIONS = [
  { section: "🏖️ Şezlong Haritası", items: [{ name: "Haritayı Görüntüle", desc: "Şezlong durumlarını görebilir", checked: true }, { name: "Şezlong Durumu Değiştir", desc: "Dolu/boş/bakımda yapabilir", checked: false }, { name: "İşletme Rezervi Ayarla", desc: "Şezlong kilitleme/açma", checked: false }] },
  { section: "📋 Rezervasyonlar", items: [{ name: "Rezervasyonları Görüntüle", desc: "Listeyi okuyabilir", checked: true }, { name: "Rezervasyon Oluştur", desc: "Manuel rezervasyon ekleyebilir", checked: false }, { name: "Rezervasyon İptal Et", desc: "İptal işlemi yapabilir", checked: false }] },
  { section: "🍽️ Siparişler", items: [{ name: "Siparişleri Görüntüle", desc: "Aktif siparişleri görebilir", checked: true }, { name: "Sipariş Durumu Güncelle", desc: "Hazırlandı / Teslim edildi yapabilir", checked: true }] },
  { section: "🍹 Menü Yönetimi", items: [{ name: "Menüyü Görüntüle", desc: "Ürün listesini görebilir", checked: true }, { name: "Ürün Ekle / Düzenle", desc: "Menü içeriğini değiştirebilir", checked: false }] },
  { section: "💰 Sezon & Fiyatlar", items: [{ name: "Fiyatları Görüntüle", desc: "Mevcut fiyatları okuyabilir", checked: false }, { name: "Fiyat Güncelle", desc: "Sezlong ve ürün fiyatlarını değiştirebilir", checked: false }] },
  { section: "📊 Bakiye & Raporlar", items: [{ name: "Raporları Görüntüle", desc: "Günlük/aylık gelir raporları", checked: false }, { name: "Bakiye İşlemleri", desc: "Müşteri bakiyesini yükleyebilir/düzenleyebilir", checked: false }] },
];

function PersonelKart({ p, onEdit, onYetki }: { p: typeof PERSONELLER[0]; onEdit: () => void; onYetki: () => void }) {
  const [aktif, setAktif] = useState(p.aktif);
  const rolStyle = ROL_STYLES[p.rol];

  return (
    <div
      className="personel-kart"
      style={{
        background: "white",
        borderRadius: 16,
        border: `1.5px solid ${GRAY200}`,
        overflow: "hidden",
        transition: "all 0.2s",
        opacity: aktif ? 1 : 0.65,
      }}
    >
      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, borderBottom: `1px solid ${GRAY100}` }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "white", background: p.avatarBg }}>{p.inits}</div>
          <div style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: "50%", border: "2px solid white", background: p.online ? GREEN : GRAY300 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 3 }}>{p.name}</div>
          <div style={{ fontSize: 11, color: GRAY400 }}>{p.phone}</div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20, marginTop: 4, background: rolStyle.bg, color: rolStyle.color }}>{p.rolLabel}</span>
        </div>
        <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer", flexShrink: 0 }}>
          <input type="checkbox" checked={aktif} onChange={(e) => setAktif(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
          <span style={{ position: "absolute", inset: 0, background: aktif ? TEAL : GRAY300, borderRadius: 20, transition: "0.3s" }}>
            <span style={{ position: "absolute", width: 14, height: 14, left: 3, top: 3, background: "white", borderRadius: "50%", transition: "0.3s", transform: aktif ? "translateX(16px)" : "translateX(0)" }} />
          </span>
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderBottom: `1px solid ${GRAY100}` }}>
        {p.stats.map((s, i) => (
          <div key={i} style={{ padding: 12, textAlign: "center", borderRight: i < 2 ? `1px solid ${GRAY100}` : "none" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.vColor ?? NAVY }}>{s.v}</div>
            <div style={{ fontSize: 9, color: GRAY400, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {(p.sezlonglar || p.sezlongOzel || p.noSezlong) && (
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>{p.sezlongTitle ?? "Atanan Şezlonglar"}</div>
          {p.noSezlong ? (
            <div style={{ fontSize: 11, color: GRAY400, fontStyle: "italic" }}>Bugün atama yok</div>
          ) : p.sezlongOzel ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {p.sezlongOzel.map((s, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#FEF3C7", color: "#92400E" }}>{s}</span>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {p.sezlonglar!.map((s, i) => {
                const st = "sezlongTags" in p && p.sezlongTags ? SEZ_TAG_STYLES[p.sezlongTags[i]] ?? SEZ_TAG_STYLES.default : SEZ_TAG_STYLES.default;
                return <span key={i} style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: st.bg, color: st.color }}>{s}</span>;
              })}
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Yetkiler</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {p.yetkiler.map((y, i) => (
            <span key={i} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(10,186,181,0.1)", color: TEAL, fontWeight: 600 }}>{y}</span>
          ))}
          {p.yetkiKilitli.map((y, i) => (
            <span key={i} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: GRAY100, color: GRAY400, fontWeight: 600 }}>{y}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 14px", display: "flex", gap: 8, alignItems: "center" }}>
        <button className="pk-action" onClick={onEdit} style={{ flex: 1, padding: 7, borderRadius: 8, border: `1px solid ${GRAY200}`, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: GRAY800 }}>✏️ Düzenle</button>
        <button className="pk-action" onClick={onYetki} style={{ flex: 1, padding: 7, borderRadius: 8, border: `1px solid ${GRAY200}`, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: GRAY800 }}>🔑 Yetkiler</button>
        <button className="pk-action pk-danger" style={{ flex: 1, padding: 7, borderRadius: 8, border: `1px solid ${GRAY200}`, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: GRAY800 }}>🗑️</button>
      </div>
    </div>
  );
}

export default function IsletmePersonelPage() {
  const [personelModalOpen, setPersonelModalOpen] = useState(false);
  const [yetkiModalOpen, setYetkiModalOpen] = useState(false);
  const [yetkiModalName, setYetkiModalName] = useState("");
  const [seciliRol, setSeciliRol] = useState<"garson" | "mutfak" | "mudur">("garson");

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", flexDirection: "column", minHeight: "100%" }}>
      {/* TOPBAR */}
      <header style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Personel Yönetimi</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>6 personel • 5 aktif, 1 pasif</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>📥 Rapor İndir</button>
          <button onClick={() => setPersonelModalOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>➕ Personel Ekle</button>
        </div>
      </header>

      <div style={{ padding: 24, flex: 1 }}>
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { icon: "👥", val: "6", lbl: "Toplam Personel", iconBg: "#DBEAFE", valColor: NAVY },
            { icon: "✅", val: "5", lbl: "Aktif Bugün", iconBg: "#DCFCE7", valColor: GREEN },
            { icon: "🛵", val: "89", lbl: "Toplam Teslimat", iconBg: "#FFEDD5", valColor: ORANGE },
            { icon: "⏱️", val: "11dk", lbl: "Ort. Teslimat Süresi", iconBg: "#F5F3FF", valColor: PURPLE },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", borderRadius: 12, padding: "14px 16px", border: `1px solid ${GRAY200}`, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: s.iconBg }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.valColor, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: GRAY400, marginTop: 3 }}>{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* PERSONEL GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {PERSONELLER.map((p) => (
            <PersonelKart key={p.id} p={p} onEdit={() => setPersonelModalOpen(true)} onYetki={() => { setYetkiModalName(p.name); setYetkiModalOpen(true); }} />
          ))}
        </div>
      </div>

      {/* PERSONEL EKLE/DÜZENLE MODAL */}
      {personelModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setPersonelModalOpen(false)}>
          <div style={{ background: "white", borderRadius: 16, width: 580, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "92vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${GRAY200}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>➕ Personel Ekle</h3>
              <button onClick={() => setPersonelModalOpen(false)} style={{ width: 30, height: 30, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Profil Fotoğrafı</label>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 14, background: `linear-gradient(135deg,${TEAL},${NAVY})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "white" }}>?</div>
                  <div style={{ flex: 1, border: `1.5px dashed ${GRAY300}`, borderRadius: 10, padding: 14, cursor: "pointer" }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>📷</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: TEAL }}>Fotoğraf Yükle</div>
                    <div style={{ fontSize: 10, color: GRAY400 }}>JPG, PNG — max 5MB</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Ad Soyad</label>
                  <input type="text" placeholder="Ad Soyad" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Telefon</label>
                  <input type="tel" placeholder="05xx xxx xx xx" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Rol Seç</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {[
                    { key: "garson", icon: "🛵", name: "Garson", desc: "Sipariş teslim, atanan şezlonglar" },
                    { key: "mutfak", icon: "👨‍🍳", name: "Mutfak", desc: "Mutfak paneli, sipariş hazırla" },
                    { key: "mudur", icon: "👑", name: "Müdür", desc: "Tam işletme paneli erişimi" },
                  ].map((r) => (
                    <button key={r.key} type="button" onClick={() => setSeciliRol(r.key as typeof seciliRol)} style={{ border: `2px solid ${seciliRol === r.key ? TEAL : GRAY200}`, borderRadius: 10, padding: 12, cursor: "pointer", textAlign: "center", background: seciliRol === r.key ? "rgba(10,186,181,0.06)" : "transparent", transition: "all 0.2s" }}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>{r.name}</div>
                      <div style={{ fontSize: 9, color: GRAY400, marginTop: 2 }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              {seciliRol === "garson" && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Atanan Şezlonglar <span style={{ color: GRAY400, fontWeight: 400 }}>(opsiyonel — boş bırakılırsa tüm şezlonglar görünür)</span></label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 10, border: `1px solid ${GRAY200}`, borderRadius: 10, minHeight: 44 }}>
                    <input type="text" placeholder="Şezlong no gir, Enter'a bas (örn: S-1)" style={{ border: "none", outline: "none", fontSize: 12, color: GRAY800, minWidth: 80, flex: 1, padding: "2px 4px" }} />
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: "16px 24px", borderTop: `1px solid ${GRAY200}` }}>
              <button onClick={() => setPersonelModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => setPersonelModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>✅ Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* YETKİ MODAL */}
      {yetkiModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setYetkiModalOpen(false)}>
          <div style={{ background: "white", borderRadius: 16, width: 580, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "92vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${GRAY200}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>🔑 Yetki Yönetimi</h3>
                <div style={{ fontSize: 11, color: GRAY400, marginTop: 2 }}>{yetkiModalName}</div>
              </div>
              <button onClick={() => setYetkiModalOpen(false)} style={{ width: 30, height: 30, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: "#92400E" }}>
                ⚠️ Yetki değişiklikleri personelin panele bir sonraki girişinde aktif olur.
              </div>
              <div style={{ border: `1px solid ${GRAY200}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", padding: "8px 14px", background: GRAY50, gap: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5 }}>Sayfa / İşlev</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: GRAY400, textTransform: "uppercase", letterSpacing: 0.5 }}>Erişim</span>
                </div>
                {YETKI_SECTIONS.map((sec, si) => (
                  <div key={si}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", padding: "11px 14px", background: GRAY50, gap: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: GRAY600 }}>{sec.section}</div>
                      <div />
                    </div>
                    {sec.items.map((item, ii) => (
                      <div key={ii} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", padding: "11px 14px", borderBottom: `1px solid ${GRAY100}`, gap: 10 }}>
                        <div>
                          <strong style={{ display: "block", fontSize: 12, fontWeight: 600, color: NAVY }}>{item.name}</strong>
                          <span style={{ fontSize: 10, color: GRAY400 }}>{item.desc}</span>
                        </div>
                        <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }}>
                          <input type="checkbox" defaultChecked={item.checked} style={{ opacity: 0, width: 0, height: 0 }} />
                          <span style={{ position: "absolute", inset: 0, background: item.checked ? TEAL : GRAY300, borderRadius: 20, transition: "0.3s" }}>
                            <span style={{ position: "absolute", width: 14, height: 14, left: 3, top: 3, background: "white", borderRadius: "50%", transition: "0.3s", transform: item.checked ? "translateX(16px)" : "translateX(0)" }} />
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: "16px 24px", borderTop: `1px solid ${GRAY200}` }}>
              <button onClick={() => setYetkiModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => setYetkiModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>✅ Yetkileri Kaydet</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .personel-kart:hover { border-color: #0ABAB5 !important; box-shadow: 0 4px 20px rgba(10,186,181,0.12); }
          .pk-action:hover { background: #0A1628 !important; color: white !important; border-color: #0A1628 !important; }
          .pk-danger:hover { background: #EF4444 !important; border-color: #EF4444 !important; }
        `,
      }} />
    </div>
  );
}
