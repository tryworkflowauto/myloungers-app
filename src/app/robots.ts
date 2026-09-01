import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/Api/",
        "/admin",
        "/admin/*",
        "/isletme",
        "/isletme/*",
        "/isletme-paneli",
        "/isletme-paneli/*",
        "/odeme",
        "/odeme/*",
        "/profil",
        "/profil/*",
        "/auth/*",
        "/siparis/*",
        "/giris",
      ],
    },
    sitemap: "https://myloungers.com/sitemap.xml",
    host: "https://myloungers.com",
  };
}
