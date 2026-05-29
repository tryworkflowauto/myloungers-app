import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/utils/supabase/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

async function assertAdmin(req: Request): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
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
    console.error("[tesis-tipleri] kullanicilar rol sorgusu", rowErr);
    return { ok: false, status: 500, message: "Yetki doğrulanamadı." };
  }

  const rol = String((row as { rol?: string } | null)?.rol ?? "").toLowerCase();
  if (rol !== "admin") {
    return { ok: false, status: 403, message: "Bu işlem yalnızca yöneticiler içindir." };
  }

  return { ok: true };
}

function normalizeDbValue(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, " ");
}

function uniqueViolationMessage(error: { code?: string; message?: string; details?: string }): string | null {
  if (error.code !== "23505") return null;
  const blob = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  if (blob.includes("slug")) return "Bu slug zaten kullanılıyor.";
  if (blob.includes("db_value")) return "Bu db_value zaten kayıtlı.";
  return "Bu değer zaten kayıtlı (benzersiz alan çakışması).";
}

export async function GET(req: Request) {
  try {
    const gate = await assertAdmin(req);
    if (!gate.ok) {
      return NextResponse.json({ error: gate.message }, { status: gate.status });
    }

    const { data, error } = await supabaseAdmin
      .from("tesis_tipleri")
      .select("id, slug, ad, db_value, yer_etiketi, sira, aktif, gorsel, ikon")
      .order("sira", { ascending: true });

    if (error) {
      console.error("[tesis-tipleri] GET", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    console.error("[tesis-tipleri] GET route error", err);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const gate = await assertAdmin(req);
    if (!gate.ok) {
      return NextResponse.json({ error: gate.message }, { status: gate.status });
    }

    const body = await req.json();
    const slug = String(body.slug ?? "").trim();
    const ad = String(body.ad ?? "").trim();
    const db_value = normalizeDbValue(String(body.db_value ?? ""));
    const yerRaw = body.yer_etiketi;
    const yer_etiketi =
      yerRaw == null || String(yerRaw).trim() === "" ? null : String(yerRaw).trim();
    const siraNum = Number(body.sira);
    const sira = Number.isFinite(siraNum) ? Math.floor(siraNum) : 0;
    const gorselRaw = body.gorsel;
    const gorsel =
      gorselRaw == null || String(gorselRaw).trim() === "" ? null : String(gorselRaw).trim();
    const ikonRaw = body.ikon;
    const ikon = ikonRaw == null || String(ikonRaw).trim() === "" ? null : String(ikonRaw).trim();

    if (!slug) {
      return NextResponse.json({ error: "slug zorunludur." }, { status: 400 });
    }
    if (!ad) {
      return NextResponse.json({ error: "ad zorunludur." }, { status: 400 });
    }
    if (!db_value) {
      return NextResponse.json({ error: "db_value zorunludur." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("tesis_tipleri")
      .insert({
        slug,
        ad,
        db_value,
        yer_etiketi,
        sira,
        aktif: body.aktif === false ? false : true,
        gorsel,
        ikon,
      })
      .select("id, slug, ad, db_value, yer_etiketi, sira, aktif, gorsel, ikon")
      .single();

    if (error) {
      const dup = uniqueViolationMessage(error);
      if (dup) return NextResponse.json({ error: dup }, { status: 409 });
      console.error("[tesis-tipleri] POST", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error("[tesis-tipleri] POST route error", err);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const gate = await assertAdmin(req);
    if (!gate.ok) {
      return NextResponse.json({ error: gate.message }, { status: gate.status });
    }

    const body = await req.json();
    const id = String(body.id ?? "").trim();
    if (!id) {
      return NextResponse.json({ error: "id zorunludur." }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};

    if (body.ad !== undefined) {
      const ad = String(body.ad).trim();
      if (!ad) return NextResponse.json({ error: "ad boş olamaz." }, { status: 400 });
      patch.ad = ad;
    }

    if (body.yer_etiketi !== undefined) {
      const yerRaw = body.yer_etiketi;
      patch.yer_etiketi =
        yerRaw == null || String(yerRaw).trim() === "" ? null : String(yerRaw).trim();
    }

    if (body.sira !== undefined) {
      const siraNum = Number(body.sira);
      if (!Number.isFinite(siraNum)) {
        return NextResponse.json({ error: "sira geçersiz." }, { status: 400 });
      }
      patch.sira = Math.floor(siraNum);
    }

    if (body.aktif !== undefined) {
      if (typeof body.aktif !== "boolean") {
        return NextResponse.json({ error: "aktif boolean olmalıdır." }, { status: 400 });
      }
      patch.aktif = body.aktif;
    }

    if (body.gorsel !== undefined) {
      const gorselRaw = body.gorsel;
      patch.gorsel =
        gorselRaw == null || String(gorselRaw).trim() === "" ? null : String(gorselRaw).trim();
    }

    if (body.ikon !== undefined) {
      const ikonRaw = body.ikon;
      patch.ikon = ikonRaw == null || String(ikonRaw).trim() === "" ? null : String(ikonRaw).trim();
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan yok." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("tesis_tipleri")
      .update(patch)
      .eq("id", id)
      .select("id, slug, ad, db_value, yer_etiketi, sira, aktif, gorsel, ikon")
      .single();

    if (error) {
      console.error("[tesis-tipleri] PATCH", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[tesis-tipleri] PATCH route error", err);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
