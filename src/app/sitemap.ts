import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";

const BASE_URL = "https://myloungers.com";

export const revalidate = 3600;

function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

function absUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

function entry(
  path: string,
  priority: number,
  changeFrequency: ChangeFrequency,
  lastModified?: Date,
): MetadataRoute.Sitemap[number] {
  const item: MetadataRoute.Sitemap[number] = {
    url: absUrl(path),
    changeFrequency,
    priority,
  };
  if (lastModified) item.lastModified = lastModified;
  return item;
}

function parseTimestamp(value: unknown): Date | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function usableSlug(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const slug = value.trim();
  if (!slug) return null;
  if (slug.includes("/") || slug.includes("?") || slug.includes("#")) return null;
  return slug;
}

const STATIC_PAGES: MetadataRoute.Sitemap = [
  entry("/", 1, "daily"),
  entry("/nasil-calisir", 0.7, "monthly"),
  entry("/hakkimizda", 0.6, "monthly"),
  entry("/iletisim", 0.6, "monthly"),
  entry("/sss", 0.6, "monthly"),
  entry("/basvuru", 0.5, "monthly"),
  entry("/kullanim-kosullari", 0.3, "yearly"),
  entry("/kvkk", 0.3, "yearly"),
  entry("/gizlilik", 0.3, "yearly"),
  entry("/cerez-politikasi", 0.3, "yearly"),
  entry("/iptal-iade", 0.3, "yearly"),
];

const KESFET_PAGES: MetadataRoute.Sitemap = [
  entry("/kesfet", 0.9, "weekly"),
  entry("/kesfet/bodrum-tekne-turlari", 0.85, "weekly"),
  entry("/kesfet/bodrum-tekne-turu-fiyatlari", 0.85, "weekly"),
  entry("/kesfet/bodrum-spa-masaj", 0.85, "weekly"),
  entry("/kesfet/firsatlar", 0.8, "weekly"),
  entry("/kesfet/rehberler", 0.8, "weekly"),
];

async function fetchTesisUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("tesisler")
      .select("slug")
      .eq("aktif", true);

    if (error) {
      console.error("[sitemap] tesisler select error", error);
      return [];
    }

    const urls: MetadataRoute.Sitemap = [];
    for (const row of data ?? []) {
      const slug = usableSlug((row as { slug?: unknown }).slug);
      if (!slug) continue;
      urls.push(entry(`/tesis/${encodeURIComponent(slug)}`, 0.8, "weekly"));
    }
    return urls;
  } catch (err) {
    console.error("[sitemap] tesisler query failed", err);
    return [];
  }
}

async function fetchRehberUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("rehberler")
      .select("slug, created_at")
      .eq("yayinda", true);

    if (error) {
      console.error("[sitemap] rehberler select error", error);
      return [];
    }

    const urls: MetadataRoute.Sitemap = [];
    for (const row of data ?? []) {
      const r = row as { slug?: unknown; created_at?: unknown };
      const slug = usableSlug(r.slug);
      if (!slug) continue;
      urls.push(
        entry(`/kesfet/rehberler/${encodeURIComponent(slug)}`, 0.7, "monthly", parseTimestamp(r.created_at)),
      );
    }
    return urls;
  } catch (err) {
    console.error("[sitemap] rehberler query failed", err);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tesisUrls, rehberUrls] = await Promise.all([fetchTesisUrls(), fetchRehberUrls()]);
  return [...STATIC_PAGES, ...KESFET_PAGES, ...tesisUrls, ...rehberUrls];
}
