import LegalLayout from '@/app/components/LegalLayout';

export const metadata = {
  title: 'Üyelik Sözleşmesi | MatbaaGross',
  description: 'MatbaaGross üyelik koşulları ve kullanıcı sözleşmesi.',
};

export default function UyelikSozlesmesiPage() {
  return (
    <LegalLayout>
      <h1 className="text-2xl font-bold text-[#1e3a8a] mb-2">Üyelik Sözleşmesi</h1>
      <p className="text-sm text-gray-400 mb-6">Son güncelleme: Şubat 2026</p>

      <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-5">
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">1. Taraflar</h2>
          <p>
            Bu Üyelik Sözleşmesi, MatbaaGross (SB Ofset ve Matbaacılık bünyesinde faaliyet gösteren platform) ile
            platforma üye olan gerçek veya tüzel kişi ("Üye") arasında akdedilmektedir. Üyelik işleminin
            tamamlanmasıyla birlikte bu sözleşme hükümleri her iki taraf için de bağlayıcı hale gelir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">2. Üyelik Koşulları</h2>
          <p>
            Platforma üye olabilmek için 18 yaşını doldurmuş olmak ve kayıt formundaki bilgileri eksiksiz ve
            doğru biçimde doldurmak gerekmektedir. Yanlış veya yanıltıcı bilgi verilmesi durumunda MatbaaGross
            üyeliği askıya alma veya sonlandırma hakkını saklı tutar.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">3. Üyenin Yükümlülükleri</h2>
          <p>
            Üye, hesap bilgilerinin gizliliğini korumakla yükümlüdür. Hesabın yetkisiz kişilerce kullanılması
            durumunda MatbaaGross'u derhal bilgilendirmek zorundadır. Üye, platform üzerinde gerçekleştirdiği
            tüm işlemlerden bizzat sorumludur.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">4. Platformun Hakları</h2>
          <p>
            MatbaaGross, önceden bildirimde bulunmaksızın platform içeriğini, hizmet koşullarını veya fiyat
            politikasını güncelleme hakkına sahiptir. Üyelerin bu değişikliklerden haberdar olabilmesi için
            kayıtlı e-posta adreslerine bildirim gönderilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">5. Sözleşmenin Feshi</h2>
          <p>
            Üye, dilediği zaman hesabını kapatarak sözleşmeyi feshedebilir. MatbaaGross ise sözleşme
            hükümlerine aykırı davranan üyelerin hesabını herhangi bir tazminat yükümlülüğü doğmaksızın
            kapatma hakkını saklı tutar.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">6. Uygulanacak Hukuk</h2>
          <p>
            Bu sözleşmeden doğabilecek uyuşmazlıklarda Türkiye Cumhuriyeti hukuku uygulanır; İstanbul
            Mahkemeleri ve İcra Daireleri yetkilidir.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
