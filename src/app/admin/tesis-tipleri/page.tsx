"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const STORAGE_BUCKET = "menu-gorseller";
const KATEGORI_GORSEL_PREFIX = "kategoriler/";
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB — menu/sezlong ile aynı

type TesisTipi = {
  id: string;
  slug: string;
  ad: string;
  db_value: string;
  yer_etiketi: string | null;
  periyot_etiketi: string | null;
  sira: number;
  aktif: boolean;
  gorsel: string | null;
  ikon: string | null;
};

type EditDraft = {
  ad: string;
  yer_etiketi: string;
  periyot_etiketi: string;
  sira: string;
  ikon: string;
  gorsel: string | null;
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

async function uploadKategoriGorsel(file: File, pathKey: string): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;
  if (file.size > MAX_FILE_BYTES) return null;
  const safeKey = pathKey.trim().replace(/[^a-zA-Z0-9_-]/g, "-") || "tip";
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${KATEGORI_GORSEL_PREFIX}${safeKey}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  if (error) {
    console.error("Storage upload error:", error);
    return null;
  }
  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return urlData.publicUrl;
}

function GorselKontrol({
  gorsel,
  onGorsel,
  pathKey,
  onHata,
  busy,
}: {
  gorsel: string | null;
  onGorsel: (url: string | null) => void;
  pathKey: string;
  onHata: (msg: string) => void;
  busy?: boolean;
}) {
  async function handleFile(file: File | null) {
    if (!file || busy) return;
    if (!file.type.startsWith("image/")) {
      onHata("Sadece görsel dosyası yükleyebilirsiniz");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      onHata(`Dosya 2MB'dan büyük olamaz: ${file.name}`);
      return;
    }
    const url = await uploadKategoriGorsel(file, pathKey);
    if (!url) {
      onHata("Görsel yüklenemedi");
      return;
    }
    onGorsel(url);
  }

  return (
    <div>
      {gorsel ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gorsel}
            alt=""
            style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: `2px solid ${GRAY200}` }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => onGorsel(null)}
            style={{
              padding: "2px 6px",
              fontSize: 9,
              fontWeight: 700,
              borderRadius: 6,
              border: "1px solid #FECACA",
              background: "#FEF2F2",
              color: RED,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            Kaldır
          </button>
        </div>
      ) : null}
      <label
        style={{
          fontSize: 10,
          color: TEAL,
          fontWeight: 600,
          cursor: busy ? "not-allowed" : "pointer",
          textDecoration: "underline",
        }}
      >
        {gorsel ? "Değiştir" : "Yükle"}
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            void handleFile(file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

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

const BOS_YENI = {
  slug: "",
  ad: "",
  db_value: "",
  yer_etiketi: "",
  periyot_etiketi: "",
  sira: "0",
  ikon: "",
  gorsel: null as string | null,
};

function YeniTipEklePanel({
  showToast,
  onEklendi,
}: {
  showToast: (msg: string, color?: string) => void;
  onEklendi: () => void | Promise<void>;
}) {
  const [yeni, setYeni] = useState(BOS_YENI);
  const [yeniKayit, setYeniKayit] = useState(false);
  const slugInputRef = useRef<HTMLInputElement>(null);
  const adInputRef = useRef<HTMLInputElement>(null);
  const dbValueInputRef = useRef<HTMLInputElement>(null);
  const yerInputRef = useRef<HTMLInputElement>(null);
  const periyotInputRef = useRef<HTMLInputElement>(null);
  const siraInputRef = useRef<HTMLInputElement>(null);
  const ikonInputRef = useRef<HTMLInputElement>(null);

  async function yeniEkle() {
    const slug = (slugInputRef.current?.value ?? yeni.slug).trim();
    const ad = (adInputRef.current?.value ?? yeni.ad).trim();
    const db_value = (dbValueInputRef.current?.value ?? yeni.db_value).trim().toUpperCase().replace(/\s+/g, " ");
    const yer_etiketi = (yerInputRef.current?.value ?? yeni.yer_etiketi).trim();
    const periyot_etiketi = (periyotInputRef.current?.value ?? yeni.periyot_etiketi).trim();
    const ikon = (ikonInputRef.current?.value ?? yeni.ikon).trim();
    const siraRaw = siraInputRef.current?.value ?? yeni.sira;
    const gorsel = yeni.gorsel;

    console.log("[tesis-tipleri/yeniEkle]", { slug, ad, db_value });

    if (!slug || !ad || !db_value) {
      showToast("slug, ad ve db_value zorunlu", RED);
      return;
    }
    const siraNum = Number(siraRaw);
    const sira = Number.isFinite(siraNum) ? Math.floor(siraNum) : 0;

    setYeniKayit(true);
    const res = await adminApiFetch("/api/admin/tesis-tipleri", {
      method: "POST",
      body: JSON.stringify({
        slug,
        ad,
        db_value,
        yer_etiketi: yer_etiketi === "" ? null : yer_etiketi,
        periyot_etiketi: periyot_etiketi === "" ? null : periyot_etiketi,
        sira,
        aktif: true,
        ikon: ikon === "" ? null : ikon,
        gorsel,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { data?: TesisTipi; error?: string };
    setYeniKayit(false);
    if (!res.ok) {
      showToast(json.error ?? "Eklenemedi", RED);
      return;
    }
    showToast("✓ Yeni tip eklendi", GREEN);
    setYeni({ ...BOS_YENI });
    await onEklendi();
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, alignItems: "end" }}>
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 4 }}>slug</label>
          <input
            ref={slugInputRef}
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
            ref={adInputRef}
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
            ref={dbValueInputRef}
            type="text"
            value={yeni.db_value}
            onChange={(e) => setYeni((p) => ({ ...p, db_value: e.target.value }))}
            placeholder="BEACH CLUB"
            style={{ ...inputStyle, textTransform: "uppercase" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 4 }}>yer_etiketi</label>
          <input
            ref={yerInputRef}
            type="text"
            value={yeni.yer_etiketi}
            onChange={(e) => setYeni((p) => ({ ...p, yer_etiketi: e.target.value }))}
            placeholder="Şezlong (boş=Yer)"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 4 }}>periyot_etiketi</label>
          <input
            ref={periyotInputRef}
            type="text"
            value={yeni.periyot_etiketi}
            onChange={(e) => setYeni((p) => ({ ...p, periyot_etiketi: e.target.value }))}
            placeholder="Günlük / Tur / Seans (boş=rozet yok)"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 4 }}>sira</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              ref={siraInputRef}
              type="number"
              value={yeni.sira}
              onChange={(e) => setYeni((p) => ({ ...p, sira: e.target.value }))}
              style={{ ...inputStyle, width: 70 }}
            />
            <button
              type="button"
              disabled={yeniKayit}
              onClick={() => void yeniEkle()}
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
      <div style={{ display: "flex", gap: 16, marginTop: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 4 }}>ikon</label>
          <input
            ref={ikonInputRef}
            type="text"
            value={yeni.ikon}
            onChange={(e) => setYeni((p) => ({ ...p, ikon: e.target.value }))}
            placeholder="🏖️"
            style={{ ...inputStyle, width: 72 }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: GRAY600, display: "block", marginBottom: 4 }}>görsel</label>
          <GorselKontrol
            gorsel={yeni.gorsel}
            pathKey={yeni.slug.trim() || "yeni"}
            busy={yeniKayit}
            onHata={(msg) => showToast(msg, RED)}
            onGorsel={(url) => setYeni((p) => ({ ...p, gorsel: url }))}
          />
          <p style={{ fontSize: 10, color: GRAY400, margin: "4px 0 0" }}>Maks. 2MB • PNG, JPG</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminTesisTipleriPage() {
  const { showToast } = useAdminToast();
  const [liste, setListe] = useState<TesisTipi[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydedenId, setKaydedenId] = useState<string | null>(null);
  const [draftlar, setDraftlar] = useState<Record<string, EditDraft>>({});

  const siraliListe = [...liste].sort((a, b) => a.sira - b.sira);

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
        periyot_etiketi: r.periyot_etiketi ?? "",
        sira: String(r.sira),
        ikon: r.ikon ?? "",
        gorsel: r.gorsel ?? null,
      };
    }
    setDraftlar(drafts);
    setYukleniyor(false);
  }, [showToast]);

  useEffect(() => {
    void yukle();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount'ta bir kez yükle
  }, []);

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
        periyot_etiketi: d.periyot_etiketi.trim() === "" ? null : d.periyot_etiketi.trim(),
        sira: Math.floor(siraNum),
        ikon: d.ikon.trim() === "" ? null : d.ikon.trim(),
        gorsel: d.gorsel,
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
          periyot_etiketi: json.data!.periyot_etiketi ?? "",
          sira: String(json.data!.sira),
          ikon: json.data!.ikon ?? "",
          gorsel: json.data!.gorsel ?? null,
        },
      }));
      showToast("✓ Kaydedildi", GREEN);
    }
  }

  async function satirTasi(index: number, yon: "up" | "down") {
    const sorted = [...liste].sort((a, b) => a.sira - b.sira);
    const hedef = yon === "up" ? index - 1 : index + 1;
    if (hedef < 0 || hedef >= sorted.length) return;
    const a = sorted[index];
    const b = sorted[hedef];
    const siraA = a.sira;
    const siraB = b.sira;

    setKaydedenId(`swap-${a.id}`);
    const [res1, res2] = await Promise.all([
      adminApiFetch("/api/admin/tesis-tipleri", {
        method: "PATCH",
        body: JSON.stringify({ id: a.id, sira: siraB }),
      }),
      adminApiFetch("/api/admin/tesis-tipleri", {
        method: "PATCH",
        body: JSON.stringify({ id: b.id, sira: siraA }),
      }),
    ]);
    setKaydedenId(null);

    if (!res1.ok || !res2.ok) {
      const j1 = (await res1.json().catch(() => ({}))) as { error?: string };
      const j2 = (await res2.json().catch(() => ({}))) as { error?: string };
      showToast(j1.error ?? j2.error ?? "Sıra güncellenemedi", RED);
      return;
    }
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
        <YeniTipEklePanel showToast={showToast} onEklendi={yukle} />
      </div>

      <div style={{ background: "white", border: `1px solid ${GRAY200}`, borderRadius: 12, overflow: "hidden" }}>
        {yukleniyor ? (
          <div style={{ padding: 24, textAlign: "center", color: GRAY400, fontSize: 13 }}>Yükleniyor…</div>
        ) : liste.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: GRAY400, fontSize: 13 }}>Kayıt yok</div>
        ) : (
          <div style={{ maxHeight: "min(60vh, 520px)", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: GRAY50, borderBottom: `1px solid ${GRAY200}` }}>
                {["", "ikon", "görsel", "slug", "ad", "db_value", "birim", "periyot", "sira", "aktif", ""].map((h) => (
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
              {siraliListe.map((row, index) => {
                const d = draftlar[row.id];
                if (!d) return null;
                const busy = kaydedenId === row.id || kaydedenId === `swap-${row.id}`;
                const swapBusy = kaydedenId?.startsWith("swap-") ?? false;
                return (
                  <tr key={row.id} style={{ borderBottom: `1px solid ${GRAY100}` }}>
                    <td style={{ padding: "10px 8px", width: 36, verticalAlign: "middle" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {index > 0 ? (
                          <button
                            type="button"
                            title="Yukarı"
                            disabled={swapBusy}
                            onClick={() => void satirTasi(index, "up")}
                            style={{
                              padding: "2px 6px",
                              border: `1px solid ${GRAY200}`,
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 700,
                              background: "white",
                              cursor: swapBusy ? "not-allowed" : "pointer",
                              opacity: swapBusy ? 0.5 : 1,
                            }}
                          >
                            ↑
                          </button>
                        ) : null}
                        {index < siraliListe.length - 1 ? (
                          <button
                            type="button"
                            title="Aşağı"
                            disabled={swapBusy}
                            onClick={() => void satirTasi(index, "down")}
                            style={{
                              padding: "2px 6px",
                              border: `1px solid ${GRAY200}`,
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 700,
                              background: "white",
                              cursor: swapBusy ? "not-allowed" : "pointer",
                              opacity: swapBusy ? 0.5 : 1,
                            }}
                          >
                            ↓
                          </button>
                        ) : null}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", width: 56 }}>
                      <input
                        type="text"
                        value={d.ikon}
                        onChange={(e) =>
                          setDraftlar((prev) => ({
                            ...prev,
                            [row.id]: { ...prev[row.id], ikon: e.target.value },
                          }))
                        }
                        placeholder="🏖️"
                        style={{ ...inputStyle, width: 48, textAlign: "center" }}
                      />
                    </td>
                    <td style={{ padding: "10px 12px", minWidth: 100 }}>
                      <GorselKontrol
                        gorsel={d.gorsel}
                        pathKey={row.slug || row.id}
                        busy={busy}
                        onHata={(msg) => showToast(msg, RED)}
                        onGorsel={(url) =>
                          setDraftlar((prev) => ({
                            ...prev,
                            [row.id]: { ...prev[row.id], gorsel: url },
                          }))
                        }
                      />
                    </td>
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
                    <td style={{ padding: "10px 12px" }}>
                      <input
                        type="text"
                        value={d.periyot_etiketi}
                        onChange={(e) =>
                          setDraftlar((prev) => ({
                            ...prev,
                            [row.id]: { ...prev[row.id], periyot_etiketi: e.target.value },
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
          </div>
        )}
      </div>
    </>
  );
}
