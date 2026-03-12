'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { section: 'ANA MENÜ' },
  { icon: '📊', label: 'Dashboard', href: '/isletme' },
  { icon: '🏖️', label: 'Şezlong Haritası', href: '/isletme/sezlong' },
  { icon: '📋', label: 'Rezervasyonlar', href: '/isletme/rezervasyonlar', badge: 12 },
  { icon: '🍽️', label: 'Siparişler', href: '/isletme/siparisler', badge: 5 },
  { section: 'YÖNETİM' },
  { icon: '🍹', label: 'Menü Yönetimi', href: '/isletme/menu' },
  { icon: '👥', label: 'Personel', href: '/isletme/personel' },
  { icon: '💰', label: 'Bakiye & Raporlar', href: '/isletme/raporlar' },
  { icon: '📅', label: 'Sezon & Fiyatlar', href: '/isletme/sezon' },
  { section: 'TESİS' },
  { icon: '🏨', label: 'Tesis Bilgileri', href: '/isletme/tesis' },
  { icon: '⭐', label: 'Yorumlar', href: '/isletme/yorumlar', badge: 3 },
];

export default function IsletmeSidebar() {
  const pathname = usePathname();
  return (
    <aside style={{ width: '240px', background: '#0A1628', minHeight: '100vh', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', zIndex: 100 }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/MyLoungers_Logo-02.png" width={100} height={60} style={{ borderRadius: '10px', objectFit: 'contain' }} alt="MyLoungers" />
          <div>
            <span style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#fff' }}>MY LOUNGERS</span>
            <span style={{ display: 'block', fontSize: '10px', color: '#0ABAB5' }}>İşletme Paneli</span>
          </div>
        </div>
      </div>
      {/* Tesis Seçici */}
      <div style={{ margin: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></div>
        <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600, flex: 1 }}>Zuzuu Beach Hotel</span>
        <span style={{ color: '#94A3B8', fontSize: '12px' }}>▾</span>
      </div>
      {/* Nav */}
      <nav style={{ padding: '8px 0', flex: 1 }}>
        {menuItems.map((item, i) => {
          if ('section' in item) return (
            <div key={i} style={{ padding: '16px 16px 6px', fontSize: '9px', fontWeight: 700, color: '#94A3B8', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{item.section}</div>
          );
          const isActive = pathname === item.href;
          return (
            <Link key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', cursor: 'pointer', textDecoration: 'none', position: 'relative', background: isActive ? 'rgba(10,186,181,0.15)' : 'transparent', borderLeft: isActive ? '3px solid #0ABAB5' : '3px solid transparent' }}>
              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '15px', background: isActive ? 'rgba(10,186,181,0.2)' : 'transparent' }}>{item.icon}</div>
              <span style={{ fontSize: '13px', color: isActive ? '#0ABAB5' : '#CBD5E1', fontWeight: isActive ? 600 : 500, flex: 1 }}>{item.label}</span>
              {'badge' in item && item.badge && <span style={{ background: '#F5821F', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>{item.badge}</span>}
            </Link>
          );
        })}
      </nav>
      {/* Alt kullanıcı */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg,#0ABAB5,#F5821F)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'white' }}>ZB</div>
          <div>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'white' }}>Zafer Bakır</span>
            <span style={{ display: 'block', fontSize: '10px', color: '#94A3B8' }}>İşletme Yöneticisi</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
