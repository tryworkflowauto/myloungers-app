-- Yasal metinler: içerik TR/EN DB'de; uygulama ?lang=en ile İngilizce gösterir.

CREATE TABLE IF NOT EXISTS public.yasal_metinler (
  slug text PRIMARY KEY,
  baslik text NOT NULL,
  baslik_en text,
  meta_aciklama text,
  meta_aciklama_en text,
  icerik text NOT NULL,
  icerik_en text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.yasal_metinler IS 'KVKK, gizlilik, kullanım şartları, iptal-iade, çerez politikası (HTML içerik)';
COMMENT ON COLUMN public.yasal_metinler.icerik IS 'Türkçe HTML gövdesi';
COMMENT ON COLUMN public.yasal_metinler.icerik_en IS 'İngilizce HTML; boşsa uygulama Türkçe icerik kullanır';

CREATE INDEX IF NOT EXISTS yasal_metinler_slug_idx ON public.yasal_metinler (slug);

ALTER TABLE public.yasal_metinler ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "yasal_metinler_select_anon_auth" ON public.yasal_metinler;
CREATE POLICY "yasal_metinler_select_anon_auth"
  ON public.yasal_metinler
  FOR SELECT
  TO anon, authenticated
  USING (true);
