"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type ResData = {
  tesis: string;
  tarih: string;
  gun: number;
  szl: string;
  kisi: number;
  toplam: number;
};

const DEFAULT_RES: ResData = {
  tesis: "Zuzuu Beach Hotel",
  tarih: "15 – 17 Temmuz 2025",
  gun: 2,
  szl: "A3, A4",
  kisi: 2,
  toplam: 5000,
};

// Formats "2026-03-12" → "12 Mart 2026"
const TR_MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
function fmtISO(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return parseInt(d) + " " + TR_MONTHS[parseInt(m) - 1] + " " + y;
}

const QR_PATTERN = [
  1,1,1,1,1,1,1,0,1,0,
  1,0,0,0,0,0,1,0,0,1,
  1,0,1,1,1,0,1,0,1,0,
  1,0,1,1,1,0,1,0,0,1,
  1,0,1,1,1,0,1,0,1,1,
  1,0,0,0,0,0,1,0,0,0,
  1,1,1,1,1,1,1,0,1,0,
  0,0,0,0,0,0,0,0,1,1,
  1,0,1,1,0,1,0,1,0,1,
  0,1,0,0,1,0,1,0,1,0,
];

function OdemeContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [res, setRes] = useState<ResData>(DEFAULT_RES);
  const [payMethod, setPayMethod] = useState("pm-card");
  const [form, setForm] = useState({ name: "", surname: "", phone: "", email: "", tc: "", guest2name: "", guest2surname: "", note: "" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [kvkk, setKvkk] = useState(false);
  const [kvkkErr, setKvkkErr] = useState(false);

  useEffect(() => {
    // 1. Try URL query params (preferred — passed from hotel detail page)
    const pTesis   = searchParams.get("tesis");
    const pBaslangic = searchParams.get("tarihBaslangic");
    const pBitis   = searchParams.get("tarihBitis");
    const pGun     = searchParams.get("gun");
    const pSzl     = searchParams.get("sezlonglar");
    const pKisi    = searchParams.get("kisi");
    const pFiyat   = searchParams.get("fiyat");

    if (pBaslangic && pSzl) {
      const tarihLabel = pBitis && pBitis !== pBaslangic
        ? fmtISO(pBaslangic) + " – " + fmtISO(pBitis)
        : fmtISO(pBaslangic) + " (tek gün)";
      setRes({
        tesis:  pTesis  || DEFAULT_RES.tesis,
        tarih:  tarihLabel,
        gun:    parseInt(pGun  || "1"),
        szl:    (pSzl   || "").replace(/,/g, ", "),
        kisi:   parseInt(pKisi || "1"),
        toplam: parseInt(pFiyat || "0"),
      });
      return;
    }
    // 2. Fall back to sessionStorage (legacy)
    try {
      const tesis  = sessionStorage.getItem("ml_tesis")  || DEFAULT_RES.tesis;
      const tarih  = sessionStorage.getItem("ml_tarih")  || DEFAULT_RES.tarih;
      const gun    = parseInt(sessionStorage.getItem("ml_gun")  || "2");
      const szl    = sessionStorage.getItem("ml_szl")    || DEFAULT_RES.szl;
      const kisi   = parseInt(sessionStorage.getItem("ml_kisi") || "2");
      const toplam = parseInt(sessionStorage.getItem("ml_toplam") || "5000");
      setRes({ tesis, tarih, gun, szl, kisi, toplam });
    } catch (_) {}
  }, [searchParams]);

  function validate() {
    const e: Record<string, boolean> = {};
    if (!form.name.trim()) e.name = true;
    if (!form.surname.trim()) e.surname = true;
    if (!form.phone.trim()) e.phone = true;
    if (!form.email.trim()) e.email = true;
    setErrors(e);
    if (!kvkk) { setKvkkErr(true); return false; }
    setKvkkErr(false);
    return Object.keys(e).length === 0;
  }

  function goStep(n: number) {
    if (step === 2 && n === 3) { if (!validate()) return; }
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const szlChips = res.szl.split(", ").filter(Boolean);
  const unitPrice = res.toplam / (res.gun * Math.max(res.kisi, 1));
  const tesisSlug = (searchParams.get("tesis") || "reklamotv").toLowerCase();

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --navy:#0A1628;--teal:#0ABAB5;--tdk:#089490;--tlt:#E6F7F7;
          --or:#F5821F;--wh:#fff;--bg:#F4F6F9;--bd:#E5E7EB;
          --i2:#374151;--i3:#6B7280;--r2:12px;--r3:16px;--r4:20px;
          --sh:0 1px 4px rgba(0,0,0,.07);--sh2:0 4px 20px rgba(0,0,0,.12);
          --green:#22C55E;--green-dk:#16A34A;
        }
        body{font-family:sans-serif;background:var(--bg);color:var(--navy);font-size:15px;min-height:100vh}
        .nav{background:var(--wh);border-bottom:1px solid var(--bd);height:62px;display:flex;align-items:center;padding:0 24px;gap:12px;position:sticky;top:0;z-index:200;box-shadow:var(--sh)}
        .nav-logo{height:38px;cursor:pointer}
        .nav-back{display:flex;align-items:center;gap:5px;font-size:.78rem;font-weight:700;color:var(--i3);text-decoration:none;border:1.5px solid var(--bd);padding:6px 12px;border-radius:9px;transition:all .12s}
        .nav-back:hover{border-color:var(--navy);color:var(--navy)}
        .nav-sp{flex:1}
        .nav-secure{display:flex;align-items:center;gap:6px;font-size:.72rem;font-weight:700;color:var(--green-dk);background:#F0FDF4;border:1px solid #BBF7D0;padding:6px 12px;border-radius:9px}
        .progress-wrap{background:var(--wh);border-bottom:1px solid var(--bd);padding:16px 24px}
        .progress-inner{max-width:780px;margin:0 auto}
        .steps{display:flex;align-items:center}
        .step-item{flex:1;display:flex;align-items:center}
        .step-circle{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:900;flex-shrink:0;z-index:1;transition:all .25s;border:2px solid var(--bd);background:var(--wh);color:var(--i3)}
        .step-circle.done{background:var(--green);border-color:var(--green);color:#fff}
        .step-circle.active{background:var(--or);border-color:var(--or);color:#fff;box-shadow:0 0 0 4px rgba(245,130,31,.15)}
        .step-label{margin-left:8px;font-size:.72rem;font-weight:700;color:var(--i3);white-space:nowrap}
        .step-label.active{color:var(--navy);font-weight:900}
        .step-label.done{color:var(--green-dk)}
        .step-line{flex:1;height:2px;background:var(--bd);margin:0 8px;transition:background .25s}
        .step-line.done{background:var(--green)}
        .page{max-width:1100px;margin:0 auto;padding:28px 20px 60px;display:grid;grid-template-columns:1fr 360px;gap:24px;align-items:start}
        .card{background:var(--wh);border:1px solid var(--bd);border-radius:var(--r4);box-shadow:var(--sh);overflow:hidden;margin-bottom:16px}
        .card-head{padding:18px 22px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:10px}
        .card-head-ic{font-size:1.1rem}
        .card-head-t{font-size:.92rem;font-weight:900;color:var(--navy)}
        .card-head-s{font-size:.72rem;color:var(--i3);margin-top:1px}
        .card-body{padding:20px 22px}
        .res-hotel{display:flex;gap:16px;align-items:flex-start;margin-bottom:20px}
        .res-hotel-img{width:90px;height:70px;border-radius:10px;object-fit:cover;flex-shrink:0;background:#E5E7EB}
        .res-hotel-name{font-size:1rem;font-weight:900;color:var(--navy)}
        .res-hotel-cat{font-size:.68rem;font-weight:700;color:var(--tdk);background:var(--tlt);padding:2px 8px;border-radius:50px;border:1px solid #B2EBEA;display:inline-block;margin-top:4px}
        .res-hotel-loc{font-size:.72rem;color:var(--i3);margin-top:4px;display:flex;align-items:center;gap:4px}
        .res-rows{display:flex;flex-direction:column;gap:10px}
        .res-row{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;background:var(--bg);border-radius:10px;border:1px solid var(--bd)}
        .res-row-l{display:flex;align-items:center;gap:8px}
        .res-row-ic{font-size:.95rem;width:24px;text-align:center}
        .res-row-t{font-size:.78rem;font-weight:700;color:var(--i3)}
        .res-row-v{font-size:.82rem;font-weight:900;color:var(--navy);text-align:right}
        .res-row-sub{font-size:.65rem;color:var(--i3);text-align:right;margin-top:2px}
        .szl-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}
        .szl-chip{background:var(--or);color:#fff;font-size:.72rem;font-weight:800;padding:4px 10px;border-radius:7px}
        .price-breakdown{margin-top:16px;padding:14px;background:linear-gradient(135deg,#F0FDF4,#ECFDF5);border:1px solid #BBF7D0;border-radius:12px}
        .pb-row{display:flex;justify-content:space-between;font-size:.78rem;color:var(--i2);padding:3px 0}
        .pb-row.total{font-size:.95rem;font-weight:900;color:var(--navy);padding-top:10px;margin-top:6px;border-top:1px solid #BBF7D0}
        .policy-box{margin-top:14px;padding:12px 14px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;font-size:.72rem;color:#92400E;line-height:1.55}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .fg{display:flex;flex-direction:column;gap:5px}
        .fg.full{grid-column:1/-1}
        .fg label{font-size:.7rem;font-weight:800;color:var(--i3);text-transform:uppercase;letter-spacing:.07em}
        .fg input,.fg select{border:1.5px solid var(--bd);border-radius:10px;padding:11px 14px;font-size:.85rem;color:var(--navy);outline:none;transition:border .12s;background:var(--wh)}
        .fg input:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(10,186,181,.1)}
        .fg input.err{border-color:#EF4444;box-shadow:0 0 0 3px rgba(239,68,68,.1)}
        .fg-hint{font-size:.65rem;color:var(--i3);margin-top:2px}
        .fg-err{font-size:.65rem;color:#EF4444}
        .guests-list{display:flex;flex-direction:column;gap:12px}
        .guest-block{background:var(--bg);border:1px solid var(--bd);border-radius:12px;padding:14px 16px}
        .guest-title{font-size:.75rem;font-weight:900;color:var(--navy);margin-bottom:12px;display:flex;align-items:center;gap:6px}
        .guest-num{background:var(--or);color:#fff;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:900}
        .kvkk{display:flex;align-items:flex-start;gap:10px;padding:14px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;font-size:.72rem;color:#1E40AF;line-height:1.55;cursor:pointer}
        .kvkk a{color:var(--tdk);font-weight:700}
        .pay-methods{display:flex;gap:8px;margin-bottom:18px}
        .pay-method{flex:1;border:2px solid var(--bd);border-radius:12px;padding:12px;cursor:pointer;text-align:center;transition:all .15s}
        .pay-method:hover{border-color:var(--teal)}
        .pay-method.on{border-color:var(--teal);background:var(--tlt)}
        .pay-method-ic{font-size:1.4rem;margin-bottom:4px}
        .pay-method-t{font-size:.72rem;font-weight:800;color:var(--navy)}
        .pay-method-s{font-size:.62rem;color:var(--i3);margin-top:1px}
        .iyzico-wrap{background:linear-gradient(135deg,#F8FAFF,#EEF2FF);border:2px dashed #C7D2FE;border-radius:16px;padding:28px;text-align:center}
        .iyzico-logo{font-size:1.8rem;margin-bottom:8px}
        .iyzico-title{font-size:.92rem;font-weight:900;color:#3730A3;margin-bottom:4px}
        .iyzico-sub{font-size:.72rem;color:#6366F1;margin-bottom:18px}
        .iyzico-card-form{max-width:340px;margin:0 auto;display:flex;flex-direction:column;gap:12px;text-align:left}
        .iyzico-field{border:1.5px solid #C7D2FE;border-radius:10px;padding:11px 14px;font-size:.85rem;color:var(--navy);outline:none;width:100%;background:#fff;transition:border .12s}
        .iyzico-field:focus{border-color:#6366F1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
        .iyzico-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .iyzico-badge{display:inline-flex;align-items:center;gap:5px;font-size:.65rem;font-weight:700;color:#15803D;background:#F0FDF4;border:1px solid #BBF7D0;padding:4px 10px;border-radius:50px;margin-top:6px}
        .pay-alts{display:flex;gap:10px;margin-top:14px}
        .pay-alt{flex:1;border:1.5px solid var(--bd);border-radius:12px;padding:14px;cursor:pointer;text-align:center;background:var(--wh);transition:all .15s}
        .pay-alt:hover{border-color:var(--navy);transform:translateY(-1px)}
        .pay-alt-ic{font-size:1.5rem;margin-bottom:5px}
        .pay-alt-t{font-size:.72rem;font-weight:800;color:var(--navy)}
        .pay-alt-s{font-size:.62rem;color:var(--i3)}
        .pay-secure-strip{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:16px;padding:10px;background:#F9FAFB;border-radius:10px;flex-wrap:wrap}
        .pay-sec-item{display:flex;align-items:center;gap:5px;font-size:.65rem;font-weight:700;color:var(--i3)}
        .success-hero{text-align:center;padding:28px 20px 20px}
        .success-ic{font-size:4rem;margin-bottom:12px}
        .success-title{font-size:1.3rem;font-weight:900;color:var(--navy);margin-bottom:6px}
        .success-sub{font-size:.82rem;color:var(--i3)}
        .success-code{font-size:1.5rem;font-weight:900;color:var(--tdk);letter-spacing:.15em;background:var(--tlt);padding:8px 20px;border-radius:10px;display:inline-block;margin-top:12px;border:1px solid #B2EBEA}
        .qr-wrap{text-align:center;padding:20px}
        .qr-box{width:200px;height:200px;margin:0 auto 14px;background:var(--wh);border:3px solid var(--navy);border-radius:16px;display:flex;align-items:center;justify-content:center;overflow:hidden}
        .qr-inner{display:grid;grid-template-columns:repeat(10,1fr);gap:2px;padding:14px;width:100%;height:100%}
        .qr-label{font-size:.75rem;font-weight:700;color:var(--i3)}
        .conf-details{display:flex;flex-direction:column;gap:8px;padding:0 22px 20px}
        .conf-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg);border-radius:9px}
        .conf-row-l{font-size:.75rem;color:var(--i3);display:flex;align-items:center;gap:7px}
        .conf-row-v{font-size:.78rem;font-weight:800;color:var(--navy)}
        .action-btns{display:flex;gap:10px;padding:0 22px 22px}
        .btn-dl{flex:1;background:var(--navy);color:#fff;border:none;border-radius:11px;padding:13px;font-size:.82rem;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .12s}
        .btn-dl:hover{background:var(--tdk)}
        .btn-share{background:var(--wh);color:var(--navy);border:1.5px solid var(--bd);border-radius:11px;padding:13px 18px;font-size:.82rem;font-weight:800;cursor:pointer;transition:all .12s}
        .btn-share:hover{border-color:var(--navy)}
        .sidebar{position:sticky;top:76px;display:flex;flex-direction:column;gap:14px}
        .sum-card{background:var(--wh);border:1px solid var(--bd);border-radius:var(--r4);box-shadow:var(--sh);overflow:hidden}
        .sum-img{width:100%;height:140px;object-fit:cover;display:block;background:#E5E7EB}
        .sum-body{padding:16px}
        .sum-name{font-size:.95rem;font-weight:900;color:var(--navy);margin-bottom:4px}
        .sum-meta{font-size:.7rem;color:var(--i3);margin-bottom:12px;display:flex;align-items:center;gap:5px}
        .sum-rows{display:flex;flex-direction:column;gap:7px}
        .sum-row{display:flex;justify-content:space-between;font-size:.75rem}
        .sum-row-l{color:var(--i3)}
        .sum-row-v{font-weight:800;color:var(--navy)}
        .sum-divider{border:none;border-top:1px solid var(--bd);margin:10px 0}
        .sum-total{display:flex;justify-content:space-between;font-size:.95rem;font-weight:900}
        .sum-total-v{color:var(--green-dk)}
        .trust-strip{background:var(--wh);border:1px solid var(--bd);border-radius:var(--r3);padding:14px;display:flex;flex-direction:column;gap:8px}
        .trust-item{display:flex;align-items:center;gap:9px;font-size:.72rem;color:var(--i2)}
        .trust-ic{font-size:1rem;width:22px;text-align:center}
        .nav-actions{display:flex;gap:10px;margin-top:20px}
        .btn-primary{background:var(--or);color:#fff;border:none;border-radius:12px;padding:14px 28px;font-size:.88rem;font-weight:900;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:8px;width:100%;justify-content:center}
        .btn-primary:hover{background:#DC6C10;transform:translateY(-1px)}
        .btn-secondary{background:var(--wh);color:var(--navy);border:1.5px solid var(--bd);border-radius:12px;padding:14px 20px;font-size:.85rem;font-weight:700;cursor:pointer;transition:all .12s;white-space:nowrap}
        .btn-secondary:hover{border-color:var(--navy)}
        @media(max-width:1024px){.page{grid-template-columns:1fr}.sidebar{position:static;display:grid;grid-template-columns:1fr 1fr;gap:14px}}
        @media(max-width:768px){
          .page{padding:16px 12px 60px}
          .form-grid{grid-template-columns:1fr}
          .fg.full{grid-column:auto}
          .sidebar{grid-template-columns:1fr}
          .pay-methods{flex-direction:column}
          .action-btns{flex-direction:column}
          .step-label{display:none}
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <Link href="/">
          <img className="nav-logo" src="/logo.png" alt="MyLoungers" />
        </Link>
        <Link href={`/tesis/${tesisSlug}`} className="nav-back">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Tesis Detay
        </Link>
        <span className="nav-sp" />
        <div className="nav-secure">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          <span>Güvenli Ödeme</span>
        </div>
      </nav>

      {/* PROGRESS */}
      <div className="progress-wrap">
        <div className="progress-inner">
          <div className="steps">
            {[["1","Özet"],["2","Kişi Bilgileri"],["3","Ödeme"],["4","Onay"]].map(([n, label], idx) => (
              <div key={n} style={{display:"contents"}}>
                <div className="step-item">
                  <div className={`step-circle${step > idx+1 ? " done" : step === idx+1 ? " active" : ""}`}>
                    {step > idx+1
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      : n}
                  </div>
                  <span className={`step-label${step === idx+1 ? " active" : step > idx+1 ? " done" : ""}`}>{label}</span>
                </div>
                {idx < 3 && <div className={`step-line${step > idx+1 ? " done" : ""}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page">
        <div>

          {/* ADIM 1: ÖZET */}
          {step === 1 && (
            <div>
              <div className="card">
                <div className="card-head">
                  <span className="card-head-ic">🏖️</span>
                  <div><div className="card-head-t">Rezervasyon Özeti</div><div className="card-head-s">Devam etmeden önce bilgileri kontrol edin</div></div>
                </div>
                <div className="card-body">
                  <div className="res-hotel">
                    <img className="res-hotel-img" src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=200&fit=crop" alt="Zuzuu" />
                    <div>
                      <div className="res-hotel-name">{res.tesis}</div>
                      <span className="res-hotel-cat">Beach Club</span>
                      <div className="res-hotel-loc">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        Yalıkavak, Bodrum
                      </div>
                    </div>
                  </div>

                  <div className="res-rows">
                    <div className="res-row">
                      <div className="res-row-l"><span className="res-row-ic">📅</span><span className="res-row-t">Tarih Aralığı</span></div>
                      <div><div className="res-row-v">{res.tarih}</div><div className="res-row-sub">{res.gun} gün</div></div>
                    </div>
                    <div className="res-row">
                      <div className="res-row-l"><span className="res-row-ic">👥</span><span className="res-row-t">Kişi Sayısı</span></div>
                      <div><div className="res-row-v">{res.kisi} Kişi</div></div>
                    </div>
                    <div className="res-row">
                      <div className="res-row-l"><span className="res-row-ic">🛏</span><span className="res-row-t">Seçilen Şezlonglar</span></div>
                      <div>
                        <div className="szl-chips">
                          {szlChips.map((s) => <span key={s} className="szl-chip">{s}</span>)}
                        </div>
                        <div className="res-row-sub" style={{ marginTop: 5 }}>İskele Bölgesi</div>
                      </div>
                    </div>
                    <div className="res-row">
                      <div className="res-row-l"><span className="res-row-ic">💰</span><span className="res-row-t">Birim Fiyat</span></div>
                      <div><div className="res-row-v">₺{unitPrice.toLocaleString("tr-TR")} / gün</div><div className="res-row-sub">/ şezlong</div></div>
                    </div>
                  </div>

                  <div className="price-breakdown">
                    <div className="pb-row"><span>{res.kisi} şezlong × {res.gun} gün</span><span>{res.kisi * res.gun} rezervasyon</span></div>
                    <div className="pb-row"><span>Birim fiyat</span><span>₺{unitPrice.toLocaleString("tr-TR")}</span></div>
                    <div className="pb-row"><span>Ara toplam</span><span>₺{res.toplam.toLocaleString("tr-TR")}</span></div>
                    <div className="pb-row"><span>Hizmet bedeli</span><span style={{ color: "var(--green-dk)" }}>Ücretsiz</span></div>
                    <div className="pb-row total"><span>Toplam</span><span>₺{res.toplam.toLocaleString("tr-TR")}</span></div>
                  </div>

                  <div className="policy-box">
                    🔄 <b>Ücretsiz İptal:</b> Rezervasyon tarihinden 24 saat öncesine kadar ücretsiz iptal hakkınız bulunmaktadır.
                  </div>
                </div>
              </div>
              <div className="nav-actions">
                <button className="btn-primary" onClick={() => goStep(2)}>
                  Kişi Bilgilerine Geç
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* ADIM 2: KİŞİ BİLGİLERİ */}
          {step === 2 && (
            <div>
              <div className="card">
                <div className="card-head">
                  <span className="card-head-ic">👤</span>
                  <div><div className="card-head-t">Kişi Bilgileri</div><div className="card-head-s">İletişim ve giriş bilgileri</div></div>
                </div>
                <div className="card-body">
                  <div className="guests-list">
                    <div className="guest-block">
                      <div className="guest-title"><span className="guest-num">1</span> 1. Misafir (Hesap Sahibi)</div>
                      <div className="form-grid">
                        <div className="fg">
                          <label>Ad *</label>
                          <input className={errors.name ? "err" : ""} type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Adınız" />
                          {errors.name && <span className="fg-err">Bu alan zorunludur</span>}
                        </div>
                        <div className="fg">
                          <label>Soyad *</label>
                          <input className={errors.surname ? "err" : ""} type="text" value={form.surname} onChange={(e) => setForm({...form, surname: e.target.value})} placeholder="Soyadınız" />
                          {errors.surname && <span className="fg-err">Bu alan zorunludur</span>}
                        </div>
                        <div className="fg">
                          <label>Telefon *</label>
                          <input className={errors.phone ? "err" : ""} type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="05XX XXX XX XX" />
                          {errors.phone && <span className="fg-err">Geçerli bir telefon girin</span>}
                        </div>
                        <div className="fg">
                          <label>E-posta *</label>
                          <input className={errors.email ? "err" : ""} type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="ornek@mail.com" />
                          {errors.email && <span className="fg-err">Geçerli bir e-posta girin</span>}
                        </div>
                        <div className="fg full">
                          <label>TC Kimlik No (opsiyonel)</label>
                          <input type="text" value={form.tc} onChange={(e) => setForm({...form, tc: e.target.value})} placeholder="Tesis girişi için gerekebilir" maxLength={11} />
                          <span className="fg-hint">Bazı tesisler giriş için TC kimlik numarası istemektedir</span>
                        </div>
                      </div>
                    </div>

                    {res.kisi >= 2 && (
                      <div className="guest-block">
                        <div className="guest-title"><span className="guest-num">2</span> 2. Misafir</div>
                        <div className="form-grid">
                          <div className="fg">
                            <label>Ad</label>
                            <input type="text" value={form.guest2name} onChange={(e) => setForm({...form, guest2name: e.target.value})} placeholder="Adı" />
                          </div>
                          <div className="fg">
                            <label>Soyad</label>
                            <input type="text" value={form.guest2surname} onChange={(e) => setForm({...form, guest2surname: e.target.value})} placeholder="Soyadı" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div className="fg full" style={{ marginBottom: 12 }}>
                      <label>Özel İstek (opsiyonel)</label>
                      <input type="text" value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} placeholder="Gölgelik tercih, erken giriş vb." />
                    </div>
                    <label className="kvkk">
                      <input type="checkbox" checked={kvkk} onChange={(e) => { setKvkk(e.target.checked); setKvkkErr(false); }} />
                      <span><a href="#">Kullanım Koşulları</a>'nı ve <a href="#">KVKK Aydınlatma Metni</a>'ni okudum, onaylıyorum.</span>
                    </label>
                    {kvkkErr && <div style={{ fontSize: ".65rem", color: "#EF4444", marginTop: 4 }}>Devam etmek için onay vermeniz gerekmektedir</div>}
                  </div>
                </div>
              </div>
              <div className="nav-actions">
                <button className="btn-secondary" onClick={() => goStep(1)}>← Geri</button>
                <button className="btn-primary" onClick={() => goStep(3)}>
                  Ödemeye Geç
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* ADIM 3: ÖDEME */}
          {step === 3 && (
            <div>
              <div className="card">
                <div className="card-head">
                  <span className="card-head-ic">💳</span>
                  <div><div className="card-head-t">Ödeme</div><div className="card-head-s">Güvenli ödeme · SSL şifreli</div></div>
                </div>
                <div className="card-body">
                  <div style={{ fontSize: ".7rem", fontWeight: 800, color: "var(--i3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Ödeme Yöntemi</div>
                  <div className="pay-methods">
                    {[["pm-card","💳","Kredi / Banka Kartı","Visa, MC, Troy"],["pm-taksit","📅","Taksit","3–12 taksit"],["pm-eft","🏦","EFT / Havale","Banka transferi"]].map(([id,ic,t,s]) => (
                      <div key={id} className={`pay-method${payMethod === id ? " on" : ""}`} onClick={() => setPayMethod(id as string)}>
                        <div className="pay-method-ic">{ic}</div>
                        <div className="pay-method-t">{t}</div>
                        <div className="pay-method-s">{s}</div>
                      </div>
                    ))}
                  </div>

                  {payMethod === "pm-card" && (
                    <div className="iyzico-wrap">
                      <div className="iyzico-logo">🔒</div>
                      <div className="iyzico-title">iyzico Güvenli Ödeme</div>
                      <div className="iyzico-sub">Ödeme bilgileriniz 256-bit SSL ile korunmaktadır</div>
                      <div className="iyzico-card-form">
                        <input className="iyzico-field" type="text" placeholder="Kart Üzerindeki İsim" maxLength={40} />
                        <input className="iyzico-field" type="text" placeholder="Kart Numarası" maxLength={19} />
                        <div className="iyzico-row">
                          <input className="iyzico-field" type="text" placeholder="AA/YY" maxLength={5} />
                          <input className="iyzico-field" type="text" placeholder="CVV" maxLength={3} />
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <span className="iyzico-badge">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                            256-bit SSL · PCI DSS Uyumlu
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14, opacity: .6 }}>
                        <span style={{ fontSize: "1.4rem" }}>💳</span>
                        <span style={{ fontSize: "1.4rem" }}>🏦</span>
                        <span style={{ fontSize: ".75rem", fontWeight: 800, color: "#1E40AF", alignSelf: "center" }}>TROY</span>
                      </div>
                    </div>
                  )}

                  {payMethod !== "pm-card" && (
                    <div className="pay-alts">
                      {[["🏦","Garanti BBVA","TR12 0006 2000..."],["🏦","İş Bankası","TR98 0006 4000..."],["🏦","Yapı Kredi","TR45 0006 7010..."]].map(([ic,t,s]) => (
                        <div key={t as string} className="pay-alt">
                          <div className="pay-alt-ic">{ic}</div>
                          <div className="pay-alt-t">{t}</div>
                          <div className="pay-alt-s">{s}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pay-secure-strip">
                    {[["🔒","SSL Şifreli"],["🛡️","3D Secure"],["↩️","Ücretsiz İptal"],["✅","Anında Onay"]].map(([ic,t]) => (
                      <div key={t as string} className="pay-sec-item"><span>{ic}</span> {t}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="nav-actions">
                <button className="btn-secondary" onClick={() => goStep(2)}>← Geri</button>
                <button className="btn-primary" onClick={() => goStep(4)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  ₺{res.toplam.toLocaleString("tr-TR")} Öde ve Rezervasyonu Tamamla
                </button>
              </div>
            </div>
          )}

          {/* ADIM 4: QR ONAY */}
          {step === 4 && (
            <div>
              <div className="card">
                <div className="success-hero">
                  <div className="success-ic">🎉</div>
                  <div className="success-title">Rezervasyonunuz Onaylandı!</div>
                  <div className="success-sub">Tesis girişinde QR kodunuzu gösterin</div>
                  <div className="success-code">MYL-2025-7842</div>
                </div>

                <div className="qr-wrap">
                  <div className="qr-box">
                    <div className="qr-inner">
                      {QR_PATTERN.map((v, i) => (
                        <div key={i} style={{ borderRadius: 1, background: v ? "var(--navy)" : "#fff" }} />
                      ))}
                    </div>
                  </div>
                  <div className="qr-label">QR kodu tesis girişinde okutun</div>
                </div>

                <div className="conf-details">
                  {[
                    ["🏖️ Tesis", res.tesis],
                    ["📅 Tarih", res.tarih],
                    ["🛏 Şezlong", res.szl],
                    ["👤 Misafir", (form.name + " " + form.surname).trim() || "Misafir"],
                    ["💰 Ödenen", "₺" + res.toplam.toLocaleString("tr-TR") + " ✓"],
                  ].map(([l, v]) => (
                    <div key={l as string} className="conf-row">
                      <span className="conf-row-l">{l}</span>
                      <span className="conf-row-v" style={l === "💰 Ödenen" ? { color: "var(--green-dk)" } : {}}>{v}</span>
                    </div>
                  ))}
                </div>

                <div className="action-btns">
                  <button className="btn-dl" onClick={() => window.print()}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Bileti İndir / Yazdır
                  </button>
                  <button className="btn-share" onClick={() => {
                    if (navigator.share) navigator.share({ title: "MyLoungers Rezervasyonum", text: "MYL-2025-7842", url: window.location.href });
                    else { navigator.clipboard?.writeText("MYL-2025-7842"); alert("Kod kopyalandı: MYL-2025-7842"); }
                  }}>📤 Paylaş</button>
                </div>

                <div style={{ padding: "0 22px 22px", display: "flex", gap: 10 }}>
                  <Link href="/" style={{ flex: 1, background: "var(--bg)", border: "1.5px solid var(--bd)", borderRadius: 11, padding: 12, fontSize: ".78rem", fontWeight: 700, color: "var(--navy)", textDecoration: "none", textAlign: "center" }}>🏠 Ana Sayfaya Dön</Link>
                  <Link href="/hotel/slug" style={{ flex: 1, background: "var(--tlt)", border: "1.5px solid #B2EBEA", borderRadius: 11, padding: 12, fontSize: ".78rem", fontWeight: 700, color: "var(--tdk)", textDecoration: "none", textAlign: "center" }}>🏖️ Tesise Git</Link>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sum-card">
            <img className="sum-img" src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&fit=crop" alt="Zuzuu" />
            <div className="sum-body">
              <div className="sum-name">{res.tesis}</div>
              <div className="sum-meta">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Yalıkavak, Bodrum · Beach Club
              </div>
              <div className="sum-rows">
                <div className="sum-row"><span className="sum-row-l">📅 Tarih</span><span className="sum-row-v">{res.tarih}</span></div>
                <div className="sum-row"><span className="sum-row-l">🛏 Şezlong</span><span className="sum-row-v">{res.szl}</span></div>
                <div className="sum-row"><span className="sum-row-l">👥 Kişi</span><span className="sum-row-v">{res.kisi} kişi</span></div>
                <div className="sum-row"><span className="sum-row-l">📆 Süre</span><span className="sum-row-v">{res.gun} gün</span></div>
              </div>
              <hr className="sum-divider" />
              <div className="sum-total">
                <span>Toplam</span>
                <span className="sum-total-v">₺{res.toplam.toLocaleString("tr-TR")}</span>
              </div>
            </div>
          </div>

          <div className="trust-strip">
            {[["🔒","SSL şifreli güvenli ödeme"],["↩️","24 saate kadar ücretsiz iptal"],["✅","Anında rezervasyon onayı"],["📱","QR ile temassız giriş"],["🎧","7/24 müşteri desteği"]].map(([ic,t]) => (
              <div key={t as string} className="trust-item"><span className="trust-ic">{ic}</span> {t}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function OdemePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#94A3B8" }}>Yükleniyor…</div>}>
      <OdemeContent />
    </Suspense>
  );
}
