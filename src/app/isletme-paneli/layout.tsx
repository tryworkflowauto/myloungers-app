"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function IsletmePaneliLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Kullanıcı");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return;
      let { data: k } = await supabase
        .from("kullanicilar")
        .select("ad, soyad, email")
        .eq("id", user.id)
        .maybeSingle();
      if (!k && user.email) {
        const r = await supabase
          .from("kullanicilar")
          .select("ad, soyad, email")
          .eq("email", user.email)
          .maybeSingle();
        k = r.data;
      }
      const name =
        k?.ad && k?.soyad
          ? `${k.ad} ${k.soyad}`
          : k?.ad || k?.email || user.email || "Kullanıcı";
      if (!cancelled) setUserName(name);
    }
    load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F1F5F9",
      }}
    >
      <aside
        style={{
          width: "240px",
          background: "#0A1628",
          minHeight: "100vh",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          overflowY: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <Image
              src="/MyLoungers_Logo-02.png"
              alt="My Loungers"
              width={80}
              height={26}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </div>
        <div
          style={{
            margin: "12px 16px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              background: "#10B981",
              borderRadius: "50%",
            }}
          />
          <span
            style={{
              fontSize: "12px",
              color: "#fff",
              fontWeight: 600,
              flex: 1,
            }}
          >
            Zuzuu Beach Hotel
          </span>
          <span style={{ color: "#94A3B8", fontSize: "12px" }}>▾</span>
        </div>
        <nav
          style={{
            padding: "8px 0",
            flex: 1,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "16px 16px 6px",
              fontSize: "9px",
              fontWeight: 700,
              color: "#94A3B8",
              letterSpacing: "1.5px",
              textTransform: "uppercase" as const,
            }}
          >
            Ana Menü
          </div>
          {[
            {
              href: "/isletme-paneli",
              icon: "📊",
              label: "Dashboard",
            },
            {
              href: "/isletme-paneli/sezlong-haritasi",
              icon: "🏖️",
              label: "Şezlong Haritası",
            },
            {
              href: "/isletme-paneli/rezervasyonlar",
              icon: "📋",
              label: "Rezervasyonlar",
              badge: 12,
            },
            {
              href: "/isletme-paneli/siparisler",
              icon: "🍽️",
              label: "Siparişler",
              badge: 5,
            },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 16px",
                  textDecoration: "none",
                  background: isActive
                    ? "rgba(10,186,181,0.15)"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid #0ABAB5"
                    : "3px solid transparent",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    fontSize: "15px",
                    background: isActive
                      ? "rgba(10,186,181,0.2)"
                      : "transparent",
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    color: isActive ? "#0ABAB5" : "#CBD5E1",
                    fontWeight: isActive ? 600 : 500,
                    flex: 1,
                  }}
                >
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    style={{
                      background: "#F5821F",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "10px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div
            style={{
              padding: "16px 16px 6px",
              fontSize: "9px",
              fontWeight: 700,
              color: "#94A3B8",
              letterSpacing: "1.5px",
              textTransform: "uppercase" as const,
            }}
          >
            Yönetim
          </div>
          {[
            {
              href: "/isletme-paneli/menu",
              icon: "🍹",
              label: "Menü Yönetimi",
            },
            {
              href: "/isletme-paneli/personel",
              icon: "👥",
              label: "Personel",
            },
            {
              href: "/isletme-paneli/raporlar",
              icon: "💰",
              label: "Bakiye & Raporlar",
            },
            {
              href: "/isletme-paneli/sezon",
              icon: "📅",
              label: "Sezon & Fiyatlar",
            },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 16px",
                  textDecoration: "none",
                  background: isActive
                    ? "rgba(10,186,181,0.15)"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid #0ABAB5"
                    : "3px solid transparent",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    fontSize: "15px",
                    background: isActive
                      ? "rgba(10,186,181,0.2)"
                      : "transparent",
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    color: isActive ? "#0ABAB5" : "#CBD5E1",
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          <div
            style={{
              padding: "16px 16px 6px",
              fontSize: "9px",
              fontWeight: 700,
              color: "#94A3B8",
              letterSpacing: "1.5px",
              textTransform: "uppercase" as const,
            }}
          >
            Tesis
          </div>
          {[
            {
              href: "/isletme-paneli/tesis",
              icon: "🏨",
              label: "Tesis Bilgileri",
            },
            {
              href: "/isletme-paneli/yorumlar",
              icon: "⭐",
              label: "Yorumlar",
              badge: 3,
            },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 16px",
                  textDecoration: "none",
                  background: isActive
                    ? "rgba(10,186,181,0.15)"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid #0ABAB5"
                    : "3px solid transparent",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    fontSize: "15px",
                    background: isActive
                      ? "rgba(10,186,181,0.2)"
                      : "transparent",
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    color: isActive ? "#0ABAB5" : "#CBD5E1",
                    fontWeight: isActive ? 600 : 500,
                    flex: 1,
                  }}
                >
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    style={{
                      background: "#F5821F",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "10px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                background: "linear-gradient(135deg,#0ABAB5,#F5821F)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "white",
              }}
            >
              {userInitials}
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "white",
                }}
              >
                {userName}
              </span>
              <span
                style={{ display: "block", fontSize: "10px", color: "#94A3B8" }}
              >
                İşletme Yöneticisi
              </span>
            </div>
          </div>
        </div>
      </aside>
      <main style={{ marginLeft: "240px", flex: 1 }}>{children}</main>
    </div>
  );
}

