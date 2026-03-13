"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

type DashboardStats = {
  todayReservations: number;
  totalRevenue: number;
  occupancy: number;
};

export default function IsletmePaneliPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/giris");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchStats() {
      if (!session?.user) return;

      try {
        setLoading(true);
        setError(null);

        const email = session.user.email?.toLowerCase();
        if (!email) {
          setError("Oturum bilgisinde e-posta bulunamadı.");
          setLoading(false);
          return;
        }

        const { data: userRow, error: userErr } = await supabase
          .from("kullanicilar")
          .select("id, rol")
          .eq("email", email)
          .maybeSingle();

        if (userErr) {
          console.error("İşletme paneli kullanıcı rol sorgu hatası:", userErr);
          setError("Kullanıcı bilgileri okunamadı.");
          setLoading(false);
          return;
        }

        if (!userRow) {
          setError("Kullanıcı kaydı bulunamadı.");
          setLoading(false);
          return;
        }

        const rolRaw = ((userRow as any).rol as string | null)?.toLowerCase() ?? "";
        const isIsletme = rolRaw === "işletme" || rolRaw === "isletme";

        if (!isIsletme) {
          setError("Bu sayfaya sadece işletme hesapları erişebilir.");
          setLoading(false);
          return;
        }

        const userId = (userRow as any).id;

        // 1) İlgili tesisleri bul (önce sahip_id ile dene)
        // Not: Bazı şemalarda 'sahip_id' kolonu olmayabilir; bu durumda sessizce fallback'e geçiyoruz.
        let tesisIds: number[] = [];

        try {
          const { data: tesisByOwner, error: tesisErr } = await supabase
            .from("tesisler")
            .select("id")
            .eq("sahip_id", userId);

          if (!tesisErr && tesisByOwner && tesisByOwner.length > 0) {
            tesisIds = tesisByOwner.map((t: any) => Number(t.id));
          }
          // Eğer hata varsa (ör. 'sahip_id' kolonu yoksa), loglamadan devam ediyoruz.
        } catch (e) {
          // Beklenmedik bir JS hatası olursa da, sadece fallback kullan.
          console.warn(
            "İşletme paneli tesis sorgusu sırasında beklenmeyen hata; fallback olarak kullanici_id ile devam edilecek.",
            e
          );
        }

        // Eğer sahip_id ile tesis bulunamazsa, fallback: rezervasyonları kullanici_id = işletme ile çek.
        const useTesisFilter = tesisIds.length > 0;

        // 2) Rezervasyonları çek
        let rezData: any[] | null = null;
        if (useTesisFilter) {
          const { data, error } = await supabase
            .from("rezervasyonlar")
            .select("id, tesis_id, baslangic_tarih, bitis_tarih, toplam_tutar, durum")
            .in("tesis_id", tesisIds);
          if (error) {
            console.error("İşletme paneli rezervasyon sorgu hatası (tesis_id):", error);
            setError("Rezervasyon verileri alınamadı.");
            setLoading(false);
            return;
          }
          rezData = data ?? [];
        } else {
          const { data, error } = await supabase
            .from("rezervasyonlar")
            .select("id, tesis_id, baslangic_tarih, bitis_tarih, toplam_tutar, durum")
            .eq("kullanici_id", userId);
          if (error) {
            console.error("İşletme paneli rezervasyon sorgu hatası (kullanici_id):", error);
            setError("Rezervasyon verileri alınamadı.");
            setLoading(false);
            return;
          }
          rezData = data ?? [];
        }

        const todayIso = new Date().toISOString().slice(0, 10);

        const allRez = rezData || [];
        const todayList = allRez.filter((r) => {
          const start = r.baslangic_tarih as string | null;
          const end = (r.bitis_tarih as string | null) || start;
          if (!start) return false;
          return start <= todayIso && end >= todayIso;
        });

        const activeToday = todayList.filter((r) => {
          const d = (r.durum as string | null)?.toLowerCase() ?? "";
          return !d.includes("iptal") && d !== "cancel" && d !== "cancelled";
        });

        const todayReservations = todayList.length;
        const totalRevenue = allRez.reduce(
          (sum, r) => sum + (Number(r.toplam_tutar) || 0),
          0
        );
        const occupancy =
          allRez.length > 0
            ? Math.round((activeToday.length / allRez.length) * 100)
            : 0;

        setStats({
          todayReservations,
          totalRevenue,
          occupancy,
        });
        setLoading(false);
      } catch (e) {
        console.error("İşletme paneli genel hata:", e);
        setError("Beklenmeyen bir hata oluştu.");
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchStats();
    }
  }, [session, status]);

  if (status === "loading" || loading && !stats && !error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: "#0A1628",
        }}
      >
        İşletme paneli yükleniyor…
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: "#0A1628",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 10px 40px rgba(15,23,42,0.16)",
            border: "1px solid #E5E7EB",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>🚫</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
            Yetkisiz Erişim
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 14 }}>
            {error}
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "8px 18px",
              borderRadius: 999,
              background: "#0ABAB5",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const safeStats: DashboardStats = stats || {
    todayReservations: 0,
    totalRevenue: 0,
    occupancy: 0,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        color: "#0F172A",
        display: "flex",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Sol Menü */}
      <aside
        style={{
          width: 220,
          background: "#020617",
          color: "#E5E7EB",
          padding: "16px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
            textDecoration: "none",
            color: "#F9FAFB",
          }}
        >
          <img
            src="/logo.png"
            alt="MyLoungers"
            style={{ height: 28, width: "auto" }}
          />
        </Link>
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "#6B7280",
            padding: "0 4px",
          }}
        >
          İşletme Paneli
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { href: "/isletme-paneli", label: "Dashboard", icon: "📊", active: true },
            { href: "/isletme/tesis", label: "Tesislerim", icon: "🏨" },
            { href: "/isletme/rezervasyonlar", label: "Rezervasyonlar", icon: "📅" },
            { href: "/isletme/sezlong", label: "Şezlonglar", icon: "⛱️" },
            { href: "/isletme/raporlar", label: "Gelir Raporu", icon: "💰" },
            { href: "/isletme/ayarlar", label: "Ayarlar", icon: "⚙️" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: item.active ? 700 : 500,
                textDecoration: "none",
                background: item.active ? "#0ABAB5" : "transparent",
                color: item.active ? "#020617" : "#E5E7EB",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <span style={{ width: 18, textAlign: "center" }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* İçerik */}
      <main
        style={{
          flex: 1,
          background: "radial-gradient(circle at top left,#0B1120,#020617 60%)",
          padding: 20,
          color: "#F9FAFB",
        }}
      >
        {/* Üst bar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#6B7280",
                marginBottom: 4,
              }}
            >
              Bugünkü Durum
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#F9FAFB" }}>
              Dashboard
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "#E5E7EB",
            }}
          >
            <span>
              {(session?.user as any)?.name || session?.user?.email || "İşletme"}
            </span>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "999px",
                background:
                  "radial-gradient(circle at 10% 0%,#0ABAB5,#22C55E 60%,#FACC15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {(
                (session?.user as any)?.name ||
                session?.user?.email ||
                "İ"
              )
                .toString()
                .trim()
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </header>

        {/* Özet kartlar */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg,rgba(56,189,248,0.16),rgba(37,99,235,0.08))",
              borderRadius: 18,
              padding: 16,
              border: "1px solid rgba(148,163,184,0.25)",
              boxShadow: "0 14px 45px rgba(15,23,42,0.40)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#A5B4FC",
                marginBottom: 6,
              }}
            >
              Bugünkü Rezervasyon
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 800 }}>
                {safeStats.todayReservations}
              </span>
              <span style={{ fontSize: 12, color: "#E5E7EB" }}>adet</span>
            </div>
          </div>

          <div
            style={{
              background:
                "linear-gradient(135deg,rgba(34,197,94,0.22),rgba(22,163,74,0.10))",
              borderRadius: 18,
              padding: 16,
              border: "1px solid rgba(52,211,153,0.32)",
              boxShadow: "0 14px 45px rgba(15,23,42,0.40)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#BBF7D0",
                marginBottom: 6,
              }}
            >
              Toplam Gelir
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 26, fontWeight: 800 }}>
                ₺
                {safeStats.totalRevenue.toLocaleString("tr-TR")}
              </span>
            </div>
          </div>

          <div
            style={{
              background:
                "linear-gradient(135deg,rgba(251,191,36,0.18),rgba(248,250,252,0.04))",
              borderRadius: 18,
              padding: 16,
              border: "1px solid rgba(250,204,21,0.3)",
              boxShadow: "0 14px 45px rgba(15,23,42,0.40)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#FACC15",
                marginBottom: 6,
              }}
            >
              Doluluk Oranı
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 26, fontWeight: 800 }}>
                {safeStats.occupancy}%
              </span>
              <div
                style={{
                  flex: 1,
                  height: 7,
                  borderRadius: 999,
                  background: "rgba(15,23,42,0.7)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, safeStats.occupancy)
                    )}%`,
                    height: "100%",
                    borderRadius: 999,
                    background:
                      "linear-gradient(90deg,#F97316,#FACC15,#22C55E)",
                    transition: "width 0.4s ease-out",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Placeholder içerik */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,2fr) minmax(0,1.4fr)",
            gap: 16,
          }}
        >
          <div
            style={{
              background: "rgba(15,23,42,0.96)",
              borderRadius: 18,
              padding: 16,
              border: "1px solid rgba(148,163,184,0.35)",
              minHeight: 160,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#E5E7EB" }}>
                Bugünkü Rezervasyon Akışı
              </h2>
              <span style={{ fontSize: 11, color: "#6B7280" }}>
                Supabase · canlı veri
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>
              Detaylı işletme raporları için sol menüden{" "}
              <strong>Rezervasyonlar</strong> ve <strong>Gelir Raporu</strong>{" "}
              sayfalarına geçebilirsiniz.
            </p>
          </div>

          <div
            style={{
              background: "rgba(15,23,42,0.96)",
              borderRadius: 18,
              padding: 16,
              border: "1px solid rgba(148,163,184,0.35)",
              minHeight: 160,
            }}
          >
            <h2
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#E5E7EB",
                marginBottom: 8,
              }}
            >
              Hızlı Kısayollar
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Link
                href="/isletme/tesis"
                style={{
                  padding: "7px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.6)",
                  fontSize: 12,
                  color: "#E5E7EB",
                  textDecoration: "none",
                }}
              >
                🏨 Tesis Ekle / Düzenle
              </Link>
              <Link
                href="/isletme/sezlong"
                style={{
                  padding: "7px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.6)",
                  fontSize: 12,
                  color: "#E5E7EB",
                  textDecoration: "none",
                }}
              >
                ⛱️ Şezlong Planı
              </Link>
              <Link
                href="/isletme/raporlar"
                style={{
                  padding: "7px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.6)",
                  fontSize: 12,
                  color: "#E5E7EB",
                  textDecoration: "none",
                }}
              >
                💰 Gelir Raporu
              </Link>
              <Link
                href="/isletme/ayarlar"
                style={{
                  padding: "7px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.6)",
                  fontSize: 12,
                  color: "#E5E7EB",
                  textDecoration: "none",
                }}
              >
                ⚙️ İşletme Ayarları
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

