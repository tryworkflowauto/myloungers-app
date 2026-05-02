import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "İptal ve İade Politikası | MyLoungers",
  description:
    "MyLoungers iptal ve iade politikası — rezervasyon iptali ve ücret iadesi koşulları.",
};

export default function IptalIadePage() {
  return (
    <LegalPageLayout title="İptal ve İade Politikası">
      <p className="mb-4 leading-relaxed">
        My Loungers platformu üzerinden gerçekleştirdiğiniz şezlong rezervasyonları ve diğer hizmet
        satın alımlarına ilişkin iptal ve iade koşulları aşağıda detaylandırılmıştır. Lütfen rezervasyon
        yapmadan önce bu politikayı dikkatlice okuyunuz.
      </p>

      <h2>1. Cayma Hakkının Kapsamı</h2>
      <p className="mb-4 leading-relaxed">
        6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
        Yönetmeliği&apos;nin 15. maddesi uyarınca, belirli bir tarihte veya dönemde ifa edilmesi
        gereken hizmetler cayma hakkı istisnası kapsamındadır.
      </p>
      <p className="mb-4 leading-relaxed">
        My Loungers platformu üzerinden yapılan şezlong rezervasyonları ve yiyecek-içecek siparişleri,
        belirli bir tarih ve saatte ifa edilen hizmetler olduğundan, kullanıcı cayma hakkını
        kullanamaz. Bu nedenle:
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>Yapılan rezervasyonlar kesindir ve kullanıcı tarafından tek taraflı olarak iptal edilemez.</li>
        <li>Ödeme iadesi talep edilemez.</li>
        <li>Rezervasyon onayı verildikten sonra herhangi bir nedenle ücret iadesi yapılmaz.</li>
      </ul>

      <h2>2. İşletme ile Mutabakat Yoluyla İptal</h2>
      <p className="mb-4 leading-relaxed">
        Yukarıdaki kural saklı kalmak kaydıyla, kullanıcı ile rezervasyonun yapıldığı işletme arasında
        karşılıklı mutabakat sağlanması halinde iptal veya iade işlemi gerçekleştirilebilir. Bu durum
        tamamen kullanıcı ile işletme arasındaki anlaşmaya bağlıdır.
      </p>
      <p className="mb-4 leading-relaxed">
        My Loungers platformu, bu süreçlerde aracılık görevi üstlenmez ve kullanıcı ile işletmeyi
        uzlaştırma yükümlülüğü bulunmamaktadır. İade gerçekleştirilmesi durumunda %7&apos;lik komisyon
        kesintisi iade tutarından düşülerek hesaplanır ve komisyon kesintisi iade edilmez.
      </p>

      <h2>3. Mücbir Sebep Hallerinde İptal</h2>
      <p className="mb-4 leading-relaxed">
        Doğal afet, salgın hastalık, olağanüstü hava koşulları (fırtına, sağanak yağış vb.), elektrik
        kesintileri veya benzeri mücbir sebeplerle hizmetin ifasının imkansız hale gelmesi durumunda:
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>İşletme, rezervasyonu farklı bir tarihe öteleyebilir veya iade gerçekleştirebilir.</li>
        <li>İade kararı işletmenin takdir yetkisindedir.</li>
        <li>Platform, mücbir sebep hallerinden kaynaklanan iptallerden sorumlu tutulamaz.</li>
      </ul>

      <h2>4. İşletmeden Kaynaklanan İptaller</h2>
      <p className="mb-4 leading-relaxed">
        Rezervasyon yapılan işletmenin kapanması, hizmeti sunamaması veya rezervasyonu reddetmesi gibi
        işletme kaynaklı durumlarda:
      </p>
      <ol className="list-decimal list-inside ml-4 my-3 space-y-2">
        <li>İşletme, kullanıcıya derhal bildirim yapmakla yükümlüdür.</li>
        <li>Ödenen tutar kullanıcıya tam olarak iade edilir.</li>
        <li>
          İade işlemi, ödemenin yapıldığı kart/hesap üzerinden, ödeme sağlayıcının prosedürlerine göre
          7-14 iş günü içerisinde gerçekleştirilir.
        </li>
        <li>Platform, bu süreçte aracılık görevini üstlenir.</li>
      </ol>

      <h2>5. Bakiye İadesi</h2>
      <p className="mb-4 leading-relaxed">
        Kullanıcı tarafından platforma yüklenen bakiye, yalnızca platformda sunulan hizmetler için
        kullanılabilir ve nakit olarak iade edilmez. Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15.
        maddesi uyarınca, bakiye yükleme işlemi cayma hakkı kapsamı dışındadır.
      </p>
      <p className="mb-4 leading-relaxed">
        Yüklenen bakiyenin kullanım süresi, platformda belirtilen hizmetlerin süresi ile sınırlıdır.
        Belirlenen süreler dahilinde kullanılmayan bakiye, platform politikaları kapsamında geçerliliğini
        yitirebilir.
      </p>

      <h2>6. İade Süreci ve Süreler</h2>
      <p className="mb-4 leading-relaxed">
        <strong>İade süreci şu adımlarla işler:</strong>
      </p>
      <ol className="list-decimal list-inside ml-4 my-3 space-y-2">
        <li>İşletme ile iade konusunda mutabakat sağlanır veya işletme tarafından iade kararı verilir.</li>
        <li>İşletme, iade talebini Platform&apos;a iletir.</li>
        <li>Platform, iade işlemini ödeme sağlayıcı (Paratika) üzerinden başlatır.</li>
        <li>İade tutarı, ödemenin yapıldığı kart/hesaba 7-14 iş günü içerisinde aktarılır.</li>
      </ol>
      <p className="mb-4 leading-relaxed">
        İade süresi, ödeme sağlayıcı ve banka prosedürlerine bağlıdır. Platform&apos;un bu süre
        üzerinde doğrudan bir etkisi bulunmamaktadır.
      </p>

      <h2>7. İade Yapılamayacak Durumlar</h2>
      <p className="mb-4 leading-relaxed">Aşağıdaki durumlarda iade gerçekleştirilemez:</p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>Kullanıcının rezervasyon saatinde tesiste bulunmaması (no-show).</li>
        <li>Kullanıcının yanlış bilgi vererek rezervasyon yapması.</li>
        <li>Hizmetin ifa edilmiş olması (şezlongun kullanılmış olması).</li>
        <li>İşletme kurallarının ihlal edilmesi nedeniyle hizmetin sonlandırılması.</li>
        <li>Rezervasyon tarihinin geçmiş olması.</li>
      </ul>

      <h2>8. İletişim ve Talep Bildirimi</h2>
      <p className="mb-4 leading-relaxed">
        İptal, iade veya rezervasyon ile ilgili sorun ve talepleriniz için aşağıdaki kanallardan bizimle
        iletişime geçebilirsiniz:
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>
          <strong>E-posta:</strong> info@myloungers.com
        </li>
        <li>
          <strong>Web:</strong> www.myloungers.com
        </li>
        <li>
          <strong>Adres:</strong> Esentepe Mah. Akademiyolu Sok. Teknoloji Geliştirme Bölgesi No:10B/B01
          Serdivan/SAKARYA
        </li>
      </ul>
      <p className="mb-4 leading-relaxed">
        Talepleriniz en geç 7 iş günü içerisinde değerlendirilerek tarafınıza dönüş yapılır.
      </p>

      <h2>9. Tüketici Hakları</h2>
      <p className="mb-4 leading-relaxed">
        Kullanıcılar, 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında sahip oldukları tüm
        haklarını saklı tutar. Tüketici uyuşmazlıklarında, kanunda belirtilen parasal sınırlar
        dahilinde:
      </p>
      <ul className="list-disc list-inside ml-4 my-3 space-y-2">
        <li>Tüketici Hakem Heyetleri&apos;ne başvuru yapılabilir.</li>
        <li>Tüketici Mahkemeleri yetkilidir.</li>
      </ul>
      <p className="mb-4 leading-relaxed">
        Yetkili mahkemeler, kullanıcının yerleşim yerindeki Tüketici Mahkemeleri&apos;dir.
      </p>
    </LegalPageLayout>
  );
}
