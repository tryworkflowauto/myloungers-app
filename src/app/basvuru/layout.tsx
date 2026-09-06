import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tesis Başvurusu | MyLoungers",
  description: "Hotel, beach club, aqua park ve diğer tesislerinizi MyLoungers partner programına ekleyin. Ücretsiz kurulum, online başvuru.",
  alternates: { canonical: "/basvuru" },
  openGraph: {
    title: "Tesis Başvurusu | MyLoungers",
    description: "Hotel, beach club, aqua park ve diğer tesislerinizi MyLoungers partner programına ekleyin. Ücretsiz kurulum, online başvuru.",
    url: "/basvuru",
  },
};

export default function BasvuruLayout({ children }: { children: ReactNode }) {
  return children;
}
