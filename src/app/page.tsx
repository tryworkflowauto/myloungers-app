"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=600&fit=crop",
    title: "Hayalindeki Plajı Rezerve Et",
    desc: "Türkiye'nin en güzel plaj ve otel tesislerinde şezlong rezervasyonu yapın",
  },
  {
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&h=600&fit=crop",
    title: "Hızlı, Güvenli, Temassız",
    desc: "QR kod ile anında giriş. Rezervasyonunuz sizi bekliyor.",
  },
  {
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1920&h=600&fit=crop",
    title: "Plaj Keyfinin Tadını Çıkarın",
    desc: "Kuyruk yok, bekleme yok. Direkt şezlongunuza geçin.",
  },
];

const kategoriler = [
  { slug: "hotel", name: "Hotel", sub: "Otel plajlarında günlük rezervasyon", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop", badge: "Popüler" as const },
  { slug: "beach", name: "Beach Club", sub: "Bağımsız plaj ve beach club", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop", badge: "Yeni" as const },
  { slug: "aqua", name: "Aqua Park", sub: "Aquapark ve havuz tesisleri", image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=400&fit=crop", badge: "Popüler" as const },
];

const tesisler = [
  { id: "zuzuu", name: "Zuzuu Beach Hotel", location: "Yalıkavak / Bodrum", price: 450, rating: 4.8, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop", tags: ["Wi-Fi", "Bar", "Havuz"] },
  { id: "marmaris-aqua", name: "Marmaris Aqua Resort", location: "Marmaris", price: 320, rating: 4.7, image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop", tags: ["Wi-Fi", "Havuz", "Aquapark"] },
  { id: "paradise", name: "Fethiye Paradise Beach", location: "Fethiye", price: 280, rating: 4.8, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop", tags: ["Bar", "Şezlong", "Restoran"] },
  { id: "blue-bay", name: "Bodrum Blue Bay Hotel", location: "Bodrum", price: 395, rating: 4.7, image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop", tags: ["Wi-Fi", "Bar", "Havuz"] },
];

const yorumlar = [
  { dest: "Bodrum · Zuzuu Beach Hotel", text: "Bodrum tatilimizde şezlong için saatlerce beklemek zorunda kalmadık. Uygulama üzerinden rezervasyon yaptık, QR kod ile direkt giriş. Harika!", author: "Ayşe Y.", loc: "İstanbul · Doğrulanmış" },
  { dest: "Marmaris · Aqua Resort", text: "QR kod girişi muhteşem! Kasa yok, kuyruk yok. Plaja geldik, telefonu uzattık, şezlongumuz hazırdı. Kesinlikle tavsiye ederim.", author: "Mehmet K.", loc: "Ankara · Doğrulanmış" },
  { dest: "Fethiye · Paradise Beach", text: "Denize en yakın şezlongu seçebildim. Uygulama çok kullanışlı, rezervasyon 2 dakikada tamamlandı.", author: "Zeynep D.", loc: "İzmir · Doğrulanmış" },
];

const langs = [
  { code: "TR", flag: "🇹🇷", name: "Türkçe" },
  { code: "EN", flag: "🇬🇧", name: "English" },
];

export default function Home() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState(langs[0]);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-[300] border-b border-gray-200 bg-white/97 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-5 px-4 sm:px-7">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-teal md:text-2xl">
            <span>🪑☀️</span> MyLoungers
          </Link>
          <div className="hidden flex-1 justify-center gap-1 md:flex">
            <Link href="/kategori/hotel" className="rounded-full border-2 border-transparent px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-teal hover:bg-teal-light hover:text-navy">
              Hotel
            </Link>
            <Link href="/kategori/beach" className="rounded-full border-2 border-transparent px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-teal hover:bg-teal-light hover:text-navy">
              Beach Club
            </Link>
            <Link href="/kategori/aqua" className="rounded-full border-2 border-transparent px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-teal hover:bg-teal-light hover:text-navy">
              Aqua Park
            </Link>
            <Link href="/b2b/basvuru" className="rounded-full border-2 border-transparent px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-teal hover:bg-teal-light hover:text-navy">
              Başvuru Formu
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 rounded-full border-2 border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50"
              >
                <span>{lang.flag}</span>
                <span className="hidden sm:inline">{lang.code}</span>
                <svg className={`h-3 w-3 transition-transform ${langOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 min-w-[160px] overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-1 shadow-xl">
                  {langs.map((l) => (
                    <button key={l.code} onClick={() => { setLang(l); setLangOpen(false); }} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${lang.code === l.code ? "bg-teal-light text-navy font-bold" : "text-gray-600 hover:bg-gray-50"}`}>
                      <span>{l.flag}</span>
                      <span className="flex-1">{l.name}</span>
                      {lang.code === l.code && <span className="text-teal">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link href="/giris" className="rounded-full border-2 border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-400">
              Giriş Yap
            </Link>
            <Link href="/uye-ol" className="rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy/90">
              Üye Ol
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SLIDER - 3 slide carousel */}
      <section className="relative overflow-hidden bg-gray-900">
        <div className="relative h-[400px] w-full sm:h-[500px] md:h-[600px]">
          {heroSlides.map((slide, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-500 ${i === slideIndex ? "z-10 opacity-100" : "z-0 opacity-0"}`}>
              <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={i === 0} sizes="100vw" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">{slide.title}</h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">{slide.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setSlideIndex((s) => (s === 0 ? 2 : s - 1))} className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-2xl text-white transition-colors hover:bg-black/60">‹</button>
        <button onClick={() => setSlideIndex((s) => (s === 2 ? 0 : s + 1))} className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-2xl text-white transition-colors hover:bg-black/60">›</button>
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {[0, 1, 2].map((i) => (
            <button key={i} onClick={() => setSlideIndex(i)} className={`h-2 rounded-full transition-all ${i === slideIndex ? "w-6 bg-white" : "w-2 bg-white/40"}`} />
          ))}
        </div>
      </section>

      {/* 3. ARAMA BARI - Sticky */}
      <div className="sticky top-[72px] z-[200] border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-7">
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-gray-200 p-3 shadow-lg sm:flex-row sm:items-stretch">
            <div className="flex flex-1 flex-col justify-center border-r border-gray-200 p-3 transition-colors hover:bg-teal-light/50">
              <label className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-navy">Bölge</label>
              <input type="text" placeholder="Bodrum, Antalya, Marmaris..." className="text-sm font-medium text-gray-500 placeholder-gray-400 focus:outline-none" />
            </div>
            <div className="flex flex-1 flex-col justify-center border-r border-gray-200 p-3 transition-colors hover:bg-teal-light/50">
              <label className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-navy">Tesis Tipi</label>
              <select className="text-sm font-medium text-gray-500 focus:outline-none">
                <option>Hotel, Beach Club, Aqua Park</option>
              </select>
            </div>
            <div className="flex flex-1 flex-col justify-center border-r border-gray-200 p-3 transition-colors hover:bg-teal-light/50">
              <label className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-navy">Tarih</label>
              <input type="date" className="text-sm font-medium text-gray-500 focus:outline-none" />
            </div>
            <div className="flex flex-1 flex-col justify-center border-r border-gray-200 p-3 transition-colors hover:bg-teal-light/50">
              <label className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-navy">Tesis Adı</label>
              <input type="text" placeholder="Örn: Zuzuu Beach" className="text-sm font-medium text-gray-500 placeholder-gray-400 focus:outline-none" />
            </div>
            <div className="flex gap-2 sm:flex-col sm:gap-0">
              <button className="flex flex-1 items-center justify-center gap-2 bg-teal px-6 py-4 font-bold text-white transition-colors hover:bg-teal-dark">Tesis Ara</button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-gray-200 px-4 py-3 font-bold text-gray-700 transition-colors hover:border-gray-400">Filtrele</button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. İSTATİSTİKLER */}
      <div className="bg-navy">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-6 overflow-x-auto px-4 py-4 sm:px-7">
          <div className="flex flex-col"><span className="text-xl font-black text-white">100+</span><span className="text-xs text-white/50">Aktif Tesis</span></div>
          <div className="h-6 w-px bg-white/20" />
          <div className="flex flex-col"><span className="text-xl font-black text-white">50K+</span><span className="text-xs text-white/50">Rezervasyon</span></div>
          <div className="h-6 w-px bg-white/20" />
          <div className="flex flex-col"><span className="text-xl font-black text-white">15</span><span className="text-xs text-white/50">Destinasyon</span></div>
          <div className="h-6 w-px bg-white/20" />
          <div className="flex flex-col"><span className="text-xl font-black text-white">4.9★</span><span className="text-xs text-white/50">Ortalama Puan</span></div>
          <div className="h-6 w-px bg-white/20" />
          <div className="flex flex-col"><span className="text-xl font-black text-white">QR</span><span className="text-xs text-white/50">Temassız Giriş</span></div>
        </div>
      </div>

      {/* 5. KATEGORİLER - Resimli kartlar, Popüler/Yeni badge */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-7">
        <h2 className="mb-8 text-xl font-extrabold tracking-tight text-gray-900">Kategoriler</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {kategoriler.map((kat) => (
            <Link key={kat.slug} href={`/kategori/${kat.slug}`} className="group relative aspect-[3/2] overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-2xl">
              <Image src={kat.image} alt={kat.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent" />
              <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-extrabold text-white ${kat.badge === "Popüler" ? "bg-teal" : "bg-coral"}`}>{kat.badge}</span>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-extrabold">{kat.name}</h3>
                <p className="text-sm text-white/70">{kat.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. EN ÇOK TERCİH EDİLENLER */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-7">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">En Çok Tercih Edilenler</h2>
          <Link href="/arama" className="text-sm font-bold text-teal hover:underline">Tümünü gör →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tesisler.map((t) => (
            <Link key={t.id} href={`/tesis/${t.id}`} className="group">
              <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
                <Image src={t.image} alt={t.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="25vw" />
                <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">★ {t.rating}</span>
                <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">Günlük</span>
              </div>
              <h3 className="mt-2 font-bold text-gray-900">{t.name}</h3>
              <p className="text-sm text-gray-500">{t.location}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {t.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">{tag}</span>
                ))}
              </div>
              <p className="mt-2"><strong className="text-base font-extrabold text-navy">{t.price}₺</strong><span className="text-sm text-gray-500"> / gün</span></p>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. ŞEZLONG PLANI TANITIM */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-4 md:flex-row md:items-center md:gap-12 sm:px-7">
          <div className="flex-1">
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal before:h-0.5 before:w-4 before:bg-teal">Özellik</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">Tam istediğin şezlongu harita üzerinden seç</h2>
            <p className="mt-4 text-gray-600">
              Rezervasyon öncesi tesis şezlong planını incele. Silver, Gold ve Platinum kategoriler arasından denize yakınlığına göre şezlongunu seç. Renk kodlu harita ile konumunu önceden belirle.
            </p>
            <ul className="mt-6 space-y-3">
              {["Renk kodlu kategoriler (Silver, Gold, Platinum)", "Denize mesafe bilgisi", "Gerçek zamanlı doluluk"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-teal-light text-[10px] font-bold text-teal-dark">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl border-2 border-gray-200 shadow-xl">
            <div className="border-b border-gray-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">Zuzuu Beach Hotel</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">Şezlong Planı</span>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-1 bg-gray-100 p-3">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className={`flex aspect-square items-center justify-center rounded text-[10px] font-bold ${i % 3 === 0 ? "bg-teal/20 text-teal-dark border border-teal/40" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                  {i % 3 === 0 ? "S" : "G"}
                </div>
              ))}
            </div>
            <div className="flex gap-4 border-t border-gray-200 bg-white p-3">
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-teal/30 border border-teal"></div><span className="text-xs text-gray-600">Silver</span></div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-amber-100 border border-amber-300"></div><span className="text-xs text-gray-600">Gold</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. NASIL ÇALIŞIR - Koyu arka plan */}
      <section className="relative overflow-hidden py-20" style={{ background: "linear-gradient(160deg, #070F1E 0%, #0B1929 55%, #0B1F3A 100%)" }}>
        <div className="absolute -right-24 -top-36 h-[500px] w-[500px] rounded-full bg-teal/10 opacity-30" />
        <div className="absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-coral/5 opacity-20" />
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-7">
          <h2 className="text-center text-2xl font-extrabold text-white sm:text-3xl">Nasıl <span className="text-teal">Çalışır?</span></h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-white/50">3 adımda şezlong rezervasyonu — hızlı, güvenli, temassız</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:border-teal/40 hover:shadow-xl">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal/20 text-2xl font-black text-teal">1</span>
              <h3 className="text-lg font-bold text-white">Tesis Seç</h3>
              <p className="mt-2 text-sm text-white/50">Bölge ve tarihe göre arama yapın</p>
              <ul className="mt-4 space-y-2">
                {["100+ plaj ve otel", "Haritadan konum seç", "Fiyat karşılaştır"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/70"><span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal"></span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-coral/20 bg-coral/5 p-8 transition-all hover:border-coral/40 hover:shadow-xl">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-coral/20 text-2xl font-black text-coral">2</span>
              <h3 className="text-lg font-bold text-white">Şezlong Seç</h3>
              <p className="mt-2 text-sm text-white/50">Harita üzerinden tam konumunu seçin</p>
              <ul className="mt-4 space-y-2">
                {["Silver, Gold, Platinum", "Denize yakınlık gör", "QR rezervasyon"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/70"><span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-coral"></span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:border-teal/40 hover:shadow-xl">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal/20 text-2xl font-black text-teal">3</span>
              <h3 className="text-lg font-bold text-white">Öde & Uzan</h3>
              <p className="mt-2 text-sm text-white/50">Güvenli ödeme, QR ile giriş</p>
              <ul className="mt-4 space-y-2">
                {["iyzico ile ödeme", "Anında onay", "QR temassız giriş"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/70"><span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal"></span>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 9. TESİS SAHİPLERİ / B2B */}
      <section className="border-t border-gray-200 bg-gray-50 py-16">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-12 px-4 md:flex-row md:items-start md:gap-16 sm:px-7">
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Tesisinizi MyLoungers&apos;a ekleyin</h2>
            <p className="mt-3 text-gray-600">Plaj veya otel tesisinizi platforma ekleyin. Rezervasyonlarınızı tek yerden yönetin, doluluk oranınızı artırın.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/b2b/basvuru" className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-3 font-bold text-white transition-colors hover:bg-navy/90">Başvuru Formu →</Link>
              <Link href="/b2b/demo" className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-5 py-3 font-bold text-gray-700 transition-colors hover:border-gray-400">Demo İzle</Link>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3">
            {[
              { icon: "📈", title: "Doluluk Oranını Artır", desc: "Sezon boyunca %90+ doluluk hedefleyin, her şezlong gelir getirsin." },
              { icon: "💳", title: "Online Ödeme & Raporlama", desc: "iyzico altyapısıyla tahsilatlar otomatik, raporlar anlık." },
              { icon: "🌟", title: "Ücretsiz Tesis Sayfası", desc: "Fotoğraf, harita, şezlong planı — tesisiniz 10 dakikada yayında." },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 rounded-xl border-2 border-gray-200 bg-white p-4 transition-colors hover:border-teal">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-light text-lg">{f.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-900">{f.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. KULLANICI YORUMLARI */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-7">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Kullanıcılarımız Ne Diyor?</h2>
          <Link href="/yorumlar" className="text-sm font-bold text-teal hover:underline">Tüm yorumlar →</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {yorumlar.map((y, i) => (
            <div key={i} className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm">
              <p className="mb-2 text-xs font-bold text-teal">{y.dest}</p>
              <div className="mb-3 text-amber-500">★★★★★</div>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">{y.text}</p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-light text-xs font-bold text-teal-dark">
                  {y.author.split(" ").map((n) => n[0]).join("").replace(".", "").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{y.author}</p>
                  <p className="text-xs text-gray-500">{y.loc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-navy px-4 py-12 sm:px-7">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-8 border-b border-white/10 pb-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white">
                <span>🪑☀️</span> MyLoungers
              </Link>
              <p className="mt-3 max-w-[240px] text-sm text-white/40">Türkiye&apos;nin plaj ve otel şezlong rezervasyon platformu. Hayalindeki plajı rezerve et.</p>
              <div className="mt-4 flex gap-2">
                <a href="#" className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-xs font-bold text-white/70 transition-colors hover:border-white/40 hover:text-white">🍎 App Store</a>
                <a href="#" className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-xs font-bold text-white/70 transition-colors hover:border-white/40 hover:text-white">🤖 Google Play</a>
              </div>
            </div>
            <div>
              <h5 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-white/40">Platform</h5>
              <ul className="space-y-2">
                <li><Link href="/arama" className="text-sm text-white/50 hover:text-white">Tesis Ara</Link></li>
                <li><Link href="/kategoriler" className="text-sm text-white/50 hover:text-white">Kategoriler</Link></li>
                <li><Link href="/nasil-calisir" className="text-sm text-white/50 hover:text-white">Nasıl Çalışır</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-white/40">Kurumsal</h5>
              <ul className="space-y-2">
                <li><Link href="/hakkimizda" className="text-sm text-white/50 hover:text-white">Hakkımızda</Link></li>
                <li><Link href="/iletisim" className="text-sm text-white/50 hover:text-white">İletişim</Link></li>
                <li><Link href="/b2b" className="text-sm text-white/50 hover:text-white">Tesis Sahipleri</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-white/40">Destek / KVKK</h5>
              <ul className="space-y-2">
                <li><Link href="/gizlilik" className="text-sm text-white/50 hover:text-white">Gizlilik Politikası</Link></li>
                <li><Link href="/kvkk" className="text-sm text-white/50 hover:text-white">KVKK</Link></li>
                <li><Link href="/yardim" className="text-sm text-white/50 hover:text-white">Yardım</Link></li>
              </ul>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-white/30">© {new Date().getFullYear()} MyLoungers. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
