import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/components/AuthSessionProvider";

export const metadata: Metadata = {
  title: "Myloungers | Plaj ve Otel Şezlong Rezervasyonu",
  description: "Türkiye'deki beach ve otel tesislerinde şezlong rezervasyonu yapın. Hayalindeki plajı Myloungers ile rezerve et.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <style>{`
          @font-face { font-family: 'Gotham Rounded'; src: url('/fonts/GothamRnd-Light.otf') format('opentype'); font-weight: 300; font-display: swap; }
          @font-face { font-family: 'Gotham Rounded'; src: url('/fonts/GothamRnd-Book.otf') format('opentype'); font-weight: 400; font-display: swap; }
          @font-face { font-family: 'Gotham Rounded'; src: url('/fonts/GothamRnd-Medium.otf') format('opentype'); font-weight: 500; font-display: swap; }
          @font-face { font-family: 'Gotham Rounded'; src: url('/fonts/GothamRnd-Bold.otf') format('opentype'); font-weight: 700; font-display: swap; }
          @font-face { font-family: 'Gotham Rounded'; src: url('/fonts/GothamRndSSm-Medium.otf') format('opentype'); font-weight: 600; font-display: swap; }
          *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
          html { font-size: 18px; scroll-behavior: smooth; }
          body { font-family: 'Gotham Rounded', 'Inter', sans-serif; background: #fff; color: #111; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        `}</style>
      </head>
      <body>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
