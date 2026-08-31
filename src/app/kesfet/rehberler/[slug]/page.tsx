import Link from "next/link";
import { notFound } from "next/navigation";
import { KesfetBreadcrumb } from "../../_components/KesfetShell";
import { fetchRehberBySlug, rehberCtaLabel } from "../../_lib/data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function renderIcerik(icerik: string) {
  const blocks = icerik
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length === 0) return null;
  return blocks.map((block, i) => {
    const heading = block.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      return (
        <h2 key={i} className="kesfet-h2" style={{ marginTop: 8 }}>
          {heading[1]}
        </h2>
      );
    }
    return <p key={i}>{block}</p>;
  });
}

export default async function RehberDetayPage({ params }: PageProps) {
  const { slug } = await params;
  const rehber = await fetchRehberBySlug(slug);
  if (!rehber) notFound();

  const ctaHref = rehber.ilgiliKesfetUrl || "/kesfet";
  const ctaLabel = rehberCtaLabel(rehber);

  return (
    <>
      <KesfetBreadcrumb
        items={[
          { href: "/", label: "Ana Sayfa" },
          { href: "/kesfet", label: "Keşfet" },
          { href: "/kesfet/rehberler", label: "Rehberler" },
          { label: rehber.baslik },
        ]}
      />
      <article className="kesfet-article">
        <span className="kesfet-kategori-tag">
          {rehber.kategori === "SPA" ? "Spa & Wellness" : "Tekne"}
        </span>
        <h1 className="kesfet-h1">{rehber.baslik}</h1>
        {rehber.ozet ? <p className="kesfet-lead">{rehber.ozet}</p> : null}
        {renderIcerik(rehber.icerik)}
        <div style={{ marginTop: 28 }}>
          <Link href={ctaHref} className="kesfet-cta">
            {ctaLabel}
          </Link>
        </div>
      </article>
    </>
  );
}
