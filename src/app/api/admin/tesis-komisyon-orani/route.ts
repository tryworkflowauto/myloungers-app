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
    const id = body.id as string | undefined;
    const oran = body.oran as number | undefined;
    if (typeof id !== "string" || !id || typeof oran !== "number" || Number.isNaN(oran)) {
      return NextResponse.json({ error: "Geçersiz parametre" }, { status: 400 });
    }

    const { error: err1 } = await supabaseAdmin
      .from("tesisler")
      .update({ komisyon_orani: oran })
      .eq("id", id);

    if (!err1) {
      return NextResponse.json({ ok: true });
    }

    const { error: err2 } = await supabaseAdmin
      .from("tesisler")
      .update({ ozel_komisyon_orani: oran })
      .eq("id", id);

    if (err2) {
      console.error("[tesis-komisyon-orani]", err1, err2);
      return NextResponse.json({ error: err2.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("tesis-komisyon-orani route error", err);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu" }, { status: 500 });
  }
}
