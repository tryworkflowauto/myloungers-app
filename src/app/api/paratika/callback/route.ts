import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

async function redirectForResponseCode(
  responseCode: string,
  merchantPaymentId: string | null,
  pgtranid: string | null
) {
  const ok = responseCode === "00";
  const normalizedMerchantPaymentId =
    merchantPaymentId != null && String(merchantPaymentId).trim() !== ""
      ? String(merchantPaymentId).trim()
      : null;
  const normalizedPgtranid =
    pgtranid != null && String(pgtranid).trim() !== "" ? String(pgtranid).trim() : null;
  console.log("[paratika/callback] parsed:", {
    responseCode,
    ok,
    merchantPaymentId: normalizedMerchantPaymentId,
    pgtranid: normalizedPgtranid,
  });

  if (ok && normalizedMerchantPaymentId) {
    const lookupColumn =
      normalizedMerchantPaymentId && isUuid(normalizedMerchantPaymentId)
        ? "id"
        : "rezervasyon_kodu";
    const lookupValue = normalizedMerchantPaymentId!;
    const { data: rezRow, error: rezFetchErr } = await supabaseAdmin
      .from("rezervasyonlar")
      .select("id, toplam_tutar, rezervasyon_kodu")
      .eq(lookupColumn, lookupValue)
      .maybeSingle();
    if (rezFetchErr) {
      console.error("[paratika/callback] toplam_tutar çekme:", rezFetchErr);
    }
    if (!rezRow?.id) {
      console.error("[paratika/callback] rezervasyon bulunamadı:", {
        lookupColumn,
        lookupValue,
      });
      return NextResponse.redirect("https://myloungers.com/odeme?sonuc=hata");
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
      giris_yapildi?: boolean;
      bakiye_yuklenen?: number;
      bakiye_kalan?: number;
      bakiye_harcanan?: number;
      merchantpaymentid?: string;
    } = { durum: "aktif" };
    updatePayload.giris_yapildi = false;
    updatePayload.merchantpaymentid = normalizedMerchantPaymentId;
    if (normalizedPgtranid != null) {
      updatePayload.pgtranid = normalizedPgtranid;
    }
    if (!Number.isNaN(toplamTutar)) {
      updatePayload.bakiye_yuklenen = toplamTutar;
      updatePayload.bakiye_kalan = toplamTutar;
      updatePayload.bakiye_harcanan = 0;
    }
    const { data: updatedRows, error } = await supabaseAdmin
      .from("rezervasyonlar")
      .update(updatePayload)
      .eq("id", rezRow.id)
      .select("id, durum, pgtranid");
    if (error) {
      console.error("[paratika/callback] rezervasyon güncelleme:", {
        error,
        rezervasyonId: rezRow.id,
        updatePayload,
      });
      return NextResponse.redirect("https://myloungers.com/odeme?sonuc=hata");
    }
    if (!updatedRows || updatedRows.length === 0) {
      console.error("[paratika/callback] update 0 satır döndü:", {
        rezervasyonId: rezRow.id,
        updatePayload,
      });
      return NextResponse.redirect("https://myloungers.com/odeme?sonuc=hata");
    }
    console.log("[paratika/callback] update success:", updatedRows[0]);
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
