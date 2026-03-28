import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hash } from "bcryptjs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userId as string | undefined;
    const password = body.password as string | undefined;

    if (!userId || !password) {
      return NextResponse.json(
        { error: "userId ve password gerekli" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Şifre en az 8 karakter olmalıdır" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
    });

    if (error) {
      console.error("updateUserById error", error);
      return NextResponse.json(
        { error: error.message || "Şifre güncellenemedi" },
        { status: 500 }
      );
    }

    const password_hash = await hash(password, 10);

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    const email = authUser?.user?.email?.toLowerCase()?.trim() ?? null;
    const ad = authUser?.user?.user_metadata?.ad ?? authUser?.user?.user_metadata?.full_name ?? email ?? "";

    const { data: byId } = await supabaseAdmin
      .from("kullanicilar")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    const { data: byEmail } = email
      ? await supabaseAdmin
          .from("kullanicilar")
          .select("id")
          .eq("email", email)
          .maybeSingle()
      : { data: null };
    const existing = byId ?? byEmail;

    if (existing) {
      const { error: updateErr } = await supabaseAdmin
        .from("kullanicilar")
        .update({ password_hash })
        .eq("id", existing.id);
      if (updateErr) {
        console.error("kullanicilar password_hash update error", updateErr);
        return NextResponse.json(
          { error: "Şifre kaydı güncellenemedi" },
          { status: 500 }
        );
      }
    } else {
      if (!email) {
        return NextResponse.json(
          { error: "Kullanıcı e-postası alınamadı, kullanıcı kaydı oluşturulamıyor" },
          { status: 500 }
        );
      }
      const { error: insertErr } = await supabaseAdmin
        .from("kullanicilar")
        .insert({
          id: userId,
          email,
          ad: ad || null,
          rol: "isletme",
          password_hash,
        });
      if (insertErr) {
        console.error("kullanicilar insert error", insertErr);
        return NextResponse.json(
          { error: "Kullanıcı kaydı oluşturulamadı" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("set-password route error", err);
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu" },
      { status: 500 }
    );
  }
}
