"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

function formatDateLabel(d: Date) {
  const gunler = [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ];
  const aylar = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];
  return (
    d.getDate() +
    " " +
    aylar[d.getMonth()] +
    " " +
    d.getFullYear() +
    " · " +
    gunler[d.getDay()]
  );
}

function formatTimeLabel(d: Date) {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export default function IsletmePaneliPage() {
  const { data: session, status } = useSession();
  const [timeLabel, setTimeLabel] = useState("--:--");
  const [dateLabel, setDateLabel] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const now = new Date();
    setTimeLabel(formatTimeLabel(now));
    setDateLabel(formatDateLabel(now));
    const id = setInterval(() => {
      const t = new Date();
      setTimeLabel(formatTimeLabel(t));
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const isLoading = status === "loading";
  const userRole = (session?.user as any)?.role?.toLowerCase?.() as
    | string
    | undefined;
  const isIsletme = userRole === "işletme" || userRole === "isletme";

  const displayName =
    (session?.user as any)?.name || session?.user?.email || "İşletme Kullanıcısı";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((p: string) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "İP";

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "'Segoe UI',system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: "#0A1628",
        }}
      >
        İşletme paneli yükleniyor…
      </div>
    );
  }

  if (!session || !isIsletme) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "'Segoe UI',system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: "#0A1628",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 10px 40px rgba(15,23,42,0.16)",
            border: "1px solid #E5E7EB",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>🚫</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
            Yetkisiz Erişim
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 14 }}>
            Bu sayfaya sadece işletme hesapları erişebilir.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "8px 18px",
              borderRadius: 999,
              background: "#0ABAB5",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="isletme-shell">
      <style>{`
:root {
  --navy:#0A1628; --teal:#0ABAB5; --orange:#F5821F;
  --white:#fff; --gray50:#F8FAFC; --gray100:#F1F5F9;
  --gray200:#E2E8F0; --gray300:#CBD5E1; --gray400:#94A3B8;
  --gray600:#475569; --gray800:#1E293B;
  --green:#10B981; --red:#EF4444; --yellow:#F59E0B; --blue:#3B82F6;
  --purple:#7C3AED;
  --sidebar-w:240px;
}
*{margin:0;padding:0;box-sizing:border-box;}
.isletme-shell{font-family:'Segoe UI',system-ui,sans-serif;background:var(--gray100);color:var(--gray800);display:flex;min-height:100vh;}
.sidebar{width:var(--sidebar-w);background:var(--navy);min-height:100vh;position:fixed;left:0;top:0;display:flex;flex-direction:column;z-index:100;}
.sidebar-logo{padding:20px 20px 16px;border-bottom:1px solid rgba(255,255,255,0.08);}
.logo-box{display:flex;align-items:center;gap:10px;}
.logo-icon{width:36px;height:36px;background:var(--teal);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;}
.logo-text span:first-child{display:block;font-size:13px;font-weight:800;color:#fff;}
.logo-text span:last-child{display:block;font-size:10px;color:var(--teal);}
.tesis-selector{margin:12px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:8px;cursor:pointer;}
.tesis-selector .dot{width:8px;height:8px;background:var(--green);border-radius:50%;}
.tesis-selector span{font-size:12px;color:#fff;font-weight:600;flex:1;}
.sidebar-nav{padding:8px 0;flex:1;}
.nav-section{padding:16px 16px 6px;font-size:9px;font-weight:700;color:var(--gray400);letter-spacing:1.5px;text-transform:uppercase;}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;position:relative;}
.nav-item:hover{background:rgba(255,255,255,0.06);}
.nav-item.active{background:rgba(10,186,181,0.15);}
.nav-item.active::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:20px;background:var(--teal);border-radius:0 2px 2px 0;}
.nav-icon{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:15px;}
.nav-item.active .nav-icon{background:rgba(10,186,181,0.2);}
.nav-label{font-size:13px;color:var(--gray300);font-weight:500;}
.nav-item.active .nav-label{color:var(--teal);font-weight:600;}
.nav-badge{margin-left:auto;background:var(--orange);color:white;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;}
.sidebar-bottom{padding:16px;border-top:1px solid rgba(255,255,255,0.08);}
.user-info{display:flex;align-items:center;gap:10px;}
.user-avatar{width:34px;height:34px;background:linear-gradient(135deg,var(--teal),var(--orange));border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;}
.user-details span:first-child{display:block;font-size:12px;font-weight:600;color:white;}
.user-details span:last-child{display:block;font-size:10px;color:var(--gray400);}
.main{margin-left:var(--sidebar-w);flex:1;display:flex;flex-direction:column;}
.topbar{background:white;border-bottom:1px solid var(--gray200);padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;}
.topbar-left h1{font-size:16px;font-weight:700;color:var(--navy);}
.topbar-left span{font-size:11px;color:var(--gray400);}
.topbar-right{display:flex;align-items:center;gap:10px;}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;transition:all 0.2s;}
.btn-primary{background:var(--teal);color:white;}
.btn-secondary{background:var(--gray100);color:var(--gray800);border:1px solid var(--gray200);}
.btn-sm{padding:5px 10px;font-size:11px;}
.content{padding:20px 24px;flex:1;}
.sezon-banner{background:linear-gradient(135deg,var(--navy) 0%,#0d2244 50%,#0a3d3b 100%);border-radius:14px;padding:18px 24px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;}
.sb-left h2{font-size:20px;font-weight:900;color:white;margin-bottom:3px;}
.sb-left span{font-size:12px;color:var(--gray400);}
.sb-center{display:flex;gap:28px;}
.sb-stat .v{font-size:24px;font-weight:900;color:var(--teal);}
.sb-stat .l{font-size:10px;color:var(--gray400);margin-top:2px;}
.hava-kart{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:12px 18px;text-align:center;}
.hava-kart .derece{font-size:28px;font-weight:900;color:white;}
.hava-kart .durum{font-size:11px;color:var(--gray400);margin-top:2px;}
.uyari-row{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;}
.uyari-kart{flex:1;border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:10px;cursor:pointer;min-width:180px;}
.uyari-kart.turuncu{background:#FFF7ED;border:1.5px solid #FED7AA;}
.uyari-kart.kirmizi{background:#FEF2F2;border:1.5px solid #FECACA;}
.uyari-kart.sari{background:#FFFBEB;border:1.5px solid #FDE68A;}
.uyari-kart.mavi{background:#EFF6FF;border:1.5px solid #BFDBFE;}
.uk-ikon{font-size:22px;}
.uk-text strong{display:block;font-size:12px;font-weight:700;}
.uk-text span{font-size:11px;opacity:0.8;}
.turuncu .uk-text strong{color:#C2410C;} .turuncu .uk-text span{color:#EA580C;}
.kirmizi .uk-text strong{color:#991B1B;} .kirmizi .uk-text span{color:#DC2626;}
.sari .uk-text strong{color:#92400E;} .sari .uk-text span{color:#D97706;}
.mavi .uk-text strong{color:#1E40AF;} .mavi .uk-text span{color:#2563EB;}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;}
.stat-kart{background:white;border-radius:14px;border:1px solid var(--gray200);padding:18px 20px;position:relative;overflow:hidden;}
.stat-kart::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;}
.stat-kart.teal::before{background:var(--teal);}
.stat-kart.orange::before{background:var(--orange);}
.stat-kart.green::before{background:var(--green);}
.stat-kart.purple::before{background:var(--purple);}
.sk-label{font-size:11px;color:var(--gray400);font-weight:600;margin-bottom:8px;}
.sk-val{font-size:28px;font-weight:900;color:var(--navy);line-height:1;margin-bottom:4px;}
.sk-sub{font-size:11px;color:var(--gray400);}
.sk-change{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;margin-top:6px;}
.sk-change.up{background:#DCFCE7;color:#16A34A;}
.sk-change.neutral{background:var(--gray100);color:var(--gray600);}
.doluluk-wrap{background:white;border-radius:14px;border:1px solid var(--gray200);padding:18px 20px;margin-bottom:20px;}
.dw-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.dw-header h3{font-size:14px;font-weight:700;color:var(--navy);}
.doluluk-bar-wrap{display:flex;height:28px;border-radius:10px;overflow:hidden;gap:2px;margin-bottom:10px;}
.db-seg{display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:white;}
.doluluk-legend{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px;}
.leg-item{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--gray600);}
.leg-dot{width:10px;height:10px;border-radius:3px;}
.grup-doluluk{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}
.gd-item{background:var(--gray50);border-radius:10px;padding:12px;border:1px solid var(--gray200);}
.gd-item .gd-name{font-size:11px;font-weight:700;color:var(--navy);margin-bottom:6px;}
.gd-item .gd-bar{background:var(--gray200);border-radius:20px;height:6px;overflow:hidden;margin-bottom:4px;}
.gd-item .gd-fill{height:100%;border-radius:20px;}
.gd-item .gd-nums{font-size:10px;color:var(--gray400);display:flex;justify-content:space-between;}
.hizli-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}
.hizli-btn{background:white;border:1.5px solid var(--gray200);border-radius:12px;padding:16px 12px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;transition:all 0.2s;}
.hizli-btn:hover{border-color:var(--teal);box-shadow:0 4px 12px rgba(10,186,181,0.15);transform:translateY(-2px);}
.hb-icon{font-size:26px;}
.hb-label{font-size:11px;font-weight:700;color:var(--navy);text-align:center;}
.three-col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}
.kart{background:white;border-radius:14px;border:1px solid var(--gray200);overflow:hidden;}
.kart-header{padding:14px 18px;border-bottom:1px solid var(--gray100);display:flex;align-items:center;justify-content:space-between;}
.kart-header h3{font-size:13px;font-weight:700;color:var(--navy);}
.siparis-row{display:flex;align-items:center;gap:12px;padding:11px 18px;border-bottom:1px solid var(--gray100);cursor:pointer;}
.siparis-row:hover{background:var(--gray50);}
.siparis-row:last-of-type{border-bottom:none;}
.sr-szl{width:34px;height:34px;border-radius:10px;background:var(--navy);color:var(--teal);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;}
.sr-bilgi{flex:1;}
.sr-bilgi .urunler{font-size:12px;font-weight:600;color:var(--navy);}
.sr-bilgi .musteri{font-size:10px;color:var(--gray400);}
.sr-sure{font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;}
.sr-sure.ok{background:#DCFCE7;color:#16A34A;}
.sr-sure.warn{background:#FEF3C7;color:#D97706;}
.sr-sure.danger{background:#FEE2E2;color:var(--red);}
.sr-durum{font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;}
.yeni-chip{background:#EFF6FF;color:var(--blue);}
.hazirlaniyor-chip{background:#FEF3C7;color:#D97706;}
.rez-row{display:flex;align-items:center;gap:12px;padding:11px 18px;border-bottom:1px solid var(--gray100);cursor:pointer;}
.rez-row:hover{background:var(--gray50);}
.rez-row:last-of-type{border-bottom:none;}
.rr-av{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:white;flex-shrink:0;}
.rr-bilgi{flex:1;}
.rr-bilgi .isim{font-size:12px;font-weight:700;color:var(--navy);}
.rr-bilgi .detay{font-size:10px;color:var(--gray400);}
.rr-saat{font-size:11px;font-weight:700;color:var(--teal);}
.yorum-item{display:flex;align-items:flex-start;gap:10px;padding:11px 18px;border-bottom:1px solid var(--gray100);cursor:pointer;}
.yorum-item:hover{background:var(--gray50);}
.yi-puan{font-size:12px;font-weight:900;padding:3px 8px;border-radius:8px;color:white;flex-shrink:0;}
.yi-text{flex:1;font-size:12px;color:var(--gray600);line-height:1.5;}
.yi-isim{font-size:10px;font-weight:700;color:var(--navy);margin-bottom:2px;}
.bakiye-item{display:flex;align-items:center;gap:12px;padding:11px 18px;border-bottom:1px solid var(--gray100);cursor:pointer;}
.bakiye-item:hover{background:var(--gray50);}
.bi-av{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:white;flex-shrink:0;}
.bi-bilgi{flex:1;}
.bi-bilgi .isim{font-size:12px;font-weight:700;color:var(--navy);}
.bi-bilgi .detay{font-size:10px;color:var(--gray400);}
.gun-badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;}
.gun-badge.acil{background:#FEE2E2;color:var(--red);}
.saat-display{font-size:13px;font-weight:800;color:var(--teal);background:rgba(10,186,181,0.1);padding:6px 12px;border-radius:8px;}
.kart-footer{padding:10px 18px;border-top:1px solid var(--gray100);}

@media (max-width: 1024px) {
  .stat-grid{grid-template-columns:repeat(2,1fr);}
  .three-col{grid-template-columns:1fr;}
  .sidebar{display:none;}
  .main{margin-left:0;}
}

@media (max-width: 768px) {
  .uyari-row{flex-direction:column;}
  .sb-center{display:none;}
  .hizli-grid{grid-template-columns:repeat(2,1fr);}
}
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-box">
            <div className="logo-icon">🏖️</div>
            <div className="logo-text">
              <span>MY LOUNGERS</span>
              <span>İşletme Paneli</span>
            </div>
          </div>
        </div>
        <div className="tesis-selector">
          <div className="dot" />
          <span>Zuzuu Beach Hotel</span>
          <span>▾</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">Ana Menü</div>
          <Link
            href="/isletme-paneli"
            className={
              "nav-item" + (pathname === "/isletme-paneli" ? " active" : "")
            }
          >
            <div className="nav-icon">📊</div>
            <span className="nav-label">Dashboard</span>
          </Link>
          <Link
            href="/isletme/sezlong"
            className={
              "nav-item" + (pathname === "/isletme/sezlong" ? " active" : "")
            }
          >
            <div className="nav-icon">🏖️</div>
            <span className="nav-label">Şezlong Haritası</span>
          </Link>
          <Link
            href="/isletme/rezervasyonlar"
            className={
              "nav-item" +
              (pathname === "/isletme/rezervasyonlar" ? " active" : "")
            }
          >
            <div className="nav-icon">📋</div>
            <span className="nav-label">Rezervasyonlar</span>
            <span className="nav-badge">12</span>
          </Link>
          <Link
            href="/isletme/siparisler"
            className={
              "nav-item" +
              (pathname === "/isletme/siparisler" ? " active" : "")
            }
          >
            <div className="nav-icon">🍽️</div>
            <span className="nav-label">Siparişler</span>
            <span className="nav-badge">5</span>
          </Link>

          <div className="nav-section">Yönetim</div>
          <Link
            href="/isletme/menu"
            className={
              "nav-item" + (pathname === "/isletme/menu" ? " active" : "")
            }
          >
            <div className="nav-icon">🍹</div>
            <span className="nav-label">Menü Yönetimi</span>
          </Link>
          <Link
            href="/isletme/personel"
            className={
              "nav-item" + (pathname === "/isletme/personel" ? " active" : "")
            }
          >
            <div className="nav-icon">👥</div>
            <span className="nav-label">Personel</span>
          </Link>
          <Link
            href="/isletme/raporlar"
            className={
              "nav-item" + (pathname === "/isletme/raporlar" ? " active" : "")
            }
          >
            <div className="nav-icon">💰</div>
            <span className="nav-label">Bakiye &amp; Raporlar</span>
          </Link>
          <Link
            href="/isletme/sezon"
            className={
              "nav-item" + (pathname === "/isletme/sezon" ? " active" : "")
            }
          >
            <div className="nav-icon">📅</div>
            <span className="nav-label">Sezon &amp; Fiyatlar</span>
          </Link>

          <div className="nav-section">Tesis</div>
          <Link
            href="/isletme/tesis"
            className={
              "nav-item" + (pathname === "/isletme/tesis" ? " active" : "")
            }
          >
            <div className="nav-icon">🏨</div>
            <span className="nav-label">Tesis Bilgileri</span>
          </Link>
          <Link
            href="/isletme/yorumlar"
            className={
              "nav-item" + (pathname === "/isletme/yorumlar" ? " active" : "")
            }
          >
            <div className="nav-icon">⭐</div>
            <span className="nav-label">Yorumlar</span>
            <span className="nav-badge">3</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <span>{displayName}</span>
              <span>İşletme Yöneticisi</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <h1>Dashboard</h1>
            <span>{dateLabel}</span>
          </div>
          <div className="topbar-right">
            <div className="saat-display">{timeLabel}</div>
            <button className="btn btn-primary">➕ Hızlı Rezervasyon</button>
          </div>
        </header>

        <div className="content">
          {/* Sezon Banner */}
          <div className="sezon-banner">
            <div className="sb-left">
              <h2>🌸 Erken Sezon Aktif</h2>
              <span>Zuzuu Beach Hotel · 1 Mart — 31 Mayıs 2026</span>
            </div>
            <div className="sb-center">
              <div className="sb-stat">
                <div className="v">82</div>
                <div className="l">Kalan Gün</div>
              </div>
              <div className="sb-stat">
                <div className="v" style={{ color: "var(--orange)" }}>
                  %68
                </div>
                <div className="l">Doluluk</div>
              </div>
              <div className="sb-stat">
                <div className="v" style={{ color: "var(--green)" }}>
                  ₺148K
                </div>
                <div className="l">Haftalık Gelir</div>
              </div>
            </div>
            <div className="hava-kart">
              <div style={{ fontSize: 22 }}>☀️</div>
              <div className="derece">24°</div>
              <div className="durum">Bodrum · Açık</div>
              <div
                style={{
                  fontSize: 9,
                  color: "var(--gray400)",
                  marginTop: 3,
                }}
              >
                💨 12 km/s · 🌊 Sakin
              </div>
            </div>
          </div>

          {/* Uyarılar */}
          <div className="uyari-row">
            <div className="uyari-kart turuncu">
              <div className="uk-ikon">🍽️</div>
              <div className="uk-text">
                <strong>5 Bekleyen Sipariş</strong>
                <span>En eskisi 18 dk önce</span>
              </div>
            </div>
            <div className="uyari-kart kirmizi">
              <div className="uk-ikon">⭐</div>
              <div className="uk-text">
                <strong>3 Cevaplanmayan Yorum</strong>
                <span>1 şikayet içeriyor</span>
              </div>
            </div>
            <div className="uyari-kart sari">
              <div className="uk-ikon">💰</div>
              <div className="uk-text">
                <strong>5 Bakiye Sona Eriyor</strong>
                <span>3 gün içinde · ₺3.840</span>
              </div>
            </div>
            <div className="uyari-kart mavi">
              <div className="uk-ikon">📋</div>
              <div className="uk-text">
                <strong>Yarın 8 Rezervasyon</strong>
                <span>İlk giriş saat 09:00</span>
              </div>
            </div>
          </div>

          {/* Stat Kartları */}
          <div className="stat-grid">
            <div className="stat-kart teal">
              <div className="sk-label">Günlük Gelir 💰</div>
              <div className="sk-val">₺18.400</div>
              <div className="sk-sub">Bugün · Saat {timeLabel} itibarıyla</div>
              <div className="sk-change up">↑ %12 dünden fazla</div>
            </div>
            <div className="stat-kart orange">
              <div className="sk-label">Aktif Şezlonglar 🏖️</div>
              <div className="sk-val">
                68
                <span
                  style={{
                    fontSize: 16,
                    color: "var(--gray400)",
                    fontWeight: 600,
                  }}
                >
                  /100
                </span>
              </div>
              <div className="sk-sub">32 boş şezlong mevcut</div>
              <div className="sk-change neutral">= Dünle aynı</div>
            </div>
            <div className="stat-kart green">
              <div className="sk-label">Tamamlanan Sipariş 🍽️</div>
              <div className="sk-val">89</div>
              <div className="sk-sub">Bugün · Ort. 9dk teslimat</div>
              <div className="sk-change up">↑ %21 dünden fazla</div>
            </div>
            <div className="stat-kart purple">
              <div className="sk-label">Aktif Müşteri 👥</div>
              <div className="sk-val">124</div>
              <div className="sk-sub">Tesiste şu an</div>
              <div className="sk-change up">↑ 18 kişi dünden fazla</div>
            </div>
          </div>

          {/* Doluluk & Gruplar */}
          <div className="doluluk-wrap">
            <div className="dw-header">
              <h3>Doluluk Özeti</h3>
            </div>
            <div className="doluluk-legend">
              <div className="leg-item">
                <div
                  className="leg-dot"
                  style={{ background: "var(--orange)" }}
                />
                Dolu (44)
              </div>
              <div className="leg-item">
                <div
                  className="leg-dot"
                  style={{ background: "var(--blue)" }}
                />
                Rezerve (24)
              </div>
              <div className="leg-item">
                <div
                  className="leg-dot"
                  style={{ background: "var(--green)" }}
                />
                Boş (28)
              </div>
              <div className="leg-item">
                <div
                  className="leg-dot"
                  style={{ background: "var(--gray300)" }}
                />
                Bakım (4)
              </div>
            </div>
            <div className="grup-doluluk">
              <div className="gd-item">
                <div className="gd-name">⭐ Gold (10)</div>
                <div className="gd-bar">
                  <div
                    className="gd-fill"
                    style={{ width: "90%", background: "#8B5CF6" }}
                  />
                </div>
                <div className="gd-nums">
                  <span>9 dolu</span>
                  <span>1 boş</span>
                </div>
              </div>
              <div className="gd-item">
                <div className="gd-name">🔥 VIP (40)</div>
                <div className="gd-bar">
                  <div
                    className="gd-fill"
                    style={{ width: "75%", background: "var(--orange)" }}
                  />
                </div>
                <div className="gd-nums">
                  <span>30 dolu</span>
                  <span>10 boş</span>
                </div>
              </div>
              <div className="gd-item">
                <div className="gd-name">⚓ İskele (20)</div>
                <div className="gd-bar">
                  <div
                    className="gd-fill"
                    style={{ width: "65%", background: "var(--yellow)" }}
                  />
                </div>
                <div className="gd-nums">
                  <span>13 dolu</span>
                  <span>7 boş</span>
                </div>
              </div>
              <div className="gd-item">
                <div className="gd-name">🌊 Silver (30)</div>
                <div className="gd-bar">
                  <div
                    className="gd-fill"
                    style={{ width: "73%", background: "var(--teal)" }}
                  />
                </div>
                <div className="gd-nums">
                  <span>22 dolu</span>
                  <span>8 boş</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hızlı Eylemler */}
          <div className="hizli-grid">
            <div className="hizli-btn">
              <div className="hb-icon">📋</div>
              <div className="hb-label">Rezervasyon Oluştur</div>
            </div>
            <div className="hizli-btn">
              <div className="hb-icon">🏖️</div>
              <div className="hb-label">Şezlong Haritası</div>
            </div>
            <div className="hizli-btn">
              <div className="hb-icon">🍽️</div>
              <div className="hb-label">Siparişlere Git</div>
            </div>
            <div className="hizli-btn">
              <div className="hb-icon">💬</div>
              <div className="hb-label">Yorumları Cevapla</div>
            </div>
          </div>

          {/* 3 Kolon */}
          <div className="three-col">
            {/* Aktif Siparişler */}
            <div className="kart">
              <div className="kart-header">
                <h3>🍽️ Aktif Siparişler</h3>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--orange)",
                    background: "#FFF7ED",
                    padding: "2px 8px",
                    borderRadius: 20,
                  }}
                >
                  5 Bekliyor
                </span>
              </div>
              <div className="siparis-row">
                <div className="sr-szl">S-22</div>
                <div className="sr-bilgi">
                  <div className="urunler">Mojito × 2 · Nachos</div>
                  <div className="musteri">Ayşe Y. · Silver</div>
                </div>
                <span className="sr-sure danger">18dk</span>
                <span className="sr-durum yeni-chip">Yeni</span>
              </div>
              <div className="siparis-row">
                <div className="sr-szl">V-3</div>
                <div className="sr-bilgi">
                  <div className="urunler">Izgara Levrek · Rosé</div>
                  <div className="musteri">Fatma D. · VIP</div>
                </div>
                <span className="sr-sure warn">12dk</span>
                <span className="sr-durum hazirlaniyor-chip">
                  Hazırlanıyor
                </span>
              </div>
              <div className="siparis-row">
                <div className="sr-szl">İ-5</div>
                <div className="sr-bilgi">
                  <div className="urunler">Limonata × 3</div>
                  <div className="musteri">Mehmet K. · İskele</div>
                </div>
                <span className="sr-sure ok">4dk</span>
                <span className="sr-durum hazirlaniyor-chip">
                  Hazırlanıyor
                </span>
              </div>
              <div className="siparis-row">
                <div className="sr-szl">G-1</div>
                <div className="sr-bilgi">
                  <div className="urunler">Kahvaltı Tabağı × 2</div>
                  <div className="musteri">Banu K. · Gold</div>
                </div>
                <span className="sr-sure ok">2dk</span>
                <span className="sr-durum yeni-chip">Yeni</span>
              </div>
              <div className="kart-footer">
                <button className="btn btn-secondary btn-sm" style={{ width: "100%" }}>
                  Tüm Siparişleri Gör →
                </button>
              </div>
            </div>

            {/* Yarınki Rezervasyonlar */}
            <div className="kart">
              <div className="kart-header">
                <h3>📅 Yarınki Rezervasyonlar</h3>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--blue)",
                    background: "#EFF6FF",
                    padding: "2px 8px",
                    borderRadius: 20,
                  }}
                >
                  8 Rezervasyon
                </span>
              </div>
              <div className="rez-row">
                <div className="rr-av" style={{ background: "#6366F1" }}>
                  AY
                </div>
                <div className="rr-bilgi">
                  <div className="isim">Ayşe Yıldız</div>
                  <div className="detay">Silver · S-22 · 2 Kişi</div>
                </div>
                <div className="rr-saat">09:00</div>
              </div>
              <div className="rez-row">
                <div
                  className="rr-av"
                  style={{ background: "var(--orange)" }}
                >
                  FD
                </div>
                <div className="rr-bilgi">
                  <div className="isim">Fatma Demir</div>
                  <div className="detay">VIP · V-3,4 · 4 Kişi</div>
                </div>
                <div className="rr-saat">10:00</div>
              </div>
              <div className="rez-row">
                <div
                  className="rr-av"
                  style={{ background: "var(--purple)" }}
                >
                  ZA
                </div>
                <div className="rr-bilgi">
                  <div className="isim">Zeynep Arslan</div>
                  <div className="detay">Gold · G-1,2 · 2 Kişi</div>
                </div>
                <div className="rr-saat">10:30</div>
              </div>
              <div className="rez-row">
                <div
                  className="rr-av"
                  style={{ background: "var(--green)" }}
                >
                  MK
                </div>
                <div className="rr-bilgi">
                  <div className="isim">Mehmet Kaya</div>
                  <div className="detay">İskele · İ-5 · 2 Kişi</div>
                </div>
                <div className="rr-saat">11:00</div>
              </div>
              <div className="rez-row">
                <div
                  className="rr-av"
                  style={{ background: "var(--yellow)" }}
                >
                  BK
                </div>
                <div className="rr-bilgi">
                  <div className="isim">Banu Koç</div>
                  <div className="detay">Silver · S-14 · 3 Kişi</div>
                </div>
                <div className="rr-saat">13:00</div>
              </div>
              <div className="kart-footer">
                <button className="btn btn-secondary btn-sm" style={{ width: "100%" }}>
                  Tüm Rezervasyonlar →
                </button>
              </div>
            </div>

            {/* Yorumlar + Bakiye */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="kart">
                <div className="kart-header">
                  <h3>⭐ Bekleyen Yorumlar</h3>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--red)",
                      background: "#FEF2F2",
                      padding: "2px 8px",
                      borderRadius: 20,
                    }}
                  >
                    3 Yorum
                  </span>
                </div>
                <div className="yorum-item">
                  <div className="yi-puan" style={{ background: "var(--green)" }}>
                    9.8
                  </div>
                  <div className="yi-text">
                    <div className="yi-isim">Ayşe Yıldız · 10 Mar</div>
                    Muhteşem deneyim! Şezlonglar çok rahat...
                  </div>
                </div>
                <div className="yorum-item">
                  <div className="yi-puan" style={{ background: "var(--green)" }}>
                    9.5
                  </div>
                  <div className="yi-text">
                    <div className="yi-isim">Mehmet Kaya · 9 Mar</div>
                    İskele şezlongları harika, denize çok yakın...
                  </div>
                </div>
                <div className="yorum-item" style={{ background: "#FEF2F2" }}>
                  <div className="yi-puan" style={{ background: "var(--red)" }}>
                    5.2
                  </div>
                  <div className="yi-text">
                    <div
                      className="yi-isim"
                      style={{ color: "var(--red)" }}
                    >
                      ⚠️ Selin Arslan · 8 Mar
                    </div>
                    VIP bölge beklentimi karşılamadı...
                  </div>
                </div>
                <div className="kart-footer">
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: "100%" }}
                  >
                    Yorumları Cevapla →
                  </button>
                </div>
              </div>

              <div className="kart">
                <div className="kart-header">
                  <h3>💰 Sona Yakın Bakiyeler</h3>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--yellow)",
                      background: "#FFFBEB",
                      padding: "2px 8px",
                      borderRadius: 20,
                    }}
                  >
                    5 Müşteri
                  </span>
                </div>
                <div className="bakiye-item">
                  <div className="bi-av" style={{ background: "var(--red)" }}>
                    BK
                  </div>
                  <div className="bi-bilgi">
                    <div className="isim">Banu Koç</div>
                    <div className="detay">₺120 kalan · S-22</div>
                  </div>
                  <div className="gun-badge acil">⚠️ 5 Gün</div>
                </div>
                <div className="bakiye-item">
                  <div
                    className="bi-av"
                    style={{ background: "var(--purple)" }}
                  >
                    SE
                  </div>
                  <div className="bi-bilgi">
                    <div className="isim">Selin Erdoğan</div>
                    <div className="detay">₺3.200 kalan · V-8,9,10</div>
                  </div>
                  <div className="gun-badge acil">⚠️ 3 Gün</div>
                </div>
                <div className="kart-footer">
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: "100%" }}
                  >
                    Bakiye Raporuna Git →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

