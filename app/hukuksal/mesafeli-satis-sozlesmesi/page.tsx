import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2">Mesafeli Satış Sözleşmesi</h1>
          <p className="text-lg text-gray-600 mb-10">
            Bu sözleşme, MatbaaGross üzerinden yapılan mesafeli satışlara ilişkin tarafların hak ve yükümlülüklerini düzenler.
          </p>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">1. TARAFLAR</h2>
              <p>
                <strong>1.1. SATICI (İşletme):</strong> MatbaaGross unvanı ile faaliyet gösteren satıcı (bundan sonra &quot;SATICI&quot; olarak anılacaktır).
              </p>
              <p>
                <strong>1.2. ALICI:</strong> Siparişi veren ve sözleşme konusu mal/hizmeti satın alan gerçek veya tüzel kişi (bundan sonra &quot;ALICI&quot; olarak anılacaktır).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">2. SÖZLEŞME KONUSU</h2>
              <p>
                İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait internet sitesi üzerinden elektronik ortamda siparişini verdiği, SATICI&apos;nın kataloglarda ve sitede sunulan mal/hizmetlerin satışı ve teslimi ile ilgili tarafların hak ve yükümlülüklerinin belirlenmesidir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">3. SÖZLEŞME KONUSU ÜRÜN/HİZMET BİLGİLERİ</h2>
              <p>
                Siparişe konu ürün/hizmetin türü, miktarı, marka/modeli, satış bedeli, ödeme şekli ve teslimat bilgileri, ALICI tarafından sipariş onay sayfasında teyit edilmiş olup sözleşmenin ayrılmaz parçasıdır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">4. GENEL HÜKÜMLER</h2>
              <p>
                ALICI, SATICI&apos;nın internet sitesinde yer alan ürün/hizmet bilgilerini, satış koşullarını ve mesafeli satış sözleşmesini okuduğunu, anladığını ve kabul ettiğini elektronik ortamda onaylamakla yükümlüdür. Siparişin tamamlanması ile taraflar arasında işbu sözleşme hükümleri uyarınca bağlayıcı bir sözleşme kurulmuş sayılır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">5. TESLİMAT</h2>
              <p>
                SATICI, sözleşme konusu ürünü/hizmeti, ALICI&apos;nın siparişte belirttiği adrese, sipariş onayı ve ödeme bilgilerinin alınmasından itibaren öngörülen süre içinde teslim etmekle yükümlüdür. Fason veya özel üretim siparişlerinde teslimat süresi, üretim süresi dikkate alınarak ALICI&apos;ya önceden bildirilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">6. CAYMA HAKKI</h2>
              <p>
                6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında ALICI, mesafeli sözleşmelerden cayma hakkına sahiptir. Cayma hakkının kullanılamayacağı haller (kişiye özel üretilen, logo baskılı veya fason ürünler vb.) İade Politikası sayfamızda açıklanmıştır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">7. ÖDEME</h2>
              <p>
                Ödeme, ALICI&apos;nın sipariş sırasında seçtiği yöntem (kredi kartı, havale/EFT vb.) ile yapılır. SATICI, ödemenin alındığını ALICI&apos;ya e-posta veya site üzerinden bildirir. Fason ve özel üretim siparişlerinde ödeme koşulları teklif ve sipariş onayında ayrıca belirtilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">8. UYUŞMAZLIKLAR</h2>
              <p>
                İşbu sözleşmeden doğan uyuşmazlıklarda ALICI, Tüketici Hakem Heyetleri ve Tüketici Mahkemelerine başvurabilir. SATICI&apos;nın yerleşim yeri ve ALICI&apos;nın yerleşim yeri mahkemeleri ve icra daireleri yetkilidir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">9. YÜRÜRLÜK</h2>
              <p>
                ALICI, siparişi elektronik ortamda onayladığı anda işbu sözleşme hükümlerini kabul etmiş sayılır. Sözleşme, taraflarca imza/onay tarihinde yürürlüğe girer.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
