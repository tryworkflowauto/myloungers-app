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
    const action = body.action as string | undefined;
    const kaynak = body.kaynak as string | undefined;
    const id = body.id as string | undefined;

    if (!action || !kaynak || !id) {
      return NextResponse.json({ error: "Geçersiz parametre" }, { status: 400 });
    }
    if (kaynak !== "sikayetler" && kaynak !== "yorumlar") {
      return NextResponse.json({ error: "Geçersiz kaynak" }, { status: 400 });
    }

    if (action === "delete") {
      const { error } = await supabaseAdmin.from(kaynak).delete().eq("id", id);
      if (error) {
        console.error("[sikayetler] delete", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "reddet") {
      const { error } = await supabaseAdmin.from(kaynak).update({ durum: "reddedildi" }).eq("id", id);
      if (error) {
        console.error("[sikayetler] reddet", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  } catch (err) {
    console.error("sikayetler route error", err);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu" }, { status: 500 });
  }
}
