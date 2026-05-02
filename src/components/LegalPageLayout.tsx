import type { ReactNode } from "react";
import Link from "next/link";

const TEAL = "#0ABAB5";

type LegalPageLayoutProps = {
  title: string;
  children: ReactNode;
};

/**
 * Yasal metin sayfaları için ortak çerçeve.
 * Not: Projede paylaşımlı Header/Footer bileşeni yok; üst/alt bölümler burada marka ile hizalanır.
 */
export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 md:h-[64px] md:px-8">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="MyLoungers" className="h-9 w-auto" />
          </Link>
          <nav>
            <Link
              href="/"
              className="text-sm font-bold hover:opacity-90"
              style={{ color: TEAL }}
            >
              Ana Sayfa
            </Link>
          </nav>
        </div>
      </header>

      <main className="w-full flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
          <h1
            className="mb-8 text-center text-3xl font-bold md:text-4xl"
            style={{ color: TEAL }}
          >
            {title}
          </h1>
          <div className="text-base leading-relaxed text-gray-700 dark:text-gray-300 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#0ABAB5] [&_ol]:my-4 [&_ol]:list-inside [&_ol]:list-decimal [&_ol]:space-y-2 [&_p]:mb-4 [&_ul]:my-4 [&_ul]:list-inside [&_ul]:list-disc [&_ul]:space-y-2">
            {children}
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-4xl gap-8 px-4 py-10 md:grid-cols-2 md:px-8 lg:grid-cols-4">
          <div>
            <img src="/logo.png" alt="MyLoungers" className="mb-3 h-8 w-auto" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Türkiye&apos;nin şezlong rezervasyon platformu.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="#" className="inline-block">
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on the App Store"
                  className="h-[42px] w-[140px]"
                />
              </a>
              <a href="#" className="inline-block">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Google Play üzerinden edinin"
                  className="h-[42px] w-[140px]"
                />
              </a>
            </div>
          </div>
          <div>
            <h5 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Platform</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/arama" className="text-gray-600 hover:underline dark:text-gray-400">
                  Tesisleri Keşfet
                </Link>
              </li>
              <li>
                <Link href="/nasil-calisir" className="text-gray-600 hover:underline dark:text-gray-400">
                  Nasıl Çalışır?
                </Link>
              </li>
              <li>
                <Link href="/profil" className="text-gray-600 hover:underline dark:text-gray-400">
                  Rezervasyon Takibi
                </Link>
              </li>
              <li>
                <Link href="/sss" className="text-gray-600 hover:underline dark:text-gray-400">
                  SSS
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Kurumsal</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/basvuru" className="text-gray-600 hover:underline dark:text-gray-400">
                  Tesis Başvurusu
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="text-gray-600 hover:underline dark:text-gray-400">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-gray-600 hover:underline dark:text-gray-400">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Destek</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/kvkk" className="text-gray-600 hover:underline dark:text-gray-400">
                  KVKK Metni
                </Link>
              </li>
              <li>
                <Link href="/gizlilik" className="text-gray-600 hover:underline dark:text-gray-400">
                  Gizlilik
                </Link>
              </li>
              <li>
                <Link href="/iptal-iade" className="text-gray-600 hover:underline dark:text-gray-400">
                  İptal &amp; İade
                </Link>
              </li>
              <li>
                <Link href="/kullanim-kosullari" className="text-gray-600 hover:underline dark:text-gray-400">
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link href="/cerez-politikasi" className="text-gray-600 hover:underline dark:text-gray-400">
                  Çerez Politikası
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 px-4 py-4 text-center text-xs text-gray-500 dark:border-slate-800 dark:text-gray-500">
          <span>© 2025 MyLoungers · Reklamotv</span>
        </div>
      </footer>
    </div>
  );
}
