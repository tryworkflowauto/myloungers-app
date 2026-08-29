/**
 * Tek seferlik: Magi Spa Güllük Auth + kullanicilar e-posta güncellemesi.
 * Çalıştır: node scripts/email-guncelle.mjs
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
const USER_ID = "2fa1c207-5d52-46ed-976b-8d9887131924";
const NEW_EMAIL = "spagulluk@gmail.com";

if (!url || !serviceKey || serviceKey === "BURAYA_YAPIŞTIRACAĞIM_KEY") {
  console.error("HATA: NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY .env.local içinde yok / placeholder.");
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.updateUserById(
  USER_ID,
  { email: NEW_EMAIL, email_confirm: true }
);

if (authErr) {
  console.error("Auth updateUserById HATA:", authErr.message);
  console.error(authErr);
  process.exit(1);
}

console.log("Auth güncellendi:", {
  id: authData?.user?.id,
  email: authData?.user?.email,
});

const { data: row, error: dbErr } = await supabaseAdmin
  .from("kullanicilar")
  .update({ email: NEW_EMAIL })
  .eq("id", USER_ID)
  .select("id, email, rol, tesis_id")
  .maybeSingle();

if (dbErr) {
  console.error("kullanicilar update HATA:", dbErr.message);
  console.error(dbErr);
  process.exit(1);
}

console.log("kullanicilar güncellendi:", row);
console.log("Tamam.");
