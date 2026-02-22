import LegalLayout from '@/app/components/LegalLayout';

export const metadata = {
  title: 'İptal ve İade Şartları | MatbaaGross',
  description: 'MatbaaGross iptal ve iade koşulları hakkında bilgi.',
};

export default function IadeSartlariPage() {
  return (
    <LegalLayout>
      <h1 className="text-2xl font-bold text-[#1e3a8a] mb-2">İptal ve İade Şartları</h1>
      <p className="text-sm text-gray-400 mb-6">Son güncelleme: Şubat 2026</p>

      <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-5">
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">1. Sipariş İptali</h2>
          <p>
            Siparişiniz henüz kargoya verilmemişse, hesabınızdaki "Siparişlerim" bölümünden veya
            destek@matbaagross.com adresine e-posta göndererek iptal talebinde bulunabilirsiniz.
            Kargoya verilmiş siparişler için iade süreci uygulanır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">2. İade Koşulları</h2>
          <p>
            Ürünü teslim aldığınız tarihten itibaren 14 gün içinde iade talebinde bulunabilirsiniz.
            İade edilecek ürünün; kullanılmamış, orijinal ambalajında, tüm aksesuarlarıyla birlikte
            ve faturasıyla iade edilmesi gerekmektedir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">3. İade Edilemeyen Ürünler</h2>
          <p>
            Aşağıdaki durumlarda iade kabul edilmemektedir:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Müşteriye özel tasarım veya baskı içeren ürünler (kişiselleştirilmiş ürünler)</li>
            <li>Ambalajı açılmış veya kullanılmış ürünler</li>
            <li>Müşteri hatası nedeniyle zarar görmüş ürünler</li>
            <li>Faturası ibraz edilemeyen ürünler</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">4. İade Süreci</h2>
          <p>
            İade talebinizi destek@matbaagross.com adresine iletmeniz halinde size iade kargo kodu
            gönderilecektir. Ürün tarafımıza ulaştıktan ve incelendikten sonra 5 iş günü içinde
            ödemeniz iade edilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">5. Hasarlı veya Hatalı Ürün</h2>
          <p>
            Teslim aldığınız üründe hasar veya üretim hatası bulunması durumunda, teslim tarihinden
            itibaren 3 gün içinde fotoğraflı bildirimde bulunmanız gerekmektedir. Bu durumda ürün
            ücretsiz olarak değiştirilir veya iade edilir.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
