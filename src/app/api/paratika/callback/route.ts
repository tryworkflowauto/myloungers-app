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

    // Birincil satırı çek — kardeş satır araması için metadata lazım
    const { data: rezRow, error: rezFetchErr } = await supabaseAdmin
      .from("rezervasyonlar")
      .select("id, toplam_tutar, rezervasyon_kodu, kullanici_id, tesis_id, baslangic_tarih, created_at")
      .eq(lookupColumn, lookupValue)
      .maybeSingle();
    if (rezFetchErr) {
      console.error("[paratika/callback] birincil satır çekme:", rezFetchErr);
    }
    if (!rezRow?.id) {
      console.error("[paratika/callback] rezervasyon bulunamadı:", {
        lookupColumn,
        lookupValue,
      });
      return NextResponse.redirect("https://myloungers.com/odeme?sonuc=hata");
    }

    // Aynı satın almadan gelen kardeş satırları bul.
    // goRes() döngüsündeki INSERT'ler birbirinden saniyeler içinde oluşur;
    // ±30 saniyelik pencere tüm kardeş satırları yakalar.
    type HedefRow = { id: string; toplam_tutar: number | null };
    let hedefRows: HedefRow[] = [{ id: String(rezRow.id), toplam_tutar: rezRow.toplam_tutar ?? null }];

    if (rezRow.kullanici_id && rezRow.tesis_id && rezRow.baslangic_tarih && rezRow.created_at) {
      const merkez = new Date(rezRow.created_at as string).getTime();
      const windowStart = new Date(merkez - 30_000).toISOString();
      const windowEnd   = new Date(merkez + 30_000).toISOString();

      const { data: kardesRows, error: kardesErr } = await supabaseAdmin
        .from("rezervasyonlar")
        .select("id, toplam_tutar")
        .eq("kullanici_id", rezRow.kullanici_id)
        .eq("tesis_id", rezRow.tesis_id)
        .eq("baslangic_tarih", rezRow.baslangic_tarih)
        .gte("created_at", windowStart)
        .lte("created_at", windowEnd);

      if (kardesErr) {
        console.error("[paratika/callback] kardeş satır arama hatası:", kardesErr);
      } else if (kardesRows && kardesRows.length > 0) {
        // Birincil satırın zaten listede olduğundan emin ol
        const birincilVarMi = kardesRows.some((r: any) => String(r.id) === String(rezRow.id));
        hedefRows = [
          ...(birincilVarMi ? [] : [{ id: String(rezRow.id), toplam_tutar: rezRow.toplam_tutar ?? null }]),
          ...kardesRows.map((r: any) => ({ id: String(r.id), toplam_tutar: r.toplam_tutar ?? null })),
        ];
      }
    }

    console.log(`[paratika/callback] güncellenecek satır sayısı: ${hedefRows.length}`, hedefRows.map(r => r.id));

    // Her satırı kendi toplam_tutar'ına göre ayrı ayrı güncelle
    const basePayload: Record<string, unknown> = {
      durum: "aktif",
      giris_yapildi: false,
      merchantpaymentid: normalizedMerchantPaymentId,
    };
    if (normalizedPgtranid != null) {
      basePayload.pgtranid = normalizedPgtranid;
    }

    let basariliSayisi = 0;
    for (const hedef of hedefRows) {
      const satırTutar =
        typeof hedef.toplam_tutar === "number"
          ? hedef.toplam_tutar
          : hedef.toplam_tutar != null
            ? Number(hedef.toplam_tutar)
            : NaN;

      const rowPayload = {
        ...basePayload,
        ...(!Number.isNaN(satırTutar)
          ? { bakiye_yuklenen: satırTutar, bakiye_kalan: satırTutar, bakiye_harcanan: 0 }
          : {}),
      };

      const { data: updatedRows, error: updErr } = await supabaseAdmin
        .from("rezervasyonlar")
        .update(rowPayload)
        .eq("id", hedef.id)
        .select("id, durum, pgtranid");

      if (updErr) {
        console.error("[paratika/callback] satır güncelleme hatası:", {
          error: updErr,
          rezervasyonId: hedef.id,
        });
      } else if (updatedRows && updatedRows.length > 0) {
        basariliSayisi++;
        console.log("[paratika/callback] satır güncellendi:", updatedRows[0]);
      } else {
        console.warn("[paratika/callback] update 0 satır döndü:", hedef.id);
      }
    }

    if (basariliSayisi === 0) {
      console.error("[paratika/callback] hiçbir satır güncellenemedi");
      return NextResponse.redirect("https://myloungers.com/odeme?sonuc=hata");
    }
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
