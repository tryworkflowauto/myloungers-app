import Link from "next/link";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/constants";

export function KesfetShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="kesfet-page">
      <nav className="kesfet-nav">
        <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <img src="/logo.png" alt="MyLoungers" className="kesfet-nav-logo" />
        </Link>
        <Link href="/" className="kesfet-nav-back">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Ana Sayfa
        </Link>
        <Link href="/kesfet" className="kesfet-nav-link">
          Keşfet
        </Link>
        <Link href="/arama" className="kesfet-nav-cta">
          Tesis Ara
        </Link>
      </nav>
      <div className="kesfet-wrap">{children}</div>
      <footer>
        <div className="ft">
          <div>
            <img src="/logo.png" alt="MyLoungers" className="fl-logo" />
            <p className="fd">Türkiye&apos;nin tatil rezervasyon platformu.</p>
            <div className="fa">
              <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="fapp">
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on the App Store"
                  style={{ width: 140, height: 42 }}
                />
              </a>
              <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" className="fapp">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Google Play'den edinin"
                  style={{ width: 140, height: 42 }}
                />
              </a>
            </div>
          </div>
          <div className="fcol">
            <h5>Platform</h5>
            <ul>
              <li>
                <a href="/kesfet">Keşfet</a>
              </li>
              <li>
                <a href="/arama">Tesisleri Keşfet</a>
              </li>
              <li>
                <a href="/nasil-calisir">Nasıl Çalışır?</a>
              </li>
              <li>
                <a href="/profil">Rezervasyon Takibi</a>
              </li>
              <li>
                <a href="/sss">SSS</a>
              </li>
            </ul>
          </div>
          <div className="fcol">
            <h5>Kurumsal</h5>
            <ul>
              <li>
                <a href="/basvuru">Tesis Başvurusu</a>
              </li>
              <li>
                <a href="/hakkimizda">Hakkımızda</a>
              </li>
              <li>
                <a href="/iletisim">İletişim</a>
              </li>
            </ul>
          </div>
          <div className="fcol">
            <h5>Destek</h5>
            <ul>
              <li>
                <a href="/kvkk">KVKK Metni</a>
              </li>
              <li>
                <a href="/gizlilik">Gizlilik</a>
              </li>
              <li>
                <a href="/iptal-iade">İptal &amp; İade</a>
              </li>
              <li>
                <a href="/kullanim-kosullari">Kullanım Koşulları</a>
              </li>
              <li>
                <a href="/cerez-politikasi">Çerez Politikası</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="fb">
          <span>© 2026 MyLoungers · Reklamotv</span>
        </div>
      </footer>
    </div>
  );
}

export function KesfetBreadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav className="kesfet-bc" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          {i > 0 ? <span aria-hidden="true"> / </span> : null}
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
