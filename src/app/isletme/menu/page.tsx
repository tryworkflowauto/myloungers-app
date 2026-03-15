"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

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

// ── Types ──────────────────────────────────────────────────────────────────
type Urun = {
  id: string;
  icon: string;
  badges: string[];
  stok: boolean;
  name: string;
  desc: string;
  price: string;
  priceNum: number;
  birim: string;
  aktif: boolean;
  kategori: string;
  descStyle?: { color: string; fontWeight: number };
  imgBg?: string;
  photos?: string[];
};

type KategoriItem = {
  id: string;
  icon: string;
  name: string;
};

const EMOJI_OPTS_KAT = ["🥤", "☕", "🍹", "🍺", "🍽️", "🐟", "🥗", "🍟", "🍦", "🍕", "🍰", "🧃"];
const EMOJI_OPTS_URUN = ["🍹", "🥤", "☕", "🍺", "🍷", "🍽️", "🐟", "🥗", "🍟", "🍦", "🍕", "🍔", "🥙", "🍰", "🥐", "🧃", "🍋", "🧉", "🥂"];

const BIRIM_OPTS = ["adet", "porsiyon", "bardak", "şişe", "fincan", "dilim"];
const BADGE_OPTS = [{ val: "", label: "Etiket Yok" }, { val: "populer", label: "⭐ Popüler" }, { val: "yeni", label: "🆕 Yeni" }, { val: "alkol", label: "🔞 Alkollü" }];

const emptyUrunForm = { name: "", desc: "", icon: "🍹", kategori: "", price: "", birim: "adet", badge: "", aktif: true };
const emptyCatForm = { name: "", icon: "🥤" };

// ── ProductCard ────────────────────────────────────────────────────────────
function ProductCard({
  u, onEdit, onSil, onToggle,
}: {
  u: Urun;
  onEdit: () => void;
  onSil: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      className="menu-product-card"
      style={{ background: "white", borderRadius: 14, border: `1.5px solid ${GRAY200}`, overflow: "hidden", transition: "all 0.2s", opacity: u.aktif ? 1 : 0.6 }}
    >
      <div style={{ height: 130, background: u.imgBg ?? GRAY100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, position: "relative", overflow: "hidden" }}>
        {u.photos && u.photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={u.photos[0]} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
        ) : (
          u.icon
        )}
        {/* Multi-photo dots */}
        {u.photos && u.photos.length > 1 && (
          <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
            {u.photos.map((_, i) => (
              <div key={i} style={{ width: i === 0 ? 12 : 6, height: 6, borderRadius: 3, background: i === 0 ? "white" : "rgba(255,255,255,0.5)", transition: "all 0.2s" }} />
            ))}
          </div>
        )}
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4 }}>
          {u.badges.includes("populer") && <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 20, background: TEAL, color: "white" }}>⭐ Popüler</span>}
          {u.badges.includes("yeni") && <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 20, background: ORANGE, color: "white" }}>🆕 Yeni</span>}
          {u.badges.includes("alkol") && <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 20, background: "#7C3AED", color: "white" }}>🔞 Alkollü</span>}
        </div>
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <button
            title={u.stok ? "Stokta var" : "Stok yok"}
            style={{ width: 28, height: 28, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", background: u.stok ? "#DCFCE7" : "#FEE2E2", color: u.stok ? "#16A34A" : RED }}
          >
            {u.stok ? "✓" : "✗"}
          </button>
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 3 }}>{u.name}</div>
        <div style={{ fontSize: 11, color: GRAY400, marginBottom: 10, lineHeight: 1.4, ...u.descStyle }}>{u.desc}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>
            {u.price} <span style={{ fontSize: 10, color: GRAY400, fontWeight: 400 }}>{u.birim}</span>
          </div>
          {/* Toggle */}
          <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }} title={u.aktif ? "Pasife al" : "Aktive et"}>
            <input type="checkbox" checked={u.aktif} onChange={onToggle} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{ position: "absolute", inset: 0, background: u.aktif ? TEAL : GRAY300, borderRadius: 20, transition: "0.3s" }}>
              <span style={{ position: "absolute", width: 14, height: 14, left: 3, top: 3, background: "white", borderRadius: "50%", transition: "0.3s", transform: u.aktif ? "translateX(16px)" : "translateX(0)" }} />
            </span>
          </label>
        </div>
      </div>
      <div style={{ padding: "0 14px 12px", display: "flex", gap: 6 }}>
        <button className="menu-pc-action" onClick={onEdit} style={{ flex: 1, padding: 7, borderRadius: 8, border: `1px solid ${GRAY200}`, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: GRAY800 }}>✏️ Düzenle</button>
        <button className="menu-pc-action menu-pc-danger" onClick={onSil} style={{ flex: 1, padding: 7, borderRadius: 8, border: `1px solid ${GRAY200}`, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 600, color: GRAY800 }}>🗑️ Sil</button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function IsletmeMenuPage() {
  const { data: session } = useSession();
  const tesisId = (session?.user as { tesis_id?: string } | undefined)?.tesis_id ?? null;

  const [urunler, setUrunler] = useState<Urun[]>([]);
  const [kategoriler, setKategoriler] = useState<KategoriItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [seciliKat, setSeciliKat] = useState("tumu");
  const [aramaMetni, setAramaMetni] = useState("");
  const [filtreDurum, setFiltreDurum] = useState("");
  const [siralama, setSiralama] = useState("default");

  // Modals
  const [urunModalOpen, setUrunModalOpen] = useState(false);
  const [editModal, setEditModal] = useState<Urun | null>(null);
  const [silModal, setSilModal] = useState<Urun | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [onizlemeOpen, setOnizlemeOpen] = useState(false);

  // Forms
  const [yeniForm, setYeniForm] = useState(emptyUrunForm);
  const [editForm, setEditForm] = useState(emptyUrunForm);
  const [catForm, setCatForm] = useState(emptyCatForm);

  // Photos (separate from form, because string[] doesn't fit the generic form type)
  const [yeniPhotos, setYeniPhotos] = useState<string[]>([]);
  const [editPhotos, setEditPhotos] = useState<string[]>([]);

  // Lightbox (customer preview image viewer)
  const [lightbox, setLightbox] = useState<{ urun: Urun; idx: number } | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ESC closes all modals
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightbox) { setLightbox(null); return; }
        setUrunModalOpen(false); setEditModal(null);
        setSilModal(null); setCatModalOpen(false); setOnizlemeOpen(false);
        return;
      }
      if (lightbox && lightbox.urun.photos) {
        const len = lightbox.urun.photos.length;
        if (e.key === "ArrowRight") setLightbox((lb) => lb ? { ...lb, idx: (lb.idx + 1) % len } : null);
        if (e.key === "ArrowLeft") setLightbox((lb) => lb ? { ...lb, idx: (lb.idx - 1 + len) % len } : null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Supabase: kategoriler + urunler (tesis_id)
  useEffect(() => {
    if (!tesisId) {
      setKategoriler([]);
      setUrunler([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase.from("menu_kategorileri").select("id, ad, icon, sira").eq("tesis_id", tesisId).eq("aktif", true).order("sira", { ascending: true }),
      supabase.from("menu_urunleri").select("id, kategori_id, ad, aciklama, fiyat, gorsel_url, aktif, icon, birim, badges, stok").eq("tesis_id", tesisId),
    ]).then(([katRes, urunRes]) => {
      if (cancelled) return;
      if (katRes.error) {
        console.error("menu_kategorileri fetch error:", katRes.error);
      }
      const katRows = (katRes.data ?? []) as any[];
      const kats: KategoriItem[] = [{ id: "tumu", icon: "📋", name: "Tümü" }, ...katRows.map((k) => ({ id: String(k.id), icon: (k.icon ?? "📋").trim() || "📋", name: (k.ad ?? "").trim() || "Kategori" }))];
      setKategoriler(kats);

      if (urunRes.error) {
        console.error("menu_urunleri fetch error:", urunRes.error);
      }
      const urunRows = (urunRes.data ?? []) as any[];
      const uruns: Urun[] = urunRows.map((u) => {
        const priceNum = Number(u.fiyat ?? 0);
        const badgesStr = (u.badges ?? "").trim();
        const badgesArr = badgesStr ? badgesStr.split(",").map((b: string) => b.trim()).filter(Boolean) : [];
        const birimRaw = (u.birim ?? "adet").trim() || "adet";
        const photos = u.gorsel_url ? [u.gorsel_url] : [];
        return {
          id: String(u.id),
          icon: (u.icon ?? "🍽️").trim() || "🍽️",
          badges: badgesArr,
          stok: Boolean(u.stok !== false),
          name: (u.ad ?? "").trim() || "—",
          desc: (u.aciklama ?? "").trim() || "",
          price: `₺${priceNum.toLocaleString("tr-TR")}`,
          priceNum,
          birim: `/ ${birimRaw}`,
          aktif: Boolean(u.aktif !== false),
          kategori: u.kategori_id ? String(u.kategori_id) : "",
          photos: photos.length ? photos : undefined,
        };
      });
      setUrunler(uruns);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [tesisId]);

  // ── Actions ────────────────────────────────────────────────────────────
  async function toggleAktif(id: string) {
    const u = urunler.find((x) => x.id === id);
    if (!u) return;
    const next = !u.aktif;
    const { error } = await supabase.from("menu_urunleri").update({ aktif: next }).eq("id", id);
    if (error) {
      console.error("toggleAktif error:", error);
      return;
    }
    setUrunler((prev) =>
      prev.map((x) => (x.id !== id ? x : { ...x, aktif: next }))
    );
    showToast(next ? `✅ ${u.name} aktif yapıldı` : `⏸️ ${u.name} pasif yapıldı`);
  }

  function openEdit(u: Urun) {
    setEditForm({ name: u.name, desc: u.desc, icon: u.icon, kategori: u.kategori, price: String(u.priceNum), birim: u.birim.replace("/ ", ""), badge: u.badges[0] ?? "", aktif: u.aktif });
    setEditPhotos(u.photos ?? []);
    setEditModal(u);
  }

  async function saveEdit() {
    if (!editModal || !tesisId) return;
    const priceNum = Number(editForm.price) || 0;
    const gorselUrl = editPhotos.length > 0 ? editPhotos[0] : null;
    const badgesStr = editForm.badge ? editForm.badge : "";
    const { error } = await supabase
      .from("menu_urunleri")
      .update({
        ad: editForm.name,
        aciklama: editForm.desc || null,
        fiyat: priceNum,
        gorsel_url: gorselUrl,
        icon: editForm.icon,
        birim: editForm.birim,
        badges: badgesStr,
        aktif: editForm.aktif,
        kategori_id: editForm.kategori || null,
      })
      .eq("id", editModal.id);
    if (error) {
      console.error("saveEdit error:", error);
      return;
    }
    setUrunler((prev) =>
      prev.map((u) =>
        u.id === editModal.id
          ? { ...u, name: editForm.name, desc: editForm.desc, icon: editForm.icon, kategori: editForm.kategori, price: `₺${priceNum.toLocaleString("tr-TR")}`, priceNum, birim: `/ ${editForm.birim}`, badges: editForm.badge ? [editForm.badge] : [], aktif: editForm.aktif, photos: editPhotos }
          : u
      )
    );
    setEditModal(null);
    showToast(`✅ ${editForm.name} güncellendi`);
  }

  async function saveUrun() {
    if (!yeniForm.name || !tesisId) return;
    const priceNum = Number(yeniForm.price) || 0;
    const gorselUrl = yeniPhotos.length > 0 ? yeniPhotos[0] : null;
    const kategoriId = yeniForm.kategori && yeniForm.kategori !== "tumu" ? yeniForm.kategori : null;
    const { data: row, error } = await supabase
      .from("menu_urunleri")
      .insert({
        tesis_id: tesisId,
        kategori_id: kategoriId,
        ad: yeniForm.name,
        aciklama: yeniForm.desc || null,
        fiyat: priceNum,
        gorsel_url: gorselUrl,
        icon: yeniForm.icon,
        birim: yeniForm.birim,
        badges: yeniForm.badge || "",
        stok: true,
        aktif: yeniForm.aktif,
      })
      .select("id, kategori_id, ad, aciklama, fiyat, gorsel_url, aktif, icon, birim, badges, stok")
      .single();
    if (error) {
      console.error("saveUrun error:", error);
      return;
    }
    const newUrun: Urun = {
      id: String(row.id),
      icon: (row as any).icon ?? yeniForm.icon,
      badges: (row as any).badges ? String((row as any).badges).split(",").filter(Boolean) : (yeniForm.badge ? [yeniForm.badge] : []),
      stok: true,
      name: (row as any).ad ?? yeniForm.name,
      desc: (row as any).aciklama ?? yeniForm.desc,
      price: `₺${priceNum.toLocaleString("tr-TR")}`,
      priceNum,
      birim: `/ ${(row as any).birim ?? yeniForm.birim}`,
      aktif: yeniForm.aktif,
      kategori: (row as any).kategori_id ? String((row as any).kategori_id) : yeniForm.kategori,
      photos: yeniPhotos.length ? yeniPhotos : undefined,
    };
    setUrunler((prev) => [newUrun, ...prev]);
    setYeniForm(emptyUrunForm);
    setYeniPhotos([]);
    setUrunModalOpen(false);
    showToast(`✅ ${yeniForm.name} menüye eklendi`);
  }

  async function silUrun() {
    if (!silModal) return;
    const { error } = await supabase.from("menu_urunleri").delete().eq("id", silModal.id);
    if (error) {
      console.error("silUrun error:", error);
      return;
    }
    setUrunler((prev) => prev.filter((u) => u.id !== silModal.id));
    showToast(`🗑️ ${silModal.name} silindi`);
    setSilModal(null);
  }

  async function saveKategori() {
    if (!catForm.name || !tesisId) return;
    const { data: row, error } = await supabase
      .from("menu_kategorileri")
      .insert({ tesis_id: tesisId, ad: catForm.name, icon: catForm.icon, sira: 0 })
      .select("id, ad, icon")
      .single();
    if (error) {
      console.error("saveKategori error:", error);
      return;
    }
    const newKat: KategoriItem = { id: String(row.id), icon: (row as any).icon ?? catForm.icon, name: (row as any).ad ?? catForm.name };
    setKategoriler((prev) => prev.filter((k) => k.id !== "tumu").length ? [prev[0], ...prev.slice(1), newKat] : [{ id: "tumu", icon: "📋", name: "Tümü" }, newKat]);
    setCatForm(emptyCatForm);
    setCatModalOpen(false);
    showToast(`✅ "${catForm.name}" kategorisi eklendi`);
  }

  // ── Filtering & Sorting ────────────────────────────────────────────────
  const filtered = urunler
    .filter((u) => {
      if (seciliKat !== "tumu" && u.kategori !== seciliKat) return false;
      if (aramaMetni && !u.name.toLowerCase().includes(aramaMetni.toLowerCase())) return false;
      if (filtreDurum === "aktif" && !u.aktif) return false;
      if (filtreDurum === "pasif" && u.aktif) return false;
      if (filtreDurum === "stok" && u.stok) return false;
      return true;
    })
    .sort((a, b) => {
      if (siralama === "fiyat_asc") return a.priceNum - b.priceNum;
      if (siralama === "fiyat_desc") return b.priceNum - a.priceNum;
      if (siralama === "isim") return a.name.localeCompare(b.name, "tr");
      if (siralama === "kategori") return a.kategori.localeCompare(b.kategori);
      return 0;
    });

  const aktifSayisi = urunler.filter((u) => u.aktif).length;
  const pasifSayisi = urunler.filter((u) => !u.aktif).length;
  const stokYokSayisi = urunler.filter((u) => !u.stok).length;

  // Category counts
  const katCounts: Record<string, number> = { tumu: urunler.length };
  urunler.forEach((u) => { katCounts[u.kategori] = (katCounts[u.kategori] ?? 0) + 1; });

  const areaTitle = seciliKat === "tumu" ? "Tüm Ürünler" : kategoriler.find((k) => k.id === seciliKat)?.name ?? "Tüm Ürünler";

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 5 };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", flexDirection: "column", minHeight: "100%" }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, background: NAVY, color: "white", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {/* TOPBAR */}
      <header style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Menü Yönetimi</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>
            {kategoriler.length - 1} kategori • {urunler.length} ürün • {aktifSayisi} aktif
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setOnizlemeOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>
            👁️ Müşteri Önizleme
          </button>
          <button onClick={() => { setYeniForm(emptyUrunForm); setUrunModalOpen(true); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>
            ➕ Ürün Ekle
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* KATEGORİ PANELİ */}
        <div style={{ width: 220, background: "white", borderRight: `1px solid ${GRAY200}`, overflowY: "auto", flexShrink: 0, padding: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Kategoriler</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
            {kategoriler.map((k) => (
              <div
                key={k.id}
                onClick={() => setSeciliKat(k.id)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, cursor: "pointer", transition: "all 0.15s", background: seciliKat === k.id ? "rgba(10,186,181,0.1)" : "transparent", border: seciliKat === k.id ? "1.5px solid rgba(10,186,181,0.3)" : "1.5px solid transparent" }}
              >
                <div style={{ fontSize: 18, width: 28, textAlign: "center" }}>{k.icon}</div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", fontSize: 12, fontWeight: 600, color: NAVY }}>{k.name}</strong>
                  <span style={{ fontSize: 10, color: GRAY400 }}>{katCounts[k.id] ?? 0} ürün</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEAL }}>{katCounts[k.id] ?? 0}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setCatForm(emptyCatForm); setCatModalOpen(true); }}
            style={{ width: "100%", padding: 9, border: `1.5px dashed ${GRAY300}`, borderRadius: 10, background: "none", cursor: "pointer", fontSize: 12, color: GRAY400, transition: "all 0.15s" }}
          >
            ➕ Kategori Ekle
          </button>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${GRAY100}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: GRAY400, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Özet</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: GRAY600 }}>Aktif Ürün</span><span style={{ fontWeight: 700, color: GREEN }}>{aktifSayisi}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: GRAY600 }}>Pasif Ürün</span><span style={{ fontWeight: 700, color: GRAY400 }}>{pasifSayisi}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: GRAY600 }}>Stok Yok</span><span style={{ fontWeight: 700, color: RED }}>{stokYokSayisi}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: GRAY600 }}>Toplam Ürün</span><span style={{ fontWeight: 700, color: NAVY }}>{urunler.length}</span></div>
            </div>
          </div>
        </div>

        {/* ÜRÜN ALANI */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{areaTitle}</h2>
              <span style={{ fontSize: 12, color: GRAY400 }}>{filtered.length} ürün listeleniyor</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={filtreDurum}
                onChange={(e) => setFiltreDurum(e.target.value)}
                style={{ padding: "7px 10px", border: `1px solid ${filtreDurum ? TEAL : GRAY200}`, borderRadius: 8, fontSize: 12 }}
              >
                <option value="">Tümü</option>
                <option value="aktif">Aktif</option>
                <option value="pasif">Pasif</option>
                <option value="stok">Stok Yok</option>
              </select>
              <select
                value={siralama}
                onChange={(e) => setSiralama(e.target.value)}
                style={{ padding: "7px 10px", border: `1px solid ${siralama !== "default" ? TEAL : GRAY200}`, borderRadius: 8, fontSize: 12 }}
              >
                <option value="default">Varsayılan Sıra</option>
                <option value="fiyat_asc">Fiyata Göre ↑</option>
                <option value="fiyat_desc">Fiyata Göre ↓</option>
                <option value="isim">İsme Göre A-Z</option>
                <option value="kategori">Kategoriye Göre</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              placeholder="🔍  Ürün adı ara..."
              style={{ width: "100%", padding: "9px 14px", border: `1px solid ${aramaMetni ? TEAL : GRAY200}`, borderRadius: 10, fontSize: 12, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: GRAY400 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Yükleniyor…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: GRAY400 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Ürün bulunamadı</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Filtreleri temizleyin veya yeni ürün ekleyin.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {filtered.map((u) => (
                <ProductCard
                  key={u.id} u={u}
                  onToggle={() => toggleAktif(u.id)}
                  onEdit={() => openEdit(u)}
                  onSil={() => setSilModal(u)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── KATEGORİ EKLE MODAL ──────────────────────────────────────────── */}
      {catModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setCatModalOpen(false)}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: 380, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>➕ Yeni Kategori</h3>
              <button onClick={() => setCatModalOpen(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: GRAY400 }}>✕</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Kategori İkonu</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {EMOJI_OPTS_KAT.map((e) => (
                  <button key={e} type="button" onClick={() => setCatForm((f) => ({ ...f, icon: e }))} style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${catForm.icon === e ? TEAL : GRAY200}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer", background: catForm.icon === e ? "rgba(10,186,181,0.1)" : "transparent" }}>{e}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Kategori Adı *</label>
              <input type="text" value={catForm.name} onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))} placeholder="örn: Smoothieler" style={inputStyle} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setCatModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={saveKategori} disabled={!catForm.name} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: !catForm.name ? GRAY200 : TEAL, color: !catForm.name ? GRAY400 : "white", cursor: !catForm.name ? "not-allowed" : "pointer" }}>✅ Ekle</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ÜRÜN EKLE MODAL ─────────────────────────────────────────────── */}
      {urunModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setUrunModalOpen(false)}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: 520, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>➕ Yeni Ürün Ekle</h3>
              <button onClick={() => setUrunModalOpen(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: GRAY400 }}>✕</button>
            </div>

            <UrunForm form={yeniForm} setForm={setYeniForm} kategoriler={kategoriler} inputStyle={inputStyle} labelStyle={labelStyle} photos={yeniPhotos} setPhotos={setYeniPhotos} tesisId={tesisId} showToast={showToast} />

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setUrunModalOpen(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={saveUrun} disabled={!yeniForm.name} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: !yeniForm.name ? GRAY200 : TEAL, color: !yeniForm.name ? GRAY400 : "white", cursor: !yeniForm.name ? "not-allowed" : "pointer" }}>✅ Ürünü Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DÜZENLE MODAL ────────────────────────────────────────────────── */}
      {editModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setEditModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: 520, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>✏️ Ürünü Düzenle — {editModal.name}</h3>
              <button onClick={() => setEditModal(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: GRAY400 }}>✕</button>
            </div>

            <UrunForm form={editForm} setForm={setEditForm} kategoriler={kategoriler} inputStyle={inputStyle} labelStyle={labelStyle} photos={editPhotos} setPhotos={setEditPhotos} tesisId={tesisId} showToast={showToast} />

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setEditModal(null)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={saveEdit} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>💾 Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SİL ONAY MODAL ───────────────────────────────────────────────── */}
      {silModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setSilModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 380, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{silModal.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Ürünü Sil</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 4 }}>Bu işlem geri alınamaz.</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 24 }}>{silModal.name}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setSilModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Vazgeç</button>
              <button onClick={silUrun} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", background: RED, color: "white", cursor: "pointer" }}>🗑️ Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MÜŞTERİ ÖNİZLEME MODAL ──────────────────────────────────────── */}
      {onizlemeOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setOnizlemeOpen(false)}>
          <div style={{ background: "white", borderRadius: 20, width: 480, maxWidth: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.4)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, #1e3a5f)`, padding: "20px 24px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>🏖️ MyLoungers Menü</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>Müşterinin gördüğü görünüm</div>
              </div>
              <button onClick={() => setOnizlemeOpen(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            {/* Body */}
            <div style={{ overflowY: "auto", padding: "16px 20px" }}>
              {kategoriler.filter((k) => k.id !== "tumu").map((kat) => {
                const katUrunler = urunler.filter((u) => u.kategori === kat.id && u.aktif && u.stok);
                if (katUrunler.length === 0) return null;
                return (
                  <div key={kat.id} style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: `2px solid ${GRAY100}` }}>
                      <span style={{ fontSize: 22 }}>{kat.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{kat.name}</span>
                      <span style={{ fontSize: 11, color: GRAY400 }}>{katUrunler.length} ürün</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {katUrunler.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => u.photos && u.photos.length > 0 ? setLightbox({ urun: u, idx: 0 }) : undefined}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: GRAY50, borderRadius: 12, border: `1px solid ${GRAY100}`, cursor: u.photos && u.photos.length > 0 ? "pointer" : "default", transition: "border-color 0.15s" }}
                          className={u.photos && u.photos.length > 0 ? "onizleme-urun-row" : ""}
                        >
                          {/* Thumbnail or emoji */}
                          <div style={{ width: 56, height: 56, borderRadius: 10, background: GRAY100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, overflow: "hidden", position: "relative" }}>
                            {u.photos && u.photos.length > 0 ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.photos[0]} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              u.icon
                            )}
                            {u.photos && u.photos.length > 1 && (
                              <div style={{ position: "absolute", bottom: 3, right: 3, background: "rgba(0,0,0,0.6)", color: "white", fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 6 }}>+{u.photos.length - 1}</div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, display: "flex", alignItems: "center", gap: 6 }}>
                              {u.name}
                              {u.badges.includes("populer") && <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 10, background: TEAL, color: "white" }}>⭐ POP</span>}
                              {u.badges.includes("yeni") && <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 10, background: ORANGE, color: "white" }}>🆕</span>}
                              {u.badges.includes("alkol") && <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 10, background: "#7C3AED", color: "white" }}>🔞</span>}
                            </div>
                            <div style={{ fontSize: 11, color: GRAY400, marginTop: 2 }}>{u.desc}</div>
                            {u.photos && u.photos.length > 0 && (
                              <div style={{ fontSize: 10, color: TEAL, marginTop: 3, fontWeight: 600 }}>📸 {u.photos.length} fotoğraf — görüntüle</div>
                            )}
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: TEAL }}>{u.price}</div>
                            <div style={{ fontSize: 10, color: GRAY400 }}>{u.birim}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div style={{ textAlign: "center", padding: "12px 0", color: GRAY400, fontSize: 11 }}>
                Sadece aktif ve stokta olan ürünler gösterilir
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX (müşteri önizleme resim görüntüleyici) ──────────────── */}
      {lightbox && lightbox.urun.photos && lightbox.urun.photos.length > 0 && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}
          onClick={() => setLightbox(null)}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }} onClick={(e) => e.stopPropagation()}>
            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              style={{ position: "absolute", top: -44, right: 0, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, color: "white", width: 36, height: 36, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}
            >✕</button>

            {/* Product info */}
            <div style={{ color: "white", textAlign: "center", marginBottom: -4 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{lightbox.urun.name}</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>{lightbox.idx + 1} / {lightbox.urun.photos.length}</div>
            </div>

            {/* Image */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
              {/* Left arrow */}
              {lightbox.urun.photos.length > 1 && (
                <button
                  onClick={() => setLightbox((lb) => lb ? { ...lb, idx: (lb.idx - 1 + lb.urun.photos!.length) % lb.urun.photos!.length } : null)}
                  style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >‹</button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox.urun.photos[lightbox.idx]}
                alt={lightbox.urun.name}
                style={{ maxWidth: "70vw", maxHeight: "65vh", borderRadius: 16, objectFit: "contain", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
              />

              {/* Right arrow */}
              {lightbox.urun.photos.length > 1 && (
                <button
                  onClick={() => setLightbox((lb) => lb ? { ...lb, idx: (lb.idx + 1) % lb.urun.photos!.length } : null)}
                  style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >›</button>
              )}
            </div>

            {/* Dot navigation */}
            {lightbox.urun.photos.length > 1 && (
              <div style={{ display: "flex", gap: 8 }}>
                {lightbox.urun.photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox((lb) => lb ? { ...lb, idx: i } : null)}
                    style={{ width: i === lightbox.idx ? 24 : 8, height: 8, borderRadius: 4, border: "none", background: i === lightbox.idx ? TEAL : "rgba(255,255,255,0.35)", cursor: "pointer", transition: "all 0.2s", padding: 0 }}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail strip */}
            {lightbox.urun.photos.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginTop: -4 }}>
                {lightbox.urun.photos.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox((lb) => lb ? { ...lb, idx: i } : null)}
                    style={{ width: 52, height: 52, borderRadius: 8, border: `2px solid ${i === lightbox.idx ? TEAL : "transparent"}`, overflow: "hidden", cursor: "pointer", padding: 0, background: "none", transition: "border-color 0.2s" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .menu-product-card:hover { border-color: #0ABAB5 !important; box-shadow: 0 4px 16px rgba(10,186,181,0.12); }
          .menu-pc-action:hover { background: #0A1628 !important; color: white !important; border-color: #0A1628 !important; }
          .menu-pc-danger:hover { background: #EF4444 !important; border-color: #EF4444 !important; }
          .onizleme-urun-row:hover { border-color: #0ABAB5 !important; }
        `,
      }} />
    </div>
  );
}

// ── Shared form component (used in both add + edit modal) ─────────────────
const STORAGE_BUCKET = "menu-gorseller";
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB

function UrunForm({
  form, setForm, kategoriler, inputStyle, labelStyle, photos, setPhotos, tesisId, showToast,
}: {
  form: typeof emptyUrunForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyUrunForm>>;
  kategoriler: KategoriItem[];
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  photos: string[];
  setPhotos: React.Dispatch<React.SetStateAction<string[]>>;
  tesisId: string | null;
  showToast?: (msg: string) => void;
}) {
  const f = form;
  const set = (key: string, val: string | boolean) => setForm((prev) => ({ ...prev, [key]: val }));
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || !tesisId) return;
    const remaining = 3 - photos.length;
    if (remaining <= 0) return;
    const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
    for (const file of list) {
      if (file.size > MAX_FILE_BYTES && showToast) {
        showToast(`Dosya 2MB'dan büyük olamaz: ${file.name}`);
      }
    }
    const toUpload = list.filter((file) => file.size <= MAX_FILE_BYTES).slice(0, remaining);
    if (toUpload.length === 0) return;
    const basePath = `${tesisId}/${Date.now()}`;
    const newUrls: string[] = [];
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${basePath}-${i}.${ext}`;
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { contentType: file.type || "image/jpeg", upsert: true });
      if (error) {
        console.error("Storage upload error:", error);
        continue;
      }
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }
    setPhotos((prev) => [...prev, ...newUrls].slice(0, 3));
  }

  return (
    <>
      {/* Fotoğraf + Emoji alanı */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Ürün Fotoğrafı{photos.length > 0 ? ` (${photos.length}/3)` : " — en fazla 3"}</label>

        {/* Thumbnail'lar */}
        {photos.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {photos.map((src, i) => (
              <div key={i} style={{ position: "relative", width: 80, height: 80 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", border: `2px solid ${GRAY200}` }} />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                  style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: RED, border: "2px solid white", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                >✕</button>
                {i === 0 && <div style={{ position: "absolute", bottom: 3, left: 3, background: "rgba(0,0,0,0.6)", color: "white", fontSize: 8, padding: "1px 4px", borderRadius: 4 }}>Ana</div>}
              </div>
            ))}
            {/* Add more slot */}
            {photos.length < 3 && (
              <label style={{ width: 80, height: 80, borderRadius: 10, border: `2px dashed ${GRAY300}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 10, color: GRAY400, gap: 4 }}>
                <span style={{ fontSize: 22 }}>+</span>
                <span>Ekle</span>
                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
              </label>
            )}
          </div>
        )}

        {/* Drag-drop yükleme alanı (fotoğraf yoksa tam, varsa mini) */}
        {photos.length === 0 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            style={{ border: `2px dashed ${dragOver ? TEAL : GRAY300}`, borderRadius: 12, padding: "20px 16px", textAlign: "center", background: dragOver ? "rgba(10,186,181,0.04)" : "transparent", transition: "all 0.2s", marginBottom: 10 }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
            <p style={{ fontSize: 12, color: GRAY600, margin: 0 }}>
              Sürükle & bırak veya{" "}
              <label style={{ color: TEAL, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                dosya seç
                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
              </label>
            </p>
            <p style={{ fontSize: 11, color: GRAY400, margin: "4px 0 0" }}>Maks. 2MB • PNG, JPG — max 3 fotoğraf • Maks. 2MB/adet</p>
          </div>
        )}

        {/* Eğer fotoğraf var: emoji, yoksa: emoji grid göster */}
        <div>
          <label style={{ ...labelStyle, marginTop: 4 }}>
            {photos.length > 0 ? "Yedek İkon (fotoğraf yoksa gösterilir)" : "veya Emoji İkon Seç"}
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {EMOJI_OPTS_URUN.map((e) => (
              <button key={e} type="button" onClick={() => set("icon", e)} style={{ width: 34, height: 34, borderRadius: 8, border: `2px solid ${f.icon === e ? TEAL : GRAY200}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer", background: f.icon === e ? "rgba(10,186,181,0.1)" : "transparent" }}>{e}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Ürün Adı *</label>
          <input type="text" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="örn: Mojito" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Kategori</label>
          <select value={f.kategori} onChange={(e) => set("kategori", e.target.value)} style={inputStyle}>
            <option value="">Seçiniz</option>
            {kategoriler.filter((k) => k.id !== "tumu").map((k) => (
              <option key={k.id} value={k.id}>{k.icon} {k.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Açıklama</label>
        <textarea rows={2} value={f.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Ürün hakkında kısa açıklama..." style={{ ...inputStyle, resize: "vertical" as const }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Fiyat (₺)</label>
          <input type="number" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="örn: 120" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Birim</label>
          <select value={f.birim} onChange={(e) => set("birim", e.target.value)} style={inputStyle}>
            {BIRIM_OPTS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Etiket</label>
        <select value={f.badge} onChange={(e) => set("badge", e.target.value)} style={inputStyle}>
          {BADGE_OPTS.map((b) => <option key={b.val} value={b.val}>{b.label}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: GRAY50, borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>Aktif olarak yayınla</div>
          <div style={{ fontSize: 11, color: GRAY400 }}>Müşteriler menüde görebilir</div>
        </div>
        <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }}>
          <input type="checkbox" checked={f.aktif} onChange={(e) => set("aktif", e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
          <span style={{ position: "absolute", inset: 0, background: f.aktif ? TEAL : GRAY300, borderRadius: 20, transition: "0.3s" }}>
            <span style={{ position: "absolute", width: 14, height: 14, left: 3, top: 3, background: "white", borderRadius: "50%", transition: "0.3s", transform: f.aktif ? "translateX(16px)" : "translateX(0)" }} />
          </span>
        </label>
      </div>
    </>
  );
}
