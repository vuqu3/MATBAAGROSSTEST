import LegalLayout from '@/app/components/LegalLayout';

export const metadata = {
  title: 'Gizlilik ve Çerez Politikası | MatbaaGross',
  description: 'MatbaaGross gizlilik politikası ve çerez kullanımı hakkında bilgi.',
};

export default function GizlilikPage() {
  return (
    <LegalLayout>
      <h1 className="text-2xl font-bold text-[#1e3a8a] mb-2">Gizlilik ve Çerez Politikası</h1>
      <p className="text-sm text-gray-400 mb-6">Son güncelleme: Şubat 2026</p>

      <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-5">
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">1. Toplanan Veriler</h2>
          <p>
            MatbaaGross, hizmetlerini sunabilmek amacıyla ad-soyad, e-posta adresi, telefon numarası,
            teslimat adresi ve ödeme bilgileri gibi kişisel verileri toplamaktadır. Bu veriler yalnızca
            sipariş işlemleri, müşteri desteği ve yasal yükümlülüklerin yerine getirilmesi amacıyla
            kullanılmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">2. Verilerin Kullanımı</h2>
          <p>
            Toplanan kişisel veriler; sipariş yönetimi, kargo takibi, fatura düzenleme, müşteri
            hizmetleri ve yasal bildirimler için işlenmektedir. Açık rızanız olmaksızın kişisel
            verileriniz üçüncü taraflarla paylaşılmaz; yalnızca kargo firmaları ve ödeme altyapı
            sağlayıcıları gibi hizmet ortaklarıyla zorunlu ölçüde paylaşılabilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">3. Çerez Politikası</h2>
          <p>
            Sitemiz, kullanıcı deneyimini iyileştirmek amacıyla zorunlu, işlevsel ve analitik çerezler
            kullanmaktadır. Zorunlu çerezler sitenin düzgün çalışması için gereklidir ve devre dışı
            bırakılamaz. Diğer çerezler için tarayıcı ayarlarınızdan tercihlerinizi yönetebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">4. Veri Güvenliği</h2>
          <p>
            Kişisel verileriniz SSL şifreleme teknolojisiyle korunmaktadır. Ödeme işlemleri, PCI-DSS
            uyumlu PayTR altyapısı üzerinden gerçekleştirilmekte olup kart bilgileriniz sistemlerimizde
            saklanmamaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">5. Haklarınız</h2>
          <p>
            6698 sayılı KVKK kapsamında kişisel verilerinize erişme, düzeltme, silme veya işlenmesine
            itiraz etme hakkına sahipsiniz. Bu haklarınızı kullanmak için destek@matbaagross.com
            adresine yazabilirsiniz.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
