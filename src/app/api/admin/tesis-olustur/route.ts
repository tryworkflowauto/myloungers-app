import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/utils/supabase/server";
import {
  createTesisWithOwner,
  type CreateTesisWithOwnerInput,
} from "@/lib/adminCreateTesis";

/**
 * NOT: repo’daki diğer /api/admin/* route’ları (onayla, tesis-durum, vb.) yalnızca
 * service role ile çalışıyor — tarafında session kontrolü yok. Bu endpoint admin panelden
 * çağrılacağı için Authorization Bearer (browser oturumu) veya cookie oturumu +
 * kullanicilar.rol ile admin doğrulanır.
 */

async function assertAdmin(req: Request): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let user: { id: string; email: string } | null = null;
  let supabaseForRol: Awaited<ReturnType<typeof createServerSupabase>> | ReturnType<typeof createClient> | null =
    null;

  // 1) Önce Authorization header (hesap-olustur pattern — localStorage oturumu)
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

  // 2) Header yoksa veya geçersizse cookie oturumu (geriye dönük)
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
    console.error("[tesis-olustur] kullanicilar rol sorgusu", rowErr);
    return { ok: false, status: 500, message: "Yetki doğrulanamadı." };
  }

  const rol = String((row as { rol?: string } | null)?.rol ?? "").toLowerCase();
  if (rol !== "admin") {
    return { ok: false, status: 403, message: "Bu işlem yalnızca yöneticiler içindir." };
  }

  return { ok: true };
}

function isLikelyClientError(msg: string | undefined): boolean {
  if (!msg) return false;
  const m = msg.toLowerCase();
  return (
    m.includes("zorunlu") ||
    m.includes("geçersiz") ||
    m.includes("gecersiz") ||
    m.includes("tanınmayan") ||
    m.includes("taninmayan") ||
    m.includes("kategori işlenemedi") ||
    m.includes("kategori islenemedi") ||
    m.includes("zaten kayıtlı") ||
    m.includes("hesap bulunamadı") ||
    m.includes("mevcut hesap")
  );
}

export async function POST(req: Request) {
  try {
    const gate = await assertAdmin(req);
    if (!gate.ok) {
      return NextResponse.json({ success: false, error: gate.message }, { status: gate.status });
    }

    const raw = await req.json();

    const input: CreateTesisWithOwnerInput = {
      isletmeAdi: raw?.isletmeAdi ?? "",
      kategoriler: raw?.kategoriler ?? raw?.kategori,
      sehir: raw?.sehir ?? "",
      ilce:
        raw?.ilce !== undefined && raw?.ilce !== null && String(raw.ilce).trim() !== ""
          ? String(raw.ilce).trim()
          : null,
      adres:
        raw?.adres !== undefined && raw?.adres !== null && String(raw.adres).trim() !== ""
          ? String(raw.adres).trim()
          : null,
      telefon: raw?.telefon ?? "",
      email:
        raw?.email !== undefined && raw?.email !== null && String(raw.email).trim() !== ""
          ? String(raw.email).trim()
          : null,
      kapasite: raw?.kapasite ?? null,
      komisyonOrani: raw?.komisyonOrani ?? null,
      abonelikPaketi: raw?.abonelikPaketi ?? null,
      isletmeModu: raw?.isletmeModu ?? null,
      isletmeSahibiAdSoyad: raw?.isletmeSahibiAdSoyad ?? null,
      odemeModu: raw?.odemeModu ?? null,
      kaporaTutari: raw?.kaporaTutari ?? null,
      komisyonTipi: raw?.komisyonTipi ?? null,
      islemBedeli: raw?.islemBedeli ?? null,
      sahipModu: raw?.sahipModu === "mevcut" ? "mevcut" : "yeni",
    };

    const result = await createTesisWithOwner(input);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    }

    const status = isLikelyClientError(result.error) ? 400 : 500;
    return NextResponse.json(result, { status });
  } catch (err) {
    console.error("[tesis-olustur] route error", err);
    return NextResponse.json(
      { success: false, error: "Beklenmeyen bir hata oluştu." },
      { status: 500 },
    );
  }
}
