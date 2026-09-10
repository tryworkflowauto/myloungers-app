ALTER TABLE public.rehberler
ADD COLUMN IF NOT EXISTS ilgili_tesisler JSONB;

COMMENT ON COLUMN public.rehberler.ilgili_tesisler IS
'Rehber bağlamındaki ilgili tesisler: [{"slug":"...","rol":"ozel"|"paylasimli"}]. Ad/aktif tesisler tablosundan okunur.';
