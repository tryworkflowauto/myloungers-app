-- İşletme paneli için müşteri adı ve telefon (yürüyen müşteri rezervasyonları)
ALTER TABLE rezervasyonlar ADD COLUMN IF NOT EXISTS musteri_adi TEXT;
ALTER TABLE rezervasyonlar ADD COLUMN IF NOT EXISTS telefon TEXT;
