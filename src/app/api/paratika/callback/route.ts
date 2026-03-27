import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let responseCode = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const raw = await req.text();
      const params = new URLSearchParams(raw);
      responseCode =
        params.get("responseCode") ||
        params.get("RESPONSECODE") ||
        "";
    } else {
      const form = await req.formData();
      responseCode =
        String(form.get("responseCode") || form.get("RESPONSECODE") || "");
    }

    const ok = responseCode === "00";
    const url = new URL(ok ? "/odeme?sonuc=basarili" : "/odeme?sonuc=hata", req.url);
    return NextResponse.redirect(url);
  } catch (err) {
    console.error("[paratika/callback] route error:", err);
    const url = new URL("/odeme?sonuc=hata", req.url);
    return NextResponse.redirect(url);
  }
}
