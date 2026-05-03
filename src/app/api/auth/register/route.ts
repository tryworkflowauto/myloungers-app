import { NextResponse } from "next/server";
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

    // Supabase Auth tarafında kullanıcı oluştur (trigger: kullanicilar satırını ekler)
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

    const { error: updateError } = await supabase
      .from("kullanicilar")
      .update({
        ad,
        soyad,
        telefon: null,
      })
      .eq("id", authData.user.id);

    if (updateError) {
      console.error(
        "Kullanıcı bilgileri güncellenemedi:",
        JSON.stringify(updateError, null, 2)
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("Register route hata:", JSON.stringify(e, null, 2));
    return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
  }
}

