import type { ReactNode } from "react";
import Link from "next/link";
import "@/app/myloungers.css";

const TEAL = "#0ABAB5";

type LegalPageLayoutProps = {
  title: string;
  children: ReactNode;
};

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div style={{ maxWidth: "768px", margin: "0 auto", padding: "0 24px" }} className="flex h-16 items-center justify-between md:h-[64px]">
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

      {/* MAIN - INLINE STYLE ile mutlak ortalanmış */}
      <main 
        style={{ maxWidth: "768px", margin: "0 auto", padding: "32px 24px" }}
      >
        <h1 className="mb-10 text-center text-lg font-bold text-gray-900 dark:text-white md:text-xl">
          {title}
        </h1>
        <div className="[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-[#0ABAB5] [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-800 dark:[&_h3]:text-gray-200 [&_li]:my-1 [&_ol]:my-3 [&_ol]:text-[14px] [&_ol]:leading-7 [&_p]:mb-4 [&_p]:text-[14px] [&_p]:leading-7 [&_p]:text-gray-700 dark:[&_p]:text-gray-300 [&_strong]:font-semibold [&_strong]:text-gray-900 dark:[&_strong]:text-white [&_ul]:my-3 [&_ul]:text-[14px] [&_ul]:leading-7">
          {children}
        </div>
      </main>

      <footer>
        <div className="ft">
          <div>
            <img src="/logo.png" alt="MyLoungers" className="fl-logo" />
            <p className="fd" id="footer-desc">
              Türkiye&apos;nin şezlong rezervasyon platformu.
            </p>
            <div className="fa">
              <a href="#" className="fapp">
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on the App Store"
                  style={{ width: 140, height: 42 }}
                />
              </a>
              <a href="#" className="fapp">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Google Play&apos;den edinin"
                  style={{ width: 140, height: 42 }}
                />
              </a>
            </div>
          </div>
          <div className="fcol">
            <h5 id="ft-p">Platform</h5>
            <ul>
              <li>
                <a href="/arama" id="ft-p1">
                  Tesisleri Keşfet
                </a>
              </li>
              <li>
                <a href="/nasil-calisir" id="ft-p3">
                  Nasıl Çalışır?
                </a>
              </li>
              <li>
                <a href="/profil" id="ft-p4">
                  Rezervasyon Takibi
                </a>
              </li>
              <li>
                <a href="/sss" id="ft-p2">
                  SSS
                </a>
              </li>
            </ul>
          </div>
          <div className="fcol">
            <h5 id="ft-c">Kurumsal</h5>
            <ul>
              <li>
                <a href="/basvuru" id="ft-c1">
                  Tesis Başvurusu
                </a>
              </li>
              <li>
                <a href="/hakkimizda" id="ft-c2">
                  Hakkımızda
                </a>
              </li>
              <li>
                <a href="/iletisim" id="ft-c3">
                  İletişim
                </a>
              </li>
            </ul>
          </div>
          <div className="fcol">
            <h5 id="ft-s">Destek</h5>
            <ul>
              <li>
                <a href="/kvkk" id="ft-s1">
                  KVKK Metni
                </a>
              </li>
              <li>
                <a href="/gizlilik" id="ft-s2">
                  Gizlilik
                </a>
              </li>
              <li>
                <a href="/iptal-iade" id="ft-s3">
                  İptal &amp; İade
                </a>
              </li>
              <li>
                <a href="/kullanim-kosullari" id="ft-s4">
                  Kullanım Koşulları
                </a>
              </li>
              <li>
                <a href="/cerez-politikasi" id="ft-s5">
                  Çerez Politikası
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="fb">
          <span id="ft-copy">© 2025 MyLoungers · Reklamotv</span>
        </div>
      </footer>    </div>
  );
}
