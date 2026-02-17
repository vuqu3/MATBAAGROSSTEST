import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function IadePolitikasiPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2">İade ve Değişim Politikası</h1>
          <p className="text-lg text-gray-600 mb-10">
            MatbaaGross iade ve cayma hakkı koşulları.
          </p>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <section className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Önemli Uyarı</h2>
              <p className="text-gray-800 font-medium">
                Kişiye özel üretilen, logo baskılı veya fason ürünlerde üretim hatası olmadığı sürece cayma hakkı kullanılamaz. Bu ürünler 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında cayma hakkı kapsamı dışındadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Genel İlke</h2>
              <p>
                MatbaaGross olarak müşteri memnuniyetini ön planda tutuyoruz. 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği çerçevesinde, cayma hakkına tabi ürünlerde belirtilen süre ve koşullarda iade ve değişim kabul edilmektedir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Cayma Hakkı Kapsamı Dışındaki Ürünler</h2>
              <p>
                Aşağıdaki ürün ve hizmetlerde cayma hakkı kullanılamaz:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Kişiye özel veya müşteri talebine göre üretilen ürünler</li>
                <li>Logo, marka veya özel baskı içeren ürünler</li>
                <li>Fason (özel kesim, özel ölçü, özel baskı) üretim siparişleri</li>
                <li>Üretim hatası olmayan, müşteri tarafından onaylanmış grafik/prova ile üretilmiş ürünler</li>
              </ul>
              <p className="mt-3">
                Bu kapsamda üretim hatası (baskı hatası, kesim hatası, malzeme hatası vb.) tespit edilmesi halinde, ürün iade alınarak yenisi üretilir veya uygun bir çözüm sunulur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Cayma Hakkı Kapsamındaki Ürünler</h2>
              <p>
                Standart, kişiselleştirilmemiş hazır ürünlerde (katalogdan seçilen, özel baskı/logo içermeyen ürünler) cayma hakkı 14 gün içinde kullanılabilir. Ürün, teslim tarihinden itibaren 14 gün içinde, kullanılmamış ve orijinal ambalajında iade edilmelidir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">4. İade / Değişim Süreci</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>İade veya değişim talebinizi info@matbaagross.com veya iletişim formu üzerinden bildirin.</li>
                <li>Ürünü orijinal ambalajında, hasarsız şekilde kargoya verin.</li>
                <li>Ürün tarafımıza ulaştıktan ve kontrol tamamlandıktan sonra iade bedeli veya değişim ürünü süreçlendirilir.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">5. İade Kargo Ücreti</h2>
              <p>
                Cayma hakkı kapsamındaki iadelerde, ürün bedeli iade sürecinde ALICI&apos;ya ödenir. İade kargo ücreti, cayma hakkı kapsamındaki iadelerde yasal düzenlemelere uygun şekilde uygulanır; fason ve kişiye özel üretimlerde iade kabul edilmediği için bu madde uygulanmaz.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
