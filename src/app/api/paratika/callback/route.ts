import { NextResponse } from "next/server";

function redirectForResponseCode(req: Request, responseCode: string) {
  const ok = responseCode === "00";
  const path = ok ? "/profil" : "/odeme?sonuc=hata";
  return NextResponse.redirect(new URL(path, req.url));
}

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const responseCode =
      u.searchParams.get("responseCode") ||
      u.searchParams.get("RESPONSECODE") ||
      "";
    return redirectForResponseCode(req, responseCode);
  } catch (err) {
    console.error("[paratika/callback] GET error:", err);
    return NextResponse.redirect(new URL("/odeme?sonuc=hata", req.url));
  }
}

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

    return redirectForResponseCode(req, responseCode);
  } catch (err) {
    console.error("[paratika/callback] route error:", err);
    const url = new URL("/odeme?sonuc=hata", req.url);
    return NextResponse.redirect(url);
  }
}
