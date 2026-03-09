import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

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
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
