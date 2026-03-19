import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body.name as string | undefined)?.trim();
    const email = (body.email as string | undefined)?.trim().toLowerCase();
    const password = body.password as string | undefined;

    if (!name || !email || !password || password.length < 8) {
      return NextResponse.json({ ok: false, error: "Geçersiz alanlar" }, { status: 400 });
    }

    // Email zaten kullanicilar tablosunda var mı?
    const { data: existing, error: existingErr } = await supabase
      .from("kullanicilar")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingErr) {
      console.error("Supabase kullanıcı kontrol hatası:", existingErr);
      return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ ok: false, error: "Bu e-posta ile kullanıcı zaten kayıtlı" }, { status: 409 });
    }

    // Supabase Auth tarafında kullanıcı oluştur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData?.user) {
      console.error("Supabase auth signUp hatası:", authError);
      return NextResponse.json(
        { ok: false, error: authError?.message || "Kayıt başarısız" },
        { status: 400 }
      );
    }

    // isim → ad / soyad kaba ayrımı
    const [first, ...rest] = name.split(" ");
    const ad = first;
    const soyad = rest.join(" ") || null;

    // Şifreyi bcrypt ile hashle
    const passwordHash = await hash(password, 10);

    const { error: insertErr } = await supabase
      .from("kullanicilar")
      .insert({
        id: authData.user.id,
        ad,
        soyad,
        telefon: null,
        email,
        rol: "müşteri",
        password_hash: passwordHash,
      });

    if (insertErr) {
      console.error(
        "Supabase kullanıcı insert hatası:",
        JSON.stringify(insertErr, null, 2)
      );
      return NextResponse.json(
        { ok: false, error: "Kayıt oluşturulamadı", debug: insertErr },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("Register route hata:", JSON.stringify(e, null, 2));
    return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
  }
}


