import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/** YYYY-MM-DD in Europe/Istanbul (UTC+3) for calendar-day comparison */
function istanbulDateKey(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

const friendlyParatikaError = (rawErr: string | undefined | null): string => {
  if (!rawErr) return "İade işlemi sırasında bir sorun oluştu. Lütfen daha sonra tekrar deneyin.";
  const lower = rawErr.toLowerCase();
  if (lower.includes("declined")) return "İade işlemi banka tarafından reddedildi. Lütfen tesisle iletişime geçin.";
  if (lower.includes("geçersiz parametre")) return "İade işlemi şu an gerçekleştirilemiyor. Lütfen tesisle iletişime geçin.";
  if (lower.includes("timeout") || lower.includes("zaman aşımı")) return "Banka yanıt vermedi, lütfen birkaç dakika sonra tekrar deneyin.";
  if (lower.includes("not found") || lower.includes("bulunamadı")) return "Bu rezervasyona ait ödeme kaydı bulunamadı. Lütfen tesisle iletişime geçin.";
  return rawErr;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rezervasyonId = body.rezervasyonId;

    if (rezervasyonId == null || rezervasyonId === "") {
      return NextResponse.json({ error: "rezervasyonId gerekli" }, { status: 400 });
    }

    const { data: row, error: fetchError } = await supabaseAdmin
      .from("rezervasyonlar")
      .select("pgtranid, toplam_tutar, created_at, merchantpaymentid, tesis_id, baslangic_tarih")
      .eq("id", rezervasyonId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    if (!row) {
      return NextResponse.json({ error: "Rezervasyon bulunamadı" }, { status: 404 });
    }

    // İptal süresi kontrolü — tesisin politikası
    const { data: tesisData, error: tesisError } = await supabaseAdmin
      .from("tesisler")
      .select("iptal_saat_oncesi, iptal_politikasi, calisma_saatleri")
      .eq("id", row.tesis_id)
      .single();

    if (tesisError || !tesisData) {
      return NextResponse.json(
        { error: "Tesis bilgisi alınamadı" },
        { status: 400 }
      );
    }

    const iptalSaatOncesi = typeof tesisData.iptal_saat_oncesi === "number"
      ? tesisData.iptal_saat_oncesi
      : 24;

    // İade yok politikası
    if (iptalSaatOncesi >= 999999) {
      return NextResponse.json(
        { error: "Bu tesis iptal/iade kabul etmiyor. Lütfen tesis ile iletişime geçin." },
        { status: 400 }
      );
    }

    // Rezervasyon başlangıcına kalan saat hesapla
    // Rezervasyon gününü Türkçe kısa adıyla bul (Pzt, Sal, Çar, Per, Cum, Cmt, Paz)
    const TR_DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
    const baslangicDate = new Date(`${row.baslangic_tarih}T00:00:00+03:00`);
    const dayIndex = baslangicDate.getDay(); // 0=Pazar, 1=Pzt, ...
    const dayName = TR_DAYS[dayIndex];

    // Tesisin o günkü çalışma saatlerini bul
    let calismaSaatleri: any[] = [];
    try {
      const raw = (tesisData as any).calisma_saatleri;
      calismaSaatleri = Array.isArray(raw) ? raw : (typeof raw === "string" ? JSON.parse(raw) : []);
    } catch {
      calismaSaatleri = [];
    }

    const gunData = calismaSaatleri.find((g: any) => g?.name === dayName);

    // Eğer tesis o gün kapalıysa → iptal yapılamaz
    if (gunData && gunData.kapali === true) {
      return NextResponse.json(
        { error: "Bu rezervasyon günü tesis kapalı, iptal işlemi için lütfen tesisle iletişime geçin." },
        { status: 400 }
      );
    }

    // Açılış saatini al (yoksa fallback 09:00)
    const acilisStr = (gunData?.acilis && /^\d{1,2}:\d{2}$/.test(gunData.acilis))
      ? gunData.acilis
      : "09:00";

    // Tam datetime oluştur (Türkiye saati explicit, +03:00)
    const rezervasyonBaslangicDT = new Date(`${row.baslangic_tarih}T${acilisStr}:00+03:00`);

    const simdi = new Date();
    const kalanMs = rezervasyonBaslangicDT.getTime() - simdi.getTime();
    const kalanSaat = kalanMs / (1000 * 60 * 60);

    // Süre dolmuşsa iptal reddet
    if (kalanSaat < iptalSaatOncesi) {
      return NextResponse.json(
        {
          error: `İptal süresi geçmiş. Bu tesisin politikası: rezervasyon başlangıcından en az ${iptalSaatOncesi} saat önce iptal edilmelidir. Şu an rezervasyon başlangıcına ${Math.max(0, Math.floor(kalanSaat))} saat kaldı.`,
          kalanSaat: Math.max(0, Math.floor(kalanSaat)),
          gerekenSaat: iptalSaatOncesi,
        },
        { status: 400 }
      );
    }

    const pgtranid = row.pgtranid;
    if (pgtranid == null || String(pgtranid).trim() === "") {
      return NextResponse.json({ error: "pgtranid bulunamadı" }, { status: 400 });
    }

    const merchantPassword = process.env.PARATIKA_PASSWORD;
    if (!merchantPassword) {
      return NextResponse.json({ error: "PARATIKA_PASSWORD tanımlı değil" }, { status: 500 });
    }

    const createdAt = row.created_at as string | null | undefined;
    const sameDay =
      createdAt != null &&
      istanbulDateKey(createdAt) === istanbulDateKey(new Date());

    const params = new URLSearchParams();
    if (sameDay) {
      params.append("ACTION", "VOID");
    } else {
      params.append("ACTION", "REFUND");
    }
    params.append("MERCHANTUSER", "myloungers.info@gmail.com");
    params.append("MERCHANTPASSWORD", merchantPassword);
    params.append("MERCHANT", "10008941");
    params.append("PGTRANID", String(pgtranid).trim());
    if (!sameDay) {
      const refundAmount = parseFloat(String(row.toplam_tutar || 0)).toFixed(2);
      params.append("AMOUNT", refundAmount);
      params.append("CURRENCY", "TRY");
      params.append(
        "ORDERITEMS",
        JSON.stringify([{ productCode: (row.merchantpaymentid || rezervasyonId), quantity: "1", amount: refundAmount }])
      );
    }

    const paratResponse = await fetch("https://vpos.paratika.com.tr/paratika/api/v2", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const rawText = await paratResponse.text();
    console.log("[refund] paratika response:", rawText);
    let responseCode = "";
    let pgTranReturnCode = "";
    let errMsg = "İade başarısız";
    try {
      const json = JSON.parse(rawText);
      responseCode = json.responseCode || "";
      pgTranReturnCode = json.pgTranReturnCode || "";
      errMsg = friendlyParatikaError(json.errorMsg || json.message);
    } catch {
      const parsed = new URLSearchParams(rawText);
      responseCode = parsed.get("responseCode") || "";
      pgTranReturnCode = parsed.get("pgTranReturnCode") || "";
      errMsg = friendlyParatikaError(parsed.get("errorMsg") || parsed.get("message"));
    }
    if (responseCode === "00" || pgTranReturnCode === "00") {
      const { error: updateError } = await supabaseAdmin
        .from("rezervasyonlar")
        .update({ durum: "iptal" })
        .eq("id", rezervasyonId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: errMsg, raw: rawText },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sunucu hatası";
    console.error("[paratika/refund]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
