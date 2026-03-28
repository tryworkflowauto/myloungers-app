"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAdminToast } from "../AdminToastContext";

const NAVY = "#0A1628"; const TEAL = "#0ABAB5"; const ORANGE = "#F5821F";
const GRAY50 = "#F8FAFC"; const GRAY100 = "#F1F5F9"; const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8"; const GRAY600 = "#475569"; const GRAY800 = "#1E293B";
const GREEN = "#10B981"; const RED = "#EF4444"; const YELLOW = "#F59E0B";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Tesis = {
  id: string;
  ad: string;
  sehir: string;
  emoji: string;
  emojiBg: string;
  aktif: boolean;
  sezlong: number;
  ciro?: string;
  komisyon?: string;
  puan?: number;
  puanYuzde?: number;
  sonAktivite: string;
};

type Basvuru = {
  id: string;
  isletme_adi: string;
  sehir: string;
  ilce: string | null;
  tesis_tipi: string;
  kapasite: number;
  tam_adres: string | null;
  sezon: string | null;
  ozellikler: string[] | null;
  ek_notlar: string | null;
  ad_soyad: string;
  gorev: string | null;
  telefon: string;
  email: string | null;
  durum: string | null;
};

export default function AdminTesislerPage() {
  const { showToast } = useAdminToast();
  const [tesisler, setTesisler] = useState<Tesis[]>([]);
  const [basvurular, setBasvurular] = useState<Basvuru[]>([]);
  const [basvuruLoading, setBasvuruLoading] = useState(true);
  const [basvuruSavingId, setBasvuruSavingId] = useState<string | null>(null);
  const [ara, setAra] = useState("");
  const [tab, setTab] = useState<"tumu" | "aktif" | "onay" | "askida">("tumu");
  const [onayModal, setOnayModal] = useState<Tesis | null>(null);
  const [reddetModal, setReddetModal] = useState<Tesis | null>(null);
  const [redSebebi, setRedSebebi] = useState("");

  useEffect(() => {
    async function fetchTesisler() {
      const { data, error } = await supabase
        .from("tesisler")
        .select("*")
        .order("id", { ascending: true });
      if (error) {
        console.error("Tesisler fetch error", error);
        showToast("Tesisler yüklenemedi", RED);
        return;
      }
      if (!data) return;
      const mapped: Tesis[] = (data as any[]).map((t) => {
        const aktif = t.aktif === true;
        const sezlong = typeof t.kapasite === "number" ? t.kapasite : Number(t.kapasite || 0);
        const puan = typeof t.puan === "number" ? t.puan : t.puan ? Number(t.puan) : undefined;
        return {
          id: String(t.id),
          ad: (t.ad as string) || "İsimsiz Tesis",
          sehir: (t.sehir as string) || "-",
          emoji: "🏖️",
          emojiBg: "#E0F2FE",
          aktif,
          sezlong,
          ciro: (t.ciro as string) ?? undefined,
          komisyon: (t.komisyon as string) ?? undefined,
          puan,
          puanYuzde: puan ? puan * 10 : undefined,
          sonAktivite: (t.son_aktivite as string) || "-",
        };
      });
      setTesisler(mapped);
    }
    fetchTesisler();
  }, [showToast]);

  useEffect(() => {
    async function fetchBasvurular() {
      setBasvuruLoading(true);
      const { data, error } = await supabase
        .from("basvurular")
        .select("*")
        .eq("durum", "beklemede")
        .order("id", { ascending: false });
      if (error) {
        console.error("Basvurular fetch error", error);
        showToast("Başvurular yüklenirken hata oluştu", RED);
      } else if (data) {
        setBasvurular(data as Basvuru[]);
      }
      setBasvuruLoading(false);
    }
    fetchBasvurular();
  }, [showToast]);

  const goruntulenen = tesisler.filter(t => {
    const tabOk =
      tab === "tumu" ||
      (tab === "aktif" && t.aktif) ||
      (tab === "askida" && !t.aktif);
    const araOk = !ara || t.ad.toLowerCase().includes(ara.toLowerCase()) || t.sehir.toLowerCase().includes(ara.toLowerCase());
    return tabOk && araOk;
  });

  function onaylaTesis(t: Tesis) {
    setTesisler(p => p.map(x => x.id === t.id ? { ...x, aktif: true } : x));
    setOnayModal(null); showToast("✅ " + t.ad + " onaylandı!", GREEN);
  }
  function reddetTesis(t: Tesis) {
    setTesisler(p => p.filter(x => x.id !== t.id));
    setReddetModal(null); setRedSebebi(""); showToast("✗ " + t.ad + " reddedildi", RED);
  }
  async function askiyaAl(id: number) {
    if (!id) return;
    try {
      const res = await fetch("/api/admin/tesis-durum", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, aktif: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast((data as { error?: string })?.error || "Tesis güncellenemedi", RED);
        return;
      }
      setTesisler((p) => p.map((x) => (x.id === id ? { ...x, aktif: false } : x)));
      showToast("⏸ Tesis askıya alındı");
    } catch {
      showToast("Tesis güncellenemedi", RED);
    }
  }
  async function aktifYap(id: string) {
    if (!id) return;
    try {
      const res = await fetch("/api/admin/tesis-durum", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, aktif: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast((data as { error?: string })?.error || "Tesis güncellenemedi", RED);
        return;
      }
      setTesisler((p) => p.map((x) => (x.id === id ? { ...x, aktif: true } : x)));
      showToast("✅ Tesis aktifleştirildi", GREEN);
    } catch {
      showToast("Tesis güncellenemedi", RED);
    }
  }

  async function onaylaBasvuru(b: Basvuru) {
    try {
      setBasvuruSavingId(b.id);
      const res = await fetch("/api/admin/onayla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basvuru: b }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data?.error || "Onay sırasında hata oluştu", RED);
        return;
      }
      const inserted = data.tesis as any | undefined;
      setBasvurular(prev => prev.filter(x => x.id !== b.id));
      if (inserted) {
        const sezlong = typeof inserted.kapasite === "number" ? inserted.kapasite : Number(inserted.kapasite || 0);
        const puan = typeof inserted.puan === "number" ? inserted.puan : inserted.puan ? Number(inserted.puan) : undefined;
        const yeni: Tesis = {
          id: String(inserted.id),
          ad: (inserted.ad as string) || "İsimsiz Tesis",
          sehir: (inserted.sehir as string) || "-",
          emoji: "🏖️",
          emojiBg: "#E0F2FE",
          aktif: inserted.aktif !== false,
          sezlong,
          ciro: (inserted.ciro as string) ?? undefined,
          komisyon: (inserted.komisyon as string) ?? undefined,
          puan,
          puanYuzde: puan ? puan * 10 : undefined,
          sonAktivite: (inserted.son_aktivite as string) || "-",
        };
        setTesisler(prev => [...prev, yeni]);
      }
      showToast("✅ Başvuru onaylandı ve tesis eklendi: " + b.isletme_adi, GREEN);
    } catch (err) {
      console.error(err);
      showToast("Onay sırasında hata oluştu", RED);
    } finally {
      setBasvuruSavingId(null);
    }
  }

  const counts = { tumu: tesisler.length, aktif: tesisler.filter(t => t.aktif).length, onay: 0, askida: tesisler.filter(t => !t.aktif).length };
  const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>🏖️ Tesis Yönetimi</h2><p style={{ fontSize: 12, color: GRAY400 }}>Platforma kayıtlı tüm tesisler</p></div>
        <input type="text" placeholder="🔍 Tesis veya şehir ara..." value={ara} onChange={e => setAra(e.target.value)} style={{ padding: "8px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 12, width: 220 }} />
      </div>

      {/* Bekleyen Başvurular (Supabase) */}
      <div style={{ marginBottom: 20, background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>📥</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Bekleyen Tesis Başvuruları</div>
              <div style={{ fontSize: 11, color: GRAY400 }}>Supabase &quot;basvurular&quot; tablosundan durum = &quot;beklemede&quot; kayıtlar</div>
            </div>
          </div>
          <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "#FEF3C7", color: "#D97706", fontWeight: 700 }}>
            {basvuruLoading ? "Yükleniyor..." : `${basvurular.length} başvuru`}
          </span>
        </div>
        {basvurular.length === 0 && !basvuruLoading && (
          <div style={{ padding: "10px 4px", fontSize: 12, color: GRAY400 }}>Şu anda bekleyen başvuru bulunmuyor.</div>
        )}
        {basvuruLoading && (
          <div style={{ padding: "10px 4px", fontSize: 12, color: GRAY400 }}>Veriler getiriliyor…</div>
        )}
        {!basvuruLoading && basvurular.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {basvurular.map(b => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 10, background: GRAY50, border: `1px solid ${GRAY100}` }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{b.isletme_adi}</div>
                  <div style={{ fontSize: 11, color: GRAY600 }}>
                    📍 {b.ilce ? `${b.ilce}, ` : ""}{b.sehir} · {b.tesis_tipi === "hotel" ? "Hotel" : b.tesis_tipi === "aqua" ? "Aqua Park" : "Beach Club"}
                  </div>
                  <div style={{ fontSize: 11, color: GRAY400 }}>
                    👤 {b.ad_soyad} · 📞 {b.telefon}{b.email ? ` · ✉️ ${b.email}` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    disabled={basvuruSavingId === b.id}
                    onClick={() => onaylaBasvuru(b)}
                    style={{ padding: "6px 10px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: "none", background: TEAL, color: "white", cursor: "pointer", opacity: basvuruSavingId === b.id ? 0.7 : 1 }}
                  >
                    ✓ Onayla
                  </button>
                  <button
                    disabled={basvuruSavingId === b.id}
                    onClick={async () => {
                      try {
                        setBasvuruSavingId(b.id);
                        const { error } = await supabase
                          .from("basvurular")
                          .update({ durum: "reddedildi" })
                          .eq("id", b.id);
                        if (error) throw error;
                        setBasvurular(prev => prev.filter(x => x.id !== b.id));
                        showToast("✗ Başvuru reddedildi: " + b.isletme_adi, RED);
                      } catch (err) {
                        console.error(err);
                        showToast("Reddederken hata oluştu", RED);
                      } finally {
                        setBasvuruSavingId(null);
                      }
                    }}
                    style={{ padding: "6px 10px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: `1px solid #FECACA`, background: "#FEF2F2", color: RED, cursor: "pointer", opacity: basvuruSavingId === b.id ? 0.7 : 1 }}
                  >
                    ✗ Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {([["tumu","Tümü",GRAY400],["aktif","Aktif",GREEN],["onay","Onay Bekliyor",ORANGE],["askida","Askıda",RED]] as const).map(([key, label, color]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: "7px 16px", borderRadius: 20, border: `1.5px solid ${tab === key ? color : GRAY200}`, background: tab === key ? color : "white", fontSize: 12, fontWeight: 600, cursor: "pointer", color: tab === key ? "white" : GRAY600 }}>
            {label} <span style={{ opacity: 0.8 }}>({counts[key]})</span>
          </button>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: 14, border: `1px solid ${GRAY200}`, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: GRAY50 }}>
                {["Tesis","Şehir","Durum","Şezlong","Ciro","Komisyon","Puan","Son Aktivite","Eylemler"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: GRAY400, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {goruntulenen.length === 0 && (
                <tr><td colSpan={9} style={{ padding: "40px", textAlign: "center", color: GRAY400, fontSize: 13 }}>Bu filtrede tesis bulunamadı</td></tr>
              )}
              {goruntulenen.map((t, index) => (
                <tr key={t.id?.toString() ?? index} style={{ background: !t.aktif ? "#FFF1F2" : undefined }}>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: t.emojiBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{t.emoji}</div>
                      <span style={{ fontWeight: 700, color: NAVY }}>{t.ad}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}`, color: GRAY600 }}>📍 {t.sehir}</td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}` }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: t.aktif ? "#DCFCE7" : "#FEE2E2", color: t.aktif ? "#16A34A" : RED }}>
                      ● {t.aktif ? "Aktif" : "Askıda"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}` }}>{t.sezlong} şzl</td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}`, fontWeight: 700 }}>{t.ciro ?? "—"}</td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}`, fontWeight: 700, color: t.komisyon ? GREEN : GRAY400 }}>{t.komisyon ?? "—"}</td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}` }}>
                    {t.puan ? <><div style={{ width: 46, height: 4, background: GRAY200, borderRadius: 20, overflow: "hidden", display: "inline-block", verticalAlign: "middle", marginRight: 4 }}><div style={{ height: "100%", width: (t.puanYuzde ?? 0) + "%", background: GREEN, borderRadius: 20 }} /></div>{t.puan}</> : "—"}
                  </td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}`, color: GRAY400 }}>{t.sonAktivite}</td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}` }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "nowrap" }}>
                      {t.aktif && <button onClick={() => askiyaAl(t.id)} style={{ padding: "4px 9px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>⏸ Askıya Al</button>}
                      {!t.aktif && <button onClick={() => aktifYap(t.id)} style={{ padding: "4px 9px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: "none", background: GREEN, color: "white", cursor: "pointer" }}>▶ Aktifleştir</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {onayModal && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setOnayModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 380, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Tesis Onaylanacak</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 20 }}><strong>{onayModal.ad}</strong> onaylanacak ve sisteme dahil edilecek. Emin misiniz?</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setOnayModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => onaylaTesis(onayModal)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>✓ Onayla</button>
            </div>
          </div>
        </div>
      )}
      {reddetModal && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setReddetModal(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Başvuruyu Reddet</h3>
            <p style={{ fontSize: 13, color: GRAY600, marginBottom: 14 }}><strong style={{ color: RED }}>{reddetModal.ad}</strong> reddedilecek.</p>
            <label style={{ fontSize: 11, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 6 }}>Red Sebebi (isteğe bağlı)</label>
            <textarea value={redSebebi} onChange={e => setRedSebebi(e.target.value)} placeholder="Belge eksikliği, uygunsuz lokasyon vb..." rows={3} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GRAY200}`, borderRadius: 9, fontSize: 13, resize: "vertical" }} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setReddetModal(null)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>İptal</button>
              <button onClick={() => reddetTesis(reddetModal)} style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", background: RED, color: "white", cursor: "pointer" }}>✗ Reddet</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
