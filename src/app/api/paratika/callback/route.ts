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
    const { data: rezRow, error: rezFetchErr } = await supabaseAdmin
      .from("rezervasyonlar")
      .select("toplam_tutar")
      .eq("id", merchantPaymentId)
      .maybeSingle();
    if (rezFetchErr) {
      console.error("[paratika/callback] toplam_tutar çekme:", rezFetchErr);
    }
    const rawTt = rezRow?.toplam_tutar;
    const toplamTutar =
      typeof rawTt === "number"
        ? rawTt
        : rawTt != null
          ? Number(rawTt)
          : NaN;

    const updatePayload: {
      durum: string;
      pgtranid?: string;
      bakiye_yuklenen?: number;
      bakiye_kalan?: number;
      bakiye_harcanan?: number;
    } = { durum: "bekliyor" };
    if (pgtranid != null && String(pgtranid).trim() !== "") {
      updatePayload.pgtranid = String(pgtranid).trim();
    }
    if (!Number.isNaN(toplamTutar)) {
      updatePayload.bakiye_yuklenen = toplamTutar;
      updatePayload.bakiye_kalan = toplamTutar;
      updatePayload.bakiye_harcanan = 0;
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
    console.log("[callback GET]", Object.fromEntries(u.searchParams));
    const responseCode =
      u.searchParams.get("responseCode") ||
      u.searchParams.get("RESPONSECODE") ||
      "";
    const merchantPaymentId =
      u.searchParams.get("MERCHANTPAYMENTID") ||
      u.searchParams.get("merchantPaymentId") ||
      null;
    const pgtranid =
      u.searchParams.get("pgTranId") ||
      u.searchParams.get("PGTRANID") ||
      u.searchParams.get("pgtranid") ||
      null;
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
      console.log("[callback POST]", Object.fromEntries(params));
      responseCode =
        params.get("responseCode") ||
        params.get("RESPONSECODE") ||
        "";
      merchantPaymentId =
        params.get("MERCHANTPAYMENTID") ||
        params.get("merchantPaymentId") ||
        null;
      pgtranid =
        params.get("pgTranId") ||
        params.get("PGTRANID") ||
        params.get("pgtranid") ||
        null;
    } else {
      const form = await req.formData();
      console.log("[callback POST]", Object.fromEntries(form));
      responseCode =
        String(form.get("responseCode") || form.get("RESPONSECODE") || "");
      const mp =
        form.get("MERCHANTPAYMENTID") || form.get("merchantPaymentId");
      merchantPaymentId = mp != null && String(mp).trim() !== "" ? String(mp) : null;
      const pg =
        form.get("pgTranId") ||
        form.get("PGTRANID") ||
        form.get("pgtranid");
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
