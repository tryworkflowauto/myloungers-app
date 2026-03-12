"use client";

import {
  Plus,
  UtensilsCrossed,
  ClipboardList,
  Waves,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

// HTML :root ile birebir
const NAVY = "#0A1628";
const TEAL = "#0ABAB5";
const ORANGE = "#F5821F";
const GREEN = "#10B981";
const RED = "#EF4444";
const YELLOW = "#F59E0B";
const BLUE = "#3B82F6";
const PURPLE = "#7C3AED";
const GRAY50 = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY300 = "#CBD5E1";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const GOLD_PURPLE = "#8B5CF6";

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const GUNLER = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

// TODO: API'den çekilecek
const MOCK_SEZON = {
  ad: "Erken Sezon Aktif",
  tesis: "Zuzuu Beach Hotel",
  baslangic: "1 Mart",
  bitis: "31 Mayıs 2026",
  kalanGun: 82,
  doluluk: 68,
  haftalikGelir: "₺148K",
  hava: { derece: 24, durum: "Açık", ruzgar: "12 km/s", deniz: "Sakin" },
};

const MOCK_UYARILAR = [
  { ikon: "🍽️", baslik: "5 Bekleyen Sipariş", detay: "En eskisi 18 dk önce", renk: "turuncu" },
  { ikon: "⭐", baslik: "3 Cevaplanmayan Yorum", detay: "1 şikayet içeriyor", renk: "kirmizi" },
  { ikon: "💰", baslik: "5 Bakiye Sona Eriyor", detay: "3 gün içinde · ₺3.840", renk: "sari" },
  { ikon: "📋", baslik: "Yarın 8 Rezervasyon", detay: "İlk giriş saat 09:00", renk: "mavi" },
];

const MOCK_STAT = [
  { etiket: "Günlük Gelir", ikon: "💰", deger: "₺18.400", sub: "Bugün · Saat 14:32 itibarıyla", change: "↑ %12 dünden fazla", changeClass: "up", renk: "teal" },
  { etiket: "Aktif Şezlonglar", ikon: "🏖️", deger: "68", ek: "/100", sub: "32 boş şezlong mevcut", change: "= Dünle aynı", changeClass: "neutral", renk: "orange" },
  { etiket: "Tamamlanan Sipariş", ikon: "🍽️", deger: "89", sub: "Bugün · Ort. 9dk teslimat", change: "↑ %21 dünden fazla", changeClass: "up", renk: "green" },
  { etiket: "Aktif Müşteri", ikon: "👥", deger: "124", sub: "Tesiste şu an", change: "↑ 18 kişi dünden fazla", changeClass: "up", renk: "purple" },
];

const MOCK_DOLULUK_GRUPLARI = [
  { ad: "Gold", ikon: "⭐", sayi: 10, dolu: 9, bos: 1, yuzde: 90, renk: GOLD_PURPLE },
  { ad: "VIP", ikon: "🔥", sayi: 40, dolu: 30, bos: 10, yuzde: 75, renk: ORANGE },
  { ad: "İskele", ikon: "⚓", sayi: 20, dolu: 13, bos: 7, yuzde: 65, renk: YELLOW },
  { ad: "Silver", ikon: "🌊", sayi: 30, dolu: 22, bos: 8, yuzde: 73, renk: TEAL },
];

const MOCK_SIPARISLER = [
  { no: "S-22", urunler: "Mojito × 2 · Nachos", musteri: "Ayşe Y. · Silver", sure: "18dk", sureTip: "danger", durum: "Yeni", durumTip: "yeni" },
  { no: "V-3", urunler: "Izgara Levrek · Rosé", musteri: "Fatma D. · VIP", sure: "12dk", sureTip: "warn", durum: "Hazırlanıyor", durumTip: "hazir" },
  { no: "İ-5", urunler: "Limonata × 3", musteri: "Mehmet K. · İskele", sure: "4dk", sureTip: "ok", durum: "Hazırlanıyor", durumTip: "hazir" },
  { no: "G-1", urunler: "Kahvaltı Tabağı × 2", musteri: "Banu K. · Gold", sure: "2dk", sureTip: "ok", durum: "Yeni", durumTip: "yeni" },
];

const MOCK_REZERVASYONLAR = [
  { baslik: "Ayşe Yıldız", detay: "Silver · S-22 · 2 Kişi", saat: "09:00", bg: "#6366F1", initials: "AY" },
  { baslik: "Fatma Demir", detay: "VIP · V-3,4 · 4 Kişi", saat: "10:00", bg: ORANGE, initials: "FD" },
  { baslik: "Zeynep Arslan", detay: "Gold · G-1,2 · 2 Kişi", saat: "10:30", bg: PURPLE, initials: "ZA" },
  { baslik: "Mehmet Kaya", detay: "İskele · İ-5 · 2 Kişi", saat: "11:00", bg: GREEN, initials: "MK" },
  { baslik: "Banu Koç", detay: "Silver · S-14 · 3 Kişi", saat: "13:00", bg: YELLOW, initials: "BK" },
];

const MOCK_YORUMLAR = [
  { puan: 9.8, isim: "Ayşe Yıldız", tarih: "10 Mar", text: "Muhteşem deneyim! Şezlonglar çok rahat...", pozitif: true },
  { puan: 9.5, isim: "Mehmet Kaya", tarih: "9 Mar", text: "İskele şezlongları harika, denize çok yakın...", pozitif: true },
  { puan: 5.2, isim: "Selin Arslan", tarih: "8 Mar", text: "VIP bölge beklentimi karşılamadı...", pozitif: false },
];

const MOCK_BAKIYE = [
  { initials: "BK", isim: "Banu Koç", detay: "₺120 kalan · S-22", gun: 5 },
  { initials: "SE", isim: "Selin Erdoğan", detay: "₺3.200 kalan · V-8,9,10", gun: 3 },
];

// TODO: API'den çekilecek
const HIZLI_EYLEMLER = [
  { ikon: ClipboardList, label: "Rezervasyon Oluştur", href: "/isletme/rezervasyonlar" },
  { ikon: Waves, label: "Şezlong Haritası", href: "/isletme/sezlong-haritasi" },
  { ikon: UtensilsCrossed, label: "Siparişlere Git", href: "/isletme/siparisler" },
  { ikon: MessageSquare, label: "Yorumları Cevapla", href: "/isletme/yorumlar" },
];

export default function IsletmeDashboardPage() {
  const [tarih, setTarih] = useState("");
  const [saat, setSaat] = useState("--:--");

  useEffect(() => {
    const now = new Date();
    setTarih(`${now.getDate()} ${AYLAR[now.getMonth()]} ${now.getFullYear()} · ${GUNLER[now.getDay()]}`);
    const guncelle = () => {
      const n = new Date();
      setSaat(`${n.getHours().toString().padStart(2, "0")}:${n.getMinutes().toString().padStart(2, "0")}`);
    };
    guncelle();
    const t = setInterval(guncelle, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col min-h-full" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800 }}>
      {/* TOPBAR — .topbar exact match */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between"
        style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 60 }}
      >
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Dashboard</h1>
          <span style={{ fontSize: 11, color: GRAY400 }}>{tarih || "—"}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div
            style={{ fontSize: 13, fontWeight: 800, color: TEAL, background: "rgba(10,186,181,0.1)", padding: "6px 12px", borderRadius: 8 }}
          >
            {saat}
          </div>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg text-white transition-colors"
            style={{ background: TEAL, padding: "8px 14px", fontSize: 12, fontWeight: 600 }}
            onClick={() => { /* TODO: Hızlı rezervasyon modalı aç */ }}
          >
            <Plus size={14} />
            Hızlı Rezervasyon
          </button>
        </div>
      </header>

      {/* CONTENT — .content padding 20px 24px */}
      <div className="flex-1" style={{ padding: "20px 24px" }}>
        {/* SEZON BANNER — .sezon-banner exact */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 mb-5"
          style={{
            background: "linear-gradient(135deg,#0A1628 0%,#0d2244 50%,#0a3d3b 100%)",
            borderRadius: 14,
            padding: "18px 24px",
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "white", marginBottom: 3 }}>🌸 {MOCK_SEZON.ad}</h2>
            <span style={{ fontSize: 12, color: GRAY400 }}>{MOCK_SEZON.tesis} · {MOCK_SEZON.baslangic} — {MOCK_SEZON.bitis}</span>
          </div>
          <div className="flex gap-7">
            <div><div style={{ fontSize: 24, fontWeight: 900, color: TEAL }}>{MOCK_SEZON.kalanGun}</div><div style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>Kalan Gün</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 900, color: ORANGE }}>%{MOCK_SEZON.doluluk}</div><div style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>Doluluk</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 900, color: GREEN }}>{MOCK_SEZON.haftalikGelir}</div><div style={{ fontSize: 10, color: GRAY400, marginTop: 2 }}>Haftalık Gelir</div></div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "12px 18px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22 }}>☀️</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "white" }}>{MOCK_SEZON.hava.derece}°</div>
            <div style={{ fontSize: 11, color: GRAY400, marginTop: 2 }}>Bodrum · {MOCK_SEZON.hava.durum}</div>
            <div style={{ fontSize: 9, color: GRAY400, marginTop: 3 }}>💨 {MOCK_SEZON.hava.ruzgar} · 🌊 {MOCK_SEZON.hava.deniz}</div>
          </div>
        </div>

        {/* UYARILAR — .uyari-row, .uyari-kart + turuncu/kirmizi/sari/mavi + renkleri */}
        <div className="flex gap-2.5 mb-5 flex-wrap">
          {MOCK_UYARILAR.map((u, i) => {
            const styles: Record<string, { bg: string; border: string; strong: string; span: string }> = {
              turuncu: { bg: "#FFF7ED", border: "#FED7AA", strong: "#C2410C", span: "#EA580C" },
              kirmizi: { bg: "#FEF2F2", border: "#FECACA", strong: "#991B1B", span: "#DC2626" },
              sari: { bg: "#FFFBEB", border: "#FDE68A", strong: "#92400E", span: "#D97706" },
              mavi: { bg: "#EFF6FF", border: "#BFDBFE", strong: "#1E40AF", span: "#2563EB" },
            };
            const s = styles[u.renk];
            return (
              <div
                key={i}
                className="flex-1 min-w-[200px] rounded-xl flex items-center gap-2.5 cursor-pointer"
                style={{ background: s.bg, border: `1.5px solid ${s.border}`, padding: "12px 16px" }}
              >
                <span style={{ fontSize: 22 }}>{u.ikon}</span>
                <div>
                  <strong style={{ display: "block", fontSize: 12, fontWeight: 700, color: s.strong }}>{u.baslik}</strong>
                  <span style={{ fontSize: 11, opacity: 0.8, color: s.span }}>{u.detay}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* STAT KARTLARI — .stat-grid, .stat-kart teal/orange/green/purple */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
          {MOCK_STAT.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-[14px] relative overflow-hidden"
              style={{ border: `1px solid ${GRAY200}`, padding: "18px 20px" }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: s.renk === "teal" ? TEAL : s.renk === "orange" ? ORANGE : s.renk === "green" ? GREEN : PURPLE }}
              />
              <div style={{ fontSize: 11, color: GRAY400, fontWeight: 600, marginBottom: 8 }}>{s.ikon} {s.etiket}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: NAVY, lineHeight: 1, marginBottom: 4 }}>
                {s.deger}<span style={{ fontSize: 16, color: GRAY400, fontWeight: 600 }}>{s.ek || ""}</span>
              </div>
              <div style={{ fontSize: 11, color: GRAY400 }}>{s.sub}</div>
              <div
                className="inline-flex items-center gap-0.5 rounded-[20px] mt-1.5"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 7px",
                  background: s.changeClass === "up" ? "#DCFCE7" : s.changeClass === "neutral" ? GRAY100 : "#DCFCE7",
                  color: s.changeClass === "up" ? "#16A34A" : s.changeClass === "neutral" ? GRAY600 : "#16A34A",
                }}
              >
                {s.change}
              </div>
            </div>
          ))}
        </div>

        {/* DOLULUK WRAP — .doluluk-wrap (HTML'de doluluk-legend + grup-doluluk) */}
        <div
          className="mb-5 rounded-[14px]"
          style={{ background: "white", border: `1px solid ${GRAY200}`, padding: "18px 20px" }}
        >
          <div className="flex gap-4 flex-wrap mb-3.5">
            <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: GRAY600 }}><div className="w-2.5 h-2.5 rounded-sm" style={{ background: ORANGE }} />Dolu (44)</div>
            <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: GRAY600 }}><div className="w-2.5 h-2.5 rounded-sm" style={{ background: BLUE }} />Rezerve (24)</div>
            <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: GRAY600 }}><div className="w-2.5 h-2.5 rounded-sm" style={{ background: GREEN }} />Boş (28)</div>
            <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: GRAY600 }}><div className="w-2.5 h-2.5 rounded-sm" style={{ background: GRAY300 }} />Bakım (4)</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {MOCK_DOLULUK_GRUPLARI.map((g, i) => (
              <div
                key={i}
                className="rounded-[10px] p-3"
                style={{ background: GRAY50, border: `1px solid ${GRAY200}` }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{g.ikon} {g.ad} ({g.sayi})</div>
                <div className="rounded-[20px] h-1.5 overflow-hidden mb-1" style={{ background: GRAY200 }}>
                  <div className="h-full rounded-[20px]" style={{ width: `${g.yuzde}%`, background: g.renk }} />
                </div>
                <div style={{ fontSize: 10, color: GRAY400 }} className="flex justify-between"><span>{g.dolu} dolu</span><span>{g.bos} boş</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* HIZLI EYLEMLER — .hizli-grid, .hizli-btn, emoji yerine lucide */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {HIZLI_EYLEMLER.map((h, i) => {
            const IconComp = h.ikon;
            return (
              <Link
                key={i}
                href={h.href}
                className="flex flex-col items-center gap-2 cursor-pointer transition-all rounded-xl"
                style={{
                  background: "white",
                  border: `1.5px solid ${GRAY200}`,
                  padding: "16px 12px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = TEAL;
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(10,186,181,0.15)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = GRAY200;
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.transform = "";
                }}
              >
                <IconComp size={26} style={{ color: NAVY }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: NAVY, textAlign: "center" }}>{h.label}</span>
              </Link>
            );
          })}
        </div>

        {/* 3 KOLON — .three-col */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* AKTİF SİPARİŞLER — .kart, .kart-header, .siparis-row */}
          <div className="bg-white rounded-[14px] overflow-hidden" style={{ border: `1px solid ${GRAY200}` }}>
            <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}` }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>🍽️ Aktif Siparişler</h3>
              <span style={{ fontSize: 10, fontWeight: 700, color: ORANGE, background: "#FFF7ED", padding: "2px 8px", borderRadius: 20 }}>5 Bekliyor</span>
            </div>
            {MOCK_SIPARISLER.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 cursor-pointer last:border-b-0"
                style={{ padding: "11px 18px", borderBottom: `1px solid ${GRAY100}` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = GRAY50; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
              >
                <div
                  className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[11px] font-extrabold flex-shrink-0"
                  style={{ background: NAVY, color: TEAL }}
                >
                  {s.no}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{s.urunler}</div>
                  <div style={{ fontSize: 10, color: GRAY400 }}>{s.musteri}</div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 20,
                    background: s.sureTip === "ok" ? "#DCFCE7" : s.sureTip === "warn" ? "#FEF3C7" : "#FEE2E2",
                    color: s.sureTip === "ok" ? "#16A34A" : s.sureTip === "warn" ? "#D97706" : RED,
                  }}
                >
                  {s.sure}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 20,
                    background: s.durumTip === "yeni" ? "#EFF6FF" : "#FEF3C7",
                    color: s.durumTip === "yeni" ? BLUE : "#D97706",
                  }}
                >
                  {s.durum}
                </span>
              </div>
            ))}
            <div style={{ padding: "10px 18px", borderTop: `1px solid ${GRAY100}` }}>
              <button
                className="w-full rounded-lg"
                style={{
                  padding: "5px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  background: GRAY100,
                  color: GRAY800,
                  border: `1px solid ${GRAY200}`,
                }}
              >
                Tüm Siparişleri Gör →
              </button>
            </div>
          </div>

          {/* YARIN REZERVASYONLAR */}
          <div className="bg-white rounded-[14px] overflow-hidden" style={{ border: `1px solid ${GRAY200}` }}>
            <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}` }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>📅 Yarınki Rezervasyonlar</h3>
              <span style={{ fontSize: 10, fontWeight: 700, color: BLUE, background: "#EFF6FF", padding: "2px 8px", borderRadius: 20 }}>8 Rezervasyon</span>
            </div>
            {MOCK_REZERVASYONLAR.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 cursor-pointer last:border-b-0"
                style={{ padding: "11px 18px", borderBottom: `1px solid ${GRAY100}` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = GRAY50; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
              >
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0"
                  style={{ background: r.bg }}
                >
                  {r.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{r.baslik}</div>
                  <div style={{ fontSize: 10, color: GRAY400 }}>{r.detay}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEAL }}>{r.saat}</span>
              </div>
            ))}
            <div style={{ padding: "10px 18px", borderTop: `1px solid ${GRAY100}` }}>
              <button
                className="w-full rounded-lg"
                style={{
                  padding: "5px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  background: GRAY100,
                  color: GRAY800,
                  border: `1px solid ${GRAY200}`,
                }}
              >
                Tüm Rezervasyonlar →
              </button>
            </div>
          </div>

          {/* YORUMLAR + BAKİYE */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[14px] overflow-hidden" style={{ border: `1px solid ${GRAY200}` }}>
              <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}` }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>⭐ Bekleyen Yorumlar</h3>
                <span style={{ fontSize: 10, fontWeight: 700, color: RED, background: "#FEF2F2", padding: "2px 8px", borderRadius: 20 }}>3 Yorum</span>
              </div>
              {MOCK_YORUMLAR.map((y, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 cursor-pointer last:border-b-0"
                  style={{
                    padding: "11px 18px",
                    borderBottom: `1px solid ${GRAY100}`,
                    background: !y.pozitif ? "#FEF2F2" : undefined,
                  }}
                  onMouseEnter={(e) => { if (y.pozitif) e.currentTarget.style.background = GRAY50; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = !y.pozitif ? "#FEF2F2" : ""; }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      padding: "3px 8px",
                      borderRadius: 8,
                      color: "white",
                      background: y.pozitif ? GREEN : RED,
                      flexShrink: 0,
                    }}
                  >
                    {y.puan}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 10, fontWeight: 700, color: !y.pozitif ? RED : NAVY, marginBottom: 2 }}>
                      {!y.pozitif ? "⚠️ " : ""}{y.isim} · {y.tarih}
                    </div>
                    <div style={{ fontSize: 12, color: GRAY600, lineHeight: 1.5 }}>{y.text}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: "10px 18px", borderTop: `1px solid ${GRAY100}` }}>
                <button
                  className="w-full rounded-lg"
                  style={{
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    background: GRAY100,
                    color: GRAY800,
                    border: `1px solid ${GRAY200}`,
                  }}
                >
                  Yorumları Cevapla →
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[14px] overflow-hidden" style={{ border: `1px solid ${GRAY200}` }}>
              <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: `1px solid ${GRAY100}` }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>💰 Sona Yakın Bakiyeler</h3>
                <span style={{ fontSize: 10, fontWeight: 700, color: YELLOW, background: "#FFFBEB", padding: "2px 8px", borderRadius: 20 }}>5 Müşteri</span>
              </div>
              {MOCK_BAKIYE.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 cursor-pointer last:border-b-0"
                  style={{ padding: "11px 18px", borderBottom: `1px solid ${GRAY100}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = GRAY50; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                >
                  <div
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0"
                    style={{ background: i === 0 ? RED : PURPLE }}
                  >
                    {b.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{b.isim}</div>
                    <div style={{ fontSize: 10, color: GRAY400 }}>{b.detay}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "#FEE2E2", color: RED }}>
                    ⚠️ {b.gun} Gün
                  </span>
                </div>
              ))}
              <div style={{ padding: "10px 18px", borderTop: `1px solid ${GRAY100}` }}>
                <button
                  className="w-full rounded-lg"
                  style={{
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    background: GRAY100,
                    color: GRAY800,
                    border: `1px solid ${GRAY200}`,
                  }}
                >
                  Bakiye Raporuna Git →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
