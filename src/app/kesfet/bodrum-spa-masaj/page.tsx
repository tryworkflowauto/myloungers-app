import { KesfetBreadcrumb } from "../_components/KesfetShell";
import { SkuGrid } from "../_components/SkuCard";
import { fetchKesfetSkus } from "../_lib/data";

export default async function BodrumSpaMasajPage() {
  const skus = await fetchKesfetSkus("spa");

  return (
    <>
      <KesfetBreadcrumb
        items={[
          { href: "/", label: "Ana Sayfa" },
          { href: "/kesfet", label: "Keşfet" },
          { label: "Spa & Masaj" },
        ]}
      />
      <h1 className="kesfet-h1">Bodrum&apos;da Spa &amp; Masaj Hizmetlerini Keşfet</h1>
      <p className="kesfet-lead">
        Bodrum&apos;daki spa tesislerinin rezervasyona açık hizmetlerini, tesis adı ve güncel fiyatla
        incele.
      </p>
      <SkuGrid
        skus={skus}
        emptyText="Şu an listelenecek aktif bir spa hizmeti bulunmuyor."
      />
    </>
  );
}
