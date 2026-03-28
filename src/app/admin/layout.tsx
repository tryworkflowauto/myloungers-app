"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminToastProvider } from "./AdminToastContext";
import { supabase } from "@/lib/supabase";

// CSV export helper (komisyon summary)
function komisyonCsvIndir() {
  const BOM = "\uFEFF";
  const rows = [
    ["Tesis", "Ciro", "Oran", "Komisyon"],
    ["Zuzuu Beach",   "₺148K", "%15", "₺22.2K"],
    ["Palmiye Beach", "₺68K",  "%15", "₺10.2K"],
    ["Poseidon Lux",  "₺41K",  "%15", "₺6.1K" ],
    ["TOPLAM",        "₺284K", "—",   "₺42.6K"],
  ];
  const csv = BOM + rows.map(r => r.join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "komisyon-ozet.csv"; a.click();
  URL.revokeObjectURL(url);
}

const ORANGE = "#F5821F";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const GREEN = "#10B981";
const NAVY = "#0A1628";
const RED = "#EF4444";
const SIDEBAR_W = 240;

const NAV_ITEMS = [
  { href: "/admin",               label: "Dashboard",         icon: "📊", activePath: "/admin"          },
  { href: "/admin/tesisler",      label: "Tesisler",          icon: "🏖️", badge: 2, badgeColor: ORANGE  },
  { href: "/admin/kullanicilar",  label: "Kullanıcılar",      icon: "👤"                                 },
  { href: "/admin/komisyon",      label: "Komisyon Takibi",   icon: "💰", activePath: "/admin/komisyon"  },
  { href: "/admin/abonelikler",   label: "Abonelikler",       icon: "📄"                                 },
  { href: "/admin/yorumlar",      label: "Yorum Yönetimi",    icon: "⭐", badgeColor: RED                },
  { href: "/admin/sikayetler",    label: "Şikayetler",        icon: "🚨", badgeColor: RED      },
  { href: "/admin/ayarlar",       label: "Platform Ayarları", icon: "⚙️"                                 },
];

function NavLink({ item, bekleyenYorumSayisi, bekleyenSikayetSayisi }: { item: (typeof NAV_ITEMS)[0]; bekleyenYorumSayisi: number; bekleyenSikayetSayisi: number | null }) {
  const pathname = usePathname();
  const isActive = item.activePath ? pathname === item.activePath : pathname.startsWith(item.href) && (item.href === "/admin" ? pathname === "/admin" : true);
  const badgeToShow =
    item.href === "/admin/yorumlar"
      ? (bekleyenYorumSayisi > 0 ? bekleyenYorumSayisi : null)
      : item.href === "/admin/sikayetler"
        ? (bekleyenSikayetSayisi != null && bekleyenSikayetSayisi > 0 ? bekleyenSikayetSayisi : null)
        : item.badge;

  return (
    <Link
      href={item.href}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "9px 16px",
        cursor: "pointer", textDecoration: "none",
        background: isActive ? "rgba(245,130,31,0.12)" : "transparent",
        position: "relative",
        borderLeft: isActive ? `3px solid ${ORANGE}` : "none",
        marginLeft: isActive ? 0 : 3,
      }}
    >
      <div style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, fontSize: 14, background: isActive ? "rgba(245,130,31,0.2)" : "transparent" }}>{item.icon}</div>
      <span style={{ fontSize: 13, color: isActive ? ORANGE : "#CBD5E1", fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
      {badgeToShow && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 10, background: item.badgeColor, color: "white" }}>{badgeToShow}</span>}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [bekleyenYorumSayisi, setBekleyenYorumSayisi] = useState(0);
  const [bekleyenSikayetSayisi, setBekleyenSikayetSayisi] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null);
  const [sifre, setSifre] = useState("MyL2026beach");
  const [komisyonSec, setKomisyonSec] = useState("%15 Standart");
  const [ozelKomisyon, setOzelKomisyon] = useState("");

  useEffect(() => {
    const fetchBekleyenYorumlar = async () => {
      const { count } = await supabase
        .from("yorumlar")
        .select("*", { count: "exact", head: true })
        .eq("durum", "bekliyor");
      setBekleyenYorumSayisi(count || 0);
    };
    fetchBekleyenYorumlar();
  }, []);

  const showToast = useCallback((msg: string, color: string = GREEN) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const sifreYenile = () => {
    const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let s = "MyL";
    for (let i = 0; i < 7; i++) s += c[Math.floor(Math.random() * c.length)];
    setSifre(s);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: GRAY100, color: GRAY800, display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <aside style={{ width: SIDEBAR_W, background: "#060e1a", height: "100vh", overflow: "hidden", position: "fixed", left: 0, top: 0, display: "flex", flexDirection: "column", zIndex: 100 }}>
        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/" style={{ display: "inline-flex", lineHeight: 0, flexShrink: 0 }}>
              <img src="/MyLoungers_Logo-02.png" width={100} height={60} style={{ borderRadius: "10px", objectFit: "contain" }} alt="MyLoungers" />
            </Link>
            <div>
              <span style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#fff" }}>MY LOUNGERS</span>
              <span style={{ display: "block", fontSize: 10, color: ORANGE }}>Süper Admin</span>
            </div>
          </div>
        </div>
        <div style={{ margin: "10px 16px", background: "rgba(245,130,31,0.15)", border: "1px solid rgba(245,130,31,0.3)", borderRadius: 8, padding: "7px 12px", fontSize: 11, fontWeight: 700, color: ORANGE }}>🔐 Platform Yöneticisi</div>
        <nav style={{ padding: "4px 0", flex: 1, minHeight: 0, overflowY: "auto" }}>
          <div style={{ padding: "14px 16px 5px", fontSize: 9, fontWeight: 700, color: GRAY400 }}>Platform</div>
          {NAV_ITEMS.slice(0, 3).map((n) => <NavLink key={n.label} item={n} bekleyenYorumSayisi={bekleyenYorumSayisi} bekleyenSikayetSayisi={bekleyenSikayetSayisi} />)}
          <div style={{ padding: "14px 16px 5px", fontSize: 9, fontWeight: 700, color: GRAY400 }}>Finans</div>
          {NAV_ITEMS.slice(3, 5).map((n) => <NavLink key={n.label} item={n} bekleyenYorumSayisi={bekleyenYorumSayisi} bekleyenSikayetSayisi={bekleyenSikayetSayisi} />)}
          <div style={{ padding: "14px 16px 5px", fontSize: 9, fontWeight: 700, color: GRAY400 }}>Moderasyon</div>
          {NAV_ITEMS.slice(5, 7).map((n) => <NavLink key={n.label} item={n} bekleyenYorumSayisi={bekleyenYorumSayisi} />)}
          <div style={{ padding: "14px 16px 5px", fontSize: 9, fontWeight: 700, color: GRAY400 }}>Sistem</div>
          <NavLink item={NAV_ITEMS[7]} bekleyenYorumSayisi={bekleyenYorumSayisi} bekleyenSikayetSayisi={bekleyenSikayetSayisi} />
        </nav>
        <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: ORANGE, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>ZB</div>
            <div><span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "white" }}>Zafer Bakır</span><span style={{ display: "block", fontSize: 10, color: GRAY400 }}>Süper Admin</span></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            <Link href="/" style={{ fontSize: 11, fontWeight: 600, color: "#CBD5E1", textDecoration: "none" }}>← Ana Sayfa</Link>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
              style={{ alignSelf: "flex-start", padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#CBD5E1", cursor: "pointer" }}
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: SIDEBAR_W, flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ background: "white", borderBottom: `1px solid ${GRAY200}`, padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>Platform Yönetimi</h1>
            <span style={{ fontSize: 11, color: GRAY400 }}>MyLoungers Admin · 11 Mart 2026</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => { komisyonCsvIndir(); showToast("📥 Komisyon raporu indirildi", GREEN); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>📥 Rapor İndir</button>
            <button onClick={() => setModalOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>➕ Yeni Tesis Ekle</button>
          </div>
        </header>

        <AdminToastProvider showToast={showToast}>
          <div style={{ padding: "20px 24px", flex: 1 }}>
            {children}
          </div>
        </AdminToastProvider>
      </main>

      {/* MODAL */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => { if (e.target === e.currentTarget) { setModalOpen(false); setKomisyonSec("%15 Standart"); setOzelKomisyon(""); } }}>
          <div style={{ background: "white", borderRadius: 16, width: 680, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "white", zIndex: 10 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>➕ Yeni Tesis Ekle</h2>
                <p style={{ fontSize: 11, color: GRAY400, marginTop: 2 }}>Bilgileri siz doldurun, işletme sonradan tamamlayabilir</p>
              </div>
              <button onClick={() => { setModalOpen(false); setKomisyonSec("%15 Standart"); setOzelKomisyon(""); }} style={{ background: GRAY100, border: "none", borderRadius: 8, width: 30, height: 30, fontSize: 16, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${GRAY100}` }}>Temel Bilgiler</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {["Tesis Adı", "Tesis Türü", "İşletme Sahibi", "Telefon", "E-posta", "Şehir / İlçe"].map((l, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>{l}</label>
                      {l === "Tesis Türü" ? (
                        <select style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, background: "white" }}>
                          <option>Beach Club</option><option>Otel Plajı</option><option>Havuz Alanı</option>
                        </select>
                      ) : (
                        <input type="text" placeholder={l === "Tesis Adı" ? "örn: Aqua Beach Club" : l === "İşletme Sahibi" ? "Ad Soyad" : l === "Telefon" ? "+90 5xx xxx xx xx" : l === "E-posta" ? "isletme@email.com" : "örn: Bodrum / Yalıkavak"} style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${GRAY100}` }}>Kapasite ve Model</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Toplam Şezlong</label><input type="number" placeholder="örn: 80" style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} /></div>
                  <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>İşletme Modu</label><select style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, background: "white" }}><option>Ön Ödemeli Bakiye Sistemi</option><option>Sadece Şezlong Kiralama</option></select></div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Komisyon Oranı</label>
                    <select value={komisyonSec} onChange={e => setKomisyonSec(e.target.value)} style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, background: "white" }}>
                      <option>%15 Standart</option>
                      <option>%12 Premium Partner</option>
                      <option>%10 Özel Anlaşma</option>
                      <option value="ozel">✏️ Özel Oran Gir</option>
                    </select>
                    {komisyonSec === "ozel" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                        <span style={{ fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>Özel oran:</span>
                        <input
                          type="number" min={0} max={50} value={ozelKomisyon}
                          onChange={e => setOzelKomisyon(e.target.value.replace(/[^0-9.]/g, ""))}
                          placeholder="örn: 8"
                          style={{ width: 80, padding: "7px 10px", border: `1.5px solid ${ORANGE}`, borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: "center" }}
                        />
                        <span style={{ fontSize: 12, color: "#475569" }}>%</span>
                        {ozelKomisyon && <span style={{ fontSize: 11, color: ORANGE, fontWeight: 600 }}>→ %{ozelKomisyon} uygulanacak</span>}
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Abonelik Paketi</label><select style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, background: "white" }}><option>Başlangıç 990 TL/ay</option><option>Büyüme 2.490 TL/ay</option><option>Kurumsal 4.990 TL/ay</option></select></div>
                </div>
              </div>
              <div style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GRAY400, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${GRAY100}` }}>Panel Erişimi</div>
                <div style={{ marginBottom: 12 }}><label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Geçici Şifre</label><div style={{ display: "flex", gap: 8 }}><input type="text" value={sifre} onChange={(e) => setSifre(e.target.value)} style={{ flex: 1, padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13 }} /><button onClick={sifreYenile} style={{ padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>🔄 Yenile</button></div></div>
                <div style={{ fontSize: 11, color: GRAY400 }}>Panel linki ve şifre e-posta ile gönderilecek. İlk girişte değiştirmeleri istenecek.</div>
              </div>
            </div>
            <div style={{ padding: "14px 24px", borderTop: `1px solid ${GRAY100}`, display: "flex", justifyContent: "flex-end", gap: 8, position: "sticky", bottom: 0, background: "white" }}>
              <button onClick={() => { setModalOpen(false); setKomisyonSec("%15 Standart"); setOzelKomisyon(""); }} style={{ padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button style={{ padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>Taslak Kaydet</button>
              <button onClick={() => { setModalOpen(false); showToast("Tesis oluşturuldu! Erişim bilgileri e-posta ile gönderildi.", ORANGE); }} style={{ padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: ORANGE, color: "white", cursor: "pointer" }}>✓ Tesis Oluştur ve Paneli Aç</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.color, color: "white", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 500 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
