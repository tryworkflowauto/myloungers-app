import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchAktifTesisTipleri, kategoriInputToDbValues } from "@/lib/tesisTipleriDb";
import { requireAdmin } from "@/lib/requireAdmin";

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
  /** slug, db_value veya legacy canonical id */
  tesis_tipi: string | string[];
  tam_adres: string | null;
  ad_soyad: string;
  telefon: string;
  email: string | null;
};

export async function POST(req: Request) {
  try {
    const gate = await requireAdmin(req);
    if (!gate.ok) {
      return NextResponse.json({ error: gate.message }, { status: gate.status });
    }

    const body = await req.json();
    const b: BasvuruPayload = body.basvuru ?? body;
    if (!b || !b.id) {
      return NextResponse.json({ error: "Geçersiz başvuru verisi" }, { status: 400 });
    }

    // 1) Yalnızca beklemede ise onayla (çift tıklama / tekrar POST kilidi)
    const { data: claimed, error: updErr } = await supabaseAdmin
      .from("basvurular")
      .update({ durum: "onaylandi" })
      .eq("id", b.id)
      .eq("durum", "beklemede")
      .select("id")
      .maybeSingle();
    if (updErr) {
      console.error("basvurular update error", updErr);
      return NextResponse.json({ error: "Başvuru güncellenemedi" }, { status: 500 });
    }
    if (!claimed) {
      return NextResponse.json(
        { error: "Bu başvuru zaten onaylanmış veya işleme alınmış" },
        { status: 409 }
      );
    }

    const catalog = await fetchAktifTesisTipleri(supabaseAdmin);
    const kategoriDizi = kategoriInputToDbValues(b.tesis_tipi, catalog);
    if (kategoriDizi.length === 0) {
      return NextResponse.json({ error: "Geçersiz veya tanınmayan tesis tipi" }, { status: 400 });
    }

    // 2) Tesisler tablosuna yeni kayıt ekle
    const { data: tesis, error: insErr } = await supabaseAdmin
      .from("tesisler")
      .insert({
        ad: b.isletme_adi,
        kategori: kategoriDizi,
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
      const { data: inviteData, error: inviteErr } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(b.email);
      if (inviteErr) {
        const errMsg = inviteErr?.message ?? String(inviteErr);
        console.error("auth inviteUserByEmail error", errMsg, inviteErr);
        return NextResponse.json(
          { error: "Kullanıcı daveti gönderilemedi", detail: errMsg },
          { status: 500 }
        );
      }
      const authUserId = inviteData.user.id;

      // 4) kullanicilar: trigger handle_new_user aynı id ile musteri satırı eklemiş olabilir
      const { error: userInsErr } = await supabaseAdmin.from("kullanicilar").upsert({
        id: authUserId,
        ad: b.ad_soyad,
        email: b.email,
        rol: "isletme",
        tesis_id: tesis.id,
      }, { onConflict: "id" });
      if (userInsErr) {
        console.error("kullanicilar insert error", userInsErr);
        return NextResponse.json({ error: "Kullanıcı kaydı oluşturulamadı" }, { status: 500 });
      }

      const { error: yetkiliErr } = await supabaseAdmin.from("tesis_yetkili").upsert(
        {
          kullanici_id: authUserId,
          tesis_id: tesis.id,
          rol: "sahip",
        },
        { onConflict: "kullanici_id,tesis_id", ignoreDuplicates: true },
      );
      if (yetkiliErr) {
        console.warn("tesis_yetkili upsert atlandı:", yetkiliErr.message);
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

