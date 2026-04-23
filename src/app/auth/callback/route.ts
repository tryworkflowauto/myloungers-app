import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function getRedirectPath(rol: string | undefined | null): string {
  const r = (rol ?? "").toLowerCase();
  if (r === "admin") return "/admin";
  if (r === "isletmeci") return "/isletme";
  if (r === "garson") return "/garson";
  if (r === "mutfak") return "/mutfak";
  return "/profil";
}

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

        return NextResponse.redirect(origin + getRedirectPath(kullanici?.rol));
      }
    }
  }

  return NextResponse.redirect(origin + "/giris?error=auth");
}
