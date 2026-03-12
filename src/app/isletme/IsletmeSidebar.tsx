"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAVY = "#0A1628";
const TEAL = "#0ABAB5";
const ORANGE = "#F5821F";
const GREEN = "#10B981";

const MENU_SECTIONS = [
  {
    title: "ANA MENÜ",
    items: [
      { label: "Dashboard", href: "/isletme", icon: "📊", badge: null },
      { label: "Şezlong Haritası", href: "/isletme/sezlong-haritasi", icon: "🏖️", badge: null },
      { label: "Rezervasyonlar", href: "/isletme/rezervasyonlar", icon: "📋", badge: 12 },
      { label: "Siparişler", href: "/isletme/siparisler", icon: "🍽️", badge: 5 },
    ],
  },
  {
    title: "YÖNETİM",
    items: [
      { label: "Menü Yönetimi", href: "/isletme/menu-yonetimi", icon: "🍹", badge: null },
      { label: "Personel", href: "/isletme/personel", icon: "👥", badge: null },
      { label: "Bakiye & Raporlar", href: "/isletme/bakiye-raporlar", icon: "💰", badge: null },
      { label: "Sezon & Fiyatlar", href: "/isletme/sezon-fiyatlar", icon: "📅", badge: null },
    ],
  },
  {
    title: "TESİS",
    items: [
      { label: "Tesis Bilgileri", href: "/isletme/tesis-bilgileri", icon: "🏨", badge: null },
      { label: "Yorumlar", href: "/isletme/yorumlar", icon: "⭐", badge: 3 },
    ],
  },
];

export default function IsletmeSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-[100] flex flex-col min-h-screen"
      style={{ width: 260, background: NAVY }}
    >
      {/* Logo bölümü */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: TEAL }}
          >
            🏖️
          </div>
          <div>
            <div className="text-[13px] font-extrabold text-white leading-tight uppercase">MY LOUNGERS</div>
            <div className="text-[10px] leading-tight" style={{ color: TEAL }}>İşletme Paneli</div>
          </div>
        </div>
      </div>

      {/* Tesis seçici */}
      <div
        className="mx-4 mt-3 flex items-center gap-2 px-3 py-2.5 rounded-[10px] cursor-pointer"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: GREEN }} />
        <span className="text-[12px] font-semibold text-white flex-1">Zuzuu Beach Hotel</span>
        <span className="text-white/80 text-sm flex-shrink-0">▾</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {MENU_SECTIONS.map((section) => (
          <div key={section.title} className="mb-1">
            <div
              style={{
                paddingTop: 16,
                paddingBottom: 6,
                paddingLeft: 16,
                fontSize: 9,
                fontWeight: 700,
                color: "#6B7280",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              {section.title}
            </div>
            <ul>
              {section.items.map((item) => {
                const isActive =
                  item.href === "/isletme"
                    ? pathname === "/isletme"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2.5 relative"
                      style={{
                        padding: "10px 16px",
                        minHeight: 42,
                        background: isActive ? "rgba(10,186,181,0.15)" : undefined,
                        borderLeft: isActive ? `3px solid ${TEAL}` : "3px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "";
                        }
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ fontSize: 16 }}
                        style={{
                          background: isActive ? "rgba(10,186,181,0.2)" : "transparent",
                        }}
                      >
                        {item.icon}
                      </div>
                      <span
                        className="font-medium flex-1"
                        style={{ fontSize: 13 }}
                        style={{ color: isActive ? TEAL : "#D1D5DB" }}
                      >
                        {item.label}
                      </span>
                      {item.badge != null && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-[10px] flex-shrink-0"
                          style={{ background: "#F5821F", color: "white" }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Alt kullanıcı bölümü */}
      <div
        className="p-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${TEAL}, ${ORANGE})` }}
          >
            ZB
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-white truncate">Zafer Bakır</div>
            <div className="text-[10px] truncate" style={{ color: "#6B7280" }}>İşletme Yöneticisi</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
