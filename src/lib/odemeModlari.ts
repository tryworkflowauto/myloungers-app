// ============================================================
// MERKEZİ ÖDEME MODU + KOMİSYON TİPİ TANIMLARI
// Tüm sistem buradan okur. Yeni tip = buraya tek blok ekle.
// ============================================================

export type OdemeModuId = "harcama_limitli" | "hizmet_bedeli" | "kapora" | "on_siparis" | "hizmet_secimli";
export type KomisyonTipiId = "yuzde" | "islem_bedeli" | "yok";

export interface OdemeModu {
  id: OdemeModuId;
  label: string;        // İşletmeci panelinde görünen ad
  aciklama: string;     // Kısa açıklama (panelde alt satır)
  kaporaGerekir: boolean;   // true ise kapora_tutari input'u açılır
  siparisAcik: boolean;     // true ise içeride uygulamadan Sipariş Ver aktif
  // Callback'te bakiyenin nasıl set edileceğini tanımlayan davranış anahtarı.
  // "bakiye"  = yuklenen=kalan=toplam, harcanan=0  (içeride harcanır)
  // "kapali"  = yuklenen=harcanan=toplam, kalan=0  (harcama yok, hepsi ödendi)
  // "kapora"  = yuklenen=kalan=kapora, harcanan=0  (avans, tesiste düşülür)
  bakiyeDavranisi: "bakiye" | "kapali" | "kapora";
}

export interface KomisyonTipi {
  id: KomisyonTipiId;
  label: string;
  aciklama: string;
  alanGerekir: "oran" | "tutar" | "yok";  // panelde hangi input açılır
}

export const ODEME_MODLARI: OdemeModu[] = [
  {
    id: "harcama_limitli",
    label: "Harcama Limitli (Ön Ödemeli)",
    aciklama: "Müşteri bakiye yükler, içeride uygulamadan harcar. Bitince ek yükleme yapar.",
    kaporaGerekir: false,
    siparisAcik: true,
    bakiyeDavranisi: "bakiye",
  },
  {
    id: "hizmet_bedeli",
    label: "Hizmet Bedeli",
    aciklama: "Müşteri net giriş bedelini başta öder. İçeride harcama yok, ekstralar tesiste ayrı ödenir.",
    kaporaGerekir: false,
    siparisAcik: false,
    bakiyeDavranisi: "kapali",
  },
  {
    id: "kapora",
    label: "Kapora",
    aciklama: "Müşteri belirlenen kaporayı (avans) öder, yer ayrılır. Hesap tesiste çıkar, kapora düşülür, kalan tesiste ödenir.",
    kaporaGerekir: true,
    siparisAcik: false,
    bakiyeDavranisi: "kapora",
  },
  {
    id: "on_siparis",
    label: "Ön Sipariş / Park",
    aciklama: "Müşteri başta menüden seçip giriş + sipariş toplamını komple öder. Rezerve saatinde hazır, gelip teslim alır.",
    kaporaGerekir: false,
    siparisAcik: false,
    bakiyeDavranisi: "kapali",
  },
  {
    id: "hizmet_secimli",
    label: "Hizmet Seçimli",
    aciklama: "Müşteri önce hizmet seçer, tarih ve saat ile rezervasyon yapar. Hizmet bedeli başta ödenir, içeride harcama yoktur.",
    kaporaGerekir: false,
    siparisAcik: false,
    bakiyeDavranisi: "kapali",
  },
];

export const KOMISYON_TIPLERI: KomisyonTipi[] = [
  {
    id: "yuzde",
    label: "Yüzde Komisyon",
    aciklama: "Her işlemden belirlenen yüzde alınır (örn. %7).",
    alanGerekir: "oran",
  },
  {
    id: "islem_bedeli",
    label: "Sabit İşlem Bedeli",
    aciklama: "Her işlemden sabit bir tutar alınır (örn. 200 TL).",
    alanGerekir: "tutar",
  },
  {
    id: "yok",
    label: "Komisyon Yok",
    aciklama: "Sistemden tahsilat yok (ör. lead modeli, tesisle dışarıda anlaşılır).",
    alanGerekir: "yok",
  },
];

// Yardımcı fonksiyonlar — kod hiçbir yerde tipi hardcode kontrol etmesin, bunları kullansın
export const DEFAULT_ODEME_MODU: OdemeModuId = "harcama_limitli";
export const DEFAULT_KOMISYON_TIPI: KomisyonTipiId = "yuzde";

export function getOdemeModu(id: string | null | undefined): OdemeModu {
  return ODEME_MODLARI.find((m) => m.id === id) ?? ODEME_MODLARI[0];
}

export function getKomisyonTipi(id: string | null | undefined): KomisyonTipi {
  return KOMISYON_TIPLERI.find((k) => k.id === id) ?? KOMISYON_TIPLERI[0];
}
