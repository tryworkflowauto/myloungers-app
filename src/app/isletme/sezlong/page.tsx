"use client";

import { useState, useEffect, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// HTML'deki :root değişkenleri
const NAVY = "#0A1628";
const TEAL = "#0ABAB5";
const ORANGE = "#F5821F";
const GRAY50 = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const GREEN = "#10B981";
const BLUE = "#3B82F6";

// Sol panel grup satırı
type GrupRow = {
  id: string;
  name: string;
  count: number;
  color: string;
  dolu: number;
  bos: number;
  fiyat: string;
  doluluk: string;
  aciklama?: string;
  sira?: number;
  deniz_sirasi?: number;
};

function clampDenizSirasi(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(20, Math.floor(n)));
}

// Harita bloğu + şezlong listesi (key = grup id)
type SezlongSlot = { id: string; numara: number; durum: string };
type HaritaGrup = {
  id: string;
  prefix: string;
  count: number;
  color: string;
  durumlar: SezlongSlot[];
  title: string;
  sub: string;
  icon: string;
  gradient: string;
  dolulukYuzde: string;
};

// Şezlong durumuna göre renkler - HTML CSS'inden
const SEZ_STYLES: Record<string, { bg: string; border: string; borderStyle?: "solid" | "dashed"; pillow: string; legs: string; noColor: string }> = {
  bos: { bg: "#DCFCE7", border: "#86EFAC", pillow: "#A7F3D0", legs: "#86EFAC", noColor: "#16A34A" },
  dolu: { bg: "#FFEDD5", border: "#FB923C", pillow: "#FED7AA", legs: "#FB923C", noColor: "#EA580C" },
  rezerve: { bg: "#DBEAFE", border: "#60A5FA", pillow: "#BFDBFE", legs: "#60A5FA", noColor: "#2563EB" },
  bakim: { bg: "#F1F5F9", border: "#CBD5E1", pillow: "#E2E8F0", legs: "#CBD5E1", noColor: "#94A3B8" },
  kilitli: { bg: "#EDE9FE", border: "#7C3AED", borderStyle: "dashed", pillow: "#DDD6FE", legs: "#7C3AED", noColor: "#7C3AED" },
};

const DURUM_LABELS: Record<string, string> = {
  bos: "Boş",
  dolu: "Dolu",
  rezerve: "Rezerve",
  bakim: "Bakımda",
  kilitli: "İşletme Rezervi",
};

const COLOR_OPTS = ["#0ABAB5", "#F5821F", "#F59E0B", "#8B5CF6", "#EF4444", "#10B981", "#3B82F6", "#EC4899", "#0A1628"];

const LEGEND_DURUM_MAP: Record<string, string> = {
  "Boş": "bos",
  "Dolu": "dolu",
  "Rezerve": "rezerve",
  "Bakımda": "bakim",
  "İşletme Rezervi": "kilitli",
};

const LEGEND_LABELS: { emoji: string; label: string; sub: string; countColor: string }[] = [
  { emoji: "🟢", label: "Boş", sub: "Rezervasyon yapılabilir", countColor: GREEN },
  { emoji: "🟠", label: "Dolu", sub: "Aktif müşteri var", countColor: ORANGE },
  { emoji: "🔵", label: "Rezerve", sub: "Gelecek rezervasyon", countColor: BLUE },
  { emoji: "⚪", label: "Bakımda", sub: "Geçici kapalı", countColor: GRAY400 },
  { emoji: "🔒", label: "İşletme Rezervi", sub: "Satın alınamaz", countColor: "#7C3AED" },
];

const GRUP_ICON: Record<string, string> = { Gold: "⭐", İskele: "⚓", VIP: "🔥", Silver: "🌊" };
function grupIcon(ad: string): string { return GRUP_ICON[ad] ?? "🏖️"; }
function grupGradient(color: string): string {
  const c = color.replace("#", "");
  return `linear-gradient(135deg,${color},${color}CC)`;
}

function SezlongItem({
  no,
  durum,
  grupKey,
  isSecili,
  onClick,
}: {
  no: string;
  durum: string;
  grupKey: string;
  isSecili: boolean;
  onClick: () => void;
}) {
  const s = SEZ_STYLES[durum] ?? SEZ_STYLES.bos;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={durum === "kilitli" ? "sezlong-item sezlong-kilitli" : "sezlong-item"}
      style={{
        position: "relative",
        cursor: durum === "kilitli" ? "not-allowed" : "pointer",
      }}
      title={`${no} — ${DURUM_LABELS[durum]}`}
    >
      <div
        className="sezlong-inner"
        style={{
          width: 52,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          transition: "transform 0.15s",
        }}
      >
        <div
          style={{
            width: 44,
            height: 36,
            borderRadius: "6px 6px 4px 4px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: s.bg,
            border: `2px ${s.borderStyle ?? "solid"} ${s.border}`,
            boxShadow: isSecili ? "0 0 0 3px var(--teal, #0ABAB5)" : undefined,
            transform: isSecili ? "scale(1.05)" : undefined,
          }}
        >
          {/* Yastık (::before) */}
          <div
            style={{
              position: "absolute",
              top: -8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 30,
              height: 14,
              borderRadius: "6px 6px 0 0",
              background: s.pillow,
            }}
          />
          {/* Numara */}
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              lineHeight: 1,
              color: s.noColor,
              position: "relative",
              zIndex: 1,
            }}
          >
            {durum === "kilitli" ? "🔒" : no}
          </span>
          {/* Müşteri ikonu (dolu ise) */}
          {durum === "dolu" && (
            <div
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 16,
                height: 16,
                background: ORANGE,
                borderRadius: "50%",
                border: "2px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 8,
                zIndex: 2,
              }}
            >
              👤
            </div>
          )}
          {/* Ayaklar (::after) */}
          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: "50%",
              transform: "translateX(-50%)",
              width: 36,
              height: 6,
              borderRadius: 3,
              background: s.legs,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function IsletmeSezlongPage() {
  const router = useRouter();
  const [tesisId, setTesisId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [gruplar, setGruplar] = useState<GrupRow[]>([]);
  const [haritaGruplari, setHaritaGruplari] = useState<Record<string, HaritaGrup>>({});
  const [legendCounts, setLegendCounts] = useState({ bos: 0, dolu: 0, rezerve: 0, bakim: 0, kilitli: 0 });

  const [seciliNo, setSeciliNo] = useState<string | null>(null);
  const [seciliGrup, setSeciliGrup] = useState<string | null>(null);
  const [seciliSezlongId, setSeciliSezlongId] = useState<string | null>(null);
  const [seciliDurum, setSeciliDurum] = useState<string>("bos");
  // İşletme manuel rezervasyonu için tarih aralığı
  const [seciliRezerveBaslangic, setSeciliRezerveBaslangic] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [seciliRezerveBitis, setSeciliRezerveBitis] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [kilitliToastNo, setKilitliToastNo] = useState<string | null>(null);
  const [seciliRenk, setSeciliRenk] = useState("#0ABAB5");
  const [grupEkleForm, setGrupEkleForm] = useState({ ad: "", kapasite: "10", fiyat: "1000", renk: "#0ABAB5", aciklama: "", deniz_sirasi: "1" });
  const [duzenleModal, setDuzenleModal] = useState<GrupRow | null>(null);
  const [duzenleForm, setDuzenleForm] = useState({ name: "", count: "", color: "", fiyat: "", aciklama: "", deniz_sirasi: "1" });
  const [silModal, setSilModal] = useState<GrupRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // Tarih filtresi için seçili tarih (default: bugün)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  // Tarih bazlı rezervasyonlar - tipine göre ayrılmış
  const [rezervedByType, setRezervedByType] = useState<{
    rezerve: Set<string>;
    bakim: Set<string>;
    kilitli: Set<string>;
    dolu: Set<string>;  // müşteri rezervasyonu (musteri_adi "İŞLETME" içermiyor)
  }>({
    rezerve: new Set(),
    bakim: new Set(),
    kilitli: new Set(),
    dolu: new Set(),
  });
  const [cikisModal, setCikisModal] = useState(false);
  const [rezModal, setRezModal] = useState(false);
  const [rezForm, setRezForm] = useState({ musteriAdi: "", telefon: "", tarih: new Date().toISOString().slice(0, 10), kisiSayisi: "" });
  const [durumFiltresi, setDurumFiltresi] = useState<string | null>(null);
  const [grupFiltresi, setGrupFiltresi] = useState<string | null>(null);
  const [grupDragId, setGrupDragId] = useState<string | null>(null);
  const [grupDropTargetId, setGrupDropTargetId] = useState<string | null>(null);
  const [seciliTarih, setSeciliTarih] = useState(() => new Date().toISOString().slice(0, 10));
  const [mod, setMod] = useState<"duzenleme" | "goruntulem" | "musteri">("duzenleme");
  // Toplu seçim modu
  const [topluMod, setTopluMod] = useState<boolean>(false);
  const [topluSecilenIds, setTopluSecilenIds] = useState<Set<string>>(new Set());
  const [topluDurum, setTopluDurum] = useState<string>("rezerve");
  const [topluBaslangic, setTopluBaslangic] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [topluBitis, setTopluBitis] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [bugunGelirTutar, setBugunGelirTutar] = useState(0);
  const [bugunSiparisAdet, setBugunSiparisAdet] = useState(0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function persistGrupSiraToSupabase(ordered: GrupRow[]): Promise<boolean> {
    const tid = tesisId;
    if (!tid || ordered.length === 0) return true;
    const results = await Promise.all(
      ordered.map((row, idx) =>
        supabase.from("sezlong_gruplari").update({ sira: idx }).eq("id", row.id).eq("tesis_id", tid)
      )
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      console.error("sezlong_gruplari sira güncelleme:", failed.error);
      return false;
    }
    return true;
  }

  function handleGrupReorderDrop(e: DragEvent, targetId: string) {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData("text/grup-id");
    setGrupDropTargetId(null);
    if (!draggedId || draggedId === targetId) return;
    setGruplar((prev) => {
      const dragIdx = prev.findIndex((x) => x.id === draggedId);
      const dropIdx = prev.findIndex((x) => x.id === targetId);
      if (dragIdx < 0 || dropIdx < 0 || dragIdx === dropIdx) return prev;
      const next = [...prev];
      const [removed] = next.splice(dragIdx, 1);
      next.splice(dropIdx, 0, removed);
      const withSira = next.map((row, idx) => ({ ...row, sira: idx }));
      if (tesisId) {
        void persistGrupSiraToSupabase(withSira).then((ok) => {
          if (!ok) showToast("❌ Sıra kaydedilemedi");
        });
      }
      return withSira;
    });
  }

  // Supabase Auth ile tesis_id yükle
  useEffect(() => {
    let cancelled = false;

    async function loadTesisId() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (cancelled) return;
      if (authError || !authData?.user) {
        setTesisId(null);
        setAuthChecked(true);
        router.push("/giris");
        return;
      }

      const { data: kById } = await supabase
        .from("kullanicilar")
        .select("rol, tesis_id")
        .eq("id", authData.user.id)
        .maybeSingle();
      if (cancelled) return;

      let rol = String((kById as { rol?: string } | null)?.rol ?? "").toLowerCase();
      let tesisIdVal = (kById as { tesis_id?: unknown } | null)?.tesis_id;

      const hasTesis =
        tesisIdVal != null &&
        String(tesisIdVal).trim() !== "";

      if (!hasTesis && authData.user.email) {
        const { data: kByEmail } = await supabase
          .from("kullanicilar")
          .select("rol, tesis_id")
          .eq("email", authData.user.email)
          .maybeSingle();
        if (cancelled) return;
        if (kByEmail) {
          if (!rol) rol = String((kByEmail as { rol?: string }).rol ?? "").toLowerCase();
          const te = (kByEmail as { tesis_id?: unknown }).tesis_id;
          if (te != null && String(te).trim() !== "") tesisIdVal = te;
        }
      }

      if (rol !== "isletmeci" && rol !== "admin") {
        router.push("/");
        setTesisId(null);
        setAuthChecked(true);
        return;
      }

      if (tesisIdVal == null || String(tesisIdVal).trim() === "") {
        setTesisId(null);
        setAuthChecked(true);
        return;
      }
      setTesisId(String(tesisIdVal));
      setAuthChecked(true);
    }

    loadTesisId();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  // Fetch gruplar + sezlonglar
  useEffect(() => {
    if (!authChecked) return;
    if (!tesisId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase.from("sezlong_gruplari").select("id, ad, renk, kapasite, fiyat, aciklama, sira, deniz_sirasi").eq("tesis_id", tesisId).order("sira", { ascending: true }),
      supabase.from("sezlonglar").select("id, grup_id, numara, durum").eq("tesis_id", tesisId),
    ]).then(([gRes, sRes]) => {
      if (cancelled) return;
      const grupRows = (gRes.data ?? []) as {
        id: string;
        ad: string;
        renk: string;
        kapasite: number;
        fiyat: number | null;
        aciklama?: string | null;
        sira?: number | null;
        deniz_sirasi?: number | null;
      }[];
      grupRows.sort((a, b) => {
        const sa = Number(a.sira ?? 0);
        const sb = Number(b.sira ?? 0);
        if (sa !== sb) return sa - sb;
        return String(a.id).localeCompare(String(b.id));
      });
      const sezRows = (sRes.data ?? []) as { id: string; grup_id: string; numara: number; durum: string }[];
      const byGrup = new Map<string, typeof sezRows>();
      for (const s of sezRows) {
        if (!byGrup.has(s.grup_id)) byGrup.set(s.grup_id, []);
        byGrup.get(s.grup_id)!.push(s);
      }
      const counts = { bos: 0, dolu: 0, rezerve: 0, bakim: 0, kilitli: 0 };
      for (const s of sezRows) {
        // Tipine göre say
        if (rezervedByType.rezerve.has(s.id)) {
          counts.rezerve++;
        } else if (rezervedByType.bakim.has(s.id)) {
          counts.bakim++;
        } else if (rezervedByType.kilitli.has(s.id)) {
          counts.kilitli++;
        } else if (rezervedByType.dolu.has(s.id)) {
          counts.dolu++;
        } else {
          const d = (s.durum || "bos") as keyof typeof counts;
          if (counts[d] !== undefined) counts[d]++;
        }
      }
      setLegendCounts(counts);

      const grList: GrupRow[] = [];
      const harita: Record<string, HaritaGrup> = {};
      for (const g of grupRows) {
        const list = (byGrup.get(g.id) ?? []).sort((a, b) => a.numara - b.numara);
        const dolu = list.filter((s) => s.durum === "dolu").length;
        const bos = list.filter((s) => s.durum === "bos").length;
        const cap = list.length || g.kapasite || 0;
        const dolulukPct = cap > 0 ? Math.round((dolu / cap) * 100) : 0;
        const prefix = g.ad.charAt(0).toUpperCase();
        const fiyatNum = Number(g.fiyat) || 0;
        const aciklama = (g as { aciklama?: string | null }).aciklama?.trim() || "";
        const siraVal = Number(g.sira ?? 0);
        const denizVal = clampDenizSirasi(g.deniz_sirasi);
        grList.push({
          id: g.id,
          name: g.ad,
          count: cap,
          color: g.renk || TEAL,
          dolu,
          bos,
          fiyat: fiyatNum ? `₺${fiyatNum.toLocaleString("tr")}` : "—",
          doluluk: `${dolulukPct}%`,
          aciklama: aciklama || undefined,
          sira: siraVal,
          deniz_sirasi: denizVal,
        });
        harita[g.id] = {
          id: g.id,
          prefix,
          count: cap,
          color: g.renk || TEAL,
          durumlar: list.map((s) => {
            let durum = s.durum || "bos";
            if (rezervedByType.rezerve.has(s.id)) durum = "rezerve";
            else if (rezervedByType.bakim.has(s.id)) durum = "bakim";
            else if (rezervedByType.kilitli.has(s.id)) durum = "kilitli";
            else if (rezervedByType.dolu.has(s.id)) durum = "dolu";
            return { id: s.id, numara: s.numara, durum };
          }),
          title: g.ad,
          sub: aciklama || g.ad,
          icon: grupIcon(g.ad),
          gradient: grupGradient(g.renk || TEAL),
          dolulukYuzde: `${dolulukPct}% Dolu`,
        };
      }
      setGruplar(grList);
      setHaritaGruplari(harita);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [tesisId, authChecked, supabase, selectedDate, rezervedByType]);

  // Seçilen tarihte onaylı rezervasyonlardaki sezlong_ids'leri çek
  useEffect(() => {
    if (!tesisId || !selectedDate) {
      setRezervedByType({
        rezerve: new Set(),
        bakim: new Set(),
        kilitli: new Set(),
        dolu: new Set(),
      });
      return;
    }
    let cancelled = false;
    async function loadRezervedIds() {
      const { data, error } = await supabase
        .from("rezervasyonlar")
        .select("sezlong_ids, baslangic_tarih, bitis_tarih, musteri_adi")
        .eq("tesis_id", tesisId)
        .in("durum", ["aktif", "onaylandi"])
        .lte("baslangic_tarih", selectedDate)
        .gte("bitis_tarih", selectedDate);
      if (cancelled) return;
      if (error) {
        console.error("İşletme paneli rezerveli şezlong çekme hatası:", error);
        return;
      }
      const newByType = {
        rezerve: new Set<string>(),
        bakim: new Set<string>(),
        kilitli: new Set<string>(),
        dolu: new Set<string>(),
      };
      (data ?? []).forEach((r: any) => {
        const ids = Array.isArray(r.sezlong_ids) ? r.sezlong_ids : [];
        const musteriAdi = (r.musteri_adi || "").toUpperCase();
        let tip: "rezerve" | "bakim" | "kilitli" | "dolu" = "dolu";
        if (musteriAdi === "İŞLETME REZERVİ") tip = "rezerve";
        else if (musteriAdi === "BAKIM") tip = "bakim";
        else if (musteriAdi === "İŞLETME KİLİDİ") tip = "kilitli";
        ids.forEach((id: string) => {
          if (typeof id === "string" && id.trim()) newByType[tip].add(id);
        });
      });
      if (!cancelled) setRezervedByType(newByType);
    }
    loadRezervedIds();
    return () => { cancelled = true; };
  }, [tesisId, selectedDate]);

  useEffect(() => {
    if (!authChecked || !tesisId) {
      setBugunGelirTutar(0);
      setBugunSiparisAdet(0);
      return;
    }
    let cancelled = false;
    const now = new Date();
    const bugunBas = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const bugunSon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const basIso = bugunBas.toISOString();
    const sonIso = bugunSon.toISOString();

    Promise.all([
      supabase
        .from("rezervasyonlar")
        .select("toplam_tutar")
        .eq("tesis_id", tesisId)
        .gte("created_at", basIso)
        .lte("created_at", sonIso),
      supabase
        .from("siparisler")
        .select("id", { count: "exact", head: true })
        .eq("tesis_id", tesisId)
        .gte("created_at", basIso)
        .lte("created_at", sonIso),
    ]).then(([rezRes, sipRes]) => {
      if (cancelled) return;
      const gelir = (rezRes.data ?? []).reduce(
        (acc: number, r: { toplam_tutar?: unknown }) => acc + Number(r.toplam_tutar ?? 0),
        0
      );
      setBugunGelirTutar(Number.isFinite(gelir) ? gelir : 0);
      setBugunSiparisAdet(sipRes.count ?? 0);
    });
    return () => {
      cancelled = true;
    };
  }, [tesisId, authChecked]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDuzenleModal(null);
        setSilModal(null);
        setCikisModal(false);
        setRezModal(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const LEGEND_ITEMS = LEGEND_LABELS.map((item) => ({
    ...item,
    count: legendCounts[LEGEND_DURUM_MAP[item.label] as keyof typeof legendCounts] ?? 0,
  }));
  const GRUP_BUTTONS = [
    { label: "Tüm Gruplar", key: null as string | null, color: GRAY400 },
    ...gruplar.map((g) => ({ label: g.name, key: g.id, color: g.color })),
  ];
  const toplamSezlong = gruplar.reduce((a, g) => a + g.count, 0);
  const toplamDolu = gruplar.reduce((a, g) => a + g.dolu, 0);
  const toplamBos = gruplar.reduce((a, g) => a + g.bos, 0);

  function openDuzenle(g: GrupRow) {
    setDuzenleForm({
      name: g.name,
      count: String(g.count),
      color: g.color,
      fiyat: g.fiyat,
      aciklama: g.aciklama ?? "",
      deniz_sirasi: String(clampDenizSirasi(g.deniz_sirasi)),
    });
    setDuzenleModal(g);
  }

  async function saveDuzenle() {
    if (!duzenleModal) return;
    const fiyatNum = duzenleForm.fiyat.replace(/[^\d]/g, "") || "0";
    const aciklamaVal = duzenleForm.aciklama?.trim() || null;
    const { error } = await supabase
      .from("sezlong_gruplari")
      .update({
        ad: duzenleForm.name,
        renk: duzenleForm.color,
        fiyat: Number(fiyatNum),
        aciklama: aciklamaVal,
        kapasite: Number(duzenleForm.count),
        deniz_sirasi: clampDenizSirasi(duzenleForm.deniz_sirasi),
      })
      .eq("id", duzenleModal.id);
    if (error) { showToast("❌ Güncellenemedi"); return; }
    const subDisplay = aciklamaVal || duzenleForm.name;
    setGruplar((prev) =>
      prev.map((g) =>
        g.id === duzenleModal.id
          ? {
              ...g,
              name: duzenleForm.name,
              color: duzenleForm.color,
              fiyat: duzenleForm.fiyat,
              aciklama: aciklamaVal ?? undefined,
              count: Number(duzenleForm.count),
              deniz_sirasi: clampDenizSirasi(duzenleForm.deniz_sirasi),
            }
          : g
      )
    );
    setHaritaGruplari((prev) => {
      const h = prev[duzenleModal.id];
      if (!h) return prev;
      return { ...prev, [duzenleModal.id]: { ...h, title: duzenleForm.name, sub: subDisplay, color: duzenleForm.color, gradient: grupGradient(duzenleForm.color) } };
    });
    showToast("✅ Grup güncellendi");
    // Şezlong sayısını (kapasiteyi) veritabanındaki sezlonglar ile senkronize et
    const hedefCount = Number(duzenleForm.count) || 0;
    if (hedefCount > 0 && tesisId) {
      const { data: mevcutSez, error: sezFetchErr } = await supabase
        .from("sezlonglar")
        .select("id, numara")
        .eq("grup_id", duzenleModal.id)
        .eq("tesis_id", tesisId)
        .order("numara", { ascending: true });
      if (!sezFetchErr && mevcutSez) {
        const mevcutListe = mevcutSez as { id: string; numara: number }[];
        const mevcutCount = mevcutListe.length;
        if (hedefCount > mevcutCount) {
          // Eksik şezlongları ekle
          const mevcutMax = mevcutListe.reduce((max, s) => Math.max(max, s.numara), 0);
          const eklenecek = hedefCount - mevcutCount;
          const inserts = Array.from({ length: eklenecek }, (_, i) => ({
            grup_id: duzenleModal.id,
            tesis_id: tesisId,
            numara: mevcutMax + i + 1,
            durum: "bos",
          }));
          await supabase.from("sezlonglar").insert(inserts);
        } else if (hedefCount < mevcutCount) {
          // Fazla şezlongları sil (en yüksek numaralardan başlayarak)
          const silinecekAdet = mevcutCount - hedefCount;
          const silinecekler = [...mevcutListe]
            .sort((a, b) => b.numara - a.numara)
            .slice(0, silinecekAdet)
            .map((s) => s.id);
          if (silinecekler.length > 0) {
            await supabase.from("sezlonglar").delete().in("id", silinecekler);
          }
        }
      }
    }
    if (typeof window !== "undefined") {
      window.location.reload();
    }
    setDuzenleModal(null);
  }

  async function silGrup() {
    if (!silModal || !tesisId) return;

    // Önce bu gruba ait tüm şezlongları sil
    const { error: sezErr } = await supabase
      .from("sezlonglar")
      .delete()
      .eq("grup_id", silModal.id)
      .eq("tesis_id", tesisId);
    if (sezErr) {
      showToast("❌ Şezlonglar silinemedi");
      return;
    }

    // Ardından grubu sil
    const { error: grpErr } = await supabase
      .from("sezlong_gruplari")
      .delete()
      .eq("id", silModal.id)
      .eq("tesis_id", tesisId);
    if (grpErr) {
      showToast("❌ Grup silinemedi");
      return;
    }
    setGruplar((prev) => prev.filter((g) => g.id !== silModal.id));
    setHaritaGruplari((prev) => {
      const next = { ...prev };
      delete next[silModal.id];
      return next;
    });
    setSilModal(null);
    showToast("✅ Grup silindi");
  }

  async function handleKaydetDegisiklikler() {
    if (tesisId && gruplar.length > 0) {
      const siraOk = await persistGrupSiraToSupabase(gruplar);
      if (!siraOk) {
        showToast("❌ Grup sırası kaydedilemedi");
        return;
      }
    }
    if (seciliSezlongId && seciliDurum && seciliGrup) {
      // sezlonglar.durum sadece "bos" veya "dolu" için güncellensin
      // Rezerve/Bakım/Kilit kayıtları rezervasyonlar tablosuna gidecek (tarihli)
      let error = null;
      if (seciliDurum === "bos" || seciliDurum === "dolu") {
        const { error: updateError } = await supabase.from("sezlonglar").update({ durum: seciliDurum }).eq("id", seciliSezlongId);
        error = updateError;
      }
      if (!error) {
        // İşletme manuel rezervasyonu - rezervasyonlar tablosuna kayıt at
        if (seciliDurum === "rezerve" || seciliDurum === "bakim" || seciliDurum === "kilitli") {
          // Tarih validasyonu
          if (!seciliRezerveBaslangic || !seciliRezerveBitis) {
            showToast("⚠️ Lütfen tarih aralığı seçin");
            return;
          }
          if (seciliRezerveBaslangic > seciliRezerveBitis) {
            showToast("⚠️ Bitiş tarihi başlangıçtan önce olamaz");
            return;
          }
          
          const musteriAdiMap: Record<string, string> = {
            rezerve: "İŞLETME REZERVİ",
            bakim: "BAKIM",
            kilitli: "İŞLETME KİLİDİ",
          };
          
          const { error: rezError } = await supabase.from("rezervasyonlar").insert({
            tesis_id: tesisId,
            kullanici_id: null,
            sezlong_id: seciliSezlongId,
            sezlong_ids: [seciliSezlongId],
            baslangic_tarih: seciliRezerveBaslangic,
            bitis_tarih: seciliRezerveBitis,
            kisi_sayisi: 1,
            toplam_tutar: 0,
            durum: "onaylandi",
            musteri_adi: musteriAdiMap[seciliDurum] ?? "İŞLETME",
            rezervasyon_kodu: `ISL-${Date.now()}`,
          });
          
          if (rezError) {
            console.error("İşletme manuel rezervasyon hatası:", rezError);
            showToast("❌ Rezervasyon kaydı hatası: " + rezError.message);
            return;
          }
          
          // rezervedByType state'ini güncelle (seçili tarih kapsam içindeyse)
          if (selectedDate >= seciliRezerveBaslangic && selectedDate <= seciliRezerveBitis) {
            setRezervedByType((prev) => {
              const next = { 
                rezerve: new Set(prev.rezerve), 
                bakim: new Set(prev.bakim), 
                kilitli: new Set(prev.kilitli), 
                dolu: new Set(prev.dolu) 
              };
              const tip = seciliDurum as "rezerve" | "bakim" | "kilitli";
              if (next[tip]) next[tip].add(seciliSezlongId);
              return next;
            });
          }
        } else if (seciliDurum === "bos") {
          // "Boş" seçilince bu şezlongun aktif işletme rezervelerini iptal et
          const { error: cancelError } = await supabase
            .from("rezervasyonlar")
            .update({ durum: "iptal" })
            .eq("tesis_id", tesisId)
            .is("kullanici_id", null)
            .eq("durum", "onaylandi")
            .contains("sezlong_ids", [seciliSezlongId]);
          
          if (cancelError) {
            console.error("İşletme rezerve iptali hatası:", cancelError);
          }
          
          // rezervedByType state'inden çıkar
          setRezervedByType((prev) => {
            const next = { 
              rezerve: new Set(prev.rezerve), 
              bakim: new Set(prev.bakim), 
              kilitli: new Set(prev.kilitli), 
              dolu: new Set(prev.dolu) 
            };
            next.rezerve.delete(seciliSezlongId);
            next.bakim.delete(seciliSezlongId);
            next.kilitli.delete(seciliSezlongId);
            next.dolu.delete(seciliSezlongId);
            return next;
          });
        }

        setHaritaGruplari((prev) => {
          const gid = seciliGrup;
          if (!gid || !prev[gid]) return prev;
          return {
            ...prev,
            [gid]: {
              ...prev[gid],
              durumlar: prev[gid].durumlar.map((s) => (s.id === seciliSezlongId ? { ...s, durum: seciliDurum } : s)),
            },
          };
        });
        setGruplar((prev) =>
          prev.map((g) => {
            if (g.id !== seciliGrup) return g;
            const h = haritaGruplari[seciliGrup];
            if (!h) return g;
            const updatedDurumlar = h.durumlar.map((d) => (d.id === seciliSezlongId ? seciliDurum : d.durum));
            const dolu = updatedDurumlar.filter((d) => d === "dolu").length;
            const bos = updatedDurumlar.filter((d) => d === "bos").length;
            const dolulukPct = updatedDurumlar.length ? Math.round((dolu / updatedDurumlar.length) * 100) : 0;
            return { ...g, dolu, bos, doluluk: `${dolulukPct}%` };
          })
        );
        setLegendCounts((prev) => {
          const next = { ...prev };
          const h = haritaGruplari[seciliGrup];
          if (h) {
            const slot = h.durumlar.find((s) => s.id === seciliSezlongId);
            if (slot) {
              const oldD = slot.durum as keyof typeof next;
              if (next[oldD] !== undefined) next[oldD]--;
              const newD = seciliDurum as keyof typeof next;
              if (next[newD] !== undefined) next[newD]++;
            }
          }
          return next;
        });
      }
    }
    showToast("✅ Değişiklikler kaydedildi!");
  }

  async function handleTopluKaydet() {
    if (topluSecilenIds.size === 0) {
      showToast("⚠️ Önce şezlong seçin");
      return;
    }
    
    if (!topluBaslangic || !topluBitis) {
      showToast("⚠️ Tarih aralığı seçin");
      return;
    }
    
    if (topluBaslangic > topluBitis) {
      showToast("⚠️ Bitiş tarihi başlangıçtan önce olamaz");
      return;
    }
    
    const secilenIdArray = Array.from(topluSecilenIds);
    
    if (topluDurum === "bos") {
      // Toplu iptal - seçilen şezlongların aktif işletme rezervelerini iptal et
      const { error: cancelError } = await supabase
        .from("rezervasyonlar")
        .update({ durum: "iptal" })
        .eq("tesis_id", tesisId)
        .is("kullanici_id", null)
        .eq("durum", "onaylandi")
        .overlaps("sezlong_ids", secilenIdArray);
      
      if (cancelError) {
        console.error("Toplu iptal hatası:", cancelError);
        showToast("❌ Toplu iptal hatası: " + cancelError.message);
        return;
      }
      
      // Seçilenleri tüm tip setlerinden çıkar
      setRezervedByType((prev) => {
        const next = { 
          rezerve: new Set(prev.rezerve), 
          bakim: new Set(prev.bakim), 
          kilitli: new Set(prev.kilitli), 
          dolu: new Set(prev.dolu) 
        };
        secilenIdArray.forEach((id) => {
          next.rezerve.delete(id);
          next.bakim.delete(id);
          next.kilitli.delete(id);
          next.dolu.delete(id);
        });
        return next;
      });
      
      showToast(`✅ ${secilenIdArray.length} şezlong serbest bırakıldı`);
    } else if (topluDurum === "rezerve" || topluDurum === "bakim" || topluDurum === "kilitli") {
      const musteriAdiMap: Record<string, string> = {
        rezerve: "İŞLETME REZERVİ",
        bakim: "BAKIM",
        kilitli: "İŞLETME KİLİDİ",
      };
      
      // TEK rezervasyon kaydı - tüm seçilen şezlonglar sezlong_ids array'inde
      const { error: rezError } = await supabase.from("rezervasyonlar").insert({
        tesis_id: tesisId,
        kullanici_id: null,
        sezlong_id: secilenIdArray[0],  // İlkini referans olarak koy (eski kod uyumluluğu)
        sezlong_ids: secilenIdArray,
        baslangic_tarih: topluBaslangic,
        bitis_tarih: topluBitis,
        kisi_sayisi: secilenIdArray.length,
        toplam_tutar: 0,
        durum: "onaylandi",
        musteri_adi: musteriAdiMap[topluDurum] ?? "İŞLETME",
        rezervasyon_kodu: `ISL-${Date.now()}`,
      });
      
      if (rezError) {
        console.error("Toplu rezervasyon hatası:", rezError);
        showToast("❌ Toplu kayıt hatası: " + rezError.message);
        return;
      }
      
      // State güncelleme (seçilen tarih kapsam içindeyse)
      if (selectedDate >= topluBaslangic && selectedDate <= topluBitis) {
        setRezervedByType((prev) => {
          const next = { 
            rezerve: new Set(prev.rezerve), 
            bakim: new Set(prev.bakim), 
            kilitli: new Set(prev.kilitli), 
            dolu: new Set(prev.dolu) 
          };
          const tip = topluDurum as "rezerve" | "bakim" | "kilitli";
          secilenIdArray.forEach((id) => {
            if (next[tip]) next[tip].add(id);
          });
          return next;
        });
      }
      
      showToast(`✅ ${secilenIdArray.length} şezlong kaydedildi`);
    }
    
    // Seçimi temizle
    setTopluSecilenIds(new Set());
  }

  function handleSezlongClick(no: string, grupKey: string, durum: string, sezlongId: string) {
    // Toplu seçim modu açıksa, sadece seçime ekle/çıkar
    if (topluMod) {
      setTopluSecilenIds((prev) => {
        const next = new Set(prev);
        if (next.has(sezlongId)) {
          next.delete(sezlongId);
        } else {
          next.add(sezlongId);
        }
        return next;
      });
      return;
    }
    // Kilit koruması sadece müşteri modunda aktif
    if (durum === "kilitli" && mod === "musteri") {
      setKilitliToastNo(no);
      setTimeout(() => setKilitliToastNo(null), 2500);
      return;
    }
    if (mod === "musteri") {
      setSeciliNo(no);
      setSeciliGrup(grupKey);
      setSeciliDurum(durum);
      setSeciliSezlongId(sezlongId);
      return;
    }
    setSeciliNo(no);
    setSeciliGrup(grupKey);
    setSeciliSezlongId(sezlongId);
    setSeciliDurum(durum);
  }

  async function handleGrupEkle() {
    if (!grupEkleForm.ad.trim()) return;

    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
      showToast("❌ Grup eklenemedi");
      return;
    }

    const { data: kById } = await supabase
      .from("kullanicilar")
      .select("tesis_id")
      .eq("id", authData.user.id)
      .maybeSingle();

    let tesisIdVal = (kById as { tesis_id?: unknown } | null)?.tesis_id;
    const hasTesis =
      tesisIdVal != null &&
      String(tesisIdVal).trim() !== "";

    if (!hasTesis && authData.user.email) {
      const { data: kByEmail } = await supabase
        .from("kullanicilar")
        .select("tesis_id")
        .eq("email", authData.user.email)
        .maybeSingle();
      const te = (kByEmail as { tesis_id?: unknown } | null)?.tesis_id;
      if (te != null && String(te).trim() !== "") tesisIdVal = te;
    }

    const currentTesisId =
      tesisIdVal != null && String(tesisIdVal).trim() !== ""
        ? String(tesisIdVal)
        : null;
    if (!currentTesisId) {
      showToast("❌ Grup eklenemedi");
      return;
    }

    const kapasite = Math.max(1, Math.min(200, Number(grupEkleForm.kapasite) || 10));
    const aciklamaInsert = grupEkleForm.aciklama?.trim() || null;
    const nextSira = gruplar.length === 0 ? 0 : Math.max(...gruplar.map((r) => r.sira ?? 0)) + 1;
    const denizInsert = clampDenizSirasi(grupEkleForm.deniz_sirasi);
    const { data: grup, error: gErr } = await supabase
      .from("sezlong_gruplari")
      .insert({
        tesis_id: currentTesisId,
        ad: grupEkleForm.ad.trim(),
        renk: grupEkleForm.renk || TEAL,
        kapasite,
        fiyat: Number(grupEkleForm.fiyat) || 0,
        aciklama: aciklamaInsert,
        sira: nextSira,
        deniz_sirasi: denizInsert,
      })
      .select("id, ad, renk, kapasite, fiyat, deniz_sirasi")
      .single();
    if (gErr || !grup) {
      showToast("❌ Grup eklenemedi");
      return;
    }
    const g = grup as { id: string; ad: string; renk: string; kapasite: number; fiyat: number; deniz_sirasi?: number | null };
    const sezlongInserts = Array.from({ length: kapasite }, (_, i) => ({
      grup_id: g.id,
      tesis_id: currentTesisId,
      numara: i + 1,
      durum: "bos",
    }));
    const { error: sErr } = await supabase.from("sezlonglar").insert(sezlongInserts);
    if (sErr) {
      showToast("❌ Şezlonglar eklenemedi");
      return;
    }
    const { data: newSez } = await supabase.from("sezlonglar").select("id, numara, durum").eq("grup_id", g.id).order("numara", { ascending: true });
    const durumlar: SezlongSlot[] = (newSez ?? []).map((s: { id: string; numara: number; durum: string }) => ({ id: s.id, numara: s.numara, durum: s.durum || "bos" }));
    setGruplar((prev) => [...prev, { id: g.id, name: g.ad, count: kapasite, color: g.renk || TEAL, dolu: 0, bos: kapasite, fiyat: g.fiyat ? `₺${g.fiyat.toLocaleString("tr")}` : "—", doluluk: "0%", sira: nextSira }]);
    setHaritaGruplari((prev) => ({
      ...prev,
      [g.id]: {
        id: g.id,
        prefix: g.ad.charAt(0).toUpperCase(),
        count: kapasite,
        color: g.renk || TEAL,
        durumlar,
        title: g.ad,
        sub: aciklamaInsert || g.ad,
        icon: grupIcon(g.ad),
        gradient: grupGradient(g.renk || TEAL),
        dolulukYuzde: "0% Dolu",
      },
    }));
    setModalOpen(false);
    setGrupEkleForm({ ad: "", kapasite: "10", fiyat: "1000", renk: "#0ABAB5", aciklama: "", deniz_sirasi: "1" });
    showToast("✅ Grup eklendi");
  }

  if (!authChecked || loading) {
    return (
      <div
        style={{
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          background: GRAY100,
          color: GRAY800,
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: 14, color: GRAY600 }}>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background: GRAY100,
        color: GRAY800,
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
      }}
    >
      {/* TOPBAR - HTML ile aynı */}
      <header
        style={{
          background: "white",
          borderBottom: `1px solid ${GRAY200}`,
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Şezlong Haritası</h1>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 12, 
          padding: "12px 16px", 
          background: "#F3F4F6", 
          borderRadius: 8, 
          marginBottom: 16,
          flexWrap: "wrap"
        }}>
          <span style={{ fontWeight: 600, color: "#1F2937" }}>📅 Görüntülenen Tarih:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 14,
              fontFamily: "inherit",
              cursor: "pointer"
            }}
          />
          <button
            onClick={() => {
              const d = new Date();
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, "0");
              const day = String(d.getDate()).padStart(2, "0");
              setSelectedDate(`${y}-${m}-${day}`);
            }}
            style={{
              padding: "8px 12px",
              background: "#0d9488",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Bugün
          </button>
          <span style={{ fontSize: 12, color: "#6B7280", marginLeft: "auto" }}>
            Seçilen tarihteki şezlong durumu gösteriliyor
          </span>
        </div>
            {topluMod && (
              <div style={{ 
                margin: "12px 0", 
                padding: 12, 
                paddingRight: 40,
                position: "relative",
                background: "#FEF3C7", 
                border: "2px solid #F59E0B", 
                borderRadius: 8,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
              }}>
                <button
                  onClick={() => {
                    setTopluMod(false);
                    setTopluSecilenIds(new Set());
                  }}
                  title="Toplu seçimi kapat"
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 28,
                    height: 28,
                    background: "white",
                    color: "#92400E",
                    border: "1px solid #F59E0B",
                    borderRadius: "50%",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
                <span style={{ fontWeight: 700, color: "#92400E", fontSize: 13 }}>
                  ⚡ Hızlı Seçim:
                </span>
                
                {/* Tümünü Seç */}
                <button
                  onClick={() => {
                    const all = new Set<string>();
                    Object.values(haritaGruplari).forEach((g: any) => {
                      (g.durumlar || []).forEach((s: any) => all.add(s.id));
                    });
                    setTopluSecilenIds(all);
                  }}
                  style={{
                    padding: "6px 12px",
                    background: "#0d9488",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ✓ Tümünü Seç
                </button>
                
                {/* Grup Bazlı Butonlar */}
                {gruplar.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      const h = haritaGruplari[g.id];
                      if (!h) return;
                      setTopluSecilenIds((prev) => {
                        const next = new Set(prev);
                        (h.durumlar || []).forEach((s: any) => next.add(s.id));
                        return next;
                      });
                    }}
                    style={{
                      padding: "6px 12px",
                      background: "white",
                      color: "#374151",
                      border: "1px solid #D1D5DB",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {g.name} ({g.count})
                  </button>
                ))}
                
                {/* Seçimi Temizle */}
                <button
                  onClick={() => setTopluSecilenIds(new Set())}
                  style={{
                    padding: "6px 12px",
                    background: "#EF4444",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginLeft: "auto",
                  }}
                >
                  ✕ Seçimi Temizle
                </button>
                
                <span style={{ 
                  fontWeight: 700, 
                  color: "#92400E", 
                  fontSize: 13,
                  marginLeft: 8,
                }}>
                  {topluSecilenIds.size} şezlong seçili
                </span>
              </div>
            )}
          <span style={{ fontSize: 11, color: GRAY400 }}>{toplamSezlong} şezlong • {toplamDolu} dolu • {toplamBos} boş • {legendCounts.bakim} bakımda</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: `1px solid ${GRAY200}`,
              background: GRAY100,
              color: GRAY800,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            ➕ Grup Ekle
          </button>
          <button
            onClick={handleKaydetDegisiklikler}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              background: TEAL,
              color: "white",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            💾 Değişiklikleri Kaydet
          </button>
          <select
            value={mod === "duzenleme" ? "duzenleme" : mod === "goruntulem" ? "goruntulem" : "musteri"}
            onChange={(e) => setMod(e.target.value as "duzenleme" | "goruntulem" | "musteri")}
            style={{
              padding: "7px 10px",
              border: `2px solid ${mod === "musteri" ? "#7C3AED" : mod === "goruntulem" ? TEAL : ORANGE}`,
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              background: mod === "musteri" ? "#F5F3FF" : mod === "goruntulem" ? "rgba(10,186,181,0.08)" : "rgba(245,130,31,0.08)",
              color: mod === "musteri" ? "#7C3AED" : mod === "goruntulem" ? TEAL : ORANGE,
              cursor: "pointer",
            }}
          >
            <option value="duzenleme">✏️ Düzenleme Modu</option>
            <option value="goruntulem">👁️ Görüntüleme Modu</option>
            <option value="musteri">👤 Müşteri Görünümü</option>
          </select>
            {mod === "duzenleme" && (
              <button
                onClick={() => {
                  setTopluMod((prev) => !prev);
                  if (topluMod) {
                    // Kapatırken seçimi temizle
                    setTopluSecilenIds(new Set());
                  }
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: topluMod ? "2px solid #0d9488" : "1px solid #D1D5DB",
                  background: topluMod ? "#0d9488" : "white",
                  color: topluMod ? "white" : "#374151",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginLeft: 8,
                }}
              >
                📋 Toplu Seçim {topluMod ? `(${topluSecilenIds.size})` : ""}
              </button>
            )}
        </div>
      </header>

      {/* PAGE LAYOUT */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* SOL ARAÇ PANELİ - tool-panel */}
        <div
          style={{
            width: 280,
            background: "white",
            borderRight: `1px solid ${GRAY200}`,
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          {/* Durum Göstergesi */}
          <div style={{ padding: 16, borderBottom: `1px solid ${GRAY100}` }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: GRAY400,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Durum Göstergesi
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {LEGEND_ITEMS.map((item) => {
                const durumKey = LEGEND_DURUM_MAP[item.label];
                const isActive = durumFiltresi === durumKey;
                return (
                  <div
                    key={item.label}
                    onClick={() => setDurumFiltresi(isActive ? null : durumKey)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "background 0.15s",
                      background: isActive ? (item.emoji === "🟢" ? "#DCFCE7" : item.emoji === "🟠" ? "#FFEDD5" : item.emoji === "🔵" ? "#DBEAFE" : item.emoji === "⚪" ? "#F1F5F9" : "#EDE9FE") : "transparent",
                      border: isActive ? `2px solid ${item.countColor}` : "2px solid transparent",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        flexShrink: 0,
                        background: item.emoji === "🟢" ? "#DCFCE7" : item.emoji === "🟠" ? "#FFEDD5" : item.emoji === "🔵" ? "#DBEAFE" : item.emoji === "⚪" ? "#F1F5F9" : "#EDE9FE",
                        border: item.emoji === "🔒" ? "2px dashed #7C3AED" : item.emoji === "🟢" ? "2px solid #86EFAC" : item.emoji === "🟠" ? "2px solid #FB923C" : item.emoji === "🔵" ? "2px solid #60A5FA" : "2px solid #CBD5E1",
                      }}
                    >
                      {item.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: 12, fontWeight: 600, color: isActive ? NAVY : NAVY }}>{item.label}</strong>
                      <span style={{ fontSize: 10, color: GRAY400 }}>{item.sub}</span>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 800, color: item.countColor }}>{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gruplar */}
          <div style={{ padding: 16, borderBottom: `1px solid ${GRAY100}` }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: GRAY400,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Gruplar
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {gruplar.map((g) => (
                <div
                  key={g.id}
                  onDragOver={(e) => {
                    if (!grupDragId || grupDragId === g.id) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setGrupDropTargetId(g.id);
                  }}
                  onDrop={(e) => handleGrupReorderDrop(e, g.id)}
                  style={{
                    border: `1.5px solid ${g.color}`,
                    borderRadius: 10,
                    overflow: "hidden",
                    boxShadow:
                      grupDropTargetId === g.id && grupDragId && grupDragId !== g.id
                        ? `0 0 0 2px ${TEAL}`
                        : undefined,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 12px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/grup-id", g.id);
                        e.dataTransfer.effectAllowed = "move";
                        setGrupDragId(g.id);
                      }}
                      onDragEnd={() => {
                        setGrupDragId(null);
                        setGrupDropTargetId(null);
                      }}
                      onClick={(ev) => ev.stopPropagation()}
                      style={{
                        cursor: "grab",
                        padding: "2px 4px",
                        fontSize: 12,
                        color: GRAY400,
                        flexShrink: 0,
                        userSelect: "none",
                        lineHeight: 1,
                      }}
                      title="Sürükleyerek sırala"
                    >
                      ⋮⋮
                    </div>
                    <div style={{ width: 12, height: 12, borderRadius: 4, background: g.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, flex: 1 }}>{g.name}</span>
                    <span style={{ fontSize: 11, color: GRAY400 }}>{g.count} şezlong</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => {
                          setDuzenleForm({
                            name: g.name,
                            count: String(g.count),
                            color: g.color,
                            fiyat: g.fiyat || "",
                            aciklama: g.aciklama || "",
                            deniz_sirasi: String(clampDenizSirasi(g.deniz_sirasi)),
                          });
                          setDuzenleModal(g);
                        }}
                        style={{
                          width: 24,
                          height: 24,
                          border: "none",
                          background: GRAY100,
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 11,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => { setSilModal(g); }}
                        style={{
                          width: 24,
                          height: 24,
                          border: "none",
                          background: GRAY100,
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 11,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "0 12px 10px",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 6,
                    }}
                  >
                    <div style={{ background: GRAY50, borderRadius: 6, padding: "6px 8px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ORANGE }}>{g.dolu}</div>
                      <div style={{ fontSize: 9, color: GRAY400 }}>Dolu</div>
                    </div>
                    <div style={{ background: GRAY50, borderRadius: 6, padding: "6px 8px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>{g.bos}</div>
                      <div style={{ fontSize: 9, color: GRAY400 }}>Boş</div>
                    </div>
                    <div style={{ background: GRAY50, borderRadius: 6, padding: "6px 8px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{g.fiyat}</div>
                      <div style={{ fontSize: 9, color: GRAY400 }}>Fiyat/gün</div>
                    </div>
                    <div style={{ background: GRAY50, borderRadius: 6, padding: "6px 8px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{g.doluluk}</div>
                      <div style={{ fontSize: 9, color: GRAY400 }}>Doluluk</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarih & Filtre */}
          <div style={{ padding: 16, borderBottom: `1px solid ${GRAY100}` }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: GRAY400,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Tarih & Filtre
            </div>
            <input
              type="date"
              value={seciliTarih}
              onChange={(e) => setSeciliTarih(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: `1px solid ${GRAY200}`,
                borderRadius: 8,
                fontSize: 12,
                marginBottom: 8,
              }}
            />
            {seciliTarih !== "2026-03-11" && (
              <div style={{ fontSize: 11, color: GRAY400, marginBottom: 8, background: GRAY100, borderRadius: 6, padding: "5px 8px" }}>
                📅 {seciliTarih} için rezervasyon bulunamadı
              </div>
            )}
            {/* Grup Filtre Butonları */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
              {GRUP_BUTTONS.map((gb) => {
                const isActive = grupFiltresi === gb.key;
                return (
                  <button
                    key={gb.label}
                    onClick={() => setGrupFiltresi(isActive ? null : gb.key)}
                    style={{
                      padding: "5px 10px",
                      fontSize: 11,
                      fontWeight: isActive ? 700 : 500,
                      border: isActive ? `2px solid ${gb.color}` : `1.5px solid ${GRAY200}`,
                      borderRadius: 20,
                      background: isActive ? `${gb.color}18` : "white",
                      color: isActive ? gb.color : GRAY600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {gb.label}
                  </button>
                );
              })}
            </div>
            {(durumFiltresi || grupFiltresi) && (
              <button
                onClick={() => { setDurumFiltresi(null); setGrupFiltresi(null); }}
                style={{ marginTop: 4, width: "100%", padding: "5px 10px", fontSize: 11, fontWeight: 600, border: `1px solid ${GRAY200}`, borderRadius: 7, background: GRAY100, color: GRAY600, cursor: "pointer" }}
              >
                ✕ Filtreleri Temizle
              </button>
            )}
          </div>
        </div>

        {/* HARİTA ALANI */}
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
          {/* Deniz çubuğu */}
          <div
            style={{
              background: "linear-gradient(180deg, #0EA5E9 0%, #38BDF8 40%, #7DD3FC 100%)",
              minHeight: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "rgba(255,255,255,0.9)",
                letterSpacing: 6,
                textTransform: "uppercase",
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span className="sezlong-wave">🌊</span>
              <span>D E N İ Z</span>
              <span className="sezlong-wave">🌊</span>
            </div>
          </div>

          {/* Harita canvas */}
          <div style={{ flex: 1, padding: 24, position: "relative", minHeight: 500 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: GRAY400, fontSize: 13 }}>Yükleniyor...</div>
            ) : (
              gruplar.map((row) => {
                const key = row.id;
                const mb = haritaGruplari[key];
                if (!mb) return null;
                const g = mb;
                const grupGizli = grupFiltresi !== null && grupFiltresi !== key;

                return (
                  <div
                    key={key}
                    className="grup-block-hover"
                    style={{
                      marginBottom: 20,
                      borderRadius: 14,
                      overflow: "hidden",
                      border: grupFiltresi === key ? `2px solid ${TEAL}` : "2px solid transparent",
                      transition: "all 0.2s",
                      opacity: grupGizli ? 0.3 : 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "10px 16px",
                        color: "white",
                        background: g.gradient,
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                        <strong style={{ fontSize: 13, fontWeight: 700 }}>{g.icon} {g.title}</strong>
                        {g.sub && g.sub !== g.title ? (
                          <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.9, whiteSpace: "pre-line", lineHeight: 1.45 }}>{g.sub}</div>
                        ) : null}
                      </div>
                      <div style={{ flexShrink: 0, textAlign: "right", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", alignSelf: "flex-start", maxWidth: "48%", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {row.fiyat} / gün · {row.count} Şezlong · {row.doluluk} Dolu
                      </div>
                    </div>
                    <div style={{ background: "white", padding: 16 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {g.durumlar.map((slot) => {
                          const no = g.prefix + slot.numara;
                          const isSecili = seciliNo === no && seciliGrup === key;
                          const durumSoluk = durumFiltresi !== null && slot.durum !== durumFiltresi;
                          return (
                            <div
                              key={slot.id || no}
                              style={{
                                opacity: durumSoluk ? 0.3 : 1,
                                transition: "opacity 0.2s",
                                pointerEvents: (durumSoluk || grupGizli) ? "none" : "auto",
                                borderRadius: 8,
                                boxShadow: topluMod && topluSecilenIds.has(slot.id) ? "0 0 0 3px #F59E0B" : undefined,
                              }}
                            >
                              <SezlongItem
                                no={no}
                                durum={slot.durum}
                                grupKey={key}
                                isSecili={isSecili}
                                onClick={() => handleSezlongClick(no, key, slot.durum, slot.id)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SAĞ BİLGİ PANELİ - info-panel */}
        <div
          style={{
            width: 260,
            background: "white",
            borderLeft: `1px solid ${GRAY200}`,
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          {topluMod ? (
          <div style={{ padding: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 4 }}>
              📋 Toplu Kayıt
            </h3>
            <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>
              {topluSecilenIds.size > 0 
                ? `${topluSecilenIds.size} şezlong seçili` 
                : "Henüz şezlong seçilmedi"}
            </div>
            
            {topluSecilenIds.size > 0 && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                    Durum:
                  </label>
                  <select
                    value={topluDurum}
                    onChange={(e) => setTopluDurum(e.target.value)}
                    style={{ width: "100%", padding: 8, border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 13 }}
                  >
                    <option value="rezerve">🔵 Rezerve</option>
                    <option value="bakim">⚪ Bakım</option>
                    <option value="kilitli">🟣 Kilit</option>
                    <option value="bos">🟢 Boş (Aktif kayıtları iptal et)</option>
                  </select>
                </div>
                
                {(topluDurum === "rezerve" || topluDurum === "bakim" || topluDurum === "kilitli") && (
                  <>
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                        Başlangıç:
                      </label>
                      <input
                        type="date"
                        value={topluBaslangic}
                        onChange={(e) => setTopluBaslangic(e.target.value)}
                        style={{ width: "100%", padding: 8, border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 13 }}
                      />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                        Bitiş:
                      </label>
                      <input
                        type="date"
                        value={topluBitis}
                        onChange={(e) => setTopluBitis(e.target.value)}
                        style={{ width: "100%", padding: 8, border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 13 }}
                      />
                    </div>
                  </>
                )}
                
                <button
                  onClick={handleTopluKaydet}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#0d9488",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  💾 Toplu Kaydet ({topluSecilenIds.size})
                </button>
              </>
            )}
          </div>
          ) : (
          <>
          <div style={{ padding: 16, background: mod === "musteri" ? "#7C3AED" : mod === "goruntulem" ? TEAL : NAVY, color: "white" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Şezlong Detayı</h3>
            <span style={{ fontSize: 11, opacity: 0.6 }}>
              {mod === "musteri" ? "👤 Müşteri Görünümü" : mod === "goruntulem" ? "👁️ Görüntüleme" : "Bir şezlonga tıklayın"}
            </span>
          </div>

          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${GRAY100}` }}>
            <div style={{ background: GRAY50, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: NAVY, marginBottom: 4 }}>
                {seciliNo ?? "—"}
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "white",
                  borderRadius: 20,
                  padding: "4px 10px",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 3,
                    background: seciliGrup ? haritaGruplari[seciliGrup]?.color ?? "#ccc" : "#ccc",
                  }}
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: NAVY }}>
                  {seciliGrup ? (haritaGruplari[seciliGrup]?.title ?? "Grup") : "Seçilmedi"}
                </span>
              </div>
              {mod === "musteri" ? (
                /* Müşteri görünümü: readonly bilgi */
                <div style={{ fontSize: 12, color: GRAY600, padding: "6px 0" }}>
                  <div style={{ marginBottom: 4 }}>📍 Durum: <strong>{DURUM_LABELS[seciliDurum] ?? "—"}</strong></div>
                  {seciliDurum === "bos" && <div style={{ color: GREEN, fontWeight: 600, marginTop: 6 }}>✅ Rezervasyon yapılabilir</div>}
                  {seciliDurum === "dolu" && <div style={{ color: ORANGE, fontWeight: 600, marginTop: 6 }}>🟠 Şu an dolu</div>}
                  {seciliDurum === "rezerve" && <div style={{ color: BLUE, fontWeight: 600, marginTop: 6 }}>🔵 Rezerve edilmiş</div>}
                  {seciliDurum === "bakim" && <div style={{ color: GRAY400, fontWeight: 600, marginTop: 6 }}>⚪ Bakımda</div>}
                  {seciliDurum === "kilitli" && <div style={{ color: "#7C3AED", fontWeight: 600, marginTop: 6 }}>🔒 İşletme Rezervi</div>}
                </div>
              ) : (
                /* Düzenleme / Görüntüleme modu */
                <>
                  <select
                    value={seciliDurum}
                    onChange={(e) => {
                      if (mod !== "duzenleme") return;
                      const newDurum = e.target.value;
                      setSeciliDurum(newDurum);
                      if (seciliGrup && seciliSezlongId) {
                        setHaritaGruplari((prev) => {
                          const h = prev[seciliGrup];
                          if (!h) return prev;
                          return {
                            ...prev,
                            [seciliGrup]: {
                              ...h,
                              durumlar: h.durumlar.map((s) => (s.id === seciliSezlongId ? { ...s, durum: newDurum } : s)),
                            },
                          };
                        });
                        setGruplar((prev) => prev.map((g) => {
                          if (g.id !== seciliGrup) return g;
                          const h = haritaGruplari[seciliGrup];
                          if (!h) return g;
                          const durumlar = h.durumlar.map((d) => d.id === seciliSezlongId ? newDurum : d.durum);
                          const dolu = durumlar.filter((d) => d === "dolu").length;
                          const bos = durumlar.filter((d) => d === "bos").length;
                          return { ...g, dolu, bos, doluluk: h.durumlar.length ? `${Math.round((dolu / h.durumlar.length) * 100)}%` : g.doluluk };
                        }));
                      }
                    }}
                    disabled={mod !== "duzenleme"}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: `1.5px solid ${GRAY200}`,
                      borderRadius: 8,
                      fontSize: 12,
                      marginBottom: 8,
                      opacity: mod === "goruntulem" ? 0.6 : 1,
                      cursor: mod === "duzenleme" ? "pointer" : "default",
                    }}
                  >
                    <option value="bos">🟢 Boş</option>
                    <option value="rezerve">🔵 Rezerve</option>
                    <option value="bakim">⚪ Bakımda</option>
                    <option value="kilitli">🔒 İşletme Rezervi</option>
                  </select>
                  {(seciliDurum === "rezerve" || seciliDurum === "bakim" || seciliDurum === "kilitli") && (
                    <div style={{ marginTop: 12, padding: 10, background: "#F9FAFB", borderRadius: 6, border: "1px solid #E5E7EB" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                        📅 Tarih Aralığı Seçin:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 11, color: "#6B7280" }}>Başlangıç:</label>
                        <input
                          type="date"
                          value={seciliRezerveBaslangic}
                          onChange={(e) => setSeciliRezerveBaslangic(e.target.value)}
                          style={{ padding: 6, border: "1px solid #D1D5DB", borderRadius: 4, fontSize: 13 }}
                        />
                        <label style={{ fontSize: 11, color: "#6B7280" }}>Bitiş:</label>
                        <input
                          type="date"
                          value={seciliRezerveBitis}
                          onChange={(e) => setSeciliRezerveBitis(e.target.value)}
                          style={{ padding: 6, border: "1px solid #D1D5DB", borderRadius: 4, fontSize: 13 }}
                        />
                      </div>
                      <div style={{ fontSize: 11, color: "#6B7280", marginTop: 6, fontStyle: "italic" }}>
                        Bu şezlong seçilen tarihlerde dolu görünecek
                      </div>
                    </div>
                  )}
                  {mod === "duzenleme" && (
                    <button
                      onClick={handleKaydetDegisiklikler}
                      style={{
                        width: "100%",
                        padding: "8px 14px",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        border: "none",
                        background: TEAL,
                        color: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      💾 Kaydet
                    </button>
                  )}
                  {mod === "goruntulem" && (
                    <div style={{ fontSize: 11, color: GRAY400, textAlign: "center", padding: "4px 0" }}>
                      👁️ Salt okunur mod
                    </div>
                  )}
                </>
              )}
            </div>

            {seciliDurum === "dolu" && seciliNo && (
              <div
                style={{
                  background: "white",
                  border: `1px solid ${GRAY200}`,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Ahmet Yılmaz</div>
                <div style={{ fontSize: 11, color: GRAY400, marginBottom: 2 }}>📱 Giriş: 10:30</div>
                <div style={{ fontSize: 11, color: GRAY400, marginBottom: 2 }}>⏱️ Süre: 3 saat 20 dk</div>
                <div style={{ fontSize: 11, color: GRAY400, marginBottom: 2 }}>🍽️ Sipariş: 3 adet</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: TEAL, marginTop: 8 }}>₺1.350 Bakiye</div>
              </div>
            )}
          </div>

          {/* Hızlı İşlemler */}
          {mod !== "musteri" && (
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${GRAY100}` }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: GRAY400,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Hızlı İşlemler
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "📋 Rezervasyon Yap", action: () => { setRezForm({ musteriAdi: "", telefon: "", tarih: new Date().toISOString().slice(0, 10), kisiSayisi: "" }); setRezModal(true); } },
                { label: "🍽️ Sipariş Gör", action: () => router.push("/isletme/siparisler") },
                { label: "💰 Bakiye Gör", action: () => router.push("/isletme/raporlar") },
                {
                  label: "🔧 Bakıma Al",
                  disabled: mod === "goruntulem",
                  action: () => {
                    if (mod === "goruntulem") { showToast("Düzenleme moduna geçin"); return; }
                    if (seciliNo) { setSeciliDurum("bakim"); showToast(`🔧 ${seciliNo} bakıma alındı`); }
                    else { showToast("Önce bir şezlong seçin"); }
                  },
                },
                {
                  label: "📤 Çıkış Yaptır",
                  disabled: mod === "goruntulem",
                  action: () => {
                    if (mod === "goruntulem") { showToast("Düzenleme moduna geçin"); return; }
                    if (seciliNo) { setCikisModal(true); } else { showToast("Önce bir şezlong seçin"); }
                  },
                },
              ].map(({ label, action, disabled }) => (
                <button
                  key={label}
                  onClick={action}
                  className="sezlong-quick-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: `1px solid ${GRAY200}`,
                    background: disabled ? GRAY100 : "white",
                    cursor: disabled ? "not-allowed" : "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    color: disabled ? GRAY400 : GRAY800,
                    textAlign: "left",
                    transition: "all 0.15s",
                    opacity: disabled ? 0.6 : 1,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Bugün Özeti */}
          <div style={{ padding: "14px 16px" }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: GRAY400,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Bugün Özeti
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: GRAY50, borderRadius: 8, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: ORANGE }}>{toplamDolu}</div>
                <div style={{ fontSize: 9, color: GRAY400, marginTop: 2 }}>Dolu</div>
              </div>
              <div style={{ background: GRAY50, borderRadius: 8, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: GREEN }}>{toplamBos}</div>
                <div style={{ fontSize: 9, color: GRAY400, marginTop: 2 }}>Boş</div>
              </div>
              <div style={{ background: GRAY50, borderRadius: 8, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>₺{bugunGelirTutar.toLocaleString("tr-TR")}</div>
                <div style={{ fontSize: 9, color: GRAY400, marginTop: 2 }}>Gelir</div>
              </div>
              <div style={{ background: GRAY50, borderRadius: 8, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: TEAL }}>{bugunSiparisAdet}</div>
                <div style={{ fontSize: 9, color: GRAY400, marginTop: 2 }}>Sipariş</div>
              </div>
            </div>
          </div>
          </>
        )}
        </div>
      </div>

      {/* Kilitli toast - HTML ile aynı */}
      {kilitliToastNo && (
        <div
          style={{
            position: "fixed",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#7C3AED",
            color: "white",
            padding: "12px 24px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 999,
            boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          🔒 {kilitliToastNo} — Bu şezlong işletme tarafından rezerve edilmiştir
        </div>
      )}

      {/* Grup Ekle Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              width: 400,
              maxWidth: "95vw",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 16 }}>➕ Yeni Grup Ekle</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 4 }}>Grup Adı</label>
              <input
                type="text"
                value={grupEkleForm.ad}
                onChange={(e) => setGrupEkleForm((f) => ({ ...f, ad: e.target.value }))}
                placeholder="örn: Platin, Sahil, İskele..."
                style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 4 }}>Şezlong Sayısı</label>
              <input
                type="number"
                value={grupEkleForm.kapasite}
                onChange={(e) => setGrupEkleForm((f) => ({ ...f, kapasite: e.target.value }))}
                placeholder="örn: 20"
                min={1}
                max={200}
                style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 4 }}>Günlük Fiyat (₺)</label>
              <input
                type="number"
                value={grupEkleForm.fiyat}
                onChange={(e) => setGrupEkleForm((f) => ({ ...f, fiyat: e.target.value }))}
                placeholder="örn: 1500"
                min={0}
                style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 4 }}>Konum / Açıklama</label>
              <textarea
                value={grupEkleForm.aciklama}
                onChange={(e) => setGrupEkleForm((f) => ({ ...f, aciklama: e.target.value }))}
                placeholder="örn: Denize sıfır, Gölgelik alan..."
                rows={3}
                style={{ width: "100%", minHeight: 72, padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13, resize: "vertical", fontFamily: "inherit", lineHeight: 1.45, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 4 }}>Grup Rengi</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {COLOR_OPTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setGrupEkleForm((f) => ({ ...f, renk: c }))}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: c,
                      border: grupEkleForm.renk === c ? `2px solid ${NAVY}` : "2px solid transparent",
                      cursor: "pointer",
                      transform: grupEkleForm.renk === c ? "scale(1.2)" : "scale(1)",
                      transition: "all 0.15s",
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: GRAY600, marginBottom: 4 }}>Ön Ödeme Tipi</label>
              <select style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}>
                <option>Ön Ödemeli (Bakiye yüklenir)</option>
                <option>Sadece Sezlong Kiralama</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}
              >
                İptal
              </button>
              <button
                onClick={handleGrupEkle}
                disabled={!grupEkleForm.ad.trim()}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  border: "none",
                  background: !grupEkleForm.ad.trim() ? GRAY200 : TEAL,
                  color: "white",
                  cursor: !grupEkleForm.ad.trim() ? "not-allowed" : "pointer",
                }}
              >
                ✅ Grubu Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: NAVY, color: "white", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 500 }}>
          {toast}
        </div>
      )}

      {/* Çıkış Yaptır Onay Modal */}
      {cikisModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setCikisModal(false)}
        >
          <div
            style={{ background: "white", borderRadius: 14, width: 340, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "22px 20px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📤</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Çıkış Yaptır</h3>
              <p style={{ fontSize: 13, color: GRAY600, lineHeight: 1.5 }}>
                <strong style={{ color: NAVY }}>{seciliNo}</strong> numaralı şezlongtaki müşteriyi çıkış yaptırmak istediğinize emin misiniz?
              </p>
            </div>
            <div style={{ padding: "12px 20px 20px", display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => setCikisModal(false)} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button
                onClick={async () => {
                  setCikisModal(false);
                  if (seciliSezlongId) {
                    await supabase.from("sezlonglar").update({ durum: "bos" }).eq("id", seciliSezlongId);
                    if (seciliGrup) {
                      setHaritaGruplari((prev) => {
                        const h = prev[seciliGrup];
                        if (!h) return prev;
                        return { ...prev, [seciliGrup]: { ...h, durumlar: h.durumlar.map((s) => (s.id === seciliSezlongId ? { ...s, durum: "bos" } : s)) } };
                      });
                      setGruplar((prev) =>
                        prev.map((g) => {
                          if (g.id !== seciliGrup) return g;
                          const h = haritaGruplari[seciliGrup];
                          if (!h) return g;
                          const updated = h.durumlar.map((d) => (d.id === seciliSezlongId ? "bos" : d.durum));
                          const dolu = updated.filter((d) => d === "dolu").length;
                          const bos = updated.filter((d) => d === "bos").length;
                          return { ...g, dolu, bos, doluluk: updated.length ? `${Math.round((dolu / updated.length) * 100)}%` : g.doluluk };
                        })
                      );
                      setLegendCounts((c) => ({ ...c, dolu: c.dolu - 1, bos: c.bos + 1 }));
                    }
                  }
                  setSeciliDurum("bos");
                  showToast(`✅ ${seciliNo} şezlongu boşaltıldı`);
                }}
                style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}
              >
                Evet, Çıkış Yaptır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rezervasyon Oluştur Modal */}
      {rezModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setRezModal(false)}
        >
          <div
            style={{ background: "white", borderRadius: 16, width: 400, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>📋 Rezervasyon Oluştur</h3>
              <button onClick={() => setRezModal(false)} style={{ background: GRAY100, border: "none", borderRadius: 7, width: 26, height: 26, cursor: "pointer", fontSize: 13 }}>✕</button>
            </div>
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {seciliNo && (
                <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#1E40AF", fontWeight: 600 }}>
                  🏖️ Seçili Şezlong: {seciliNo}
                </div>
              )}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Müşteri Adı</label>
                <input type="text" value={rezForm.musteriAdi} onChange={(e) => setRezForm((f) => ({ ...f, musteriAdi: e.target.value }))} placeholder="Ad Soyad" style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Telefon</label>
                <input type="tel" value={rezForm.telefon} onChange={(e) => setRezForm((f) => ({ ...f, telefon: e.target.value }))} placeholder="+90 5xx xxx xx xx" style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Tarih</label>
                <input type="date" value={rezForm.tarih} onChange={(e) => setRezForm((f) => ({ ...f, tarih: e.target.value }))} style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Kişi Sayısı</label>
                <input type="number" min={1} value={rezForm.kisiSayisi} onChange={(e) => setRezForm((f) => ({ ...f, kisiSayisi: e.target.value }))} placeholder="2" style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }} />
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${GRAY100}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setRezModal(false)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button
                onClick={async () => {
                  if (!tesisId) {
                    showToast("Oturum bulunamadı.");
                    return;
                  }
                  if (!seciliSezlongId) {
                    showToast("⚠️ Lütfen bir şezlong seçin.");
                    return;
                  }
                  const tarih = rezForm.tarih || new Date().toISOString().slice(0, 10);
                  const baslangicStr = `${tarih}T09:00:00`;
                  const bitisStr = `${tarih}T23:59:59`;
                  const kisi = parseInt(rezForm.kisiSayisi, 10) || 2;
                  const { error } = await supabase.from("rezervasyonlar").insert({
                    tesis_id: tesisId,
                    musteri_adi: rezForm.musteriAdi.trim() || null,
                    telefon: rezForm.telefon.trim() || null,
                    sezlong_id: seciliSezlongId,
                    sezlong_ids: [seciliSezlongId],
                    baslangic_tarih: baslangicStr,
                    bitis_tarih: bitisStr,
                    kisi_sayisi: kisi,
                    toplam_tutar: 0,
                    durum: "onaylandi",
                    giris_yapildi: true,
                  });
                  setRezModal(false);
                  setRezForm({ musteriAdi: "", telefon: "", tarih: new Date().toISOString().slice(0, 10), kisiSayisi: "" });
                  if (error) {
                    console.error("Rezervasyon insert error:", error);
                    showToast("Rezervasyon kaydedilemedi.");
                    return;
                  }
                  showToast("✅ Rezervasyon oluşturuldu!");
                }}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}
              >
                Rezervasyonu Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grubu Düzenle Modal */}
      {duzenleModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setDuzenleModal(null)}
        >
          <div
            style={{ background: "white", borderRadius: 14, width: 380, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${GRAY100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>✏️ Grubu Düzenle</h3>
              <button onClick={() => setDuzenleModal(null)} style={{ background: GRAY100, border: "none", borderRadius: 7, width: 26, height: 26, cursor: "pointer", fontSize: 13 }}>✕</button>
            </div>
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Grup Adı</label>
                <input
                  type="text"
                  value={duzenleForm.name}
                  onChange={(e) => setDuzenleForm((f) => ({ ...f, name: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Şezlong Sayısı</label>
                <input
                  type="number"
                  min={1}
                  value={duzenleForm.count}
                  onChange={(e) => setDuzenleForm((f) => ({ ...f, count: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 6 }}>Renk</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {COLOR_OPTS.map((c) => (
                    <div
                      key={c}
                      onClick={() => setDuzenleForm((f) => ({ ...f, color: c }))}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: c,
                        cursor: "pointer",
                        border: duzenleForm.color === c ? "3px solid #0A1628" : "3px solid transparent",
                        boxSizing: "border-box",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Fiyat/gün</label>
                <input
                  type="text"
                  value={duzenleForm.fiyat}
                  onChange={(e) => setDuzenleForm((f) => ({ ...f, fiyat: e.target.value }))}
                  placeholder="₺1.000"
                  style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GRAY600, marginBottom: 4 }}>Konum / Açıklama</label>
                <textarea
                  value={duzenleForm.aciklama}
                  onChange={(e) => setDuzenleForm((f) => ({ ...f, aciklama: e.target.value }))}
                  placeholder="örn: Denize sıfır, 1. Sıra..."
                  rows={3}
                  style={{ width: "100%", minHeight: 72, padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 8, fontSize: 13, resize: "vertical", fontFamily: "inherit", lineHeight: 1.45, boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${GRAY100}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setDuzenleModal(null)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={saveDuzenle} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Grup Sil Onay Modal */}
      {silModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setSilModal(null)}
        >
          <div
            style={{ background: "white", borderRadius: 14, width: 340, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "20px 20px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Emin misiniz?</h3>
              <p style={{ fontSize: 13, color: GRAY600, lineHeight: 1.5 }}>
                <strong style={{ color: NAVY }}>{silModal.name}</strong> grubunu silmek istediğinize emin misiniz?
              </p>
            </div>
            <div style={{ padding: "12px 20px 20px", display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => setSilModal(null)} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={silGrup} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: "#EF4444", color: "white", cursor: "pointer" }}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* HTML ile aynı stiller */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes sezlong-wave {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .sezlong-wave { animation: sezlong-wave 2s ease-in-out infinite; }
          .sezlong-item:hover .sezlong-inner { transform: translateY(-3px); }
          .sezlong-kilitli:hover .sezlong-inner { transform: none; }
          .sezlong-quick-btn:hover { background: #0A1628 !important; color: white !important; border-color: #0A1628 !important; }
          .legend-item-hover:hover { background: #F8FAFC; }
          .grup-block-hover:hover { border-color: rgba(10,186,181,0.3); }
        `,
      }} />
    </div>
  );
}
