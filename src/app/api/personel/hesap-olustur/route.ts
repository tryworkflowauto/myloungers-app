import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      return NextResponse.json({ success: false, error: "Sunucu yapılandırma hatası" }, { status: 500 });
    }

    // Token ile oturumu doğrula
    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "").trim();

    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Yetkisiz erişim" }, { status: 401 });
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: authData, error: authErr } = await supabaseUser.auth.getUser();
    if (authErr || !authData?.user) {
      return NextResponse.json({ success: false, error: "Oturum geçersiz" }, { status: 401 });
    }

    // Rol ve tesis_id kontrolü
    const { data: kullanici } = await supabaseUser
      .from("kullanicilar")
      .select("rol, tesis_id")
      .eq("id", authData.user.id)
      .maybeSingle();

    const sessionRol = String((kullanici as { rol?: string } | null)?.rol ?? "").toLowerCase();
    const sessionTesisId = String((kullanici as { tesis_id?: unknown } | null)?.tesis_id ?? "").trim();

    if (sessionRol !== "isletmeci" && sessionRol !== "admin") {
      return NextResponse.json({ success: false, error: "Bu işlem için yetkiniz yok" }, { status: 403 });
    }

    const body = await req.json();
    const { personel_id, email, password } = body as { personel_id?: string; email?: string; password?: string };

    if (!personel_id || !email || !password || password.length < 8) {
      return NextResponse.json({ success: false, error: "Geçersiz parametreler" }, { status: 400 });
    }

    // Personeli çek
    const { data: personel } = await supabaseUser
      .from("personel")
      .select("id, ad, telefon, rol, tesis_id, kullanici_id")
      .eq("id", personel_id)
      .maybeSingle();

    if (!personel) {
      return NextResponse.json({ success: false, error: "Personel bulunamadı" }, { status: 404 });
    }

    const personelTesisId = String((personel as { tesis_id?: unknown }).tesis_id ?? "").trim();
    const personelRol = String((personel as { rol?: string }).rol ?? "garson");

    // isletmeci yalnızca kendi tesisindeki personele hesap açabilir
    if (sessionRol === "isletmeci" && personelTesisId !== sessionTesisId) {
      return NextResponse.json({ success: false, error: "Bu personel için hesap oluşturamazsınız" }, { status: 403 });
    }

    if ((personel as { kullanici_id?: string | null }).kullanici_id) {
      return NextResponse.json({ success: false, error: "Bu personelin zaten bir hesabı var" }, { status: 409 });
    }

    // Admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Auth user oluştur
    const { data: newAuthUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
    });

    if (createErr || !newAuthUser?.user) {
      const msg = (createErr?.message ?? "").toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        return NextResponse.json({ success: false, error: "Bu e-posta adresi zaten kullanımda" }, { status: 409 });
      }
      console.error("hesap-olustur createUser error:", JSON.stringify(createErr));
      return NextResponse.json({ success: false, error: createErr?.message ?? "Hesap oluşturulamadı" }, { status: 500 });
    }

    const newUserId = newAuthUser.user.id;
    const adParts = String((personel as { ad?: string }).ad ?? "").trim().split(" ");
    const ad = adParts[0] ?? "";
    const soyad = adParts.slice(1).join(" ") || null;
    const telefon = (personel as { telefon?: string | null }).telefon ?? null;
    const finalEmail = email.trim().toLowerCase();

    // Trigger (handle_new_user) zaten kullanicilar'a musteri olarak ekledi;
    // UPDATE ile rol, tesis_id, ad, soyad, telefon'u doğru değerlere çekiyoruz.
    const { error: kullaniciUpdateErr } = await supabaseAdmin
      .from("kullanicilar")
      .update({
        rol: personelRol,
        tesis_id: personelTesisId || null,
        ad,
        soyad,
        telefon,
      })
      .eq("id", newUserId);

    if (kullaniciUpdateErr) {
      console.error("hesap-olustur kullanicilar update error:", JSON.stringify(kullaniciUpdateErr, null, 2));
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return NextResponse.json({ success: false, error: "Kullanıcı kaydı güncellenemedi" }, { status: 500 });
    }

    // personel.kullanici_id güncelle
    const { error: updateErr } = await supabaseAdmin
      .from("personel")
      .update({ kullanici_id: newUserId })
      .eq("id", personel_id);

    if (updateErr) {
      console.error("hesap-olustur personel update error:", JSON.stringify(updateErr, null, 2));
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return NextResponse.json({ success: false, error: "Personel güncellenemedi" }, { status: 500 });
    }

    return NextResponse.json({ success: true, email: finalEmail, user_id: newUserId });
  } catch (e) {
    console.error("hesap-olustur unexpected error:", JSON.stringify(e, null, 2));
    return NextResponse.json({ success: false, error: "Sunucu hatası" }, { status: 500 });
  }
}
