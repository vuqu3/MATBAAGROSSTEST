import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function HizmetVeKullanimSartlariPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2">Hizmet ve Kullanım Şartları</h1>
          <p className="text-lg text-gray-600 mb-10">
            MatbaaGross web sitesi ve hizmetlerinin kullanımına ilişkin şartlar.
          </p>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Kapsam ve Taraflar</h2>
              <p>
                İşbu Hizmet ve Kullanım Şartları (&quot;Şartlar&quot;), MatbaaGross (&quot;Şirket&quot;, &quot;biz&quot;) tarafından işletilen web sitesi ve ilgili hizmetlerin (&quot;Site&quot;, &quot;Hizmetler&quot;) kullanımına ilişkindir. Siteyi veya Hizmetleri kullanan gerçek veya tüzel kişi (&quot;Kullanıcı&quot;, &quot;siz&quot;) bu Şartları kabul etmiş sayılır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Hizmetlerin Tanımı</h2>
              <p>
                MatbaaGross, matbaa ve ambalaj ürünlerinin satışı, fason (özel üretim) hizmetleri, sipariş yönetimi, müşteri hesabı ve ilgili bilgilendirme hizmetlerini sunar. Hizmet kapsamı ve koşulları Site üzerinde ve ilgili sayfalarda (Mesafeli Satış Sözleşmesi, İade Politikası vb.) ayrıca belirtilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Hesap ve Kayıt</h2>
              <p>
                Sipariş vermek veya belirli özelliklerden yararlanmak için kayıt olmanız gerekebilir. Verdiğiniz bilgilerin doğru ve güncel olması sizin yükümlülüğünüzdür. Hesap güvenliğinizi sağlamak ve hesabınız üzerinde yapılan işlemlerden siz sorumlusunuz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Kullanım Kuralları</h2>
              <p>
                Site ve Hizmetleri kullanırken aşağıdaki kurallara uymanız beklenir:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Yasalara ve bu Şartlara aykırı kullanım yapmamak</li>
                <li>Yanıltıcı veya sahte bilgi vermemek</li>
                <li>Üçüncü kişilerin haklarına (fikri mülkiyet, gizlilik vb.) saygı göstermek</li>
                <li>Siteyi veya altyapıyı bozmaya, devre dışı bırakmaya veya kötüye kullanmaya yönelik girişimde bulunmamak</li>
                <li>Virüs veya zararlı yazılım yaymamak</li>
              </ul>
              <p className="mt-3">
                Bu kurallara uyulmaması halinde hesabınız askıya alınabilir veya hukuki yollara başvurulabilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Fikri Mülkiyet</h2>
              <p>
                Site üzerindeki metin, görsel, logo, tasarım ve yazılım dahil tüm içerik ve unsurlar MatbaaGross veya lisans verenlerine aittir. İzinsiz kopyalama, dağıtma veya ticari kullanım yasaktır. Müşteri tarafından sağlanan tasarım ve logo dosyaları, yalnızca siparişin yerine getirilmesi amacıyla işlenir; bu konuda ayrıca Mesafeli Satış Sözleşmesi ve İade Politikası hükümleri geçerlidir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Sipariş ve Ödeme</h2>
              <p>
                Siparişler, sipariş onayı ve ödeme bilgilerinin alınması ile kesinleşir. Fiyatlar ve teslimat süreleri Site veya teklif üzerinde belirtildiği gibi uygulanır. Mesafeli Satış Sözleşmesi ve İade Politikası, siparişe ilişkin özel hak ve yükümlülükleri düzenler.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Sorumluluk Sınırı</h2>
              <p>
                Hizmetler &quot;olduğu gibi&quot; sunulmaktadır. Yasal izin verilen ölçüde, Şirket dolaylı, arızi veya cezai zararlardan sorumlu tutulamaz. Zorunlu haller (mücbir sebep), üçüncü taraf hizmet kesintileri veya Kullanıcı kaynaklı hatalar nedeniyle oluşan aksaklıklarda sorumluluk sınırlıdır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Gizlilik</h2>
              <p>
                Kişisel verilerinizin işlenmesi, Gizlilik ve Güvenlik sayfamızda ve KVKK bilgilendirme metninde açıklanmaktadır. Site ve Hizmetleri kullanarak bu metinleri okuduğunuzu ve kabul ettiğinizi kabul etmiş sayılırsınız.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Değişiklikler ve Fesih</h2>
              <p>
                Şirket, bu Şartları önceden duyurmak kaydıyla değiştirme hakkını saklı tutar. Değişiklikler yayımlandığı tarihte yürürlüğe girer. Hizmetleri kötüye kullanım veya Şartlara aykırılık halinde hesabınız veya erişiminiz sonlandırılabilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Uygulanacak Hukuk ve Yetki</h2>
              <p>
                İşbu Şartlara Türkiye Cumhuriyeti kanunları uygulanır. Uyuşmazlıklarda Adana Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
            </section>
          </div>
        </div>
      </main>    </div>
  );
}
