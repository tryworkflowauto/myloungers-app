"use client";

import Link from "next/link";
import { useState } from "react";
import "./basvuru.css";

const CITIES = ["Bodrum", "Marmaris", "Fethiye", "Antalya", "İzmir", "Diğer"];
const PRICE_RANGES = ["₺100-200", "₺200-400", "₺400-700", "₺700+"];
const SEZON_OPTS = ["Yaz (Haz-Eyl)", "Tüm Yıl", "Diğer"];
const FEATURES = ["Restoran/Kafe", "Ücretsiz Otopark", "Su Sporları", "VIP Alan", "Çocuk Havuzu", "Konaklama"];
const GOREV_OPTS = ["İşletme Sahibi", "Müdür", "Pazarlama", "Diğer"];
const SAAT_OPTS = ["Sabah 09-12", "Öğleden sonra 12-17", "Akşam 17-20", "Fark etmez"];

export default function BasvuruPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 1
  const [isletmeAdi, setIsletmeAdi] = useState("");
  const [sehir, setSehir] = useState("");
  const [tesisTipi, setTesisTipi] = useState("beach");
  const [kapasite, setKapasite] = useState(50);

  // Step 2
  const [fiyatAraligi, setFiyatAraligi] = useState("");
  const [sezon, setSezon] = useState("");
  const [ozellikler, setOzellikler] = useState<Record<string, boolean>>({});
  const [ekNotlar, setEkNotlar] = useState("");

  // Step 3
  const [adSoyad, setAdSoyad] = useState("");
  const [gorev, setGorev] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [iletisimTercihi, setIletisimTercihi] = useState("phone");
  const [uygunSaat, setUygunSaat] = useState("");
  const [gizlilikKabul, setGizlilikKabul] = useState(false);

  const goStep = (n: number) => {
    if (n === 2) {
      if (!isletmeAdi.trim()) {
        alert("Lütfen işletme adını girin.");
        return;
      }
      if (!sehir) {
        alert("Lütfen şehir seçin.");
        return;
      }
    }
    setCurrentStep(n);
  };

  const toggleOzellik = (key: string) => {
    setOzellikler((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSubmit = () => {
    if (!telefon.trim()) {
      alert("Lütfen telefon numaranızı girin.");
      return;
    }
    if (!gizlilikKabul) {
      alert("Lütfen Gizlilik Politikası'nı kabul edin.");
      return;
    }
    setSubmitted(true);
  };

  const progressPct = currentStep === 1 ? 33.3 : currentStep === 2 ? 66.6 : 100;

  return (
    <div className="basvuru-page">
      {/* NAV */}
      <nav className="bav-nav">
        <div className="bav-nav-in">
          <Link href="/" className="bav-logo">
            <img src="/logo.png" alt="MyLoungers" />
          </Link>
          <Link href="/" className="bav-back">← Ana Sayfa</Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="bav-hero">
        <span className="bav-hero-tag">✦ PARTNER PROGRAMI</span>
        <h1 className="bav-hero-ttl">Tesisinizi MyLoungers&apos;a <span>Ekleyin</span></h1>
        <p className="bav-hero-desc">Bodrum&apos;un en büyük dijital rezervasyon platformunda yerinizi alın. Kurulum ücretsiz, ilk ay komisyon yok.</p>
        <div className="bav-hero-stats">
          <div className="bav-hstat"><span className="bav-hstat-n">500+</span><span className="bav-hstat-l">Aktif Kullanıcı</span></div>
          <div className="bav-hstat"><span className="bav-hstat-n">₺0</span><span className="bav-hstat-l">Kurulum Ücreti</span></div>
          <div className="bav-hstat"><span className="bav-hstat-n">24s</span><span className="bav-hstat-l">Onay Süresi</span></div>
        </div>
      </div>

      {/* MAIN */}
      <div className="bav-main">
        {/* SOL */}
        <div className="bav-left">
          <h2 className="bav-why-ttl">Neden MyLoungers?</h2>
          <div className="bav-feat-list">
            <div className="bav-feat">
              <div className="bav-feat-icon">📊</div>
              <div>
                <div className="bav-feat-title">Daha Fazla Rezervasyon</div>
                <div className="bav-feat-desc">Günlük yüzlerce kullanıcıya ulaşın, doluluk oranınızı artırın.</div>
              </div>
            </div>
            <div className="bav-feat">
              <div className="bav-feat-icon">💳</div>
              <div>
                <div className="bav-feat-title">Kolay Ödeme</div>
                <div className="bav-feat-desc">Anlık rezervasyon bildirimleri ve otomatik ödeme takibi.</div>
              </div>
            </div>
            <div className="bav-feat">
              <div className="bav-feat-icon">📱</div>
              <div>
                <div className="bav-feat-title">Mobil Yönetim</div>
                <div className="bav-feat-desc">Tüm rezervasyonlarınızı telefonunuzdan yönetin.</div>
              </div>
            </div>
            <div className="bav-feat">
              <div className="bav-feat-icon">🎯</div>
              <div>
                <div className="bav-feat-title">Ücretsiz Başlangıç</div>
                <div className="bav-feat-desc">İlk ay tamamen ücretsiz, komisyon yok.</div>
              </div>
            </div>
          </div>
          <div className="bav-ref-card">
            <div className="bav-ref-stars">★★★★★</div>
            <p className="bav-ref-text">MyLoungers sayesinde rezervasyonlarımız %40 arttı. Kurulum çok kolaydı.</p>
            <div className="bav-ref-auth">
              <div className="bav-ref-av">MK</div>
              <div>
                <div className="bav-ref-name">Mehmet K.</div>
                <div className="bav-ref-role">Zuzuu Beach Hotel, Bodrum</div>
              </div>
            </div>
          </div>
          <div className="bav-trust-bar">
            <span>🔒 SSL Güvenli</span>
            <span>✓ Ücretsiz Kurulum</span>
            <span>⚡ 24s Onay</span>
          </div>
        </div>

        {/* SAĞ - FORM */}
        <div className="bav-form-card">
          {!submitted ? (
            <>
              <div className="bav-steps">
                <div className={`bav-step ${currentStep === 1 ? "active" : ""} ${currentStep > 1 ? "done" : ""}`}>
                  <div className="bav-step-num">{currentStep > 1 ? "✓" : "1"}</div>
                  <div className="bav-step-lbl">Tesis Bilgileri</div>
                </div>
                <div className={`bav-step ${currentStep === 2 ? "active" : ""} ${currentStep > 2 ? "done" : ""}`}>
                  <div className="bav-step-num">{currentStep > 2 ? "✓" : "2"}</div>
                  <div className="bav-step-lbl">Detaylar</div>
                </div>
                <div className={`bav-step ${currentStep === 3 ? "active" : ""}`}>
                  <div className="bav-step-num">3</div>
                  <div className="bav-step-lbl">İletişim</div>
                </div>
              </div>
              <div className="bav-prog-wrap">
                <div className="bav-prog-bar" style={{ width: `${progressPct}%` }} />
              </div>

              <div className="bav-form-body">
                {currentStep === 1 && (
                  <div className="bav-pane">
                    <h3 className="bav-form-ttl">Tesisinizi Tanıtalım</h3>
                    <p className="bav-form-sub">Temel bilgilerle başlayalım.</p>
                    <div className="bav-fgrp">
                      <label>İşletme Adı *</label>
                      <input type="text" className="bav-finp" placeholder="örn. Zuzuu Beach Hotel" value={isletmeAdi} onChange={(e) => setIsletmeAdi(e.target.value)} />
                    </div>
                    <div className="bav-fgrp">
                      <label>Şehir *</label>
                      <select className="bav-fsel" value={sehir} onChange={(e) => setSehir(e.target.value)}>
                        <option value="">Seçiniz</option>
                        {CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="bav-fgrp">
                      <label>Tesis Tipi</label>
                      <div className="bav-type-pills">
                        <button type="button" className={`bav-type-pill ${tesisTipi === "beach" ? "sel" : ""}`} onClick={() => setTesisTipi("beach")}>🏖️ Beach Club</button>
                        <button type="button" className={`bav-type-pill ${tesisTipi === "hotel" ? "sel" : ""}`} onClick={() => setTesisTipi("hotel")}>🏨 Otel</button>
                        <button type="button" className={`bav-type-pill ${tesisTipi === "aqua" ? "sel" : ""}`} onClick={() => setTesisTipi("aqua")}>💦 Aqua Park</button>
                      </div>
                    </div>
                    <div className="bav-fgrp">
                      <label>Şezlong Kapasitesi: <span className="bav-cap-val">{kapasite}</span> adet</label>
                      <div className="bav-cap-wrap">
                        <input type="range" min={10} max={200} value={kapasite} step={5} onChange={(e) => setKapasite(Number(e.target.value))} className="bav-cap-slider" />
                      </div>
                    </div>
                    <div className="bav-form-nav">
                      <div />
                      <button type="button" className="bav-btn-next" onClick={() => goStep(2)}>İleri →</button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="bav-pane">
                    <h3 className="bav-form-ttl">Tesis Detayları</h3>
                    <div className="bav-fgrp">
                      <label>Fiyat Aralığı</label>
                      <select className="bav-fsel" value={fiyatAraligi} onChange={(e) => setFiyatAraligi(e.target.value)}>
                        <option value="">Seçiniz</option>
                        {PRICE_RANGES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="bav-fgrp">
                      <label>Sezon</label>
                      <select className="bav-fsel" value={sezon} onChange={(e) => setSezon(e.target.value)}>
                        <option value="">Seçiniz</option>
                        {SEZON_OPTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="bav-fgrp">
                      <label>Özellikler</label>
                      <div className="bav-check-list">
                        {FEATURES.map((f) => (
                          <label key={f} className="bav-check-item">
                            <input type="checkbox" checked={ozellikler[f] || false} onChange={() => toggleOzellik(f)} />
                            {f}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="bav-fgrp">
                      <label>Ek Notlar</label>
                      <textarea className="bav-ftxt" placeholder="Tesisiniz hakkında eklemek istediğiniz..." value={ekNotlar} onChange={(e) => setEkNotlar(e.target.value)} rows={3} />
                    </div>
                    <div className="bav-form-nav">
                      <button type="button" className="bav-btn-prev" onClick={() => goStep(1)}>← Geri</button>
                      <button type="button" className="bav-btn-next" onClick={() => goStep(3)}>İleri →</button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="bav-pane">
                    <h3 className="bav-form-ttl">İletişim Bilgileri</h3>
                    <div className="bav-fgrp">
                      <label>Ad Soyad *</label>
                      <input type="text" className="bav-finp" placeholder="Ad Soyad" value={adSoyad} onChange={(e) => setAdSoyad(e.target.value)} />
                    </div>
                    <div className="bav-fgrp">
                      <label>Görev</label>
                      <select className="bav-fsel" value={gorev} onChange={(e) => setGorev(e.target.value)}>
                        <option value="">Seçiniz</option>
                        {GOREV_OPTS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="bav-fgrp">
                      <label>Telefon *</label>
                      <input type="tel" className="bav-finp" placeholder="+90 5XX XXX XX XX" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
                    </div>
                    <div className="bav-fgrp">
                      <label>E-posta</label>
                      <input type="email" className="bav-finp" placeholder="ornek@isletme.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="bav-fgrp">
                      <label>İletişim tercihi</label>
                      <div className="bav-type-pills">
                        <button type="button" className={`bav-type-pill ${iletisimTercihi === "phone" ? "sel" : ""}`} onClick={() => setIletisimTercihi("phone")}>📞 Telefon</button>
                        <button type="button" className={`bav-type-pill ${iletisimTercihi === "whatsapp" ? "sel" : ""}`} onClick={() => setIletisimTercihi("whatsapp")}>💬 WhatsApp</button>
                        <button type="button" className={`bav-type-pill ${iletisimTercihi === "email" ? "sel" : ""}`} onClick={() => setIletisimTercihi("email")}>📧 E-posta</button>
                      </div>
                    </div>
                    <div className="bav-fgrp">
                      <label>En Uygun Saat</label>
                      <select className="bav-fsel" value={uygunSaat} onChange={(e) => setUygunSaat(e.target.value)}>
                        <option value="">Seçiniz</option>
                        {SAAT_OPTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="bav-fgrp">
                      <label className="bav-check-item">
                        <input type="checkbox" checked={gizlilikKabul} onChange={(e) => setGizlilikKabul(e.target.checked)} />
                        <span>Gizlilik Politikası kabul *</span>
                      </label>
                    </div>
                    <div className="bav-form-nav" style={{ flexDirection: "column", gap: 10, alignItems: "stretch" }}>
                      <button type="button" className="bav-btn-submit" onClick={handleSubmit}>🚀 Başvurumu Tamamla</button>
                      <button type="button" className="bav-btn-prev" style={{ justifyContent: "center" }} onClick={() => goStep(2)}>← Geri</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bav-success">
              <div className="bav-success-icon">🎉</div>
              <h3>Başvurunuz Alındı!</h3>
              <p>En geç 24 saat içinde ekibimiz sizi arayacak.</p>
              <Link href="/" className="bav-btn-home">Ana Sayfaya Dön</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
