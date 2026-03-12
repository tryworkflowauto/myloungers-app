"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAVY = "#0A1628";
const TEAL = "#0ABAB5";
const GRAY400 = "#94A3B8";

const MENU_SECTIONS = [
  {
    title: "Ana Menü",
    items: [
      { label: "Dashboard", href: "/isletme", icon: "📊", badge: null },
      { label: "Şezlong Haritası", href: "/isletme/sezlong-haritasi", icon: "🏖️", badge: null },
      { label: "Rezervasyonlar", href: "/isletme/rezervasyonlar", icon: "📋", badge: 12 },
      { label: "Siparişler", href: "/isletme/siparisler", icon: "🍽️", badge: 5 },
    ],
  },
  {
    title: "Yönetim",
    items: [
      { label: "Menü Yönetimi", href: "/isletme/menu-yonetimi", icon: "🍹", badge: null },
      { label: "Personel", href: "/isletme/personel", icon: "👥", badge: null },
      { label: "Bakiye & Raporlar", href: "/isletme/bakiye-raporlar", icon: "💰", badge: null },
      { label: "Sezon & Fiyatlar", href: "/isletme/sezon-fiyatlar", icon: "📅", badge: null },
    ],
  },
  {
    title: "Tesis",
    items: [
      { label: "Tesis Bilgileri", href: "/isletme/tesis-bilgileri", icon: "🏨", badge: null },
      { label: "Yorumlar", href: "/isletme/yorumlar", icon: "⭐", badge: 3 },
    ],
  },
];

export default function IsletmeSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen flex-shrink-0 flex flex-col border-r border-[#E5E7EB] bg-white">
      <div className="p-5 border-b border-[#E5E7EB]">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="MyLoungers" className="h-10 w-auto" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {MENU_SECTIONS.map((section) => (
          <div key={section.title} className="mb-2">
            <div
              className="px-4 pt-4 pb-1.5"
              style={{ fontSize: 9, fontWeight: 700, color: GRAY400, letterSpacing: "1.5px", textTransform: "uppercase" }}
            >
              {section.title}
            </div>
            <ul className="space-y-0">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/isletme"
                    ? pathname === "/isletme"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2.5 px-4 py-2.5 relative transition-colors"
                      style={{
                        background: isActive ? NAVY : undefined,
                        borderLeft: isActive ? `3px solid ${TEAL}` : "3px solid transparent",
                        color: isActive ? "white" : NAVY,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "rgba(10,186,181,0.08)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "";
                        }
                      }}
                    >
                      <span className="text-[15px]">{item.icon}</span>
                      <span className="text-[13px] font-medium flex-1">{item.label}</span>
                      {item.badge != null && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-[10px]"
                          style={{ background: TEAL, color: "white" }}
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

      <div className="p-4 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${TEAL}, #F5821F)` }}
          >
            ZB
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-[#1E293B] truncate">Zafer Bakır</div>
            <div className="text-[10px] text-[#94A3B8] truncate">İşletme Yöneticisi</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
