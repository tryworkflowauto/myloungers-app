import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function redirectForResponseCode(
  responseCode: string,
  merchantPaymentId: string | null,
  pgtranid: string | null
) {
  const ok = responseCode === "00";
  if (ok && merchantPaymentId) {
    const updatePayload: { durum: string; pgtranid?: string } = { durum: "onaylandi" };
    if (pgtranid != null && String(pgtranid).trim() !== "") {
      updatePayload.pgtranid = String(pgtranid).trim();
    }
    const { error } = await supabaseAdmin
      .from("rezervasyonlar")
      .update(updatePayload)
      .eq("id", merchantPaymentId);
    if (error) console.error("[paratika/callback] rezervasyon güncelleme:", error);
  }
  if (ok) return NextResponse.redirect("https://myloungers.com/profil");
  return NextResponse.redirect("https://myloungers.com/odeme?sonuc=hata");
}

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const responseCode =
      u.searchParams.get("responseCode") ||
      u.searchParams.get("RESPONSECODE") ||
      "";
    const merchantPaymentId =
      u.searchParams.get("MERCHANTPAYMENTID") ||
      u.searchParams.get("merchantPaymentId") ||
      null;
    const pgtranid =
      u.searchParams.get("PGTRANID") || u.searchParams.get("pgtranid") || null;
    return await redirectForResponseCode(responseCode, merchantPaymentId, pgtranid);
  } catch (err) {
    console.error("[paratika/callback] GET error:", err);
    return NextResponse.redirect(new URL("/odeme?sonuc=hata", req.url));
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let responseCode = "";
    let merchantPaymentId: string | null = null;
    let pgtranid: string | null = null;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const raw = await req.text();
      const params = new URLSearchParams(raw);
      responseCode =
        params.get("responseCode") ||
        params.get("RESPONSECODE") ||
        "";
      merchantPaymentId =
        params.get("MERCHANTPAYMENTID") ||
        params.get("merchantPaymentId") ||
        null;
      pgtranid = params.get("PGTRANID") || params.get("pgtranid") || null;
    } else {
      const form = await req.formData();
      responseCode =
        String(form.get("responseCode") || form.get("RESPONSECODE") || "");
      const mp =
        form.get("MERCHANTPAYMENTID") || form.get("merchantPaymentId");
      merchantPaymentId = mp != null && String(mp).trim() !== "" ? String(mp) : null;
      const pg =
        form.get("PGTRANID") || form.get("pgtranid");
      pgtranid =
        pg != null && String(pg).trim() !== "" ? String(pg).trim() : null;
    }

    return await redirectForResponseCode(responseCode, merchantPaymentId, pgtranid);
  } catch (err) {
    console.error("[paratika/callback] route error:", err);
    const url = new URL("/odeme?sonuc=hata", req.url);
    return NextResponse.redirect(url);
  }
}
