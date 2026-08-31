import Link from "next/link";

export default function RehberNotFound() {
  return (
    <div className="kesfet-empty">
      <p>Bu rehber bulunamadı veya henüz yayınlanmamış.</p>
      <p style={{ marginTop: 16 }}>
        <Link href="/kesfet/rehberler" className="kesfet-cta kesfet-cta-navy">
          Rehberlere dön
        </Link>
      </p>
    </div>
  );
}
