import Image from "next/image";
import Link from "next/link";

const tesisler = [
  {
    id: "zuzuu",
    name: "Zuzuu Beach Hotel",
    location: "Bodrum, Muğla",
    price: 500,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
    type: "hotel",
  },
  {
    id: "paradise",
    name: "Paradise Beach Club",
    location: "Marmaris, Muğla",
    price: 350,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
    type: "beach",
  },
  {
    id: "aqua-resort",
    name: "Aqua Park Resort",
    location: "Antalya",
    price: 450,
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop",
    type: "aqua",
  },
  {
    id: "sunset",
    name: "Sunset Beach Hotel",
    location: "Fethiye, Muğla",
    price: 600,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop",
    type: "hotel",
  },
];

const kategoriler = [
  {
    slug: "otel-plajlari",
    name: "Otel Plajları",
    sub: "Otel plajlarında günlük rezervasyon",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop",
    badge: "turquoise",
  },
  {
    slug: "plaj-tesisleri",
    name: "Plaj Tesisleri",
    sub: "Bağımsız plaj ve beach club",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    badge: "coral",
  },
  {
    slug: "aquapark",
    name: "Aquapark",
    sub: "Aquapark ve havuz tesisleri",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=400&fit=crop",
    badge: "turquoise",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/97 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-7">
          <div className="flex h-16 items-center justify-between gap-5 md:h-[72px]">
            <Link href="/" className="text-2xl font-bold text-turquoise">
              Myloungers
            </Link>
            <div className="hidden flex-1 justify-center gap-1 md:flex">
              <Link
                href="/kategori/otel-plajlari"
                className="flex items-center gap-2 rounded-full border-2 border-transparent px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-turquoise hover:bg-turquoise/10 hover:text-navy"
              >
                <span className="text-base">🏨</span> Hotel
              </Link>
              <Link
                href="/kategori/plaj-tesisleri"
                className="flex items-center gap-2 rounded-full border-2 border-transparent px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-turquoise hover:bg-turquoise/10 hover:text-navy"
              >
                <span className="text-base">🏖️</span> Beach Club
              </Link>
              <Link
                href="/kategori/aquapark"
                className="flex items-center gap-2 rounded-full border-2 border-transparent px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-turquoise hover:bg-turquoise/10 hover:text-navy"
              >
                <span className="text-base">💦</span> Aqua Park
              </Link>
              <Link
                href="/b2b/basvuru"
                className="flex items-center gap-2 rounded-full border-2 border-transparent px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-turquoise hover:bg-turquoise/10 hover:text-navy"
              >
                Başvuru Formu
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/giris"
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-400"
              >
                Giriş Yap
              </Link>
              <Link
                href="/uye-ol"
                className="rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy/90"
              >
                Üye Ol
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - Gradient Turkuaz/Mavi */}
      <section className="relative min-h-[520px] overflow-hidden bg-gradient-to-br from-[#0369A1] via-turquoise to-[#0EA5E9]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative mx-auto flex min-h-[520px] max-w-[1400px] flex-col items-center justify-center px-4 py-24 text-center sm:px-7">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Hayalindeki Plajı{" "}
            <span className="text-turquoise-light">Rezerve Et</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Türkiye&apos;nin en güzel plaj ve otel tesislerinde şezlong rezervasyonu yapın
          </p>
        </div>
      </section>

      {/* Search Box */}
      <div className="z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-7">
          <div className="flex flex-col gap-4 rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-lg sm:flex-row sm:items-stretch">
            <div className="flex flex-1 flex-col justify-center rounded-lg border-r border-gray-200 p-3 transition-colors hover:bg-turquoise/5 sm:p-4">
              <label className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-navy">Bölge</label>
              <input
                type="text"
                placeholder="Bodrum, Antalya, Marmaris..."
                className="text-sm font-medium text-gray-500 placeholder-gray-400 focus:outline-none"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center rounded-lg border-r border-gray-200 p-3 transition-colors hover:bg-turquoise/5 sm:p-4">
              <label className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-navy">Tarih</label>
              <input
                type="date"
                className="text-sm font-medium text-gray-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center rounded-lg border-r border-gray-200 p-3 transition-colors hover:bg-turquoise/5 sm:p-4">
              <label className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-navy">Kişi</label>
              <input
                type="number"
                min="1"
                placeholder="2"
                className="text-sm font-medium text-gray-500 placeholder-gray-400 focus:outline-none"
              />
            </div>
            <button className="flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-turquoise px-6 py-4 font-bold text-white transition-colors hover:bg-[#089490]">
              Ara
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar - Dark Navy */}
      <div className="bg-navy">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-6 overflow-x-auto px-4 py-4 sm:px-7">
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white">500+</span>
            <span className="text-xs text-white/50">Tesis</span>
          </div>
          <div className="h-6 w-px flex-shrink-0 bg-white/20" />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white">50K+</span>
            <span className="text-xs text-white/50">Mutlu Misafir</span>
          </div>
          <div className="h-6 w-px flex-shrink-0 bg-white/20" />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white">12</span>
            <span className="text-xs text-white/50">Şehir</span>
          </div>
        </div>
      </div>

      {/* Kategoriler - Resimli, Renkli Kartlar */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-7">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Kategoriler</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {kategoriler.map((kat) => (
            <Link
              key={kat.slug}
              href={`/kategori/${kat.slug}`}
              className="group relative aspect-[3/2] cursor-pointer overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              <Image
                src={kat.image}
                alt={kat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent"
                style={{ backgroundImage: "linear-gradient(to top, rgba(10,22,40,.88) 0%, rgba(0,0,0,.04) 55%)" }}
              />
              <span
                className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-extrabold text-white ${
                  kat.badge === "coral" ? "bg-coral" : "bg-turquoise"
                }`}
              >
                {kat.badge === "coral" ? "Beach" : "Hotel"}
              </span>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-extrabold">{kat.name}</h3>
                <p className="text-sm text-white/70">{kat.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Öne Çıkan Tesisler - Resimli, Fiyatlı Kartlar */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-7">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">En Çok Tercih Edilenler</h2>
          <Link href="/arama" className="text-sm font-bold text-turquoise hover:underline">
            Tümünü gör →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tesisler.map((tesis) => (
            <Link
              key={tesis.id}
              href={`/tesis/${tesis.id}`}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
                <Image
                  src={tesis.image}
                  alt={tesis.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  ★ 4.8
                </span>
                <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  Günlük
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold text-gray-900">{tesis.name}</h3>
              <p className="text-sm text-gray-500">{tesis.location}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                  Şezlong
                </span>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                  Şemsiye
                </span>
              </div>
              <p className="mt-2">
                <strong className="text-base font-extrabold text-navy">{tesis.price}₺</strong>
                <span className="text-sm text-gray-500"> / gün</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* B2B Section - Koyu Arka Plan */}
      <section
        className="relative overflow-hidden py-20"
        style={{
          background: "linear-gradient(160deg, #070F1E 0%, #0A1628 55%, #0B1F3A 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-36 h-[500px] w-[500px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(14,165,233,.15) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(255,107,107,.1) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-7">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Tesisinizi <span className="text-turquoise">Ekleyin</span>
            </h2>
            <p className="mt-4 text-base text-white/60">
              3 adımda şezlong rezervasyonu — hızlı, güvenli, temassız. Plaj veya otel
              tesisinizi Myloungers&apos;a ekleyin, rezervasyonlarınızı tek platformdan yönetin.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/b2b/basvuru"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-turquoise px-8 py-4 font-bold text-white shadow-lg shadow-turquoise/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-turquoise/40"
              >
                Başvuru Yap
              </Link>
              <Link
                href="/b2b"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 bg-white/5 px-6 py-4 font-bold text-white transition-colors hover:bg-white/10"
              >
                Daha Fazla Bilgi
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/30">Ücretsiz üyelik · Kredi kartı gerekmez</p>
          </div>
        </div>
      </section>

      {/* Footer - Koyu */}
      <footer className="bg-navy px-4 py-12 sm:px-7">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-8 border-b border-white/10 pb-6 md:flex-row md:justify-between">
            <div>
              <Link href="/" className="text-2xl font-bold text-white">
                Myloungers
              </Link>
              <p className="mt-3 max-w-[200px] text-sm text-white/40">
                Türkiye&apos;nin plaj ve otel şezlong rezervasyon platformu
              </p>
            </div>
            <div className="flex flex-wrap gap-8">
              <div>
                <h5 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-white/40">
                  Kurumsal
                </h5>
                <ul className="space-y-2">
                  <li>
                    <Link href="/hakkimizda" className="text-sm text-white/50 hover:text-white">
                      Hakkımızda
                    </Link>
                  </li>
                  <li>
                    <Link href="/iletisim" className="text-sm text-white/50 hover:text-white">
                      İletişim
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-white/40">
                  Yasal
                </h5>
                <ul className="space-y-2">
                  <li>
                    <Link href="/gizlilik" className="text-sm text-white/50 hover:text-white">
                      Gizlilik Politikası
                    </Link>
                  </li>
                  <li>
                    <Link href="/kullanim-kosullari" className="text-sm text-white/50 hover:text-white">
                      Kullanım Koşulları
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-white/30">
            © {new Date().getFullYear()} Myloungers. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
