import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

type BasvuruPayload = {
  id: string;
  isletme_adi: string;
  sehir: string;
  ilce: string | null;
  tesis_tipi: string;
  tam_adres: string | null;
  ad_soyad: string;
  telefon: string;
  email: string | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const b: BasvuruPayload = body.basvuru ?? body;
    if (!b || !b.id) {
      return NextResponse.json({ error: "Geçersiz başvuru verisi" }, { status: 400 });
    }

    // 1) Başvuru durumunu güncelle
    const { error: updErr } = await supabaseAdmin
      .from("basvurular")
      .update({ durum: "onaylandi" })
      .eq("id", b.id);
    if (updErr) {
      console.error("basvurular update error", updErr);
      return NextResponse.json({ error: "Başvuru güncellenemedi" }, { status: 500 });
    }

    // 2) Tesisler tablosuna yeni kayıt ekle
    const { data: tesis, error: insErr } = await supabaseAdmin
      .from("tesisler")
      .insert({
        ad: b.isletme_adi,
        kategori: b.tesis_tipi,
        sehir: b.sehir,
        ilce: b.ilce,
        adres: b.tam_adres,
        telefon: b.telefon,
        email: b.email,
        aktif: true,
      })
      .select("*")
      .single();
    if (insErr || !tesis) {
      console.error("tesisler insert error", insErr);
      return NextResponse.json({ error: "Tesis kaydı oluşturulamadı" }, { status: 500 });
    }

    // 3) Supabase Auth'a davet maili ile kullanıcı oluştur
    if (b.email) {
      const { error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(b.email);
      if (inviteErr) {
        console.error("auth inviteUserByEmail error", inviteErr);
        return NextResponse.json({ error: "Kullanıcı daveti gönderilemedi" }, { status: 500 });
      }

      // 4) kullanicilar tablosuna kayıt
      const { error: userInsErr } = await supabaseAdmin.from("kullanicilar").insert({
        ad: b.ad_soyad,
        email: b.email,
        rol: "isletme",
      });
      if (userInsErr) {
        console.error("kullanicilar insert error", userInsErr);
        return NextResponse.json({ error: "Kullanıcı kaydı oluşturulamadı" }, { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      tesis,
    });
  } catch (err) {
    console.error("onayla route error", err);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu" }, { status: 500 });
  }
}

