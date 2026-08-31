-- Keşfet rehberleri. Şu an satır eklenmez; yayın ayrı bir karardır.
CREATE TABLE IF NOT EXISTS public.rehberler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  baslik TEXT NOT NULL,
  kategori TEXT NOT NULL,
  ozet TEXT,
  icerik TEXT,
  ilgili_kesfet_url TEXT,
  yayinda BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT rehberler_kategori_check CHECK (kategori IN ('TEKNE', 'SPA'))
);

COMMENT ON TABLE public.rehberler IS 'Keşfet rehber yazıları (TEKNE / SPA). yayinda=false ise listelenmez.';

CREATE INDEX IF NOT EXISTS rehberler_yayinda_idx ON public.rehberler (yayinda) WHERE yayinda = true;

ALTER TABLE public.rehberler ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rehberler_select_yayinda" ON public.rehberler;
CREATE POLICY "rehberler_select_yayinda"
  ON public.rehberler
  FOR SELECT
  TO anon, authenticated
  USING (yayinda = true);
