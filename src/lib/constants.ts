export const SIPARIS_DURUM = {
  YENI: "yeni",
  HAZIRLANIYOR: "hazirlaniyor",
  HAZIR: "hazir",
  YOLDA: "yolda",
  TESLIM_EDILDI: "teslim_edildi",
} as const;

export type SiparisDurumType = (typeof SIPARIS_DURUM)[keyof typeof SIPARIS_DURUM];

export const APP_STORE_URL =
  "https://apps.apple.com/tr/app/myloungers/id6766219427?l=tr";

export const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.myloungers.app";
