'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, User, Mail, Phone, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SupplierApplicationPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    password: '',
    isKvkkAccepted: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isKvkkModalOpen, setIsKvkkModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.isKvkkAccepted) {
      setError('Devam etmek için KVKK aydınlatma metnini okuyup onaylamalısınız.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/supplier-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          contactName: formData.contactName,
          phone: formData.phone,
          email: formData.email,
          isKvkkAccepted: formData.isKvkkAccepted,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Başvuru gönderilemedi.');
      }

      setSuccess(data?.message || 'Başvurunuz alındı.');
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        password: '',
        isKvkkAccepted: false,
      });
    } catch (err: any) {
      setError(err?.message || 'Bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070f]">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-[#05070f] via-[#0b1f3a] to-[#111827]" />
          <div className="absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full bg-[#FF6000]/15 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-[520px] w-[520px] rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]" />

          <div className="relative h-full p-12 flex flex-col justify-between">
            <Link href="https://fabrika.matbaagross.com" className="inline-flex">
              <Image
                src="/logo.svg"
                alt="Matbaagross"
                width={420}
                height={120}
                className="h-14 w-auto object-contain"
                priority
              />
            </Link>

            <div className="max-w-md">
              <h1 className="text-4xl font-black tracking-tight text-white">Premium Üretici Ağına Katılın</h1>
              <p className="mt-4 text-white/80 leading-relaxed">
                Türkiye&apos;nin en büyük matbaa ekosisteminde yerinizi alın, yüzlerce kurumsal talebe anında fiyat verin.
              </p>
            </div>

            <div className="text-xs text-white/40">© {new Date().getFullYear()} Matbaagross</div>
          </div>
        </div>

        <div className="bg-white flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="https://fabrika.matbaagross.com" className="inline-flex">
                <Image
                  src="/logo.svg"
                  alt="Matbaagross"
                  width={420}
                  height={120}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-gray-900">Üretici Başvuru Formu</h2>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-green-700 flex items-center gap-2 text-sm">
                <CheckCircle2 size={18} className="shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-extrabold text-gray-800 mb-2">
                  Firma Adı
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-4 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                    placeholder="Firma unvanı"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contactName" className="block text-sm font-extrabold text-gray-800 mb-2">
                  Yetkili Adı Soyadı
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-4 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                    placeholder="Ad Soyad"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-extrabold text-gray-800 mb-2">
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="email"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-4 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                    placeholder="ornek@sirket.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-extrabold text-gray-800 mb-2">
                  Telefon Numarası
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    autoComplete="tel"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-4 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                    placeholder="05xx xxx xx xx"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-extrabold text-gray-800 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-4 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={formData.isKvkkAccepted}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isKvkkAccepted: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#FF6000] focus:ring-[#FF6000]"
                />
                <span className="text-xs text-gray-600">
                  <button
                    type="button"
                    onClick={() => setIsKvkkModalOpen(true)}
                    className="font-extrabold text-gray-900 underline underline-offset-2 hover:text-gray-700"
                  >
                    KVKK Aydınlatma ve Açık Rıza Metni
                  </button>
                  <span className="text-gray-600">&nbsp;okudum ve kabul ediyorum.</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#FF6000] py-4 text-white font-extrabold hover:bg-[#e55a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Hemen Başvuruyu Tamamla'}
              </button>
            </form>

            <p className="mt-6 text-xs text-gray-600">
              Zaten premium üretici misiniz?{' '}
              <Link href="/seller-login" className="font-extrabold text-gray-900 hover:underline">
                Giriş Yapın
              </Link>
            </p>

            {isKvkkModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="kvkk-title"
              >
                <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <div className="text-sm font-extrabold tracking-tight text-gray-900" id="kvkk-title">
                      MATBAAGROSS B2B PLATFORMU ÜRETİCİ/TEDARİKÇİ KVKK AYDINLATMA VE AÇIK RIZA METNİ
                    </div>
                  </div>

                  <div className="px-6 py-5">
                    <div className="max-h-[60vh] overflow-auto rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                      Veri Sorumlusu: Matbaagross (Bundan böyle 'Platform' olarak anılacaktır.)

                      1. Kişisel Verilerin İşlenme Amacı: Platformumuza üretici/tedarikçi olarak kayıt olmanız kapsamında paylaştığınız kimlik (ad, soyad), iletişim (telefon, e-posta) ve firma verileriniz; satıcı profilinizin oluşturulması, alıcılarla iletişiminizin sağlanması, teklif ve sipariş süreçlerinin yönetilmesi, finansal işlemlerin (ödeme havuzu vb.) yürütülmesi ve yasal yükümlülülüklerimizin yerine getirilmesi amacıyla işlenmektedir.

                      2. İşlenen Verilerin Kimlere ve Hangi Amaçla Aktarılabileceği: Toplanan kişisel ve ticari verileriniz; ticari faaliyetlerin yürütülmesi amacıyla sipariş veren müşterilerle, güvenli ödeme altyapısının sağlanması için PayTR gibi ödeme kuruluşlarıyla, teknik altyapı hizmeti aldığımız yurtiçi/yurtdışı sunucu ve bulut hizmeti sağlayıcılarıyla ve kanunen yetkili kamu kurumlarıyla paylaşılabilecektir.

                      3. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi: Verileriniz, web sitemiz üzerindeki kayıt formunu doldurmanız vasıtasıyla elektronik ortamda toplanmaktadır. Bu süreç, 6698 sayılı KVKK'nın 5/2 maddesindeki 'Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin işlenmesinin gerekli olması' ile 'Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması' şartlarına dayanmaktadır.

                      4. İlgili Kişinin Hakları: KVKK'nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, aktarıldığı 3. kişileri bilme, eksik/yanlış işlenme varsa düzeltilmesini isteme ve silinmesini talep etme haklarına sahipsiniz.

                      Açık Rıza Beyanı: Yukarıdaki aydınlatma metnini okuduğumu, anladığımı ve platforma kayıt olarak ticari faaliyet yürütmek amacıyla verilerimin belirtilen şartlarda işlenmesini ve aktarılmasını özgür irademle kabul ve beyan ederim.
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setIsKvkkModalOpen(false)}
                        className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-extrabold text-gray-800 hover:bg-gray-50"
                      >
                        Kapat
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, isKvkkAccepted: true }));
                          setIsKvkkModalOpen(false);
                        }}
                        className="rounded-2xl bg-[#FF6000] px-6 py-3 text-sm font-extrabold text-white hover:bg-[#e55a00]"
                      >
                        Okudum, Onaylıyorum
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
