"use client";

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
}: SearchBarProps) {
  return (
    <>
      <div className="arama-srch-card">
        <div className="arama-sf" style={{ flex: 2, minWidth: 180 }}>
          <label className="arama-sfl">Konum</label>
          <div className="arama-sf-loc">
            <input
              type="text"
              value={locInput}
              onChange={e => onLocInputChange(e.target.value)}
              placeholder="Bodrum, Antalya, Marmaris..."
              disabled={gpsOn}
              className="arama-sf-input"
            />
            <button type="button" className={`arama-gps-btn${gpsOn ? " on" : ""}`} onClick={onToggleGPS}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
              {gpsOn ? "✓ GPS" : "GPS"}
            </button>
          </div>
        </div>
        <div className="arama-sf" style={{ minWidth: 130 }}>
          <label className="arama-sfl">Tesis Tipi</label>
          <select value={typeVal} onChange={e => onTypeValChange(e.target.value)} className="arama-sf-select">
            <option value="">Tümü</option>
            <option value="beach">Beach Club</option>
            <option value="hotel">Hotel</option>
            <option value="aqua">Aqua Park</option>
            <option value="tatil">Tatil Köyü</option>
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
        <button type="button" className="arama-sbtn">
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
