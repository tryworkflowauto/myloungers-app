import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular | MyLoungers",
  description: "MyLoungers rezervasyon, ödeme, iptal ve iade hakkında sıkça sorulan sorular. Hotel, beach club, tekne turu ve spa rezervasyonu.",
  alternates: { canonical: "/sss" },
  openGraph: {
    title: "Sıkça Sorulan Sorular | MyLoungers",
    description: "MyLoungers rezervasyon, ödeme, iptal ve iade hakkında sıkça sorulan sorular. Hotel, beach club, tekne turu ve spa rezervasyonu.",
    url: "/sss",
  },
};

export default function SssLayout({ children }: { children: ReactNode }) {
  return children;
}
