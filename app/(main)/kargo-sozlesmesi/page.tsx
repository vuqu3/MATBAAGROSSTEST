import LegalLayout from '@/app/components/LegalLayout';

export const metadata = {
  title: 'Kargo Sözleşmesi | MatbaaGross',
  description: 'MatbaaGross kargo ve teslimat koşulları.',
};

export default function KargoSozlesmesiPage() {
  return (
    <LegalLayout>
      <h1 className="text-2xl font-bold text-[#1e3a8a] mb-2">Kargo Sözleşmesi</h1>
      <p className="text-sm text-gray-400 mb-6">Son güncelleme: Şubat 2026</p>

      <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-5">
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">1. Kargo Ücreti</h2>
          <p>
            Sipariş toplamı 1.500 TL ve üzerinde olan siparişlerde kargo ücretsizdir. Bu tutarın
            altındaki siparişlerde kargo ücreti, ürünün desi ağırlığına ve teslimat bölgesine göre
            hesaplanarak sipariş özeti sayfasında gösterilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">2. Teslimat Süreleri</h2>
          <p>
            Stoktan teslim ürünler, ödeme onayının ardından 1-3 iş günü içinde kargoya verilir.
            Özel üretim (fason baskı) ürünlerde teslimat süresi ürün sayfasında ayrıca belirtilmektedir.
            Resmi tatil günleri teslimat süresine dahil değildir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">3. Kargo Firması</h2>
          <p>
            Siparişler, anlaşmalı kargo firmalarımız aracılığıyla gönderilmektedir. Kargo firması
            seçimi MatbaaGross'a aittir. Kargo takip numarası, siparişiniz kargoya verildikten sonra
            kayıtlı e-posta adresinize iletilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">4. Teslimat Adresi</h2>
          <p>
            Sipariş sırasında belirtilen teslimat adresine teslim yapılır. Yanlış veya eksik adres
            bilgisi nedeniyle oluşan gecikmeler MatbaaGross'un sorumluluğunda değildir. Adres
            değişikliği talepleri, sipariş kargoya verilmeden önce iletilmelidir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">5. Hasarlı Teslimat</h2>
          <p>
            Kargo sırasında hasar gören ürünler için kargo görevlisine tutanak tutturmanız ve
            3 gün içinde destek@matbaagross.com adresine fotoğraflı bildirimde bulunmanız
            gerekmektedir. Tutanak olmaksızın yapılan hasarlı ürün bildirimleri değerlendirmeye
            alınamaz.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
