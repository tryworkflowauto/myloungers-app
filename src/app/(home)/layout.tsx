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
};

export default function HomeLayout({ children }: { children: ReactNode }) {
  return children;
}
