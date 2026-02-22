'use client';

import { useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    id: 1,
    question: 'Tasarım desteği veriyor musunuz?',
    answer:
      'Evet. Fason ve özel üretim siparişlerinizde grafik ekibimiz, baskıya uygun dosya hazırlama, logo uyarlama ve üretim öncesi prova (grafik onay) konularında destek sağlar. Müşteri tarafından teslim edilen tasarımların baskı standartlarına uygunluğu kontrol edilir ve gerekirse düzeltme önerileri sunulur.',
  },
  {
    id: 2,
    question: 'Kargo süreci kaç gün sürüyor?',
    answer:
      'Hazır ürün siparişlerinde ödeme onayı sonrası 1–2 iş günü içinde kargoya verilir. Teslimat süresi bölgeye göre ortalama 2–5 iş günüdür. Fason ve özel üretim siparişlerinde üretim süresi ürün ve miktara göre değişir; sipariş onayında size net teslim tarihi bildirilir. 500 TL üzeri siparişlerde kargo ücretsizdir.',
  },
  {
    id: 3,
    question: 'Fason üretim için minimum adet nedir?',
    answer:
      'Fason üretimde minimum adet ürün tipine ve işleme göre değişir. Kutu, kesim ve baskı işlerinde genelde belirli bir minimum adet uygulanır; bu bilgi teklif aşamasında netleştirilir. Küçük adetli özel üretim talepleriniz için iletişim formundan veya telefonla bize ulaşıp teklif alabilirsiniz.',
  },
  {
    id: 4,
    question: 'Kendi logomu kutuya bastırabilir miyim?',
    answer:
      'Evet. Hazır kutu çeşitlerimizden birini seçerek veya özel ölçü kutu üretimi ile kendi logonuzu, firma adınızı veya özel grafiklerinizi baskılı olarak ürettirebilirsiniz. Logo ve metinlerin baskıya uygun vektör veya yüksek çözünürlüklü dosya formatında iletilmesi gerekir. Üretim öncesi grafik onayı ile son görünümü onaylayıp siparişi kesinleştirirsiniz.',
  },
];

export default function SikcaSorulanSorularPage() {
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <div className="min-h-screen flex flex-col bg-white">      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2">Sıkça Sorulan Sorular</h1>
          <p className="text-lg text-gray-600 mb-10">
            Matbaa ve ambalaj siparişlerinizle ilgili merak ettikleriniz.
          </p>

          <div className="max-w-3xl">
            <div className="space-y-3">
              {faqs.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 flex-shrink-0 text-[#1e3a8a]" />
                      ) : (
                        <ChevronDown className="h-5 w-5 flex-shrink-0 text-[#1e3a8a]" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4 pt-0">
                        <p className="text-gray-700 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200 max-w-3xl">
            <p className="text-gray-700">
              <strong>Sorunuz burada yok mu?</strong>{' '}
              <a href="/kurumsal/iletisim" className="text-[#1e3a8a] font-medium hover:underline">
                İletişim
              </a>
              {' '}sayfamızdan bize yazabilir veya telefon ile ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </main>    </div>
  );
}
