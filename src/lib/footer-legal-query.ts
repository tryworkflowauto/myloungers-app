/** Suffix for legal document URLs when site / app language is English (?lang=en per SSR pages). */
export function footerLegalQueryFromLang(lang: "tr" | "en"): "" | "?lang=en" {
  return lang === "en" ? "?lang=en" : "";
}
