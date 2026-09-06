import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KesfetBreadcrumb } from "../../_components/KesfetShell";
import { fetchRehberBySlug, rehberCtaLabel, type KesfetRehber } from "../../_lib/data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const SITE = "https://myloungers.com";

function rehberCanonical(slug: string): string {
  return `${SITE}/kesfet/rehberler/${encodeURIComponent(slug)}`;
}

function jsonLdScript(data: Record<string, unknown>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

function isAllowedInternalHref(href: string): boolean {
  const raw = href.trim();
  if (!raw) return false;
  const lower = raw.toLowerCase();
  if (lower.startsWith("http://") || lower.startsWith("https://")) return false;
  if (raw.startsWith("//")) return false;
  if (lower.startsWith("javascript:") || lower.startsWith("mailto:")) return false;
  if (raw.includes("://") || raw.includes("\\")) return false;
  if (/[\s<>'"]/.test(raw)) return false;
  return raw.startsWith("/tesis/") || raw.startsWith("/kesfet/");
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] != null) {
      nodes.push(<strong key={`b${k++}`}>{m[1]}</strong>);
    } else {
      const label = m[2] ?? "";
      const href = m[3] ?? "";
      if (isAllowedInternalHref(href)) {
        nodes.push(
          <Link key={`l${k++}`} href={href}>
            {label}
          </Link>,
        );
      } else {
        nodes.push(label);
      }
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function parseTableCells(line: string): string[] {
  const t = line.trim();
  const inner = t.startsWith("|") ? t.slice(1) : t;
  const withoutEnd = inner.endsWith("|") ? inner.slice(0, -1) : inner;
  return withoutEnd.split("|").map((c) => c.trim());
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every((c) => /^:?-{1,}:?$/.test(c.replace(/\s/g, "")));
}

function tryParseTable(block: string): { header: string[]; body: string[][] } | null {
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;
  if (!lines.every((l) => l.startsWith("|"))) return null;
  const rows = lines.map(parseTableCells);
  if (!isSeparatorRow(rows[1])) return null;
  const header = rows[0];
  const body = rows.slice(2).filter((r) => !isSeparatorRow(r));
  return { header, body };
}

function renderIcerik(icerik: string) {
  const blocks = icerik
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length === 0) return null;
  return blocks.map((block, i) => {
    const table = tryParseTable(block);
    if (table) {
      return (
        <div key={i} className="kesfet-table-wrap overflow-x-auto">
          <table className="kesfet-table">
            <thead>
              <tr>
                {table.header.map((cell, ci) => (
                  <th key={ci}>{renderInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.body.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    const h3 = block.match(/^###\s+(.+)$/);
    if (h3) {
      return (
        <h3 key={i} className="kesfet-h2" style={{ marginTop: 8, fontSize: "1.05rem" }}>
          {renderInline(h3[1])}
        </h3>
      );
    }
    const heading = block.match(/^#{1,2}\s+(.+)$/);
    if (heading) {
      return (
        <h2 key={i} className="kesfet-h2" style={{ marginTop: 8 }}>
          {renderInline(heading[1])}
        </h2>
      );
    }
    return <p key={i}>{renderInline(block)}</p>;
  });
}

function blogPostingJsonLd(rehber: KesfetRehber, canonical: string) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: rehber.baslik,
    url: canonical,
    mainEntityOfPage: canonical,
    publisher: {
      "@type": "Organization",
      name: "MyLoungers",
      url: SITE,
    },
  };
  if (rehber.ozet) data.description = rehber.ozet;
  if (rehber.createdAt) data.datePublished = rehber.createdAt;
  return data;
}

function breadcrumbJsonLd(rehber: KesfetRehber, canonical: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: SITE },
      { "@type": "ListItem", position: 2, name: "Keşfet", item: `${SITE}/kesfet` },
      { "@type": "ListItem", position: 3, name: "Rehberler", item: `${SITE}/kesfet/rehberler` },
      { "@type": "ListItem", position: 4, name: rehber.baslik, item: canonical },
    ],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const rehber = await fetchRehberBySlug(slug);
  if (!rehber) return { title: "MyLoungers" };

  const title = `${rehber.baslik} | MyLoungers`;
  const description = rehber.ozet || undefined;
  const canonical = rehberCanonical(rehber.slug);

  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      url: canonical,
    },
  };
}

export default async function RehberDetayPage({ params }: PageProps) {
  const { slug } = await params;
  const rehber = await fetchRehberBySlug(slug);
  if (!rehber) notFound();

  const canonical = rehberCanonical(rehber.slug);
  const ctaHref = rehber.ilgiliKesfetUrl || "/kesfet";
  const ctaLabel = rehberCtaLabel(rehber);

  return (
    <>
      {jsonLdScript(blogPostingJsonLd(rehber, canonical))}
      {jsonLdScript(breadcrumbJsonLd(rehber, canonical))}
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
