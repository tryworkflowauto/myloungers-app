"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type KategoriRow = { id: string; ad: string; icon: string | null };
type UrunRow = {
  id: string;
  kategori_id: string;
  ad: string;
  aciklama: string | null;
  fiyat: number | string;
  gorsel_url: string | null;
  icon: string | null;
};

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function fmtTl(v: number): string {
  return `₺${v.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function SiparisPage() {
  const params = useParams<{ rezervasyon_id: string | string[] }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rezervasyonIdRaw = params?.rezervasyon_id;
  const rezervasyonId = Array.isArray(rezervasyonIdRaw)
    ? rezervasyonIdRaw[0]
    : rezervasyonIdRaw;
  const tesisId = searchParams.get("tesis_id");

  const [yukleniyor, setYukleniyor] = useState(true);
  const [tesisAd, setTesisAd] = useState("");
  const [bakiyeKalan, setBakiyeKalan] = useState(0);
  const [bakiyeYuklenen, setBakiyeYuklenen] = useState(0);
  const [bakiyeHarcanan, setBakiyeHarcanan] = useState(0);
  const [kategoriler, setKategoriler] = useState<KategoriRow[]>([]);
  const [urunler, setUrunler] = useState<UrunRow[]>([]);
  const [seciliKategori, setSeciliKategori] = useState("tumü");
  const [sepet, setSepet] = useState<Record<string, number>>({});
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    async function loadData() {
      if (!rezervasyonId || !tesisId) {
        showToast("Rezervasyon veya tesis bilgisi eksik.", "error");
        setYukleniyor(false);
        return;
      }

      setYukleniyor(true);
      try {
        const [rezRes, katRes, urunRes, tesisRes] = await Promise.all([
          supabase
            .from("rezervasyonlar")
            .select("bakiye_kalan, bakiye_yuklenen, bakiye_harcanan")
            .eq("id", rezervasyonId)
            .maybeSingle(),
          supabase
            .from("menu_kategorileri")
            .select("id, ad, icon")
            .eq("tesis_id", tesisId)
            .order("sira", { ascending: true }),
          supabase
            .from("menu_urunleri")
            .select("id, kategori_id, ad, aciklama, fiyat, gorsel_url, icon, badges")
            .eq("tesis_id", tesisId)
            .order("sira", { ascending: true }),
          supabase.from("tesisler").select("ad").eq("id", tesisId).maybeSingle(),
        ]);

        if (rezRes.error) throw rezRes.error;
        if (katRes.error) throw katRes.error;
        if (urunRes.error) throw urunRes.error;
        if (tesisRes.error) throw tesisRes.error;

        setBakiyeKalan(num((rezRes.data as any)?.bakiye_kalan));
        setBakiyeYuklenen(num((rezRes.data as any)?.bakiye_yuklenen));
        setBakiyeHarcanan(num((rezRes.data as any)?.bakiye_harcanan));
        setKategoriler((katRes.data ?? []) as KategoriRow[]);
        setUrunler((urunRes.data ?? []) as UrunRow[]);
        setTesisAd((tesisRes.data as any)?.ad || "Tesis Menusu");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Veriler yuklenemedi.";
        showToast(msg, "error");
      } finally {
        setYukleniyor(false);
      }
    }

    loadData();
  }, [rezervasyonId, tesisId]);

  const urunlerFiltreli = useMemo(() => {
    if (seciliKategori === "tumü") return urunler;
    return urunler.filter((u) => String(u.kategori_id) === String(seciliKategori));
  }, [urunler, seciliKategori]);

  const sepetToplam = useMemo(() => {
    return Object.entries(sepet).reduce((sum, [urunId, adet]) => {
      const urun = urunler.find((u) => String(u.id) === String(urunId));
      if (!urun) return sum;
      return sum + num(urun.fiyat) * adet;
    }, 0);
  }, [sepet, urunler]);

  const sepetAdetToplam = useMemo(() => {
    return Object.values(sepet).reduce((sum, adet) => sum + adet, 0);
  }, [sepet]);

  function adetAzalt(urunId: string) {
    setSepet((prev) => {
      const cur = prev[urunId] || 0;
      if (cur <= 1) {
        const { [urunId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [urunId]: cur - 1 };
    });
  }

  function adetArttir(urunId: string) {
    setSepet((prev) => ({ ...prev, [urunId]: (prev[urunId] || 0) + 1 }));
  }

  async function handleSiparisVer() {
    if (!rezervasyonId || !tesisId) {
      showToast("Eksik parametre.", "error");
      return;
    }
    if (sepetAdetToplam <= 0) {
      showToast("Sepetiniz bos.", "error");
      return;
    }
    if (sepetToplam > bakiyeKalan) {
      showToast("Harcama limitiniz yetersiz!", "error");
      return;
    }

    setGonderiliyor(true);
    try {
      const { data: rezRow, error: rezErr } = await supabase
        .from("rezervasyonlar")
        .select("id, tesis_id, sezlong_id, sezlong_ids, musteri_adi, bakiye_harcanan, bakiye_kalan")
        .eq("id", rezervasyonId)
        .maybeSingle();

      if (rezErr || !rezRow) {
        throw rezErr || new Error("Rezervasyon bulunamadi.");
      }

      const sezlongId =
        (rezRow as any).sezlong_id ??
        (Array.isArray((rezRow as any).sezlong_ids) ? (rezRow as any).sezlong_ids[0] : null);

      let sezlongNo = "-";
      if (sezlongId) {
        const { data: sezData, error: sezErr } = await supabase
          .from("sezlonglar")
          .select("numara, grup:sezlong_gruplari(ad)")
          .eq("id", sezlongId)
          .maybeSingle();
        if (sezErr) throw sezErr;
        if (sezData) {
          const grupAd = (sezData as any)?.grup?.ad ?? "";
          const numara = (sezData as any)?.numara ?? "";
          if (grupAd && numara !== "") {
            sezlongNo = `${String(grupAd).charAt(0).toUpperCase()}${numara}`;
          } else if (numara !== "") {
            sezlongNo = String(numara);
          }
        }
      }

      const musteriAdi = (rezRow as any).musteri_adi || "Misafir";
      const hedefTesisId = tesisId || String((rezRow as any).tesis_id || "");

      const { data: siparisData, error: siparisErr } = await supabase
        .from("siparisler")
        .insert({
          tesis_id: hedefTesisId,
          rezervasyon_id: rezervasyonId,
          durum: "bekliyor",
          toplam: sepetToplam,
          sezlong_no: sezlongNo,
          musteri_adi: musteriAdi,
        })
        .select("id")
        .single();

      if (siparisErr || !siparisData?.id) {
        throw siparisErr || new Error("Siparis olusturulamadi.");
      }

      const kalemler = Object.entries(sepet)
        .filter(([, adet]) => adet > 0)
        .map(([urunId, adet]) => {
          const urun = urunler.find((u) => String(u.id) === String(urunId));
          if (!urun) return null;
          return {
            siparis_id: siparisData.id,
            urun_id: urun.id,
            ad: urun.ad,
            fiyat: num(urun.fiyat),
            adet,
          };
        })
        .filter(Boolean);

      if (kalemler.length > 0) {
        const { error: kalemErr } = await supabase
          .from("siparis_kalemleri")
          .insert(kalemler as any[]);
        if (kalemErr) throw kalemErr;
      }

      const yeniHarcanan = num((rezRow as any).bakiye_harcanan) + sepetToplam;
      const yeniKalan = Math.max(0, num((rezRow as any).bakiye_kalan) - sepetToplam);

      const { error: rezUpdateErr } = await supabase
        .from("rezervasyonlar")
        .update({
          bakiye_harcanan: yeniHarcanan,
          bakiye_kalan: yeniKalan,
        })
        .eq("id", rezervasyonId);

      if (rezUpdateErr) throw rezUpdateErr;

      setBakiyeHarcanan(yeniHarcanan);
      setBakiyeKalan(yeniKalan);
      setSepet({});
      showToast("Siparisiniz alindi.", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Siparis verilemedi.";
      showToast(msg, "error");
    } finally {
      setGonderiliyor(false);
    }
  }

  if (yukleniyor) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8FAFC",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "4px solid #CFF7F5",
            borderTopColor: "#0ABAB5",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", paddingBottom: sepetAdetToplam > 0 ? 92 : 16 }}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.type === "success" ? "#16A34A" : "#DC2626",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: 12,
            fontSize: ".85rem",
            fontWeight: 700,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      <div style={{ maxWidth: 600, margin: "0 auto", padding: 12 }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "#0ABAB5",
            color: "#fff",
            borderRadius: 14,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 8px 20px rgba(10,186,181,0.28)",
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "#fff",
              width: 34,
              height: 34,
              borderRadius: 10,
              cursor: "pointer",
              fontSize: ".9rem",
              fontWeight: 800,
            }}
          >
            ←
          </button>
          <div style={{ flex: 1, fontSize: ".92rem", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {tesisAd || "Siparis"}
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.17)",
              border: "1px solid rgba(255,255,255,0.28)",
              borderRadius: 999,
              padding: "5px 10px",
              textAlign: "right",
              minWidth: 122,
            }}
          >
            <div style={{ fontSize: ".88rem", fontWeight: 900, lineHeight: 1.1 }}>{fmtTl(bakiyeKalan)}</div>
            <div style={{ fontSize: ".62rem", opacity: 0.9 }}>Limit: {fmtTl(bakiyeYuklenen)}</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          <button
            type="button"
            onClick={() => setSeciliKategori("tumü")}
            style={{
              flexShrink: 0,
              border: "none",
              borderRadius: 999,
              padding: "8px 14px",
              background: seciliKategori === "tumü" ? "#0ABAB5" : "#f1f5f9",
              color: seciliKategori === "tumü" ? "#fff" : "#475569",
              fontSize: ".78rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Tumu
          </button>
          {kategoriler.map((kat) => (
            <button
              key={kat.id}
              type="button"
              onClick={() => setSeciliKategori(kat.id)}
              style={{
                flexShrink: 0,
                border: "none",
                borderRadius: 999,
                padding: "8px 14px",
                background: seciliKategori === kat.id ? "#0ABAB5" : "#f1f5f9",
                color: seciliKategori === kat.id ? "#fff" : "#475569",
                fontSize: ".78rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {(kat.icon || "🍽️") + " " + kat.ad}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          {urunlerFiltreli.map((urun) => {
            const adet = sepet[urun.id] || 0;
            return (
              <div
                key={urun.id}
                style={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  padding: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {urun.gorsel_url ? (
                  <img
                    src={urun.gorsel_url}
                    alt={urun.ad}
                    style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 10,
                      background: "#f1f5f9",
                      color: "#475569",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.4rem",
                      flexShrink: 0,
                    }}
                  >
                    {urun.icon || "🍽️"}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: ".85rem", color: "var(--navy, #0A1628)" }}>
                    {urun.ad}
                  </div>
                  {urun.aciklama && (
                    <div style={{ fontSize: ".74rem", color: "#6B7280", marginTop: 2 }}>
                      {urun.aciklama}
                    </div>
                  )}
                  <div style={{ fontWeight: 900, color: "#0ABAB5", marginTop: 4, fontSize: ".86rem" }}>
                    {fmtTl(num(urun.fiyat))}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => adetAzalt(urun.id)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: "none",
                      background: "#f1f5f9",
                      cursor: "pointer",
                      fontWeight: 800,
                    }}
                  >
                    −
                  </button>
                  <div style={{ minWidth: 16, textAlign: "center", fontWeight: 800, fontSize: ".82rem" }}>{adet}</div>
                  <button
                    type="button"
                    onClick={() => adetArttir(urun.id)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: "none",
                      background: "#f1f5f9",
                      cursor: "pointer",
                      fontWeight: 800,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {urunlerFiltreli.length === 0 && (
          <div
            style={{
              marginTop: 16,
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              padding: 18,
              textAlign: "center",
              color: "#6B7280",
              fontSize: ".82rem",
            }}
          >
            Bu kategoride urun bulunamadi.
            <div style={{ marginTop: 8 }}>
              <Link href="/profil" style={{ color: "#0ABAB5", textDecoration: "none", fontWeight: 700 }}>
                Profile Don
              </Link>
            </div>
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: ".73rem", color: "#64748B", textAlign: "right" }}>
          Harcanan: {fmtTl(bakiyeHarcanan)}
        </div>
      </div>

      {sepetAdetToplam > 0 && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 0,
            width: "100%",
            maxWidth: 600,
            background: "#0A1628",
            color: "#fff",
            padding: "12px 14px calc(12px + env(safe-area-inset-bottom))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            boxShadow: "0 -6px 24px rgba(0,0,0,.24)",
          }}
        >
          <div>
            <div style={{ fontSize: ".7rem", opacity: 0.8 }}>{sepetAdetToplam} urun</div>
            <div style={{ fontSize: "1rem", fontWeight: 900 }}>{fmtTl(sepetToplam)}</div>
          </div>
          <button
            type="button"
            onClick={handleSiparisVer}
            disabled={gonderiliyor}
            style={{
              border: "none",
              background: "#0ABAB5",
              color: "#fff",
              borderRadius: 10,
              padding: "10px 18px",
              fontWeight: 800,
              fontSize: ".85rem",
              cursor: gonderiliyor ? "not-allowed" : "pointer",
              opacity: gonderiliyor ? 0.75 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {gonderiliyor ? "Gonderiliyor..." : "Siparis Ver"}
          </button>
        </div>
      )}
    </div>
  );
}

