import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      orderId,
      customerName,
      customerSurname,
      customerEmail,
      customerPhone,
    } = body ?? {};

    const payload = new URLSearchParams({
      ACTION: "GETSESSIONTOKEN",
      MERCHANT: "10004201",
      MERCHANTUSER: "mail@bgs.io",
      MERCHANTPASSWORD: "*ReklamotvReklamotv321",
      ORDERID: String(orderId ?? ""),
      AMOUNT: String(amount ?? 0),
      CURRENCY: "TRY",
      CUSTOMERNAME: String(customerName ?? ""),
      CUSTOMERSURNAME: String(customerSurname ?? ""),
      CUSTOMEREMAIL: String(customerEmail ?? ""),
      CUSTOMERPHONE: String(customerPhone ?? ""),
      RETURNURL: "https://myloungers.com/api/paratika/callback",
    });

    const res = await fetch("https://entegrasyon.paratika.com.tr/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
      cache: "no-store",
    });

    const raw = await res.text();
    const parsed = new URLSearchParams(raw);
    const sessionToken = parsed.get("SESSIONTOKEN") || parsed.get("SESSION_TOKEN");

    if (!res.ok || !sessionToken) {
      console.error("[paratika/session] session token error:", raw);
      return NextResponse.json(
        { error: "SESSION_TOKEN alınamadı", raw },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessionToken });
  } catch (err) {
    console.error("[paratika/session] route error:", err);
    return NextResponse.json(
      { error: "Beklenmeyen hata" },
      { status: 500 }
    );
  }
}
