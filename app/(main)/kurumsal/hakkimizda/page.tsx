import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Building2, Target, Eye, Award } from 'lucide-react';

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2">Hakkımızda</h1>
          <p className="text-lg text-gray-600 mb-10">
            MatbaaGross olarak matbaa ve ambalaj sektöründe güvenilir çözüm ortağınızız.
          </p>

          <div className="prose prose-lg max-w-none text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="flex gap-4">
                <div className="flex-shrink-0 p-3 rounded-lg bg-[#1e3a8a]/10">
                  <Building2 className="h-8 w-8 text-[#1e3a8a]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mt-0 mb-2">Kimiz?</h2>
                  <p>
                    MatbaaGross, sektörün köklü ve güvenilir isimlerinden SB Ofset ve Matbaacılık güvencesiyle hayata geçirilmiş yenilikçi bir matbaa ve ambalaj platformudur. İstanbul merkezli operasyonumuzla tüm Türkiye'ye hizmet veriyoruz. İşletmelerin ihtiyaç duyduğu fason baskı, hazır kutu ve her türlü matbaa malzemesi tedariğinde kaliteli, hızlı ve tek noktadan profesyonel çözümler sunuyoruz.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 p-3 rounded-lg bg-[#1e3a8a]/10">
                  <Target className="h-8 w-8 text-[#1e3a8a]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mt-0 mb-2">Misyonumuz</h2>
                  <p>
                    Müşterilerimize kaliteli ürün, rekabetçi fiyat ve zamanında teslimat sunarak matbaa
                    ve ambalaj ihtiyaçlarını en verimli şekilde karşılamak. Küçük işletmeden büyük
                    kurumsal firmalara kadar her ölçekte müşteriye özel çözümler üretmek.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 p-3 rounded-lg bg-[#1e3a8a]/10">
                  <Eye className="h-8 w-8 text-[#1e3a8a]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mt-0 mb-2">Vizyonumuz</h2>
                  <p>
                    Sektörde dijitalleşme ve müşteri deneyimini ön planda tutan, sürdürülebilir
                    üretim anlayışıyla Türkiye ve bölge pazarında referans marka olmak.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 p-3 rounded-lg bg-[#1e3a8a]/10">
                  <Award className="h-8 w-8 text-[#1e3a8a]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mt-0 mb-2">Değerlerimiz</h2>
                  <p>
                    Kalite, dürüstlük, müşteri memnuniyeti ve sürekli gelişim temel değerlerimizdir.
                    Üretim öncesi grafik onayı, şeffaf fiyatlandırma ve güvenilir teslimat süreçleriyle
                    uzun vadeli iş birlikleri kuruyoruz.
                  </p>
                </div>
              </div>
            </div>

            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Neden MatbaaGross?</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• Geniş ürün yelpazesi: Hazır kutu, özel kesim, baskı ve fason hizmetler</li>
                <li>• Üretim öncesi grafik onayı ile hatasız teslimat</li>
                <li>• 1500 TL üzeri siparişlerde ücretsiz kargo</li>
                <li>• Kurumsal ve bireysel müşterilere uygun fiyat politikası</li>
                <li>• Deneyimli teknik ekip ve müşteri destek hizmeti</li>
              </ul>
            </section>
          </div>
        </div>
      </main>    </div>
  );
}
