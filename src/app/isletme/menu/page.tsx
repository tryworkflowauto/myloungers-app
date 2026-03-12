"use client";

import { useState } from "react";

const NAVY = "#0A1628";
const TEAL = "#0ABAB5";
const GRAY50 = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY300 = "#CBD5E1";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const GREEN = "#10B981";
const RED = "#EF4444";
const ORANGE = "#F5821F";

// Mock data - Kategoriler
const KATEGORILER = [
  { id: "tumu", icon: "📋", name: "Tümü", sub: "Tüm ürünler", count: 42 },
  { id: "soguk", icon: "🥤", name: "Soğuk İçecekler", sub: "8 ürün", count: 8 },
  { id: "sicak", icon: "☕", name: "Sıcak İçecekler", sub: "5 ürün", count: 5 },
  { id: "alkol", icon: "🍹", name: "Alkollü İçecekler", sub: "10 ürün", count: 10 },
  { id: "ana", icon: "🍽️", name: "Ana Yemekler", sub: "9 ürün", count: 9 },
  { id: "atistirma", icon: "🍟", name: "Atıştırmalık", sub: "7 ürün", count: 7 },
  { id: "tatli", icon: "🍦", name: "Tatlılar", sub: "3 ürün", count: 3 },
];

// Mock data - Ürünler
const URUNLER = [
  { icon: "🍹", badges: ["populer"], stok: true, name: "Mojito", desc: "Nane, limon, soda ve beyaz rom ile hazırlanır", price: "₺120", birim: "/ adet", aktif: true },
  { icon: "🍋", badges: ["yeni"], stok: true, name: "Limonata", desc: "Taze sıkılmış limon, şeker, nane", price: "₺45", birim: "/ adet", aktif: true },
  { icon: "🐟", badges: ["populer"], stok: true, name: "Izgara Levrek", desc: "Taze levrek, yanında salata ve limon", price: "₺150", birim: "/ adet", aktif: true },
  { icon: "🍷", badges: ["alkol"], stok: true, name: "Rosé Şarap", desc: "Yerli rosé şarap, bardak veya şişe", price: "₺180", birim: "/ bardak", aktif: true },
  { icon: "🍟", badges: [], stok: true, name: "Nachos", desc: "Cips, salsa sos, guacamole ile", price: "₺65", birim: "/ porsiyon", aktif: true },
  { icon: "☕", badges: [], stok: false, name: "Türk Kahvesi", desc: "⚠️ Stok Yok", descStyle: { color: RED, fontWeight: 600 }, imgBg: "#F1F5F9", price: "₺35", birim: "/ fincan", aktif: false },
  { icon: "🍦", badges: [], stok: true, name: "Dondurma", desc: "3 top dondurma, seçimli tat", price: "₺55", birim: "/ porsiyon", aktif: true },
  { icon: "🥗", badges: [], stok: true, name: "Mevsim Salatası", desc: "Taze mevsim sebzeleri, zeytinyağı", price: "₺70", birim: "/ porsiyon", aktif: true },
  { icon: "🍺", badges: ["alkol"], stok: true, name: "Bira", desc: "Efes, Tuborg — soğuk şişe", price: "₺85", birim: "/ şişe", aktif: true },
];

const EMOJI_OPTS_KAT = ["🥤", "☕", "🍹", "🍺", "🍽️", "🐟", "🥗", "🍟", "🍦", "🍕", "🍰", "🧃"];
const EMOJI_OPTS_URUN = ["🍹", "🥤", "☕", "🍺", "🍷", "🍽️", "🐟", "🥗", "🍟", "🍦", "🍕", "🍔", "🥙", "🍰", "🥐", "🧃"];

function ProductCard({ u, onEdit }: { u: typeof URUNLER[0]; onEdit: () => void }) {
  const [aktif, setAktif] = useState(u.aktif);

  return (
    <div
      className="menu-product-card"
      style={{
        background: "white",
        borderRadius: 14,
        border: `1.5px solid ${GRAY200}`,
        overflow: "hidden",
        transition: "all 0.2s",
        opacity: aktif ? 1 : 0.6,
      }}
    >
      <div style={{ height: 130, background: u.imgBg ?? GRAY100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, position: "relative" }}>
        {u.icon}
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4 }}>
          {u.badges.includes("populer") && <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 20, background: TEAL, color: "white" }}>⭐ Popüler</span>}
          {u.badges.includes("yeni") && <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 20, background: ORANGE, color: "white" }}>🆕 Yeni</span>}
          {u.badges.includes("alkol") && <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 20, background: "#7C3AED", color: "white" }}>🔞 Alkollü</span>}
        </div>
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <button
            title={u.stok ? "Stokta var" : "Stok yok"}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: u.stok ? "#DCFCE7" : "#FEE2E2",
              color: u.stok ? "#16A34A" : RED,
            }}
          >
            {u.stok ? "✓" : "✗"}
          </button>
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 3 }}>{u.name}</div>
        <div style={{ fontSize: 11, color: GRAY400, marginBottom: 10, lineHeight: 1.4, ...u.descStyle }}>{u.desc}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{u.price} <span style={{ fontSize: 10, color: GRAY400, fontWeight: 400 }}>{u.birim}</span></div>
          <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }}>
            <input type="checkbox" checked={aktif} onChange={(e) => setAktif(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span
              style={{
                position: "absolute",
                inset: 0,
                background: aktif ? TEAL : GRAY300,
                borderRadius: 20,
                transition: "0.3s",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  width: 14,
                  height: 14,
                  left: 3,
                  top: 3,
                  background: "white",
                  borderRadius: "50%",
                  transition: "0.3s",
                  transform: aktif ? "translateX(16px)" : "translateX(0)",
                }}
              />
            </span>
          </label>
        </div>
      </div>
      <div style={{ padding: "0 14px 12px", display: "flex", gap: 6 }}>
        <button className="menu-pc-action" onClick={onEdit} style={{ flex: 1, padding: 7, borderRadius: 8, border: `1px solid ${GRAY200}`, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: GRAY800 }}>✏️ Düzenle</button>
        <button className="menu-pc-action menu-pc-danger" style={{ flex: 1, padding: 7, borderRadius: 8, border: `1px solid ${GRAY200}`, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: GRAY800 }}>🗑️ Sil</button>
      </div>
    </div>
  );
}

export default function IsletmeMenuPage() {
  const [seciliKat, setSeciliKat] = useState("tumu");
  const [urunModalOpen, setUrunModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [seciliEmoji, setSeciliEmoji] = useState("🍹");
  const [seciliCatEmoji, setSeciliCatEmoji] = useState("🥤");

  const areaTitle = seciliKat === "tumu" ? "Tüm Ürünler" : KATEGORILER.find((k) => k.id === seciliKat)?.name ?? "Tüm Ürünler";

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", flexDirection: "column", minHeight: "100%" }}>
      {/* TOPBAR */}
      <header style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Menü Yönetimi</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>6 kategori • 42 ürün • 38 aktif</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>👁️ Müşteri Önizleme</button>
          <button onClick={() => setUrunModalOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>➕ Ürün Ekle</button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* KATEGORİ PANELİ */}
        <div style={{ width: 220, background: "white", borderRight: `1px solid ${GRAY200}`, overflowY: "auto", flexShrink: 0, padding: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Kategoriler</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
            {KATEGORILER.map((k) => (
              <div
                key={k.id}
                onClick={() => setSeciliKat(k.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 12px",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: seciliKat === k.id ? "rgba(10,186,181,0.1)" : "transparent",
                  border: seciliKat === k.id ? "1.5px solid rgba(10,186,181,0.3)" : "1.5px solid transparent",
                }}
              >
                <div style={{ fontSize: 18, width: 28, textAlign: "center" }}>{k.icon}</div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", fontSize: 12, fontWeight: 600, color: NAVY }}>{k.name}</strong>
                  <span style={{ fontSize: 10, color: GRAY400 }}>{k.sub}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEAL }}>{k.count}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setCatModalOpen(true)}
            style={{
              width: "100%",
              padding: 9,
              border: `1.5px dashed ${GRAY300}`,
              borderRadius: 10,
              background: "none",
              cursor: "pointer",
              fontSize: 12,
              color: GRAY400,
              transition: "all 0.15s",
            }}
          >
            ➕ Kategori Ekle
          </button>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${GRAY100}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Özet</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: GRAY600 }}>Aktif Ürün</span><span style={{ fontWeight: 700, color: GREEN }}>38</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: GRAY600 }}>Pasif Ürün</span><span style={{ fontWeight: 700, color: GRAY400 }}>4</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: GRAY600 }}>Stok Yok</span><span style={{ fontWeight: 700, color: RED }}>2</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: GRAY600 }}>Ort. Fiyat</span><span style={{ fontWeight: 700, color: NAVY }}>₺87</span></div>
            </div>
          </div>
        </div>

        {/* ÜRÜN ALANI */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{areaTitle}</h2>
              <span style={{ fontSize: 12, color: GRAY400 }}>42 ürün listeleniyor</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <select style={{ padding: "7px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }}>
                <option>Tümü</option>
                <option>Aktif</option>
                <option>Pasif</option>
                <option>Stok Yok</option>
              </select>
              <select style={{ padding: "7px 10px", border: `1px solid ${GRAY200}`, borderRadius: 8, fontSize: 12 }}>
                <option>Fiyata Göre ↕</option>
                <option>Ada Göre A-Z</option>
                <option>En Çok Satılan</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <input type="text" placeholder="🔍  Ürün adı ara..." style={{ flex: 1, width: "100%", padding: "9px 14px", border: `1px solid ${GRAY200}`, borderRadius: 10, fontSize: 12 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {URUNLER.map((u, i) => (
              <ProductCard key={i} u={u} onEdit={() => setUrunModalOpen(true)} />
            ))}
          </div>
        </div>
      </div>

      {/* KATEGORİ EKLE MODAL */}
      {catModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setCatModalOpen(false)}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: 380, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 20 }}>➕ Yeni Kategori</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Kategori İkonu</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {EMOJI_OPTS_KAT.map((e) => (
                  <button key={e} type="button" onClick={() => setSeciliCatEmoji(e)} style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${seciliCatEmoji === e ? TEAL : GRAY200}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer", background: seciliCatEmoji === e ? "rgba(10,186,181,0.1)" : "transparent" }}>{e}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Kategori Adı</label>
              <input type="text" placeholder="örn: Smoothieler" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setCatModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => setCatModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>✅ Ekle</button>
            </div>
          </div>
        </div>
      )}

      {/* ÜRÜN EKLE MODAL */}
      {urunModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setUrunModalOpen(false)}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: 520, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 20 }}>➕ Yeni Ürün Ekle</h3>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Ürün İkonu (Emoji)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {EMOJI_OPTS_URUN.map((e) => (
                  <button key={e} type="button" onClick={() => setSeciliEmoji(e)} style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${seciliEmoji === e ? TEAL : GRAY200}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer", background: seciliEmoji === e ? "rgba(10,186,181,0.1)" : "transparent" }}>{e}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Ürün Adı</label>
                <input type="text" placeholder="örn: Mojito" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Kategori</label>
                <select style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}>
                  <option>Soğuk İçecekler</option>
                  <option>Sıcak İçecekler</option>
                  <option>Alkollü İçecekler</option>
                  <option>Ana Yemekler</option>
                  <option>Atıştırmalık</option>
                  <option>Tatlılar</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Açıklama</label>
              <textarea rows={2} placeholder="Ürün hakkında kısa açıklama..." style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13, resize: "vertical" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Fiyat (₺)</label>
                <input type="number" placeholder="örn: 120" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Birim</label>
                <select style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}>
                  <option>adet</option>
                  <option>porsiyon</option>
                  <option>bardak</option>
                  <option>şişe</option>
                  <option>fincan</option>
                  <option>dilim</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Hazırlama Süresi (dk)</label>
                <input type="number" placeholder="örn: 10" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Etiket</label>
                <select style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}>
                  <option>Etiket Yok</option>
                  <option>⭐ Popüler</option>
                  <option>🆕 Yeni</option>
                  <option>🔞 Alkollü</option>
                  <option>🌱 Vegan</option>
                  <option>🌶️ Acılı</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 }}>Fotoğraf</label>
              <div style={{ border: `2px dashed ${GRAY300}`, borderRadius: 12, padding: 24, textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                <p style={{ fontSize: 12, color: GRAY400 }}><strong style={{ color: TEAL }}>Fotoğraf yükle</strong> veya sürükle bırak</p>
                <p style={{ fontSize: 12, color: GRAY400 }}>PNG, JPG — max 5MB</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: GRAY50, borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Aktif olarak yayınla</div>
                <div style={{ fontSize: 11, color: GRAY400 }}>Müşteriler menüde görebilir</div>
              </div>
              <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: "absolute", inset: 0, background: TEAL, borderRadius: 20 }}>
                  <span style={{ position: "absolute", width: 14, height: 14, left: 3, top: 3, background: "white", borderRadius: "50%", transform: "translateX(16px)" }} />
                </span>
              </label>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setUrunModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => setUrunModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>✅ Ürünü Kaydet</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .menu-product-card:hover { border-color: #0ABAB5 !important; box-shadow: 0 4px 16px rgba(10,186,181,0.12); }
          .menu-pc-action:hover { background: #0A1628 !important; color: white !important; border-color: #0A1628 !important; }
          .menu-pc-danger:hover { background: #EF4444 !important; border-color: #EF4444 !important; }
        `,
      }} />
    </div>
  );
}
