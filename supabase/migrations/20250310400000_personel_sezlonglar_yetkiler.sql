-- Personel: atanan şezlonglar ve yetkiler (jsonb)
ALTER TABLE personel ADD COLUMN IF NOT EXISTS sezlonglar JSONB DEFAULT '[]'::jsonb;
ALTER TABLE personel ADD COLUMN IF NOT EXISTS yetkiler JSONB DEFAULT '[]'::jsonb;
