"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { SIPARIS_DURUM } from "@/lib/constants";
import CallWaiterModal from "@/components/CallWaiterModal";

type Reservation = {
  id: number;
  tesisId?: string;
  sezlongId?: string;
  name: string;
  cat: string;
  loc: string;
  code: string;
  dates: string;
  tarihBaslangic?: string;
  tarihBitis?: string;
  durum?: string;
  szl: string;
  gun: string;
  odenen: string;
  bakiyeYuklenen?: number;
  bakiyeKalan?: number;
  status: string;
  statusTxt: string;
  statusCss: string;
  img: string;
  slug?: string;
  girisYapildi?: boolean;
  stars?: number;
  review?: boolean;
  iptalSaatOncesi?: number;
  calismaSaatleri?: any;
};

type UserReview = {
  id: number;
  yorum: string;
  puan: number;
  durum: string;
  created_at: string;
  tesis: { ad: string } | { ad: string }[] | null;
};

type MusteriSiparis = {
  id: string;
  durumKey: string;
  tesisAd: string;
  createdAt: Date;
  sureDakika: number;
  urunler: { isim: string; adet: number; fiyat: number }[];
  toplam: number;
  rezervasyonId: string;
};

type FavoriteItem = {
  id: number;
  tesis: {
    id: number;
    ad: string;
    slug: string;
    fotograflar: any;
    kategori?: unknown;
    ilce?: string;
    sehir?: string;
    puan?: number;
    yorum_sayisi?: number;
    gunluk_fiyat?: number;
    baslangic_fiyat?: number;
    min_fiyat?: number;
    fiyat?: number;
    sezlong_fiyat?: number;
    aktif?: boolean;
  } | null;
};

type AktifCagriDurum = {
  id: string;
  createdAt: string;
  yanitTarihi: string | null;
  yanitSuresi: number | null;
  varisTarihi: string | null;
  varisSuresi: number | null;
};

function formatSure(saniye: number): string {
  const dk = Math.floor(saniye / 60);
  const sn = saniye % 60;
  if (dk === 0) return `${sn} sn`;
  if (sn === 0) return `${dk} dk`;
  return `${dk} dk ${sn} sn`;
}

function formatZamanOnce(createdAt: Date | string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const dk = Math.floor(diff / 60000);
  const sa = Math.floor(dk / 60);
  if (sa > 0) return `${sa} sa önce`;
  if (dk > 0) return `${dk} dk önce`;
  return "Az önce";
}

const STATUS_META: Record<
  "upcoming" | "active" | "past" | "cancel",
  { txt: string; css: string }
> = {
  upcoming: {
    txt: "📅 Yaklaşan",
    css: "background:#EFF6FF;color:#2563EB;border-color:#BFDBFE",
  },
  active: {
    txt: "✅ Aktif",
    css: "background:#F0FDF4;color:#16A34A;border-color:#BBF7D0",
  },
  past: {
    txt: "✓ Tamamlandı",
    css: "background:#F9FAFB;color:#6B7280;border-color:#E5E7EB",
  },
  cancel: {
    txt: "✗ İptal",
    css: "background:#FEF2F2;color:#DC2626;border-color:#FECACA",
  },
};

const RESERVATIONS: Reservation[] = [
  { id:1, name:"Zuzuu Beach Hotel", cat:"Beach Club", loc:"Bodrum", code:"MYL-7842", dates:"15–17 Tem 2025", szl:"A3, A4 · İskele", gun:"2 gün", odenen:"₺5.000", status:"upcoming", statusTxt:"📅 Yaklaşan", statusCss:"background:#EFF6FF;color:#2563EB;border-color:#BFDBFE", img:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&fit=crop" },
  { id:2, name:"Marmaris Beach Resort", cat:"Beach Club", loc:"Marmaris", code:"MYL-7651", dates:"3–5 Haz 2025", szl:"B7 · Silver", gun:"2 gün", odenen:"₺3.400", status:"active", statusTxt:"✅ Aktif", statusCss:"background:#F0FDF4;color:#16A34A;border-color:#BBF7D0", img:"https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&fit=crop" },
  { id:3, name:"Fethiye Paradise Club", cat:"Beach Club", loc:"Fethiye", code:"MYL-7420", dates:"20 May 2025", szl:"C2 · VIP", gun:"1 gün", odenen:"₺1.500", status:"past", statusTxt:"✓ Tamamlandı", statusCss:"background:#F9FAFB;color:#6B7280;border-color:#E5E7EB", img:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&fit=crop", stars:4 },
  { id:4, name:"Bodrum Luxury Suites", cat:"Hotel", loc:"Bodrum", code:"MYL-7201", dates:"1–2 May 2025", szl:"D1, D2 · VIP", gun:"1 gün", odenen:"₺3.600", status:"past", statusTxt:"✓ Tamamlandı", statusCss:"background:#F9FAFB;color:#6B7280;border-color:#E5E7EB", img:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&fit=crop", review:true },
  { id:5, name:"Zuzuu Beach Hotel", cat:"Beach Club", loc:"Bodrum", code:"MYL-6988", dates:"10 Nis 2025", szl:"A5 · İskele", gun:"1 gün", odenen:"₺1.250", status:"cancel", statusTxt:"✗ İptal", statusCss:"background:#FEF2F2;color:#DC2626;border-color:#FECACA", img:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&fit=crop" },
];

const TR_DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function iptalEdilebilirMi(rezervasyon: any, tesis: any): { edilebilir: boolean; kalanSaat: number; gerekenSaat: number } {
  const iptalSaatOncesi = typeof tesis?.iptal_saat_oncesi === "number" ? tesis.iptal_saat_oncesi : 24;
  if (iptalSaatOncesi >= 999999) {
    return { edilebilir: false, kalanSaat: 0, gerekenSaat: iptalSaatOncesi };
  }
  let calismaSaatleri: any[] = [];
  try {
    const raw = tesis?.calisma_saatleri;
    calismaSaatleri = Array.isArray(raw) ? raw : (typeof raw === "string" ? JSON.parse(raw) : []);
  } catch { calismaSaatleri = []; }
  const baslangicDate = new Date(`${rezervasyon.baslangic_tarih}T00:00:00+03:00`);
  const dayName = TR_DAYS[baslangicDate.getDay()];
  const gunData = calismaSaatleri.find((g: any) => g?.name === dayName);
  if (gunData && gunData.kapali === true) {
    return { edilebilir: false, kalanSaat: 0, gerekenSaat: iptalSaatOncesi };
  }
  const acilisStr = (gunData?.acilis && /^\d{1,2}:\d{2}$/.test(gunData.acilis)) ? gunData.acilis : "09:00";
  const rezervasyonBaslangicDT = new Date(`${rezervasyon.baslangic_tarih}T${acilisStr}:00+03:00`);
  const kalanMs = rezervasyonBaslangicDT.getTime() - new Date().getTime();
  const kalanSaat = kalanMs / (1000 * 60 * 60);
  return {
    edilebilir: kalanSaat >= iptalSaatOncesi,
    kalanSaat: Math.max(0, Math.floor(kalanSaat)),
    gerekenSaat: iptalSaatOncesi,
  };
}

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reservations");
  const [resFilter, setResFilter] = useState("all");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resLoading, setResLoading] = useState(false);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<number|null>(null);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [kodModal, setKodModal] = useState(false);
  const [kodVal, setKodVal] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [toast, setToast] = useState<{msg: string, type: "success" | "error"} | null>(null);
  const [saveOk, setSaveOk] = useState(false);
  const [totalReservations, setTotalReservations] = useState<number | null>(null);
  const [totalSpent, setTotalSpent] = useState<number | null>(null);
  const [iptalCount, setIptalCount] = useState<number | null>(null);
  const [totalEkYukleme, setTotalEkYukleme] = useState<number | null>(null);
  const [totalSiparisHarcamasi, setTotalSiparisHarcamasi] = useState<number | null>(null);
  const [profile, setProfile] = useState({
    ad: "",
    soyad: "",
    tel: "",
    email: "",
    dogum: "",
    sehir: "",
  });
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [avatarDropdown, setAvatarDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [cancelModal, setCancelModal] = useState<{ id: string | number } | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [orders, setOrders] = useState<MusteriSiparis[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [gecmisAcik, setGecmisAcik] = useState(false);
  const [orderRezIds, setOrderRezIds] = useState<string[]>([]);
  const [gecmisTumSiparisler, setGecmisTumSiparisler] = useState<MusteriSiparis[]>([]);
  const [gecmisTumLoading, setGecmisTumLoading] = useState(false);
  const [gecmisFilter, setGecmisFilter] = useState<"bugun" | "hafta" | "ay" | "tumu">("ay");
  const [garsonCagriCooldown, setGarsonCagriCooldown] = useState<Record<string, number>>({});
  const [showCallModal, setShowCallModal] = useState(false);
  const [callModalRez, setCallModalRez] = useState<Reservation | null>(null);
  const [aktifCagrilar, setAktifCagrilar] = useState<Record<string, AktifCagriDurum>>({});
  const [bildirimler, setBildirimler] = useState<any[]>([]);
  const [bildirimlerLoading, setBildirimlerLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setUserLoading(false);
    }
    loadUser();
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!user && !userLoading) {
      router.push("/giris");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    async function loadUserProfile() {
      if (!user) return;

      try {
        const { data: kullanici } = await supabase
          .from("kullanicilar")
          .select("ad, soyad, telefon, dogum_tarihi, sehir")
          .eq("id", user.id)
          .maybeSingle();

        setProfile((prev) => ({
          ...prev,
          ad: kullanici?.ad || prev.ad || "Misafir",
          soyad: kullanici?.soyad || prev.soyad || "",
          tel: (kullanici as any)?.telefon || prev.tel || "",
          dogum: (kullanici as any)?.dogum_tarihi || prev.dogum || "",
          sehir: (kullanici as any)?.sehir || prev.sehir || "",
          email: user.email || prev.email || "",
        }));
      } catch {
        setProfile((prev) => ({
          ...prev,
          ad: (user as any)?.email || prev.ad || "Misafir",
          email: user.email || prev.email || "",
        }));
      }
    }

    loadUserProfile();
  }, [user]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    async function loadReservations() {
      if (!user) return;

      try {
        setResLoading(true);
        const userId = user?.id;

        const { data: rezData, error: rezError } = await supabase
          .from("rezervasyonlar")
          .select(
            "id, tesis_id, baslangic_tarih, bitis_tarih, kisi_sayisi, toplam_tutar, durum, rezervasyon_kodu, giris_yapildi, bakiye_yuklenen, bakiye_harcanan, bakiye_kalan, sezlong_ids, sezlong:sezlonglar(numara, grup:sezlong_gruplari(ad))"
          )
          .eq("kullanici_id", userId)
          .in("durum", ["aktif", "onaylandi", "iptal", "tamamlandi"])
          .order("baslangic_tarih", { ascending: false });

        if (rezError) {
          console.error("Profil rezervasyon sorgu hatası:", rezError);
          setResLoading(false);
          return;
        }

        const tesisIds = Array.from(
          new Set(
            (rezData ?? [])
              .map((r: any) => r.tesis_id)
              .filter((id: any) => id != null)
          )
        );

        const tesisMap: Record<number, { ad: string; loc: string; slug: string | null; iptal_saat_oncesi?: number; calisma_saatleri?: any }> = {};

        if (tesisIds.length) {
          const { data: tesisData, error: tesisError } = await supabase
            .from("tesisler")
            .select("id, ad, sehir, ilce, slug, iptal_saat_oncesi, calisma_saatleri")
            .in("id", tesisIds);

          if (tesisError) {
            console.error("Profil tesis sorgu hatası:", tesisError);
          } else {
            (tesisData ?? []).forEach((t: any) => {
              const locParts = [t.ilce, t.sehir].filter(Boolean).join(", ");
              tesisMap[t.id] = {
                ad: t.ad || `Tesis #${t.id}`,
                loc: locParts || "-",
                slug: typeof t.slug === "string" && t.slug.trim() ? t.slug.trim() : null,
                iptal_saat_oncesi: typeof t.iptal_saat_oncesi === "number" ? t.iptal_saat_oncesi : undefined,
                calisma_saatleri: t.calisma_saatleri ?? undefined,
              };
            });
          }
        }

        // Tüm rezervasyonlardaki sezlong_ids'leri topla ve ilgili şezlongları tek seferde çek
        const tumSezlongIds = Array.from(
          new Set(
            (rezData ?? [])
              .flatMap((r: any) => Array.isArray(r.sezlong_ids) ? r.sezlong_ids : [])
              .filter((id: any) => id != null)
          )
        );

        const sezlongMap: Record<string, { numara: number | string | null; grupAd: string | null }> = {};
        if (tumSezlongIds.length) {
          const { data: sezlongData, error: sezlongErr } = await supabase
            .from("sezlonglar")
            .select("id, numara, grup:sezlong_gruplari(ad)")
            .in("id", tumSezlongIds);

          if (sezlongErr) {
            console.error("Profil sezlong sorgu hatası:", sezlongErr);
          } else {
            (sezlongData ?? []).forEach((s: any) => {
              sezlongMap[String(s.id)] = {
                numara: s.numara ?? null,
                grupAd: s.grup?.ad ?? null,
              };
            });
          }
        }

        const today = new Date().toISOString().slice(0, 10);

        const toplamRez = (rezData ?? []).length;
        const toplamTutar = (rezData ?? []).reduce((sum: number, r: any) => {
          const t = typeof r.toplam_tutar === "number" ? r.toplam_tutar : Number(r.toplam_tutar || 0);
          return sum + (isNaN(t) ? 0 : t);
        }, 0);
        // İptal edilmeyen rezervasyonlar
        const aktifRezler = (rezData ?? []).filter((r: any) => r.durum !== "iptal");

        // Rezervasyon sayısı (iptal hariç)
        const rezervasyonSayisi = aktifRezler.length;

        // İptal sayısı (altyazı için)
        const iptalSayisi = (rezData ?? []).filter((r: any) => r.durum === "iptal").length;

        // Toplam Ödeme: iptal edilmeyen tüm rezervasyonların toplam_tutar toplamı
        const onlineOdeme = aktifRezler.reduce((sum: number, r: any) => {
          const t = typeof r.toplam_tutar === "number" ? r.toplam_tutar : Number(r.toplam_tutar || 0);
          return sum + (isNaN(t) ? 0 : t);
        }, 0);

        // Ek Yükleme: bakiye_yuklenen - toplam_tutar > 0 olanların farkı toplamı (iptal hariç)
        const ekYukleme = aktifRezler.reduce((sum: number, r: any) => {
          const yuklenen = typeof r.bakiye_yuklenen === "number" ? r.bakiye_yuklenen : Number(r.bakiye_yuklenen || 0);
          const tutar = typeof r.toplam_tutar === "number" ? r.toplam_tutar : Number(r.toplam_tutar || 0);
          const fark = yuklenen - tutar;
          return sum + (fark > 0 ? fark : 0);
        }, 0);

        // Kalan Bakiye: sadece aktif + yaklaşan rezervasyonların bakiye_kalan toplamı (iptal hariç)
        const kalanBakiye = (aktifRezler ?? [])
          .filter((r: any) => {
            const startStr = r?.baslangic_tarih ? String(r.baslangic_tarih).slice(0, 10) : null;
            const endStr = r?.bitis_tarih ? String(r.bitis_tarih).slice(0, 10) : null;
            return startStr != null && endStr != null && startStr <= today && endStr >= today;
          })
          .reduce((sum: number, r: any) => {
            const b = typeof r.bakiye_kalan === "number" ? r.bakiye_kalan : Number(r.bakiye_kalan || 0);
            return sum + (isNaN(b) ? 0 : b);
          }, 0);

        const uiRes: Reservation[] = (rezData ?? []).map((r: any) => {
          const startStr = r.baslangic_tarih as string | null;
          const endStr = r.bitis_tarih as string | null;
          const start = startStr ? new Date(startStr) : null;
          const end = endStr ? new Date(endStr) : null;

          let dates = "-";
          if (start && end) {
            const sLabel = start.toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const eLabel = end.toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            dates = sLabel === eLabel ? sLabel : `${sLabel} – ${eLabel}`;
          } else if (start) {
            dates = start.toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          }

          let gun = "1 gün";
          if (start && end) {
            const diffDays = Math.max(
              1,
              Math.round((end.getTime() - start.getTime()) / 86400000)
            );
            gun = `${diffDays} gün`;
          }

          const durumRaw = (r.durum as string | null)?.toLowerCase() ?? "";
          let statusKey: "upcoming" | "active" | "past" | "cancel" = "upcoming";

          if (
            durumRaw.includes("iptal") ||
            durumRaw === "cancel" ||
            durumRaw === "cancelled"
          ) {
            statusKey = "cancel";
          } else if (durumRaw === "tamamlandi") {
            statusKey = "past";
          } else if (startStr && startStr > today) {
            statusKey = "upcoming";
          } else if (startStr && endStr && startStr <= today && endStr >= today) {
            statusKey = "active";
          } else if (endStr && endStr < today) {
            statusKey = "past";
          } else {
            statusKey = "past";
          }

          const meta = STATUS_META[statusKey];
          const tesisInfo = r.tesis_id ? tesisMap[r.tesis_id] : undefined;
          const sl = (r as {
            sezlong?: {
              numara?: number | string | null;
              grup?: { ad?: string | null } | null;
            } | null;
          }).sezlong;
          
          // sezlong_ids array'inden tüm şezlongları gruba göre grupla
          const rezSezlongIds: string[] = Array.isArray(r.sezlong_ids) ? r.sezlong_ids : [];
          const gruplar: Record<string, string[]> = {};
          
          for (const sid of rezSezlongIds) {
            const s = sezlongMap[String(sid)];
            if (!s) continue;
            const gAd = (s.grupAd || "").trim();
            const num = s.numara;
            if (!gAd || num == null || String(num).trim() === "") continue;
            const prefix = gAd.charAt(0).toUpperCase();
            const etiket = `${prefix}${num}`;
            if (!gruplar[gAd]) gruplar[gAd] = [];
            gruplar[gAd].push(etiket);
          }
          
          let szlLabel = "-";
          const grupKeys = Object.keys(gruplar);
          if (grupKeys.length > 0) {
            // Her grup için "Grup: E1, E2, E3" formatında satır oluştur
            szlLabel = grupKeys
              .map((gAd) => `${gAd}: ${gruplar[gAd].join(", ")}`)
              .join("\n");
          } else {
            // Eski mantığa fallback (sezlong_ids boşsa eski sezlong alanını kullan)
            const grupAd = sl?.grup?.ad?.trim();
            const sezlongNum = sl?.numara;
            const hasNum = sezlongNum != null && String(sezlongNum).trim() !== "";
            if (grupAd && hasNum) {
              const prefix = grupAd.charAt(0).toUpperCase();
              szlLabel = `${grupAd} - ${prefix}${sezlongNum}`;
            } else if (hasNum) {
              szlLabel = `No: ${sezlongNum}`;
            } else if (grupAd) {
              szlLabel = grupAd;
            }
          }

          const codeStr =
            r.rezervasyon_kodu == null ? "" : String(r.rezervasyon_kodu);

          const slugDb = tesisInfo?.slug?.trim();
          const slugFromAd = tesisInfo?.ad
            ? tesisInfo.ad.trim().toLowerCase().replace(/\s+/g, "-")
            : "";
          const tesisSlug =
            slugDb ||
            slugFromAd ||
            (r.tesis_id != null ? `tesis-${r.tesis_id}` : "");

          return {
            id: r.id,
            tesisId: r.tesis_id == null ? undefined : String(r.tesis_id),
            sezlongId: Array.isArray(r.sezlong_ids) && r.sezlong_ids.length > 0 ? String(r.sezlong_ids[0]) : undefined,
            name: tesisInfo?.ad || `Tesis #${r.tesis_id ?? ""}`,
            cat: "Beach Club",
            loc: tesisInfo?.loc || "-",
            code: codeStr,
            dates,
            tarihBaslangic: startStr || undefined,
            tarihBitis: endStr || undefined,
            durum: r.durum ?? undefined,
            szl: szlLabel,
            gun,
            odenen: `₺${Number(r.toplam_tutar || 0).toLocaleString("tr-TR")}`,
            bakiyeYuklenen: Number(r.bakiye_yuklenen || 0),
            bakiyeKalan: Number(r.bakiye_kalan || 0),
            status: statusKey,
            statusTxt: meta.txt,
            statusCss: meta.css,
            img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&fit=crop",
            slug: tesisSlug,
            girisYapildi: r.giris_yapildi === true,
            stars: undefined,
            review: false,
            iptalSaatOncesi: tesisInfo?.iptal_saat_oncesi,
            calismaSaatleri: tesisInfo?.calisma_saatleri,
          };
        });

        setReservations(uiRes);
        setTotalReservations(rezervasyonSayisi);
        setTotalSpent(onlineOdeme);
        setIptalCount(iptalSayisi);
        setTotalEkYukleme(ekYukleme);
        setTotalSiparisHarcamasi(kalanBakiye);
        setResLoading(false);
      } catch (e) {
        console.error("Profil rezervasyon yükleme hatası:", e);
        setResLoading(false);
      }
    }

    loadReservations();
  }, [user]);

  useEffect(() => {
    if (!user || reservations.length === 0) return;

    const rezIds = reservations.map((r) => String(r.id)).filter(Boolean);

    async function fetchAktifCagrilar() {
      const { data, error } = await supabase
        .from("bildirimler")
        .select("id, rezervasyon_id, created_at, yanit_tarihi, yanit_suresi_saniye, varis_tarihi, varis_suresi_saniye, okundu")
        .eq("tip", "garson_cagri")
        .in("rezervasyon_id", rezIds)
        .order("created_at", { ascending: false });

      if (error) { console.error("fetchAktifCagrilar:", JSON.stringify(error)); return; }

      const now = Date.now();
      const onDakika = 10 * 60 * 1000;
      const birDakika = 60 * 1000;
      const yeni: Record<string, AktifCagriDurum> = {};

      for (const b of (data ?? [])) {
        const key = String(b.rezervasyon_id);
        if (yeni[key]) continue;
        const createdMs = new Date(b.created_at).getTime();
        const varisMs = b.varis_tarihi ? new Date(b.varis_tarihi).getTime() : null;
        const isOkunmamis = !b.okundu && (now - createdMs) < onDakika;
        const isYoldaFazinda = b.yanit_tarihi !== null && b.varis_tarihi === null;
        const isYeniVaris = varisMs !== null && (now - varisMs) < birDakika;
        if (isOkunmamis || isYoldaFazinda || isYeniVaris) {
          yeni[key] = {
            id: String(b.id),
            createdAt: b.created_at,
            yanitTarihi: b.yanit_tarihi ?? null,
            yanitSuresi: b.yanit_suresi_saniye ?? null,
            varisTarihi: b.varis_tarihi ?? null,
            varisSuresi: b.varis_suresi_saniye ?? null,
          };
        }
      }
      setAktifCagrilar(yeni);
    }

    async function fetchBildirimler() {
      setBildirimlerLoading(true);
      const { data, error } = await supabase
        .from("bildirimler")
        .select("id, rezervasyon_id, created_at, yanit_tarihi, yanit_suresi_saniye, varis_tarihi, varis_suresi_saniye, okundu")
        .eq("tip", "garson_cagri")
        .in("rezervasyon_id", rezIds)
        .order("created_at", { ascending: false })
        .limit(50);
      setBildirimlerLoading(false);
      if (error) { console.error("fetchBildirimler:", JSON.stringify(error)); return; }
      setBildirimler(data ?? []);
    }

    fetchAktifCagrilar();
    fetchBildirimler();

    const channel = supabase
      .channel(`musteri-cagri-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bildirimler" },
        (payload) => {
          const updated = payload.new as any;
          if (updated && rezIds.includes(String(updated.rezervasyon_id))) {
            fetchAktifCagrilar();
            fetchBildirimler();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, reservations]);

  useEffect(() => {
    async function loadUserReviews() {
      if (!user) return;
      try {
        setReviewsLoading(true);
        const { data, error } = await supabase
          .from("yorumlar")
          .select("id, yorum, puan, durum, created_at, tesis:tesisler(ad)")
          .eq("kullanici_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Profil yorumlar sorgu hatası:", error);
          setReviewsLoading(false);
          return;
        }

        setUserReviews((data ?? []) as UserReview[]);
      } finally {
        setReviewsLoading(false);
      }
    }

    loadUserReviews();
  }, [user]);

  useEffect(() => {
    async function loadFavorites() {
      if (!user) return;
      const userId = user.id;
      const { data, error } = await supabase
        .from("favoriler")
        .select("*, tesis:tesisler(*)")
        .eq("kullanici_id", userId);

      if (error) {
        console.error("Profil favoriler sorgu hatası:", error);
        return;
      }
      setFavorites((data ?? []) as FavoriteItem[]);
    }

    loadFavorites();
  }, [user]);

  // ── Siparişleri çek ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadOrders() {
      setOrdersLoading(true);

      // 1. Kullanıcının rezervasyon ID'leri + tesis bilgisi
      const { data: rezData } = await supabase
        .from("rezervasyonlar")
        .select("id, tesis_id")
        .eq("kullanici_id", user.id)
        .neq("durum", "iptal");
      if (cancelled) return;

      const rezIds = (rezData ?? []).map((r: any) => String(r.id));
      setOrderRezIds(rezIds);

      if (!rezIds.length) {
        setOrders([]);
        setOrdersLoading(false);
        return;
      }

      // 2. Tesis adları
      const tesisIds = [...new Set((rezData ?? []).map((r: any) => r.tesis_id).filter(Boolean))];
      const tesisAdMap: Record<string, string> = {};
      if (tesisIds.length) {
        const { data: tesisData } = await supabase
          .from("tesisler").select("id, ad").in("id", tesisIds);
        (tesisData ?? []).forEach((t: any) => { tesisAdMap[String(t.id)] = t.ad || "Tesis"; });
      }
      const rezTesisMap: Record<string, string> = {};
      (rezData ?? []).forEach((r: any) => {
        rezTesisMap[String(r.id)] = tesisAdMap[String(r.tesis_id)] || "Tesis";
      });

      // 3. Siparişler: aktif (tarih bağımsız) + bugünkü teslim_edildi
      const bugunBaslangic = new Date();
      bugunBaslangic.setHours(0, 0, 0, 0);
      const bugunIso = bugunBaslangic.toISOString();
      const orFilter = `durum.neq.${SIPARIS_DURUM.TESLIM_EDILDI},and(durum.eq.${SIPARIS_DURUM.TESLIM_EDILDI},created_at.gte.${bugunIso})`;

      const { data: sipData, error: sipError } = await supabase
        .from("siparisler")
        .select("id, created_at, durum, toplam, rezervasyon_id, siparis_kalemleri(ad, adet, fiyat)")
        .in("rezervasyon_id", rezIds)
        .or(orFilter)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (sipError) {
        console.error("Profil siparisler fetch error:", JSON.stringify(sipError, null, 2));
        setOrdersLoading(false);
        return;
      }

      const mapped: MusteriSiparis[] = (sipData ?? []).map((s: any) => {
        const created = s.created_at ? new Date(s.created_at) : new Date();
        return {
          id: String(s.id),
          durumKey: String(s.durum || SIPARIS_DURUM.YENI),
          tesisAd: rezTesisMap[String(s.rezervasyon_id)] || "Tesis",
          createdAt: created,
          sureDakika: Math.max(1, Math.round((Date.now() - created.getTime()) / 60000)),
          urunler: (s.siparis_kalemleri ?? []).map((k: any) => ({
            isim: String(k.ad || "Ürün"),
            adet: Number(k.adet ?? 1),
            fiyat: Number(k.fiyat ?? 0),
          })),
          toplam: Number(s.toplam ?? 0),
          rezervasyonId: String(s.rezervasyon_id),
        };
      });

      setOrders(mapped);
      setOrdersLoading(false);
    }

    loadOrders();
    return () => { cancelled = true; };
  }, [user]);

  // ── Realtime: sipariş durum güncellemeleri ────────────────────────────────
  useEffect(() => {
    if (!user || !orderRezIds.length) return;

    async function refetchOrders() {
      const bugunBaslangic = new Date();
      bugunBaslangic.setHours(0, 0, 0, 0);
      const orFilter = `durum.neq.${SIPARIS_DURUM.TESLIM_EDILDI},and(durum.eq.${SIPARIS_DURUM.TESLIM_EDILDI},created_at.gte.${bugunBaslangic.toISOString()})`;
      const { data: sipData } = await supabase
        .from("siparisler")
        .select("id, created_at, durum, toplam, rezervasyon_id, siparis_kalemleri(ad, adet, fiyat)")
        .in("rezervasyon_id", orderRezIds)
        .or(orFilter)
        .order("created_at", { ascending: false });
      if (!sipData) return;
      setOrders((prev) => {
        const tesisMap: Record<string, string> = {};
        prev.forEach((o) => { tesisMap[o.rezervasyonId] = o.tesisAd; });
        return sipData.map((s: any) => {
          const created = s.created_at ? new Date(s.created_at) : new Date();
          return {
            id: String(s.id),
            durumKey: String(s.durum || SIPARIS_DURUM.YENI),
            tesisAd: tesisMap[String(s.rezervasyon_id)] || "Tesis",
            createdAt: created,
            sureDakika: Math.max(1, Math.round((Date.now() - created.getTime()) / 60000)),
            urunler: (s.siparis_kalemleri ?? []).map((k: any) => ({
              isim: String(k.ad || "Ürün"),
              adet: Number(k.adet ?? 1),
              fiyat: Number(k.fiyat ?? 0),
            })),
            toplam: Number(s.toplam ?? 0),
            rezervasyonId: String(s.rezervasyon_id),
          };
        });
      });
    }

    const channel = supabase
      .channel(`musteri-siparisler-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "siparisler" }, () => {
        refetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, orderRezIds]);

  useEffect(() => {
    async function fetchGecmisSiparisler() {
      if (!user) return;
      setGecmisTumLoading(true);

      let sinirTarih: Date | null = null;
      const now = new Date();
      if (gecmisFilter === "bugun") {
        sinirTarih = new Date();
        sinirTarih.setHours(0, 0, 0, 0);
      } else if (gecmisFilter === "hafta") {
        sinirTarih = new Date();
        sinirTarih.setDate(now.getDate() - 7);
      } else if (gecmisFilter === "ay") {
        sinirTarih = new Date();
        sinirTarih.setMonth(now.getMonth() - 1);
      }

      let query = supabase
        .from("siparisler")
        .select("id, created_at, durum, toplam, tesis_id, rezervasyon_id, siparis_kalemleri(ad, adet, fiyat), rezervasyonlar!inner(kullanici_id, tesisler(ad))")
        .eq("rezervasyonlar.kullanici_id", user.id)
        .eq("durum", SIPARIS_DURUM.TESLIM_EDILDI)
        .order("created_at", { ascending: false })
        .limit(50);

      if (sinirTarih) {
        query = query.gte("created_at", sinirTarih.toISOString());
      }

      const { data, error } = await query;
      setGecmisTumLoading(false);
      if (error) { console.error("fetchGecmisSiparisler:", JSON.stringify(error)); return; }

      const mapped: MusteriSiparis[] = (data ?? []).map((s: any) => {
        const created = new Date(s.created_at);
        const sureDakika = Math.max(1, Math.round((Date.now() - created.getTime()) / 60000));
        const tesisler = s?.rezervasyonlar?.tesisler;
        const tesisAd = Array.isArray(tesisler) ? tesisler[0]?.ad ?? "Tesis" : tesisler?.ad ?? "Tesis";
        return {
          id: String(s.id),
          durumKey: String(s.durum || "teslim_edildi"),
          tesisAd,
          createdAt: created,
          sureDakika,
          urunler: (s.siparis_kalemleri ?? []).map((k: any) => ({
            isim: String(k.ad || "Ürün"),
            adet: Number(k.adet ?? 1),
            fiyat: Number(k.fiyat ?? 0),
          })),
          toplam: Number(s.toplam ?? 0),
          rezervasyonId: String(s.rezervasyon_id ?? ""),
        };
      });

      setGecmisTumSiparisler(mapped);
    }

    fetchGecmisSiparisler();
  }, [user, gecmisFilter]);

  const filteredRes = reservations.filter((r) =>
    resFilter === "all"
      ? true
    : r.status === resFilter
  );

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function cancelRes(id: number | string) {
    setCancelError(null);
    setCancelModal({ id });
  }

  function garsonCagir(rez: Reservation) {
    const kilitKey = String(rez.id);
    const bitis = garsonCagriCooldown[kilitKey];
    if (bitis && bitis > Date.now()) return;
    if (!rez.tesisId || !rez.sezlongId) {
      showToast("Çağrı gönderilemedi, tekrar deneyin", "error");
      return;
    }
    setCallModalRez(rez);
    setShowCallModal(true);
  }

  async function handleCallConfirm() {
    const rez = callModalRez;
    setShowCallModal(false);
    setCallModalRez(null);
    if (!rez) return;

    const kilitKey = String(rez.id);
    const musteriAd = `${profile.ad || ""} ${profile.soyad || ""}`.trim() || "Müşteri";
    const insertedAt = new Date().toISOString();
    const { data: insertData, error } = await supabase
      .from("bildirimler")
      .insert({
        tip: "garson_cagri",
        tesis_id: rez.tesisId,
        sezlong_id: rez.sezlongId,
        rezervasyon_id: rez.id,
        kullanici_id: null,
        baslik: "Garson Çağrısı",
        mesaj: `${musteriAd} size çağrıda bulundu`,
        okundu: false,
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Profil garson çağrı insert error:", JSON.stringify(error, null, 2));
      showToast("Çağrı gönderilemedi, tekrar deneyin", "error");
      return;
    }

    const createdAt = insertData?.created_at ?? insertedAt;
    setAktifCagrilar((prev) => ({
      ...prev,
      [kilitKey]: {
        id: String(insertData?.id ?? ""),
        createdAt,
        yanitTarihi: null,
        yanitSuresi: null,
        varisTarihi: null,
        varisSuresi: null,
      },
    }));

    showToast("Garson çağrıldı, birazdan yanınızda olacak", "success");
    const yeniBitis = Date.now() + 2 * 60 * 1000;
    setGarsonCagriCooldown((prev) => ({ ...prev, [kilitKey]: yeniBitis }));
    window.setTimeout(() => {
      setGarsonCagriCooldown((prev) => {
        const n = { ...prev };
        if ((n[kilitKey] ?? 0) <= Date.now()) delete n[kilitKey];
        return n;
      });
    }, 2 * 60 * 1000 + 200);
  }

  async function confirmCancel() {
    if (!cancelModal) return;
    const id = cancelModal.id;
    setCancelLoading(true);
    setCancelError(null);
    try {
      const refundRes = await fetch("/api/paratika/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rezervasyonId: id }),
      });
      const refundData = (await refundRes.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (!refundRes.ok || !refundData.success) {
        setCancelModal(null);
        setCancelError(refundData.error || "İade işlemi başarısız.");
        return;
      }
      setReservations((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "cancel",
                statusTxt: "✗ İptal",
                statusCss:
                  "background:#FEF2F2;color:#DC2626;border-color:#FECACA",
              }
            : r
        )
      );
      setCancelModal(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "İade işlemi başarısız.";
      setCancelModal(null);
      setCancelError(msg);
    } finally {
      setCancelLoading(false);
    }
  }

  function submitReview() {
    if (!reviewStars) { alert("Lütfen puan seçin"); return; }
    setReservations(prev => prev.map(r => r.id === reviewTarget ? { ...r, review:false, stars:reviewStars } : r));
    setReviewModal(false);
    setReviewStars(0);
    setReviewText("");
  }

  async function activateReservationByCode(rawCode: string, source: "qr" | "kod") {
    if (!user?.id) {
      showToast("Lütfen önce giriş yapın.", "error");
      return;
    }
    const code = rawCode.trim().toUpperCase();
    if (code.length < 3) {
      showToast("Lütfen geçerli bir kod girin.", "error");
      return;
    }

    const { data: row, error } = await supabase
      .from("rezervasyonlar")
      .update({ giris_yapildi: true, durum: "onaylandi" })
      .eq("kullanici_id", user.id)
      .eq("rezervasyon_kodu", code)
      .neq("durum", "iptal")
      .select("id")
      .maybeSingle();

    if (error) {
      console.error(`[profil] ${source} aktivasyon update hatası:`, error);
      showToast("Aktivasyon sırasında hata oluştu.", "error");
      return;
    }
    if (!row?.id) {
      showToast("Kod ile eşleşen aktif rezervasyon bulunamadı.", "error");
      return;
    }

    setReservations((prev) =>
      prev.map((r) =>
        String(r.id) === String(row.id)
          ? {
              ...r,
              girisYapildi: true,
              status: "active",
              statusTxt: STATUS_META.active.txt,
              statusCss: STATUS_META.active.css,
            }
          : r
      )
    );
    setKodModal(false);
    setKodVal("");
    showToast("Rezervasyon aktif edildi. Sipariş verebilirsiniz.", "success");
  }

  async function submitKod() {
    await activateReservationByCode(kodVal, "kod");
  }

  async function saveProfile() {
    if (!user) return;

    console.log("update yapılacak user id:", user?.id);
    console.log("update edilecek veriler:", {
      ad: profile.ad,
      soyad: profile.soyad,
      telefon: profile.tel,
      dogum_tarihi: profile.dogum,
      sehir: profile.sehir,
    });

    const { error } = await supabase
      .from("kullanicilar")
      .update({
        ad: profile.ad,
        soyad: profile.soyad,
        telefon: profile.tel,
        dogum_tarihi: profile.dogum || null,
        sehir: profile.sehir,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Profil güncellenemedi:", error);
      return;
    }

    setSaveOk(true);
    setTimeout(() => setSaveOk(false), 2000);
  }

  const statusCount = (s: string) =>
    reservations.filter((r) => r.status === s).length;

  function favoriteImage(t: FavoriteItem["tesis"]) {
    const fotos = t?.fotograflar;
    if (Array.isArray(fotos) && fotos.length > 0 && fotos[0] && typeof fotos[0] === "object") {
      const src = (fotos[0] as { src?: string }).src;
      if (typeof src === "string" && src.trim()) return src;
    }
    return "/logo.png";
  }

  function favoritePrice(t: FavoriteItem["tesis"]) {
    if (!t) return null;
    for (const k of ["gunluk_fiyat", "baslangic_fiyat", "min_fiyat", "fiyat", "sezlong_fiyat"] as const) {
      const v = t[k];
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string" && (v as string).trim() !== "") {
        const n = parseFloat(String(v).replace(",", "."));
        if (!Number.isNaN(n) && Number.isFinite(n)) return n;
      }
    }
    return null;
  }

  function favoriteCategory(kategori: unknown) {
    if (Array.isArray(kategori)) return kategori.map(String).filter(Boolean).join(", ") || "—";
    if (typeof kategori === "string" && kategori.trim()) return kategori;
    return "—";
  }

  const avatarLetter =
    (profile.ad?.trim()?.[0] ||
      user?.email?.trim()?.[0] ||
      "K"
    ).toUpperCase();

  const memberSince = (() => {
    const created = (user as any)?.created_at as string | undefined;
    if (!created) return "Üye: —";
    const d = new Date(created);
    if (isNaN(d.getTime())) return "Üye: —";
    const aylar = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
    return `Üye: ${aylar[d.getMonth()]} ${d.getFullYear()}`;
  })();

  return (
    <>
      {toast && (
        <div style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: toast.type === "success" ? "#16A34A" : "#DC2626",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: 12,
          fontSize: ".85rem",
          fontWeight: 700,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
          <span>{toast.msg}</span>
        </div>
      )}
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --navy:#0A1628;--teal:#0ABAB5;--tdk:#089490;--tlt:#E6F7F7;
          --or:#F5821F;--wh:#fff;--bg:#F4F6F9;--bd:#E5E7EB;
          --i2:#374151;--i3:#6B7280;--r3:16px;--r4:20px;
          --sh:0 1px 4px rgba(0,0,0,.07);--sh2:0 4px 20px rgba(0,0,0,.12);
        }
        body{font-family:'GR',sans-serif;background:var(--bg);color:var(--navy)}

        /* NAV */
        .pnav{background:#fff;border-bottom:1px solid var(--bd);height:62px;display:flex;align-items:center;padding:0 24px;gap:12px;position:sticky;top:0;z-index:200;box-shadow:var(--sh)}
        .pnav-logo{height:38px;cursor:pointer}
        .pnav-back{display:flex;align-items:center;gap:5px;font-size:.78rem;font-weight:700;color:var(--i3);text-decoration:none;border:1.5px solid var(--bd);padding:6px 12px;border-radius:9px;transition:all .12s}
        .pnav-back:hover{border-color:var(--navy);color:var(--navy)}
        .pnav-logout{display:flex;align-items:center;gap:5px;font-size:.75rem;font-weight:700;color:var(--i3);background:none;border:1.5px solid var(--bd);padding:6px 12px;border-radius:9px;cursor:pointer;font-family:'GR',sans-serif;transition:all .12s}
        .pnav-logout:hover{border-color:#EF4444;color:#EF4444}

        /* HERO */
        .phero{background:linear-gradient(135deg,var(--navy) 0%,#112240 60%,#0D3B6E 100%);padding:32px 24px}
        .phero-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px}
        .pavatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--teal),#0D8C89);display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:900;color:#fff;flex-shrink:0;border:3px solid rgba(255,255,255,.2)}
        .phero-info{flex:1}
        .phero-name{font-size:1.3rem;font-weight:900;color:#fff}
        .phero-email{font-size:.78rem;color:rgba(255,255,255,.55);margin-top:2px}
        .phero-badges{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
        .hbadge{display:flex;align-items:center;gap:5px;font-size:.65rem;font-weight:800;padding:4px 10px;border-radius:50px}
        .hbadge-teal{background:rgba(10,186,181,.2);color:var(--teal);border:1px solid rgba(10,186,181,.3)}
        .hbadge-or{background:rgba(245,130,31,.2);color:var(--or);border:1px solid rgba(245,130,31,.3)}
        .hbadge-wh{background:rgba(255,255,255,.1);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.15)}
        .phero-stats{display:flex;gap:24px}
        .hstat-n{font-size:1.4rem;font-weight:900;color:#fff}
        .hstat-l{font-size:.65rem;color:rgba(255,255,255,.5);margin-top:2px;text-align:center}

        /* QR + AKTİF */
        .qr-section,.szl-section{padding:20px;background:#fff;margin:0 0 16px;max-width:1100px;margin-left:auto;margin-right:auto;padding:16px 20px}
        .qr-section{border-bottom:1px solid var(--bd)}
        .sec-label{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--i3);margin-bottom:12px;display:flex;align-items:center;gap:6px}
        .qr-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .qr-btn{display:flex;align-items:center;gap:10px;padding:14px 16px;border-radius:12px;border:none;cursor:pointer;font-family:'GR',sans-serif;text-align:left;transition:all .15s}
        .qr-btn-primary{background:var(--or);color:#fff}
        .qr-btn-primary:hover{background:#e07015}
        .qr-btn-secondary{background:#4B5563;color:#fff}
        .qr-btn-secondary:hover{background:#374151}
        .qr-btn-ico{font-size:1.3rem;flex-shrink:0}
        .qr-btn-title{font-size:.82rem;font-weight:800;display:block;line-height:1.2}
        .qr-btn-sub{font-size:.65rem;opacity:.8;margin-top:2px;display:block;line-height:1.3}

        /* PAGE */
        .ppage{max-width:1100px;margin:0 auto;padding:24px 20px 80px;display:grid;grid-template-columns:240px 1fr;gap:22px;align-items:start}

        /* SIDE MENU */
        .side-menu{background:#fff;border:1px solid var(--bd);border-radius:var(--r4);overflow:hidden;box-shadow:var(--sh);position:sticky;top:76px}
        .sm-head{padding:14px 18px;border-bottom:1px solid var(--bd);font-size:.7rem;font-weight:900;color:var(--i3);text-transform:uppercase;letter-spacing:.1em}
        .sm-item{display:flex;align-items:center;gap:10px;padding:12px 18px;cursor:pointer;border-left:3px solid transparent;font-size:.82rem;font-weight:700;color:var(--i2);transition:all .12s;background:none;border-top:none;border-right:none;border-bottom:none;width:100%;font-family:'GR',sans-serif}
        .sm-item:hover{background:var(--bg);color:var(--navy)}
        .sm-item.on{background:var(--tlt);color:var(--tdk);border-left-color:var(--teal);font-weight:900}
        .sm-cnt{margin-left:auto;background:var(--or);color:#fff;font-size:.6rem;font-weight:900;padding:1px 6px;border-radius:50px}
        .sm-divider{border:none;border-top:1px solid var(--bd);margin:6px 0}

        /* CONTENT */
        .sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .sec-title{font-size:1rem;font-weight:900;color:var(--navy)}
        .sec-sub{font-size:.75rem;color:var(--i3);margin-top:2px}

        /* FILTER TABS */
        .filter-tabs{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap}
        .ftab{border:1.5px solid var(--bd);background:#fff;border-radius:9px;padding:6px 14px;font-size:.72rem;font-weight:700;cursor:pointer;font-family:'GR',sans-serif;color:var(--i2);transition:all .12s}
        .ftab:hover{border-color:var(--navy)}
        .ftab.on{background:var(--navy);color:#fff;border-color:var(--navy)}

        /* RES CARD */
        .res-card{background:#fff;border:1px solid var(--bd);border-radius:var(--r4);box-shadow:var(--sh);display:flex;overflow:hidden;transition:all .18s;margin-bottom:12px}
        .res-card:hover{box-shadow:var(--sh2);border-color:#C8D0DA}
        .rc-img-wrap{width:160px;flex-shrink:0;position:relative}
        .rc-img{width:100%;height:100%;object-fit:cover;display:block}
        .rc-status{position:absolute;top:10px;left:10px;font-size:.6rem;font-weight:800;padding:3px 8px;border-radius:6px;border:1px solid}
        .rc-body{flex:1;padding:14px 18px;display:flex;flex-direction:column;gap:8px;min-width:0}
        .rc-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
        .rc-name{font-size:.95rem;font-weight:900;color:var(--navy)}
        .rc-meta{display:flex;align-items:center;gap:6px;margin-top:3px;flex-wrap:wrap}
        .rc-cat{background:var(--tlt);color:var(--tdk);font-size:.62rem;font-weight:700;padding:2px 7px;border-radius:50px;border:1px solid #B2EBEA}
        .rc-loc{font-size:.65rem;color:var(--i3)}
        .rc-code{font-size:.62rem;font-weight:900;color:var(--i3);background:var(--bg);padding:3px 8px;border-radius:6px;white-space:nowrap;border:1px solid var(--bd)}
        .rc-rows{display:grid;grid-template-columns:1fr 1fr;gap:5px}
        .rc-row{display:flex;align-items:center;gap:5px;font-size:.72rem}
        .rc-row-t{color:var(--i3)}
        .rc-row-v{font-weight:700;color:var(--navy);margin-left:auto}
        .rc-footer{display:flex;align-items:center;gap:8px;padding-top:6px;border-top:1px solid var(--bg)}
        .rc-stars{color:#F59E0B;font-size:.85rem;letter-spacing:1px}
        .btn-cancel{background:none;border:1.5px solid #FECACA;border-radius:8px;padding:5px 12px;font-size:.7rem;font-weight:800;cursor:pointer;color:#DC2626;font-family:'GR',sans-serif;transition:all .12s}
        .btn-cancel:hover{background:#FEF2F2}
        .btn-review{background:none;border:1.5px solid #FDE68A;border-radius:8px;padding:5px 12px;font-size:.7rem;font-weight:800;cursor:pointer;color:#92400E;font-family:'GR',sans-serif;transition:all .12s}
        .btn-review:hover{background:#FFFBEB}
        .btn-detail{background:var(--navy);color:#fff;border:none;border-radius:8px;padding:5px 12px;font-size:.7rem;font-weight:800;cursor:pointer;font-family:'GR',sans-serif;transition:all .12s}
        .btn-detail:hover{background:var(--tdk)}

        /* FAV GRID */
        .fav-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .fav-card{background:#fff;border:1px solid var(--bd);border-radius:var(--r3);overflow:hidden;cursor:pointer;transition:all .15s}
        .fav-card:hover{box-shadow:var(--sh2);transform:translateY(-2px)}
        .fav-img{width:100%;height:110px;object-fit:cover;display:block}
        .fav-body{padding:10px 12px}
        .fav-name{font-size:.82rem;font-weight:900;color:var(--navy)}
        .fav-meta{font-size:.65rem;color:var(--i3);margin-top:3px}
        .fav-remove{background:none;border:none;cursor:pointer;color:#EF4444;font-size:.65rem;font-weight:700;margin-top:6px;font-family:'GR',sans-serif;padding:0}

        /* NOTIF */
        .notif-card{background:#fff;border:1px solid var(--bd);border-radius:var(--r3);padding:14px 18px;margin-bottom:10px;display:flex;align-items:flex-start;gap:12px;cursor:pointer;transition:all .12s}
        .notif-card:hover{border-color:#C8D0DA;box-shadow:var(--sh)}
        .notif-card.unread{border-left:3px solid var(--teal);background:linear-gradient(90deg,var(--tlt),#fff)}
        .notif-ic{font-size:1.2rem;flex-shrink:0;width:28px;text-align:center}
        .notif-t{font-size:.8rem;font-weight:800;color:var(--navy)}
        .notif-s{font-size:.72rem;color:var(--i3);margin-top:2px;line-height:1.45}
        .notif-time{font-size:.62rem;color:var(--i3);flex-shrink:0;margin-top:2px}
        .notif-dot{width:8px;height:8px;background:var(--teal);border-radius:50%;flex-shrink:0;margin-top:4px}

        /* PROFILE FORM */
        .profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .pf-group{display:flex;flex-direction:column;gap:5px}
        .pf-group.full{grid-column:1/-1}
        .pf-label{font-size:.68rem;font-weight:800;color:var(--i3);text-transform:uppercase;letter-spacing:.08em}
        .pf-input{border:1.5px solid var(--bd);border-radius:10px;padding:10px 14px;font-size:.85rem;font-family:'GR',sans-serif;color:var(--navy);outline:none;transition:border .12s;background:#fff;width:100%}
        .pf-input:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(10,186,181,.1)}
        .pf-save{background:var(--or);color:#fff;border:none;border-radius:11px;padding:12px 28px;font-size:.85rem;font-weight:900;cursor:pointer;font-family:'GR',sans-serif;transition:all .12s;display:flex;align-items:center;gap:7px}
        .pf-save:hover{background:#DC6C10}
        .pf-save.ok{background:#16A34A}

        /* SECURITY */
        .sec-item{background:#fff;border:1px solid var(--bd);border-radius:var(--r3);padding:16px 18px;margin-bottom:10px;display:flex;align-items:center;gap:14px}
        .sec-item-ic{font-size:1.3rem;width:32px;text-align:center}
        .sec-item-body{flex:1}
        .sec-item-t{font-size:.82rem;font-weight:800;color:var(--navy)}
        .sec-item-s{font-size:.7rem;color:var(--i3);margin-top:2px}
        .sec-item-btn{background:none;border:1.5px solid var(--bd);border-radius:9px;padding:7px 14px;font-size:.72rem;font-weight:700;cursor:pointer;font-family:'GR',sans-serif;color:var(--navy);transition:all .12s;white-space:nowrap}
        .sec-item-btn:hover{border-color:var(--navy)}
        .sec-item-btn.danger{border-color:#FECACA;color:#DC2626}
        .sec-item-btn.danger:hover{background:#FEF2F2}

        /* MODAL */
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:500;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);padding:16px}
        .modal{background:#fff;border-radius:var(--r4);width:100%;max-width:440px;box-shadow:0 8px 40px rgba(0,0,0,.2);overflow:hidden}
        .modal-head{padding:18px 22px;border-bottom:1px solid var(--bd);display:flex;align-items:center;justify-content:space-between}
        .modal-title{font-size:.95rem;font-weight:900;color:var(--navy)}
        .modal-close{background:none;border:none;cursor:pointer;font-size:1.2rem;color:var(--i3);padding:2px 6px;border-radius:6px}
        .modal-body{padding:22px}
        .star-row{display:flex;justify-content:center;gap:8px;margin-bottom:20px}
        .star-btn{font-size:2rem;cursor:pointer;transition:transform .1s;background:none;border:none;line-height:1}
        .star-btn:hover{transform:scale(1.2)}
        .review-ta{width:100%;border:1.5px solid var(--bd);border-radius:10px;padding:12px 14px;font-size:.82rem;font-family:'GR',sans-serif;resize:vertical;min-height:90px;outline:none;transition:border .12s}
        .review-ta:focus{border-color:var(--teal)}
        .modal-footer{padding:14px 22px;border-top:1px solid var(--bd);display:flex;gap:10px}
        .modal-submit{flex:1;background:var(--or);color:#fff;border:none;border-radius:11px;padding:12px;font-size:.85rem;font-weight:900;cursor:pointer;font-family:'GR',sans-serif}
        .modal-cancel{background:none;border:1.5px solid var(--bd);border-radius:11px;padding:12px 16px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:'GR',sans-serif;color:var(--i3)}
        .kod-sheet{background:#fff;border-radius:20px 20px 0 0;padding:28px 20px 32px;width:100%;max-width:480px;position:relative}
        .kod-input{width:100%;padding:14px;border:2px solid var(--bd);border-radius:12px;font-size:1.1rem;font-weight:700;text-align:center;letter-spacing:.3em;font-family:'GR',sans-serif;outline:none;margin-bottom:12px}
        .kod-input:focus{border-color:var(--tdk)}
        .kod-submit{width:100%;padding:13px;background:var(--navy);color:#fff;border:none;border-radius:12px;font-size:.9rem;font-weight:800;cursor:pointer;font-family:'GR',sans-serif}

        /* AKTİF ŞEZLONG KARTI */
        .szl-aktif-card{background:linear-gradient(135deg,var(--navy),#112240);border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:14px;color:#fff}
        .szl-aktif-label{font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.55);margin-bottom:4px}
        .szl-aktif-name{font-size:1rem;font-weight:700;color:#fff}
        .szl-aktif-sub{font-size:.7rem;color:rgba(255,255,255,.5);margin-top:3px}
        .szl-aktif-btns{display:flex;flex-direction:column;gap:6px;flex-shrink:0}
        .btn-siparis-ver{background:var(--or);color:#fff;border:none;border-radius:9px;padding:7px 14px;font-size:.72rem;font-weight:800;cursor:pointer;font-family:'GR',sans-serif;white-space:nowrap}
        .btn-garson-cagir{background:none;color:#EF4444;border:1.5px solid #EF4444;border-radius:9px;padding:6px 14px;font-size:.72rem;font-weight:800;cursor:pointer;font-family:'GR',sans-serif;white-space:nowrap}

        /* SİPARİŞ KARTI */
        .order-card{background:#fff;border:1px solid var(--bd);border-radius:14px;padding:16px;margin-bottom:12px}
        .order-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:12px}
        .order-card-id{font-size:.82rem;font-weight:800;color:var(--navy)}
        .order-card-tesis{font-size:.68rem;color:var(--i3);margin-top:2px}
        .order-card-time{font-size:.65rem;color:var(--i3);white-space:nowrap;flex-shrink:0}
        .order-urunler{margin-bottom:10px}
        .order-urun-row{display:flex;align-items:center;justify-content:space-between;font-size:.75rem;color:var(--i3);padding:3px 0;border-bottom:1px solid var(--bg)}
        .order-urun-row:last-child{border-bottom:none}
        .order-toplam{font-size:.78rem;font-weight:800;color:var(--navy);text-align:right;padding-top:6px;border-top:1px solid var(--bd);margin-top:6px}
        .order-durum-txt{font-size:.82rem;font-weight:700;margin-bottom:10px}

        /* PROGRESS BAR */
        .order-progress{display:flex;align-items:flex-start;gap:0;margin-bottom:8px}
        .op-step{display:flex;flex-direction:column;align-items:center;flex:1;position:relative}
        .op-step:not(:last-child)::after{content:"";position:absolute;top:11px;left:50%;width:100%;height:2px;z-index:0}
        .op-dot{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:900;z-index:1;position:relative;flex-shrink:0}
        .op-dot-done{background:#22C55E;color:#fff}
        .op-dot-active{background:var(--or);color:#fff}
        .op-dot-future{background:#E5E7EB;color:var(--i3)}
        .op-line-done{background:#22C55E}
        .op-line-active{background:#E5E7EB}
        .op-line-future{background:#E5E7EB}
        .op-label{font-size:.55rem;color:var(--i3);margin-top:4px;text-align:center;line-height:1.3}
        .op-label-active{color:var(--or);font-weight:700}
        .op-label-done{color:#16A34A}

        /* AKTİF SİPARİŞ PULSE */
        @keyframes siparis-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(245,130,31,0.5); transform: scale(1); }
          50%  { box-shadow: 0 0 0 8px rgba(245,130,31,0); transform: scale(1.08); }
          100% { box-shadow: 0 0 0 0 rgba(245,130,31,0); transform: scale(1); }
        }
        .siparis-aktif-asama { animation: siparis-pulse 1.8s ease-out infinite; }

        /* GEÇMİŞ ACCORDION */
        .gecmis-btn{width:100%;background:#fff;border:1px solid var(--bd);border-radius:12px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-family:'GR',sans-serif;font-size:.82rem;font-weight:800;color:var(--navy);margin-top:8px}
        .gecmis-btn:hover{background:var(--bg)}
        .gecmis-card{background:#fff;border:1px solid var(--bd);border-radius:12px;padding:12px 16px;margin-bottom:8px;opacity:.85}

        /* EMPTY */
        .empty-state{text-align:center;padding:48px 20px;color:var(--i3)}
        .empty-ic{font-size:3rem;margin-bottom:10px}
        .empty-t{font-size:.95rem;font-weight:800;color:var(--navy);margin-bottom:5px}

        /* RESPONSIVE */
        @media(max-width:1024px){
          .ppage{grid-template-columns:1fr}
          .side-menu{position:static;display:flex;overflow-x:auto;border-radius:var(--r3)}
          .side-menu .sm-head{display:none}
          .sm-item{padding:12px 16px;white-space:nowrap;border-left:none;border-bottom:3px solid transparent}
          .sm-item.on{border-left:none;border-bottom-color:var(--teal);background:var(--tlt)}
          .sm-divider{display:none}
          .phero-stats{display:none}
        }
        @media(max-width:768px){
          .phero{padding:20px 14px}
          .phero-inner{flex-wrap:wrap;gap:14px}
          .ppage{padding:14px 12px 80px}
          .res-card{flex-direction:column;width:100%;max-width:100%;min-width:0;overflow:hidden}
          .res-card,.res-card *{box-sizing:border-box;max-width:100%}
          .rc-img-wrap{width:100%;height:160px;max-width:100%;min-width:0}
          .rc-body{min-width:0}
          .rc-top{min-width:0;align-items:flex-start}
          .rc-top > div:first-child{flex:1;min-width:0}
          .rc-code{flex-shrink:1;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
          .rc-rows{grid-template-columns:1fr}
          .rc-row{min-width:0;max-width:100%;flex-direction:row;overflow:hidden;flex-wrap:nowrap}
          .rc-row-v{min-width:0;flex-shrink:1;margin-left:0;text-align:left}
          .rc-footer{flex-wrap:wrap;min-width:0;max-width:100%}
          .rc-footer > div:last-child{width:100%;margin-left:0;display:flex;flex-direction:column;gap:8px}
          .rc-footer > div:last-child > button{width:100%}
          .btn-cancel, .btn-detail{width:100%}
          .profile-grid{grid-template-columns:1fr}
          .pf-group.full{grid-column:auto}
          .fav-grid{grid-template-columns:1fr}
          .qr-btns{grid-template-columns:1fr}
        }
      `}</style>

      {/* NAV */}
      <nav className="pnav">
        <Link href="/">
          <img
            className="pnav-logo"
            src="/MyLoungers_Logo-02.png"
            alt="MyLoungers"
            style={{ height: 44 }}
          />
        </Link>
        <span style={{ flex: 1 }} />
        <div ref={userMenuRef} style={{ position: "relative" }}>
          <button
            type="button"
            className="pnav-logout"
            onClick={() => setUserDropdown((v) => !v)}
          >
            {(profile.ad || "") + (profile.soyad ? " " + profile.soyad : "")} ▾
          </button>
          {userDropdown && (
            <div
              style={{
                position: "absolute",
                right: 0,
                marginTop: 8,
                minWidth: 160,
                background: "#FFFFFF",
                borderRadius: 12,
                boxShadow: "0 10px 30px rgba(15,23,42,0.18)",
                border: "1px solid #E5E7EB",
                padding: 8,
                zIndex: 260,
              }}
            >
              <Link
                href="/profil"
                className="nav-user"
                style={{
                  display: "block",
                  fontSize: ".8rem",
                  fontWeight: 700,
                  padding: "7px 10px",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "#0A1628",
                }}
                onClick={() => setUserDropdown(false)}
              >
                Profilim
              </Link>
              <button
                type="button"
                onClick={() => {
                  supabase.auth.signOut().then(() => {
                    setUserDropdown(false);
                    router.push("/");
                  });
                }}
                style={{
                  marginTop: 4,
                  width: "100%",
                  fontSize: ".78rem",
                  fontWeight: 700,
                  padding: "7px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: "#F3F4F6",
                  color: "#374151",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div className="phero">
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "flex-end", gap: 12, alignItems: "center", paddingBottom: 8 }}>
          <Link href="/" style={{ color: "rgba(255,255,255,.9)", fontSize: ".85rem", fontWeight: 700, textDecoration: "none" }}>← Ana Sayfa</Link>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/");
            }}
            style={{ fontSize: ".78rem", fontWeight: 700, padding: "6px 12px", borderRadius: 8, border: "none", background: "rgba(255,255,255,.15)", color: "#fff", cursor: "pointer" }}
          >
            Çıkış Yap
          </button>
        </div>
        <div className="phero-inner">
          <div style={{ position: "relative" }}>
            <div
              className="pavatar"
              onClick={() => setAvatarDropdown((v) => !v)}
              style={{ cursor: "pointer" }}
            >
              {avatarLetter}
            </div>
            {avatarDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: 8,
                  minWidth: 160,
                  background: "#FFFFFF",
                  borderRadius: 12,
                  boxShadow: "0 10px 30px rgba(15,23,42,0.18)",
                  border: "1px solid #E5E7EB",
                  padding: 8,
                  zIndex: 250,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  href="/"
                  className="nav-user"
                  style={{
                    display: "block",
                    fontSize: ".8rem",
                    fontWeight: 700,
                    padding: "7px 10px",
                    borderRadius: 8,
                    textDecoration: "none",
                    color: "#0A1628",
                  }}
                  onClick={() => setAvatarDropdown(false)}
                >
                  Ana Sayfa
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    supabase.auth.signOut().then(() => {
                      setAvatarDropdown(false);
                      router.push("/");
                    });
                  }}
                  style={{
                    marginTop: 4,
                    width: "100%",
                    fontSize: ".78rem",
                    fontWeight: 700,
                    padding: "7px 10px",
                    borderRadius: 8,
                    border: "none",
                    background: "#F3F4F6",
                    color: "#374151",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
          <div className="phero-info">
            <div className="phero-name">
              {profile.ad
                ? `${profile.ad}${profile.soyad ? " " + profile.soyad : ""}`
                : "Misafir"}
            </div>
            <div className="phero-email">
              {profile.email || (user as any)?.email || ""}
            </div>
            <div className="phero-badges">
              <span className="hbadge hbadge-teal">✓ E-posta Doğrulandı</span>
              <span className="hbadge hbadge-or">🏖️ Üye</span>
              <span className="hbadge hbadge-wh">📅 {memberSince}</span>
            </div>
          </div>
          <div className="phero-stats">
            <div>
              <div className="hstat-n">
                {totalReservations !== null ? totalReservations : "—"}
              </div>
              <div className="hstat-l">Rezervasyon</div>
              {iptalCount && iptalCount > 0 && (
                <div style={{ fontSize: "0.65rem", color: "#DC2626", marginTop: 2 }}>{iptalCount} iptal</div>
              )}
            </div>
            <div>
              <div className="hstat-n">
                {totalSpent !== null ? `₺${totalSpent.toLocaleString("tr-TR")}` : "—"}
              </div>
              <div className="hstat-l">Toplam Ödeme</div>
            </div>
            {totalEkYukleme !== null && totalEkYukleme > 0 && (
              <div>
                <div className="hstat-n">{totalEkYukleme !== null ? `₺${totalEkYukleme.toLocaleString("tr-TR")}` : "—"}</div>
                <div className="hstat-l">Ek Yükleme</div>
                <div style={{ fontSize: "0.65rem", color: "#64748B", marginTop: 2 }}>Nakit</div>
              </div>
            )}
            <div>
              <div className="hstat-n">{totalSiparisHarcamasi !== null ? `₺${totalSiparisHarcamasi.toLocaleString("tr-TR")}` : "—"}</div>
              <div className="hstat-l">Kalan Bakiye</div>
            </div>
          </div>
        </div>
      </div>

      {/* QR BÖLÜMÜ */}
      <div style={{background:"#fff",borderBottom:"1px solid var(--bd)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"16px 20px"}}>
          <div>
            <div className="sec-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/></svg>
              Şezlong Girişi
            </div>
            <div className="qr-btns">
              <button
                className="qr-btn qr-btn-primary"
                onClick={async () => {
                  const scanned = window.prompt("QR kodu okutun / kodu girin:");
                  if (!scanned) return;
                  await activateReservationByCode(scanned, "qr");
                }}
              >
                <span className="qr-btn-ico">📷</span>
                <span><span className="qr-btn-title">QR Oku</span><span className="qr-btn-sub">Kameranı kullanarak okutun</span></span>
              </button>
              <button className="qr-btn qr-btn-secondary" onClick={() => setKodModal(true)}>
                <span className="qr-btn-ico">⌨️</span>
                <span><span className="qr-btn-title">Kod Gir</span><span className="qr-btn-sub">Şezlong kodunu girerek giriş yap</span></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE */}
      <div className="ppage">

        {/* SOL MENÜ */}
        <nav className="side-menu">
          <div className="sm-head">Hesabım</div>
          {[
            {id:"reservations", ic:"🏖️", label:"Rezervasyonlarım", cnt:reservations.length, cntColor:"var(--or)"},
            {id:"orders", ic:"📦", label:"Siparişlerim", cnt:orders.filter(o => o.durumKey !== SIPARIS_DURUM.TESLIM_EDILDI).length, cntColor:"var(--or)"},
            {id:"reviews", ic:"💬", label:"Yorumlarım", cnt:userReviews.length, cntColor:"var(--teal)"},
            {id:"favorites", ic:"❤️", label:"Favorilerim", cnt:favorites.length, cntColor:"var(--teal)"},
            {id:"notifications", ic:"🔔", label:"Bildirimler", cnt:bildirimler.filter(b => !b.okundu).length, cntColor:"var(--or)"},
          ].map(item => (
            <button key={item.id} className={`sm-item${activeTab===item.id?" on":""}`} onClick={() => setActiveTab(item.id)}>
              <span style={{fontSize:"1rem",width:22,textAlign:"center"}}>{item.ic}</span>
              {item.label}
              {item.cnt > 0 && <span className="sm-cnt" style={{background:item.cntColor}}>{item.cnt}</span>}
            </button>
          ))}
          <hr className="sm-divider" />
          {[
            {id:"profile", ic:"👤", label:"Profil Bilgileri"},
            {id:"security", ic:"🔒", label:"Güvenlik"},
          ].map(item => (
            <button key={item.id} className={`sm-item${activeTab===item.id?" on":""}`} onClick={() => setActiveTab(item.id)}>
              <span style={{fontSize:"1rem",width:22,textAlign:"center"}}>{item.ic}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* SAĞ İÇERİK */}
        <div>

          {/* REZERVASYONLARIM */}
          {activeTab === "reservations" && (
            <div>
              <div className="sec-head">
                <div><div className="sec-title">🏖️ Rezervasyonlarım</div><div className="sec-sub">Tüm geçmiş ve yaklaşan rezervasyonlarınız</div></div>
              </div>
              <div className="filter-tabs">
                {[
                  {val:"all", label:"Tümü", cnt:reservations.length},
                  {val:"upcoming", label:"Yaklaşan", cnt:statusCount("upcoming")},
                  {val:"active", label:"Aktif", cnt:statusCount("active")},
                  {val:"past", label:"Geçmiş", cnt:statusCount("past")},
                  {val:"cancel", label:"İptal", cnt:statusCount("cancel")},
                ].map(f => (
                  <button key={f.val} className={`ftab${resFilter===f.val?" on":""}`} onClick={() => setResFilter(f.val)}>
                    {f.label} <span style={{opacity:.7,fontSize:".6rem"}}>({f.cnt})</span>
                  </button>
                ))}
              </div>
              {filteredRes.length === 0 && (
                <div className="empty-state"><div className="empty-ic">🏖️</div><div className="empty-t">Rezervasyon bulunamadı</div></div>
              )}
              {filteredRes.map(r => (
                <div key={r.id} className="res-card">
                  <div className="rc-img-wrap">
                    <img className="rc-img" src={r.img} alt={r.name} />
                    <span className="rc-status" style={Object.fromEntries(r.statusCss.split(";").filter(Boolean).map(s => { const [k,v]=s.split(":"); return [k.trim().replace(/-([a-z])/g,(_:string,c:string)=>c.toUpperCase()),v?.trim()]; }))}>{r.statusTxt}</span>
                  </div>
                  <div className="rc-body">
                    <div className="rc-top">
                      <div>
                        <div className="rc-name">{r.name}</div>
                        <div className="rc-meta">
                          <span className="rc-cat">{r.cat}</span>
                          <span className="rc-loc">📍 {r.loc}</span>
                        </div>
                      </div>
                      <div className="rc-code" title={String(r.id)} style={{display:"inline-flex",alignItems:"center",gap:4}}>
                        <span>{r.code}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(r.code || "");
                              setCopiedId(r.id);
                              setTimeout(() => setCopiedId(null), 1500);
                            } catch {
                              // Clipboard erişimi reddedilirse sessizce geç.
                            }
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.7rem",
                            padding: "2px 6px",
                            marginLeft: 4,
                            color: copiedId === r.id ? "#16A34A" : "var(--tdk)",
                          }}
                          aria-label="Rezervasyon kodunu kopyala"
                          title={copiedId === r.id ? "Kopyalandı" : "Kopyala"}
                        >
                          {copiedId === r.id ? "✓" : "📋"}
                        </button>
                      </div>
                    </div>
                    <div className="rc-rows">
                      <div className="rc-row"><span>📅</span><span className="rc-row-t">Tarih</span><span className="rc-row-v">{r.dates}</span></div>
                      <div className="rc-row"><span>🛏</span><span className="rc-row-t">Şezlong</span><span className="rc-row-v" style={{ whiteSpace: 'pre-line' }}>{r.szl}</span></div>
                      <div className="rc-row"><span>📆</span><span className="rc-row-t">Süre</span><span className="rc-row-v">{r.gun}</span></div>
                      <div className="rc-row"><span>💰</span><span className="rc-row-t">Ödenen</span><span className="rc-row-v" style={{color:"#16A34A"}}>₺{((r as any).bakiyeYuklenen ?? 0).toLocaleString("tr-TR")}</span></div>
                      <div className="rc-row"><span>💳</span><span className="rc-row-t">Kalan</span><span className="rc-row-v" style={{color: ((r as any).bakiyeKalan ?? 0) > 0 ? "#0891B2" : "#94A3B8"}}>₺{((r as any).bakiyeKalan ?? 0).toLocaleString("tr-TR")}</span></div>
                    </div>
                    {(() => {
                      const cagri = aktifCagrilar[String(r.id)];
                      if (!cagri) return null;
                      const nowMs = tick >= 0 ? Date.now() : Date.now();
                      const createdMs = new Date(cagri.createdAt).getTime();

                      // Aşama 3: varis_tarihi dolu
                      if (cagri.varisTarihi) {
                        const varisMs = new Date(cagri.varisTarihi).getTime();
                        if (nowMs - varisMs > 60000) return null;
                        const sureSn = cagri.varisSuresi ?? Math.round((varisMs - createdMs) / 1000);
                        return (
                          <div style={{ padding:"8px 12px", borderRadius:8, margin:"6px 0 2px", background:"rgba(8,145,178,0.08)", border:"1px solid rgba(8,145,178,0.25)", fontSize:".75rem", color:"#0C4A6E", fontWeight:500 }}>
                            💚 Garson şezlongunuza geldi &bull; Süre: {formatSure(sureSn)}
                          </div>
                        );
                      }

                      // Aşama 2: yanit_tarihi dolu, varis yok
                      if (cagri.yanitTarihi) {
                        const yanitMs = new Date(cagri.yanitTarihi).getTime();
                        const sureSn = cagri.yanitSuresi ?? Math.round((yanitMs - createdMs) / 1000);
                        return (
                          <div style={{ padding:"8px 12px", borderRadius:8, margin:"6px 0 2px", background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)", fontSize:".75rem", color:"#065F46", fontWeight:500 }}>
                            ✅ Garson yolda &bull; Yanıt süresi: {formatSure(sureSn)}
                          </div>
                        );
                      }

                      // Aşama 1: bekliyor
                      const dakikaOnce = Math.max(0, Math.round((nowMs - createdMs) / 60000));
                      const zamanMetni = dakikaOnce === 0 ? "Az önce" : `${dakikaOnce} dk önce`;
                      return (
                        <div style={{ padding:"8px 12px", borderRadius:8, margin:"6px 0 2px", background:"rgba(245,130,31,0.08)", border:"1px solid rgba(245,130,31,0.25)", fontSize:".75rem", color:"#92400E", fontWeight:500 }}>
                          🔔 Garson çağrısı gönderildi &bull; {zamanMetni}
                        </div>
                      );
                    })()}
                    <div className="rc-footer">
                      {"stars" in r && r.stars && <span className="rc-stars">{"★".repeat(r.stars as number)}{"☆".repeat(5-(r.stars as number))}</span>}
                      {"review" in r && r.review && <button className="btn-review" onClick={() => { setReviewTarget(r.id); setReviewModal(true); }}>⭐ Değerlendir</button>}
                      <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
                        {(() => {
                          const aktifVeOnayli = r.status === "active" && r.girisYapildi === true && r.durum === "onaylandi";
                          const kilit = garsonCagriCooldown[String(r.id)];
                          const cagriKilitli = !!kilit && kilit > Date.now();
                          return (
                            <>
                        {r.status !== "cancel" && r.status !== "past" && (() => {
                          const sonuc = iptalEdilebilirMi(
                            { baslangic_tarih: r.tarihBaslangic },
                            { iptal_saat_oncesi: r.iptalSaatOncesi, calisma_saatleri: r.calismaSaatleri }
                          );
                          if (sonuc.edilebilir) {
                            return <button className="btn-cancel" onClick={() => cancelRes(r.id)}>İptal Et</button>;
                          }
                          return (
                            <button
                              className="btn-cancel"
                              onClick={() => setCancelError(`İptal süresi dolmuştur. Bu rezervasyon için iptal işlemi en az ${sonuc.gerekenSaat} saat önce yapılmalıydı. Lütfen tesis ile iletişime geçin.`)}
                              style={{ opacity: 0.5, cursor: "not-allowed", background: "#9CA3AF", borderColor: "#9CA3AF" }}
                              title="İptal süresi geçmiş"
                            >
                              İptal Et
                            </button>
                          );
                        })()}
                        {r.status === "active" && (r.durum === "aktif" || r.durum === "onaylandi") && (
                          <button
                            type="button"
                            className="btn-detail"
                            style={{
                              background: r.girisYapildi === true && r.durum === "onaylandi" ? "#F59E0B" : "#9CA3AF",
                              color: "#fff",
                              borderColor: r.girisYapildi === true && r.durum === "onaylandi" ? "#F59E0B" : "#9CA3AF",
                              opacity: r.girisYapildi === true && r.durum === "onaylandi" ? 1 : 0.75,
                            }}
                            onClick={() => {
                              if (r.girisYapildi === true && r.durum === "onaylandi") {
                                router.push("/siparis/" + r.id + "?tesis_id=" + (r.tesisId || ""));
                                return;
                              }
                              showToast("🔒 Önce şezlong girişinizi yapın. Yukarıdaki QR Oku veya Kod Gir ile şezlong kodunuzu doğrulayın.", "error");
                            }}
                          >
                            {r.girisYapildi === true && r.durum === "onaylandi" ? "🍽️ Sipariş Ver" : "🔒 Sipariş Ver"}
                          </button>
                        )}
                        {aktifVeOnayli && (
                          <button
                            type="button"
                            className="btn-detail"
                            disabled={cagriKilitli}
                            style={{
                              background: cagriKilitli ? "#FCA5A5" : "#EF4444",
                              color: "#fff",
                              borderColor: cagriKilitli ? "#FCA5A5" : "#EF4444",
                              opacity: cagriKilitli ? 0.8 : 1,
                              cursor: cagriKilitli ? "not-allowed" : "pointer",
                            }}
                            onClick={() => garsonCagir(r)}
                          >
                            {cagriKilitli ? "✅ Çağrıldı" : "🔔 Garson Çağır"}
                          </button>
                        )}
                        <button
                          className="btn-detail"
                          onClick={() => {
                            if (r.girisYapildi !== true) {
                              alert("Sipariş verebilmek için önce QR/Kod ile giriş yapmalısınız.");
                              return;
                            }
                            router.push("/tesis/" + (r.slug || r.name.trim().toLowerCase().replace(/\s+/g, "-")));
                          }}
                        >
                          Tesise Git →
                        </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SİPARİŞLERİM */}
          {activeTab === "orders" && (() => {
            const DURUM_META: Record<string, { label: string; ic: string; color: string; step: number }> = {
              [SIPARIS_DURUM.YENI]:          { label: "Sipariş Alındı",   ic: "📦", color: "#F59E0B", step: 0 },
              [SIPARIS_DURUM.HAZIRLANIYOR]:  { label: "Hazırlanıyor",     ic: "🍳", color: "#F5821F", step: 1 },
              [SIPARIS_DURUM.HAZIR]:         { label: "Hazır",            ic: "✅", color: "#16A34A", step: 2 },
              [SIPARIS_DURUM.YOLDA]:         { label: "Yolda",            ic: "🛵", color: "#2563EB", step: 3 },
              [SIPARIS_DURUM.TESLIM_EDILDI]: { label: "Teslim Edildi",    ic: "✓",  color: "#6B7280", step: 4 },
            };
            const PROGRESS_STEPS = ["Alındı", "Hazırlanıyor", "Hazır", "Yolda", "Teslim"];

            function ProgressBar({ step }: { step: number }) {
              return (
                <div className="order-progress">
                  {PROGRESS_STEPS.map((lbl, i) => {
                    const done = i < step;
                    const active = i === step;
                    return (
                      <div key={i} className="op-step" style={{ "--line-color": done ? "#22C55E" : "#E5E7EB" } as React.CSSProperties}>
                        {i < PROGRESS_STEPS.length - 1 && (
                          <div style={{ position: "absolute", top: 11, left: "50%", width: "100%", height: 2, background: done ? "#22C55E" : "#E5E7EB", zIndex: 0 }} />
                        )}
                        <div className={`op-dot ${done ? "op-dot-done" : active ? "op-dot-active" : "op-dot-future"}`}>
                          {done ? "✓" : i + 1}
                        </div>
                        <div className={`op-label ${done ? "op-label-done" : active ? "op-label-active" : ""}`}>{lbl}</div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            const aktifSiparisler = orders.filter(o => o.durumKey !== SIPARIS_DURUM.TESLIM_EDILDI);
            const gecmisSiparisler = orders.filter(o => o.durumKey === SIPARIS_DURUM.TESLIM_EDILDI);

            return (
              <div>
                <div className="sec-head">
                  <div>
                    <div className="sec-title">📦 Siparişlerim</div>
                    <div className="sec-sub">Aktif siparişleriniz ve bugünkü teslimler</div>
                  </div>
                </div>

                {ordersLoading && (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--i3)", fontSize: ".85rem" }}>Siparişler yükleniyor...</div>
                )}

                {!ordersLoading && aktifSiparisler.length === 0 && gecmisSiparisler.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-ic">📦</div>
                    <div className="empty-t">Henüz siparişiniz yok</div>
                    <div style={{ fontSize: ".78rem", marginTop: 4 }}>Aktif rezervasyonunuzdan sipariş verebilirsiniz.</div>
                  </div>
                )}

                {/* Aktif Siparişlerim — yeni tasarım */}
                {aktifSiparisler.length > 0 && (() => {
                  const stages = [
                    { key: "yeni",          label: "Alındı",  icon: "✓"  },
                    { key: "hazirlaniyor",  label: "Hazırlanıyor", icon: "🍳" },
                    { key: "hazir",         label: "Hazır",   icon: "🔔" },
                    { key: "yolda",         label: "Yolda",   icon: "🛵" },
                    { key: "teslim_edildi", label: "Teslim",  icon: "✅" },
                  ];
                  const stageOrder = stages.map((s) => s.key);

                  const chipConfig: Record<string, { bg: string; color: string; text: string }> = {
                    yeni:         { bg: "rgba(245,130,31,0.12)", color: "#F5821F",  text: "📥 Sipariş Alındı" },
                    hazirlaniyor: { bg: "rgba(234,179,8,0.12)",  color: "#CA8A04",  text: "🍳 Hazırlanıyor"   },
                    hazir:        { bg: "rgba(16,185,129,0.12)", color: "#10B981",  text: "🔔 Hazır"           },
                    yolda:        { bg: "rgba(59,130,246,0.15)", color: "#3B82F6",  text: "🛵 Garson Yolda"   },
                  };

                  const durumMesajlari: Record<string, string> = {
                    yeni:         "📥 Siparişiniz alındı, mutfağa iletildi",
                    hazirlaniyor: "🍳 Mutfak sizin için hazırlıyor",
                    hazir:        "🔔 Siparişiniz hazır, garson alacak",
                    yolda:        "🛵 Garson size doğru geliyor",
                  };

                  return (
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", marginBottom: 12, marginTop: 8 }}>
                        🍳 Aktif Siparişleriniz ({aktifSiparisler.length})
                      </h3>
                      {aktifSiparisler.map((o) => {
                        const currentIndex = stageOrder.indexOf(o.durumKey);
                        const chip = chipConfig[o.durumKey] ?? chipConfig["yeni"];
                        const toplamHesap = o.urunler.reduce((s, u) => s + u.fiyat * u.adet, 0);
                        const toplamGoster = toplamHesap > 0 ? toplamHesap : o.toplam;
                        const progressPct = currentIndex > 0
                          ? (currentIndex / (stageOrder.length - 1)) * 80
                          : 0;

                        return (
                          <div
                            key={o.id}
                            style={{
                              background: "white",
                              border: "1px solid rgba(10,186,181,0.25)",
                              borderRadius: 16,
                              padding: 20,
                              marginBottom: 14,
                              boxShadow: "0 2px 16px rgba(10,186,181,0.10)",
                            }}
                          >
                            {/* Üst satır */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#0A1628" }}>
                                  Sipariş #{o.id.slice(0, 5)}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,0,0,0.6)", marginTop: 2 }}>
                                  {o.tesisAd}
                                </div>
                              </div>
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ background: chip.bg, color: chip.color, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, display: "inline-block", whiteSpace: "nowrap" }}>
                                  {chip.text}
                                </div>
                                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.55)", marginTop: 4 }}>
                                  {formatZamanOnce(o.createdAt)}
                                </div>
                              </div>
                            </div>

                            {/* Ürün listesi */}
                            <div style={{ marginTop: 14, fontSize: 13, color: "rgba(0,0,0,0.7)", display: "flex", flexWrap: "wrap", gap: "3px 6px" }}>
                              {o.urunler.map((u, i) => (
                                <span key={i}>
                                  {u.isim} ×{u.adet}{i < o.urunler.length - 1 ? " ·" : ""}
                                </span>
                              ))}
                            </div>

                            {/* Toplam */}
                            <div style={{ marginTop: 8, textAlign: "right", fontSize: 14, fontWeight: 700, color: "#0A1628" }}>
                              ₺{toplamGoster.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                            </div>

                            {/* Progress bar */}
                            <div style={{ marginTop: 18, marginBottom: 8, position: "relative" }}>
                              {/* Arka plan çizgisi */}
                              <div style={{ position: "absolute", top: 14, left: "10%", right: "10%", height: 2, background: "rgba(0,0,0,0.08)", zIndex: 0 }} />
                              {/* Yeşil ilerleme */}
                              {currentIndex > 0 && (
                                <div style={{ position: "absolute", top: 14, left: "10%", width: `${progressPct}%`, height: 2, background: "#10B981", zIndex: 1, transition: "width 0.4s ease" }} />
                              )}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 2 }}>
                                {stages.map((stage, idx) => {
                                  const isDone   = idx < currentIndex;
                                  const isActive = idx === currentIndex;
                                  const circleSize = isActive ? 34 : 28;
                                  return (
                                    <div key={stage.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 40 }}>
                                      <div
                                        className={isActive ? "siparis-aktif-asama" : ""}
                                        style={{
                                          width: circleSize,
                                          height: circleSize,
                                          borderRadius: "50%",
                                          background: isDone ? "#10B981" : isActive ? "#F5821F" : "rgba(0,0,0,0.08)",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontSize: isActive ? 16 : 12,
                                          color: isDone || isActive ? "white" : "rgba(0,0,0,0.35)",
                                          fontWeight: isDone ? 700 : 500,
                                          transition: "all 0.3s ease",
                                          flexShrink: 0,
                                        }}
                                      >
                                        {isDone ? "✓" : stage.icon}
                                      </div>
                                      <div style={{
                                        fontSize: 10,
                                        fontWeight: isDone ? 600 : isActive ? 700 : 500,
                                        color: isDone ? "#10B981" : isActive ? "#F5821F" : "rgba(0,0,0,0.35)",
                                        marginTop: 5,
                                        textAlign: "center",
                                        whiteSpace: "normal",
                                        lineHeight: 1.2,
                                        wordBreak: "break-word",
                                      }}>
                                        {stage.label}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Durum mesajı */}
                            {durumMesajlari[o.durumKey] && (
                              <div style={{ marginTop: 14, fontSize: 12, color: "rgba(0,0,0,0.6)", textAlign: "center" }}>
                                {durumMesajlari[o.durumKey]}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Geçmiş siparişler accordion */}
                {gecmisSiparisler.length > 0 && (
                  <div>
                    <button className="gecmis-btn" onClick={() => setGecmisAcik(v => !v)}>
                      <span>Bugün Teslim Edildi ({gecmisSiparisler.length})</span>
                      <span style={{ fontSize: ".8rem" }}>{gecmisAcik ? "▲" : "▼"}</span>
                    </button>
                    {gecmisAcik && (
                      <div style={{ marginTop: 8 }}>
                        {gecmisSiparisler.map(o => {
                          const sureLabel = o.sureDakika < 60 ? `${o.sureDakika} dk önce` : `${Math.floor(o.sureDakika / 60)} sa önce`;
                          return (
                            <div key={o.id} className="gecmis-card">
                              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                                <div>
                                  <span style={{ fontSize: ".78rem", fontWeight: 800, color: "var(--navy)" }}>Sipariş #{o.id.slice(-5)}</span>
                                  <span style={{ fontSize: ".68rem", color: "var(--i3)", marginLeft: 8 }}>{o.tesisAd}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: ".6rem", color: "var(--i3)" }}>{sureLabel}</span>
                                  <span style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0", borderRadius: 6, padding: "2px 8px", fontSize: ".62rem", fontWeight: 800 }}>✓ Teslim</span>
                                </div>
                              </div>
                              <div style={{ fontSize: ".72rem", color: "var(--i3)" }}>
                                {o.urunler.map((u, i) => (
                                  <span key={i}>{u.isim} ×{u.adet}{i < o.urunler.length - 1 ? " · " : ""}</span>
                                ))}
                              </div>
                              <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--navy)", textAlign: "right", marginTop: 6 }}>
                                ₺{o.toplam.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* SİPARİŞ GEÇMİŞİM - YENİ BÖLÜM */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: 0 }}>
                      📋 Sipariş Geçmişim
                    </h3>
                  </div>

                  {/* Filter chip'leri */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                    {[
                      { key: "bugun", label: "Bugün" },
                      { key: "hafta", label: "Bu Hafta" },
                      { key: "ay", label: "Bu Ay" },
                      { key: "tumu", label: "Tümü" },
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setGecmisFilter(f.key as any)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 999,
                          fontSize: ".75rem",
                          fontWeight: 700,
                          border: "1px solid " + (gecmisFilter === f.key ? "var(--or)" : "var(--bd)"),
                          background: gecmisFilter === f.key ? "var(--or)" : "#fff",
                          color: gecmisFilter === f.key ? "#fff" : "var(--i3)",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {gecmisTumLoading ? (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "var(--i3)", fontSize: ".85rem" }}>
                      Geçmiş siparişler yükleniyor...
                    </div>
                  ) : gecmisTumSiparisler.length === 0 ? (
                    <div style={{ background: "#fff", border: "1px solid var(--bd)", borderRadius: "var(--r4)", padding: 18, textAlign: "center", color: "var(--i3)", fontSize: ".85rem" }}>
                      Bu dönemde sipariş bulunamadı.
                    </div>
                  ) : (() => {
                    const gruplar: Record<string, MusteriSiparis[]> = {};
                    gecmisTumSiparisler.forEach(o => {
                      const d = new Date(o.createdAt);
                      const key = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });
                      if (!gruplar[key]) gruplar[key] = [];
                      gruplar[key].push(o);
                    });

                    return (
                      <div>
                        {Object.entries(gruplar).map(([tarih, siparisler]) => (
                          <div key={tarih} style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: ".7rem", fontWeight: 700, color: "var(--i3)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, paddingLeft: 2 }}>
                              ── {tarih} ──
                            </div>
                            {siparisler.map(o => {
                              const saat = new Date(o.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
                              return (
                                <div key={o.id} className="gecmis-card" style={{ marginBottom: 8 }}>
                                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                                    <div>
                                      <span style={{ fontSize: ".78rem", fontWeight: 800, color: "var(--navy)" }}>Sipariş #{o.id.slice(-5)}</span>
                                      <span style={{ fontSize: ".68rem", color: "var(--i3)", marginLeft: 8 }}>{o.tesisAd}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <span style={{ fontSize: ".6rem", color: "var(--i3)" }}>{saat}</span>
                                      <span style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0", borderRadius: 6, padding: "2px 8px", fontSize: ".62rem", fontWeight: 800 }}>✓ Teslim</span>
                                    </div>
                                  </div>
                                  <div style={{ fontSize: ".72rem", color: "var(--i3)" }}>
                                    {o.urunler.map((u, i) => (
                                      <span key={i}>{u.isim} ×{u.adet}{i < o.urunler.length - 1 ? " · " : ""}</span>
                                    ))}
                                  </div>
                                  <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--navy)", textAlign: "right", marginTop: 6 }}>
                                    ₺{o.toplam.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()}

          {/* FAVORİLER */}
          {activeTab === "favorites" && (
            <div>
              <div className="sec-head"><div><div className="sec-title">❤️ Favorilerim</div><div className="sec-sub">Kaydettiğiniz tesisler</div></div></div>
              {favorites.length === 0 ? (
                <div style={{background:"#fff",border:"1px solid var(--bd)",borderRadius:"var(--r4)",boxShadow:"var(--sh)",padding:22,textAlign:"center",color:"var(--i3)"}}>
                  <div style={{fontSize:"2rem",opacity:.4}}>🤍</div>
                  <div style={{fontSize:".85rem",marginTop:8}}>Henüz favori tesisiniz yok.</div>
                  <div style={{fontSize:".78rem",marginTop:4}}>Beğendiğiniz tesislerde kalp ikonuna tıklayarak favorilere ekleyebilirsiniz.</div>
                </div>
              ) : (
                <div>
                  {favorites.map((item) => (
                    <div key={item.id} style={{display:"flex",flexDirection:"row",border:"1px solid #eee",borderRadius:12,overflow:"hidden",marginBottom:16,background:"#fff",position:"relative"}}>
                      <img
                        src={Array.isArray(item.tesis?.fotograflar) && item.tesis.fotograflar[0]?.src ? item.tesis.fotograflar[0].src : "/logo.png"}
                        alt={item.tesis?.ad}
                        style={{width:140,height:110,objectFit:"cover",flexShrink:0}}
                      />
                      <div style={{padding:"12px 16px",flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between",minWidth:"120px"}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:"1rem",color:"var(--navy)"}}>{item.tesis?.ad}</div>
                          <div style={{fontSize:"0.8rem",color:"#666",marginTop:4}}>{item.tesis?.ilce} / {item.tesis?.sehir}</div>
                          <div style={{fontSize:"0.8rem",color:"#F59E0B",marginTop:2}}>
                            {"★".repeat(Math.round(item.tesis?.puan || 0))} {item.tesis?.puan}
                          </div>
                        </div>
                        <div style={{display:"flex",justifyContent:"flex-end"}}>
                          <a
                            href={`/tesis/${item.tesis?.slug}`}
                            style={{position:"absolute",right:16,bottom:12,background:"var(--orange)",color:"#1a1a1a",padding:"8px 16px",borderRadius:8,fontSize:"0.85rem",fontWeight:600,textDecoration:"none",whiteSpace:"nowrap",zIndex:10,opacity:1,visibility:"visible"}}
                          >
                            Şezlong Seç →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BİLDİRİMLER */}
          {activeTab === "notifications" && (
            <div>
              <div className="sec-head">
                <div>
                  <div className="sec-title">🔔 Bildirimler</div>
                  <div className="sec-sub">Garson çağrılarınız ve bildirimler</div>
                </div>
              </div>
              {bildirimlerLoading ? (
                <div style={{background:"#fff",border:"1px solid var(--bd)",borderRadius:"var(--r4)",boxShadow:"var(--sh)",padding:22,color:"var(--i3)",fontSize:".85rem"}}>
                  Bildirimler yükleniyor...
                </div>
              ) : bildirimler.length === 0 ? (
                <div style={{background:"#fff",border:"1px solid var(--bd)",borderRadius:"var(--r4)",boxShadow:"var(--sh)",padding:22,textAlign:"center",color:"var(--i3)"}}>
                  <div style={{fontSize:"2rem",opacity:.4}}>🔕</div>
                  <div style={{fontSize:".85rem",marginTop:8}}>Henüz bildiriminiz yok.</div>
                  <div style={{fontSize:".78rem",marginTop:4}}>Rezervasyonlarınız ve kampanyalarla ilgili güncellemeler burada görünecek.</div>
                </div>
              ) : (
                <div>
                  {bildirimler.map((b) => {
                    const rez = reservations.find((r) => String(r.id) === String(b.rezervasyon_id));
                    const tesisAd = rez?.name ?? "Tesis";
                    const tarih = new Date(b.created_at).toLocaleDateString("tr-TR", { day:"numeric", month:"short", year:"numeric" });
                    const saat = new Date(b.created_at).toLocaleTimeString("tr-TR", { hour:"2-digit", minute:"2-digit" });

                    let altBilgi: ReactNode;
                    if (b.varis_tarihi) {
                      const yanitSn = b.yanit_suresi_saniye != null
                        ? b.yanit_suresi_saniye
                        : (b.yanit_tarihi ? Math.round((new Date(b.yanit_tarihi).getTime() - new Date(b.created_at).getTime()) / 1000) : 0);
                      const varisSn = b.varis_suresi_saniye != null
                        ? b.varis_suresi_saniye
                        : Math.round((new Date(b.varis_tarihi).getTime() - new Date(b.created_at).getTime()) / 1000);
                      altBilgi = (
                        <span style={{color:"#0891B2"}}>
                          ✓ Yolda: {formatSure(yanitSn)} &bull; ✓ Vardı: {formatSure(varisSn)}
                        </span>
                      );
                    } else if (b.yanit_tarihi) {
                      const yanitSn = b.yanit_suresi_saniye != null
                        ? b.yanit_suresi_saniye
                        : Math.round((new Date(b.yanit_tarihi).getTime() - new Date(b.created_at).getTime()) / 1000);
                      altBilgi = (
                        <span>
                          <span style={{color:"#16A34A"}}>✓ Yanıtlandı: {formatSure(yanitSn)}</span>
                          <span style={{color:"#6B7280"}}> &bull; ⏳ Henüz gelmedi</span>
                        </span>
                      );
                    } else if (!b.okundu) {
                      const gecenDakika = Math.round((Date.now() - new Date(b.created_at).getTime()) / 60000);
                      if (gecenDakika >= 5) {
                        altBilgi = <span style={{color:"#DC2626"}}>⚠️ Yanıtlanmadı</span>;
                      } else {
                        altBilgi = <span style={{color:"#D97706"}}>⏳ Bekliyor</span>;
                      }
                    } else {
                      altBilgi = <span style={{color:"#16A34A"}}>✅ Yanıtlandı</span>;
                    }

                    return (
                      <div key={b.id} className="gecmis-card" style={{marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
                          <div>
                            <span style={{fontSize:".78rem",fontWeight:800,color:"var(--navy)"}}>🔔 Garson çağrısı</span>
                            <span style={{fontSize:".68rem",color:"var(--i3)",marginLeft:8}}>{tesisAd}</span>
                          </div>
                          <div style={{fontSize:".65rem",color:"var(--i3)",whiteSpace:"nowrap",textAlign:"right",lineHeight:1.6}}>
                            {tarih}<br/>{saat}
                          </div>
                        </div>
                        <div style={{fontSize:".73rem"}}>{altBilgi}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* YORUMLARIM */}
          {activeTab === "reviews" && (
            <div>
              <div className="sec-head"><div><div className="sec-title">💬 Yorumlarım</div><div className="sec-sub">Yaptığınız yorumlar ve onay durumları</div></div></div>
              {reviewsLoading ? (
                <div style={{background:"#fff",border:"1px solid var(--bd)",borderRadius:"var(--r4)",boxShadow:"var(--sh)",padding:22,color:"var(--i3)",fontSize:".85rem"}}>
                  Yorumlar yükleniyor...
                </div>
              ) : userReviews.length === 0 ? (
                <div style={{background:"#fff",border:"1px solid var(--bd)",borderRadius:"var(--r4)",boxShadow:"var(--sh)",padding:22,textAlign:"center",color:"var(--i3)"}}>
                  <div style={{fontSize:"2rem",opacity:.4}}>💬</div>
                  <div style={{fontSize:".85rem",marginTop:8}}>Henüz yorumunuz yok.</div>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {userReviews.map((item) => (
                    <div key={item.id} style={{background:"#fff",border:"1px solid var(--bd)",borderRadius:"var(--r4)",boxShadow:"var(--sh)",padding:16}}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:8}}>
                        <div style={{fontSize:".9rem",fontWeight:700,color:"var(--navy)"}}>
                          {Array.isArray(item.tesis) ? item.tesis[0]?.ad : item.tesis?.ad || "Tesis"}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:".75rem",fontWeight:700,color:"#F59E0B"}}>{"★".repeat(item.puan || 0)}</span>
                          <span style={{fontSize:".7rem",fontWeight:700,padding:"2px 8px",borderRadius:999,background:item.durum === "onaylı" ? "#DCFCE7" : "#FEF3C7",color:item.durum === "onaylı" ? "#15803D" : "#92400E"}}>
                            {item.durum}
                          </span>
                        </div>
                      </div>
                      <p style={{fontSize:".82rem",color:"var(--i2)",margin:0,lineHeight:1.55}}>{item.yorum}</p>
                      <div style={{marginTop:8,fontSize:".72rem",color:"var(--i3)"}}>
                        {new Date(item.created_at).toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFİL */}
          {activeTab === "profile" && (
            <div>
              <div className="sec-head"><div><div className="sec-title">👤 Profil Bilgileri</div><div className="sec-sub">Kişisel bilgilerinizi güncelleyin</div></div></div>
              <div style={{background:"#fff",border:"1px solid var(--bd)",borderRadius:"var(--r4)",boxShadow:"var(--sh)",padding:22}}>
                <div className="profile-grid">
                  <div className="pf-group"><label className="pf-label">Ad</label><input className="pf-input" value={profile.ad} onChange={e=>setProfile(p=>({...p,ad:e.target.value}))} /></div>
                  <div className="pf-group"><label className="pf-label">Soyad</label><input className="pf-input" value={profile.soyad} onChange={e=>setProfile(p=>({...p,soyad:e.target.value}))} /></div>
                  <div className="pf-group"><label className="pf-label">Telefon</label><input className="pf-input" type="tel" value={profile.tel} onChange={e=>setProfile(p=>({...p,tel:e.target.value}))} /></div>
                  <div className="pf-group"><label className="pf-label">E-posta</label><input className="pf-input" type="email" value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} /></div>
                  <div className="pf-group full"><label className="pf-label">Doğum Tarihi</label><input className="pf-input" type="date" value={profile.dogum} onChange={e=>setProfile(p=>({...p,dogum:e.target.value}))} /></div>
                  <div className="pf-group full"><label className="pf-label">Şehir</label><input className="pf-input" value={profile.sehir} onChange={e=>setProfile(p=>({...p,sehir:e.target.value}))} /></div>
                </div>
                <div style={{marginTop:18,display:"flex",justifyContent:"flex-end"}}>
                  <button className={`pf-save${saveOk?" ok":""}`} onClick={saveProfile}>
                    {saveOk ? "✓ Kaydedildi" : "💾 Değişiklikleri Kaydet"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GÜVENLİK */}
          {activeTab === "security" && (
            <div>
              <div className="sec-head"><div><div className="sec-title">🔒 Güvenlik</div><div className="sec-sub">Hesap güvenliği ve gizlilik</div></div></div>
              {[
                {ic:"🔑", t:"Şifre", s:"Son değişiklik: 3 ay önce", btn:"Şifreyi Değiştir", danger:false},
                {ic:"📧", t:"E-posta Bildirimleri", s:"Rezervasyon ve kampanya bildirimleri açık", btn:"Ayarla", danger:false},
                {ic:"📋", t:"Veri ve Gizlilik", s:"KVKK kapsamında verilerinizi yönetin", btn:"Görüntüle", danger:false},
              ].map((item, i) => (
                <div key={i} className="sec-item" style={item.danger ? {borderColor:"#FECACA"} : {}}>
                  <span className="sec-item-ic">{item.ic}</span>
                  <div className="sec-item-body">
                    <div className="sec-item-t" style={item.danger ? {color:"#DC2626"} : {}}>{item.t}</div>
                    <div className="sec-item-s">{item.s}</div>
                  </div>
                  <button
                    className={`sec-item-btn${item.danger?" danger":""}`}
                    onClick={() => {
                      if (item.t === "Şifre") {
                        setPasswordError(null);
                        setPasswordSuccess(null);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setShowPasswordModal(true);
                      }
                    }}
                  >
                    {item.btn}
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* DEĞERLENDİRME MODAL */}
      {reviewModal && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) setReviewModal(false); setAvatarDropdown(false); }}>
          <div className="modal">
            <div className="modal-head">
              <span className="modal-title">⭐ Tesis Değerlendirmesi</span>
              <button className="modal-close" onClick={() => setReviewModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{textAlign:"center",fontSize:".78rem",color:"var(--i3)",marginBottom:12}}>Deneyiminizi puanlayın</div>
              <div className="star-row">
                {[1,2,3,4,5].map(n => (
                  <button key={n} className="star-btn" onClick={() => setReviewStars(n)} style={{fontSize:"2rem"}}>
                    {n <= reviewStars ? "★" : "☆"}
                  </button>
                ))}
              </div>
              <textarea className="review-ta" value={reviewText} onChange={e=>setReviewText(e.target.value)} placeholder="Deneyiminizi paylaşın... (opsiyonel)" />
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setReviewModal(false)}>Vazgeç</button>
              <button className="modal-submit" onClick={submitReview}>Gönder →</button>
            </div>
          </div>
        </div>
      )}

      {/* KOD GİR MODAL */}
      {kodModal && (
        <div className="modal-overlay" style={{alignItems:"flex-end"}} onClick={e => { if(e.target===e.currentTarget) setKodModal(false); setAvatarDropdown(false); }}>
          <div className="kod-sheet">
            <button className="modal-close" style={{position:"absolute",top:16,right:16}} onClick={() => setKodModal(false)}>✕</button>
            <div style={{fontSize:"1rem",fontWeight:900,marginBottom:6,color:"var(--navy)"}}>⌨️ Şezlong Kodu Gir</div>
            <div style={{fontSize:".78rem",color:"var(--i3)",marginBottom:16}}>Şezlong üzerindeki kodu girerek rezervasyonunuzu aktif edin.</div>
            <input className="kod-input" value={kodVal} onChange={e=>setKodVal(e.target.value.toUpperCase())} placeholder="MYL-DDMMYYYY-GX" maxLength={20} />
            <button className="kod-submit" onClick={submitKod}>Kodu Doğrula →</button>
          </div>
        </div>
      )}

      {/* ŞİFRE DEĞİŞTİR MODAL */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowPasswordModal(false); setAvatarDropdown(false); } }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">🔑 Şifreyi Değiştir</span>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="pf-group full">
                <label className="pf-label">Mevcut Şifre</label>
                <input
                  className="pf-input"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="pf-group full">
                <label className="pf-label">Yeni Şifre</label>
                <input
                  className="pf-input"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <div className="pf-group full">
                <label className="pf-label">Yeni Şifre Tekrar</label>
                <input
                  className="pf-input"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
              {passwordError && (
                <div style={{ fontSize: ".78rem", color: "#DC2626", marginTop: 6 }}>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div style={{ fontSize: ".78rem", color: "#16A34A", marginTop: 6 }}>
                  {passwordSuccess}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setShowPasswordModal(false)}>İptal</button>
              <button
                className="modal-submit"
                onClick={async () => {
                  setPasswordError(null);
                  setPasswordSuccess(null);
                  if (!newPassword || newPassword.length < 8) {
                    setPasswordError("Yeni şifre en az 8 karakter olmalı.");
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    setPasswordError("Yeni şifreler eşleşmiyor.");
                    return;
                  }
                  try {
                    const { error } = await supabase.auth.updateUser({ password: newPassword });
                    if (error) {
                      console.error("Şifre güncellenemedi:", error);
                      setPasswordError(error.message || "Şifre güncellenemedi.");
                      return;
                    }
                    setPasswordSuccess("Şifre güncellendi.");
                    setTimeout(() => {
                      setShowPasswordModal(false);
                    }, 1200);
                  } catch (e) {
                    console.error("Şifre güncelleme hatası:", e);
                    setPasswordError("Şifre güncellenemedi.");
                  }
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}}>
          <div style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:280,boxShadow:"0 8px 40px rgba(0,0,0,0.2)",overflow:"hidden"}}>
            <div style={{padding:"16px 18px 0",textAlign:"center"}}>
              <div style={{fontSize:"1.4rem",marginBottom:6}}>⚠️</div>
              <div style={{fontSize:".82rem",fontWeight:900,color:"#0A1628",marginBottom:4}}>Rezervasyonu İptal Et</div>
              <div style={{fontSize:".72rem",color:"#6B7280",lineHeight:1.6}}>Bu rezervasyonu iptal etmek istediğinize emin misiniz? İptal işlemi geri alınamaz ve ücret iadeniz başlatılır.<br />Ödemeniz 5 iş günü içinde kartınıza iade edilecektir.</div>
            </div>
            <div style={{padding:"12px 18px 16px",display:"flex",gap:8}}>
              <button type="button" onClick={() => setCancelModal(null)} style={{flex:1,padding:"9px",border:"1.5px solid #E5E7EB",borderRadius:9,background:"#fff",fontSize:".75rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",color:"#6B7280"}}>Vazgeç</button>
              <button type="button" onClick={confirmCancel} disabled={cancelLoading} style={{flex:1,padding:"9px",border:"none",borderRadius:9,background:cancelLoading?"#9CA3AF":"#DC2626",color:"#fff",fontSize:".75rem",fontWeight:700,cursor:cancelLoading?"not-allowed":"pointer",fontFamily:"inherit"}}>
                {cancelLoading ? "İptal ediliyor..." : "Evet, İptal Et"}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelError && (
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#DC2626",color:"#fff",padding:"12px 24px",borderRadius:12,fontSize:".85rem",fontWeight:700,zIndex:700,boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>
          ❌ {cancelError}
          <button type="button" onClick={() => setCancelError(null)} style={{marginLeft:12,background:"none",border:"none",color:"#fff",cursor:"pointer",fontWeight:900}}>✕</button>
        </div>
      )}

      <CallWaiterModal
        isOpen={showCallModal}
        onClose={() => { setShowCallModal(false); setCallModalRez(null); }}
        onConfirm={handleCallConfirm}
        tesisAdi={callModalRez?.name ?? ""}
      />
    </>
  );
}
