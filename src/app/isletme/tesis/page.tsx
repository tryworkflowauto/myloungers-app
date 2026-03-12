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

// Mock - Kategoriler
const KATEGORILER = [
  { name: "BEACH CLUB", emoji: "🏖️", checked: true },
  { name: "OTEL", emoji: "🏨", checked: true },
  { name: "RESTORAN", emoji: "🍽️", checked: false },
  { name: "SU SPORLARI", emoji: "🌊", checked: false },
];

// Mock - İmkânlar
const IMKANLAR = [
  { emoji: "🏊", name: "Özel Yüzme Havuzu", active: true },
  { emoji: "☕", name: "Kahvaltı Dahil", active: true },
  { emoji: "🍽️", name: "Beach Bar & Restoran", active: true },
  { emoji: "🚗", name: "Ücretsiz Vale Park", active: true },
  { emoji: "🎶", name: "Canlı Müzik (Haftasonları)", active: true },
  { emoji: "🚤", name: "Su Sporları Merkezi", active: true },
  { emoji: "🌍", name: "TR / EN / RU Personel", active: true },
  { emoji: "📱", name: "Ücretsiz Wi-Fi", active: true },
  { emoji: "🅿️", name: "Otopark", active: false },
  { emoji: "♿", name: "Engelli Erişimi", active: false },
  { emoji: "🐾", name: "Evcil Hayvan Kabul", active: false },
  { emoji: "🧖", name: "Spa & Masaj", active: false },
];

// Mock - Çalışma saatleri
const GUNLER = [
  { name: "Pzt", acilis: "09:00", kapanis: "19:00" },
  { name: "Sal", acilis: "09:00", kapanis: "19:00" },
  { name: "Çar", acilis: "09:00", kapanis: "19:00" },
  { name: "Per", acilis: "09:00", kapanis: "19:00" },
  { name: "Cum", acilis: "09:00", kapanis: "21:00" },
  { name: "Cmt", acilis: "09:00", kapanis: "21:00", vurgu: true },
  { name: "Paz", acilis: "09:00", kapanis: "21:00", vurgu: true },
];

// Mock - Kurallar
const KURALLAR = [
  { emoji: "🚫", text: "Evcil hayvan kabul edilmez" },
  { emoji: "🚫", text: "Dışarıdan yiyecek/içecek getirilmez" },
  { emoji: "🚫", text: "18 yaş altı 21:00'dan sonra tesis içinde bulunamaz" },
  { emoji: "✅", text: "Giriş: 09:00 — Çıkış: 19:00" },
  { emoji: "✅", text: "İptal: 48 saat öncesine kadar ücretsiz" },
];

// Mock - Kampanya notları
const KAMPANYA_NOTLARI = [
  { emoji: "🌟", text: "Erken Rezervasyon: 30 gün öncesi %10 indirim" },
  { emoji: "🌟", text: "Grup (5+): %15 indirim" },
  { emoji: "🌟", text: "Hafta içi 3 gün full: Kahvaltı dahil" },
  { emoji: "🌟", text: "Sadakat: 5. rezervasyonda %20 indirim" },
];

// Emoji seçenekleri
const EMOJI_PICKER = ["🏄", "🎯", "🎪", "🛁", "🔒", "🌿", "🎠", "🏋️", "🧊", "🎭", "🌅", "🍷"];

export default function IsletmeTesisPage() {
  const [sections, setSections] = useState<Record<string, boolean>>({ temel: true, foto: true, hakkinda: true, imkan: true, saat: true, video: true, harita: true, ulasim: true, kurallar: true });
  const [imkanlar, setImkanlar] = useState(IMKANLAR);
  const [kurallar, setKurallar] = useState(KURALLAR);
  const [kampanyaNotlari, setKampanyaNotlari] = useState(KAMPANYA_NOTLARI);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("😊");
  const [imkanInput, setImkanInput] = useState("");
  const [kuralInput, setKuralInput] = useState("");
  const [kampanyaInput, setKampanyaInput] = useState("");
  const [kuralEmojiSel, setKuralEmojiSel] = useState("🚫");
  const [kampanyaEmojiSel, setKampanyaEmojiSel] = useState("🌟");
  const [kisaAciklama, setKisaAciklama] = useState("Bodrum'un en güzel koyunda butik beach club & otel deneyimi");
  const [detayAciklama, setDetayAciklama] = useState("Zuzuu Beach Hotel, Bodrum'un en güzel koylarından birinde konumlanan butik bir beach club ve oteldir. Kristal berraklığında deniz suyu ve özel iskelesiyle misafirlerine unutulmaz bir deniz deneyimi sunmaktadır.\n\n100 şezlongluk kapasitesiyle İskele, VIP ve Silver olmak üzere üç farklı bölgede hizmet vermekte; sabah kahvaltısından gün batımı kokteyllerine kadar eksiksiz bir beach club deneyimi sağlamaktadır.");
  const [tesisAktif, setTesisAktif] = useState(true);
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [toast, setToast] = useState(false);
  const [fotoHover, setFotoHover] = useState<number | null>(null);

  const toggleSection = (key: string) => setSections((s) => ({ ...s, [key]: !s[key] }));
  const saveAll = () => { setToast(true); setTimeout(() => setToast(false), 3000); };

  const addImkan = () => {
    if (!imkanInput.trim()) return;
    setImkanlar((prev) => [...prev, { emoji: selectedEmoji, name: imkanInput.trim(), active: true }]);
    setImkanInput("");
    setEmojiPickerOpen(false);
  };

  const addKural = () => {
    if (!kuralInput.trim()) return;
    setKurallar((prev) => [...prev, { emoji: kuralEmojiSel, text: kuralInput.trim() }]);
    setKuralInput("");
  };

  const addKampanya = () => {
    if (!kampanyaInput.trim()) return;
    setKampanyaNotlari((prev) => [...prev, { emoji: kampanyaEmojiSel, text: kampanyaInput.trim() }]);
    setKampanyaInput("");
  };

  const delKural = (i: number, list: "kural" | "kampanya") => {
    if (list === "kural") setKurallar((p) => p.filter((_, j) => j !== i));
    else setKampanyaNotlari((p) => p.filter((_, j) => j !== i));
  };

  const toggleImkan = (i: number) => setImkanlar((p) => p.map((x, j) => (j === i ? { ...x, active: !x.active } : x)));

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", flexDirection: "column", minHeight: "100%" }}>
      {/* TOPBAR */}
      <header style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Tesis Bilgileri</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>Müşteri sayfasında görünen tüm içeriği buradan yönet</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>👁️ Müşteri Önizleme</button>
          <button onClick={saveAll} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>💾 Tümünü Kaydet</button>
        </div>
      </header>

      <div style={{ padding: 24, flex: 1 }}>
        {/* ÖNİZLEME BARI */}
        <div style={{ background: "linear-gradient(135deg," + NAVY + ",#1a2f50)", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: "white", fontWeight: 600 }}>✅ Tesis Yayında — Zuzuu Beach Hotel</p>
            <span style={{ fontSize: 11, color: GRAY400 }}>Son güncelleme: 11 Mart 2026 · Tüm değişiklikler anında müşteri sayfasına yansır</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: GRAY400 }}>Tesis Aktif</span>
            <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }}>
              <input type="checkbox" checked={tesisAktif} onChange={(e) => setTesisAktif(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: "absolute", inset: 0, background: tesisAktif ? TEAL : GRAY300, borderRadius: 20 }}>
                <span style={{ position: "absolute", width: 14, height: 14, left: 3, top: 3, background: "white", borderRadius: "50%", transform: tesisAktif ? "translateX(16px)" : "translateX(0)" }} />
              </span>
            </label>
          </div>
        </div>

        {/* 1. TEMEL BİLGİLER */}
        <SectionCard open={sections.temel} onToggle={() => toggleSection("temel")} icon="📍" iconBg="#EFF6FF" title="Temel Bilgiler" sub="Tesis adı, konum, iletişim">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { label: "Tesis Adı", value: "Zuzuu Beach Hotel", type: "text" },
              { label: "Şehir / İlçe", value: "Bodrum, Muğla", type: "text" },
              { label: "Tam Adres", value: "Kumbahçe Mah. Neyzen Tevfik Cad. No:12, Bodrum", type: "text" },
              { label: "Telefon", value: "+90 252 316 XX XX", type: "tel" },
              { label: "E-posta", value: "info@zuzuubeach.com", type: "email" },
              { label: "Web Sitesi", value: "https://zuzuubeach.com", type: "url" },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6, textTransform: "none", letterSpacing: 0.5 }}>{f.label}</label>
                <input type={f.type as "text"} defaultValue={f.value} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6, textTransform: "none", letterSpacing: 0.5 }}>Tesis Kategorisi</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {KATEGORILER.map((k, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: `1.5px solid ${k.checked ? TEAL : GRAY200}`, borderRadius: 20, cursor: "pointer", background: k.checked ? "#F0FFFE" : "transparent", fontSize: 12, fontWeight: 600, color: k.checked ? NAVY : GRAY600 }}>
                  <input type="checkbox" defaultChecked={k.checked} style={{ accentColor: TEAL }} />
                  {k.emoji} {k.name}
                </label>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* 2. FOTOĞRAF GALERİSİ */}
        <SectionCard open={sections.foto} onToggle={() => toggleSection("foto")} icon="📸" iconBg="#FFF9F5" title="Fotoğraf Galerisi" sub="4 fotoğraf yüklü · Max 20 fotoğraf">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            <div onMouseEnter={() => setFotoHover(0)} onMouseLeave={() => setFotoHover(null)} style={{ gridColumn: "1/3", gridRow: "1/3", aspectRatio: "auto", position: "relative", borderRadius: 10, overflow: "hidden", border: `2px solid ${GRAY200}`, background: "linear-gradient(135deg,#0A1628,#0ABAB5)", minHeight: 200 }}>
              <div style={{ width: "100%", height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", fontSize: 48 }}>🏖️</div>
              <span style={{ position: "absolute", top: 6, left: 6, background: ORANGE, color: "white", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20 }}>Ana Fotoğraf</span>
              {fotoHover === 0 && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <button style={{ background: "white", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: NAVY }}>🔄 Değiştir</button>
                <button style={{ background: RED, color: "white", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🗑️</button>
              </div>}
            </div>
            {[
              { bg: "linear-gradient(135deg,#1a3a5c,#2d6a4f)", emoji: "☕" },
              { bg: "linear-gradient(135deg,#1e4d8c,#0ABAB5)", emoji: "🏊" },
              { bg: "linear-gradient(135deg,#2d1b69,#0A1628)", emoji: "🌙" },
            ].map((f, i) => (
              <div key={i} onMouseEnter={() => setFotoHover(i + 1)} onMouseLeave={() => setFotoHover(null)} style={{ position: "relative", aspectRatio: 1, borderRadius: 10, overflow: "hidden", border: `2px solid ${GRAY200}`, background: f.bg }}>
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", fontSize: 32 }}>{f.emoji}</div>
                {fotoHover === i + 1 && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <button style={{ background: "white", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: NAVY }}>🔄</button>
                  <button style={{ background: RED, color: "white", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🗑️</button>
                </div>}
              </div>
            ))}
            <label style={{ aspectRatio: 1, borderRadius: 10, border: `2px dashed ${GRAY200}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", background: GRAY50 }}>
              <span style={{ fontSize: 24 }}>➕</span>
              <p style={{ fontSize: 11, fontWeight: 600, color: TEAL }}>Fotoğraf Ekle</p>
              <input type="file" accept="image/*" multiple style={{ display: "none" }} />
            </label>
          </div>
          <p style={{ fontSize: 11, color: GRAY400, marginTop: 8 }}>💡 İlk fotoğraf ana görsel olarak kullanılır. Sürükle-bırak ile sıralayabilirsiniz. JPG, PNG, WEBP · Max 10MB</p>
        </SectionCard>

        {/* 3. HAKKINDA */}
        <SectionCard open={sections.hakkinda} onToggle={() => toggleSection("hakkinda")} icon="📝" iconBg="#F0FDF4" title="Tesis Hakkında" sub="Açıklama metni">
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6, textTransform: "none", letterSpacing: 0.5 }}>Kısa Açıklama <span style={{ color: GRAY400, fontWeight: 400, textTransform: "none" }}>(Arama sonuçlarında görünür)</span></label>
            <input type="text" value={kisaAciklama} onChange={(e) => setKisaAciklama(e.target.value)} maxLength={100} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
            <div style={{ fontSize: 10, color: GRAY400, textAlign: "right", marginTop: 3 }}>{kisaAciklama.length}/100</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6, textTransform: "none", letterSpacing: 0.5 }}>Detaylı Açıklama <span style={{ color: GRAY400, fontWeight: 400, textTransform: "none" }}>(Tesis detay sayfasında görünür)</span></label>
            <textarea value={detayAciklama} onChange={(e) => setDetayAciklama(e.target.value)} rows={5} maxLength={800} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, resize: "vertical", minHeight: 100 }} />
            <div style={{ fontSize: 10, color: GRAY400, textAlign: "right", marginTop: 3 }}>{detayAciklama.length}/800</div>
          </div>
        </SectionCard>

        {/* 4. TESİS İMKÂNLARI */}
        <SectionCard open={sections.imkan} onToggle={() => toggleSection("imkan")} icon="✨" iconBg="#F5F3FF" title="Tesis İmkânları" sub={imkanlar.filter((x) => x.active).length + " özellik aktif"}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
            {imkanlar.map((im, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: `1.5px solid ${im.active ? TEAL : GRAY200}`, borderRadius: 10, background: im.active ? "#F0FFFE" : "transparent" }}>
                <span style={{ fontSize: 20 }}>{im.emoji}</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: NAVY }}>{im.name}</span>
                <label style={{ cursor: "pointer" }}>
                  <input type="checkbox" checked={im.active} onChange={() => toggleImkan(i)} style={{ accentColor: TEAL, width: 16, height: 16, cursor: "pointer" }} />
                </label>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${GRAY100}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY600, textTransform: "none", letterSpacing: 0.5, marginBottom: 8 }}>Özel İmkan Ekle</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div onClick={() => setEmojiPickerOpen(!emojiPickerOpen)} style={{ width: 36, height: 36, border: `1.5px solid ${GRAY200}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer" }}>{selectedEmoji}</div>
              <input type="text" placeholder="İmkan adı yazın..." value={imkanInput} onChange={(e) => setImkanInput(e.target.value)} style={{ flex: 1, padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} onKeyDown={(e) => e.key === "Enter" && addImkan()} />
              <button onClick={addImkan} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>+ Ekle</button>
            </div>
            {emojiPickerOpen && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {EMOJI_PICKER.map((e, i) => (
                  <button key={i} type="button" onClick={() => { setSelectedEmoji(e); setEmojiPickerOpen(false); }} style={{ width: 32, height: 32, border: `1.5px solid ${GRAY200}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", background: "white" }}>{e}</button>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {/* 5. ÇALIŞMA SAATLERİ */}
        <SectionCard open={sections.saat} onToggle={() => toggleSection("saat")} icon="🕐" iconBg="#FFFBEB" title="Çalışma Saatleri" sub="09:00 — 19:00 hafta içi, 09:00 — 21:00 hafta sonu">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {GUNLER.map((g, i) => (
              <div key={i} style={{ background: GRAY50, border: `1.5px solid ${g.vurgu ? TEAL : GRAY200}`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: g.vurgu ? TEAL : NAVY, marginBottom: 8 }}>{g.name}</div>
                <input type="time" defaultValue={g.acilis} style={{ width: "100%", padding: 6, border: `1px solid ${GRAY200}`, borderRadius: 6, fontSize: 11, textAlign: "center" }} />
                <input type="time" defaultValue={g.kapanis} style={{ width: "100%", padding: 6, border: `1px solid ${GRAY200}`, borderRadius: 6, fontSize: 11, textAlign: "center", marginTop: 4 }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 6, fontSize: 9, color: GRAY400, cursor: "pointer" }}><label><input type="checkbox" /> Kapalı</label></div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 6. VİDEO */}
        <SectionCard open={sections.video} onToggle={() => toggleSection("video")} icon="🎬" iconBg="#FEF2F2" title="Tesis Videosu" sub="YouTube veya Vimeo URL">
          <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 10, background: GRAY800, overflow: "hidden", marginBottom: 10 }}>
            <iframe src={videoUrl} allowFullScreen style={{ width: "100%", height: "100%", border: "none" }} title="Video" />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="text" placeholder="https://youtube.com/watch?v=... veya https://vimeo.com/..." style={{ flex: 1, padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
            <button style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>▶ Yükle</button>
            <button onClick={() => { setVideoUrl(""); }} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>✕ Kaldır</button>
          </div>
        </SectionCard>

        {/* 7. KONUM & HARİTA */}
        <SectionCard open={sections.harita} onToggle={() => toggleSection("harita")} icon="🗺️" iconBg="#F0FDF4" title="Konum & Harita" sub="37.0320° K, 27.4300° D · Bodrum">
          <div style={{ width: "100%", height: 260, background: GRAY100, borderRadius: 12, overflow: "hidden", position: "relative", border: `1.5px solid ${GRAY200}` }}>
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: GRAY400 }}>
              <span style={{ fontSize: 36 }}>🗺️</span>
              <p style={{ fontSize: 12, fontWeight: 600 }}>Google Maps burada görünecek</p>
              <span style={{ fontSize: 14, marginTop: 4 }}>📍</span>
              <p style={{ fontSize: 11 }}>Koordinat girerek konumu belirleyin</p>
            </div>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -100%)", fontSize: 32, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>📍</div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <div style={{ flex: 1, marginBottom: 0 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6, textTransform: "none", letterSpacing: 0.5 }}>Enlem (Latitude)</label>
              <input type="text" defaultValue="37.032048" placeholder="37.032048" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
            </div>
            <div style={{ flex: 1, marginBottom: 0 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6, textTransform: "none", letterSpacing: 0.5 }}>Boylam (Longitude)</label>
              <input type="text" defaultValue="27.430012" placeholder="27.430012" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 0 }}>
              <button style={{ height: 42, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>📍 Haritada Göster</button>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 6, textTransform: "none", letterSpacing: 0.5 }}>Google Maps Linki</label>
            <input type="url" defaultValue="https://maps.google.com/?q=Zuzuu+Beach+Hotel+Bodrum" placeholder="https://maps.google.com/..." style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
          </div>
        </SectionCard>

        {/* 8. ULAŞIM REHBERİ */}
        <SectionCard open={sections.ulasim} onToggle={() => toggleSection("ulasim")} icon="🚌" iconBg="#EFF6FF" title="Ulaşım Rehberi" sub="Taksi ve dolmuş bilgileri">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ border: `1.5px solid ${GRAY200}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13, background: "#FFF9F5", borderBottom: `1px solid ${GRAY100}` }}>🚕 Taksi Bilgileri</div>
              <div style={{ padding: 14 }}>
                {[{ label: "Merkeze Uzaklık", value: "Bodrum merkeze 7 dk" }, { label: "Havalimanına Uzaklık", value: "Milas-Bodrum Havalimanı 45 dk" }, { label: "Taksi Telefon 1", value: "+90 252 316 XX XX" }, { label: "Taksi Telefon 2", value: "", placeholder: "+90 ..." }].map((f, i) => (
                  <div key={i} style={{ marginBottom: i < 3 ? 16 : 0 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6, textTransform: "none", letterSpacing: 0.5 }}>{f.label}</label>
                    <input type="text" defaultValue={f.value} placeholder={f.placeholder} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ border: `1.5px solid ${GRAY200}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13, background: "#EFF6FF", borderBottom: `1px solid ${GRAY100}` }}>🚐 Dolmuş Bilgileri</div>
              <div style={{ padding: 14 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6, textTransform: "none", letterSpacing: 0.5 }}>Hat / Güzergah</label>
                  <input type="text" defaultValue="Bodrum - Turgutreis hattı" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6, textTransform: "none", letterSpacing: 0.5 }}>Sefer Saatleri</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="time" defaultValue="07:00" style={{ flex: 1, padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
                    <span style={{ lineHeight: "42px", color: GRAY400 }}>—</span>
                    <input type="time" defaultValue="22:00" style={{ flex: 1, padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6, textTransform: "none", letterSpacing: 0.5 }}>İnilecek Durak</label>
                  <input type="text" defaultValue="Zuzuu Beach durağı" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
                </div>
                <div style={{ marginBottom: 0 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6, textTransform: "none", letterSpacing: 0.5 }}>Ek Not</label>
                  <input type="text" placeholder="örn: Şoföre 'Zuzuu' deyin..." style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 9. KURALLAR & KAMPANYALAR */}
        <SectionCard open={sections.kurallar} onToggle={() => toggleSection("kurallar")} icon="📋" iconBg="#FFF1F2" title="Kurallar & Kampanyalar" sub='Müşteri sayfasında "Bilinmesi Gerekenler" bölümü'>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 10 }}>🚫 Kurallar</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {kurallar.map((k, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: GRAY50, borderRadius: 9, border: `1px solid ${GRAY200}` }}>
                    <span style={{ fontSize: 16 }}>{k.emoji}</span>
                    <span style={{ flex: 1, fontSize: 12, color: NAVY }}>{k.text}</span>
                    <button onClick={() => delKural(i, "kural")} style={{ background: "none", border: "none", color: GRAY400, cursor: "pointer", fontSize: 14, padding: 2 }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <select value={kuralEmojiSel} onChange={(e) => setKuralEmojiSel(e.target.value)} style={{ padding: 8, border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 14 }}>
                  <option>🚫</option><option>✅</option><option>⚠️</option><option>ℹ️</option><option>🔞</option>
                </select>
                <input type="text" placeholder="Kural ekle..." value={kuralInput} onChange={(e) => setKuralInput(e.target.value)} style={{ flex: 1, padding: "8px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 12 }} onKeyDown={(e) => e.key === "Enter" && addKural()} />
                <button onClick={addKural} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>+ Ekle</button>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 10 }}>🎁 Kampanya Notları</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {kampanyaNotlari.map((k, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: GRAY50, borderRadius: 9, border: `1px solid ${GRAY200}` }}>
                    <span style={{ fontSize: 16 }}>{k.emoji}</span>
                    <span style={{ flex: 1, fontSize: 12, color: NAVY }}>{k.text}</span>
                    <button onClick={() => delKural(i, "kampanya")} style={{ background: "none", border: "none", color: GRAY400, cursor: "pointer", fontSize: 14, padding: 2 }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <select value={kampanyaEmojiSel} onChange={(e) => setKampanyaEmojiSel(e.target.value)} style={{ padding: 8, border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 14 }}>
                  <option>🌟</option><option>🎁</option><option>🎯</option><option>💥</option><option>🔥</option>
                </select>
                <input type="text" placeholder="Kampanya notu ekle..." value={kampanyaInput} onChange={(e) => setKampanyaInput(e.target.value)} style={{ flex: 1, padding: "8px 10px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 12 }} onKeyDown={(e) => e.key === "Enter" && addKampanya()} />
                <button onClick={addKampanya} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>+ Ekle</button>
              </div>
              <div style={{ marginTop: 10, padding: 10, background: "#FFFBEB", borderRadius: 8, fontSize: 11, color: "#92400E" }}>
                💡 Aktif kampanyalar otomatik olarak buraya yansır. <a href="#" style={{ color: TEAL }}>Sezon & Fiyatlar&apos;dan yönet →</a>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: GREEN, color: "white", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 500 }}>
          ✅ Tüm değişiklikler kaydedildi!
        </div>
      )}
    </div>
  );
}

function SectionCard({ open, onToggle, icon, iconBg, title, sub, children }: { open: boolean; onToggle: () => void; icon: string; iconBg: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 16 }}>
      <div onClick={onToggle} style={{ padding: "14px 20px", borderBottom: open ? `1px solid ${GRAY100}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, background: iconBg }}>{icon}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{title}</div>
            <div style={{ fontSize: 11, color: GRAY400, marginTop: 1 }}>{sub}</div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: GRAY400, marginLeft: "auto", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
      </div>
      {open && <div style={{ padding: 20 }}>{children}</div>}
    </div>
  );
}
