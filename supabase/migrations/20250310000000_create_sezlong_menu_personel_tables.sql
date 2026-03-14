-- Şezlong grupları
CREATE TABLE sezlong_gruplari (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tesis_id UUID REFERENCES tesisler(id) ON DELETE CASCADE,
  ad TEXT NOT NULL,
  renk TEXT DEFAULT '#0ABAB5',
  kapasite INTEGER DEFAULT 10,
  fiyat NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Şezlonglar
CREATE TABLE sezlonglar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grup_id UUID REFERENCES sezlong_gruplari(id) ON DELETE CASCADE,
  tesis_id UUID REFERENCES tesisler(id) ON DELETE CASCADE,
  numara INTEGER NOT NULL,
  durum TEXT DEFAULT 'bos',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sezonlar & Fiyatlar
CREATE TABLE sezonlar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tesis_id UUID REFERENCES tesisler(id) ON DELETE CASCADE,
  ad TEXT NOT NULL,
  baslangic DATE NOT NULL,
  bitis DATE NOT NULL,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menü Kategorileri
CREATE TABLE menu_kategorileri (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tesis_id UUID REFERENCES tesisler(id) ON DELETE CASCADE,
  ad TEXT NOT NULL,
  sira INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true
);

-- Menü Ürünleri
CREATE TABLE menu_urunleri (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kategori_id UUID REFERENCES menu_kategorileri(id) ON DELETE CASCADE,
  tesis_id UUID REFERENCES tesisler(id) ON DELETE CASCADE,
  ad TEXT NOT NULL,
  aciklama TEXT,
  fiyat NUMERIC(10,2) NOT NULL,
  gorsel_url TEXT,
  aktif BOOLEAN DEFAULT true
);

-- Personel
CREATE TABLE personel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tesis_id UUID REFERENCES tesisler(id) ON DELETE CASCADE,
  kullanici_id UUID REFERENCES kullanicilar(id),
  ad TEXT NOT NULL,
  rol TEXT DEFAULT 'garson',
  telefon TEXT,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Siparişler
CREATE TABLE siparisler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tesis_id UUID REFERENCES tesisler(id) ON DELETE CASCADE,
  rezervasyon_id UUID REFERENCES rezervasyonlar(id),
  sezlong_id UUID REFERENCES sezlonglar(id),
  garson_id UUID REFERENCES personel(id),
  durum TEXT DEFAULT 'bekliyor',
  toplam NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sipariş Kalemleri
CREATE TABLE siparis_kalemleri (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  siparis_id UUID REFERENCES siparisler(id) ON DELETE CASCADE,
  urun_id UUID REFERENCES menu_urunleri(id),
  ad TEXT NOT NULL,
  fiyat NUMERIC(10,2) NOT NULL,
  adet INTEGER DEFAULT 1
);

-- Yorumlar
CREATE TABLE yorumlar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tesis_id UUID REFERENCES tesisler(id) ON DELETE CASCADE,
  kullanici_id UUID REFERENCES kullanicilar(id),
  puan INTEGER CHECK (puan BETWEEN 1 AND 10),
  yorum TEXT,
  durum TEXT DEFAULT 'aktif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bildirimler
CREATE TABLE bildirimler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kullanici_id UUID REFERENCES kullanicilar(id) ON DELETE CASCADE,
  baslik TEXT NOT NULL,
  mesaj TEXT,
  okundu BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ödemeler
CREATE TABLE odemeler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rezervasyon_id UUID REFERENCES rezervasyonlar(id),
  kullanici_id UUID REFERENCES kullanicilar(id),
  tesis_id UUID REFERENCES tesisler(id),
  tutar NUMERIC(10,2) NOT NULL,
  komisyon NUMERIC(10,2),
  islemci_komisyon NUMERIC(10,2),
  durum TEXT DEFAULT 'bekliyor',
  iyzico_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
