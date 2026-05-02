export const SITE_LANG_STORAGE_KEY = "myloungers_site_lang";

export type SiteLang = "tr" | "en";

export function readSiteLangFromStorage(): SiteLang {
  if (typeof window === "undefined") return "tr";
  try {
    const v = localStorage.getItem(SITE_LANG_STORAGE_KEY);
    return v === "en" ? "en" : "tr";
  } catch {
    return "tr";
  }
}

/** Kalıcı dil + aynı sekmedeki diğer sayfaların dinlemesi için olay */
export function persistSiteLang(lang: SiteLang): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SITE_LANG_STORAGE_KEY, lang);
    window.dispatchEvent(new Event("myloungers_langchange"));
  } catch {
    /* ignore */
  }
}
