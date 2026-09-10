require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const JUNIOR = "cbfc29b1-1506-446d-a41e-ec81c8501e39";
const MEIN = "6c21ff27-1be3-4d82-abd2-4cb675fc9f9e";
const GROUP_IDS = [
  "727267f6-b0db-4802-bace-be60e7a7825a",
  "266fa495-5df7-4cbf-b172-1174ffa12b24",
  "f39cbfb8-e837-4f55-aa7c-0ecac9353a48",
];

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

(async () => {
  const probe = await sb
    .from("sezlong_gruplari")
    .select("id, tum_tekne_sabit_fiyat")
    .limit(1);
  if (probe.error) {
    console.log("PROBE_ERROR", probe.error.message, probe.error.code);
    process.exit(1);
  }

  const upJunior = await sb
    .from("sezlong_gruplari")
    .update({ tum_tekne_sabit_fiyat: true })
    .eq("tesis_id", JUNIOR)
    .in("id", GROUP_IDS)
    .select("id, ad, tesis_id, tum_tekne_sabit_fiyat");
  const upMein = await sb
    .from("sezlong_gruplari")
    .update({ tum_tekne_sabit_fiyat: true })
    .eq("tesis_id", MEIN)
    .in("id", GROUP_IDS)
    .select("id, ad, tesis_id, tum_tekne_sabit_fiyat");

  console.log("UPDATED_JUNIOR", JSON.stringify(upJunior.data), upJunior.error);
  console.log("UPDATED_MEIN", JSON.stringify(upMein.data), upMein.error);

  const verify = await sb
    .from("sezlong_gruplari")
    .select("id, tesis_id, ad, tum_tekne_sabit_fiyat, fiyat")
    .in("tesis_id", [
      JUNIOR,
      MEIN,
      "84e54370-1158-4666-b412-0897bf947e3c",
      "7005ea90-68df-4ddd-873b-a10827c966f4",
      "070a0d29-0778-424b-8728-5cea72345ffa",
      "5f330270-b3c6-4503-ad45-a9cc0c81e925",
    ]);
  const trueCount = (verify.data || []).filter((r) => r.tum_tekne_sabit_fiyat === true);
  const falseCount = (verify.data || []).filter((r) => r.tum_tekne_sabit_fiyat !== true);
  console.log("TRUE_ROWS", JSON.stringify(trueCount, null, 2));
  console.log("FALSE_OTHER_TEKNE", JSON.stringify(falseCount.map((r) => ({ ad: r.ad, tesis_id: r.tesis_id, flag: r.tum_tekne_sabit_fiyat })), null, 2));
  console.log("VERIFY_ERR", verify.error);
})();
