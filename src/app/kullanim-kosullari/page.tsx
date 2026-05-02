import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Kullanıcı Üyelik Sözleşmesi | MyLoungers",
  description:
    "MyLoungers kullanıcı üyelik sözleşmesi — platform kullanım şartları ve yükümlülükler.",
};

export default function KullanimKosullariPage() {
  return (
    <LegalPageLayout title="Kullanıcı Üyelik Sözleşmesi">
      <p className="mb-4 leading-relaxed">
        My Loungers&apos;a kaydolmadan önce Kullanıcı Üyelik Sözleşmesi&apos;ni dikkatlice okumanız
        gerekmektedir. Sitemize veya uygulamamıza kaydolmanız halinde, Kullanıcı Üyelik
        Sözleşmesi&apos;nde belirtilen şartları peşinen kabul etmiş ve site kurallarına uymayı taahhüt
        etmiş sayılacaksınız.
      </p>
      <p className="mb-4 leading-relaxed">
        My Loungers platformuna kaydolan her kullanıcı, aşağıda belirtilen şartları okuyup kabul
        etmiş sayılmaktadır. Bu hizmet, Reklamotv Bilişim Teknoloji Reklamcılık ve Organizasyon Hiz.
        San. ve Tic. Ltd. Şti. tarafından sağlanan, işletmeler ile şahısları buluşturmayı amaçlayan bir
        aracılık hizmetidir.
      </p>

      <h2>1. Madde - Taraflar ve Tanımlar</h2>
      <h3>1.1. Taraflar</h3>
      <p className="mb-4 leading-relaxed">
        Bu sözleşme, bir tarafta Reklamotv Bilişim Teknoloji Reklamcılık ve Organizasyon Hiz. San. ve
        Tic. Ltd. Şti. (&quot;Şirket&quot;), diğer tarafta My Loungers web sitesi veya mobil uygulamasını
        (&quot;Platform&quot;) kullanan bireysel kullanıcı (&quot;Kullanıcı&quot;) arasında akdedilmiştir.
      </p>
      <p className="mb-4 leading-relaxed">
        <strong>Şirket:</strong>
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>Vergi Dairesi:</strong> Gümrükönü Vergi Dairesi Müdürlüğü
        </li>
        <li>
          <strong>Vergi Kimlik Numarası (VKN):</strong> 7340777763
        </li>
        <li>
          <strong>Adres:</strong> Esentepe Mah. Akademiyolu Sok. Teknoloji Geliştirme Bölgesi No:10B/B01
          Serdivan/SAKARYA
        </li>
        <li>
          <strong>E-posta:</strong> info@myloungers.com
        </li>
      </ul>
      <p className="mb-4 leading-relaxed">
        <strong>Kullanıcı:</strong> herhangi bir elektronik ortam veya mobil cihaz üzerinden My
        Loungers platformuna kaydolan gerçek kişiyi ifade eder. Kullanıcı, platform üzerinden şezlong
        rezervasyonu yapabilir, işletmelerin menülerinden yiyecek ve içecek siparişi verebilir ve bakiye
        yükleyerek bu hizmetlerden faydalanabilir.
      </p>

      <h3>1.2. Tanımlar</h3>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>Platform:</strong> My Loungers adı altında faaliyet gösteren, işletmeler ile bireysel
          kullanıcıları buluşturarak şezlong rezervasyonu, yiyecek ve içecek siparişleri için aracılık
          yapan çevrimiçi hizmet platformu.
        </li>
        <li>
          <strong>Kullanıcı:</strong> Platforma üye olarak şezlong rezervasyonu yapan, yiyecek-içecek
          hizmetlerinden yararlanan gerçek kişi.
        </li>
        <li>
          <strong>İşletme:</strong> Platform üzerinden şezlong rezervasyonu yapılabilen otel, beach club
          ve benzeri ticari işletmeler.
        </li>
        <li>
          <strong>Rezervasyon:</strong> Kullanıcı tarafından Platform aracılığıyla bir şezlong veya
          hizmetin belirli bir tarih ve saat için ayırtılması işlemi.
        </li>
        <li>
          <strong>Sipariş:</strong> Kullanıcı tarafından işletmenin menü sekmesi aracılığıyla verilen
          yiyecek ve/veya içecek siparişleri.
        </li>
        <li>
          <strong>Bakiye:</strong> Kullanıcının Platform üzerinde gerçekleştireceği ödemeler için siteye
          yüklediği ön ödemeli miktar.
        </li>
        <li>
          <strong>Komisyon:</strong> Platform tarafından, işletmelerden alınan %7 oranındaki hizmet
          bedeli.
        </li>
        <li>
          <strong>Ödeme Sağlayıcısı:</strong> Paratika Elektronik Ödeme ve Dağıtım Hizmetleri A.Ş.
        </li>
      </ul>

      <h2>2. Madde - Sözleşmenin Amacı ve Kapsamı</h2>
      <h3>2.1. Sözleşmenin Amacı</h3>
      <p className="mb-4 leading-relaxed">
        Bu sözleşme, My Loungers platformuna üye olan kullanıcılar ile Şirket arasında, platform
        aracılığıyla sunulan aracılık hizmetlerinin kullanımına ilişkin tarafların hak ve
        yükümlülüklerini düzenlemeyi amaçlar.
      </p>
      <h3>2.2. Sözleşmenin Kapsamı</h3>
      <p className="mb-4 leading-relaxed">
        Kullanıcıların My Loungers platformu aracılığıyla, işletmeler tarafından sunulan şezlong
        rezervasyonu ve yiyecek-içecek siparişi hizmetlerini satın almaları için gerekli koşullar
        düzenlenir. Platformun, yalnızca kullanıcılar ve işletmeler arasında bir aracılık hizmeti
        sunduğu, hizmetin ifasından doğrudan sorumlu olmadığı belirtilir.
      </p>
      <h3>2.3. Yasal Dayanak</h3>
      <p className="mb-4 leading-relaxed">
        Bu sözleşme, Tüketicinin Korunması Hakkında Kanun, Mesafeli Sözleşmeler Yönetmeliği, Türk Borçlar
        Kanunu ve ilgili diğer mevzuat hükümleri çerçevesinde hazırlanmıştır.
      </p>

      <h2>3. Madde - Kullanıcı Kaydı ve Üyelik Koşulları</h2>
      <h3>3.1. Kayıt Süreci</h3>
      <p className="mb-4 leading-relaxed">
        Kullanıcıların My Loungers platformunu kullanabilmesi için platforma üye olmaları zorunludur.
        Kullanıcı, isim ve soyisim, geçerli bir e-posta adresi, telefon numarası ve belirlenmiş bir şifre
        bilgilerini doğru ve eksiksiz girmesi gerekir. Kullanıcı, dilerse Apple Sign-In veya Google
        Sign-In hizmetleri aracılığıyla da platforma kayıt olabilir.
      </p>
      <h3>3.2. Doğrulama Süreci</h3>
      <p className="mb-4 leading-relaxed">
        Kayıt işleminin tamamlanabilmesi için, e-posta adresine bir doğrulama bağlantısı, telefon
        numarasına ise bir doğrulama kodu gönderilir. Kullanıcı, her iki doğrulamayı başarıyla tamamladıktan
        sonra üyelik işlemi tamamlanır.
      </p>
      <h3>3.3. Kullanıcı Bilgilerinin Doğruluğu</h3>
      <p className="mb-4 leading-relaxed">
        Kullanıcı, kayıt esnasında verdiği tüm bilgilerin doğru, eksiksiz ve güncel olduğunu taahhüt eder.
        Şirket, verilen bilgilerin yanlış veya eksik olması durumunda kullanıcı üyeliğini iptal etme veya
        askıya alma hakkını saklı tutar.
      </p>
      <h3>3.4. Üyelik Hesabının Güvenliği</h3>
      <p className="mb-4 leading-relaxed">
        Kullanıcı, üyelik sırasında oluşturduğu şifrenin gizliliğini korumakla yükümlüdür. Kullanıcı
        hesabının izinsiz kullanımından doğabilecek her türlü zarar ve kayıptan kullanıcı sorumlu olup,
        Şirket bu durumlardan sorumlu tutulamaz.
      </p>
      <h3>3.5. Üyelik Koşulları</h3>
      <p className="mb-4 leading-relaxed">
        Kullanıcı, platforma üye olurken ve üyeliği süresince yasal olarak platforma üye olabilecek reşit
        yaşta (18 yaş ve üzeri) olduğunu, platformda belirtilen kurallara, yasalara ve sözleşmelere
        uygun hareket edeceğini kabul eder.
      </p>
      <p className="mb-4 leading-relaxed">
        Platform, 18 yaşın altındaki kişilere yönelik bir hizmet sunmamakta ve 18 yaş altı kullanıcılardan
        bilerek kişisel veri toplamamaktadır. 18 yaşın altında olduğu tespit edilen kullanıcı hesapları
        derhal kapatılır ve bu hesaplara ait veriler silinir.
      </p>
      <h3>3.6. Üyelik İptali ve Hesap Silme</h3>
      <p className="mb-4 leading-relaxed">
        Kullanıcı, istediği zaman üyelik hesabını iptal etme ve kendisine ait tüm kişisel verilerin
        silinmesini talep etme hakkına sahiptir.
      </p>
      <p className="mb-4 leading-relaxed">
        <strong>Hesap silme talebi şu şekilde yapılabilir:</strong>
      </p>
      <ol className="list-decimal list-inside ml-4 my-3 space-y-2">
        <li>
          Kayıtlı e-posta adresinizden info@myloungers.com adresine &quot;Hesap Silme Talebi&quot; konulu
          bir e-posta gönderilmesi.
        </li>
        <li>
          Talebin alınmasını takiben en geç 7 iş günü içerisinde hesabınız ve hesabınıza bağlı tüm veriler
          kalıcı olarak silinir.
        </li>
        <li>Silme işlemi tamamlandığında kullanıcıya teyit e-postası gönderilir.</li>
      </ol>
      <p className="mb-4 leading-relaxed">
        Yasal saklama yükümlülüğü bulunan veriler (fatura, ödeme kayıtları vb.), Türk vergi mevzuatı
        çerçevesinde belirlenen süreyle (10 yıla kadar) saklanmaya devam eder.
      </p>

      <h2>4. Madde - Platformun Rolü ve Sorumlulukları</h2>
      <h3>4.1. Platformun Rolü</h3>
      <p className="mb-4 leading-relaxed">
        My Loungers platformu, kullanıcılar ile otel, beach club ve benzeri işletmeler arasında şezlong
        rezervasyonu ve yiyecek-içecek siparişlerinin gerçekleştirilmesi amacıyla aracılık hizmeti sunan
        bir platformdur. Şirket, yalnızca bu hizmetlerin sağlanmasına yönelik olarak işletmeler ile
        kullanıcıları bir araya getiren bir aracı konumundadır.
      </p>
      <h3>4.2. Platformun Sorumluluk Sınırları</h3>
      <p className="mb-4 leading-relaxed">
        Platform, işletmelerin sunduğu hizmetlerin kalitesinden, doğruluğundan veya ifasından doğrudan
        sorumlu değildir. İşletme ile kullanıcı arasında doğabilecek uyuşmazlıklardan münhasıran taraflar
        sorumludur. Platform, kullanıcıların yapmış olduğu rezervasyon veya siparişlerde yanlış bilgi
        girişi, gecikme, iptal veya eksik işlem gibi durumlardan kaynaklanan zararlardan sorumlu
        tutulamaz.
      </p>
      <p className="mb-4 leading-relaxed">
        Ödeme işlemleri, Paratika Elektronik Ödeme ve Dağıtım Hizmetleri A.Ş. aracılığıyla
        gerçekleştirilir. Ödeme süreçlerinde meydana gelebilecek teknik aksaklıklar veya gecikmelerde,
        kullanıcı, doğrudan Ödeme Sağlayıcı ile iletişim kurmakla yükümlüdür.
      </p>
      <h3>4.3. Şirketin Yetkileri</h3>
      <p className="mb-4 leading-relaxed">
        Şirket, kullanıcı veya işletme tarafından sözleşmeye aykırı bir durum tespit edilmesi halinde
        ilgili hesabı geçici olarak askıya alma veya kalıcı olarak kapatma hakkını saklı tutar.
        Platformda yer alan içeriklerin (fiyat, menü, şezlong durumu vb.) doğruluğu ve güncelliği
        işletmelerin sorumluluğundadır.
      </p>
      <h3>4.4. Bağımsız Taraflar</h3>
      <p className="mb-4 leading-relaxed">
        Platformda yer alan tüm işlemler kullanıcı ile işletme arasında gerçekleştirilir. Şirket, bu
        işlemlerin tarafı olmayıp, yalnızca teknik altyapı ve aracılık hizmeti sunmaktadır.
      </p>

      <h2>5. Madde - Kullanıcı Hak ve Yükümlülükleri</h2>
      <h3>5.1. Kullanıcı Hakları</h3>
      <p className="mb-4 leading-relaxed">
        Kullanıcı, My Loungers platformuna kaydolduktan sonra platformda işletmeler tarafından sunulan
        hizmetlerden gerekli ücretlendirmeleri karşılayarak faydalanma hakkına sahiptir. Kullanıcı, KVKK
        kapsamında, platformda işlenen kişisel verilerine ilişkin bilgilendirilme, düzeltilme ve silinme
        haklarını kullanabilir.
      </p>
      <h3>5.2. Kullanıcı Yükümlülükleri</h3>
      <p className="mb-4 leading-relaxed">
        Kullanıcı, platforma kaydolurken verdiği tüm bilgilerin doğru, güncel ve eksiksiz olduğunu taahhüt
        eder. Yanlış veya eksik bilgi verilmesi durumunda doğacak tüm zararlardan kullanıcı sorumlu
        olacaktır. Kullanıcı, platformda kullandığı hesabının şifresini ve erişim bilgilerini gizli
        tutmakla yükümlüdür.
      </p>
      <p className="mb-4 leading-relaxed">
        Platformun kullanım koşulu olarak kullanıcıların 18 yaşından büyük olması gerekmektedir.
        Kullanıcı, platformda sunulan hizmetleri yalnızca kişisel kullanım amacıyla kullanmayı kabul eder
        ve platform üzerinden ticari faaliyet yürütmeyeceğini taahhüt eder.
      </p>
      <h3>5.3. Kullanıcı Davranış Politikası</h3>
      <p className="mb-4 leading-relaxed">
        Kullanıcı, platformu kullanırken yürürlükteki tüm yasalara, mevzuata ve platform kurallarına uygun
        davranmayı kabul eder. Diğer kullanıcılar ve işletmelerle olan etkileşimlerinde saygılı ve dürüst
        davranır. Hakaret, tehdit, rahatsız edici veya yasadışı içerik barındıran iletişimlerde bulunmamayı
        kabul eder.
      </p>

      <h2>6. Madde - Bakiye Yükleme ve Kullanım Koşulları</h2>
      <p className="mb-4 leading-relaxed">
        Kullanıcı, My Loungers platformunda sunulan hizmetlerden faydalanabilmek için platform üzerinden
        bakiye yükleyebilir. Bakiye yükleme işlemi, yalnızca kullanıcının kendisine ait veya yasal olarak
        kullanım hakkına sahip olduğu ödeme araçları ile yapılabilir.
      </p>
      <p className="mb-4 leading-relaxed">
        Ödeme işlemleri, Paratika Elektronik Ödeme ve Dağıtım Hizmetleri A.Ş. aracılığıyla güvenli bir
        şekilde gerçekleştirilir. Kullanıcı tarafından platforma yüklenen bakiye, yalnızca platformda
        sunulan hizmetler için kullanılabilir ve nakit olarak iade edilmez. Mesafeli Sözleşmeler
        Yönetmeliği&apos;nin 15. maddesi uyarınca, bakiye yükleme işlemi cayma hakkı kapsamında değildir.
      </p>
      <p className="mb-4 leading-relaxed">
        Yüklenen bakiyenin kullanım süresi, platformda belirtilen hizmetlerin süresi ile sınırlıdır.
        Belirlenen süreler dahilinde kullanılmayan bakiye, platform politikaları kapsamında geçerliliğini
        yitirebilir.
      </p>

      <h2>7. Madde - Rezervasyon ve Sipariş Koşulları</h2>
      <p className="mb-4 leading-relaxed">
        Kullanıcı, My Loungers platformu üzerinden işletmelerin sunduğu şezlong rezervasyonu ve
        yiyecek-içecek siparişi gibi hizmetlerden faydalanabilir. Kullanıcı, işlem onaylanmadan önce
        hizmetin tarih, saat ve detaylarını dikkatlice kontrol etmekle yükümlüdür. Onaylanan işlemler,
        Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi gereğince cayma hakkı kapsamına girmez.
      </p>
      <p className="mb-4 leading-relaxed">
        İptal veya değişiklik talepleri, yalnızca işletmenin belirlediği politika ve kurallara uygun şekilde
        yapılabilir. Platformda yapılan tüm işlemler, kullanıcı ve işletme arasında akdedilen Mesafeli
        Satış Sözleşmesi&apos;ne tabidir.
      </p>

      <h2>8. Madde - İptal, Cayma Hakkı ve İade Koşulları</h2>
      <p className="mb-4 leading-relaxed">
        Kullanıcı, My Loungers platformu üzerinden yaptığı şezlong rezervasyonu veya yiyecek-içecek
        siparişi işlemlerinde, iptal ve iade hakkına sahip değildir. Mesafeli Sözleşmeler
        Yönetmeliği&apos;nin 15. maddesi gereğince, belirli bir tarihte veya dönemde ifa edilmesi gereken
        hizmetlere ilişkin sözleşmelerde cayma hakkı bulunmamaktadır.
      </p>
      <p className="mb-4 leading-relaxed">
        Ancak, kullanıcı ile hizmeti sağlayan işletme arasında, tarafların karşılıklı anlaşması halinde
        iade veya iptal işlemleri gerçekleştirilmesi mümkündür. Bu durum, tamamen kullanıcı ile işletme
        arasındaki bir mutabakata dayanmakta olup, Şirket&apos;in bu süreçlerde herhangi bir sorumluluğu
        bulunmamaktadır.
      </p>

      <h2>9. Madde - Ücretlendirme ve Komisyon Politikası</h2>
      <p className="mb-4 leading-relaxed">
        <strong>Komisyon Oranı:</strong> My Loungers platformu, işletmelerden sunulan hizmetler karşılığında
        %7 oranında komisyon almaktadır. Bu komisyon, hizmetin ifası sonrasında tahsil edilen toplam
        bedelden otomatik olarak düşülerek işletmeye aktarılır.
      </p>
      <p className="mb-4 leading-relaxed">
        <strong>Ödeme Süreçleri:</strong> Kullanıcılar tarafından yapılan ödemeler, platformun anlaşmalı
        olduğu ödeme sağlayıcı aracılığıyla tahsil edilir.
      </p>
      <p className="mb-4 leading-relaxed">
        <strong>İade Durumlarında Komisyon:</strong> Kullanıcı ile işletme arasında gerçekleşecek
        karşılıklı mutabakat sonucu herhangi bir iade yapılması durumunda, komisyon oranı iade tutarından
        düşülerek hesaplanır. Komisyon kesintisi iade edilemez.
      </p>

      <h2>10. Madde - Mobil Uygulama Kullanımı</h2>
      <h3>10.1. Uygulama Mağazaları</h3>
      <p className="mb-4 leading-relaxed">
        My Loungers mobil uygulaması, Apple App Store ve Google Play Store üzerinden indirilebilir.
        Kullanıcı, uygulamayı yalnızca resmi mağazalardan indirmekle yükümlüdür. Üçüncü taraf
        kaynaklarından indirilen uygulamalardan doğacak güvenlik açıkları, veri kayıpları ve sair
        zararlardan Şirket sorumlu tutulamaz.
      </p>
      <p className="mb-4 leading-relaxed">
        Kullanıcı, mobil uygulamayı kullanırken Apple App Store Hizmet Şartları ve Google Play Hizmet
        Şartlarına da uymakla yükümlüdür.
      </p>
      <h3>10.2. Cihaz İzinleri</h3>
      <p className="mb-4 leading-relaxed">
        Mobil uygulama, hizmetin sağlanabilmesi için aşağıdaki cihaz izinlerini talep edebilir:
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>Konum (Location):</strong> Yakınınızdaki tesisleri göstermek ve harita üzerinde konum
          bazlı arama yapabilmek için. Reddedilebilir.
        </li>
        <li>
          <strong>Bildirimler (Notifications):</strong> Rezervasyon onayı, hatırlatma, ödeme
          bilgilendirmesi ve hizmete dair güncellemeleri iletmek için. Reddedilebilir.
        </li>
        <li>
          <strong>Kamera ve Galeri:</strong> Profil fotoğrafı yüklemek ve yorum süreçlerinde görsel
          paylaşımı için. Reddedilebilir.
        </li>
        <li>
          <strong>İnternet Erişimi:</strong> Uygulamanın temel fonksiyonlarının çalışması için zorunludur.
        </li>
      </ul>
      <h3>10.3. Uygulama Güncellemeleri</h3>
      <p className="mb-4 leading-relaxed">
        Şirket, mobil uygulamayı güvenlik, performans ve fonksiyonel iyileştirmeler amacıyla güncelleme
        hakkına sahiptir. Kullanıcı, uygulamanın güncel sürümünü kullanmakla yükümlüdür.
      </p>

      <h2>11. Madde - Üçüncü Taraf Servisler</h2>
      <p className="mb-4 leading-relaxed">
        Platform, hizmetin sağlanabilmesi için aşağıdaki üçüncü taraf servislerini kullanmaktadır. Bu
        servisler, kendi şartları ve gizlilik politikaları çerçevesinde hizmet vermektedir:
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>Apple Sign-In:</strong> Apple kullanıcılarının kimlik doğrulaması için. Apple Inc.
          politikalarına tabidir.
        </li>
        <li>
          <strong>Google Sign-In:</strong> Google kullanıcılarının kimlik doğrulaması için. Google LLC
          politikalarına tabidir.
        </li>
        <li>
          <strong>Supabase (Frankfurt, Almanya):</strong> Kullanıcı verilerinin güvenli depolanması ve
          kimlik doğrulama altyapısı için. AB veri merkezinde saklanır.
        </li>
        <li>
          <strong>Paratika (Asseco SEE):</strong> Ödeme işlemlerinin güvenli gerçekleştirilmesi için.
          PCI-DSS standartlarına uygundur.
        </li>
      </ul>
      <p className="mb-4 leading-relaxed">
        Şirket, üçüncü taraf servislerin kendi politikalarından, hizmet kesintilerinden veya teknik
        aksaklıklarından doğacak zararlardan sorumlu tutulamaz.
      </p>

      <h2>12. Madde - Mücbir Sebepler</h2>
      <p className="mb-4 leading-relaxed">
        Doğal afetler, salgın hastalıklar, savaş, terör eylemleri, internet altyapısındaki kesintiler,
        elektrik kesintileri, siber saldırılar, üçüncü taraf servis sağlayıcıların kesintileri ve sair
        Şirketin kontrolü dışındaki olaylar mücbir sebep olarak kabul edilir. Mücbir sebep hallerinde,
        Şirket&apos;in işbu sözleşmeden doğan yükümlülüklerini yerine getirememesi durumunda, Şirket
        sorumlu tutulamaz.
      </p>

      <h2>13. Madde - Bildirimler</h2>
      <p className="mb-4 leading-relaxed">
        Tarafların birbirine yapacağı tüm bildirimler, kullanıcının üyelik kaydında belirttiği e-posta
        adresine veya Şirket&apos;in info@myloungers.com adresine yazılı olarak yapılabilir. E-posta
        yoluyla yapılan bildirimler, gönderim tarihinden itibaren 24 saat sonra yapılmış sayılır.
      </p>

      <h2>14. Madde - Sözleşme Değişiklikleri</h2>
      <p className="mb-4 leading-relaxed">
        Şirket, işbu sözleşmeyi tek taraflı olarak değiştirme ve güncelleme hakkını saklı tutar. Yapılan
        değişiklikler, platform üzerinde yayınlandığı tarihten itibaren geçerlilik kazanır. Kullanıcı,
        platformu kullanmaya devam etmesi halinde değişiklikleri kabul etmiş sayılır. Esaslı değişiklikler
        kullanıcılara e-posta yoluyla ayrıca bildirilir.
      </p>

      <h2>15. Madde - Uyuşmazlıkların Çözümü ve Yetkili Mahkeme</h2>
      <p className="mb-4 leading-relaxed">
        İşbu sözleşmenin uygulanmasından doğabilecek her türlü uyuşmazlığın çözümünde Türk Hukuku
        uygulanır. Uyuşmazlıkların çözümünde Sakarya Mahkemeleri ve İcra Daireleri yetkilidir.
      </p>
      <p className="mb-4 leading-relaxed">
        Tüketici uyuşmazlıklarında, Tüketicinin Korunması Hakkında Kanun ve ilgili mevzuat hükümleri
        uyarınca belirlenen parasal sınırlar dahilinde Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri
        yetkilidir.
      </p>

      <h2>16. Madde - Yürürlük</h2>
      <p className="mb-4 leading-relaxed">
        İşbu sözleşme, kullanıcının platforma kayıt olması ve ilgili onay kutusunu işaretlemesi ile
        birlikte taraflar arasında yürürlüğe girer ve kullanıcının üyeliği devam ettiği sürece
        geçerliliğini korur. Sözleşme 16 (on altı) maddeden ibaret olup elektronik ortamda akdedilmiştir.
      </p>
    </LegalPageLayout>
  );
}
