"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

// ── Types ─────────────────────────────────────────────────────────────────────
type Photo = { id: number; src?: string; mockBg?: string; mockEmoji?: string; };
type ImkanItem = { emoji: string; name: string; active: boolean; custom?: boolean };
type GunItem = { name: string; acilis: string; kapanis: string; kapali: boolean; vurgu?: boolean };
type ListItem = { emoji: string; text: string };

// ── Initial data ──────────────────────────────────────────────────────────────
const INIT_PHOTOS: Photo[] = [
  { id: 1, mockBg: "linear-gradient(135deg,#0A1628,#0ABAB5)", mockEmoji: "🏖️" },
  { id: 2, mockBg: "linear-gradient(135deg,#1a3a5c,#2d6a4f)",  mockEmoji: "☕" },
  { id: 3, mockBg: "linear-gradient(135deg,#1e4d8c,#0ABAB5)",  mockEmoji: "🏊" },
  { id: 4, mockBg: "linear-gradient(135deg,#2d1b69,#0A1628)",  mockEmoji: "🌙" },
];

const INIT_IMKANLAR: ImkanItem[] = [
  { emoji: "🏊", name: "Özel Yüzme Havuzu",         active: true  },
  { emoji: "☕", name: "Kahvaltı Dahil",              active: true  },
  { emoji: "🍽️", name: "Beach Bar & Restoran",       active: true  },
  { emoji: "🚗", name: "Ücretsiz Vale Park",          active: true  },
  { emoji: "🎶", name: "Canlı Müzik (Haftasonları)", active: true  },
  { emoji: "🚤", name: "Su Sporları Merkezi",         active: true  },
  { emoji: "🌍", name: "TR / EN / RU Personel",      active: true  },
  { emoji: "📱", name: "Ücretsiz Wi-Fi",             active: true  },
  { emoji: "🅿️", name: "Otopark",                   active: false },
  { emoji: "♿", name: "Engelli Erişimi",             active: false },
  { emoji: "🐾", name: "Evcil Hayvan Kabul",         active: false },
  { emoji: "🧖", name: "Spa & Masaj",                active: false },
];

const INIT_GUNLER: GunItem[] = [
  { name: "Pzt", acilis: "09:00", kapanis: "19:00", kapali: false },
  { name: "Sal", acilis: "09:00", kapanis: "19:00", kapali: false },
  { name: "Çar", acilis: "09:00", kapanis: "19:00", kapali: false },
  { name: "Per", acilis: "09:00", kapanis: "19:00", kapali: false },
  { name: "Cum", acilis: "09:00", kapanis: "21:00", kapali: false },
  { name: "Cmt", acilis: "09:00", kapanis: "21:00", kapali: false, vurgu: true },
  { name: "Paz", acilis: "09:00", kapanis: "21:00", kapali: false, vurgu: true },
];

const INIT_KURALLAR: ListItem[] = [
  { emoji: "🚫", text: "Evcil hayvan kabul edilmez" },
  { emoji: "🚫", text: "Dışarıdan yiyecek/içecek getirilmez" },
  { emoji: "🚫", text: "18 yaş altı 21:00'dan sonra tesis içinde bulunamaz" },
  { emoji: "✅", text: "Giriş: 09:00 — Çıkış: 19:00" },
  { emoji: "✅", text: "İptal: 48 saat öncesine kadar ücretsiz" },
];

const INIT_KAMPANYA_NOTLARI: ListItem[] = [
  { emoji: "🌟", text: "Erken Rezervasyon: 30 gün öncesi %10 indirim" },
  { emoji: "🌟", text: "Grup (5+): %15 indirim" },
  { emoji: "🌟", text: "Hafta içi 3 gün full: Kahvaltı dahil" },
  { emoji: "🌟", text: "Sadakat: 5. rezervasyonda %20 indirim" },
];

const KATEGORILER = [
  { name: "BEACH CLUB", emoji: "🏖️", checked: true },
  { name: "OTEL",       emoji: "🏨", checked: true  },
  { name: "AQUA PARK",  emoji: "🌊", checked: false },
];

const EMOJI_PICKER = ["🏄","🎯","🎪","🛁","🔒","🌿","🎠","🏋️","🧊","🎭","🌅","🍷"];

// ── Helper ────────────────────────────────────────────────────────────────────
function toEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function IsletmeTesisPage() {
  const router = useRouter();

  // Sections collapse
  const [sections, setSections] = useState<Record<string, boolean>>({ temel: true, foto: true, hakkinda: true, imkan: true, saat: true, video: true, harita: true, ulasim: true, kurallar: true });
  const toggleSection = (k: string) => setSections(s => ({ ...s, [k]: !s[k] }));

  // Content state
  const [photos, setPhotos]             = useState<Photo[]>(INIT_PHOTOS);
  const [imkanlar, setImkanlar]         = useState<ImkanItem[]>(INIT_IMKANLAR);
  const [gunler, setGunler]             = useState<GunItem[]>(INIT_GUNLER);
  const [kurallar, setKurallar]         = useState<ListItem[]>(INIT_KURALLAR);
  const [kampanyaNotlari, setKampanyaNotlari] = useState<ListItem[]>(INIT_KAMPANYA_NOTLARI);
  const [kisaAciklama, setKisaAciklama] = useState("Bodrum'un en güzel koyunda butik beach club & otel deneyimi");
  const [detayAciklama, setDetayAciklama] = useState("Zuzuu Beach Hotel, Bodrum'un en güzel koylarından birinde konumlanan butik bir beach club ve oteldir. Kristal berraklığında deniz suyu ve özel iskelesiyle misafirlerine unutulmaz bir deniz deneyimi sunmaktadır.\n\n100 şezlongluk kapasitesiyle İskele, VIP ve Silver olmak üzere üç farklı bölgede hizmet vermekte; sabah kahvaltısından gün batımı kokteyllerine kadar eksiksiz bir beach club deneyimi sağlamaktadır.");
  const [tesisAktif, setTesisAktif]     = useState(true);
  const [videoUrl, setVideoUrl]         = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [videoInput, setVideoInput]     = useState("");
  const [enlem, setEnlem]               = useState("37.032048");
  const [boylam, setBoylam]             = useState("27.430012");

  const [tesisAdi, setTesisAdi]         = useState("Zuzuu Beach Hotel");
  const [sehir, setSehir]               = useState("Bodrum");
  const [ilce, setIlce]                 = useState("Muğla");
  const [sehirIlce, setSehirIlce]       = useState("Bodrum, Muğla");
  const [adres, setAdres]               = useState("Kumbahçe Mah. Neyzen Tevfik Cad. No:12, Bodrum");
  const [telefon, setTelefon]           = useState("+90 252 316 XX XX");
  const [email, setEmail]               = useState("info@zuzuubeach.com");
  const [webSitesi, setWebSitesi]       = useState("https://zuzuubeach.com");
  const [mapsLink, setMapsLink]         = useState("https://maps.google.com/?q=Zuzuu+Beach+Hotel+Bodrum");
  const [aciklama, setAciklama]         = useState("");
  const [kategoriler, setKategoriler]   = useState<string[]>(["BEACH CLUB", "OTEL"]);
  const [tesisId, setTesisId]           = useState<string | null>(null);

  // Ulaşım Rehberi
  const [taksiMerkeze, setTaksiMerkeze]       = useState("Bodrum merkeze 7 dk");
  const [taksiHavalimanı, setTaksiHavalimanı] = useState("Milas-Bodrum Havalimanı 45 dk");
  const [taksiTel1, setTaksiTel1]             = useState("+90 252 316 XX XX");
  const [taksiTel2, setTaksiTel2]             = useState("");
  const [dolmusHat, setDolmusHat]             = useState("Bodrum - Turgutreis hattı");
  const [dolmusDurak, setDolmusDurak]         = useState("Zuzuu Beach durağı");
  const [dolmusSaatBas, setDolmusSaatBas]     = useState("07:00");
  const [dolmusSaatBit, setDolmusSaatBit]     = useState("22:00");
  const [dolmusNot, setDolmusNot]             = useState("");

  // Form inputs
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji]     = useState("😊");
  const [imkanInput, setImkanInput]           = useState("");
  const [kuralInput, setKuralInput]           = useState("");
  const [kampanyaInput, setKampanyaInput]     = useState("");
  const [kuralEmojiSel, setKuralEmojiSel]     = useState("🚫");
  const [kampanyaEmojiSel, setKampanyaEmojiSel] = useState("🌟");

  // Modals
  const [tesisAktifModal, setTesisAktifModal] = useState(false);
  const [onizlemeModal, setOnizlemeModal]     = useState(false);

  // Photo gallery hover + drag state
  const [fotoHover, setFotoHover]     = useState<number | null>(null);
  const [dragSrc, setDragSrc]         = useState<number | null>(null);
  const [dragOver, setDragOver]       = useState<number | null>(null);
  const [dropZoneDrag, setDropZoneDrag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  // ESC closes modals
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/giris'); return; }
      supabase.from('kullanicilar').select('rol').eq('email', user.email).single().then(({ data }) => {
        if (data?.rol !== 'isletmeci' && data?.rol !== 'admin') router.push('/');
      });
    });

    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { setTesisAktifModal(false); setOnizlemeModal(false); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [router]);

  // Load tesis from Supabase (current user's tesis_id)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (cancelled) return;
      if (authErr || !authData?.user) {
        if (authErr) console.error("Tesis yüklenemedi:", authErr);
        return;
      }
      const userId = authData.user.id;

      const { data: kullanici, error: kullaniciErr } = await supabase
        .from("kullanicilar")
        .select("tesis_id")
        .eq("id", userId)
        .maybeSingle();

      if (cancelled) return;
      if (kullaniciErr || !kullanici || kullanici.tesis_id == null) {
        if (kullaniciErr) console.error("Tesis yüklenemedi:", kullaniciErr);
        return;
      }
      const tesis_id = kullanici.tesis_id as string;

      const { data, error } = await supabase
        .from("tesisler")
        .select("id, ad, kategori, sehir, ilce, adres, telefon, email, web_sitesi, kisa_aciklama, detayli_aciklama, aciklama, video_url, enlem, boylam, maps_link, imkanlar, calisma_saatleri, kurallar, kampanya_notlari, ulasim, aktif, fotograflar")
        .eq("id", tesis_id)
        .limit(1)
        .single();

      if (cancelled || !data) {
        if (error) console.error("Tesis yüklenemedi:", error);
        return;
      }
      const row: any = data;
      setTesisId(String(row.id));

        if (row.ad) setTesisAdi(row.ad);

        const kategoriRaw = row.kategori as string | string[] | null | undefined;
        if (kategoriRaw) {
          let parsed: string[] = [];
          if (Array.isArray(kategoriRaw)) {
            parsed = kategoriRaw;
          } else if (typeof kategoriRaw === "string") {
            try {
              const maybeArr = JSON.parse(kategoriRaw);
              if (Array.isArray(maybeArr)) {
                parsed = maybeArr.map((v) => String(v));
              } else {
                parsed = String(kategoriRaw)
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
              }
            } catch {
              parsed = kategoriRaw
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            }
          }
          const normalized = parsed.map((k) => k.toUpperCase());
          if (normalized.length > 0) setKategoriler(normalized);
        }

        if (row.sehir) setSehir(row.sehir);
        if (row.ilce) setIlce(row.ilce);
        if (row.sehir || row.ilce) {
          const parts = [row.sehir, row.ilce].filter(Boolean);
          if (parts.length) setSehirIlce(parts.join(", "));
        }

        if (row.adres) setAdres(row.adres);
        if (row.telefon) setTelefon(row.telefon);
        if (row.email) setEmail(row.email);
        if (row.web_sitesi) setWebSitesi(row.web_sitesi);
        if (row.kisa_aciklama) setKisaAciklama(row.kisa_aciklama);
        if (row.detayli_aciklama) setDetayAciklama(row.detayli_aciklama);
        if (row.aciklama) setAciklama(row.aciklama);
        if (row.video_url) setVideoUrl(row.video_url);
        if (row.enlem) setEnlem(String(row.enlem));
        if (row.boylam) setBoylam(String(row.boylam));
        if (row.maps_link) setMapsLink(row.maps_link);

        const imkanlarDb = (row.imkanlar as ImkanItem[] | null | undefined) || [];
        setImkanlar(imkanlarDb.length ? imkanlarDb : INIT_IMKANLAR);

        const gunlerDb = (row.calisma_saatleri as GunItem[] | null | undefined) || [];
        setGunler(gunlerDb.length ? gunlerDb : INIT_GUNLER);

        const kurallarDb = row.kurallar as ListItem[] | null | undefined;
        setKurallar(kurallarDb ?? []);

        const kampanyaDb = row.kampanya_notlari as ListItem[] | null | undefined;
        setKampanyaNotlari(kampanyaDb ?? []);

        if (typeof row.aktif === "boolean") setTesisAktif(row.aktif);

        const fotosDb = (row.fotograflar as Photo[] | null | undefined) || [];
        setPhotos(fotosDb.length ? fotosDb : INIT_PHOTOS);

        const ulasim = row.ulasim as
          | {
              merkeze?: string;
              havalimanı?: string;
              tel1?: string;
              tel2?: string;
              hat?: string;
              durak?: string;
              saatBas?: string;
              saatBit?: string;
              not?: string;
            }
          | null
          | undefined;
        if (ulasim) {
          if (ulasim.merkeze) setTaksiMerkeze(ulasim.merkeze);
          if (ulasim.havalimanı) setTaksiHavalimanı(ulasim.havalimanı);
          if (ulasim.tel1) setTaksiTel1(ulasim.tel1);
          if (ulasim.tel2) setTaksiTel2(ulasim.tel2);
          if (ulasim.hat) setDolmusHat(ulasim.hat);
          if (ulasim.durak) setDolmusDurak(ulasim.durak);
          if (ulasim.saatBas) setDolmusSaatBas(ulasim.saatBas);
          if (ulasim.saatBit) setDolmusSaatBit(ulasim.saatBit);
          if (ulasim.not) setDolmusNot(ulasim.not);
        }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Photo actions ──────────────────────────────────────────────────────────
  function readFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (photos.length >= 20) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === "string") {
          setPhotos(p => [...p, { id: Date.now() + Math.random(), src: ev.target!.result as string }]);
        }
      };
      reader.readAsDataURL(file);
    });
  }
  function deletePhoto(id: number) { setPhotos(p => p.filter(x => x.id !== id)); showToast("🗑️ Fotoğraf silindi"); }
  function makeAna(id: number)      { setPhotos(p => { const idx = p.findIndex(x => x.id === id); if (idx <= 0) return p; const arr = [...p]; const [item] = arr.splice(idx, 1); arr.unshift(item); return arr; }); showToast("⭐ Ana fotoğraf güncellendi"); }
  function onPhotoDrop(e: React.DragEvent, targetId: number) {
    e.preventDefault();
    if (dragSrc === null || dragSrc === targetId) { setDragSrc(null); setDragOver(null); return; }
    setPhotos(p => {
      const arr = [...p];
      const fromIdx = arr.findIndex(x => x.id === dragSrc);
      const toIdx   = arr.findIndex(x => x.id === targetId);
      const [item]  = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
    setDragSrc(null); setDragOver(null);
  }

  // ── Çalışma saatleri ──────────────────────────────────────────────────────
  function updateGun(i: number, key: keyof GunItem, val: string | boolean) {
    setGunler(p => p.map((g, j) => j === i ? { ...g, [key]: val } : g));
  }

  // ── İmkânlar ──────────────────────────────────────────────────────────────
  const toggleImkan = (i: number) => setImkanlar(p => p.map((x, j) => j === i ? { ...x, active: !x.active } : x));
  const delImkan    = (i: number) => { setImkanlar(p => p.filter((_, j) => j !== i)); showToast("🗑️ İmkân silindi"); };
  const addImkan = () => {
    if (!imkanInput.trim()) return;
    setImkanlar(p => [...p, { emoji: selectedEmoji, name: imkanInput.trim(), active: true, custom: true }]);
    setImkanInput(""); setEmojiPickerOpen(false);
  };

  // ── Kurallar & Kampanya ────────────────────────────────────────────────────
  const addKural = () => { if (!kuralInput.trim()) return; setKurallar(p => [...p, { emoji: kuralEmojiSel, text: kuralInput.trim() }]); setKuralInput(""); };
  const addKampanya = () => { if (!kampanyaInput.trim()) return; setKampanyaNotlari(p => [...p, { emoji: kampanyaEmojiSel, text: kampanyaInput.trim() }]); setKampanyaInput(""); };
  const delKural = (i: number, list: "kural" | "kampanya") => {
    if (list === "kural") setKurallar(p => p.filter((_, j) => j !== i));
    else setKampanyaNotlari(p => p.filter((_, j) => j !== i));
    showToast("🗑️ Silindi");
  };

  // ── Video ──────────────────────────────────────────────────────────────────
  function yukleVideo() {
    const url = videoInput.trim();
    if (!url) return;
    setVideoUrl(toEmbedUrl(url));
    setVideoInput("");
    showToast("▶ Video yüklendi");
  }

  // ── Konum ─────────────────────────────────────────────────────────────────
  function haritadaGoster() {
    if (!enlem || !boylam) return;
    window.open(`https://www.google.com/maps?q=${enlem},${boylam}`, "_blank");
  }

  // ── Tesis Aktif toggle ────────────────────────────────────────────────────
  async function handleTesisToggle(checked: boolean) {
    if (!checked) {
      setTesisAktifModal(true);
      return;
    }
    if (!tesisId) {
      setTesisAktif(true);
      showToast("✅ Tesis yayında!");
      return;
    }
    setTesisAktif(true);
    const { error } = await supabase.from("tesisler").update({ aktif: true }).eq("id", tesisId);
    if (error) {
      console.error("Tesis durumu güncellenemedi:", error);
      setTesisAktif(false);
      showToast("❌ Kayıt başarısız");
      return;
    }
    showToast("✅ Tesis yayında!");
  }
  async function confirmedTesisKapat() {
    if (!tesisId) {
      setTesisAktif(false);
      setTesisAktifModal(false);
      showToast("⏸ Tesis yayından kaldırıldı");
      return;
    }
    const { error } = await supabase.from("tesisler").update({ aktif: false }).eq("id", tesisId);
    if (error) {
      console.error("Tesis durumu güncellenemedi:", error);
      showToast("❌ Kayıt başarısız");
      setTesisAktifModal(false);
      return;
    }
    setTesisAktif(false);
    setTesisAktifModal(false);
    showToast("⏸ Tesis yayından kaldırıldı");
  }

  // ── Save all ──────────────────────────────────────────────────────────────
  async function saveAll() {
    if (!tesisId) {
      showToast("❌ Kayıt başarısız");
      return;
    }
    // sehir / ilce senkronizasyonu (kullanıcı alanı değiştirdiyse)
    if (sehirIlce.trim()) {
      const parts = sehirIlce.split(",").map((p) => p.trim()).filter(Boolean);
      if (parts[0]) setSehir(parts[0]);
      if (parts[1]) setIlce(parts[1]);
    }
    const payload: any = {
      ad: tesisAdi,
      kategori: kategoriler.map((k) => k.toUpperCase()),
      sehir,
      ilce,
      adres,
      telefon,
      email,
      web_sitesi: webSitesi,
      kisa_aciklama: kisaAciklama,
      detayli_aciklama: detayAciklama,
      aciklama,
      video_url: videoUrl,
      enlem,
      boylam,
      maps_link: mapsLink,
      imkanlar,
      calisma_saatleri: gunler,
      kurallar,
      kampanya_notlari: kampanyaNotlari,
      ulasim: {
        merkeze: taksiMerkeze,
        havalimanı: taksiHavalimanı,
        tel1: taksiTel1,
        tel2: taksiTel2,
        hat: dolmusHat,
        durak: dolmusDurak,
        saatBas: dolmusSaatBas,
        saatBit: dolmusSaatBit,
        not: dolmusNot,
      },
      aktif: tesisAktif,
      fotograflar: photos,
    };
    const { error } = await supabase.from("tesisler").update(payload).eq("id", tesisId);
    if (error) {
      console.error("Tesis kaydedilemedi:", error);
      showToast("❌ Kayıt başarısız");
      return;
    }
    showToast("✅ Değişiklikler kaydedildi");
  }

  // ── Shared styles ──────────────────────────────────────────────────────────
  const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", flexDirection: "column", minHeight: "100%" }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, background: NAVY, color: "white", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", transition: "all 0.3s" }}>{toast}</div>
      )}

      {/* TOPBAR */}
      <header style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Tesis Bilgileri</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>Müşteri sayfasında görünen tüm içeriği buradan yönet</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setOnizlemeModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>👁️ Müşteri Önizleme</button>
          <button onClick={saveAll} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>💾 Tümünü Kaydet</button>
        </div>
      </header>

      <div style={{ padding: 24, flex: 1 }}>
        {/* ÖNİZLEME BARI */}
        <div style={{ background: "linear-gradient(135deg," + NAVY + ",#1a2f50)", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: "white", fontWeight: 600 }}>{tesisAktif ? "✅ Tesis Yayında" : "⏸ Tesis Yayında Değil"} — Zuzuu Beach Hotel</p>
            <span style={{ fontSize: 11, color: GRAY400 }}>Son güncelleme: 11 Mart 2026 · Tüm değişiklikler anında müşteri sayfasına yansır</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: GRAY400 }}>Tesis Aktif</span>
            <label style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }}>
              <input type="checkbox" checked={tesisAktif} onChange={(e) => handleTesisToggle(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: "absolute", inset: 0, background: tesisAktif ? TEAL : GRAY300, borderRadius: 20, transition: "0.3s" }}>
                <span style={{ position: "absolute", width: 14, height: 14, left: 3, top: 3, background: "white", borderRadius: "50%", transition: "0.3s", transform: tesisAktif ? "translateX(16px)" : "translateX(0)" }} />
              </span>
            </label>
          </div>
        </div>

        {/* 1. TEMEL BİLGİLER */}
        <SectionCard open={sections.temel} onToggle={() => toggleSection("temel")} icon="📍" iconBg="#EFF6FF" title="Temel Bilgiler" sub="Tesis adı, konum, iletişim">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Tesis Adı</label>
              <input type="text" value={tesisAdi} onChange={(e) => setTesisAdi(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Şehir / İlçe</label>
              <input
                type="text"
                value={sehirIlce}
                onChange={(e) => {
                  const v = e.target.value;
                  setSehirIlce(v);
                  const parts = v.split(",").map((p) => p.trim()).filter(Boolean);
                  if (parts[0] !== undefined) setSehir(parts[0]);
                  if (parts[1] !== undefined) setIlce(parts[1]);
                }}
                style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Tam Adres</label>
              <input type="text" value={adres} onChange={(e) => setAdres(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Telefon</label>
              <input type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>E-posta</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Web Sitesi</label>
              <input type="url" value={webSitesi} onChange={(e) => setWebSitesi(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Tesis Kategorisi</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {KATEGORILER.map((k, i) => (
                <label
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    border: `1.5px solid ${kategoriler.includes(k.name) ? TEAL : GRAY200}`,
                    borderRadius: 20,
                    cursor: "pointer",
                    background: kategoriler.includes(k.name) ? "#F0FFFE" : "transparent",
                    fontSize: 12,
                    fontWeight: 600,
                    color: kategoriler.includes(k.name) ? NAVY : GRAY600,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={kategoriler.includes(k.name)}
                    onChange={() => {
                      setKategoriler((prev) =>
                        prev.includes(k.name) ? prev.filter((x) => x !== k.name) : [...prev, k.name]
                      );
                    }}
                    style={{ accentColor: TEAL }}
                  />{" "}
                  {k.emoji} {k.name}
                </label>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* 2. FOTOĞRAF GALERİSİ */}
        <SectionCard open={sections.foto} onToggle={() => toggleSection("foto")} icon="📸" iconBg="#FFF9F5" title="Fotoğraf Galerisi" sub={`${photos.length} fotoğraf · Max 20`}>
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => readFiles(e.target.files)} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => setDragSrc(photo.id)}
                onDragOver={(e) => { e.preventDefault(); setDragOver(photo.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => onPhotoDrop(e, photo.id)}
                onMouseEnter={() => setFotoHover(photo.id)}
                onMouseLeave={() => setFotoHover(null)}
                style={{
                  gridColumn: i === 0 ? "1/3" : undefined,
                  gridRow:    i === 0 ? "1/3" : undefined,
                  minHeight:  i === 0 ? 200   : undefined,
                  aspectRatio: i === 0 ? undefined : "1",
                  position: "relative", borderRadius: 10, overflow: "hidden",
                  border: `2px solid ${dragOver === photo.id ? TEAL : GRAY200}`,
                  background: photo.src ? "transparent" : photo.mockBg,
                  cursor: "grab", transition: "border-color 0.15s",
                  opacity: dragSrc === photo.id ? 0.5 : 1,
                }}
              >
                {photo.src
                  ? <img src={photo.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", minHeight: i === 0 ? 200 : 80, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", fontSize: i === 0 ? 48 : 32 }}>{photo.mockEmoji}</div>
                }
                {i === 0 && <span style={{ position: "absolute", top: 6, left: 6, background: ORANGE, color: "white", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20 }}>Ana Fotoğraf</span>}
                {fotoHover === photo.id && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {i !== 0 && (
                      <button onClick={() => makeAna(photo.id)} style={{ background: ORANGE, color: "white", border: "none", borderRadius: 7, padding: "5px 9px", fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>⭐ Ana Foto</button>
                    )}
                    <button onClick={() => deletePhoto(photo.id)} style={{ background: RED, color: "white", border: "none", borderRadius: 7, padding: "5px 9px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>🗑️ Sil</button>
                  </div>
                )}
              </div>
            ))}
            {/* Upload zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDropZoneDrag(true); }}
              onDragLeave={() => setDropZoneDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDropZoneDrag(false); readFiles(e.dataTransfer.files); }}
              style={{ aspectRatio: "1", borderRadius: 10, border: `2px dashed ${dropZoneDrag ? TEAL : GRAY200}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", background: dropZoneDrag ? "rgba(10,186,181,0.04)" : GRAY50, transition: "all 0.15s" }}
            >
              <span style={{ fontSize: 24 }}>➕</span>
              <p style={{ fontSize: 10, fontWeight: 600, color: TEAL, textAlign: "center" }}>Fotoğraf Ekle</p>
            </div>
          </div>
          <p style={{ fontSize: 11, color: GRAY400, marginTop: 8 }}>💡 İlk fotoğraf ana görsel. Sürükleyerek sıralayın • ⭐ Ana Foto yapın. JPG, PNG, WEBP · Max 10MB</p>
        </SectionCard>

        {/* 3. HAKKINDA */}
        <SectionCard open={sections.hakkinda} onToggle={() => toggleSection("hakkinda")} icon="📝" iconBg="#F0FDF4" title="Tesis Hakkında" sub="Açıklama metni">
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Kısa Açıklama <span style={{ color: GRAY400, fontWeight: 400 }}>(Arama sonuçlarında görünür)</span></label>
            <input type="text" value={kisaAciklama} onChange={(e) => setKisaAciklama(e.target.value)} maxLength={100} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
            <div style={{ fontSize: 10, color: GRAY400, textAlign: "right", marginTop: 3 }}>{kisaAciklama.length}/100</div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Detaylı Açıklama <span style={{ color: GRAY400, fontWeight: 400 }}>(Tesis detay sayfasında görünür)</span></label>
            <textarea value={detayAciklama} onChange={(e) => setDetayAciklama(e.target.value)} rows={5} maxLength={800} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, resize: "vertical", minHeight: 100 }} />
            <div style={{ fontSize: 10, color: GRAY400, textAlign: "right", marginTop: 3 }}>{detayAciklama.length}/800</div>
          </div>
        </SectionCard>

        {/* 4. TESİS İMKÂNLARI */}
        <SectionCard open={sections.imkan} onToggle={() => toggleSection("imkan")} icon="✨" iconBg="#F5F3FF" title="Tesis İmkânları" sub={`${imkanlar.filter(x => x.active).length} özellik aktif`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
            {imkanlar.map((im, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: `1.5px solid ${im.active ? TEAL : GRAY200}`, borderRadius: 10, background: im.active ? "#F0FFFE" : "transparent" }}>
                <span style={{ fontSize: 20 }}>{im.emoji}</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: NAVY }}>{im.name}</span>
                {im.custom && (
                  <button onClick={() => delImkan(i)} style={{ background: "none", border: "none", color: GRAY400, cursor: "pointer", fontSize: 13, padding: "0 2px", lineHeight: 1 }} title="Kaldır">✕</button>
                )}
                <label style={{ cursor: "pointer" }}>
                  <input type="checkbox" checked={im.active} onChange={() => toggleImkan(i)} style={{ accentColor: TEAL, width: 16, height: 16, cursor: "pointer" }} />
                </label>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${GRAY100}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 8 }}>Özel İmkan Ekle</div>
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
            {gunler.map((g, i) => (
              <div key={i} style={{ background: g.kapali ? GRAY100 : GRAY50, border: `1.5px solid ${g.kapali ? GRAY300 : g.vurgu ? TEAL : GRAY200}`, borderRadius: 10, padding: "10px 8px", textAlign: "center", opacity: g.kapali ? 0.7 : 1, transition: "all 0.2s" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: g.kapali ? GRAY400 : g.vurgu ? TEAL : NAVY, marginBottom: 8 }}>{g.name}</div>
                <input type="time" value={g.acilis} disabled={g.kapali} onChange={(e) => updateGun(i, "acilis", e.target.value)} style={{ width: "100%", padding: 6, border: `1px solid ${GRAY200}`, borderRadius: 6, fontSize: 11, textAlign: "center", background: g.kapali ? GRAY200 : "white" }} />
                <input type="time" value={g.kapanis} disabled={g.kapali} onChange={(e) => updateGun(i, "kapanis", e.target.value)} style={{ width: "100%", padding: 6, border: `1px solid ${GRAY200}`, borderRadius: 6, fontSize: 11, textAlign: "center", marginTop: 4, background: g.kapali ? GRAY200 : "white" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 6, fontSize: 9, color: g.kapali ? RED : GRAY400, cursor: "pointer", fontWeight: g.kapali ? 700 : 400 }}>
                  <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                    <input type="checkbox" checked={g.kapali} onChange={(e) => updateGun(i, "kapali", e.target.checked)} style={{ accentColor: RED, cursor: "pointer" }} />
                    Kapalı
                  </label>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 6. VİDEO */}
        <SectionCard open={sections.video} onToggle={() => toggleSection("video")} icon="🎬" iconBg="#FEF2F2" title="Tesis Videosu" sub="YouTube veya Vimeo URL">
          {videoUrl ? (
            <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 10, background: GRAY800, overflow: "hidden", marginBottom: 10 }}>
              <iframe src={videoUrl} allowFullScreen style={{ width: "100%", height: "100%", border: "none" }} title="Video" />
            </div>
          ) : (
            <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 10, background: GRAY100, overflow: "hidden", marginBottom: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, border: `2px dashed ${GRAY200}` }}>
              <span style={{ fontSize: 36 }}>🎬</span>
              <p style={{ fontSize: 12, color: GRAY400, fontWeight: 600 }}>Video yüklenmedi</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <input type="text" value={videoInput} onChange={(e) => setVideoInput(e.target.value)} placeholder="https://youtube.com/watch?v=... veya https://vimeo.com/..." style={{ flex: 1, padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} onKeyDown={(e) => e.key === "Enter" && yukleVideo()} />
            <button onClick={yukleVideo} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>▶ Yükle</button>
            <button onClick={() => { setVideoUrl(""); setVideoInput(""); showToast("🎬 Video kaldırıldı"); }} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>✕ Kaldır</button>
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
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Enlem (Latitude)</label>
              <input type="text" value={enlem} onChange={(e) => setEnlem(e.target.value)} placeholder="37.032048" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Boylam (Longitude)</label>
              <input type="text" value={boylam} onChange={(e) => setBoylam(e.target.value)} placeholder="27.430012" style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button onClick={haritadaGoster} disabled={!enlem || !boylam} style={{ height: 42, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${enlem && boylam ? TEAL : GRAY200}`, background: enlem && boylam ? "rgba(10,186,181,0.08)" : GRAY100, color: enlem && boylam ? TEAL : GRAY400, cursor: enlem && boylam ? "pointer" : "not-allowed" }}>📍 Haritada Göster</button>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 6 }}>Google Maps Linki</label>
            <input type="url" value={mapsLink} onChange={(e) => setMapsLink(e.target.value)} placeholder="https://maps.google.com/..." style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
          </div>
        </SectionCard>

        {/* 8. ULAŞIM REHBERİ */}
        <SectionCard open={sections.ulasim} onToggle={() => toggleSection("ulasim")} icon="🚌" iconBg="#EFF6FF" title="Ulaşım Rehberi" sub="Taksi ve dolmuş bilgileri">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ border: `1.5px solid ${GRAY200}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13, background: "#FFF9F5", borderBottom: `1px solid ${GRAY100}` }}>🚕 Taksi Bilgileri</div>
              <div style={{ padding: 14 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Merkeze Uzaklık</label>
                  <input
                    type="text"
                    value={taksiMerkeze}
                    onChange={(e) => setTaksiMerkeze(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Havalimanına Uzaklık</label>
                  <input
                    type="text"
                    value={taksiHavalimanı}
                    onChange={(e) => setTaksiHavalimanı(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Taksi Telefon 1</label>
                  <input
                    type="text"
                    value={taksiTel1}
                    onChange={(e) => setTaksiTel1(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Taksi Telefon 2</label>
                  <input
                    type="text"
                    value={taksiTel2}
                    onChange={(e) => setTaksiTel2(e.target.value)}
                    placeholder="+90 ..."
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
                  />
                </div>
              </div>
            </div>
            <div style={{ border: `1.5px solid ${GRAY200}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13, background: "#EFF6FF", borderBottom: `1px solid ${GRAY100}` }}>🚐 Dolmuş Bilgileri</div>
              <div style={{ padding: 14 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Hat / Güzergah</label>
                  <input
                    type="text"
                    value={dolmusHat}
                    onChange={(e) => setDolmusHat(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>İnilecek Durak</label>
                  <input
                    type="text"
                    value={dolmusDurak}
                    onChange={(e) => setDolmusDurak(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Sefer Saatleri</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="time"
                      value={dolmusSaatBas}
                      onChange={(e) => setDolmusSaatBas(e.target.value)}
                      style={{ flex: 1, padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
                    />
                    <span style={{ lineHeight: "42px", color: GRAY400 }}>—</span>
                    <input
                      type="time"
                      value={dolmusSaatBit}
                      onChange={(e) => setDolmusSaatBit(e.target.value)}
                      style={{ flex: 1, padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Ek Not</label>
                  <input
                    type="text"
                    value={dolmusNot}
                    onChange={(e) => setDolmusNot(e.target.value)}
                    placeholder="örn: Şoföre 'Zuzuu' deyin..."
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }}
                  />
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
                💡 Aktif kampanyalar otomatik olarak buraya yansır.{" "}
                <button onClick={() => router.push("/isletme/sezon")} style={{ color: TEAL, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, padding: 0 }}>Sezon &amp; Fiyatlar&apos;dan yönet →</button>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── TESİS AKTİF ONAY MODAL ──────────────────────────────────────────── */}
      {tesisAktifModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setTesisAktifModal(false)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 380, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>⏸</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 10 }}>Tesis Yayından Kaldırılsın mı?</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 6 }}>Tesis yayından kaldırılırsa müşteriler rezervasyon yapamaz.</p>
            <p style={{ fontSize: 12, color: GRAY400, marginBottom: 24 }}>Mevcut rezervasyonlar etkilenmez.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setTesisAktifModal(false)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Vazgeç</button>
              <button onClick={confirmedTesisKapat} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", background: RED, color: "white", cursor: "pointer" }}>⏸ Yayından Kaldır</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MÜŞTERİ ÖNİZLEME MODAL ─────────────────────────────────────────── */}
      {onizlemeModal && (
        <div style={{ ...overlayStyle, alignItems: "flex-start", paddingTop: 20, overflowY: "auto" }} onClick={(e) => e.target === e.currentTarget && setOnizlemeModal(false)}>
          <div style={{ background: "white", borderRadius: 16, width: 560, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", marginBottom: 20 }} onClick={(e) => e.stopPropagation()}>
            {/* Preview header */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY200}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: GRAY400 }}>👁️ Müşteri Görünümü</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: tesisAktif ? "#DCFCE7" : "#FEE2E2", color: tesisAktif ? "#16A34A" : RED }}>{tesisAktif ? "● Yayında" : "⏸ Yayında Değil"}</span>
              </div>
              <button onClick={() => setOnizlemeModal(false)} style={{ width: 28, height: 28, border: "none", background: GRAY100, borderRadius: 8, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            {/* Ana fotoğraf */}
            <div style={{ width: "100%", height: 200, background: photos[0]?.src ? "transparent" : photos[0]?.mockBg, overflow: "hidden", position: "relative" }}>
              {photos[0]?.src
                ? <img src={photos[0].src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, color: "rgba(255,255,255,0.4)" }}>{photos[0]?.mockEmoji}</div>
              }
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 20px 16px", background: "linear-gradient(transparent,rgba(0,0,0,0.7))" }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0 }}>Zuzuu Beach Hotel</h2>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: "4px 0 0" }}>📍 Bodrum, Muğla</p>
              </div>
            </div>
            {/* Mini galeri */}
            {photos.length > 1 && (
              <div style={{ display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto" }}>
                {photos.slice(1).map((p, i) => (
                  <div key={i} style={{ width: 64, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: p.mockBg }}>
                    {p.src ? <img src={p.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "rgba(255,255,255,0.5)" }}>{p.mockEmoji}</div>}
                  </div>
                ))}
              </div>
            )}
            {/* Kısa açıklama */}
            <div style={{ padding: "12px 20px", borderBottom: `1px solid ${GRAY100}` }}>
              <p style={{ fontSize: 13, color: GRAY600 }}>{kisaAciklama}</p>
            </div>
            {/* İmkânlar */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}` }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 10 }}>✨ Tesis İmkânları</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {imkanlar.filter(x => x.active).map((im, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "#F0FFFE", border: `1px solid ${TEAL}`, color: TEAL, fontWeight: 600 }}>{im.emoji} {im.name}</span>
                ))}
              </div>
            </div>
            {/* Çalışma saatleri */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${GRAY100}` }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 10 }}>🕐 Çalışma Saatleri</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                {gunler.map((g, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "6px 8px", borderRadius: 8, background: g.kapali ? GRAY100 : GRAY50, opacity: g.kapali ? 0.5 : 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: g.vurgu ? TEAL : NAVY }}>{g.name}</div>
                    <div style={{ fontSize: 10, color: GRAY600, marginTop: 2 }}>{g.kapali ? "Kapalı" : `${g.acilis}–${g.kapanis}`}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Kurallar */}
            {kurallar.length > 0 && (
              <div style={{ padding: "14px 20px" }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 10 }}>📋 Bilinmesi Gerekenler</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {kurallar.map((k, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: GRAY600 }}>
                      <span>{k.emoji}</span><span>{k.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
