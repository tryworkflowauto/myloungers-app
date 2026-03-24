"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const NAVY   = "#0A1628";
const TEAL   = "#0ABAB5";
const ORANGE = "#F5821F";
const GRAY50  = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const GREEN  = "#10B981";
const RED    = "#EF4444";
const YELLOW = "#F59E0B";
const BLUE   = "#3B82F6";
const PURPLE = "#7C3AED";

type SiparisDurum = "yeni" | "hazirlaniyor" | "yolda" | "teslim";
type SiparisKart = {
  id: string; sezlong: string; musteri: string; bolge: string;
  kisi: number; sure: number; sureClass: "ok" | "warn" | "danger";
  durum: SiparisDurum;
  urunler: Array<{ emoji: string; isim: string; adet: number }>;
  not?: string;
};

type BildirimItem = { id: number; metin: string; zaman: string; okundu: boolean };
type BolgeItem = { kod: string; durum: "dolu" | "bos" | "rezerve" | "cagri" };
type BolgeData = { ad: string; ikon: string; items: BolgeItem[] };
type HaftalikItem = { gun: string; h: number; color?: string; dashed?: boolean };
type SonTeslimItem = { sz: string; ad: string; sure: string; zaman: string };
type PerfData = { teslimat: number; ortSure: number; musteri: number; puan: number; tip: number };

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GarsonPage() {
  const [sayfa,         setSayfa]         = useState<"siparisler"|"bolge"|"performans">("siparisler");
  const [aktif,         setAktif]         = useState(true);
  const [cagriGoster,   setCagriGoster]   = useState(true);
  const [siparisler,    setSiparisler]    = useState<SiparisKart[]>([]);
  const [toast,         setToast]         = useState<string | null>(null);
  const [yonModal,      setYonModal]      = useState(false);
  const [bildPanel,     setBildPanel]     = useState(false);
  const [bildirimler,   setBildirimler]   = useState<BildirimItem[]>([]);
  const [detayModal,    setDetayModal]    = useState<SiparisKart | null>(null);
  const [garsonAd,      setGarsonAd]      = useState("Garson");
  const [garsonRol,     setGarsonRol]     = useState("Garson");
  const [garsonBolge,   setGarsonBolge]   = useState("Bölge: —");
  const [garsonlar,     setGarsonlar]     = useState<string[]>([]);
  const [bolgeler,      setBolgeler]      = useState<BolgeData[]>([]);
  const [haftalik,      setHaftalik]      = useState<HaftalikItem[]>([]);
  const [sonTeslimler,  setSonTeslimler]  = useState<SonTeslimItem[]>([]);
  const [perf,          setPerf]          = useState<PerfData>({ teslimat: 0, ortSure: 0, musteri: 0, puan: 0, tip: 0 });

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  // ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setYonModal(false); setDetayModal(null); setBildPanel(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    async function loadData() {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user) return;

      const userId = authData.user.id;
      const { data: personelByKid } = await supabase
        .from("personel")
        .select("id, ad, rol, tesis_id, atanan_sezlonglar, yetkiler")
        .eq("kullanici_id", userId)
        .maybeSingle();
      const { data: personelById } = await supabase
        .from("personel")
        .select("id, ad, rol, tesis_id, atanan_sezlonglar, yetkiler")
        .eq("id", userId)
        .maybeSingle();
      const personel = personelByKid ?? personelById;
      const { data: kullanici } = await supabase
        .from("kullanicilar")
        .select("id, ad, tesis_id, rol")
        .eq("id", userId)
        .maybeSingle();
      const tesisIdRaw = personel?.tesis_id ?? kullanici?.tesis_id;
      if (!tesisIdRaw) return;

      const personelId = personel?.id ? String(personel.id) : userId;
      const tesisId = String(tesisIdRaw);
      setGarsonAd(personel?.ad || kullanici?.ad || "Garson");
      setGarsonRol(personel?.rol || kullanici?.rol || "Garson");
      const rawAtanan = personel?.atanan_sezlonglar;
      const rawYetkiler = personel?.yetkiler;
      const assignedFromAtanan = Array.isArray(rawAtanan) ? rawAtanan : (Array.isArray((rawAtanan as any)?.value) ? (rawAtanan as any).value : []);
      const assignedFromYetki = Array.isArray(rawYetkiler) ? rawYetkiler : (Array.isArray((rawYetkiler as any)?.value) ? (rawYetkiler as any).value : []);
      const assignedSezlongCodes = [...assignedFromAtanan, ...assignedFromYetki]
        .filter((v: unknown): v is string => typeof v === "string")
        .map((v) => v.trim())
        .filter((v) => /^[A-Za-zÇĞİÖŞÜçğıöşü]+-?\d+$/u.test(v) || /^\d+$/.test(v));
      const garsonIdList = Array.from(new Set([personelId, userId]));
      const today = new Date();
      const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).toISOString();
      const endToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();

      const [{ data: allPersonel }, { data: sipRes }, { data: bildRes }, { data: szRes }, { data: tesRes }, { data: perfRes }] = await Promise.all([
        supabase.from("personel").select("ad").eq("tesis_id", tesisId),
        supabase
          .from("siparisler")
          .select("id, garson_id, durum, created_at, not, musteri_adi, kisi_sayisi, sezlong_id, sezlonglar(numara, sezlong_gruplari(ad)), siparis_kalemleri(adet, urun_adi)")
          .eq("tesis_id", tesisId)
          .in("garson_id", garsonIdList)
          .in("durum", ["bekliyor", "hazirlaniyor", "yolda"])
          .order("created_at", { ascending: true }),
        supabase
          .from("siparisler")
          .select("id, created_at, musteri_adi, sezlonglar(numara)")
          .eq("tesis_id", tesisId)
          .in("garson_id", garsonIdList)
          .eq("durum", "bekliyor")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("sezlonglar")
          .select("id, numara, durum, grup_id, sezlong_gruplari(ad)")
          .eq("tesis_id", tesisId)
          .order("numara", { ascending: true }),
        supabase
          .from("siparisler")
          .select("id, created_at, teslim_suresi_dk, musteri_adi, sezlonglar(numara)")
          .eq("tesis_id", tesisId)
          .in("garson_id", garsonIdList)
          .eq("durum", "teslim")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("siparisler")
          .select("id, created_at, durum, toplam, memnuniyet, teslim_suresi, teslim_suresi_dk, tip_tutar, musteri_adi")
          .eq("tesis_id", tesisId)
          .in("garson_id", garsonIdList)
          .gte("created_at", startToday)
          .lte("created_at", endToday),
      ]);

      setGarsonlar((allPersonel ?? []).map((p: any) => p.ad).filter(Boolean));

      const siparisRows = (sipRes ?? []) as any[];
      const nowMs = Date.now();
      const siparisKartlari: SiparisKart[] = siparisRows.map((s: any) => {
        const createdAtMs = s.created_at ? new Date(s.created_at).getTime() : nowMs;
        const sure = Math.max(1, Math.round((nowMs - createdAtMs) / 60000));
        const sureClass: "ok" | "warn" | "danger" = sure >= 15 ? "danger" : sure >= 8 ? "warn" : "ok";
        const durum: SiparisDurum = s.durum === "bekliyor" ? "yeni" : s.durum;
        const kalemler = (s.siparis_kalemleri ?? []).map((k: any) => ({
          emoji: "🍽️",
          isim: k.urun_adi || "Ürün",
          adet: Number(k.adet ?? 1),
        }));
        return {
          id: String(s.id),
          sezlong: s.sezlonglar?.numara ? String(s.sezlonglar.numara) : "—",
          musteri: s.musteri_adi || "Misafir",
          bolge: s.sezlonglar?.sezlong_gruplari?.ad || "Bölge",
          kisi: Number(s.kisi_sayisi ?? 1),
          sure,
          sureClass,
          durum,
          urunler: kalemler.length ? kalemler : [{ emoji: "🍽️", isim: "Sipariş", adet: 1 }],
          not: s.not || undefined,
        };
      });
      setSiparisler(siparisKartlari);

      const bildirimRows = (bildRes ?? []) as any[];
      setBildirimler(
        bildirimRows.map((b: any, idx: number) => {
          const t = b.created_at ? new Date(b.created_at) : new Date();
          const dk = Math.max(1, Math.round((Date.now() - t.getTime()) / 60000));
          return {
            id: idx + 1,
            metin: `${b.sezlonglar?.numara || "—"} · ${b.musteri_adi || "Misafir"} yeni sipariş bıraktı`,
            zaman: `${dk} dk önce`,
            okundu: false,
          };
        })
      );

      const sezlongRowsAll = (szRes ?? []) as any[];
      const sezlongRows = assignedSezlongCodes.length
        ? sezlongRowsAll.filter((sz: any) => assignedSezlongCodes.includes(String(sz.numara ?? "")))
        : sezlongRowsAll;
      const cagriSezlongSet = new Set(
        siparisRows
          .filter((s: any) => s.durum === "bekliyor")
          .map((s: any) => (s.sezlonglar?.numara ? String(s.sezlonglar.numara) : ""))
          .filter(Boolean)
      );
      const grouped = new Map<string, BolgeItem[]>();
      sezlongRows.forEach((sz: any) => {
        const bolgeAd = sz.sezlong_gruplari?.ad || "Bölge";
        if (!grouped.has(bolgeAd)) grouped.set(bolgeAd, []);
        const kod = String(sz.numara ?? "—");
        grouped.get(bolgeAd)!.push({
          kod,
          durum: cagriSezlongSet.has(kod)
            ? "cagri"
            : ((sz.durum === "dolu" || sz.durum === "bos" || sz.durum === "rezerve") ? sz.durum : "bos"),
        });
      });
      const bolgeList: BolgeData[] = Array.from(grouped.entries()).map(([ad, items], i) => ({
        ad,
        ikon: i === 0 ? "🌊" : "⚓",
        items,
      }));
      setBolgeler(bolgeList);
      setGarsonBolge(`Bölge: ${bolgeList.map((b) => b.ad).join(" & ") || "—"}`);

      const days = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
      const byDay = new Map<string, number>();
      days.forEach((d) => byDay.set(d, 0));
      siparisRows.forEach((s: any) => {
        const d = s.created_at ? new Date(s.created_at) : new Date();
        const key = days[d.getDay()];
        byDay.set(key, (byDay.get(key) ?? 0) + 1);
      });
      const maxCount = Math.max(1, ...Array.from(byDay.values()));
      setHaftalik(
        days.map((gun) => ({
          gun,
          h: Math.max(12, Math.round(((byDay.get(gun) ?? 0) / maxCount) * 100)),
          color: gun === "Cmt" ? ORANGE : undefined,
          dashed: gun === days[new Date().getDay()],
        }))
      );

      const teslimRows = (tesRes ?? []) as any[];
      setSonTeslimler(
        teslimRows.map((r: any) => {
          const t = r.created_at ? new Date(r.created_at) : new Date();
          return {
            sz: r.sezlonglar?.numara ? String(r.sezlonglar.numara) : "—",
            ad: r.musteri_adi || "Misafir",
            sure: `${Number(r.teslim_suresi_dk ?? 0)}dk`,
            zaman: t.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          };
        })
      );

      const perfRows = (perfRes ?? []) as any[];
      const teslimat = perfRows.filter((r: any) => r.durum === "teslim").length;
      const ortSureRaw =
        teslimat > 0
          ? perfRows
              .filter((r: any) => r.durum === "teslim")
              .reduce((sum: number, r: any) => sum + Number(r.teslim_suresi_dk ?? r.teslim_suresi ?? 0), 0) / teslimat
          : 0;
      const musteri = new Set(perfRows.map((r: any) => String(r.musteri_adi ?? "")).filter(Boolean)).size;
      const puanRaw =
        perfRows.length > 0
          ? perfRows.reduce((sum: number, r: any) => sum + Number(r.memnuniyet ?? 0), 0) / perfRows.length
          : 0;
      const tip = perfRows.reduce((sum: number, r: any) => sum + Number(r.tip_tutar ?? r.toplam ?? 0), 0);
      setPerf({
        teslimat,
        ortSure: Math.round(ortSureRaw),
        musteri,
        puan: Number(puanRaw.toFixed(1)),
        tip,
      });
    }

    loadData();
  }, []);

  // ── Sipariş actions ───────────────────────────────────────────────────────
  function siparisGuncelle(id: string, yeniDurum: SiparisDurum) {
    if (yeniDurum === "hazirlaniyor") {
      setSiparisler(p => p.map(s => s.id === id ? { ...s, durum: "hazirlaniyor" } : s));
      showToast("📋 Sipariş alındı — Mutfağa iletildi");
    } else if (yeniDurum === "yolda") {
      setSiparisler(p => p.map(s => s.id === id ? { ...s, durum: "yolda" } : s));
      showToast("🛵 Yola çıkıldı!");
    } else if (yeniDurum === "teslim") {
      showToast("✅ Teslimat tamamlandı!");
      setTimeout(() => {
        setSiparisler(p => p.filter(s => s.id !== id));
        if (detayModal?.id === id) setDetayModal(null);
      }, 2000);
    }
  }

  // ── Aktif toggle ─────────────────────────────────────────────────────────
  function toggleAktif() {
    const next = !aktif;
    setAktif(next);
    showToast(next ? "✅ Aktif duruma geçildi" : "⏸ Pasif duruma geçildi — Yeni sipariş gelmeyecek");
  }

  // ── Bildirimler ───────────────────────────────────────────────────────────
  const okunmamisSayi = bildirimler.filter(b => !b.okundu).length;
  function bildirimiOku(id: number) { setBildirimler(p => p.map(b => b.id === id ? { ...b, okundu: true } : b)); }
  function tumunuOku()  { setBildirimler(p => p.map(b => ({ ...b, okundu: true }))); }

  // ── Yönlendirme ───────────────────────────────────────────────────────────
  function yonlendir(garson: string) {
    setYonModal(false); setCagriGoster(false);
    showToast(`↪ S-22 → ${garson}'e yönlendirildi`);
  }

  const overlayStyle: React.CSSProperties = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300,
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, maxWidth: 420, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* TOPBAR */}
      <header style={{ background: NAVY, padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: `linear-gradient(135deg,${TEAL},${ORANGE})`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white" }}>{garsonAd.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "GS"}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{garsonAd}</div>
            <div style={{ fontSize: 10, color: TEAL }}>🛵 {garsonRol} · {garsonBolge}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={toggleAktif}
            style={{ padding: "5px 12px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", background: aktif ? GREEN : GRAY400, color: "white" }}
          >● {aktif ? "Aktif" : "Pasif"}</button>

          {/* Bildirim zili */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setBildPanel(p => !p)}
              style={{ background: "rgba(255,255,255,0.1)", border: "none", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}
            >🔔</button>
            {okunmamisSayi > 0 && (
              <span style={{ position: "absolute", top: -2, right: -2, background: RED, color: "white", fontSize: 9, fontWeight: 800, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>{okunmamisSayi}</span>
            )}
            {/* Bildirim paneli */}
            {bildPanel && (
              <div style={{ position: "absolute", top: 42, right: 0, width: 280, background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", border: `1px solid ${GRAY200}`, zIndex: 200, overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>🔔 Bildirimler</span>
                  {okunmamisSayi > 0 && <button onClick={tumunuOku} style={{ fontSize: 10, color: TEAL, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Tümünü Okundu İşaretle</button>}
                </div>
                {bildirimler.map(b => (
                  <div
                    key={b.id}
                    onClick={() => bildirimiOku(b.id)}
                    style={{ padding: "10px 14px", borderBottom: `1px solid ${GRAY100}`, background: b.okundu ? "white" : "#FFF7ED", cursor: "pointer", display: "flex", gap: 10, alignItems: "flex-start" }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.okundu ? "transparent" : ORANGE, marginTop: 4, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, color: NAVY, fontWeight: b.okundu ? 400 : 600, lineHeight: 1.4 }}>{b.metin}</p>
                      <p style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>{b.zaman}</p>
                    </div>
                  </div>
                ))}
                {bildirimler.length === 0 && <div style={{ padding: "20px 14px", textAlign: "center", fontSize: 12, color: GRAY400 }}>Bildirim yok</div>}
                <button onClick={() => setBildPanel(false)} style={{ width: "100%", padding: "10px 14px", border: "none", background: GRAY50, fontSize: 11, color: GRAY600, cursor: "pointer", fontWeight: 600 }}>Kapat</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Pasif uyarı */}
      {!aktif && (
        <div style={{ background: "#FEF3C7", border: `1px solid ${YELLOW}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#92400E" }}>
          <span>⏸</span>
          <span style={{ flex: 1 }}>Pasif moddasınız — Yeni sipariş gelmeyecek</span>
          <button onClick={toggleAktif} style={{ fontSize: 11, fontWeight: 700, color: ORANGE, background: "none", border: "none", cursor: "pointer" }}>Aktifleştir</button>
        </div>
      )}

      {/* SCROLL ALAN */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 80px" }}>

        {/* SİPARİŞLER */}
        {sayfa === "siparisler" && (
          <>
            {/* Müşteri Çağırıyor Banner */}
            {cagriGoster && (
              <div style={{ background: `linear-gradient(135deg,${RED},#9B1C1C)`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
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
                  <button
                    onClick={() => { setCagriGoster(false); showToast("🏃 S-22'ye gidiliyor…"); }}
                    style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: "white", color: RED }}
                  >✓ Geliyorum</button>
                  <button
                    onClick={() => setYonModal(true)}
                    style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,0.2)", color: "white" }}
                  >Başkasına Yönlendir</button>
                </div>
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 700, color: GRAY400, marginBottom: 10 }}>
              Aktif Siparişler ({siparisler.length})
            </div>

            {siparisler.length === 0 && (
              <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 32, textAlign: "center", color: GRAY400 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <p style={{ fontSize: 13, fontWeight: 600 }}>Tüm siparişler teslim edildi!</p>
              </div>
            )}

            {siparisler.map((s) => (
              <SiparisKartComp
                key={s.id}
                siparis={s}
                onDurumGuncelle={siparisGuncelle}
                onKartClick={() => setDetayModal(s)}
              />
            ))}
          </>
        )}

        {/* BÖLGEM */}
        {sayfa === "bolge" && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: GRAY400, marginBottom: 10 }}>Atandığım Bölgeler</div>
            {bolgeler.map((bolge) => {
              const dolu = bolge.items.filter((i) => i.durum === "dolu").length;
              const bos = bolge.items.filter((i) => i.durum === "bos").length;
              const cagri = bolge.items.filter((i) => i.durum === "cagri").length;
              return (
                <div key={bolge.ad} style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{bolge.ikon} {bolge.ad} Bölge</h3>
                    <span style={{ fontSize: 11, color: GRAY400 }}>{dolu} Dolu · {bos} Boş {cagri > 0 ? <>· <span style={{ color: RED, fontWeight: 700 }}>{cagri} Çağrı</span></> : null}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                    {bolge.items.map((sz) => {
                      const d = sz.durum;
                      const st: Record<string, { background: string; color: string; borderColor: string }> = { dolu: { background: "#FFF7ED", color: ORANGE, borderColor: "#FED7AA" }, bos: { background: "#F0FDF4", color: GREEN, borderColor: "#BBF7D0" }, rezerve: { background: "#EFF6FF", color: BLUE, borderColor: "#BFDBFE" }, cagri: { background: "#FEF2F2", color: RED, borderColor: "#FECACA" } };
                      return (
                        <div key={sz.kod} style={{ borderRadius: 8, padding: "8px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${st[d]?.borderColor ?? "transparent"}`, ...st[d] }}>
                          <span style={{ fontSize: 14 }}>{d === "dolu" ? "🟠" : d === "bos" ? "🟢" : d === "rezerve" ? "🔵" : "🔴"}</span>
                          {sz.kod}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "4px 0 10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: GRAY600 }}>🟠 Dolu</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: GRAY600 }}>🟢 Boş</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: GRAY600 }}>🔵 Rezerve</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: RED }}>🔴 Çağrı Var</div>
            </div>
          </>
        )}

        {/* PERFORMANS */}
        {sayfa === "performans" && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: GRAY400, marginBottom: 10 }}>Bugünkü Performans</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[
                { val: String(perf.teslimat),                  unit: "Teslimat",               color: GREEN  },
                { val: `${perf.ortSure}dk`,                    unit: "Ort. Teslimat Süresi",   color: BLUE   },
                { val: String(perf.musteri),                   unit: "Hizmet Verilen Müşteri", color: TEAL   },
                { val: perf.puan > 0 ? perf.puan.toFixed(1) : "0.0", unit: "⭐ Müşteri Puanı", color: PURPLE },
              ].map((c, i) => (
                <div key={i} style={{ background: "white", borderRadius: 12, border: `1px solid ${GRAY200}`, padding: 14 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: c.color }}>{c.val}</div>
                  <div style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>{c.unit}</div>
                </div>
              ))}
              <div style={{ gridColumn: "1/3", background: `linear-gradient(135deg,${ORANGE},#C2410C)`, borderRadius: 12, padding: 14, color: "white" }}>
                <div style={{ fontSize: 28, fontWeight: 900 }}>₺{perf.tip.toLocaleString("tr-TR")}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>💰 Bugünkü Tip Kazancı</div>
                <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Direkt hesabına aktarılıyor</div>
              </div>
            </div>
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 12 }}>📈 Haftalık Teslimat</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                {haftalik.map((h, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: h.color ?? TEAL, height: h.h + "%", border: h.dashed ? `2px dashed ${TEAL}` : undefined }} />
                    <span style={{ fontSize: 9, color: h.dashed ? TEAL : GRAY400 }}>{h.gun}{h.dashed ? "●" : ""}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}`, fontSize: 12, fontWeight: 700, color: NAVY }}>Son Teslimler</div>
              {sonTeslimler.map((r, i) => (
                <div key={i} style={{ padding: "12px 14px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: `4px solid ${GREEN}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: GREEN, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>{r.sz}</div>
                    <div><strong style={{ display: "block", fontSize: 13, fontWeight: 700, color: NAVY }}>{r.ad}</strong><span style={{ fontSize: 11, color: GRAY400 }}>Teslim edildi · {r.zaman}</span></div>
                  </div>
                  <span style={{ fontSize: 11, color: GREEN, fontWeight: 700 }}>✓ {r.sure}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ALT TAB BAR */}
      <div style={{ background: "white", borderTop: `1px solid ${GRAY200}`, display: "flex", position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, zIndex: 100 }}>
        {([
          { key: "siparisler" as const, icon: "🍽️", label: "Siparişler", badge: siparisler.length },
          { key: "bolge"      as const, icon: "🏖️", label: "Bölgem",     badge: cagriGoster ? 1 : undefined },
          { key: "performans" as const, icon: "📊", label: "Performans" },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setSayfa(t.key)}
            style={{ flex: 1, padding: "10px 4px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", border: "none", background: "none", position: "relative" }}
          >
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: sayfa === t.key ? TEAL : GRAY400 }}>{t.label}</span>
            {"badge" in t && t.badge !== undefined && t.badge > 0 && (
              <span style={{ position: "absolute", top: 6, marginLeft: 14, background: t.key === "bolge" ? RED : ORANGE, color: "white", fontSize: 9, fontWeight: 800, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: NAVY, color: "white", padding: "10px 20px", borderRadius: 20, fontSize: 13, fontWeight: 700, zIndex: 400, boxShadow: "0 4px 16px rgba(0,0,0,0.3)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* ── BAŞKASINA YÖNLENDIR MODAL ─────────────────────────────────────── */}
      {yonModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setYonModal(false)}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: 300, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Başkasına Yönlendir</h3>
            <p style={{ fontSize: 12, color: GRAY400, marginBottom: 16 }}>S-22 çağrısını kim alsın?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {garsonlar.map((g) => (
                <button
                  key={g}
                  onClick={() => yonlendir(g)}
                  style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${GRAY200}`, background: GRAY50, fontSize: 13, fontWeight: 600, color: NAVY, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.background = "#F0FFFE"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = GRAY200; e.currentTarget.style.background = GRAY50; }}
                >
                  <span style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${TEAL},${ORANGE})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "white" }}>{g.slice(0, 2)}</span>
                  {g}
                </button>
              ))}
            </div>
            <button onClick={() => setYonModal(false)} style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY600, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>İptal</button>
          </div>
        </div>
      )}

      {/* ── SİPARİŞ DETAY MODAL ────────────────────────────────────────────── */}
      {detayModal && (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && setDetayModal(null)}>
          <div style={{ background: "white", borderRadius: 16, width: 360, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ background: NAVY, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: TEAL, color: NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900 }}>{detayModal.sezlong}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{detayModal.musteri}</div>
                  <div style={{ fontSize: 11, color: TEAL }}>{detayModal.bolge} · {detayModal.kisi} Kişi</div>
                </div>
              </div>
              <button onClick={() => setDetayModal(null)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.1)", color: "white", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>

            <div style={{ padding: "16px" }}>
              {/* Süre */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                {(() => {
                  const sureBg    = detayModal.sureClass === "danger" ? "#FEE2E2" : detayModal.sureClass === "warn" ? "#FEF3C7" : "#DCFCE7";
                  const sureColor = detayModal.sureClass === "danger" ? RED : detayModal.sureClass === "warn" ? "#D97706" : "#16A34A";
                  return <span style={{ fontSize: 13, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: sureBg, color: sureColor }}>⏱ {detayModal.sure} dk bekleniyor</span>;
                })()}
                <span style={{ fontSize: 12, color: GRAY400, fontWeight: 600 }}>
                  {detayModal.durum === "yeni" ? "🆕 Yeni" : detayModal.durum === "hazirlaniyor" ? "⏳ Hazırlanıyor" : "🛵 Yolda"}
                </span>
              </div>

              {/* Ürünler */}
              <div style={{ fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 8 }}>SİPARİŞ İÇERİĞİ</div>
              <div style={{ background: GRAY50, borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
                {detayModal.urunler.map((u, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < detayModal.urunler.length - 1 ? `1px solid ${GRAY200}` : "none" }}>
                    <span style={{ fontSize: 20 }}>{u.emoji}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: NAVY }}>{u.isim}</span>
                    <span style={{ fontSize: 12, color: GRAY400 }}>× {u.adet}</span>
                  </div>
                ))}
              </div>

              {/* Not */}
              {detayModal.not && (
                <div style={{ background: "#FFFBEB", borderRadius: 10, padding: "10px 12px", marginBottom: 12, border: `1px solid #FDE68A`, fontSize: 12, color: "#92400E" }}>
                  <span style={{ fontWeight: 700 }}>📝 Müşteri Notu:</span> {detayModal.not}
                </div>
              )}

              {/* Progress */}
              <DurumAkisiDetay durum={detayModal.durum} />

              {/* Aksiyon */}
              <div style={{ marginTop: 14 }}>
                {detayModal.durum === "yeni" && (
                  <button onClick={() => { siparisGuncelle(detayModal.id, "hazirlaniyor"); setDetayModal(p => p ? { ...p, durum: "hazirlaniyor" } : p); }} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: ORANGE, color: "white" }}>📋 Siparişi Aldım</button>
                )}
                {detayModal.durum === "hazirlaniyor" && (
                  <button onClick={() => { siparisGuncelle(detayModal.id, "yolda"); setDetayModal(p => p ? { ...p, durum: "yolda" } : p); }} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: BLUE, color: "white" }}>🛵 Yola Çıktım</button>
                )}
                {detayModal.durum === "yolda" && (
                  <button onClick={() => { siparisGuncelle(detayModal.id, "teslim"); }} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: GREEN, color: "white" }}>✅ Teslim Ettim</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Progress bar (inline card) ────────────────────────────────────────────────
function DurumAkisiDetay({ durum }: { durum: SiparisDurum }) {
  const steps = [
    { key: "hazirlaniyor", label: "Alındı",       icon: "✓",  done: ["hazirlaniyor","yolda","teslim"].includes(durum), active: durum === "yeni" },
    { key: "hazirKontrol", label: "Hazırlanıyor", icon: "⏳", done: ["yolda","teslim"].includes(durum),               active: durum === "hazirlaniyor" },
    { key: "yolda",        label: "Yolda",         icon: "🛵", done: durum === "teslim",                               active: durum === "yolda" },
    { key: "teslim",       label: "Teslim",        icon: "✓",  done: false,                                            active: durum === "teslim" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: GRAY50, borderRadius: 10, padding: "12px 10px" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, border: `2px solid ${s.done ? GREEN : s.active ? TEAL : GRAY200}`, background: s.done ? GREEN : s.active ? TEAL : "white", color: s.done || s.active ? "white" : GRAY400, fontWeight: 700 }}>{s.icon}</div>
            <div style={{ fontSize: 8, color: s.active ? TEAL : s.done ? GREEN : GRAY400, textAlign: "center", fontWeight: s.active ? 700 : 400 }}>{s.label}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ height: 2, width: 12, background: s.done ? GREEN : GRAY200, marginBottom: 14, flexShrink: 0 }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Sipariş Kartı (list) ──────────────────────────────────────────────────────
function SiparisKartComp({ siparis, onDurumGuncelle, onKartClick }: {
  siparis: SiparisKart;
  onDurumGuncelle: (id: string, durum: SiparisDurum) => void;
  onKartClick: () => void;
}) {
  const { durum } = siparis;
  const borderColor = durum === "yeni" ? ORANGE : durum === "hazirlaniyor" ? YELLOW : durum === "yolda" ? BLUE : GREEN;
  const sureBg    = siparis.sureClass === "danger" ? "#FEE2E2" : siparis.sureClass === "warn" ? "#FEF3C7" : "#DCFCE7";
  const sureColor = siparis.sureClass === "danger" ? RED : siparis.sureClass === "warn" ? "#D97706" : "#16A34A";
  const chipStyle = durum === "yeni" ? { bg: "#EFF6FF", color: BLUE } : durum === "hazirlaniyor" ? { bg: "#FEF3C7", color: "#D97706" } : { bg: "#EDE9FE", color: PURPLE };

  return (
    <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden", marginBottom: 10, borderLeft: `4px solid ${borderColor}` }}>
      {/* Tıklanabilir üst kısım */}
      <div onClick={onKartClick} style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
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

      {/* Ürünler */}
      <div style={{ padding: "0 14px 10px" }}>
        {siparis.urunler.map((u, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < siparis.urunler.length - 1 ? `1px solid ${GRAY100}` : "none" }}>
            <span style={{ fontSize: 18 }}>{u.emoji}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: NAVY }}>{u.isim}</span>
            <span style={{ fontSize: 12, color: GRAY400 }}>× {u.adet}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {durum === "hazirlaniyor" && <ProgressBar durum="hazirlaniyor" />}
      {durum === "yolda"        && <ProgressBar durum="yolda" />}

      {/* Aksiyon butonu */}
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${GRAY100}`, background: GRAY50 }}>
        {durum === "yeni"         && <button onClick={(e) => { e.stopPropagation(); onDurumGuncelle(siparis.id, "hazirlaniyor"); }} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: ORANGE, color: "white" }}>📋 Siparişi Aldım</button>}
        {durum === "hazirlaniyor" && <button onClick={(e) => { e.stopPropagation(); onDurumGuncelle(siparis.id, "yolda"); }}       style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: BLUE,   color: "white" }}>🛵 Yola Çıktım</button>}
        {durum === "yolda"        && <button onClick={(e) => { e.stopPropagation(); onDurumGuncelle(siparis.id, "teslim"); }}      style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: GREEN,  color: "white" }}>✅ Teslim Ettim</button>}
      </div>
    </div>
  );
}

function ProgressBar({ durum }: { durum: "hazirlaniyor" | "yolda" }) {
  const done1 = true;
  const done2 = durum === "yolda";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 14px", background: GRAY50, borderRadius: 10, margin: "0 14px 8px" }}>
      {[
        { icon: "✓",  label: "Alındı",       active: false, done: true    },
        { icon: "⏳", label: "Hazırlanıyor", active: durum === "hazirlaniyor", done: done2 },
        { icon: "🛵", label: "Yolda",         active: durum === "yolda",       done: false },
        { icon: "✓",  label: "Teslim",        active: false,                   done: false },
      ].map((s, i, arr) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: `2px solid ${s.done ? GREEN : s.active ? TEAL : GRAY200}`, background: s.done ? GREEN : s.active ? TEAL : "white", color: s.done || s.active ? "white" : GRAY400 }}>{s.icon}</div>
            <div style={{ fontSize: 8, color: s.active ? TEAL : s.done ? GREEN : GRAY400, textAlign: "center" }}>{s.label}</div>
          </div>
          {i < arr.length - 1 && <div style={{ height: 2, width: 10, background: (i === 0 ? done1 : i === 1 ? done2 : false) ? GREEN : GRAY200, marginBottom: 14, flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  );
}
