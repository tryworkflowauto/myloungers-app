-- Grup listesi ve harita sırası için
ALTER TABLE sezlong_gruplari ADD COLUMN IF NOT EXISTS sira INTEGER NOT NULL DEFAULT 0;
