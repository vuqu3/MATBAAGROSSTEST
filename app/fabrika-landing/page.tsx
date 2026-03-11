import Link from 'next/link';
import { ArrowRight, BadgeCheck, Globe, HandCoins, ShieldCheck, Sparkles } from 'lucide-react';

export default function FabrikaLandingPage() {
  return (
    <div className="min-h-screen bg-[#05070f] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#05070f] via-[#0b1f3a] to-[#111827]" />
          <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-[#FF6000]/15 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="inline-flex items-center gap-2 font-extrabold tracking-tight">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 border border-white/15">
                <Sparkles className="h-5 w-5 text-[#FF6000]" />
              </span>
              <span className="text-base sm:text-lg">Matbaagross</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/seller-login"
                className="hidden sm:inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-extrabold hover:bg-white/10 transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/tedarikci-ol"
                className="inline-flex items-center justify-center rounded-xl bg-[#FF6000] px-4 py-2.5 text-sm font-extrabold hover:bg-[#e55a00] transition-colors"
              >
                Premium Üretici Ol
              </Link>
            </div>
          </div>

          <div className="mt-14 sm:mt-20 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-extrabold text-white/90">
              <BadgeCheck className="h-4 w-4 text-emerald-400" />
              Matbaagross Premium Üretici Ağı
            </div>

            <h1 className="mt-5 text-4xl sm:text-6xl font-black tracking-tight">
              Türkiye&apos;nin En Büyük Üretici Ağına Katılın
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed">
              Matbaagross Premium ile yüzlerce özel üretim talebine anında fiyat verin. %0 Komisyon, %100 Güvenli Ödeme.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/tedarikci-ol"
                className="inline-flex items-center justify-center rounded-2xl bg-[#FF6000] px-6 py-4 text-base font-extrabold hover:bg-[#e55a00] transition-colors"
              >
                Hemen Premium Üretici Olun
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/seller-dashboard/magaza-profilim"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-base font-extrabold hover:bg-white/10 transition-colors"
              >
                Vitrinimi Düzenle
              </Link>
            </div>

            <p className="mt-6 text-xs text-white/60">
              Vitrin adresiniz: <span className="font-extrabold text-white/80">https://fabrika.matbaagross.com/markaniz</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white text-gray-900">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Neden Matbaagross?</h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl">
            B2B üretim akışını hızlandıran, güvenli ödeme ve güçlü vitrin altyapısıyla işinizi büyütün.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-[#FF6000]/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-[#FF6000]" />
              </div>
              <h3 className="mt-4 text-sm font-extrabold">Hazır Müşteri Havuzu</h3>
              <p className="mt-2 text-sm text-gray-600">
                Pazarlama masrafı yapmadan Türkiye&apos;nin dört bir yanından gelen özel üretim taleplerine ulaşın.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <HandCoins className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-sm font-extrabold">Sıfır Komisyon</h3>
              <p className="mt-2 text-sm text-gray-600">Kestiğiniz faturanın tamamı sizin. İşlem başına komisyon ödemezsiniz.</p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="mt-4 text-sm font-extrabold">Garantili Havuz Ödemesi</h3>
              <p className="mt-2 text-sm text-gray-600">
                Müşteri ödemeyi Matbaagross güvencesiyle yapar. Paranızı riske atmadan üretime başlarsınız.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mt-4 text-sm font-extrabold">Kendinize Özel Vitrin</h3>
              <p className="mt-2 text-sm text-gray-600">
                fabrika.matbaagross.com/markaniz adresiyle makine parkurunuzu ve referanslarınızı tüm dünyaya sergileyin.
              </p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Nasıl Çalışır?</h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl">3 adımda üretime başlayın.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-xs font-extrabold text-gray-600 uppercase tracking-wide">Adım 1</div>
                <div className="mt-2 text-lg font-extrabold">Talepleri Gör</div>
                <p className="mt-2 text-sm text-gray-600">Premium iş havuzundan size uygun talepleri filtreleyip inceleyin.</p>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-xs font-extrabold text-gray-600 uppercase tracking-wide">Adım 2</div>
                <div className="mt-2 text-lg font-extrabold">Teklif Ver ve Mesajlaş</div>
                <p className="mt-2 text-sm text-gray-600">Hızlı teklif gönderin, detayları chat üzerinden netleştirin.</p>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-xs font-extrabold text-gray-600 uppercase tracking-wide">Adım 3</div>
                <div className="mt-2 text-lg font-extrabold">Üret ve Paran Hesabına Geçsin</div>
                <p className="mt-2 text-sm text-gray-600">Ödeme güvenli havuzda tutulur, teslimat sonrası paranız hesabınıza geçer.</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-3xl border border-gray-200 bg-gradient-to-r from-[#0b1f3a] to-[#111827] p-6 sm:p-8 text-white">
              <div>
                <div className="text-sm font-extrabold">Premium üretici olmak için hazır mısınız?</div>
                <div className="mt-1 text-sm text-white/80">Hemen başvurun, vitrin sayfanızı yayınlayın ve teklif vermeye başlayın.</div>
              </div>
              <Link
                href="/tedarikci-ol"
                className="inline-flex items-center justify-center rounded-2xl bg-[#FF6000] px-6 py-4 text-base font-extrabold hover:bg-[#e55a00] transition-colors"
              >
                Başvuruyu Başlat
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#05070f]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 text-white/60 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} Matbaagross</div>
          <div className="text-white/50">Fabrika Ağı Landing</div>
        </div>
      </div>
    </div>
  );
}
