import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/constants";

export default async function IndirPage() {
  const headersList = await headers();
  const userAgent = (headersList.get("user-agent") ?? "").toLowerCase();

  if (
    userAgent.includes("iphone") ||
    userAgent.includes("ipad") ||
    userAgent.includes("ipod")
  ) {
    redirect(APP_STORE_URL);
  }

  if (userAgent.includes("android")) {
    redirect(GOOGLE_PLAY_URL);
  }

  redirect("/");
}
