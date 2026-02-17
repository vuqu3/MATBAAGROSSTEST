import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function GizlilikVeGuvenlikPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2">Gizlilik ve Güvenlik</h1>
          <p className="text-lg text-gray-600 mb-10">
            Kişisel verilerinizin korunması ve işlenmesine ilişkin bilgilendirme metni (KVKK uyumlu).
          </p>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Veri Sorumlusu</h2>
              <p>
                ​6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu, MatbaaGross unvanı ile faaliyet gösteren şirkettir. Kişisel verileriniz, bu metinde açıklanan amaçlarla ve yasal çerçeve dahilinde işlenmektedir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">2. İşlenen Kişisel Veriler ve Amaçları</h2>
              <p>
                Web sitemiz ve e-ticaret süreçleri kapsamında aşağıdaki kişisel verileriniz işlenebilmektedir:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Kimlik ve iletişim bilgileri:</strong> Ad, soyad, e-posta, telefon, adres — Sipariş ve teslimat, müşteri hizmetleri, iletişim ve yasal yükümlülüklerin yerine getirilmesi amacıyla.</li>
                <li><strong>Finansal bilgiler:</strong> Ödeme ve fatura bilgileri — Sipariş ödemesi ve faturalandırma amacıyla.</li>
                <li><strong>İşlem güvenliği verileri:</strong> IP adresi, oturum bilgileri, çerezler — Site güvenliği, dolandırıcılık önleme ve hizmet kalitesinin iyileştirilmesi amacıyla.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Veri İşleme Hukuki Sebepleri</h2>
              <p>
                Kişisel verileriniz; sözleşmenin kurulması veya ifası, hukuki yükümlülüklerin yerine getirilmesi, meşru menfaatlerimiz (müşteri ilişkileri, güvenlik, pazarlama analizi) ve açık rızanız çerçevesinde KVKK&apos;nın 5. ve 6. maddelerine uygun olarak işlenmektedir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Verilerin Aktarılması</h2>
              <p>
                Kişisel verileriniz, yalnızca sipariş ve kargo süreçleri (kargo firmaları), ödeme işlemleri (ödeme kuruluşları/bankalar) ve yasal zorunluluklar çerçevesinde yetkili kurumlarla paylaşılabilir. Yurt dışına veri aktarımı yapılması halinde KVKK&apos;daki usullere uyulur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Saklama Süresi</h2>
              <p>
                Kişisel verileriniz, işleme amacının gerektirdiği süre ve yasal saklama süreleri boyunca muhafaza edilir. Süre sonunda veriler silinir, anonymize edilir veya arşivlenir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Haklarınız (KVKK 11)</h2>
              <p>
                KVKK 11. madde kapsamında kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini isteme ve otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme haklarına sahipsiniz. Bu taleplerinizi veri sorumlusuna yazılı veya Kayıtlı Elektronik Posta (KEP) ile iletebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Güvenlik</h2>
              <p>
                Kişisel verilerinizin güvenliği için teknik ve idari tedbirler (şifreleme, erişim kısıtları, güvenli ödeme altyapısı vb.) alınmaktadır. Ödeme bilgileriniz, PCI-DSS uyumlu ödeme altyapıları üzerinden işlenir; kredi kartı bilgileri sunucularımızda saklanmaz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Çerezler</h2>
              <p>
                Sitemizde kullanıcı deneyimini iyileştirmek ve site güvenliğini sağlamak amacıyla çerezler kullanılabilir. Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Güncellemeler</h2>
              <p>
                Bu gizlilik ve güvenlik metni, yasal düzenlemeler veya şirket uygulamalarındaki değişikliklere göre güncellenebilir. Güncel metin her zaman sitede yayınlanacaktır.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
