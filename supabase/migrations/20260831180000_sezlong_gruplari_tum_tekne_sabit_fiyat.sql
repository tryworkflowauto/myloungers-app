-- Tüm tekne / komple kiralama: fiyat kişi sayısıyla çarpılmaz (grup.fiyat × gün).
-- DEFAULT false: mevcut tüm gruplar eski kişi × fiyat davranışını korur.
ALTER TABLE sezlong_gruplari
  ADD COLUMN IF NOT EXISTS tum_tekne_sabit_fiyat BOOLEAN NOT NULL DEFAULT false;

-- SADECE La Bebe Junior (Sabah + Gün Batımı) ve Meınschatz1 (Tekne Kiralama)
UPDATE sezlong_gruplari
SET tum_tekne_sabit_fiyat = true
WHERE tesis_id = 'cbfc29b1-1506-446d-a41e-ec81c8501e39'
  AND id IN (
    '727267f6-b0db-4802-bace-be60e7a7825a',
    '266fa495-5df7-4cbf-b172-1174ffa12b24'
  );

UPDATE sezlong_gruplari
SET tum_tekne_sabit_fiyat = true
WHERE tesis_id = '6c21ff27-1be3-4d82-abd2-4cb675fc9f9e'
  AND id = 'f39cbfb8-e837-4f55-aa7c-0ecac9353a48';
