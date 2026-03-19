"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Reservation = {
  id: number;
  name: string;
  cat: string;
  loc: string;
  code: string;
  dates: string;
  szl: string;
  gun: string;
  odenen: string;
  status: string;
  statusTxt: string;
  statusCss: string;
  img: string;
  stars?: number;
  review?: boolean;
};

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

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reservations");
  const [resFilter, setResFilter] = useState("all");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resLoading, setResLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<number|null>(null);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [kodModal, setKodModal] = useState(false);
  const [kodVal, setKodVal] = useState("");
  const [saveOk, setSaveOk] = useState(false);
  const [totalReservations, setTotalReservations] = useState<number | null>(null);
  const [totalSpent, setTotalSpent] = useState<number | null>(null);
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

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setUserLoading(false);
    }
    loadUser();
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
    async function loadReservations() {
      if (!user) return;

      try {
        setResLoading(true);
        const userId = user?.id;

        const { data: rezData, error: rezError } = await supabase
          .from("rezervasyonlar")
          .select(
            "id, tesis_id, baslangic_tarih, bitis_tarih, kisi_sayisi, toplam_tutar, durum"
          )
          .eq("kullanici_id", userId)
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

        const tesisMap: Record<number, { ad: string; loc: string }> = {};

        if (tesisIds.length) {
          const { data: tesisData, error: tesisError } = await supabase
            .from("tesisler")
            .select("id, ad, sehir, ilce")
            .in("id", tesisIds);

          if (tesisError) {
            console.error("Profil tesis sorgu hatası:", tesisError);
          } else {
            (tesisData ?? []).forEach((t: any) => {
              const locParts = [t.ilce, t.sehir].filter(Boolean).join(", ");
              tesisMap[t.id] = {
                ad: t.ad || `Tesis #${t.id}`,
                loc: locParts || "-",
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
          } else if (startStr && startStr > today) {
            statusKey = "upcoming";
          } else if (startStr && startStr <= today && (!endStr || endStr >= today)) {
            statusKey = "active";
          } else {
            statusKey = "past";
          }

          const meta = STATUS_META[statusKey];
          const tesisInfo = r.tesis_id ? tesisMap[r.tesis_id] : undefined;

          return {
            id: r.id,
            name: tesisInfo?.ad || `Tesis #${r.tesis_id ?? ""}`,
            cat: "Beach Club",
            loc: tesisInfo?.loc || "-",
            code: `MYL-${String(r.id).padStart(4, "0")}`,
            dates,
            szl: "-",
            gun,
            odenen: `₺${Number(r.toplam_tutar || 0).toLocaleString("tr-TR")}`,
            status: statusKey,
            statusTxt: meta.txt,
            statusCss: meta.css,
            img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&fit=crop",
            stars: undefined,
            review: false,
          };
        });

        setReservations(uiRes);
        setTotalReservations(toplamRez);
        setTotalSpent(toplamTutar);
        setResLoading(false);
      } catch (e) {
        console.error("Profil rezervasyon yükleme hatası:", e);
        setResLoading(false);
      }
    }

    loadReservations();
  }, [user]);

  const filteredRes = reservations.filter(
    (r) => resFilter === "all" || r.status === resFilter
  );

  function cancelRes(id: number) {
    if (confirm("Rezervasyonu iptal etmek istediğinize emin misiniz?")) {
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status:"cancel", statusTxt:"✗ İptal", statusCss:"background:#FEF2F2;color:#DC2626;border-color:#FECACA" } : r));
    }
  }

  function submitReview() {
    if (!reviewStars) { alert("Lütfen puan seçin"); return; }
    setReservations(prev => prev.map(r => r.id === reviewTarget ? { ...r, review:false, stars:reviewStars } : r));
    setReviewModal(false);
    setReviewStars(0);
    setReviewText("");
  }

  function submitKod() {
    if (kodVal.trim().length < 3) { alert("Lütfen geçerli bir kod girin."); return; }
    setKodModal(false);
    setKodVal("");
    alert("✅ Kod doğrulandı! Şezlong aktif edildi.");
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
        dogum_tarihi: profile.dogum,
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
          .res-card{flex-direction:column}
          .rc-img-wrap{width:100%;height:160px}
          .rc-rows{grid-template-columns:1fr}
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
        <button
          className="pnav-logout"
          onClick={() => supabase.auth.signOut().then(() => router.push("/giris"))}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Çıkış
        </button>
      </nav>

      {/* HERO */}
      <div className="phero">
        <div className="phero-inner">
          <div className="pavatar">{avatarLetter}</div>
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
              <span className="hbadge hbadge-or">🏖️ Sadık Üye</span>
              <span className="hbadge hbadge-wh">📅 {memberSince}</span>
            </div>
          </div>
          <div className="phero-stats">
            <div>
              <div className="hstat-n">
                {totalReservations !== null ? totalReservations : "—"}
              </div>
              <div className="hstat-l">Rezervasyon</div>
            </div>
            <div>
              <div className="hstat-n">
                {totalSpent !== null ? `₺${totalSpent.toLocaleString("tr-TR")}` : "—"}
              </div>
              <div className="hstat-l">Toplam Harcama</div>
            </div>
            <div>
              <div className="hstat-n">0</div>
              <div className="hstat-l">Favori Tesis</div>
            </div>
          </div>
        </div>
      </div>

      {/* QR + AKTİF BÖLÜMÜ */}
      <div style={{background:"#fff",borderBottom:"1px solid var(--bd)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"16px 20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <div>
            <div className="sec-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/></svg>
              Şezlong Girişi
            </div>
            <div className="qr-btns">
              <button className="qr-btn qr-btn-primary" onClick={() => alert("📷 QR okuyucu mobil uygulamada aktif olacak!\n\nWeb'de Kod Gir seçeneğini kullanın.")}>
                <span className="qr-btn-ico">📷</span>
                <span><span className="qr-btn-title">QR Oku</span><span className="qr-btn-sub">Kameranı kullanarak okutun</span></span>
              </button>
              <button className="qr-btn qr-btn-secondary" onClick={() => setKodModal(true)}>
                <span className="qr-btn-ico">⌨️</span>
                <span><span className="qr-btn-title">Kod Gir</span><span className="qr-btn-sub">Şezlong kodunu girerek giriş yap</span></span>
              </button>
            </div>
          </div>
          <div>
            <div className="sec-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Aktif Şezlonglarım
            </div>
            <div style={{textAlign:"center",padding:"16px 0",color:"var(--i3)"}}>
              <div style={{fontSize:"2rem",opacity:.4}}>⛱️</div>
              <div style={{fontSize:".78rem",marginTop:6}}>Henüz aktif şezlongunuz yok.</div>
              <Link href="/arama" style={{display:"inline-block",marginTop:8,background:"var(--tdk)",color:"#fff",padding:"7px 18px",borderRadius:50,fontSize:".75rem",fontWeight:700,textDecoration:"none"}}>Rezervasyon Yap</Link>
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
            {id:"favorites", ic:"❤️", label:"Favorilerim", cnt:0, cntColor:"var(--teal)"},
            {id:"notifications", ic:"🔔", label:"Bildirimler", cnt:0, cntColor:"var(--or)"},
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
                      <div className="rc-code">{r.code}</div>
                    </div>
                    <div className="rc-rows">
                      <div className="rc-row"><span>📅</span><span className="rc-row-t">Tarih</span><span className="rc-row-v">{r.dates}</span></div>
                      <div className="rc-row"><span>🛏</span><span className="rc-row-t">Şezlong</span><span className="rc-row-v">{r.szl}</span></div>
                      <div className="rc-row"><span>📆</span><span className="rc-row-t">Süre</span><span className="rc-row-v">{r.gun}</span></div>
                      <div className="rc-row"><span>💰</span><span className="rc-row-t">Ödenen</span><span className="rc-row-v" style={{color:"#16A34A"}}>{r.odenen}</span></div>
                    </div>
                    <div className="rc-footer">
                      {"stars" in r && r.stars && <span className="rc-stars">{"★".repeat(r.stars as number)}{"☆".repeat(5-(r.stars as number))}</span>}
                      {"review" in r && r.review && <button className="btn-review" onClick={() => { setReviewTarget(r.id); setReviewModal(true); }}>⭐ Değerlendir</button>}
                      <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
                        {r.status !== "cancel" && r.status !== "past" && <button className="btn-cancel" onClick={() => cancelRes(r.id)}>İptal Et</button>}
                        <button className="btn-detail" onClick={() => router.push("/hotel/zuzuu-beach-hotel")}>Tesise Git →</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FAVORİLER */}
          {activeTab === "favorites" && (
            <div>
              <div className="sec-head"><div><div className="sec-title">❤️ Favorilerim</div><div className="sec-sub">Kaydettiğiniz tesisler</div></div></div>
              <div style={{background:"#fff",border:"1px solid var(--bd)",borderRadius:"var(--r4)",boxShadow:"var(--sh)",padding:22,textAlign:"center",color:"var(--i3)"}}>
                <div style={{fontSize:"2rem",opacity:.4}}>🤍</div>
                <div style={{fontSize:".85rem",marginTop:8}}>Henüz favori tesisiniz yok.</div>
                <div style={{fontSize:".78rem",marginTop:4}}>Beğendiğiniz tesislerde kalp ikonuna tıklayarak favorilere ekleyebilirsiniz.</div>
              </div>
            </div>
          )}

          {/* BİLDİRİMLER */}
          {activeTab === "notifications" && (
            <div>
              <div className="sec-head"><div><div className="sec-title">🔔 Bildirimler</div><div className="sec-sub">Henüz bildiriminiz yok.</div></div></div>
              <div style={{background:"#fff",border:"1px solid var(--bd)",borderRadius:"var(--r4)",boxShadow:"var(--sh)",padding:22,textAlign:"center",color:"var(--i3)"}}>
                <div style={{fontSize:"2rem",opacity:.4}}>🔕</div>
                <div style={{fontSize:".85rem",marginTop:8}}>Henüz bildiriminiz yok.</div>
                <div style={{fontSize:".78rem",marginTop:4}}>Rezervasyonlarınız ve kampanyalarla ilgili güncellemeler burada görünecek.</div>
              </div>
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
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) setReviewModal(false); }}>
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
        <div className="modal-overlay" style={{alignItems:"flex-end"}} onClick={e => { if(e.target===e.currentTarget) setKodModal(false); }}>
          <div className="kod-sheet">
            <button className="modal-close" style={{position:"absolute",top:16,right:16}} onClick={() => setKodModal(false)}>✕</button>
            <div style={{fontSize:"1rem",fontWeight:900,marginBottom:6,color:"var(--navy)"}}>⌨️ Şezlong Kodu Gir</div>
            <div style={{fontSize:".78rem",color:"var(--i3)",marginBottom:16}}>Şezlong üzerindeki kodu girerek rezervasyonunuzu aktif edin.</div>
            <input className="kod-input" value={kodVal} onChange={e=>setKodVal(e.target.value.toUpperCase())} placeholder="MLG - XXXX" maxLength={10} />
            <button className="kod-submit" onClick={submitKod}>Kodu Doğrula →</button>
          </div>
        </div>
      )}

      {/* ŞİFRE DEĞİŞTİR MODAL */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowPasswordModal(false); }}>
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
    </>
  );
}
