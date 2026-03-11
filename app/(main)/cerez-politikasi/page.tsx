import LegalLayout from '@/app/components/LegalLayout';

export const metadata = {
  title: 'Çerez Politikası | MatbaaGross',
  description: 'MatbaaGross çerez politikası hakkında detaylı bilgi. Kullanılan çerez türleri, veri koruma ve çerez yönetimi.',
};

export default function CerezPolitikasiPage() {
  return (
    <LegalLayout>
      <h1 className="text-2xl font-bold text-[#1e3a8a] mb-2">Çerez Politikası</h1>
      <p className="text-sm text-gray-400 mb-6">Son güncelleme: Mart 2026</p>

      <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-5">
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">1. Çerez Nedir?</h2>
          <p>
            Çerezler (cookies), web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza
            yerleştirilen küçük metin dosyalarıdır. Bu dosyalar, sizi tanımamıza, tercihlerinizi
            hatırlamamıza ve size daha iyi bir kullanıcı deneyimi sunmamıza yardımcı olur.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">2. Kullanılan Çerez Türleri</h2>

          <div className="mt-3 space-y-4">
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <h3 className="text-sm font-bold text-[#1e3a8a] mb-1.5">a) Zorunlu Çerezler</h3>
              <p>
                Web sitemizin temel işlevlerinin çalışması için gerekli çerezlerdir. Oturum yönetimi,
                sepet bilgileri ve güvenlik doğrulaması gibi kritik fonksiyonları sağlar.
                Bu çerezler olmadan sitemiz düzgün çalışamaz ve devre dışı bırakılamazlar.
              </p>
              <ul className="mt-2 text-xs text-gray-500 space-y-1 list-disc list-inside">
                <li>Oturum çerezi (next-auth.session-token)</li>
                <li>CSRF koruma çerezi</li>
                <li>Çerez onay tercihi (matbaagross_cookie_consent)</li>
              </ul>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <h3 className="text-sm font-bold text-[#1e3a8a] mb-1.5">b) Analiz ve Performans Çerezleri</h3>
              <p>
                Ziyaretçilerin sitemizi nasıl kullandığını anlamamıza yardımcı olan çerezlerdir.
                Sayfa görüntüleme sayısı, ziyaretçi kaynağı ve site içi gezinme davranışları gibi
                anonim istatistiksel verileri toplar.
              </p>
              <ul className="mt-2 text-xs text-gray-500 space-y-1 list-disc list-inside">
                <li>Google Analytics (_ga, _gid, _gat)</li>
                <li>Google Tag Manager</li>
              </ul>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <h3 className="text-sm font-bold text-[#1e3a8a] mb-1.5">c) İşlevsel Çerezler</h3>
              <p>
                Dil tercihi, bölge seçimi ve kişiselleştirilmiş ayarlar gibi gelişmiş özellikleri
                sağlayan çerezlerdir. Bu çerezler sayesinde siteyi her ziyaretinizde tercihlerinizi
                yeniden ayarlamanız gerekmez.
              </p>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <h3 className="text-sm font-bold text-[#1e3a8a] mb-1.5">d) Reklam ve Pazarlama Çerezleri</h3>
              <p>
                İlgi alanlarınıza uygun reklamlar göstermek amacıyla kullanılabilecek çerezlerdir.
                Bu çerezler üçüncü taraf reklam ağları tarafından yerleştirilebilir ve farklı web
                siteleri arasındaki gezinme davranışınızı takip edebilir.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">3. Verilerinizin Korunması</h2>
          <p>
            MatbaaGross olarak, çerezler aracılığıyla toplanan tüm verilerinizi 6698 sayılı Kişisel
            Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuata uygun şekilde işlemekteyiz.
          </p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside">
            <li>Tüm veri iletişimi SSL/TLS şifreleme ile korunmaktadır.</li>
            <li>Kişisel verileriniz yalnızca belirtilen amaçlar doğrultusunda işlenmektedir.</li>
            <li>Verileriniz yasal zorunluluklar haricinde üçüncü taraflarla paylaşılmamaktadır.</li>
            <li>Ödeme işlemleri PCI-DSS uyumlu PayTR altyapısı üzerinden gerçekleştirilmektedir.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">4. Çerezleri Nasıl Yönetebilirsiniz?</h2>
          <p>
            Tarayıcı ayarlarınız üzerinden çerezleri yönetebilir, silebilir veya engel&shy;leyebilirsiniz.
            Ancak zorunlu çerezlerin devre dışı bırakılması durumunda sitemizin bazı özellikleri
            çalışmayabilir.
          </p>
          <div className="mt-3 space-y-2">
            <p className="font-medium text-gray-700">Popüler tarayıcılarda çerez ayarları:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Google Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler ve diğer site verileri</li>
              <li><strong>Mozilla Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</li>
              <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezleri ve web sitesi verilerini yönet</li>
              <li><strong>Microsoft Edge:</strong> Ayarlar → Çerezler ve site izinleri → Çerezleri yönet ve sil</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">5. Çerez Politikası Değişiklikleri</h2>
          <p>
            MatbaaGross, bu Çerez Politikası&apos;nı herhangi bir zamanda güncelleme hakkını saklı tutar.
            Yapılan değişiklikler bu sayfada yayımlandığı tarihte yürürlüğe girer. Politikamızdaki
            önemli değişikliklerde sitemiz üzerinden bildirim yapılacaktır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">6. İletişim</h2>
          <p>
            Çerez politikamız hakkında sorularınız veya talepleriniz için aşağıdaki iletişim
            kanallarından bize ulaşabilirsiniz:
          </p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li><strong>E-posta:</strong> destek@matbaagross.com</li>
            <li><strong>Web:</strong> www.matbaagross.com/iletisim</li>
          </ul>
        </section>

        <div className="mt-8 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Bu politika 6698 sayılı KVKK ve 5809 sayılı Elektronik Haberleşme Kanunu kapsamında
            hazırlanmıştır.
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
