'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function sendPageView(pathname: string) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false;
  }
  window.gtag('event', 'page_view', {
    page_path: pathname,
    page_location: window.location.href,
  });
  return true;
}

function GaPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (sendPageView(pathname)) return;

    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const retry = () => {
      if (cancelled) return;
      if (sendPageView(pathname)) return;
      if (attempts >= 40) return;
      attempts += 1;
      timer = setTimeout(retry, 50);
    };

    timer = setTimeout(retry, 50);

    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}

export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
      <GaPageView />
    </>
  );
}
