"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface SearchBarProps {
  locInput: string;
  onLocInputChange: (v: string) => void;
  gpsOn: boolean;
  onToggleGPS: () => void;
  typeVal: string;
  onTypeValChange: (v: string) => void;
  dateVal: string;
  onDateValChange: (v: string) => void;
  kisiVal: string;
  onKisiValChange: (v: string) => void;
  km: number;
  onKmChange: (v: number) => void;
  onSearch: () => void;
}

/** Aktif tesis satırlarından unique il → ilçe haritası (boş/null hariç). */
function buildIllerFromTesisRows(rows: { sehir?: unknown; ilce?: unknown }[]): Record<string, string[]> {
  const bySehir = new Map<string, Set<string>>();
  for (const row of rows) {
    const sehir = typeof row.sehir === "string" ? row.sehir.trim() : "";
    if (!sehir) continue;
    let ilceSet = bySehir.get(sehir);
    if (!ilceSet) {
      ilceSet = new Set();
      bySehir.set(sehir, ilceSet);
    }
    const ilce = typeof row.ilce === "string" ? row.ilce.trim() : "";
    if (ilce) ilceSet.add(ilce);
  }
  const result: Record<string, string[]> = {};
  const sehirler = Array.from(bySehir.keys()).sort((a, b) => a.localeCompare(b, "tr"));
  for (const sehir of sehirler) {
    result[sehir] = Array.from(bySehir.get(sehir)!).sort((a, b) => a.localeCompare(b, "tr"));
  }
  return result;
}

function parseLocInput(raw: string): { province: string; ilce: string } {
  const t = raw.trim();
  if (!t) return { province: "", ilce: "" };
  const sep = " / ";
  const idx = t.indexOf(sep);
  if (idx === -1) return { province: t, ilce: "" };
  return {
    province: t.slice(0, idx).trim(),
    ilce: t.slice(idx + sep.length).trim(),
  };
}

export default function SearchBar({
  locInput,
  onLocInputChange,
  gpsOn,
  onToggleGPS,
  typeVal,
  onTypeValChange,
  dateVal,
  onDateValChange,
  kisiVal,
  onKisiValChange,
  km,
  onKmChange,
  onSearch,
}: SearchBarProps) {
  const [iller, setIller] = useState<Record<string, string[]>>({});
  const [selectedProvince, setSelectedProvince] = useState("");
  const [activeIlce, setActiveIlce] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const regionWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchIller() {
      const { data, error } = await supabase
        .from("tesisler")
        .select("sehir, ilce")
        .eq("aktif", true);
      if (error) {
        console.error("Arama bölge (sehir/ilce) sorgu hatası:", error);
        return;
      }
      setIller(buildIllerFromTesisRows(data ?? []));
    }
    void fetchIller();
  }, []);

  useEffect(() => {
    if (!panelOpen) return;
    function onDocMouseDown(e: MouseEvent) {
      const el = regionWrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setPanelOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [panelOpen]);

  function openRegionPanel() {
    if (gpsOn) return;
    const parsed = parseLocInput(locInput);
    setSelectedProvince(parsed.province);
    setActiveIlce(parsed.ilce);
    setPanelOpen(true);
  }

  const ilceler = selectedProvince && iller[selectedProvince] ? iller[selectedProvince] : [];
  const filteredIller = useMemo(() => Object.keys(iller), [iller]);

  const previewVal = activeIlce
    ? `${selectedProvince} / ${activeIlce}`
    : selectedProvince || "";

  const closePanel = useCallback(() => setPanelOpen(false), []);

  function handleTemizle() {
    setSelectedProvince("");
    setActiveIlce("");
    onLocInputChange("");
    closePanel();
  }

  function handleTamam() {
    if (!selectedProvince) {
      onLocInputChange("");
    } else if (activeIlce) {
      onLocInputChange(`${selectedProvince} / ${activeIlce}`);
    } else {
      onLocInputChange(selectedProvince);
    }
    closePanel();
  }

  return (
    <>
      <div className="arama-srch-card">
        <div className="arama-sf arama-region-sf" style={{ flex: 2, minWidth: 180 }} ref={regionWrapRef}>
          <label className="arama-sfl">Konum</label>
          <div className="arama-sf-loc">
            <button
              type="button"
              className={`arama-region-trigger${locInput ? " filled" : ""}${panelOpen ? " open" : ""}`}
              disabled={gpsOn}
              onClick={() => {
                if (gpsOn) return;
                if (panelOpen) setPanelOpen(false);
                else openRegionPanel();
              }}
            >
              {locInput || "İl / ilçe seçin"}
            </button>
            <button
              type="button"
              className={`arama-gps-btn${gpsOn ? " on" : ""}`}
              onClick={() => {
                setPanelOpen(false);
                onToggleGPS();
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
              {gpsOn ? "✓ GPS" : "GPS"}
            </button>
          </div>
          {panelOpen && !gpsOn && (
            <div className="arama-region-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="arama-region-cols">
                <div className="arama-region-iller">
                  {filteredIller.map((il) => (
                    <div
                      key={il}
                      className={`arama-region-item${selectedProvince === il ? " active" : ""}`}
                      onClick={() => {
                        setSelectedProvince(il);
                        setActiveIlce("");
                      }}
                    >
                      {il}<span className="arama-region-arr">›</span>
                    </div>
                  ))}
                </div>
                <div className="arama-region-ilceler">
                  {selectedProvince ? (
                    <>
                      <div className="arama-region-ilce-ttl">{selectedProvince}</div>
                      <div
                        className={`arama-region-ilce-item${!activeIlce ? " sel" : ""}`}
                        onClick={() => setActiveIlce("")}
                      >
                        Tümü
                      </div>
                      {ilceler.map((ilce) => (
                        <div
                          key={ilce}
                          className={`arama-region-ilce-item${activeIlce === ilce ? " sel" : ""}`}
                          onClick={() => setActiveIlce(ilce)}
                        >
                          {ilce}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="arama-region-empty">İl seçin</div>
                  )}
                </div>
              </div>
              <div className="arama-region-footer">
                <span className="arama-region-preview">{previewVal}</span>
                <button type="button" className="arama-region-btn" onClick={handleTemizle}>Temizle</button>
                <button type="button" className="arama-region-btn primary" onClick={handleTamam}>Tamam</button>
              </div>
            </div>
          )}
        </div>
        <div className="arama-sf" style={{ minWidth: 130 }}>
          <label className="arama-sfl">Tesis Tipi</label>
          <select value={typeVal} onChange={e => onTypeValChange(e.target.value)} className="arama-sf-select">
            <option value="">Tümü</option>
            <option value="beach">Beach Club</option>
            <option value="hotel">Hotel</option>
            <option value="aqua">Aqua Park</option>
            <option value="restoran">Restoran</option>
            <option value="bar">Bar & Lounge</option>
            <option value="tekne">Tekne Turu</option>
            <option value="spa">Spa</option>
          </select>
        </div>
        <div className="arama-sf" style={{ minWidth: 130 }}>
          <label className="arama-sfl">Tarih</label>
          <input type="date" value={dateVal} onChange={e => onDateValChange(e.target.value)} className="arama-sf-input" />
        </div>
        <div className="arama-sf" style={{ minWidth: 100, maxWidth: 120 }}>
          <label className="arama-sfl">Kişi</label>
          <select value={kisiVal} onChange={e => onKisiValChange(e.target.value)} className="arama-sf-select">
            {["1 Kişi","2 Kişi","3 Kişi","4 Kişi","5+ Kişi"].map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        <button type="button" className="arama-sbtn" onClick={onSearch}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Ara
        </button>
      </div>
      {gpsOn && (
        <div className="arama-km-row">
          <span className="arama-km-lbl">📍 Çevremdeki tesisler — yarıçap:</span>
          <input type="range" className="arama-km-slider" min={1} max={50} value={km} onChange={e => onKmChange(+e.target.value)} />
          <span className="arama-km-val">{km} km</span>
        </div>
      )}
    </>
  );
}
