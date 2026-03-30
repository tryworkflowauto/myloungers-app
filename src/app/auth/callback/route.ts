import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: kullanici } = await supabase
          .from("kullanicilar")
          .select("rol")
          .eq("id", user.id)
          .single();

        if (kullanici?.rol === "admin") return NextResponse.redirect(origin + "/admin");
        if (kullanici?.rol === "isletmeci") return NextResponse.redirect(origin + "/isletme");
        return NextResponse.redirect(origin + "/profil");
      }
    }
  }

  return NextResponse.redirect(origin + "/giris?error=auth");
}
