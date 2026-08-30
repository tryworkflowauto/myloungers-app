'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  getAktifTesisId,
  getKullaniciTesisleri,
  setAktifTesisId,
  type TesisOzet,
} from '@/lib/aktifTesis';

const menuItems = [
  { section: 'ANA MENÜ' },
  { icon: '📊', label: 'Dashboard', href: '/isletme' },
  { icon: '🏖️', label: 'Yerleşim Haritası', href: '/isletme/sezlong' },
  { icon: '📋', label: 'Rezervasyonlar', href: '/isletme/rezervasyonlar' },
  { icon: '🍽️', label: 'Siparişler', href: '/isletme/siparisler' },
  { section: 'YÖNETİM' },
  { icon: '🍹', label: 'Menü Yönetimi', href: '/isletme/menu' },
  { icon: '👥', label: 'Personel', href: '/isletme/personel' },
  { icon: '💰', label: 'Bakiye & Raporlar', href: '/isletme/raporlar' },
  { icon: '📅', label: 'Sezon & Fiyatlar', href: '/isletme/sezon' },
  { section: 'TESİS' },
  { icon: '🏨', label: 'Tesis Bilgileri', href: '/isletme/tesis' },
  { icon: '⭐', label: 'Yorumlar', href: '/isletme/yorumlar' },
];

export default function IsletmeSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [tesisAdi, setTesisAdi] = useState<string | null>(null);
  const [tesisListesi, setTesisListesi] = useState<TesisOzet[]>([]);
  const [aktifTesisId, setAktifTesisIdState] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [rezBekleyenCount, setRezBekleyenCount] = useState(0);
  const [siparisYeniCount, setSiparisYeniCount] = useState(0);
  const [bekleyenYorumSayisi, setBekleyenYorumSayisi] = useState(0);
  const [tesisDropdownOpen, setTesisDropdownOpen] = useState(false);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [cikisModal,    setCikisModal]    = useState(false);
  const [toast,         setToast]         = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tesisDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUserAndTesis() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user || cancelled) {
        setTesisAdi(null);
        setUserName(null);
        setBekleyenYorumSayisi(0);
        return;
      }

      const userId = authData.user.id;

      const { data: kullanici, error: kullaniciError } = await supabase
        .from('kullanicilar')
        .select('tesis_id, rol, ad, soyad')
        .eq('id', userId)
        .maybeSingle();

      if (kullaniciError || !kullanici || cancelled) {
        setTesisAdi(null);
        setUserName(authData.user.email ?? authData.user.user_metadata?.name ?? null);
        setRezBekleyenCount(0);
        setSiparisYeniCount(0);
        setBekleyenYorumSayisi(0);
        return;
      }

      const fullName =
        (kullanici.ad && kullanici.soyad)
          ? `${kullanici.ad} ${kullanici.soyad}`
          : (kullanici.ad ?? kullanici.soyad ?? null);
      setUserName(fullName ?? authData.user.email ?? authData.user.user_metadata?.name ?? null);

      const [tesisler, aktifId] = await Promise.all([
        getKullaniciTesisleri(supabase),
        getAktifTesisId(supabase),
      ]);
      if (cancelled) return;

      setTesisListesi(tesisler);
      setAktifTesisIdState(aktifId);

      const aktifTesis = aktifId ? tesisler.find((t) => t.id === aktifId) : null;
      setTesisAdi(aktifTesis?.ad ?? null);

      if (!aktifId) {
        setRezBekleyenCount(0);
        setSiparisYeniCount(0);
        setBekleyenYorumSayisi(0);
        return;
      }

      const [{ count: rezCount, error: rezErr }, { count: sipCount, error: sipErr }, { count: yorumCount, error: yorumErr }] = await Promise.all([
        supabase.from('rezervasyonlar').select('*', { count: 'exact', head: true }).eq('tesis_id', aktifId).eq('durum', 'bekliyor'),
        supabase.from('siparisler').select('*', { count: 'exact', head: true }).eq('tesis_id', aktifId).eq('durum', 'yeni'),
        supabase.from('yorumlar').select('*', { count: 'exact', head: true }).eq('tesis_id', aktifId).eq('durum', 'bekliyor'),
      ]);
      if (!cancelled) {
        setRezBekleyenCount(rezErr ? 0 : (rezCount ?? 0));
        setSiparisYeniCount(sipErr ? 0 : (sipCount ?? 0));
        setBekleyenYorumSayisi(yorumErr ? 0 : (yorumCount ?? 0));
      }
    }

    loadUserAndTesis();
    return () => { cancelled = true; };
  }, [supabase]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function handleTesisSec(tesis: TesisOzet) {
    if (tesis.id === aktifTesisId) {
      setTesisDropdownOpen(false);
      return;
    }
    setAktifTesisId(tesis.id);
    window.location.reload();
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (tesisDropdownRef.current && !tesisDropdownRef.current.contains(e.target as Node)) {
        setTesisDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ESC closes modal
  useEffect(() => {
    function h(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setTesisDropdownOpen(false);
        setCikisModal(false);
      }
    }
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <aside style={{ width: '240px', background: '#0A1628', height: '100vh', minHeight: '100vh', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', zIndex: 100, overflowY: 'auto' }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/MyLoungers_Logo-02.png" width={100} height={60} style={{ borderRadius: '10px', objectFit: 'contain' }} alt="MyLoungers" />
            <div>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#fff' }}>MY LOUNGERS</span>
              <span style={{ display: 'block', fontSize: '10px', color: '#0ABAB5' }}>İşletme Paneli</span>
            </div>
          </div>
        </Link>
      </div>
      {/* Tesis Seçici */}
      <div ref={tesisDropdownRef} style={{ margin: '12px 16px', position: 'relative' }}>
        <div
          onClick={tesisListesi.length > 1 ? () => setTesisDropdownOpen((o) => !o) : undefined}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: tesisListesi.length > 1 ? 'pointer' : 'pointer',
          }}
        >
          <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600, flex: 1 }}>{tesisAdi ?? '—'}</span>
          <span style={{
            color: '#94A3B8',
            fontSize: '12px',
            transform: tesisListesi.length > 1 && tesisDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}>▾</span>
        </div>
        {tesisDropdownOpen && tesisListesi.length > 1 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#1E293B',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            zIndex: 200,
          }}>
            {tesisListesi.map((tesis) => (
              <button
                key={tesis.id}
                type="button"
                onClick={() => handleTesisSec(tesis)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  background: tesis.id === aktifTesisId ? 'rgba(10,186,181,0.15)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: tesis.id === aktifTesisId ? 700 : 600,
                  color: tesis.id === aktifTesisId ? '#0ABAB5' : '#fff',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (tesis.id !== aktifTesisId) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { if (tesis.id !== aktifTesisId) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ width: '6px', height: '6px', background: tesis.id === aktifTesisId ? '#0ABAB5' : '#10B981', borderRadius: '50%', flexShrink: 0 }}></div>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tesis.ad}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Nav */}
      <nav style={{ padding: '8px 0', flex: 1 }}>
        {menuItems.map((item, i) => {
          if ('section' in item) return (
            <div key={i} style={{ padding: '16px 16px 6px', fontSize: '9px', fontWeight: 700, color: '#94A3B8', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{item.section}</div>
          );
          const isActive = pathname === item.href;
          const badgeToShow: number | null =
            item.href === '/isletme/rezervasyonlar'
              ? (rezBekleyenCount > 0 ? rezBekleyenCount : null)
              : item.href === '/isletme/siparisler'
                ? (siparisYeniCount > 0 ? siparisYeniCount : null)
                : item.href === '/isletme/yorumlar'
                  ? (bekleyenYorumSayisi > 0 ? bekleyenYorumSayisi : null)
                : ('badge' in item && typeof item.badge === 'number' && item.badge > 0 ? item.badge : null);
          return (
            <Link key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', cursor: 'pointer', textDecoration: 'none', position: 'relative', background: isActive ? 'rgba(10,186,181,0.15)' : 'transparent', borderLeft: isActive ? '3px solid #0ABAB5' : '3px solid transparent' }}>
              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '15px', background: isActive ? 'rgba(10,186,181,0.2)' : 'transparent' }}>{item.icon}</div>
              <span style={{ fontSize: '13px', color: isActive ? '#0ABAB5' : '#CBD5E1', fontWeight: isActive ? 600 : 500, flex: 1 }}>{item.label}</span>
              {badgeToShow != null && <span style={{ background: '#F5821F', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>{badgeToShow}</span>}
            </Link>
          );
        })}
      </nav>
      {/* Alt kullanıcı */}
      <div ref={dropdownRef} style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
        {/* Dropdown menu — opens upward */}
        {dropdownOpen && (
          <div style={{
            position: 'absolute', bottom: '72px', left: '12px', right: '12px',
            background: '#1E293B', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
            overflow: 'hidden', zIndex: 200,
          }}>
            {[
              { icon: '👤', label: 'Profil Ayarları', color: 'white' },
              { icon: '🔔', label: 'Bildirimler',     color: 'white' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => { setDropdownOpen(false); showToast(`ℹ️ ${item.label} — Yakında aktif olacak`); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 14px', background: 'transparent', border: 'none',
                  cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: item.color,
                  textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: '15px' }}>{item.icon}</span> {item.label}
              </button>
            ))}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '2px 0' }} />
            <button
              onClick={() => { setDropdownOpen(false); setCikisModal(true); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 14px', background: 'transparent', border: 'none',
                cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#EF4444',
                textAlign: 'left', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: '15px' }}>🚪</span> Çıkış Yap
            </button>
          </div>
        )}

        {/* User row — clickable */}
        <div
          onClick={() => setDropdownOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
            padding: '6px 8px', borderRadius: '10px', transition: 'background 0.15s',
            background: dropdownOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
          }}
          onMouseEnter={(e) => { if (!dropdownOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          onMouseLeave={(e) => { if (!dropdownOpen) e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg,#0ABAB5,#F5821F)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'white', flexShrink: 0 }}>ZB</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName ?? 'Kullanıcı'}</span>
            <span style={{ display: 'block', fontSize: '10px', color: '#94A3B8' }}>İşletme Yöneticisi</span>
          </div>
          <span style={{ color: '#94A3B8', fontSize: '11px', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>▲</span>
        </div>
      </div>

      {/* ── ÇIKIŞ ONAY MODAL ──────────────────────────────────────────────── */}
      {cikisModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}
          onClick={(e) => e.target === e.currentTarget && setCikisModal(false)}
        >
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '340px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
            <div style={{ fontSize: '44px', marginBottom: '12px' }}>🚪</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0A1628', marginBottom: '8px' }}>Çıkış Yap</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>Hesabınızdan çıkış yapmak istediğinize emin misiniz?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setCikisModal(false)}
                style={{ padding: '9px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: '1px solid #E2E8F0', background: '#F1F5F9', color: '#1E293B', cursor: 'pointer' }}
              >
                Vazgeç
              </button>
              <button
                onClick={async () => {
                  setCikisModal(false);
                  await supabase.auth.signOut();
                  router.push("/giris");
                }}
                style={{ padding: '9px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, border: 'none', background: '#EF4444', color: 'white', cursor: 'pointer' }}
              >
                🚪 Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', left: '260px', background: '#0A1628', color: 'white', padding: '12px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, zIndex: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', pointerEvents: 'none' }}>{toast}</div>
      )}
    </aside>
  );
}
