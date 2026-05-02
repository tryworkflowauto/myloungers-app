import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | MyLoungers",
  description:
    "MyLoungers KVKK aydınlatma metni — kişisel verilerin işlenmesi ve korunması hakkında bilgilendirme.",
};

export default function KvkkPage() {
  return (
    <LegalPageLayout title="KVKK Aydınlatma Metni">
      <h2>1. Kapsam ve Amaç</h2>
      <p className="mb-4 leading-relaxed">
        Bu metnin amacı, Reklamotv Bilişim Teknoloji Reklamcılık ve Organizasyon Hiz. San. ve Tic. Ltd.
        Şti. tarafından yönetilen www.myloungers.com adresinde yer alan internet sitesinin ve mobil
        uygulamasının kullanımı sırasında elde edilen veya üçüncü kişilerden alınan kişisel verilerin
        kullanımına ilişkin olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun (KVKK) 10.
        maddesi ile getirilen aydınlatma yükümlülüğünün yerine getirilmesidir.
      </p>
      <p className="mb-4 leading-relaxed">
        My Loungers, sahil tesisleri, oteller ve beach club benzeri işletmelerin sunduğu şezlong
        hizmetleri ile bireysel kullanıcıları bir araya getirerek, kullanıcıların şezlong rezervasyonu
        yapmasını ve rezervasyon yaptığı işletmede yiyecek-içecek siparişi vermesini sağlayan bir
        platformdur.
      </p>
      <p className="mb-4 leading-relaxed">
        Reklamotv Bilişim Teknoloji Reklamcılık ve Organizasyon Hiz. San. ve Tic. Ltd. Şti., Kişisel
        Verilerin İşlenmesine İlişkin Aydınlatma Metninde gerekli görüldüğü takdirde değişiklik yapma
        hakkını saklı tutar. İşbu bilgilendirme metninin devamında Reklamotv Bilişim Teknoloji
        Reklamcılık ve Organizasyon Hiz. San. ve Tic. Ltd. Şti., My Loungers olarak anılacaktır.
      </p>

      <h2>2. Veri Sorumlusu ve Veri İşleyen</h2>
      <p className="mb-4 leading-relaxed">
        6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, kişisel verileriniz, My Loungers
        tarafından veri sorumlusu sıfatıyla aşağıda belirtilen alanlarda toplanacak ve işlenecektir.
        Veri sorumlusu, Reklamotv Bilişim Teknoloji Reklamcılık ve Organizasyon Hiz. San. ve Tic. Ltd.
        Şti.&apos;dir ve şirketin adresi ESENTEPE MAH. AKADEMİYOLU SK. TEKNOLOJİ GELİŞTİRME BÖLGESİ
        NO:10B/B01 SERDİVAN/SAKARYA&apos;dır. Şirketin elektronik tebligat adresi: 25929-56263-22269
      </p>
      <p className="mb-4 leading-relaxed">
        Veri işleyen, veri sorumlusunun kişisel veri işlemek üzere yetkilendirdiği gerçek veya tüzel
        kişilerdir. My Loungers, işbu Aydınlatma Metninde belirtilen sınırlar çerçevesinde veri
        işleyenlerle kullanıcıların kişisel verilerinin güvenliğini sağlamak için gerekli idari ve teknik
        önlemleri almayı taahhüt eder.
      </p>

      <h2>3. Kişisel Verilerin Saklama Süresi</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers tarafından elde edilen kişisel veriler, işlendikleri amaçlarla bağlantılı, sınırlı ve
        ölçülü şekilde ayrılarak saklanır. Bu kapsamda, kişisel veriler yalnızca belirtilen işleme
        amaçları doğrultusunda ve bu amaçlar için gerekli olan süre kadar muhafaza edilecektir.
      </p>
      <p className="mb-4 leading-relaxed">
        Uyuşmazlık hallerinde, yargı süreçlerinin sağlıklı bir şekilde devam edebilmesini sağlamak
        amacıyla kişisel veriler, ilgili mevzuatta belirtilen zamanaşımı süreleri boyunca saklanmaya
        devam edilecektir.
      </p>
      <p className="mb-4 leading-relaxed">
        Saklama süresinin sona ermesinin ardından, kişisel veriler KVKK ve ilgili mevzuata uygun şekilde
        silinir, yok edilir veya anonim hale getirilir.
      </p>

      <h2>4. İşlenen Kişisel Verilerin Kapsamı</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers platformu içerisinde, hizmet alım kalitesinin, piyasa güveninin, platform
        güvenliğinin sağlanması ve korunması, My Loungers platformu tarafından sunulan hizmetlerin
        kullanıcı sözleşmesi çerçevesinde hedef kitleye ulaştırılabilmesi, kullanıcıların ve paydaşların
        hukuki, teknik ve ticari güvenliğinin sağlanması, planlama ve gelişim süreçlerinin yönetilmesi,
        pazarlama, reklam ve hedefleme amaçlarına uygun olarak 6698 sayılı KVKK&apos;nın 5. ve 6.
        maddelerinde belirtilen kişisel veri işleme şartları ve amaçları çerçevesinde işlenmektedir.
      </p>

      <h2>5. İşlenen Kişisel Verilerin Aktarılması</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers, KVKK&apos;nın 8. ve 9. maddelerinde belirtilen kişisel veri işleme şartları ve
        amaçları çerçevesinde kullanıcılarına ait kişisel verileri aşağıdaki amaçlarla paylaşabilir:
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>Kullanım koşulları ve üyelik sözleşmesinin gereklerini yerine getirmek</li>
        <li>Sunulan hizmetlerin ifasını sağlamak</li>
        <li>Kullanıcı deneyimini geliştirmek ve kişiselleştirmek</li>
        <li>My Loungers hizmetlerini geliştirmek</li>
        <li>Hataları ve sorunları gidermek</li>
        <li>Kullanıcı kimliklerini doğrulamak ve güvenliği artırmak</li>
        <li>Sistem performansını artırmak</li>
      </ul>
      <p className="mb-4 leading-relaxed">
        My Loungers kişisel verileri, yukarıdaki amaçları gerçekleştirmek için aşağıdaki taraflarla
        paylaşabilir:
      </p>
      <ol className="list-decimal list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>Dış Kaynak Hizmet Sağlayıcılar ve İş Ortakları:</strong> Veri işleme, saklama ve
          güvenlik hizmetleri sağlayıcıları.
        </li>
        <li>
          <strong>Araştırma Şirketleri ve Ajanslar:</strong> Hizmetlerin kalitesini artırmaya yönelik
          analizler ve pazarlama çalışmaları.
        </li>
        <li>
          <strong>Ödeme Kuruluşları:</strong> Ad-soyad ve iletişim bilgileri doğrulaması gerçekleştirilmesi
          amacıyla.
        </li>
        <li>
          <strong>Yetkili Kamu Kurum ve Kuruluşları:</strong> Yasal zorunluluklar kapsamında gerekli
          bilgiler.
        </li>
      </ol>

      <h2>6. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
      <p className="mb-4 leading-relaxed">
        Kişisel veriler, My Loungers platformu üzerinden elektronik ortamda toplanmakta ve
        depolanmaktadır. Kişisel veriler, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen şartlar
        doğrultusunda; kullanıcıların kendilerinden, iş ortaklarından, siber kayıtlar üzerinden,
        iletilerden, mobil uygulamalardan, sosyal medya ve diğer kamuya açık mecralardan veya etkinlikler
        aracılığı ile toplanabilir.
      </p>
      <h3>6.1. Kullanıcıların Doğrudan Verdiği Veriler</h3>
      <p className="mb-4 leading-relaxed">
        Kullanıcıların, hizmetin ifası ve My Loungers platformunun kullanımı sırasında, kendi
        inisiyatifleri doğrultusunda verdikleri kişisel verilerdir. Bu veriler, ad-soyad, iletişim
        bilgileri, kimlik bilgileri, adres bilgileri gibi kullanıcının doğrudan verdiği tüm bilgileri
        kapsamaktadır.
      </p>
      <h3>6.2. Kullanım Sürecinde Elde Edilen Veriler</h3>
      <p className="mb-4 leading-relaxed">
        My Loungers platformunun kullanımı sırasında, belirli yazılım veya teknolojik araçlar aracılığıyla
        elde edilen kullanıcıların kullanım alışkanlıklarına ilişkin kişisel verilerdir. Örneğin,
        rezervasyon ve sipariş alışkanlıkları gibi veriler bu kapsamda yer almaktadır.
      </p>

      <h2>7. Mobil Uygulama İzinleri</h2>
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
          <strong>İnternet Erişimi:</strong> Uygulamanın temel fonksiyonlarının çalışması için zorunludur.
        </li>
      </ul>
      <p className="mb-4 leading-relaxed">
        Verilen izinler, cihaz ayarları (iOS Ayarlar / Android Ayarlar) üzerinden istediğiniz zaman geri
        çekilebilir veya değiştirilebilir.
      </p>

      <h2>8. Çocukların Korunması (18 Yaş Altı)</h2>
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

      <h2>9. Hesap Silme ve Verilerin İmhası</h2>
      <p className="mb-4 leading-relaxed">
        Kullanıcılar, My Loungers hesaplarını ve hesaplarına bağlı tüm kişisel verilerin silinmesini
        istedikleri zaman talep edebilir.
      </p>
      <p className="mb-4 leading-relaxed">
        <strong>Hesap silme talebi şu şekilde yapılabilir:</strong>
      </p>
      <ol className="list-decimal list-inside ml-4 my-3 space-y-2">
        <li>
          Kayıtlı e-posta adresinizden info@myloungers.com adresine &quot;Hesap Silme Talebi&quot; konulu bir
          e-posta gönderilmesi.
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

      <h2>10. Veri Sahibinin Hakları (KVKK Madde 11)</h2>
      <p className="mb-4 leading-relaxed">
        6698 sayılı KVKK&apos;nın 11. maddesi, kişisel veri sahiplerinin haklarını düzenlemektedir. My
        Loungers kullanıcıları, veri sahibi sıfatıyla bu maddede yer alan tüm haklara sahiptir.
        Kullanıcılar, taleplerini yazılı olarak Esentepe Mahallesi, Akademiyolu Sokak, Teknoloji
        Geliştirme Bölgesi, No:10B/B01 Serdivan/SAKARYA adresine veya info@myloungers.com adresine
        gönderebilir. My Loungers, talebi en geç otuz gün içerisinde ücretsiz olarak cevaplandırır.
      </p>
      <p className="mb-4 leading-relaxed">Veri sahibi olarak kullanıcılar, aşağıdaki haklara sahiptir:</p>
      <ol className="list-decimal list-inside ml-4 my-3 space-y-2">
        <li>Kişisel verilerinin işlenip işlenmediğini öğrenme</li>
        <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme</li>
        <li>
          Kişisel verilerin işlenme amacını ve bu verilerin amacına uygun kullanılıp kullanılmadığını
          öğrenme
        </li>
        <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
        <li>
          Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme
        </li>
        <li>Kişisel verilerin silinmesini veya yok edilmesini isteme</li>
        <li>
          Kişisel verilerin düzeltilmesi, silinmesi ya da yok edilmesi hâlinde bu işlemlerin kişisel
          verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme
        </li>
        <li>
          İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle, kişi
          aleyhine bir sonucun ortaya çıkmasına itiraz etme
        </li>
        <li>
          Kişisel verilerin kanuna aykırı olarak işlenmesi nedeniyle zarara uğraması hâlinde zararın
          giderilmesini talep etme
        </li>
      </ol>

      <h2>11. Kişisel Verilerin Güvenliğine Dair Önlemler</h2>
      <p className="mb-4 leading-relaxed">
        Kişisel veriler, My Loungers güvencesi altında korunur. Hukuka aykırı olarak veri işlenmesini ve
        erişilmesini engellemek, verilerin güvenliğini sağlamak amacıyla en üst seviye güvenlik
        tedbirleri ile teknik ve idari önlemler alınmaktadır. Kişisel veriler, işbu aydınlatma metninde
        belirtilen amaçlar ve KVKK hükümleri dışında kullanılmayacaktır.
      </p>
      <p className="mb-4 leading-relaxed">
        My Loungers platformunda bulunan bağlantılar (linkler) aracılığıyla farklı bir uygulama veya web
        sitesine yönlendirilmeniz durumunda, bu uygulama veya web sitesi tarafından işlenen veriler ve bu
        verilerin güvenliğine ilişkin olarak My Loungers herhangi bir sorumluluk taşımamaktadır.
      </p>

      <h2>12. Kişisel Verilerin Saklanması ve Depolanması</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers platformu ile paylaştığınız kişisel veriler, KVKK mevzuatı çerçevesinde depolanmakta
        ve ilgili kanuni saklama süreleri veya My Loungers faaliyetlerinin gerektirdiği süre boyunca
        saklanmaktadır. Elde edilen kişisel veriler, My Loungers veya bağlı kuruluşları tarafından yurt
        içinde veya yurt dışında bulunan elektronik sistemlerde depolanabilir ve işlenebilir.
      </p>

      <h2>13. Açık Rıza Kapsamı</h2>
      <p className="mb-4 leading-relaxed">
        My Loungers platformuna kaydolan kullanıcı, işbu Aydınlatma Metni, KVKK ve ilgili ikincil
        mevzuat düzenlemeleri uyarınca; kişisel verilerin işlenmesi, korunması, üçüncü kişilerle
        paylaşılması ve aktarılması konularında, My Loungers faaliyetlerinin sürdürülmesi, yasal
        yükümlülüklerin yerine getirilmesi, hizmet kalitesinin artırılması, kullanıcı deneyiminin
        geliştirilmesi, pazarlama faaliyetlerinin yürütülmesi ve benzeri amaçlar doğrultusunda açık rıza
        vermektedir.
      </p>

      <h2>İletişim</h2>
      <p className="mb-4 leading-relaxed">
        <strong>E-posta:</strong> info@myloungers.com
      </p>
      <p className="mb-4 leading-relaxed">
        <strong>Adres:</strong> Esentepe Mah. Akademiyolu Sok. Teknoloji Geliştirme Bölgesi No:10B/B01
        Serdivan/SAKARYA
      </p>
      <p className="mb-4 leading-relaxed">
        <strong>Web:</strong> www.myloungers.com
      </p>
    </LegalPageLayout>
  );
}
