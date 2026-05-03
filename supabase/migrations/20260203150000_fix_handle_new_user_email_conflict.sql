-- handle_new_user: auth.users INSERT sonrası kullanicilar satırı
-- Sorun 23505: email unique (yetim kullanicilar + yeni auth id)
-- Çözüm: Aynı e-postada satır varsa PK/id'yi yeni auth kullanıcıya taşı, yoksa INSERT.
-- NOT: başka tablolarda eski kullanici_id FK'leri kaldıysa PK güncellemesi onları koparır;
-- işletme/personel gibi kritik roller korunursa daha güvenli (müşteri dışı rol korunur).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_ad text := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
BEGIN
  IF EXISTS (SELECT 1 FROM public.kullanicilar k WHERE k.email IS NOT DISTINCT FROM NEW.email) THEN
    UPDATE public.kullanicilar u
    SET
      id = NEW.id,
      ad = COALESCE(v_ad, u.ad),
      rol = CASE
        WHEN lower(trim(coalesce(u.rol::text, ''))) IN (
          'admin',
          'isletmeci',
          'işletme',
          'garson',
          'mutfak',
          'hotel'
        )
        THEN u.rol
        ELSE 'musteri'
      END
    WHERE u.email IS NOT DISTINCT FROM NEW.email;
    RETURN NEW;
  END IF;

  INSERT INTO public.kullanicilar (id, email, ad, rol)
  VALUES (NEW.id, NEW.email, v_ad, 'musteri')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;
