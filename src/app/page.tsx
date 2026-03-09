import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-turquoise">
              Myloungers
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/giris"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                Giriş Yap
              </Link>
              <Link
                href="/uye-ol"
                className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#e55a5a]"
              >
                Üye Ol
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-turquoise/10 via-white to-coral/10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Hayalindeki Plajı{" "}
              <span className="text-turquoise">Rezerve Et</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Türkiye&apos;nin en güzel plaj ve otel tesislerinde şezlong rezervasyonu yapın
            </p>

            {/* Search Box */}
            <div className="mx-auto mt-10 max-w-4xl">
              <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-xl shadow-gray-200/50 sm:flex-row sm:items-end sm:gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-left text-sm font-medium text-gray-700">
                    Bölge
                  </label>
                  <input
                    type="text"
                    placeholder="Bodrum, Antalya, İzmir..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-turquoise focus:outline-none focus:ring-1 focus:ring-turquoise"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-left text-sm font-medium text-gray-700">
                    Tarih
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-turquoise focus:outline-none focus:ring-1 focus:ring-turquoise"
                  />
                </div>
                <div className="w-full sm:w-36">
                  <label className="mb-1 block text-left text-sm font-medium text-gray-700">
                    Kişi Sayısı
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="2"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-turquoise focus:outline-none focus:ring-1 focus:ring-turquoise"
                  />
                </div>
                <button className="rounded-lg bg-turquoise px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0c8bc4]">
                  Ara
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
            Kategoriler
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Plaj Tesisleri */}
            <Link
              href="/kategori/plaj-tesisleri"
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-turquoise/30 hover:shadow-lg"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-turquoise/10 text-2xl group-hover:bg-turquoise/20">
                🏖️
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Plaj Tesisleri
              </h3>
              <p className="mt-2 text-gray-600">
                Bağımsız plaj tesislerinde şezlong ve şemsiye rezervasyonu
              </p>
            </Link>

            {/* Otel Plajları */}
            <Link
              href="/kategori/otel-plajlari"
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-turquoise/30 hover:shadow-lg"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-coral/10 text-2xl group-hover:bg-coral/20">
                🏨
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Otel Plajları
              </h3>
              <p className="mt-2 text-gray-600">
                Otel plajlarında günlük veya sezonluk rezervasyon fırsatları
              </p>
            </Link>

            {/* Aquapark */}
            <Link
              href="/kategori/aquapark"
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-turquoise/30 hover:shadow-lg sm:col-span-2 lg:col-span-1"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-turquoise/10 text-2xl group-hover:bg-turquoise/20">
                💦
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Aquapark</h3>
              <p className="mt-2 text-gray-600">
                Aquapark ve havuz tesislerinde şezlong rezervasyonu
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Öne Çıkan Tesisler */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
            Öne Çıkan Tesisler
          </h2>
          <Link
            href="/tesis/zuzuu-beach-hotel"
            className="group block overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl"
          >
            <div className="flex flex-col sm:flex-row">
              <div className="relative h-64 w-full bg-gradient-to-br from-turquoise/30 to-coral/30 sm:h-72 sm:flex-1" />
              <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Zuzuu Beach Hotel
                  </h3>
                  <p className="mt-2 text-gray-600">Bodrum, Muğla</p>
                  <p className="mt-4 text-lg font-semibold text-turquoise">
                    Günlük 500₺&apos;den başlayan fiyatlarla
                  </p>
                </div>
                <button className="mt-6 w-fit rounded-lg bg-turquoise px-6 py-2.5 font-medium text-white transition-colors group-hover:bg-[#0c8bc4]">
                  Rezervasyon Yap
                </button>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* B2B Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-turquoise to-[#0c8bc4] p-8 text-white sm:p-12 md:p-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Tesisinizi Ekleyin
              </h2>
              <p className="mt-4 text-lg text-white/90">
                Plaj veya otel tesisinizi Myloungers&apos;a ekleyin, rezervasyonlarınızı
                tek platformdan yönetin. İşletmecilere özel avantajlı koşullar.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/b2b/basvuru"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-turquoise transition-colors hover:bg-gray-100"
                >
                  Başvuru Yap
                </Link>
                <Link
                  href="/b2b"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-white px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Daha Fazla Bilgi
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="text-xl font-bold text-turquoise">
              Myloungers
            </Link>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <Link href="/hakkimizda" className="hover:text-turquoise">
                Hakkımızda
              </Link>
              <Link href="/iletisim" className="hover:text-turquoise">
                İletişim
              </Link>
              <Link href="/gizlilik" className="hover:text-turquoise">
                Gizlilik Politikası
              </Link>
              <Link href="/kullanim-kosullari" className="hover:text-turquoise">
                Kullanım Koşulları
              </Link>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Myloungers. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
