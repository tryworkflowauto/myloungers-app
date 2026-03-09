import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Myloungers | Plaj ve Otel Şezlong Rezervasyonu",
  description:
    "Türkiye'deki beach ve otel tesislerinde şezlong rezervasyonu yapın. Hayalindeki plajı Myloungers ile rezerve et.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        {children}
      </body>
    </html>
  );
}
