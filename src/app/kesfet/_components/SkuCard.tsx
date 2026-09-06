import { tesisMatchesKategoriToken } from "@/lib/tesisKategori";
import {
  formatKesfetFiyat,
  skuLoc,
  type KesfetSku,
} from "../_lib/data";
import { KesfetTesisSelectLink } from "./KesfetTesisSelectLink";

const ICON_PROPS = {
  width: 48,
  height: 48,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#0ABAB5",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function TeknePlaceholderIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="5" r="2.15" />
      <path d="M12 7.2v10.3" />
      <path d="M7.5 11.2h9" />
      <path d="M5 16.2c1.7 2.8 4.1 4.2 7 4.2s5.3-1.4 7-4.2" />
      <path d="M5 16.2H4.2M19 16.2h.8" />
    </svg>
  );
}

function SpaPlaceholderIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 20s-7-4.2-7-10.1C5 7 7.5 5 10.1 4.6c0 2.5 1.2 5 1.9 6.4.7-1.4 1.9-3.9 1.9-6.4C16.5 5 19 7 19 9.9c0 5.9-7 10.1-7 10.1z" />
      <path d="M8.4 13.6c1.3.9 2.5 1.4 3.6 1.4s2.3-.5 3.6-1.4" />
    </svg>
  );
}

function isTekneSku(sku: KesfetSku): boolean {
  return (
    tesisMatchesKategoriToken(sku.kategoriRaw, "TEKNE TURU") ||
    tesisMatchesKategoriToken(sku.kategoriRaw, "TEKNE")
  );
}

export function SkuCard({
  sku,
  itemListId,
  itemListName,
}: {
  sku: KesfetSku;
  itemListId: string;
  itemListName: string;
}) {
  const loc = skuLoc(sku);
  return (
    <KesfetTesisSelectLink
      slug={sku.tesisSlug}
      name={sku.tesisAd}
      itemListId={itemListId}
      itemListName={itemListName}
      className="kesfet-sku"
    >
      <div className="kesfet-sku-img">
        {sku.gorsel ? (
          <img src={sku.gorsel} alt="" />
        ) : (
          <div className="kesfet-sku-ph" aria-hidden>
            {isTekneSku(sku) ? <TeknePlaceholderIcon /> : <SpaPlaceholderIcon />}
          </div>
        )}
      </div>
      <div className="kesfet-sku-body">
        <div className="kesfet-sku-tesis">{sku.tesisAd}</div>
        <div className="kesfet-sku-ad">{sku.skuAd}</div>
        {loc ? <div className="kesfet-sku-loc">{loc}</div> : null}
        <div className="kesfet-sku-price">{formatKesfetFiyat(sku)}</div>
      </div>
    </KesfetTesisSelectLink>
  );
}

export function SkuGrid({
  skus,
  emptyText,
  itemListId,
  itemListName,
}: {
  skus: KesfetSku[];
  emptyText: string;
  itemListId: string;
  itemListName: string;
}) {
  if (skus.length === 0) {
    return <div className="kesfet-empty">{emptyText}</div>;
  }
  return (
    <div className="kesfet-sku-grid">
      {skus.map((sku) => (
        <SkuCard key={sku.id} sku={sku} itemListId={itemListId} itemListName={itemListName} />
      ))}
    </div>
  );
}
