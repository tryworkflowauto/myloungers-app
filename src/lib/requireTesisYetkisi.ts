import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/utils/supabase/server";

export type RequireTesisYetkisiResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; message: string };

/** Bearer token + cookie oturumu ile tesis yetkisi doğrular (admin veya tesis_yetkili / tek tesis fallback). */
export async function requireTesisYetkisi(
  req: Request,
  tesisId: string,
): Promise<RequireTesisYetkisiResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let user: { id: string; email: string } | null = null;
  let supabaseForAuth: Awaited<ReturnType<typeof createServerSupabase>> | ReturnType<typeof createClient> | null =
    null;

  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "").trim();
  if (accessToken) {
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const { data: authData, error: authErr } = await supabaseUser.auth.getUser();
    if (!authErr && authData?.user) {
      const u = authData.user;
      user = { id: u.id, email: String(u.email ?? "").trim() };
      supabaseForAuth = supabaseUser;
    }
  }

  if (!user) {
    const supabaseCookie = await createServerSupabase();
    const {
      data: { user: cookieUser },
      error: cookieErr,
    } = await supabaseCookie.auth.getUser();
    if (cookieErr || !cookieUser) {
      return { ok: false, status: 401, message: "Oturum gerekli." };
    }
    user = { id: cookieUser.id, email: String(cookieUser.email ?? "").trim() };
    supabaseForAuth = supabaseCookie;
  }

  if (!supabaseForAuth || !user) {
    return { ok: false, status: 401, message: "Oturum gerekli." };
  }

  const normalizedTesisId = String(tesisId).trim();
  if (!normalizedTesisId) {
    return { ok: false, status: 403, message: "Bu tesis için yetkiniz yok." };
  }

  const { data: kullaniciRow, error: kullaniciErr } = await supabaseForAuth
    .from("kullanicilar")
    .select("rol, tesis_id")
    .eq("id", user.id)
    .maybeSingle();

  if (kullaniciErr) {
    console.error("[requireTesisYetkisi] kullanicilar sorgusu", kullaniciErr);
    return { ok: false, status: 500, message: "Yetki doğrulanamadı." };
  }

  const rol = String((kullaniciRow as { rol?: string } | null)?.rol ?? "").toLowerCase();
  if (rol === "admin") {
    return { ok: true, userId: user.id };
  }

  const { data: yetkiliRow, error: yetkiliErr } = await supabaseForAuth
    .from("tesis_yetkili")
    .select("tesis_id")
    .eq("kullanici_id", user.id)
    .eq("tesis_id", normalizedTesisId)
    .maybeSingle();

  if (yetkiliErr) {
    console.error("[requireTesisYetkisi] tesis_yetkili sorgusu", yetkiliErr);
    return { ok: false, status: 500, message: "Yetki doğrulanamadı." };
  }

  if (yetkiliRow) {
    return { ok: true, userId: user.id };
  }

  const kullaniciTesisId = (kullaniciRow as { tesis_id?: unknown } | null)?.tesis_id;
  if (kullaniciTesisId != null && String(kullaniciTesisId) === normalizedTesisId) {
    return { ok: true, userId: user.id };
  }

  return { ok: false, status: 403, message: "Bu tesis için yetkiniz yok." };
}
