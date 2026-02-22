import LegalLayout from '@/app/components/LegalLayout';

export const metadata = {
  title: 'KVKK Aydınlatma Metni | MatbaaGross',
  description: 'MatbaaGross kişisel verilerin korunması kanunu aydınlatma metni.',
};

export default function KvkkPage() {
  return (
    <LegalLayout>
      <h1 className="text-2xl font-bold text-[#1e3a8a] mb-2">Kişisel Verilerin Korunması (KVKK) Aydınlatma Metni</h1>
      <p className="text-sm text-gray-400 mb-6">Son güncelleme: Şubat 2026</p>

      <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-5">
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz;
            veri sorumlusu sıfatıyla <strong>SB Ofset ve Matbaacılık (MatbaaGross)</strong> tarafından
            aşağıda açıklanan kapsamda işlenmektedir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">2. İşlenen Kişisel Veriler</h2>
          <p>Aşağıdaki kişisel verileriniz işlenmektedir:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Kimlik bilgileri: Ad, soyad</li>
            <li>İletişim bilgileri: E-posta adresi, telefon numarası, teslimat adresi</li>
            <li>Finansal bilgiler: Fatura bilgileri (kart numarası saklanmamaktadır)</li>
            <li>İşlem bilgileri: Sipariş geçmişi, platform kullanım verileri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">3. Kişisel Verilerin İşlenme Amaçları</h2>
          <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Sipariş ve teslimat süreçlerinin yürütülmesi</li>
            <li>Müşteri hizmetleri ve destek taleplerinin karşılanması</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi (fatura, vergi vb.)</li>
            <li>Açık rıza verilmesi halinde pazarlama ve kampanya bildirimleri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">4. Kişisel Verilerin Aktarılması</h2>
          <p>
            Kişisel verileriniz; kargo firmaları, ödeme altyapı sağlayıcıları (PayTR) ve yasal
            zorunluluk kapsamında kamu kurumları ile paylaşılabilir. Yurt dışına veri aktarımı
            yapılmamaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">5. KVKK Kapsamındaki Haklarınız</h2>
          <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
            <li>Verilerin silinmesini veya yok edilmesini talep etme</li>
            <li>İşlemeye itiraz etme ve zararın giderilmesini talep etme</li>
          </ul>
          <p className="mt-2">
            Bu haklarınızı kullanmak için <strong>destek@matbaagross.com</strong> adresine yazabilirsiniz.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
