import LegalLayout from '@/app/components/LegalLayout';

export const metadata = {
  title: 'Mesafeli Satış Sözleşmesi | MatbaaGross',
  description: 'MatbaaGross mesafeli satış sözleşmesi ve alışveriş koşulları.',
};

export default function MesafeliSatisPage() {
  return (
    <LegalLayout>
      <h1 className="text-2xl font-bold text-[#1e3a8a] mb-2">Mesafeli Satış Sözleşmesi</h1>
      <p className="text-sm text-gray-400 mb-6">Son güncelleme: Şubat 2026</p>

      <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-5">
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">1. Satıcı Bilgileri</h2>
          <p>
            <strong>Ünvan:</strong> MatbaaGross (SB Ofset ve Matbaacılık)<br />
            <strong>Adres:</strong> Yakuplu Mahallesi 194. Sokak, 3. Matbaacılar Sitesi, 5. Kat No:451, Beylikdüzü / İstanbul<br />
            <strong>E-posta:</strong> destek@matbaagross.com
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">2. Sözleşmenin Konusu</h2>
          <p>
            Bu sözleşme, Alıcı'nın MatbaaGross web sitesi üzerinden elektronik ortamda sipariş verdiği
            ürün veya hizmetlerin satışı ve teslimatına ilişkin olarak 6502 sayılı Tüketicinin Korunması
            Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği çerçevesinde tarafların hak ve
            yükümlülüklerini düzenlemektedir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">3. Ürün ve Fiyat Bilgileri</h2>
          <p>
            Sipariş edilen ürünlerin özellikleri, miktarı ve satış fiyatı sipariş özeti sayfasında
            açıkça belirtilmektedir. Fiyatlara KDV dahildir. Kargo bedeli, sipariş toplamına göre
            ayrıca hesaplanır; 1.500 TL ve üzeri siparişlerde kargo ücretsizdir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">4. Ödeme ve Teslimat</h2>
          <p>
            Ödeme, sipariş tamamlama adımında kredi kartı, banka kartı veya havale/EFT yöntemiyle
            yapılır. Stoktan teslim ürünler ödeme onayının ardından en geç 3 iş günü içinde kargoya
            verilir. Özel üretim (fason) ürünlerde teslimat süresi ürün sayfasında belirtilmektedir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">5. Cayma Hakkı</h2>
          <p>
            Alıcı, teslim tarihinden itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin cayma
            hakkını kullanabilir. Cayma hakkının kullanılabilmesi için ürünün kullanılmamış, orijinal
            ambalajında ve faturasıyla birlikte iade edilmesi gerekmektedir. Müşteriye özel üretilen
            (kişiselleştirilmiş baskı) ürünlerde cayma hakkı kullanılamaz.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">6. Uyuşmazlık Çözümü</h2>
          <p>
            Tüketici şikâyetleri için İl veya İlçe Tüketici Hakem Heyetlerine ya da Tüketici
            Mahkemelerine başvurulabilir. Uygulanacak hukuk Türkiye Cumhuriyeti hukukudur.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
