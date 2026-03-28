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

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = body.id;
    const aktif = body.aktif;
    if (typeof id !== "string" || typeof aktif !== "boolean") {
      return NextResponse.json({ error: "Geçersiz parametre" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("tesisler")
      .update({ aktif })
      .eq("id", id);

    if (error) {
      console.error("[tesis-durum] tesisler update error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("tesis-durum route error", err);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu" }, { status: 500 });
  }
}
