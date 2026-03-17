"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import "./myloungers.css";

const TRANSLATIONS: Record<string, Record<string, string>> = {
  tr: {
    nav_hotel: "Hotel", nav_beach: "Beach Club", nav_aqua: "Aqua Park", nav_apply: "Başvuru Formu",
    hero_title: "Bodrum'un En İyi", hero_title2: "Plaj & Otel Deneyimi", hero_subtitle: "Şezlong, plaj kulübü ve otel rezervasyonlarını tek platformda yönetin",
    hero_search_placeholder: "Tesis, bölge veya aktivite ara...", hero_btn: "Ara",
    filter_all: "Tümünü Gör", filter_hotel: "Hotel", filter_beach: "Beach Club", filter_aqua: "Aqua Park",
    cat_title: "Tesis Kategorileri", cat_subtitle: "İhtiyacınıza göre tesis türü seçin",
    popular_title: "En Çok Tercih Edilenler", popular_subtitle: "Misafirlerimizin en beğendiği tesisler",
    card_btn: "Rezervasyon Yap", card_per_day: "/gün", view_all: "Tümünü gör",
    btn_login: "Giriş Yap", btn_signup: "Üye Ol",
    sfl_region: "Bölge", sfl_type: "Tesis Tipi", sfl_date: "Tarih", sfl_name: "Tesis Adı",
    sfv_region: "Bodrum, Antalya, Marmaris...", sfv_type: "Hotel, Beach Club...", sfv_date: "Tarih seçin", sfv_name: "Ara...",
    srch_btn: "Tesis Ara", filter_btn: "Filtrele",
    r_search_placeholder: "İl ara...", r_all: "Tümü", r_clear: "Temizle", r_ok: "Tamam", r_select_il: "İl seçin",
    st_active: "Aktif tesis", st_res: "Rezervasyon", st_dest: "Destinasyon", st_rating: "Ortalama puan", st_qr: "Temassız giriş",
    cat_hotel: "Hotel", cat_beach: "Beach Club", cat_aqua: "Aqua Park",
    cat_hotel_sub: "Konfor ve hizmet", cat_beach_sub: "Şezlong & deniz keyfi", cat_aqua_sub: "Eğlence & kaydırak",
    badge_popular: "Popüler", badge_new: "Yeni", tag_daily: "Günlük",
    how_title: "Nasıl", how_title2: "Çalışır?", how_sub: "3 adımda şezlong rezervasyonu",
    how1: "Tesis Seç", how2: "Şezlong Seç", how3: "Öde & Uzan",
    plan_tag: "Şezlong Planı", plan_title: "Tam istediğin şezlongu harita üzerinden seç",
    b2b_tag: "Tesis Sahipleri İçin", b2b_title: "Tesisinizi MyLoungers'a ekleyin",
    rev_title: "Kullanıcılar Ne Diyor?", rev_all: "Tüm yorumlar",
    footer_desc: "Türkiye'nin şezlong rezervasyon platformu.",
  },
  en: {
    nav_hotel: "Hotel", nav_beach: "Beach Club", nav_aqua: "Aqua Park", nav_apply: "Apply Now",
    hero_title: "Bodrum's Best", hero_title2: "Beach & Hotel Experience", hero_subtitle: "Manage sunbed, beach club and hotel reservations on one platform",
    hero_search_placeholder: "Search facility, region or activity...", hero_btn: "Search",
    filter_all: "View All", filter_hotel: "Hotel", filter_beach: "Beach Club", filter_aqua: "Aqua Park",
    cat_title: "Facility Categories", cat_subtitle: "Choose the facility type that suits your needs",
    popular_title: "Most Popular", popular_subtitle: "Our guests' most loved facilities",
    card_btn: "Book Now", card_per_day: "/day", view_all: "View All",
    btn_login: "Log In", btn_signup: "Sign Up",
    sfl_region: "Region", sfl_type: "Facility Type", sfl_date: "Date", sfl_name: "Facility Name",
    sfv_region: "Bodrum, Antalya, Marmaris...", sfv_type: "Hotel, Beach Club...", sfv_date: "Select date", sfv_name: "Search...",
    srch_btn: "Search", filter_btn: "Filter",
    r_search_placeholder: "Search city...", r_all: "All", r_clear: "Clear", r_ok: "OK", r_select_il: "Select city",
    st_active: "Active facilities", st_res: "Reservations", st_dest: "Destinations", st_rating: "Average rating", st_qr: "Contactless entry",
    cat_hotel: "Hotel", cat_beach: "Beach Club", cat_aqua: "Aqua Park",
    cat_hotel_sub: "Comfort and service", cat_beach_sub: "Sunbed & sea", cat_aqua_sub: "Fun & slides",
    badge_popular: "Popular", badge_new: "New", tag_daily: "Daily",
    how_title: "How", how_title2: "It Works", how_sub: "Sunbed reservation in 3 steps",
    how1: "Choose Facility", how2: "Choose Sunbed", how3: "Pay & Relax",
    plan_tag: "Sunbed Plan", plan_title: "Choose your sunbed on the map",
    b2b_tag: "For Facility Owners", b2b_title: "Add your facility to MyLoungers",
    rev_title: "What Users Say?", rev_all: "All reviews",
    footer_desc: "Turkey's sunbed reservation platform.",
  },
  de: {
    nav_hotel: "Hotel", nav_beach: "Beach Club", nav_aqua: "Aqua Park", nav_apply: "Jetzt Bewerben",
    hero_title: "Bodrums Bestes", hero_title2: "Strand & Hotel Erlebnis", hero_subtitle: "Verwalten Sie Liegestuhl-, Strandclub- und Hotelreservierungen auf einer Plattform",
    hero_search_placeholder: "Einrichtung, Region oder Aktivität suchen...", hero_btn: "Suchen",
    filter_all: "Alle anzeigen", filter_hotel: "Hotel", filter_beach: "Beach Club", filter_aqua: "Aqua Park",
    cat_title: "Einrichtungskategorien", cat_subtitle: "Wählen Sie den Einrichtungstyp",
    popular_title: "Am beliebtesten", popular_subtitle: "Die beliebtesten Einrichtungen unserer Gäste",
    card_btn: "Jetzt buchen", card_per_day: "/Tag", view_all: "Alle anzeigen",
    btn_login: "Anmelden", btn_signup: "Registrieren",
    sfl_region: "Region", sfl_type: "Einrichtungstyp", sfl_date: "Datum", sfl_name: "Einrichtungsname",
    sfv_region: "Bodrum, Antalya, Marmaris...", sfv_type: "Hotel, Beach Club...", sfv_date: "Datum wählen", sfv_name: "Suchen...",
    srch_btn: "Suchen", filter_btn: "Filtern",
    r_search_placeholder: "Stadt suchen...", r_all: "Alle", r_clear: "Löschen", r_ok: "OK", r_select_il: "Stadt wählen",
    st_active: "Aktive Einrichtungen", st_res: "Reservierungen", st_dest: "Reiseziele", st_rating: "Durchschnittsbewertung", st_qr: "Berührungsloser Eintritt",
    cat_hotel: "Hotel", cat_beach: "Beach Club", cat_aqua: "Aqua Park",
    cat_hotel_sub: "Komfort und Service", cat_beach_sub: "Liegestuhl & Meer", cat_aqua_sub: "Spaß & Rutschen",
    badge_popular: "Beliebt", badge_new: "Neu", tag_daily: "Täglich",
    how_title: "Wie", how_title2: "es funktioniert", how_sub: "Liegestuhlreservierung in 3 Schritten",
    how1: "Einrichtung wählen", how2: "Liegestuhl wählen", how3: "Bezahlen & Entspannen",
    plan_tag: "Liegestuhl-Plan", plan_title: "Wählen Sie Ihren Liegestuhl auf der Karte",
    b2b_tag: "Für Einrichtungsinhaber", b2b_title: "Fügen Sie Ihre Einrichtung zu MyLoungers hinzu",
    rev_title: "Was Nutzer sagen?", rev_all: "Alle Bewertungen",
    footer_desc: "Die Liegestuhl-Reservierungsplattform der Türkei.",
  },
  ru: {
    nav_hotel: "Отель", nav_beach: "Пляжный клуб", nav_aqua: "Аквапарк", nav_apply: "Подать заявку",
    hero_title: "Лучшее в Бодруме", hero_title2: "Пляж и Отель", hero_subtitle: "Управляйте бронированием шезлонгов, пляжных клубов и отелей на одной платформе",
    hero_search_placeholder: "Поиск объекта, региона или активности...", hero_btn: "Поиск",
    filter_all: "Все", filter_hotel: "Отель", filter_beach: "Пляжный клуб", filter_aqua: "Аквапарк",
    cat_title: "Категории объектов", cat_subtitle: "Выберите тип объекта",
    popular_title: "Самые популярные", popular_subtitle: "Самые любимые объекты наших гостей",
    card_btn: "Забронировать", card_per_day: "/день", view_all: "Все",
    btn_login: "Войти", btn_signup: "Регистрация",
    sfl_region: "Регион", sfl_type: "Тип объекта", sfl_date: "Дата", sfl_name: "Название",
    sfv_region: "Бодрум, Анталья, Мармарис...", sfv_type: "Отель, Пляжный клуб...", sfv_date: "Выберите дату", sfv_name: "Поиск...",
    srch_btn: "Поиск", filter_btn: "Фильтр",
    r_search_placeholder: "Поиск города...", r_all: "Все", r_clear: "Очистить", r_ok: "OK", r_select_il: "Выберите город",
    st_active: "Активные объекты", st_res: "Бронирования", st_dest: "Направления", st_rating: "Средний рейтинг", st_qr: "Бесконтактный вход",
    cat_hotel: "Отель", cat_beach: "Пляжный клуб", cat_aqua: "Аквапарк",
    cat_hotel_sub: "Комфорт и сервис", cat_beach_sub: "Шезлонг и море", cat_aqua_sub: "Развлечения и горки",
    badge_popular: "Популярный", badge_new: "Новый", tag_daily: "Ежедневно",
    how_title: "Как", how_title2: "это работает", how_sub: "Бронирование шезлонга за 3 шага",
    how1: "Выберите объект", how2: "Выберите шезлонг", how3: "Оплатите и расслабьтесь",
    plan_tag: "План шезлонгов", plan_title: "Выберите шезлонг на карте",
    b2b_tag: "Для владельцев", b2b_title: "Добавьте свой объект в MyLoungers",
    rev_title: "Что говорят пользователи?", rev_all: "Все отзывы",
    footer_desc: "Платформа бронирования шезлонгов в Турции.",
  },
};

const LANG_OPTS = [
  { code: "tr", flag: "🇹🇷", label: "TR", name: "Türkçe" },
  { code: "en", flag: "🇬🇧", label: "EN", name: "English" },
  { code: "de", flag: "🇩🇪", label: "DE", name: "Deutsch" },
  { code: "ru", flag: "🇷🇺", label: "RU", name: "Русский" },
];

const SLIDER_IMGS = [
  "/images/1.png",
  "/images/2.png",
  "/images/5.png",
  "/images/6.png",
  "/images/9.png",
  "/images/10.png",
];

const CAT_IMGS = [
  "/images/tesis_kategorisi-otel.png",
  "/images/tesis_kategorisi-beach.png",
  "/images/tesis_kategorsi-aquapark.png",
];

const TESIS_IMGS = [
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop",
];

const ILLER: Record<string, string[]> = {
  Muğla: ["Bodrum", "Yalıkavak", "Turgutreis", "Gümbet", "Gündoğan", "Ortakent", "Bitez", "Güvercinlik", "Marmaris", "Fethiye", "Datça", "Milas"],
  Antalya: ["Kemer", "Alanya", "Side", "Manavgat", "Belek", "Kaş", "Kalkan"],
  İzmir: ["Çeşme", "Alaçatı", "Foça", "Urla", "Seferihisar"],
  İstanbul: ["Beşiktaş", "Sarıyer", "Bakırköy", "Kadıköy"],
  Ankara: ["Çankaya", "Keçiören", "Mamak", "Etimesgut"],
  Adana: ["Seyhan", "Çukurova", "Yüreğir", "Sarıçam", "Aladağ"],
  Aydın: ["Didim", "Kuşadası", "Söke"],
  Balıkesir: ["Ayvalık", "Edremit", "Bandırma", "Burhaniye", "Erdek", "Gönen"],
  Bursa: ["Osmangazi", "Nilüfer", "Yıldırım", "Mudanya", "Gemlik", "İnegöl"],
  Mersin: ["Mezitli", "Yenişehir", "Toroslar", "Silifke", "Anamur", "Erdemli"],
  Hatay: ["Antakya", "İskenderun", "Samandağ", "Harbiye", "Defne", "Dörtyol"],
  Trabzon: ["Ortahisar", "Akçaabat", "Yomra", "Sürmene", "Of", "Araklı"],
  Samsun: ["İlkadım", "Atakum", "Canik", "Bafra", "Çarşamba", "Terme"],
  Konya: ["Selçuklu", "Meram", "Karatay", "Beyşehir", "Akşehir", "Seydişehir"],
  Gaziantep: ["Şahinbey", "Şehitkamil", "Nizip", "İslahiye", "Araban", "Oğuzeli"],
  Kayseri: ["Melikgazi", "Kocasinan", "Talas", "Develi", "Bünyan", "İncesu"],
  Eskişehir: ["Tepebaşı", "Odunpazarı", "Sivrihisar", "Mahmudiye", "Seyitgazi"],
};

const FACILITY_TYPES = [
  { icon: "🏨", label: "Hotel" },
  { icon: "🏖️", label: "Beach Club" },
  { icon: "💦", label: "Aqua Park" },
];

const TYPE_MAP: Record<string, string> = { "Hotel": "hotel", "Beach Club": "beach", "Aqua Park": "aqua" };

const SORT_OPTS = [
  { icon: "⭐", label: "Popüler" },
  { icon: "💰", label: "Ucuzdan Pahalıya" },
  { icon: "💎", label: "Pahalıdan Ucuza" },
  { icon: "🏆", label: "En Yüksek Puan" },
];

const RATING_OPTS = ["Tümü", "3★+", "4★+", "4.5★+"];

const FEATURE_OPTS = [
  { icon: "🏊", label: "Havuz" },
  { icon: "📶", label: "Wi-Fi" },
  { icon: "🌊", label: "Denize Sıfır" },
  { icon: "🍽️", label: "Restoran" },
  { icon: "🍹", label: "Bar" },
  { icon: "⛱️", label: "Şemsiye" },
  { icon: "🅿️", label: "Otopark" },
  { icon: "✈️", label: "Havalimanı Transfer" },
];

type TesisSlugInfo = {
  id: string;
  slug?: string | null;
};

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentLang, setCurrentLang] = useState<"tr" | "en" | "de" | "ru">("tr");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [basvuruOpen, setBasvuruOpen] = useState(false);
  const [bmPane, setBmPane] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");
  const [srchRegion, setSrchRegion] = useState("");
  const [srchType, setSrchType] = useState("");
  const [srchDate, setSrchDate] = useState("");
  const [srchName, setSrchName] = useState("");
  const [panelRegion, setPanelRegion] = useState(false);
  const [panelType, setPanelType] = useState(false);
  const [panelDate, setPanelDate] = useState(false);
  const [panelName, setPanelName] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [activeIlce, setActiveIlce] = useState("");
  const [ilSearch, setIlSearch] = useState("");
  const [barWidth, setBarWidth] = useState(0);
  const [calDate, setCalDate] = useState(() => new Date());
  const [filterSort, setFilterSort] = useState(0);
  const [filterPriceMin, setFilterPriceMin] = useState(0);
  const [filterPriceMax, setFilterPriceMax] = useState(5000);
  const [filterRating, setFilterRating] = useState(0);
  const [filterFeatures, setFilterFeatures] = useState<number[]>([]);
  const [locationStatus, setLocationStatus] = useState<null | "loading" | "alındı" | "izin-yok" | "hata">(null);
  const [radius, setRadius] = useState(5);
  const [tesisSlugMap, setTesisSlugMap] = useState<Record<string, TesisSlugInfo>>({});
  const [popularTesisler, setPopularTesisler] = useState<any[]>([]);

  const closePanels = () => {
    setPanelRegion(false);
    setPanelType(false);
    setPanelDate(false);
    setPanelName(false);
  };

  useEffect(() => {
    async function fetchTesisSlugs() {
      const { data, error } = await supabase
        .from("tesisler")
        .select("id, ad, slug");

      if (error) {
        console.error("Ana sayfa tesis slug sorgu hatası:", error);
        return;
      }

      const map: Record<string, TesisSlugInfo> = {};
      (data ?? []).forEach((t: any) => {
        if (t.ad) {
          map[String(t.ad)] = {
            id: String(t.id),
            slug: t.slug ?? null,
          };
        }
      });
      setTesisSlugMap(map);
    }

    fetchTesisSlugs();
  }, []);

  // Ana sayfa için en çok tercih edilen tesisleri Supabase'den çek
  useEffect(() => {
    async function fetchPopular() {
      const { data, error } = await supabase
        .from("tesisler")
        .select("id, ad, slug, ilce, sehir, puan, images, kapak_gorsel, min_fiyat")
        .eq("aktif", true)
        .order("puan", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Ana sayfa popüler tesisler sorgu hatası:", error);
        return;
      }

      setPopularTesisler(data ?? []);
    }

    fetchPopular();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlideIdx((s) => (s + 1) % SLIDER_IMGS.length), 5500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const start = Date.now();
    const dur = 5500;
    const step = () => {
      const p = Math.min(((Date.now() - start) / dur) * 100, 100);
      setBarWidth(p);
      if (p < 100) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [slideIdx]);

  useEffect(() => {
    if (!isLangOpen) return;
    const onClose = () => setIsLangOpen(false);
    document.addEventListener("click", onClose);
    return () => document.removeEventListener("click", onClose);
  }, [isLangOpen]);

  useEffect(() => {
    const onClose = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".sf") || target.closest(".region-dropdown") || target.closest(".type-dropdown") || target.closest(".date-dropdown") || target.closest(".name-dropdown") || target.closest(".filter-panel")) return;
      setPanelRegion(false);
      setPanelType(false);
      setPanelDate(false);
      setPanelName(false);
      setFilterOpen(false);
    };
    if (panelRegion || panelType || panelDate || panelName || filterOpen) {
      document.addEventListener("click", onClose);
      return () => document.removeEventListener("click", onClose);
    }
  }, [panelRegion, panelType, panelDate, panelName, filterOpen]);

  const openPanel = useCallback((p: "region" | "type" | "date" | "name") => {
    setFilterOpen(false);
    const isOpen = (p === "region" && panelRegion) || (p === "type" && panelType) || (p === "date" && panelDate) || (p === "name" && panelName);
    if (isOpen) {
      closePanels();
      return;
    }
    setPanelRegion(p === "region");
    setPanelType(p === "type");
    setPanelDate(p === "date");
    setPanelName(p === "name");
  }, [panelRegion, panelType, panelDate, panelName]);

  const openFilterPanel = useCallback(() => {
    closePanels();
    setFilterOpen((prev) => !prev);
  }, []);

  const handleLocation = useCallback(() => {
    setLocationStatus("loading");

    if (!navigator.geolocation) {
      setLocationStatus("hata");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus("alındı");
        console.log("Konum:", pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        if (err.code === 1) {
          setLocationStatus("izin-yok");
        } else {
          setLocationStatus("hata");
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, []);

  const handleTesisAra = useCallback(() => {
    const params = new URLSearchParams();
    const konum = activeIlce ? `${selectedProvince} / ${activeIlce}` : selectedProvince;
    if (konum) params.set("konum", konum);
    if (srchType) params.set("tip", TYPE_MAP[srchType] ?? srchType.toLowerCase());
    if (srchDate) params.set("tarih", srchDate);
    const qs = params.toString();
    router.push(qs ? `/arama?${qs}` : "/arama");
  }, [selectedProvince, activeIlce, srchType, srchDate, router]);

  const ilceler = selectedProvince && ILLER[selectedProvince] ? ILLER[selectedProvince] : [];
  const filteredIller = Object.keys(ILLER).filter((il) =>
    !ilSearch || il.toLowerCase().includes(ilSearch.toLowerCase())
  );

  const searchTypeKey = srchType ? TYPE_MAP[srchType] : null;

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.tr;
  const activeLangOpt = LANG_OPTS.find((o) => o.code === currentLang) ?? LANG_OPTS[0];

  const scrollToTesisler = () => {
    const el = document.getElementById("tesisler-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-page">
      {/* NAV */}
      <nav className="nav">
        <div className="nav-in">
          <Link href="/" className="logo-img-wrap">
            <img src="/logo.png" alt="MyLoungers" className="logo-img" />
          </Link>
          <div className="nav-cats">
            <button
              type="button"
              className={`nc ${activeCategory === "hotel" ? "on" : ""}`}
              onClick={() => { setActiveCategory("hotel"); scrollToTesisler(); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="1"/><path d="M16 22V12H8v10"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"/></svg>
              {t.nav_hotel}
            </button>
            <button
              type="button"
              className={`nc ${activeCategory === "beach" ? "on" : ""}`}
              onClick={() => { setActiveCategory("beach"); scrollToTesisler(); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 4C14 4 11 6 10 9L3 21"/><path d="M22 4C19 4 16 6 15 9L8 21"/><path d="M7 21h14"/><circle cx="19" cy="4" r="1" fill="currentColor"/></svg>
              {t.nav_beach}
            </button>
            <button
              type="button"
              className={`nc ${activeCategory === "aqua" ? "on" : ""}`}
              onClick={() => { setActiveCategory("aqua"); scrollToTesisler(); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0"/><path d="M2 17c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0"/><path d="M2 7c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0"/></svg>
              {t.nav_aqua}
            </button>
            <Link href="/basvuru" className="nc">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              {t.nav_apply}
            </Link>
          </div>
          <div className="nav-r">
            <div className={`lang-dropdown-wrap ${isLangOpen ? "open" : ""}`}>
              <button
                type="button"
                className="lang-trigger"
                onClick={(e) => { e.stopPropagation(); setIsLangOpen(!isLangOpen); }}
                aria-expanded={isLangOpen}
                aria-haspopup="listbox"
              >
                <span className="lang-trigger-flag">{activeLangOpt.flag}</span>
                <span>{activeLangOpt.label}</span>
                <svg className="lang-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {isLangOpen && (
                <div className="lang-dropdown" role="listbox">
                  {LANG_OPTS.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      role="option"
                      aria-selected={currentLang === opt.code}
                      className={`lang-drop-item ${currentLang === opt.code ? "active" : ""}`}
                      onClick={(e) => { e.stopPropagation(); setCurrentLang(opt.code as "tr" | "en" | "de" | "ru"); setIsLangOpen(false); }}
                    >
                      <span>{opt.flag}</span>
                      <span className="lang-drop-name">{opt.name}</span>
                      {currentLang === opt.code && <span className="lang-check">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {session ? (
              <>
                <Link href="/profil" className="nav-user" style={{ textDecoration: "none" }}>
                  {session.user?.name || session.user?.email}
                </Link>
                <button
                  type="button"
                  className="btn-login"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link href="/giris" className="btn-login" id="btnLogin">{t.btn_login}</Link>
                <Link href="/giris?tab=register" className="btn-signup" id="btnSignup">{t.btn_signup}</Link>
              </>
            )}
          </div>
          <button
            type="button"
            className={`ham ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menü"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* MOB CATS */}
      <div className="mob-cats">
        <div className="mob-cats-in">
          <button type="button" className={`mcat ${activeCategory === "hotel" ? "on" : ""}`} onClick={() => { setActiveCategory("hotel"); scrollToTesisler(); }}>{t.nav_hotel}</button>
          <button type="button" className={`mcat ${activeCategory === "beach" ? "on" : ""}`} onClick={() => { setActiveCategory("beach"); scrollToTesisler(); }}>{t.nav_beach}</button>
          <button type="button" className={`mcat ${activeCategory === "aqua" ? "on" : ""}`} onClick={() => { setActiveCategory("aqua"); scrollToTesisler(); }}>{t.nav_aqua}</button>
          <Link href="/basvuru" className="mcat">{t.nav_apply}</Link>
        </div>
      </div>

      {/* MOB MENU */}
      <div className={`mob-menu ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)}>
        <div className="mob-panel" onClick={(e) => e.stopPropagation()}>
          <div className="mob-panel-head">
            <img src="/logo.png" alt="MyLoungers" className="mob-panel-logo" />
            <button type="button" className="mob-close" onClick={() => setMenuOpen(false)}>×</button>
          </div>
          <div className="mob-lang-dropdown">
            {LANG_OPTS.map((opt) => (
              <button key={opt.code} type="button" className={`mob-lang-item ${currentLang === opt.code ? "active" : ""}`} onClick={() => setCurrentLang(opt.code as "tr" | "en" | "de" | "ru")}>
                <span>{opt.flag}</span>
                <span>{opt.name}</span>
                {currentLang === opt.code && <span className="lang-check">✓</span>}
              </button>
            ))}
          </div>
          <div className="mob-btns">
            {session ? (
              <>
                <div className="mob-user">
                  {session.user?.name || session.user?.email}
                </div>
                <button
                  type="button"
                  className="mob-btn-login"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link href="/giris" className="mob-btn-login" onClick={() => setMenuOpen(false)}>{t.btn_login}</Link>
                <Link href="/giris?tab=register" className="mob-btn-signup" onClick={() => setMenuOpen(false)}>{t.btn_signup}</Link>
              </>
            )}
          </div>
          <button type="button" className="mob-link" onClick={() => { setMenuOpen(false); setActiveCategory("hotel"); scrollToTesisler(); }}>{t.nav_hotel}</button>
          <button type="button" className="mob-link" onClick={() => { setMenuOpen(false); setActiveCategory("beach"); scrollToTesisler(); }}>{t.nav_beach}</button>
          <button type="button" className="mob-link" onClick={() => { setMenuOpen(false); setActiveCategory("aqua"); scrollToTesisler(); }}>{t.nav_aqua}</button>
          <Link href="/basvuru" className="mob-link" onClick={() => setMenuOpen(false)}>{t.nav_apply}</Link>
        </div>
      </div>

      {/* SLIDER */}
      <div className="bwrap" id="bwrap">
        {SLIDER_IMGS.map((src, i) => (
          <div key={i} className={`slide ${i === slideIdx ? "on" : ""}`}>
  <img src={src} alt="" className="slide-img" />
          </div>
        ))}
        <button type="button" className="sarr prev" id="sprev" onClick={() => setSlideIdx((s) => (s - 1 + SLIDER_IMGS.length) % SLIDER_IMGS.length)}>‹</button>
        <button type="button" className="sarr next" id="snext" onClick={() => setSlideIdx((s) => (s + 1) % SLIDER_IMGS.length)}>›</button>
        <div className="sdots">
          {SLIDER_IMGS.map((_, i) => (
            <button key={i} type="button" className={`dot ${i === slideIdx ? "on" : ""}`} onClick={() => setSlideIdx(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
        <div className="bprog">
          <div className="bbar" style={{ width: `${barWidth}%` }} />
        </div>
      </div>

      {/* SEARCH BAR — sticky, 5 sections */}
      <div className="srch-wrap">
        <div className="srch-in">
          <div className="srch-card">
            {/* BÖLGE */}
            <div className="srch-field-wrap">
              <div
                className={`sf ${panelRegion ? "active" : ""} ${srchRegion ? "filled" : ""}`}
                onClick={(e) => { e.stopPropagation(); openPanel("region"); }}
                role="button"
                tabIndex={0}
              >
                <span className="sfl">{t.sfl_region}</span>
                <span className="sfv">{srchRegion || t.sfv_region}</span>
              </div>
              {panelRegion && (
                <div className="srch-dropdown region-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="region-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                    <input type="text" placeholder={t.r_search_placeholder} value={ilSearch} onChange={(e) => setIlSearch(e.target.value)} />
                  </div>
                  <div className="region-cols">
                    <div className="region-iller" style={{ width: 280 }}>
                      {filteredIller.map((il) => (
                        <div key={il} className={`r-item ${selectedProvince === il ? "active" : ""}`} onClick={() => { setSelectedProvince(il); setActiveIlce(""); }}>
                          {il}<span className="r-arr">›</span>
                        </div>
                      ))}
                    </div>
                    <div className="region-ilceler" style={{ width: 340 }}>
                      {selectedProvince ? (
                        <>
                          <div className="r-ilce-ttl">{selectedProvince}</div>
                          <div className={`r-ilce-item ${!activeIlce ? "sel" : ""}`} onClick={() => setActiveIlce("")}>{t.r_all}</div>
                          {ilceler.map((ilce) => (
                            <div key={ilce} className={`r-ilce-item ${activeIlce === ilce ? "sel" : ""}`} onClick={() => setActiveIlce(ilce)}>{ilce}</div>
                          ))}
                        </>
                      ) : (
                        <div className="r-empty">{t.r_select_il}</div>
                      )}
                    </div>
                  </div>
                  <div className="srch-drop-footer">
                    <span className="srch-drop-val">{activeIlce ? `${selectedProvince} / ${activeIlce}` : selectedProvince || ""}</span>
                    <button type="button" className="srch-drop-btn" onClick={() => { setSelectedProvince(""); setActiveIlce(""); setSrchRegion(""); closePanels(); }}>{t.r_clear}</button>
                    <button type="button" className="srch-drop-btn primary" onClick={() => { setSrchRegion(activeIlce ? `${selectedProvince} / ${activeIlce}` : selectedProvince); closePanels(); }}>{t.r_ok}</button>
                  </div>
                </div>
              )}
            </div>

            {/* TESİS TİPİ */}
            <div className="srch-field-wrap">
              <div
                className={`sf ${panelType ? "active" : ""} ${srchType ? "filled" : ""}`}
                onClick={(e) => { e.stopPropagation(); openPanel("type"); }}
                role="button"
                tabIndex={0}
              >
                <span className="sfl">{t.sfl_type}</span>
                <span className="sfv">{srchType || t.sfv_type}</span>
              </div>
              {panelType && (
                <div className="srch-dropdown type-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="type-title">TESİS TÜRÜ SEÇİN</div>
                  <div className="type-grid">
                    {FACILITY_TYPES.map((ft, i) => (
                      <button key={i} type="button" className={`type-btn ${srchType === ft.label ? "sel" : ""}`} onClick={() => setSrchType(srchType === ft.label ? "" : ft.label)}>
                        <span>{ft.icon}</span><span>{ft.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="srch-drop-footer">
                    <button type="button" className="srch-drop-btn" onClick={() => setSrchType("")}>{t.r_clear}</button>
                    <button type="button" className="srch-drop-btn primary" onClick={() => closePanels()}>Uygula</button>
                  </div>
                </div>
              )}
            </div>

            {/* TARİH */}
            <div className="srch-field-wrap">
              <div
                className={`sf ${panelDate ? "active" : ""} ${srchDate ? "filled" : ""}`}
                onClick={(e) => { e.stopPropagation(); openPanel("date"); }}
                role="button"
                tabIndex={0}
              >
                <span className="sfl">{t.sfl_date}</span>
                <span className="sfv">{srchDate || t.sfv_date}</span>
              </div>
              {panelDate && (
                <div className="srch-dropdown date-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="cal-header">
                    <button type="button" className="cal-nav" onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1))}>‹</button>
                    <span className="cal-month">{calDate.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}</span>
                    <button type="button" className="cal-nav" onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1))}>›</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", textAlign: "center" }}>
                    {["PT", "SA", "ÇA", "PE", "CU", "CT", "PZ"].map((g) => (
                      <div key={g}>{g}</div>
                    ))}
                  </div>
                  <div className="cal-grid">
                    {(() => {
                      const y = calDate.getFullYear(), m = calDate.getMonth();
                      const first = new Date(y, m, 1);
                      const last = new Date(y, m + 1, 0);
                      const startPad = (first.getDay() + 6) % 7;
                      const days: (Date | null)[] = [...Array(startPad)].fill(null) as null[];
                      for (let d = 1; d <= last.getDate(); d++) days.push(new Date(y, m, d));
                      const now = new Date();
                      now.setHours(0, 0, 0, 0);
                      return days.map((d, i) => {
                        if (!d) return <div key={i} className="cal-cell empty" />;
                        const isToday = d.getTime() === now.getTime();
                        const isPast = d < now;
                        const sel = srchDate && new Date(srchDate).toDateString() === d.toDateString();
                        return (
                          <button key={i} type="button" className={`cal-cell ${isToday ? "today" : ""} ${isPast ? "past" : ""} ${sel ? "sel" : ""}`} disabled={isPast} onClick={() => { setSrchDate(d.toISOString().slice(0, 10)); closePanels(); }}>{d.getDate()}</button>
                        );
                      });
                    })()}
                  </div>
                  <div className="srch-drop-footer"><button type="button" className="srch-drop-btn" onClick={() => { setSrchDate(""); }}>{t.r_clear}</button></div>
                </div>
              )}
            </div>

            {/* TESİS ADI */}
            <div className="srch-field-wrap">
              <div
                className={`sf ${panelName ? "active" : ""} ${srchName ? "filled" : ""}`}
                onClick={(e) => { e.stopPropagation(); openPanel("name"); }}
                role="button"
                tabIndex={0}
              >
                <span className="sfl">{t.sfl_name}</span>
                <span className="sfv">{srchName || t.sfv_name}</span>
              </div>
              {panelName && (
                <div className="srch-dropdown name-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="name-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                    <input type="text" placeholder="Tesis adı yazın..." value={srchName} onChange={(e) => setSrchName(e.target.value)} />
                  </div>
                  <div className="name-title">POPÜLER TESİSLER</div>
                  <div className="name-list">
                    {popularTesisler
                      .filter((ts) => !srchName || String(ts.ad ?? "").toLowerCase().includes(srchName.toLowerCase()))
                      .map((ts) => (
                        <div
                          key={ts.id}
                          className="name-item"
                          onClick={() => { setSrchName(ts.ad ?? ""); closePanels(); }}
                        >
                          <span>🏖️</span>
                          <span className="name-item-name">{ts.ad}</span>
                          <span className="name-item-loc">
                            — {ts.ilce && ts.sehir ? `${ts.ilce} (${ts.sehir})` : ts.sehir || ts.ilce || ""}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="srch-actions">
              {/* TESİS ARA */}
              <button type="button" className="srch-btn" onClick={(e) => { e.stopPropagation(); handleTesisAra(); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                {t.srch_btn}
              </button>
              {/* FİLTRELE */}
              <button
                type="button"
                className={`filter-trigger ${filterOpen ? "active" : ""}`}
                onClick={(e) => { e.stopPropagation(); openFilterPanel(); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
                <span>{t.filter_btn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FİLTRELE PANELİ — sağdan açılır */}
      <div className={`filter-overlay ${filterOpen ? "open" : ""}`} onClick={() => setFilterOpen(false)} />
      <div className={`filter-panel ${filterOpen ? "open" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="fp-head">
          <div className="fp-title">Filtrele</div>
          <button type="button" className="fp-close" onClick={() => setFilterOpen(false)}>×</button>
        </div>
        <div className="fp-body">
          <div className="fp-section">
            <div className="fp-radius-header">
              <span className="fp-sec-title">ARAMA YARIÇAPI</span>
              <span className="fp-radius-val">{radius} km</span>
            </div>
            <div className="fp-range-wrap">
              <input type="range" className="fp-range" min={1} max={50} step={1} value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
            </div>
            <div className="fp-radius-pills">
              {[1, 5, 10, 50].map((km) => (
                <button key={km} type="button" className={`fp-radius-pill ${radius === km ? "sel" : ""}`} onClick={() => setRadius(km)}>{km} km</button>
              ))}
            </div>
            <button
              type="button"
              className={`fp-location-btn ${locationStatus === "alındı" ? "fp-location-ok" : ""} ${locationStatus === "hata" ? "fp-location-err" : ""} ${locationStatus === "loading" ? "fp-location-loading" : ""} ${locationStatus === "izin-yok" ? "fp-location-izin" : ""}`}
              onClick={handleLocation}
              disabled={locationStatus === "loading" || locationStatus === "alındı"}
            >
              {locationStatus === "loading" ? "⏳ Konum alınıyor..." : locationStatus === "alındı" ? `✅ ${radius} km çevresinde aranıyor` : locationStatus === "izin-yok" ? "🔒 Tarayıcı ayarlarından konum iznini aç" : locationStatus === "hata" ? `📍 Konumumu Kullan — ${radius} km çevresinde ara` : `📍 Konumumu Kullan — ${radius} km çevresinde ara`}
            </button>
          </div>
          <div className="fp-section">
            <div className="fp-sec-title">SIRALAMA</div>
            <div className="fp-sort-grid">
              {SORT_OPTS.map((s, i) => (
                <button key={i} type="button" className={`fp-sort-btn ${filterSort === i ? "sel" : ""}`} onClick={() => setFilterSort(i)}>{s.icon} {s.label}</button>
              ))}
            </div>
          </div>
          <div className="fp-section">
            <div className="fp-sec-title">GÜNLÜK FİYAT ARALIĞI</div>
            <div className="fp-price-row">
              <div className="fp-price-box"><span className="fp-price-lbl">MIN</span><span className="fp-price-val">₺{filterPriceMin}</span></div>
              <span className="fp-price-sep">—</span>
              <div className="fp-price-box"><span className="fp-price-lbl">MAX</span><span className="fp-price-val">₺{filterPriceMax}+</span></div>
            </div>
            <input type="range" className="fp-range" min={0} max={5000} value={filterPriceMax} onChange={(e) => setFilterPriceMax(Number(e.target.value))} />
          </div>
          <div className="fp-section">
            <div className="fp-sec-title">MİNİMUM PUAN</div>
            <div className="fp-rating-row">
              {RATING_OPTS.map((r, i) => (
                <button key={i} type="button" className={`fp-rating-btn ${filterRating === i ? "sel" : ""}`} onClick={() => setFilterRating(i)}>{r}</button>
              ))}
            </div>
          </div>
          <div className="fp-section">
            <div className="fp-sec-title">ÖZELLİKLER</div>
            <div className="fp-features">
              {FEATURE_OPTS.map((f, i) => (
                <button key={i} type="button" className={`fp-feat-btn ${filterFeatures.includes(i) ? "sel" : ""}`} onClick={() => setFilterFeatures((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i])}>{f.icon} {f.label}</button>
              ))}
            </div>
          </div>
          <div className="fp-foot">
            <button type="button" className="fp-clear-btn" onClick={() => { setFilterSort(0); setFilterPriceMin(0); setFilterPriceMax(5000); setFilterRating(0); setFilterFeatures([]); }}>Temizle</button>
            <button type="button" className="fp-apply-btn" onClick={() => setFilterOpen(false)}>Sonuçları Gör</button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stats-in">
          <div><span className="stn">100+</span><span className="stl" id="stl1">{t.st_active}</span></div>
          <div className="std" />
          <div><span className="stn">50K+</span><span className="stl" id="stl2">{t.st_res}</span></div>
          <div className="std" />
          <div><span className="stn">15</span><span className="stl" id="stl3">{t.st_dest}</span></div>
          <div className="std" />
          <div><span className="stn">4.9★</span><span className="stl" id="stl4">{t.st_rating}</span></div>
          <div className="std" />
          <div><span className="stn">QR</span><span className="stl" id="stl5">{t.st_qr}</span></div>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="sec">
        <div className="sec-row">
<h2 className="sec-h" id="cat-title">{t.cat_title}</h2>
        <button type="button" className="sec-a" id="cat-all" onClick={() => setActiveCategory("all")}>{t.view_all} →</button>
        </div>
        <div className="cat-grid">
          <div id="oteller" className="cat-card" data-cat="hotel" onClick={() => setActiveCategory("hotel")}>
            <img src={CAT_IMGS[0]} alt="Hotel" />
            <div className="cat-ov">
<div className="cat-name" id="cat1-name">{t.cat_hotel}</div>
            <div className="cat-sub" id="cat1-sub">{t.cat_hotel_sub}</div>
            </div>
            <div className="cat-badge ct" id="cat1-badge">{t.badge_popular}</div>
          </div>
          <div id="beach-club" className="cat-card" data-cat="beach" onClick={() => setActiveCategory("beach")}>
            <img src={CAT_IMGS[1]} alt="Beach Club" />
            <div className="cat-ov">
              <div className="cat-name" id="cat2-name">{t.cat_beach}</div>
              <div className="cat-sub" id="cat2-sub">{t.cat_beach_sub}</div>
            </div>
          </div>
          <div id="aqua-park" className="cat-card" data-cat="aqua" onClick={() => setActiveCategory("aqua")}>
            <img src={CAT_IMGS[2]} alt="Aqua Park" />
            <div className="cat-ov">
              <div className="cat-name" id="cat3-name">{t.cat_aqua}</div>
              <div className="cat-sub" id="cat3-sub">{t.cat_aqua_sub}</div>
            </div>
            <div className="cat-badge co" id="cat3-badge">{t.badge_new}</div>
          </div>
        </div>
      </section>

      {/* FAV / PRODUCTS — En Çok Tercih Edilenler */}
      <section className="sec" id="tesisler-section">
        <div className="sec-row">
          <h2 className="sec-h" id="fav-title">{t.popular_title}</h2>
          <button type="button" className="sec-a" id="fav-all" onClick={() => setActiveCategory("all")}>{t.view_all} →</button>
        </div>
        <div className="pgrid" id="tesisGrid">
          {popularTesisler.map((tesis) => {
            const name = tesis.ad as string;
            const ilce = (tesis.ilce as string) || "";
            const sehir = (tesis.sehir as string) || "";
            const price =
              (tesis.min_fiyat as number | null) ??
              0;
            const puan = typeof tesis.puan === "number" ? tesis.puan : null;

            let imageSrc: string = TESIS_IMGS[0];
            const imagesVal = (tesis as any).images;
            if (Array.isArray(imagesVal) && imagesVal.length > 0) {
              imageSrc = imagesVal[0] as string;
            } else if (typeof tesis.kapak_gorsel === "string") {
              imageSrc = tesis.kapak_gorsel as string;
            }

            const slugValue =
              (tesis.slug && String(tesis.slug).trim()) ||
              String(tesis.id);

            const cardContent = (
              <>
                <div className="pw0">
                  <img src={imageSrc} alt={name} />
                  <button type="button" className="pfav" onClick={(e) => e.stopPropagation()}>♡</button>
                  {puan !== null && (
                    <span className="prat">★ {puan.toFixed(1)}</span>
                  )}
                  <span className="ptag ct">{t.tag_daily}</span>
                </div>
                <div className="pn">{name}</div>
                <div className="pl">
                  {ilce && sehir ? `${ilce} / ${sehir}` : ilce || sehir || ""}
                </div>
                <div className="pf">
                  <span className="pfc">Wi-Fi</span>
                  <span className="pfc">Bar</span>
                </div>
                <div className="pp">
                  <b>₺{price && price > 0 ? price.toLocaleString("tr-TR") : "—"}</b>
                  <span> {t.card_per_day}</span>
                </div>
              </>
            );

            return (
              <Link
                key={tesis.id}
                href={`/tesis/${encodeURIComponent(slugValue)}`}
                className="pc pc-link"
                data-type="hotel"
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOW */}
      <section className="how">
        <div className="how-in">
          <h2 className="how-ttl" id="how-title">{t.how_title} <span>{t.how_title2}</span></h2>
          <p className="how-sub" id="how-sub">{t.how_sub}</p>
          <div className="hgrid">
            <div className="hs">
              <div className="hs-top">
                <div className="hn"><span className="hn-num">1</span></div>
                <span className="hadim">ADIM 01</span>
              </div>
              <span className="hi">🔍</span>
              <h3 id="how1-title">{t.how1}</h3>
              <p className="hs-desc" id="how1-desc">Konum, tesis tipi veya tarihe göre filtrele.</p>
              <ul className="hs-list">
                <li>Konuma, tarihe veya tesis tipine göre filtrele</li>
                <li>Gerçek kullanıcı yorumları ve puanlarını gör</li>
                <li>Anlık müsaitlik durumunu kontrol et</li>
              </ul>
              <div className="hs-badge">🗺️ 15+ Destinasyon</div>
            </div>
            <div className="hs">
              <div className="hs-top">
                <div className="hn"><span className="hn-num">2</span></div>
                <span className="hadim">ADIM 02</span>
              </div>
              <span className="hi">🏖️</span>
              <h3 id="how2-title">{t.how2}</h3>
              <p className="hs-desc" id="how2-desc">Tesis planı üzerinden istediğin şezlongu seç.</p>
              <ul className="hs-list">
                <li>Denize yakınlık, gölge ve VIP bölge tercini yap</li>
                <li>Silver, Gold ve VIP kategoriler arasından seç</li>
                <li>Birden fazla şezlongu aynı anda rezerve et</li>
              </ul>
              <div className="hs-badge">🏖️ 100+ Şezlong / Tesis</div>
            </div>
            <div className="hs">
              <div className="hs-top">
                <div className="hn"><span className="hn-num">3</span></div>
                <span className="hadim">ADIM 03</span>
              </div>
              <span className="hi">✅</span>
              <h3 id="how3-title">{t.how3}</h3>
              <p className="hs-desc" id="how3-desc">Güvenli ödeme yap, QR kodunu göster.</p>
              <ul className="hs-list">
                <li>iyzico ile 256-bit SSL şifreli güvenli ödeme</li>
                <li>QR kod ile temassız, kasasız tesis girişi</li>
                <li>24 saate kadar ücretsiz iptal imkânı</li>
              </ul>
              <div className="hs-badge">🔒 Güvenli &amp; Anında Onay</div>
            </div>
          </div>
          <div className="how-cta">
            <a href="/arama" className="how-cta-btn" id="how-cta-btn">🔍 Tesis Aramaya Başla</a>
            <p className="how-cta-sub">Ücretsiz üyelik · Kredi kartı gerekmez</p>
          </div>
        </div>
      </section>

      {/* PLAN */}
      <section className="plan-sec">
        <div>
          <div className="plan-k" id="plan-tag">Şezlong Planı</div>
          <h2 id="plan-title">Tam istediğin şezlongu harita üzerinden seç</h2>
          <p className="pdesc" id="plan-desc">Tesis planında müsait şezlongları anlık görürsün.</p>
          <ul className="cl">
            <li id="plan-f1">Anlık müsaitlik durumu</li>
            <li id="plan-f2">Silver, Gold, VIP kategori fiyatları</li>
            <li id="plan-f3">İleri tarihli rezervasyon imkânı</li>
            <li id="plan-f4">Garson çağırma ve sipariş</li>
          </ul>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <a href="/hotel/slug" className="btn-solid" id="plan-btn1">Tesis planını gör →</a>
            <button type="button" className="btn-ghost" id="plan-btn2">Daha fazla bilgi</button>
          </div>
        </div>
        <div className="pww">
          <div className="pwt">
            <span className="pwn">Zuzuu Beach Hotel</span>
            <span className="pwd">6 Mar 2026</span>
          </div>
          <div className="pwb">
            <div className="pw-cat-row">
              <span className="pw-cat-lbl">SILVER</span>
              <span className="pw-cat-price">₺1.000 / GÜN</span>
            </div>
            <div className="lrow">
              {[4,5,6,7,8,9,28,30].map((n, i) => (
                <div key={n} className={`l ${i === 7 ? "lsel" : i === 6 ? "lno" : "lok"}`}>{n}</div>
              ))}
            </div>
            <div className="pw-cat-row" style={{marginTop:"14px"}}>
              <span className="pw-cat-lbl">GOLD</span>
              <span className="pw-cat-price">₺600 / GÜN</span>
            </div>
            <div className="lrow">
              {[1,2,3,4,5,6,7,8].map((n, i) => (
                <div key={n} className={`l lgold ${i === 2 ? "lno" : i === 5 ? "lpnd" : "lok"}`}>{n}</div>
              ))}
            </div>
          </div>
          <div className="pwleg">
            <div className="pwl"><div className="pwld lok" /><span>Müsait</span></div>
            <div className="pwl"><div className="pwld lno" /><span>Rezerve</span></div>
            <div className="pwl"><div className="pwld lpnd" /><span>Tadilat</span></div>
            <div className="pwl"><div className="pwld lsel" /><span>Seçimim</span></div>
          </div>
        </div>
      </section>

      {/* B2B */}
      <section className="b2b">
        <div className="b2b-in">
          <div>
            <div className="bm-tag" id="b2b-tag">{t.b2b_tag}</div>
            <h2 id="b2b-title">{t.b2b_title}</h2>
            <p className="desc" id="b2b-desc">Otel, beach club veya plaj işletmenizi platforma ekleyin.</p>
            <div className="b2b-acts">
              <button type="button" className="btn-solid" id="b2b-btn1" onClick={() => setBasvuruOpen(true)}>Başvuru Formu →</button>
              <button type="button" className="btn-ghost" id="b2b-btn2">Demo İzle</button>
            </div>
          </div>
          <div className="b2bcards">
            <div className="b2bc">
              <div className="b2bi">📈</div>
              <div>
                <h4 id="b2b1-title">Doluluk Oranını Artır</h4>
                <p id="b2b1-desc">Sezon boyunca %90+ doluluk oranı hedefleyin, her şezlong gelir getirsin.</p>
              </div>
            </div>
            <div className="b2bc">
              <div className="b2bi">💳</div>
              <div>
                <h4 id="b2b2-title">Online Ödeme &amp; Raporlama</h4>
                <p id="b2b2-desc">iyzico altyapısıyla tahsilatlar otomatik, raporlar anlık — kasaya dokunmadan.</p>
              </div>
            </div>
            <div className="b2bc">
              <div className="b2bi">🌟</div>
              <div>
                <h4 id="b2b3-title">Ücretsiz Tesis Sayfası</h4>
                <p id="b2b3-desc">Fotoğraf, harita, şezlong planı — tesisiniz 10 dakikada yayında.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="rev">
        <div className="sec-row">
          <h2 className="sec-h" id="rev-title">{t.rev_title}</h2>
          <a href="/yorumlar" className="sec-a" id="rev-all">{t.rev_all} →</a>
        </div>
        <div className="rgrid">
          <div className="rc">
            <div className="rc-dest" id="rev1-dest">🏖️ Bodrum · Zuzuu Beach Hotel</div>
            <div className="rc-stars">★★★★★</div>
            <p className="rc-text" id="rev1-text">Bodrum tatilinde şezlong için saatlerce beklemek zorunda kalmadık!</p>
            <div className="rc-auth">
              <div className="rc-av">AY</div>
              <div>
                <div className="rc-name">Ayşe Y.</div>
                <div className="rc-loc" id="rev1-loc">İstanbul · Doğrulanmış</div>
              </div>
            </div>
          </div>
          <div className="rc">
            <div className="rc-dest" id="rev2-dest">🏊 Marmaris · Aqua Resort</div>
            <div className="rc-stars">★★★★★</div>
            <p className="rc-text" id="rev2-text">QR kod ile giriş süper. Kasaya uğramak yok, kuyruk yok!</p>
            <div className="rc-auth">
              <div className="rc-av">MK</div>
              <div>
                <div className="rc-name">Mehmet K.</div>
                <div className="rc-loc" id="rev2-loc">Ankara · Doğrulanmış</div>
              </div>
            </div>
          </div>
          <div className="rc">
            <div className="rc-dest" id="rev3-dest">🌊 Fethiye · Paradise Beach</div>
            <div className="rc-stars">★★★★★</div>
            <p className="rc-text" id="rev3-text">Denize en yakın şezlongu seçebildim. Uygulama çok kolay!</p>
            <div className="rc-auth">
              <div className="rc-av">ZD</div>
              <div>
                <div className="rc-name">Zeynep D.</div>
                <div className="rc-loc" id="rev3-loc">İzmir · Doğrulanmış</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="ft">
          <div>
            <img src="/logo.png" alt="MyLoungers" className="fl-logo" />
            <p className="fd" id="footer-desc">{t.footer_desc}</p>
            <div className="fa">
              <a href="#" className="fapp">🍎 App Store</a>
              <a href="#" className="fapp">🤖 Google Play</a>
            </div>
          </div>
          <div className="fcol">
            <h5 id="ft-p">Platform</h5>
            <ul>
              <li><a href="/arama" id="ft-p1">Tesisleri Keşfet</a></li>
              <li><a href="/harita" id="ft-p2">Harita ile Ara</a></li>
              <li><a href="/nasil-calisir" id="ft-p3">Nasıl Çalışır?</a></li>
              <li><a href="/rezervasyonlarim" id="ft-p4">Rezervasyon Takibi</a></li>
            </ul>
          </div>
          <div className="fcol">
            <h5 id="ft-c">Kurumsal</h5>
            <ul>
              <li><a href="/b2b/basvuru" id="ft-c1">Tesis Başvurusu</a></li>
              <li><a href="/hakkimizda" id="ft-c2">Hakkımızda</a></li>
              <li><a href="/iletisim" id="ft-c3">İletişim</a></li>
            </ul>
          </div>
          <div className="fcol">
            <h5 id="ft-s">Destek</h5>
            <ul>
              <li><a href="/kvkk" id="ft-s1">KVKK Metni</a></li>
              <li><a href="/gizlilik" id="ft-s2">Gizlilik</a></li>
              <li><a href="/iptal-iade" id="ft-s3">İptal &amp; İade</a></li>
            </ul>
          </div>
        </div>
        <div className="fb">
          <span id="ft-copy">© 2025 MyLoungers · Reklamotv</span>
        </div>
      </footer>

      {/* BASVURU MODAL */}
      <div className={`basvuru-overlay ${basvuruOpen ? "open" : ""}`} onClick={() => setBasvuruOpen(false)}>
        <div className="basvuru-modal" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="bm-close-btn" onClick={() => setBasvuruOpen(false)}>×</button>
          <div className="bm-left">
            <div className="bm-tag">Tesis Sahipleri</div>
            <h2 className="bm-ttl">Tesisinizi <span>MyLoungers</span>&apos;a ekleyin</h2>
            <p className="bm-desc">Platformumuzla rezervasyonlarınızı kolayca yönetin.</p>
            <div className="bm-feats">
              <div className="bm-feat">
                <div className="bm-feat-ico">✓</div>
                <div><div className="bm-feat-ttl">Ücretsiz Kurulum</div><div className="bm-feat-desc">Sözleşme yok</div></div>
              </div>
              <div className="bm-feat">
                <div className="bm-feat-ico">✓</div>
                <div><div className="bm-feat-ttl">7/24 Destek</div><div className="bm-feat-desc">Her zaman yanınızdayız</div></div>
              </div>
            </div>
            <div className="bm-ref">
              <div className="bm-ref-stars">★★★★★</div>
              <p className="bm-ref-text">&quot;MyLoungers ile doluluk oranımız %40 arttı.&quot;</p>
              <div className="bm-ref-auth">
                <div className="bm-ref-av">ZK</div>
                <div><div className="bm-ref-name">Zeynep K.</div><div className="bm-ref-role">Tesis Sahibi</div></div>
              </div>
            </div>
            <div className="bm-trust">
              <div className="bm-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Ücretsiz Kurulum</div>
              <div className="bm-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>7/24 Destek</div>
              <div className="bm-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Sözleşme YOK</div>
            </div>
          </div>
          <div className="bm-right">
            <div className="bm-steps">
              <div className={`bm-step ${bmPane >= 1 ? "active" : ""} ${bmPane > 1 ? "done" : ""}`}><div className="bm-sn">{bmPane > 1 ? "✓" : "1"}</div><div className="bm-sl">İşletme</div></div>
              <div className={`bm-step ${bmPane >= 2 ? "active" : ""} ${bmPane > 2 ? "done" : ""}`}><div className="bm-sn">{bmPane > 2 ? "✓" : "2"}</div><div className="bm-sl">Tesis</div></div>
              <div className={`bm-step ${bmPane >= 3 ? "active" : ""}`}><div className="bm-sn">3</div><div className="bm-sl">İletişim</div></div>
            </div>
            <div className="bm-prog"><div className="bm-pb" style={{ width: bmPane === 1 ? "33%" : bmPane === 2 ? "66%" : "99%" }} /></div>
            {bmPane === 1 && (
              <div className="bm-pane on">
                <div className="bm-pttl">İşletme Bilgileri</div>
                <div className="bm-psub">Tesisiniz hakkında temel bilgileri girin.</div>
                <div className="bfg">
                  <label className="bfl">İşletme Adı *</label>
                  <div className="biw"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="1" /><path d="M16 22V12H8v10" /><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" /></svg><input className="bfi" type="text" placeholder="Örn: Zuzuu Beach Club" /></div>
                </div>
                <div className="bfg">
                  <label className="bfl">Tesis Türü *</label>
                  <div className="tgrid">
                    {["Hotel", "Beach Club", "Aqua Park", "Pansiyon", "Tatil Köyü", "Havuzlu Tesis"].map((t, i) => (
                      <button key={i} type="button" className={`tbtn ${i === 0 ? "sel" : ""}`}><span className="ti">{["🏨", "🏖️", "💦", "🏠", "🌴", "🏊"][i]}</span>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="bfg2">
                  <div><label className="bfl">Şehir *</label><select className="bfs"><option value="">Seçiniz</option><option>Bodrum</option><option>Antalya</option><option>Marmaris</option></select></div>
                  <div><label className="bfl">İlçe / Bölge</label><input className="bfi" type="text" placeholder="Örn: Yalıkavak" /></div>
                </div>
                <div className="bm-nav">
                  <div />
                  <button type="button" className="bm-next" onClick={() => setBmPane(2)}>Devam Et <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg></button>
                </div>
              </div>
            )}
            {bmPane === 2 && (
              <div className="bm-pane on">
                <div className="bm-pttl">Tesis Detayları</div>
                <div className="bm-psub">Kapasite ve özellikler hakkında bilgi verin.</div>
                <div className="bfg"><label className="bfl">Şezlong Kapasitesi: <span>50</span> adet</label><div className="cap-w"><input type="range" className="cap-s" min={5} max={500} defaultValue={50} step={5} /><div className="cap-v">50</div></div></div>
                <div className="bm-nav">
                  <button type="button" className="bm-prev" onClick={() => setBmPane(1)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg> Geri</button>
                  <button type="button" className="bm-next" onClick={() => setBmPane(3)}>Devam Et <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg></button>
                </div>
              </div>
            )}
            {bmPane === 3 && (
              <div className="bm-pane on">
                <div className="bm-pttl">İletişim Bilgileri</div>
                <div className="bm-psub">Sizi en kısa sürede arayalım.</div>
                <div className="bfg2">
                  <div><label className="bfl">Ad *</label><input className="bfi" type="text" placeholder="Adınız" /></div>
                  <div><label className="bfl">Soyad *</label><input className="bfi" type="text" placeholder="Soyadınız" /></div>
                </div>
                <div className="bfg"><label className="bfl">Telefon *</label><div className="biw"><input className="bfi" type="tel" placeholder="+90 5XX XXX XX XX" /></div></div>
                <div className="bfg"><label className="bfl">E-posta</label><div className="biw"><input className="bfi" type="email" placeholder="ornek@isletme.com" /></div></div>
                <div className="bm-nav" style={{ flexDirection: "column", gap: 7, alignItems: "stretch" }}>
                  <button type="button" className="bm-sub">🚀 Başvurumu Tamamla</button>
                  <button type="button" className="bm-prev" style={{ justifyContent: "center" }} onClick={() => setBmPane(2)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg> Geri</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
