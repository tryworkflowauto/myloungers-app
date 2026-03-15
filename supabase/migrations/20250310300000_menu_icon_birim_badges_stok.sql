-- Menü kategorileri: ikon (emoji)
ALTER TABLE menu_kategorileri ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📋';

-- Menü ürünleri: ikon, birim, etiketler, stok
ALTER TABLE menu_urunleri ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '🍽️';
ALTER TABLE menu_urunleri ADD COLUMN IF NOT EXISTS birim TEXT DEFAULT 'adet';
ALTER TABLE menu_urunleri ADD COLUMN IF NOT EXISTS badges TEXT DEFAULT '';
ALTER TABLE menu_urunleri ADD COLUMN IF NOT EXISTS stok BOOLEAN DEFAULT true;
