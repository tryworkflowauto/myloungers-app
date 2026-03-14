\"use client\";

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

type TesisDurum = "aktif" | "onay" | "askida";
type Tesis = { id: number; ad: string; sehir: string; emoji: string; emojiBg: string; durum: TesisDurum; sezlong: number; ciro?: string; komisyon?: string; puan?: number; puanYuzde?: number; sonAktivite: string; };

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

const INIT: Tesis[] = [
  { id: 1, ad: "Zuzuu Beach Hotel",  sehir: "Bodrum",   emoji: "🌊", emojiBg: "#E0F2FE", durum: "aktif",  sezlong: 100, ciro: "₺148K", komisyon: "₺22.2K", puan: 9.2, puanYuzde: 92, sonAktivite: "2 dk önce" },
  { id: 2, ad: "Palmiye Beach Club", sehir: "Bodrum",   emoji: "☀️", emojiBg: "#FEF3C7", durum: "aktif",  sezlong: 60,  ciro: "₺68K",  komisyon: "₺10.2K", puan: 8.8, puanYuzde: 88, sonAktivite: "14 dk önce" },
  { id: 3, ad: "Poseidon Lux",       sehir: "Bodrum",   emoji: "🔱", emojiBg: "#EDE9FE", durum: "aktif",  sezlong: 45,  ciro: "₺41K",  komisyon: "₺6.1K",  puan: 9.5, puanYuzde: 95, sonAktivite: "1 saat önce" },
  { id: 4, ad: "Aqua Park Bodrum",   sehir: "Bodrum",   emoji: "🌊", emojiBg: "#FEE2E2", durum: "onay",   sezlong: 80,  sonAktivite: "Başvuru: 10 Mar" },
  { id: 5, ad: "Mavi Deniz Beach",   sehir: "Bodrum",   emoji: "🏖️", emojiBg: "#DBEAFE", durum: "onay",   sezlong: 35,  sonAktivite: "Başvuru: 9 Mar" },
  { id: 6, ad: "Olimpia Beach",      sehir: "Antalya",  emoji: "🌴", emojiBg: "#DCFCE7", durum: "aktif",  sezlong: 55,  ciro: "₺27K",  komisyon: "₺4.0K",  puan: 8.5, puanYuzde: 85, sonAktivite: "3 saat önce" },
  { id: 7, ad: "Kemer Sea Club",     sehir: "Antalya",  emoji: "⛵", emojiBg: "#FEF9C3", durum: "askida", sezlong: 40,  sonAktivite: "Askıya: 5 Mar" },
];

export default function AdminTesislerPage() {
  const { showToast } = useAdminToast();
  const [tesisler, setTesisler] = useState<Tesis[]>(INIT);
  const [basvurular, setBasvurular] = useState<Basvuru[]>([]);
  const [basvuruLoading, setBasvuruLoading] = useState(true);
  const [basvuruSavingId, setBasvuruSavingId] = useState<string | null>(null);
  const [ara, setAra] = useState("");
  const [tab, setTab] = useState<"tumu" | "aktif" | "onay" | "askida">("tumu");
  const [onayModal, setOnayModal] = useState<Tesis | null>(null);
  const [reddetModal, setReddetModal] = useState<Tesis | null>(null);
  const [redSebebi, setRedSebebi] = useState("");

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
    const tabOk = tab === "tumu" || t.durum === tab;
    const araOk = !ara || t.ad.toLowerCase().includes(ara.toLowerCase()) || t.sehir.toLowerCase().includes(ara.toLowerCase());
    return tabOk && araOk;
  });

  function onaylaTesis(t: Tesis) {
    setTesisler(p => p.map(x => x.id === t.id ? { ...x, durum: "aktif" as TesisDurum } : x));
    setOnayModal(null); showToast("✅ " + t.ad + " onaylandı!", GREEN);
  }
  function reddetTesis(t: Tesis) {
    setTesisler(p => p.filter(x => x.id !== t.id));
    setReddetModal(null); setRedSebebi(""); showToast("✗ " + t.ad + " reddedildi", RED);
  }
  function askiyaAl(id: number) { setTesisler(p => p.map(x => x.id === id ? { ...x, durum: "askida" as TesisDurum } : x)); showToast("⏸ Tesis askıya alındı"); }
  function aktifYap(id: number) { setTesisler(p => p.map(x => x.id === id ? { ...x, durum: "aktif" as TesisDurum } : x)); showToast("✅ Tesis aktifleştirildi", GREEN); }

  const counts = { tumu: tesisler.length, aktif: tesisler.filter(t => t.durum === "aktif").length, onay: tesisler.filter(t => t.durum === "onay").length, askida: tesisler.filter(t => t.durum === "askida").length };
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
                    onClick={async () => {
                      try {
                        setBasvuruSavingId(b.id);
                        const { error } = await supabase
                          .from("basvurular")
                          .update({ durum: "onaylandi" })
                          .eq("id", b.id);
                        if (error) throw error;
                        setBasvurular(prev => prev.filter(x => x.id !== b.id));
                        showToast("✅ Başvuru onaylandı: " + b.isletme_adi, GREEN);
                      } catch (err) {
                        console.error(err);
                        showToast("Onay sırasında hata oluştu", RED);
                      } finally {
                        setBasvuruSavingId(null);
                      }
                    }}
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
              {goruntulenen.map(t => (
                <tr key={t.id} style={{ background: t.durum === "onay" ? "#FFFBEB" : t.durum === "askida" ? "#FFF1F2" : undefined }}>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: t.emojiBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{t.emoji}</div>
                      <span style={{ fontWeight: 700, color: NAVY }}>{t.ad}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}`, color: GRAY600 }}>📍 {t.sehir}</td>
                  <td style={{ padding: "12px 14px", borderTop: `1px solid ${GRAY100}` }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: t.durum === "aktif" ? "#DCFCE7" : t.durum === "askida" ? "#FEE2E2" : "#FEF3C7", color: t.durum === "aktif" ? "#16A34A" : t.durum === "askida" ? RED : "#D97706" }}>
                      ● {t.durum === "aktif" ? "Aktif" : t.durum === "askida" ? "Askıda" : "Onay Bekliyor"}
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
                      {t.durum === "onay" && <><button onClick={() => setOnayModal(t)} style={{ padding: "4px 9px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: "none", background: TEAL, color: "white", cursor: "pointer" }}>✓ Onayla</button><button onClick={() => { setReddetModal(t); setRedSebebi(""); }} style={{ padding: "4px 9px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: `1px solid #FECACA`, background: "#FEF2F2", color: RED, cursor: "pointer" }}>✗ Reddet</button></>}
                      {t.durum === "aktif" && <button onClick={() => askiyaAl(t.id)} style={{ padding: "4px 9px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: `1px solid ${GRAY200}`, background: GRAY100, color: GRAY800, cursor: "pointer" }}>⏸ Askıya Al</button>}
                      {t.durum === "askida" && <button onClick={() => aktifYap(t.id)} style={{ padding: "4px 9px", fontSize: 11, fontWeight: 600, borderRadius: 7, border: "none", background: GREEN, color: "white", cursor: "pointer" }}>▶ Aktifleştir</button>}
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
