/**
 * Merkezi tesis oluşturma (sunucu tarafı, service role).
 * Henüz route’lardan çağrılmıyor; admin / onay entegrasyonu için hazır.
 *
 * Düzeltmeler: slug üretimi + benzersizleştirme; işletme sahibi rolü `isletmeci` (panel ile uyumlu).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { fetchAktifTesisTipleri, kategoriInputToDbValues } from "@/lib/tesisTipleriDb";
import { getOdemeModu, getKomisyonTipi, DEFAULT_ODEME_MODU, DEFAULT_KOMISYON_TIPI } from "./odemeModlari";

export type SahipModu = "yeni" | "mevcut";

export type CreateTesisWithOwnerInput = {
  isletmeAdi: string;
  /** Canonical facility id, slug veya db_value */
  kategoriler: unknown;
  sehir: string;
  ilce: string | null;
  adres: string | null;
  telefon: string;
  email?: string | null;
  kapasite?: number | null;
  komisyonOrani?: number | null;
  abonelikPaketi?: string | null;
  /** Şimdilik yalnızca DB’de uygun kolon varsa yazılır */
  isletmeModu?: string | null;
  isletmeSahibiAdSoyad?: string | null;
  odemeModu?: string | null; // 'harcama_limitli' | 'hizmet_bedeli' | 'kapora' | 'on_siparis' | 'hizmet_secimli'
  kaporaTutari?: number | null; // Tip kapora ise avans tutarı
  komisyonTipi?: string | null; // 'yuzde' | 'islem_bedeli' | 'yok'
  islemBedeli?: number | null; // Komisyon tipi islem_bedeli ise sabit tutar
  /** 'yeni': davet + kullanicilar; 'mevcut': yalnızca tesis_yetkili (varsayılan 'yeni') */
  sahipModu?: SahipModu | null;
};

export type CreateTesisWithOwnerResult = {
  success: boolean;
  tesisId?: string;
  slug?: string;
  error?: string;
};

/** onayla API ile aynı kategori dizisi mantığı — tesis_tipleri + legacy fallback */
export { kategoriInputToDbValues } from "@/lib/tesisTipleriDb";

async function resolveKategoriDbValues(
  admin: SupabaseClient,
  input: unknown,
): Promise<string[]> {
  const catalog = await fetchAktifTesisTipleri(admin);
  return kategoriInputToDbValues(input, catalog);
}

const TR_SLUG_CHARS: Record<string, string> = {
  ğ: "g",
  Ğ: "g",
  ü: "u",
  Ü: "u",
  ş: "s",
  Ş: "s",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ç: "c",
  Ç: "c",
};

/**
 * İşletme adından URL slug üretir (Türkçe harfleri ASCII’ye yaklaştırır, küçük harf, tire).
 * Örn. "Captain Jack Tekne" → "captain-jack-tekne"
 */
export function slugifyIsletmeAdi(raw: string): string {
  let s = raw.trim();
  if (!s) return "";
  for (const [k, v] of Object.entries(TR_SLUG_CHARS)) {
    s = s.split(k).join(v);
  }
  s = s.replace(/\s+/g, " ").trim();
  s = s.toLowerCase();
  s = s.normalize("NFD").replace(/\p{M}/gu, "");
  s = s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
  return s;
}

async function slugExists(admin: SupabaseClient, slug: string): Promise<boolean> {
  const { data, error } = await admin.from("tesisler").select("id").eq("slug", slug).maybeSingle();
  if (error) {
    const code = (error as { code?: string }).code;
    if (code === "42703") return false;
    throw new Error(`Slug kontrolü başarısız: ${error.message}`);
  }
  return data != null;
}

/** Benzersiz slug: çakışımda -2, -3, ... */
export async function allocateUniqueTesisSlug(admin: SupabaseClient, isletmeAdi: string): Promise<string> {
  let base = slugifyIsletmeAdi(isletmeAdi);
  if (!base) {
    base = `tesis-${Date.now().toString(36)}`;
  }
  if (!(await slugExists(admin, base))) return base;
  let n = 2;
  for (;;) {
    const candidate = `${base}-${n}`;
    if (!(await slugExists(admin, candidate))) return candidate;
    n += 1;
    if (n > 10_000) throw new Error("Slug benzersizleştirme üst sınırına ulaşıldı");
  }
}

async function safeOptionalTesisUpdate(
  admin: SupabaseClient,
  tesisId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  for (const [key, val] of Object.entries(patch)) {
    if (val === undefined) continue;
    const { error } = await admin.from("tesisler").update({ [key]: val }).eq("id", tesisId);
    if (error) {
      console.warn(`[adminCreateTesis] Opsiyonel kolon atlandı (${key}):`, error.message);
    }
  }
}

function getServiceAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url?.trim() || !key?.trim()) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY tanımlı değil");
  }
  return createClient(url.trim(), key.trim(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function upsertTesisYetkiliSahip(
  admin: SupabaseClient,
  kullaniciId: string,
  tesisId: string,
): Promise<string | null> {
  const { error } = await admin.from("tesis_yetkili").upsert(
    {
      kullanici_id: kullaniciId,
      tesis_id: tesisId,
      rol: "sahip",
    },
    { onConflict: "kullanici_id,tesis_id", ignoreDuplicates: true },
  );
  if (error) {
    console.warn("[adminCreateTesis] tesis_yetkili upsert atlandı:", error.message);
    return error.message;
  }
  return null;
}

async function findKullaniciIdByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("kullanicilar")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (error || !data?.id) return null;
  return String(data.id);
}

function isInviteAlreadyRegisteredError(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("already") ||
    m.includes("registered") ||
    m.includes("exists") ||
    m.includes("duplicate") ||
    m.includes("zaten")
  );
}

/**
 * Tesis + (opsiyonel) davet edilmiş işletme sahibi kullanıcısı oluşturur.
 */
export async function createTesisWithOwner(
  input: CreateTesisWithOwnerInput,
  options?: { supabaseAdmin?: SupabaseClient },
): Promise<CreateTesisWithOwnerResult> {
  const admin = options?.supabaseAdmin ?? getServiceAdmin();

  const ad = String(input.isletmeAdi ?? "").trim();
  if (!ad) {
    return { success: false, error: "İşletme adı zorunludur." };
  }
  const sehir = String(input.sehir ?? "").trim();
  if (!sehir) {
    return { success: false, error: "Şehir zorunludur." };
  }
  const telefon = String(input.telefon ?? "").trim();
  if (!telefon) {
    return { success: false, error: "Telefon zorunludur." };
  }

  let slug: string;
  try {
    slug = await allocateUniqueTesisSlug(admin, ad);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }

  let kategoriDizi: string[];
  try {
    kategoriDizi = await resolveKategoriDbValues(admin, input.kategoriler);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: `Kategori işlenemedi: ${msg}` };
  }
  if (kategoriDizi.length === 0) {
    return { success: false, error: "Geçersiz veya tanınmayan kategori." };
  }

  const ilceVal = input.ilce != null && String(input.ilce).trim() !== "" ? String(input.ilce).trim() : null;
  const adresVal =
    input.adres != null && String(input.adres).trim() !== "" ? String(input.adres).trim() : null;
  const emailVal =
    input.email != null && String(input.email).trim() !== "" ? String(input.email).trim().toLowerCase() : null;

  const odemeModuVal = getOdemeModu(input.odemeModu).id;
  const hizmetSecimliVal = odemeModuVal === "hizmet_secimli";
  // Tip 3: ödeme davranışı hizmet_bedeli ile aynı; müşteri akışı hizmet_secimli bayrağı ile açılır.
  const odemeModuDb = hizmetSecimliVal ? "hizmet_bedeli" : odemeModuVal;
  const komisyonTipiVal = getKomisyonTipi(input.komisyonTipi).id;

  const { data: tesis, error: insErr } = await admin
    .from("tesisler")
    .insert({
      ad,
      slug,
      kategori: kategoriDizi,
      sehir,
      ilce: ilceVal,
      adres: adresVal,
      telefon,
      email: emailVal,
      aktif: true,
      odeme_modu: odemeModuDb,
      hizmet_secimli: hizmetSecimliVal,
      komisyon_tipi: komisyonTipiVal,
    })
    .select("id, slug")
    .single();

  if (insErr || !tesis) {
    console.error("[adminCreateTesis] tesisler insert error", insErr);
    return {
      success: false,
      error: insErr?.message ?? "Tesis kaydı oluşturulamadı.",
    };
  }

  const tesisId = String((tesis as { id: string }).id);
  const savedSlug = String((tesis as { slug?: string }).slug ?? slug);

  const optionalPatch: Record<string, unknown> = {};
  if (input.kapasite != null && Number.isFinite(Number(input.kapasite))) {
    optionalPatch.kapasite = Number(input.kapasite);
  }
  if (input.komisyonOrani != null && Number.isFinite(Number(input.komisyonOrani))) {
    optionalPatch.komisyon_orani = Number(input.komisyonOrani);
  }
  if (input.abonelikPaketi != null && String(input.abonelikPaketi).trim() !== "") {
    optionalPatch.abonelik_paketi = String(input.abonelikPaketi).trim();
  }
  if (input.isletmeModu != null && String(input.isletmeModu).trim() !== "") {
    optionalPatch.isletme_modu = String(input.isletmeModu).trim();
  }
  if (input.kaporaTutari != null && Number.isFinite(Number(input.kaporaTutari))) {
    optionalPatch.kapora_tutari = Number(input.kaporaTutari);
  }
  if (input.islemBedeli != null && Number.isFinite(Number(input.islemBedeli))) {
    optionalPatch.islem_bedeli = Number(input.islemBedeli);
  }
  await safeOptionalTesisUpdate(admin, tesisId, optionalPatch);

  if (!emailVal) {
    return { success: true, tesisId, slug: savedSlug };
  }

  const sahipModu: SahipModu = input.sahipModu === "mevcut" ? "mevcut" : "yeni";

  if (sahipModu === "mevcut") {
    const mevcutKullaniciId = await findKullaniciIdByEmail(admin, emailVal);
    if (!mevcutKullaniciId) {
      return {
        success: false,
        tesisId,
        slug: savedSlug,
        error: "Bu e-postayla kayıtlı hesap bulunamadı.",
      };
    }

    const yetkiliErr = await upsertTesisYetkiliSahip(admin, mevcutKullaniciId, tesisId);
    if (yetkiliErr) {
      return {
        success: false,
        tesisId,
        slug: savedSlug,
        error: `Tesis oluşturuldu ancak hesaba bağlanamadı: ${yetkiliErr}`,
      };
    }

    return { success: true, tesisId, slug: savedSlug };
  }

  const existingKullaniciId = await findKullaniciIdByEmail(admin, emailVal);
  if (existingKullaniciId) {
    return {
      success: false,
      tesisId,
      slug: savedSlug,
      error: "Bu e-posta zaten kayıtlı; 'Mevcut hesap' seçeneğini kullanın.",
    };
  }

  const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(emailVal);
  if (inviteErr || !inviteData?.user?.id) {
    console.error("[adminCreateTesis] inviteUserByEmail error", inviteErr);
    const inviteMsg = inviteErr?.message ?? "";
    if (isInviteAlreadyRegisteredError(inviteMsg)) {
      return {
        success: false,
        tesisId,
        slug: savedSlug,
        error: "Bu e-posta zaten kayıtlı; 'Mevcut hesap' seçeneğini kullanın.",
      };
    }
    return {
      success: false,
      tesisId,
      slug: savedSlug,
      error:
        inviteMsg ||
        "Davet gönderilemedi; tesis oluşturuldu ancak işletme hesabı oluşturulamadı. kullanicilar kaydını elle tamamlayın.",
    };
  }

  const authUserId = inviteData.user.id;
  const adSahip =
    String(input.isletmeSahibiAdSoyad ?? "").trim() ||
    emailVal.split("@")[0] ||
    "İşletme";

  const { error: userInsErr } = await admin.from("kullanicilar").upsert({
    id: authUserId,
    ad: adSahip,
    email: emailVal,
    rol: "isletmeci",
    tesis_id: tesisId,
  }, { onConflict: "id" });

  if (userInsErr) {
    console.error("[adminCreateTesis] YARIM DURUM: auth daveti başarılı, kullanicilar insert başarısız", userInsErr);
    return {
      success: false,
      tesisId,
      slug: savedSlug,
      error: `Auth kullanıcısı oluşturuldu ancak kullanicilar kaydı yazılamadı: ${userInsErr.message}`,
    };
  }

  await upsertTesisYetkiliSahip(admin, authUserId, tesisId);

  return { success: true, tesisId, slug: savedSlug };
}
