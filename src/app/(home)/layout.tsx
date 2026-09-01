import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MyLoungers | Bodrum Tekne Turu ve Spa Rezervasyon Platformu",
  description:
    "Bodrum'da tekne turu, spa ve masaj deneyimlerini gerçek fiyatlarla keşfedin. Güvenli ödeme ile MyLoungers'ta online rezervasyon yapın.",
  openGraph: {
    title: "MyLoungers | Bodrum Tekne Turu ve Spa Rezervasyon Platformu",
    description:
      "Bodrum'da tekne turu, spa ve masaj deneyimlerini gerçek fiyatlarla keşfedin. Güvenli ödeme ile MyLoungers'ta online rezervasyon yapın.",
  },
  alternates: { canonical: "/" },
};

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MyLoungers",
  url: "https://myloungers.com",
  logo: "https://myloungers.com/logo.png",
};

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ORGANIZATION_JSON_LD).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
