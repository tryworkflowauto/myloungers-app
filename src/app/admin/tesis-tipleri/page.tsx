"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminToast } from "../AdminToastContext";
import { supabase } from "@/lib/supabase";

const NAVY = "#0A1628";
const TEAL = "#0ABAB5";
const GRAY50 = "#F8FAFC";
const GRAY100 = "#F1F5F9";
const GRAY200 = "#E2E8F0";
const GRAY400 = "#94A3B8";
const GRAY600 = "#475569";
const GRAY800 = "#1E293B";
const GREEN = "#10B981";
const RED = "#EF4444";

type TesisTipi = {
  id: string;
  slug: string;
  ad: string;
  db_value: string;
  yer_etiketi: string | null;
  sira: number;
  aktif: boolean;
};

type EditDraft = {
  ad: string;
  yer_etiketi: string;
  sira: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  border: `1.5px solid ${GRAY200}`,
  borderRadius: 8,
  fontSize: 12,
  background: "white",
};

const readOnlyStyle: React.CSSProperties = {
  ...inputStyle,
  background: GRAY50,
  color: GRAY600,
  cursor: "not-allowed",
};

async function adminApiFetch(path: string, init?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  return fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
}

export default function AdminTesisTipleriPage() {
  const { showToast } = useAdminToast();
  const [liste, setListe] = useState<TesisTipi[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydedenId, setKaydedenId] = useState<string | null>(null);
  const [yeniKayit, setYeniKayit] = useState(false);
  const [yeni, setYeni] = useState({
    slug: "",
    ad: "",
    db_value: "",
    yer_etiketi: "",
    sira: "0",
  });
  const [draftlar, setDraftlar] = useState<Record<string, EditDraft>>({});

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    const res = await adminApiFetch("/api/admin/tesis-tipleri");
    const json = (await res.json().catch(() => ({}))) as { data?: TesisTipi[]; error?: string };
    if (!res.ok) {
      showToast(json.error ?? "Liste yüklenemedi", RED);
      setListe([]);
      setYukleniyor(false);
      return;
    }
    const rows = json.data ?? [];
    setListe(rows);
    const drafts: Record<string, EditDraft> = {};
    for (const r of rows) {
      drafts[r.id] = {
        ad: r.ad,
        yer_etiketi: r.yer_etiketi ?? "",
        sira: String(r.sira),
      };
    }
    setDraftlar(drafts);
    setYukleniyor(false);
  }, [showToast]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  async function toggleAktif(row: TesisTipi) {
    setKaydedenId(row.id);
    const res = await adminApiFetch("/api/admin/tesis-tipleri", {
      method: "PATCH",
      body: JSON.stringify({ id: row.id, aktif: !row.aktif }),
    });
    const json = (await res.json().catch(() => ({}))) as { data?: TesisTipi; error?: string };
    setKaydedenId(null);
    if (!res.ok) {
      showToast(json.error ?? "Durum güncellenemedi", RED);
      return;
    }
    if (json.data) {
      setListe((prev) => prev.map((x) => (x.id === row.id ? json.data! : x)));
      showToast(json.data.aktif ? "✓ Aktif yapıldı" : "Pasif yapıldı", json.data.aktif ? GREEN : undefined);
    }
  }

  async function satirKaydet(id: string) {
    const d = draftlar[id];
    if (!d) return;
    const ad = d.ad.trim();
    if (!ad) {
      showToast("Ad boş olamaz", RED);
      return;
    }
    const siraNum = Number(d.sira);
    if (!Number.isFinite(siraNum)) {
      showToast("Sıra geçersiz", RED);
      return;
    }

    setKaydedenId(id);
    const res = await adminApiFetch("/api/admin/tesis-tipleri", {
      method: "PATCH",
      body: JSON.stringify({
        id,
        ad,
        yer_etiketi: d.yer_etiketi.trim() === "" ? null : d.yer_etiketi.trim(),
        sira: Math.floor(siraNum),
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { data?: TesisTipi; error?: string };
    setKaydedenId(null);
    if (!res.ok) {
      showToast(json.error ?? "Kaydedilemedi", RED);
      return;
    }
    if (json.data) {
      setListe((prev) => {
        const next = prev.map((x) => (x.id === id ? json.data! : x));
        return [...next].sort((a, b) => a.sira - b.sira);
      });
      setDraftlar((prev) => ({
        ...prev,
        [id]: {
          ad: json.data!.ad,
          yer_etiketi: json.data!.yer_etiketi ?? "",
          sira: String(json.data!.sira),
        },
      }));
      showToast("✓ Kaydedildi", GREEN);
    }
  }

  async function yeniEkle() {
    const slug = yeni.slug.trim();
    const ad = yeni.ad.trim();
    const db_value = yeni.db_value.trim().toUpperCase().replace(/\s+/g, " ");
    if (!slug || !ad || !db_value) {
      showToast("slug, ad ve db_value zorunlu", RED);
      return;
    }
    const siraNum = Number(yeni.sira);
    const sira = Number.isFinite(siraNum) ? Math.floor(siraNum) : 0;

    setYeniKayit(true);
    const res = await adminApiFetch("/api/admin/tesis-tipleri", {
      method: "POST",
      body: JSON.stringify({
        slug,
        ad,
        db_value,
        yer_etiketi: yeni.yer_etiketi.trim() === "" ? null : yeni.yer_etiketi.trim(),
        sira,
        aktif: true,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { data?: TesisTipi; error?: string };
    setYeniKayit(false);
    if (!res.ok) {
      showToast(json.error ?? "Eklenemedi", RED);
      return;
    }
    showToast("✓ Yeni tip eklendi", GREEN);
    setYeni({ slug: "", ad: "", db_value: "", yer_etiketi: "", sira: "0" });
    await yukle();
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>🏷️ Kategori Yönetimi</h2>
          <p style={{ fontSize: 12, color: GRAY400 }}>Tesis tipleri (tesis_tipleri) — slug ve db_value salt okunur</p>
        </div>
        <button
          type="button"
          onClick={() => yukle()}
          style={{
            padding: "8px 14px",
            border: `1.5px solid ${GRAY200}`,
            borderRadius: 9,
            fontSize: 12,
            fontWeight: 700,
            background: "white",
            cursor: "pointer",
          }}
        >
          Yenile
        </button>
      </div>

      <div
        style={{
          background: "white",
          border: `1px solid ${GRAY200}`,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, marginBottom: 12 }}>Yeni tip ekle</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 4 }}>slug</label>
            <input
              type="text"
              value={yeni.slug}
              onChange={(e) => setYeni((p) => ({ ...p, slug: e.target.value }))}
              placeholder="ornek-tip"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 4 }}>ad</label>
            <input
              type="text"
              value={yeni.ad}
              onChange={(e) => setYeni((p) => ({ ...p, ad: e.target.value }))}
              placeholder="Görünen ad"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 4 }}>db_value</label>
            <input
              type="text"
              value={yeni.db_value}
              onChange={(e) =>
                setYeni((p) => ({
                  ...p,
                  db_value: e.target.value.toUpperCase(),
                }))
              }
              placeholder="BEACH CLUB"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 4 }}>yer_etiketi</label>
            <input
              type="text"
              value={yeni.yer_etiketi}
              onChange={(e) => setYeni((p) => ({ ...p, yer_etiketi: e.target.value }))}
              placeholder="Şezlong (boş=Yer)"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 4 }}>sira</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                value={yeni.sira}
                onChange={(e) => setYeni((p) => ({ ...p, sira: e.target.value }))}
                style={{ ...inputStyle, width: 70 }}
              />
              <button
                type="button"
                disabled={yeniKayit}
                onClick={() => yeniEkle()}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "white",
                  background: TEAL,
                  cursor: yeniKayit ? "not-allowed" : "pointer",
                  opacity: yeniKayit ? 0.7 : 1,
                }}
              >
                {yeniKayit ? "…" : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "white", border: `1px solid ${GRAY200}`, borderRadius: 12, overflow: "hidden" }}>
        {yukleniyor ? (
          <div style={{ padding: 24, textAlign: "center", color: GRAY400, fontSize: 13 }}>Yükleniyor…</div>
        ) : liste.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: GRAY400, fontSize: 13 }}>Kayıt yok</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: GRAY50, borderBottom: `1px solid ${GRAY200}` }}>
                {["slug", "ad", "db_value", "birim", "sira", "aktif", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      fontWeight: 700,
                      color: GRAY600,
                      fontSize: 11,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liste.map((row) => {
                const d = draftlar[row.id];
                if (!d) return null;
                const busy = kaydedenId === row.id;
                return (
                  <tr key={row.id} style={{ borderBottom: `1px solid ${GRAY100}` }}>
                    <td style={{ padding: "10px 12px" }}>
                      <input type="text" value={row.slug} readOnly style={readOnlyStyle} title="Salt okunur" />
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <input
                        type="text"
                        value={d.ad}
                        onChange={(e) =>
                          setDraftlar((prev) => ({
                            ...prev,
                            [row.id]: { ...prev[row.id], ad: e.target.value },
                          }))
                        }
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <input type="text" value={row.db_value} readOnly style={readOnlyStyle} title="Salt okunur" />
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <input
                        type="text"
                        value={d.yer_etiketi}
                        onChange={(e) =>
                          setDraftlar((prev) => ({
                            ...prev,
                            [row.id]: { ...prev[row.id], yer_etiketi: e.target.value },
                          }))
                        }
                        placeholder="—"
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ padding: "10px 12px", width: 80 }}>
                      <input
                        type="number"
                        value={d.sira}
                        onChange={(e) =>
                          setDraftlar((prev) => ({
                            ...prev,
                            [row.id]: { ...prev[row.id], sira: e.target.value },
                          }))
                        }
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => toggleAktif(row)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 20,
                          border: "none",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: busy ? "wait" : "pointer",
                          background: row.aktif ? "#DCFCE7" : GRAY100,
                          color: row.aktif ? "#166534" : GRAY600,
                        }}
                      >
                        {row.aktif ? "Aktif" : "Pasif"}
                      </button>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => satirKaydet(row.id)}
                        style={{
                          padding: "6px 12px",
                          border: "none",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          color: "white",
                          background: NAVY,
                          cursor: busy ? "wait" : "pointer",
                          opacity: busy ? 0.7 : 1,
                        }}
                      >
                        Kaydet
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
