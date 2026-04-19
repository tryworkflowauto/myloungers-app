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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rezervasyonId = body.rezervasyonId;

    if (rezervasyonId == null || rezervasyonId === "") {
      return NextResponse.json({ error: "rezervasyonId gerekli" }, { status: 400 });
    }

    const { data: row, error: fetchError } = await supabaseAdmin
      .from("rezervasyonlar")
      .select("pgtranid, toplam_tutar, created_at, merchantpaymentid")
      .eq("id", rezervasyonId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    if (!row) {
      return NextResponse.json({ error: "Rezervasyon bulunamadı" }, { status: 404 });
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
      params.append("CURRENCY", "TRY");
      params.append(
        "ORDERITEMS",
        JSON.stringify([{ productCode: (row.merchantpaymentid || rezervasyonId), quantity: "1" }])
      );
    }

    const paratResponse = await fetch("https://vpos.paratika.com.tr/paratika/api/v2", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const rawText = await paratResponse.text();
    console.log("[refund] paratika response:", rawText);
    const parsed = new URLSearchParams(rawText);

    if (parsed.get("responseCode") === "00" || parsed.get("pgTranReturnCode") === "00") {
      const { error: updateError } = await supabaseAdmin
        .from("rezervasyonlar")
        .update({ durum: "iptal" })
        .eq("id", rezervasyonId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    const errMsg =
      parsed.get("errorMsg") ||
      parsed.get("message") ||
      "İade başarısız";
    return NextResponse.json(
      { error: errMsg, raw: Object.fromEntries(parsed) },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sunucu hatası";
    console.error("[paratika/refund]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
