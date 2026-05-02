import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Çerez Politikası | MyLoungers",
  description:
    "MyLoungers çerez politikası — çerez türleri, kullanım amaçları ve tercihleriniz.",
};

export default function CerezPolitikasiPage() {
  return (
    <LegalPageLayout title="Çerez Politikası">
      <p className="mb-4 leading-relaxed">
        My Loungers olarak www.myloungers.com internet sitesi ve mobil uygulamamız içerisinde yer alan
        bazı alanlarda çerezler kullanmaktayız. Bu Çerez Politikası, Reklamotv Bilişim Teknoloji
        Reklamcılık ve Organizasyon Hiz. San. ve Tic. Ltd. Şti. tarafından yönetilen işbu site için
        geçerli olup çerezler; siteyi ziyaretiniz sırasında politikada açıklanan şekilde kullanılacaktır.
      </p>

      <h2>1. Çerez Nedir</h2>
      <p className="mb-4 leading-relaxed">
        Çerezler, www.myloungers.com tarafından cihazınızda saklanan küçük metin dosyalarıdır ve siteye
        erişim sağladığınız tarayıcıda tutulur. Bu dosyalar, sitemizi ziyaret ettiğinizde bilgilerinizi
        hatırlamak ve deneyiminizi kişiselleştirip memnuniyetinizi artırmak için kullanılır. Çerezler,
        kullanıcı tercihlerini kaydetmek ve cihazınızı tanımak gibi temel işlevler sunar. Bu nedenle,
        çerezler sitemizin düzgün çalışabilmesi ve size daha iyi bir hizmet sunulabilmesi için
        gereklidir.
      </p>

      <h2>2. Çerez Türleri ve Açıklamaları</h2>
      <ol className="list-decimal list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>Oturum Çerezleri:</strong> Siteyi kullanımınız sırasında geçerlidir ve tarayıcı
          kapatılana kadar aktif kalır.
        </li>
        <li>
          <strong>Kalıcı Çerezler:</strong> Tarayıcınıza kaydedilen bu çerezler, silinene kadar veya
          belirlenen tarihe kadar geçerlidir.
        </li>
        <li>
          <strong>Birinci Taraf Çerezleri:</strong> Site tarafından oluşturulur ve sadece site tarafından
          okunabilir. Oturum veya kalıcı çerez olabilir.
        </li>
        <li>
          <strong>Üçüncü Taraf Çerezleri:</strong> Platformlar üzerinden sağlanan içeriklerin
          çerezleridir. Genellikle kalıcıdırlar ve üçüncü taraf hizmet sağlayıcıları tarafından
          kullanılır.
        </li>
      </ol>

      <h2>3. Çerezlerin Kullanım Amaçları</h2>
      <p className="mb-4 leading-relaxed">
        <strong>Zorunlu Çerezler:</strong> Bu çerezler, www.myloungers.com&apos;un düzgün çalışabilmesi ve
        sunduğu hizmetlerden faydalanabilmeniz için zorunlu çerezlerdir, site kullanımı için olmazsa
        olmazdır. Kişisel veriler bu çerezler aracılığıyla kesinlikle işlenmemektedir.
      </p>
      <p className="mb-4 leading-relaxed">
        <strong>Performans Çerezleri:</strong> Site performansını ölçmek ve geliştirmek amacıyla
        ziyaretçilerimizin internet sitemizin içerisinde hangi sayfalarda zaman geçirdiklerini görmemize
        yardımcı olur. Toplanan bilgiler anonim olup, sadece siteyi iyileştirmek amacıyla kullanılır.
      </p>
      <p className="mb-4 leading-relaxed">
        <strong>İşlevsellik Çerezleri:</strong> Kullanıcıların dil ve bölge tercihleri gibi
        kişiselleştirilmiş ayarlarını hatırlamak için kullanılır. Bu çerezlerin devre dışı bırakılması
        durumunda, kişiselleştirilmiş ayarlar kaydedilemez.
      </p>
      <p className="mb-4 leading-relaxed">
        <strong>Hedefleme Çerezleri:</strong> www.myloungers.com ve üçüncü taraf sitelerdeki ziyaretleriniz
        sırasında oluşturulur. Tıklama ve ziyaret geçmişinizi izlemek, profil oluşturmak, reklam ve
        pazarlama stratejileri geliştirmek amacıyla kullanılır.
      </p>
      <p className="mb-4 leading-relaxed">
        Bu çerezlerin kullanımı esnasında gerçekleştirdiğimiz veri işleme faaliyetleri için KVKK Madde 5
        kapsamında &quot;İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri
        sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması&quot; hükmüne
        dayanmaktayız.
      </p>

      <h2>4. Platformda Kullanılan Çerezler</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers platformunda kullanılan çerezler ve bu çerezlerin amaçları aşağıdaki tabloda
        detaylandırılmıştır:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 dark:border-gray-700 bg-[#0ABAB5] text-white px-3 py-2 text-left font-semibold">
                Çerez Adı / Kaynak
              </th>
              <th className="border border-gray-300 dark:border-gray-700 bg-[#0ABAB5] text-white px-3 py-2 text-left font-semibold">
                Amacı
              </th>
              <th className="border border-gray-300 dark:border-gray-700 bg-[#0ABAB5] text-white px-3 py-2 text-left font-semibold">
                Türü
              </th>
              <th className="border border-gray-300 dark:border-gray-700 bg-[#0ABAB5] text-white px-3 py-2 text-left font-semibold">
                Süre
              </th>
              <th className="border border-gray-300 dark:border-gray-700 bg-[#0ABAB5] text-white px-3 py-2 text-left font-semibold">
                Zorunlu
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Supabase Auth Token
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Kullanıcı kimlik doğrulaması ve oturum yönetimi
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Birinci Taraf / Zorunlu
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Oturum + 30 gün
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">Evet</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                session_id
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Site içi gezinme sırasında oturum sürekliliği
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Birinci Taraf / Zorunlu
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">Oturum</td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">Evet</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                language / locale
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Dil tercihinin (TR / EN) hatırlanması
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Birinci Taraf / İşlevsel
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">1 yıl</td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">Hayır</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                cookie_consent
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Çerez tercihlerinizin hatırlanması
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Birinci Taraf / Zorunlu
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">1 yıl</td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">Evet</td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Paratika Ödeme Çerezleri
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Ödeme işlemlerinin güvenli gerçekleştirilmesi
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Üçüncü Taraf / Zorunlu
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">Oturum</td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Evet (ödeme anında)
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Apple / Google Sign-In Çerezleri
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Apple ve Google ile giriş kimlik doğrulaması
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Üçüncü Taraf / Zorunlu
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">Oturum</td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Evet (giriş anında)
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Performans / Analitik Çerezleri
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Site kullanım istatistikleri ve performans iyileştirme
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                Birinci Taraf / Performans
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">
                2 yıla kadar
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 align-top">Hayır</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mb-4 leading-relaxed">
        Yukarıdaki çerezlerin yanı sıra, üçüncü taraf hizmet sağlayıcılar (ödeme işlemleri için
        Paratika, kimlik doğrulama için Apple Sign-In ve Google Sign-In) tarafından kendi politikaları
        çerçevesinde çerezler yerleştirilebilir. Bu çerezlerin kontrolü ve yönetimi ilgili üçüncü taraf
        hizmet sağlayıcılara aittir.
      </p>

      <h2>5. Çerez Yönetimi ve Çerez Yönetiminin Sınırlandırılması</h2>
      <p className="mb-4 leading-relaxed">
        Tarayıcılar genellikle çerezleri otomatik olarak kabul eder. www.myloungers.com&apos;u
        kullanabilmek için çerezlerin kullanımı zorunlu değildir, ancak tarayıcınızı çerezleri kabul
        etmeyecek şekilde ayarlamanız durumunda kullanıcı deneyiminiz olumsuz etkilenebilir ve sitemizin
        bazı işlevleri düzgün çalışmayabilir.
      </p>
      <p className="mb-4 leading-relaxed">
        Tarayıcınızı; tüm siteler veya belirli siteler için çerezleri engelleyecek, çerez oluşturulduğunda
        uyarı verecek, üçüncü taraf çerezleri engelleyecek veya tüm çerezleri oturum çerezi gibi kabul
        edecek şekilde ayarlayabilirsiniz. Ayrıca tarayıcınızda saklanan çerezleri silebilir veya bunların
        listesini ve içeriklerini görüntüleyebilirsiniz.
      </p>
      <p className="mb-4 leading-relaxed">
        <strong>Popüler tarayıcılarda çerez yönetimi:</strong>
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>Google Chrome:</strong> support.google.com/chrome
        </li>
        <li>
          <strong>Mozilla Firefox:</strong> support.mozilla.org
        </li>
        <li>
          <strong>Safari:</strong> support.apple.com
        </li>
        <li>
          <strong>Microsoft Edge:</strong> support.microsoft.com
        </li>
      </ul>

      <h2>6. Mobil Uygulamada Çerez ve Benzeri Teknolojiler</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers mobil uygulamasında, web tarayıcı çerezleri yerine cihaz hafızasında saklanan benzer
        teknolojiler (local storage, secure storage, oturum tokenları) kullanılmaktadır. Bu teknolojiler,
        kullanıcı oturumunun sürdürülmesi, tercih ayarlarının (dil seçimi vb.) hatırlanması ve uygulamanın
        doğru çalışması için gereklidir.
      </p>
      <p className="mb-4 leading-relaxed">
        Mobil uygulama içinde saklanan veriler, uygulama silindiğinde veya cihaz ayarlarından uygulama
        verileri temizlendiğinde otomatik olarak silinir.
      </p>

      <h2>7. Çerezlerin Aktarılması</h2>
      <p className="mb-4 leading-relaxed">
        Çerezler kapsamında işlenen verileriniz, www.myloungers.com hizmetlerinin size özelleştirilerek
        sunulması, pazarlama faaliyetlerinin yürütülmesi, iş süreçlerinin takibi ve denetimi, mal/hizmet
        satın alma süreçlerinin yürütülmesi gibi amaçlarla kullanılabilir.
      </p>
      <p className="mb-4 leading-relaxed">
        Bu metni onaylayan kullanıcılar, çerezlerle elde edilen verilerin belirtilen kapsam ve şartlar
        dahilinde üçüncü kişilerle paylaşılacağını kabul eder.
      </p>

      <h2>8. Çerezlerin Saklama Süreleri</h2>
      <p className="mb-4 leading-relaxed">Çerezler türlerine göre farklı sürelerde saklanır:</p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>Oturum çerezleri:</strong> Tarayıcı kapatıldığında otomatik olarak silinir.
        </li>
        <li>
          <strong>Kalıcı çerezler:</strong> Belirlenen geçerlilik süresi sonunda veya kullanıcı tarafından
          manuel olarak silinene kadar saklanır.
        </li>
        <li>
          <strong>Kimlik doğrulama çerezleri:</strong> Oturum aktif olduğu sürece ve en fazla 30 gün
          boyunca saklanır.
        </li>
        <li>
          <strong>Tercih çerezleri:</strong> 1 yıla kadar saklanabilir.
        </li>
        <li>
          <strong>Performans/analitik çerezleri:</strong> 2 yıla kadar saklanabilir.
        </li>
      </ul>
      <p className="mb-4 leading-relaxed">
        Saklama süresi sona eren çerezler otomatik olarak silinir veya tekrar oluşturulmaz.
      </p>

      <h2>9. Politika Güncellemeleri</h2>
      <p className="mb-4 leading-relaxed">
        www.myloungers.com işbu çerez politikasını değiştirme hakkını saklı tutar. Yapılan değişiklikler,
        platform üzerinde yayınlandığı tarihten itibaren geçerlilik kazanır. Önemli değişiklikler
        kullanıcılara ayrıca bildirilir.
      </p>

      <h2>10. İletişim Bilgileri</h2>
      <p className="mb-4 leading-relaxed">
        Çerez politikasına ilişkin soru, talep ve şikayetleriniz için bizimle iletişime geçebilirsiniz:
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>E-posta:</strong> info@myloungers.com
        </li>
        <li>
          <strong>Posta Adresi:</strong> Esentepe Mah. Akademiyolu Sok. Teknoloji Geliştirme Bölgesi
          No:10B/B01 Serdivan/SAKARYA
        </li>
        <li>
          <strong>Web:</strong> www.myloungers.com
        </li>
      </ul>
    </LegalPageLayout>
  );
}
