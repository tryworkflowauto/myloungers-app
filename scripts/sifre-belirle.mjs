/**
 * Tek seferlik: Spa Güllük (spagulluk@gmail.com) Auth şifresini set eder + e-postayı onaylar.
 * Çalıştır: node scripts/sifre-belirle.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#") || !t.includes("=")) continue;
  const i = t.indexOf("=");
  const k = t.slice(0, i).trim();
  let v = t.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  env[k] = v;
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const USER_ID = "b1c76889-7d50-48f3-b97b-0e4331e9f3cb";
const PASSWORD = "MyL2026beach";

if (!url || !serviceKey || serviceKey === "BURAYA_YAPIŞTIRACAĞIM_KEY") {
  console.error("HATA: NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY .env.local içinde yok / placeholder.");
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabaseAdmin.auth.admin.updateUserById(USER_ID, {
  password: PASSWORD,
  email_confirm: true,
});

console.log({ data, error });

if (error) {
  console.error("updateUserById HATA:", error.message);
  process.exit(1);
}

console.log("BASARILI:", data?.user?.email ?? USER_ID, "sifresi set edildi, email_confirm=true");
