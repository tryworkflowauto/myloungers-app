import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | MyLoungers",
  description:
    "MyLoungers gizlilik politikası — veri toplama, kullanım ve koruma ilkeleri.",
};

export default function GizlilikPage() {
  return (
    <LegalPageLayout title="Gizlilik Politikası">
      <h2>1. Amaç ve Kapsam</h2>
      <p className="mb-4 leading-relaxed">
        Bu Gizlilik Politikası, Reklamotv Bilişim Teknoloji Reklamcılık ve Organizasyon Hiz. San. ve
        Tic. Ltd. Şti. (&quot;My Loungers&quot;) tarafından yönetilen www.myloungers.com adresinde yer
        alan internet sitesi ve mobil uygulama kullanıcılarının gizliliğini koruma amacı taşır. Politika,
        kullanıcıların kişisel verilerinin işlenmesine ilişkin esasları, verilerin saklanma yöntemlerini,
        paylaşım koşullarını ve kullanıcıların sahip olduğu hakları kapsamaktadır.
      </p>

      <h2>2. Toplanan Veriler</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers tarafından toplanabilecek kişisel veri türleri şunlardır:
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>Kimlik Bilgileri:</strong> İsim, soyisim, T.C. Kimlik Numarası, doğum tarihi, cinsiyet.
        </li>
        <li>
          <strong>İletişim Bilgileri:</strong> Telefon numarası, e-posta adresi, fiziksel adres.
        </li>
        <li>
          <strong>Finansal Bilgiler:</strong> Ödeme bilgileri, fatura bilgileri.
        </li>
        <li>
          <strong>Kullanıcı İşlem Bilgileri:</strong> Rezervasyon ve sipariş detayları, işlem geçmişi.
        </li>
        <li>
          <strong>Çerez Bilgileri:</strong> IP adresi, cihaz bilgileri, kullanıcı tercihlerine ilişkin
          veriler.
        </li>
      </ul>

      <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
      <p className="mb-4 leading-relaxed">Kişisel veriler, aşağıdaki amaçlarla işlenmektedir:</p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>Hizmetlerin sunulması ve kullanıcı hesaplarının yönetimi</li>
        <li>Rezervasyon ve ödeme işlemlerinin gerçekleştirilmesi</li>
        <li>Kullanıcı memnuniyetinin artırılması ve platformun geliştirilmesi</li>
        <li>Hukuki ve idari yükümlülüklerin yerine getirilmesi</li>
        <li>Güvenlik önlemlerinin alınması ve dolandırıcılıkların önlenmesi</li>
        <li>
          Pazarlama faaliyetlerinin yürütülmesi ve kullanıcıların tercihlerine uygun teklifler
          sunulması
        </li>
      </ul>

      <h2>4. Veri Toplama Yöntemleri</h2>
      <p className="mb-4 leading-relaxed">Kişisel veriler aşağıdaki yöntemlerle toplanabilir:</p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>Kullanıcı tarafından sağlanan bilgiler:</strong> Üyelik oluşturulması, My
          Loungers&apos;ı kullanım sırasında sağlanan bilgiler.
        </li>
        <li>
          <strong>Otomatik yöntemler:</strong> Çerezler, log kayıtları ve cihaz bilgileri aracılığıyla
          toplanan veriler.
        </li>
        <li>
          <strong>Üçüncü taraflardan alınan veriler:</strong> Ödeme kuruluşları veya iş ortakları
          aracılığıyla alınan bilgiler.
        </li>
      </ul>

      <h2>5. Verilerin Paylaşımı</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers, kişisel verilerinizi yalnızca aşağıdaki koşullarda ve amaçlarla paylaşabilir:
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>İş Ortakları:</strong> Hizmetlerin ifası ve kullanıcı destek süreçlerinin yürütülmesi
          amacıyla.
        </li>
        <li>
          <strong>Yetkili Kamu Kurum ve Kuruluşları:</strong> Yasal yükümlülüklerin yerine getirilmesi
          amacıyla.
        </li>
        <li>
          <strong>Ödeme Kuruluşları:</strong> Kimlik doğrulama ve ödeme işlemlerinin güvenli bir şekilde
          gerçekleştirilmesi amacıyla.
        </li>
        <li>
          <strong>Hizmet Sağlayıcılar:</strong> Veri depolama, güvenlik ve analiz hizmetleri sağlanması
          amacıyla.
        </li>
      </ul>

      <h2>6. Kişisel Verilerin Saklanma Süresi</h2>
      <p className="mb-4 leading-relaxed">
        Kişisel veriler, işlendikleri amaç doğrultusunda gerekli olan süre boyunca saklanır. Süre sonunda
        veriler, yasal düzenlemelere uygun şekilde silinir, yok edilir veya anonim hale getirilir. Yasal
        zorunluluk durumunda, zamanaşımı süresi boyunca veriler saklanabilir.
      </p>

      <h2>7. Çerezler</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers, kullanıcı deneyimini iyileştirmek, platformun güvenliğini sağlamak ve
        kişiselleştirilmiş hizmetler sunmak amacıyla çerezlerden yararlanır. Kullanıcılar, tarayıcı
        ayarlarını değiştirerek çerezlerin kullanımını sınırlayabilir veya devre dışı bırakabilir. Çerez
        kullanımına ilişkin detaylar Çerez Politikası bölümümüzde yer almaktadır.
      </p>

      <h2>8. Veri Güvenliği Önlemleri</h2>
      <p className="mb-4 leading-relaxed">
        Kişisel verilerinizin gizliliğini ve güvenliğini korumak için gerekli tüm teknik ve idari
        önlemler alınmaktadır.
      </p>

      <h2>9. Mobil Uygulama İzinleri</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers mobil uygulaması, hizmetin sağlanabilmesi için aşağıdaki cihaz izinlerini talep
        edebilir:
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>Konum (Location):</strong> Yakınınızdaki tesisleri göstermek ve harita üzerinde konum
          bazlı arama yapabilmek için kullanılır. Bu izni reddedebilirsiniz; manuel bölge seçimi ile arama
          çalışmaya devam eder.
        </li>
        <li>
          <strong>Bildirimler (Notifications):</strong> Rezervasyon onayı, hatırlatma, ödeme
          bilgilendirmesi ve hizmete dair güncellemeleri iletmek için kullanılır. Bu izni
          reddedebilirsiniz.
        </li>
        <li>
          <strong>Kamera ve Galeri:</strong> Profil fotoğrafı yüklemek ve yorum süreçlerinde görsel
          paylaşımı yapabilmek için kullanılır. Bu izni reddedebilirsiniz.
        </li>
        <li>
          <strong>İnternet Erişimi:</strong> Uygulamanın temel fonksiyonlarının çalışması için
          zorunludur.
        </li>
      </ul>
      <p className="mb-4 leading-relaxed">
        Verilen izinler, cihaz ayarları (iOS Ayarlar / Android Ayarlar) üzerinden istediğiniz zaman geri
        çekilebilir veya değiştirilebilir.
      </p>

      <h2>10. Üçüncü Taraf Servisler</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers, hizmetin sağlanabilmesi için aşağıdaki üçüncü taraf servislerini kullanmaktadır. Bu
        servisler, kendi gizlilik politikaları çerçevesinde veri işlemektedir:
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>Apple Sign-In:</strong> Apple kullanıcılarının kimlik doğrulaması için kullanılır.
          Apple, e-posta adresini gizleme seçeneği sunar.
        </li>
        <li>
          <strong>Google Sign-In:</strong> Google kullanıcılarının kimlik doğrulaması için kullanılır.
        </li>
        <li>
          <strong>Supabase (Frankfurt, Almanya):</strong> Kullanıcı verilerinin güvenli şekilde
          depolanması ve kimlik doğrulama hizmeti için kullanılır. AB veri merkezinde saklanır.
        </li>
        <li>
          <strong>Paratika (Asseco SEE):</strong> Ödeme işlemlerinin güvenli şekilde gerçekleştirilmesi
          için kullanılır. PCI-DSS standartlarına uygundur.
        </li>
      </ul>
      <p className="mb-4 leading-relaxed">
        My Loungers, üçüncü taraf servislerin gizlilik uygulamalarından sorumlu değildir. Bu servislerin
        gizlilik politikalarını ayrıca incelemeniz önerilir.
      </p>

      <h2>11. Çocukların Korunması (18 Yaş Altı)</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers, 18 yaşın altındaki kişilere yönelik bir hizmet sunmamakta ve 18 yaş altı
        kullanıcılardan bilerek kişisel veri toplamamaktadır. Platforma kayıt olurken kullanıcı, 18
        yaşını doldurmuş olduğunu beyan eder.
      </p>
      <p className="mb-4 leading-relaxed">
        18 yaşın altında olduğu tespit edilen kullanıcı hesapları derhal kapatılır ve bu hesaplara ait
        kişisel veriler ilgili mevzuat çerçevesinde silinir, yok edilir veya anonim hale getirilir.
      </p>
      <p className="mb-4 leading-relaxed">
        18 yaşın altındaki bir çocuğa ait kişisel verilerin platformumuzda yer aldığını düşünüyorsanız
        info@myloungers.com adresine başvurabilirsiniz. Bildirim üzerine ilgili veriler en geç 7 iş günü
        içerisinde imha edilir.
      </p>

      <h2>12. Hesap Silme ve Verilerin İmhası</h2>
      <p className="mb-4 leading-relaxed">
        Kullanıcılar, My Loungers hesaplarını ve hesaplarına bağlı tüm kişisel verilerin silinmesini
        istedikleri zaman talep edebilir.
      </p>
      <p className="mb-4 leading-relaxed">
        <strong>Hesap silme talebi şu şekilde yapılabilir:</strong>
      </p>
      <ol className="list-decimal list-inside ml-4 my-3 space-y-2">
        <li>
          Kayıtlı e-posta adresinizden info@myloungers.com adresine &quot;Hesap Silme Talebi&quot;
          konulu bir e-posta gönderilmesi.
        </li>
        <li>
          Talebin alınmasını takiben en geç 7 iş günü içerisinde hesabınız ve hesabınıza bağlı tüm veriler
          (profil bilgileri, rezervasyonlar, yorumlar ve sair kişisel veriler) kalıcı olarak silinir.
        </li>
        <li>Silme işlemi tamamlandığında kullanıcıya teyit e-postası gönderilir.</li>
      </ol>
      <p className="mb-4 leading-relaxed">
        Yasal saklama yükümlülüğü bulunan veriler (fatura, ödeme kayıtları, vergi mevzuatı kapsamındaki
        belgeler vb.), Türk vergi mevzuatı ve diğer ilgili mevzuat hükümleri çerçevesinde belirlenen
        sürelerle (10 yıla kadar) saklanmaya devam eder. Bu süre sonunda söz konusu veriler de imha
        edilir.
      </p>

      <h2>13. Kullanıcı Hakları</h2>
      <p className="mb-4 leading-relaxed">
        Kullanıcılar, 6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun 11. maddesi kapsamında;
        kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme,
        verilerinin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, kişisel
        verilerinin yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, kişisel verilerinin
        eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme, kişisel verilerinin
        kanunda öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme, kişisel verilerinin
        düzeltilmesi, silinmesi veya yok edilmesi hâlinde bu işlemlerin kişisel verilerinin aktarıldığı
        üçüncü kişilere bildirilmesini isteme, işlenen verilerin münhasıran otomatik sistemler vasıtasıyla
        analiz edilmesi suretiyle kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme ve kişisel
        verilerinin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini
        talep etme haklarına sahiptir.
      </p>

      <h2>14. Politika Güncellemeleri</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers, bu Gizlilik Politikasını her zaman değiştirme hakkını saklı tutar. Güncellemeler,
        platform üzerinde yayınlandığı tarihten itibaren geçerlilik kazanır.
      </p>

      <h2>15. İletişim Bilgileri</h2>
      <p className="mb-4 leading-relaxed">
        Kişisel verilerinizin işlenmesiyle ilgili talepleriniz ve sorularınız için bizimle iletişime
        geçebilirsiniz:
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>E-posta:</strong> info@myloungers.com
        </li>
        <li>
          <strong>Posta Adresi:</strong> Esentepe Mah. Akademiyolu Sok. No:10B/B01 Serdivan/Sakarya
        </li>
        <li>
          <strong>Web:</strong> www.myloungers.com
        </li>
      </ul>

      <h2>16. Üçüncü Taraf Bağlantıları</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers platformunda yer alan üçüncü taraf sitelere yapılan yönlendirmeler, ilgili sitelerin
        kendi gizlilik politikaları tarafından düzenlenir. Bu sitelerin gizlilik uygulamaları üzerinde My
        Loungers&apos;ın herhangi bir sorumluluğu bulunmamaktadır.
      </p>

      <h2>17. Yasal Uyum ve Uyuşmazlıkların Çözümü</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers, tüm faaliyetlerinde yürürlükteki mevzuata uyum göstermeyi taahhüt eder. İşbu
        Gizlilik Politikasından doğabilecek uyuşmazlıklar, Türk hukuku çerçevesinde Sakarya Mahkemeleri
        ve İcra Daireleri tarafından çözümlenecektir.
      </p>
    </LegalPageLayout>
  );
}
