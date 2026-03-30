import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

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
