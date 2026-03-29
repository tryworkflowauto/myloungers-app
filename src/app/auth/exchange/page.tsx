"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function AuthExchange() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) { router.push("/giris"); return; }
    supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
      if (error || !data?.user) { router.push("/giris"); return; }
      const { data: mevcut } = await supabase.from("kullanicilar").select("id").eq("email", data.user.email).single();
      if (!mevcut) {
        await supabase.from("kullanicilar").insert({
          id: data.user.id,
          ad: data.user.user_metadata?.full_name?.split(" ")[0] || data.user.email?.split("@")[0] || "Kullanici",
          soyad: data.user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
          email: data.user.email,
          rol: "musteri",
        });
      }
      const { data: kullanici } = await supabase.from("kullanicilar").select("rol").eq("email", data.user.email).single();
      const rol = (kullanici as any)?.rol;
      if (rol === "admin") router.push("/admin");
      else if (rol === "isletmeci") router.push("/isletme");
      else router.push("/profil");
    });
  }, []);

  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontSize:"1.2rem"}}>Giriş yapılıyor...</div>;
}
