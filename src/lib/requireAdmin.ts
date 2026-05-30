import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/utils/supabase/server";

export type RequireAdminResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; message: string };

/** Bearer token + cookie oturumu ile admin rolü doğrular (tesis-tipleri guard ile aynı). */
export async function requireAdmin(req: Request): Promise<RequireAdminResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let user: { id: string; email: string } | null = null;
  let supabaseForRol: Awaited<ReturnType<typeof createServerSupabase>> | ReturnType<typeof createClient> | null =
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
      supabaseForRol = supabaseUser;
    }
  }

  if (!user) {
    const supabaseCookie = await createServerSupabase();
    const {
      data: { user: cookieUser },
      error: cookieErr,
    } = await supabaseCookie.auth.getUser();
    if (cookieErr || !cookieUser) {
      return { ok: false, status: 401, message: "Oturum gerekli veya geçersiz." };
    }
    user = { id: cookieUser.id, email: String(cookieUser.email ?? "").trim() };
    supabaseForRol = supabaseCookie;
  }

  if (!supabaseForRol || !user) {
    return { ok: false, status: 401, message: "Oturum gerekli veya geçersiz." };
  }

  const { data: row, error: rowErr } = await supabaseForRol
    .from("kullanicilar")
    .select("rol")
    .eq("email", user.email)
    .maybeSingle();

  if (rowErr) {
    console.error("[requireAdmin] kullanicilar rol sorgusu", rowErr);
    return { ok: false, status: 500, message: "Yetki doğrulanamadı." };
  }

  const rol = String((row as { rol?: string } | null)?.rol ?? "").toLowerCase();
  if (rol !== "admin") {
    return { ok: false, status: 403, message: "Bu işlem yalnızca yöneticiler içindir." };
  }

  return { ok: true, userId: user.id };
}
