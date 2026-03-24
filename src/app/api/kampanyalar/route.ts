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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tesis_id,
      ad,
      aciklama,
      indirim_orani,
      baslangic_tarihi,
      bitis_tarihi,
      tip,
      gruplar,
      musteri_goster,
      durum,
    } = body ?? {};

    if (!tesis_id || !ad) {
      return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("kampanyalar")
      .insert({
        tesis_id,
        ad,
        aciklama: aciklama ?? "",
        indirim_orani: indirim_orani ?? 0,
        baslangic_tarihi: baslangic_tarihi ?? null,
        bitis_tarihi: bitis_tarihi ?? null,
        tip: tip ?? "oran",
        gruplar: Array.isArray(gruplar) ? gruplar : [],
        musteri_goster: musteri_goster ?? true,
        durum: durum ?? "aktif",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[api/kampanyalar][POST] insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    console.error("[api/kampanyalar][POST] route error:", err);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      tesis_id,
      ad,
      aciklama,
      indirim_orani,
      baslangic_tarihi,
      bitis_tarihi,
      tip,
      gruplar,
      musteri_goster,
      durum,
    } = body ?? {};

    if (!id || !tesis_id || !ad) {
      return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("kampanyalar")
      .update({
        ad,
        aciklama: aciklama ?? "",
        indirim_orani: indirim_orani ?? 0,
        baslangic_tarihi: baslangic_tarihi ?? null,
        bitis_tarihi: bitis_tarihi ?? null,
        tip: tip ?? "oran",
        gruplar: Array.isArray(gruplar) ? gruplar : [],
        musteri_goster: musteri_goster ?? true,
        durum: durum ?? "aktif",
      })
      .eq("id", id)
      .eq("tesis_id", tesis_id);

    if (error) {
      console.error("[api/kampanyalar][PUT] update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/kampanyalar][PUT] route error:", err);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id, tesis_id } = body ?? {};

    if (!id || !tesis_id) {
      return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("kampanyalar")
      .delete()
      .eq("id", id)
      .eq("tesis_id", tesis_id);

    if (error) {
      console.error("[api/kampanyalar][DELETE] delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/kampanyalar][DELETE] route error:", err);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, tesis_id, durum } = body ?? {};

    if (!id || !tesis_id || !durum) {
      return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("kampanyalar")
      .update({ durum })
      .eq("id", id)
      .eq("tesis_id", tesis_id);

    if (error) {
      console.error("[api/kampanyalar][PATCH] update durum error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/kampanyalar][PATCH] route error:", err);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu" }, { status: 500 });
  }
}
