import Link from "next/link";
import {
  formatKesfetFiyat,
  skuLoc,
  tesisDetailHref,
  type KesfetSku,
} from "../_lib/data";

export function SkuCard({ sku }: { sku: KesfetSku }) {
  const loc = skuLoc(sku);
  return (
    <Link href={tesisDetailHref(sku.tesisSlug)} className="kesfet-sku">
      <div className="kesfet-sku-img">
        {sku.gorsel ? (
          <img src={sku.gorsel} alt="" />
        ) : (
          <div className="kesfet-sku-ph" aria-hidden>
            ·
          </div>
        )}
      </div>
      <div className="kesfet-sku-body">
        <div className="kesfet-sku-tesis">{sku.tesisAd}</div>
        <div className="kesfet-sku-ad">{sku.skuAd}</div>
        {loc ? <div className="kesfet-sku-loc">{loc}</div> : null}
        <div className="kesfet-sku-price">{formatKesfetFiyat(sku)}</div>
      </div>
    </Link>
  );
}

export function SkuGrid({ skus, emptyText }: { skus: KesfetSku[]; emptyText: string }) {
  if (skus.length === 0) {
    return <div className="kesfet-empty">{emptyText}</div>;
  }
  return (
    <div className="kesfet-sku-grid">
      {skus.map((sku) => (
        <SkuCard key={sku.id} sku={sku} />
      ))}
    </div>
  );
}
