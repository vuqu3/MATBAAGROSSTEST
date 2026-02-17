'use client';

import { useEffect, useState } from 'react';
import { Users, TrendingDown, ShieldCheck, X, Star } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600'],
});

interface PremiumWelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

const HIGHLIGHTS = [
  {
    icon: Users,
    title: 'Tek Firmadan Fiyat Alma Devri Bitti!',
    description:
      "Talebiniz, sistemimizdeki 100'den fazla onaylı üretici tarafından görüntülenir.",
  },
  {
    icon: TrendingDown,
    title: 'En İyi Fiyat Garantisi',
    description:
      'Üreticilerden gelen teklifler arasından en uygun ve en kaliteli olanı Matbaagross sizin adınıza seçer ve sunar.',
  },
  {
    icon: ShieldCheck,
    title: 'Markanıza Özel Tasarım',
    description:
      'Sadece size özel ambalaj ve kurumsal kimlik çalışmaları profesyonel ekibimizce yönetilir.',
  },
];

export default function PremiumWelcomeModal({ open, onClose }: PremiumWelcomeModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(t);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-modal="true"
      role="dialog"
      aria-labelledby="welcome-modal-title"
    >
      <div
        className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Kart: kompakt, max-h sınırı */}
      <div
        className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-black/10 transition-all duration-300 ease-out ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Onaylı Üretici Rozeti — sol üst, taşan altın mühür */}
        <div
          className="absolute -top-6 -left-6 z-20 w-24 h-24 sm:w-28 sm:h-28 flex flex-col items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.5)] text-white"
          aria-hidden="true"
        >
          <Star className="h-5 w-5 sm:h-6 sm:w-6 fill-white stroke-white mb-0.5" strokeWidth={1.5} />
          <span className="text-lg sm:text-xl font-bold leading-none">100+</span>
          <span className="text-[8px] sm:text-[9px] font-medium leading-tight text-center mt-0.5 px-1">
            ONAYLI ÜRETİCİ HİZMETİNİZDE
          </span>
        </div>

        {/* İçerik: rozetin sağından başlar */}
        <div className="p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 focus:ring-offset-white rounded-full"
          >
            <X className="h-4 w-4 stroke-[1.5]" />
          </button>

          {/* Marka bloğu: rozetin sağında, fiziksel olarak çakışmayacak şekilde pl + pt */}
          <header className="flex flex-col items-start justify-center mb-4 pr-10 pl-24 pt-8 sm:pl-28 sm:pt-10">
            <div
              className="flex flex-row items-end gap-2"
              id="welcome-modal-title"
            >
              <span className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 tracking-tight">
                Matbaagross
              </span>
              <span className={`text-base sm:text-lg font-serif italic text-amber-600 pb-0.5 ${playfair.className}`}>
                Premium
              </span>
            </div>
            <h2 className="mt-3 text-sm font-medium text-slate-700 tracking-widest uppercase">
              Ayrıcalıklar Dünyası
            </h2>
            <div
              className="mt-3 h-px w-48 max-w-full bg-gradient-to-r from-gray-200 to-transparent"
              aria-hidden="true"
            />
          </header>

          {/* Maddeler: sıkı leading, küçük punto */}
          <div className="flex flex-col gap-3 mb-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-3">
                <Icon
                  className="flex-shrink-0 h-4 w-4 text-amber-600 stroke-[1.5] mt-0.5"
                />
                <div>
                  <h3 className="text-slate-700 text-sm font-bold mb-0.5 tracking-wide leading-tight">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-snug">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-amber-600 hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-white tracking-wide"
          >
            Teklif İstemeye Başla
          </button>

          {/* Güvence: en altta, çok küçük */}
          <div className="mt-4 text-center">
            <p className="text-[10px] sm:text-xs text-slate-500 leading-snug max-w-sm mx-auto italic">
              Siparişiniz, tedarik süreleri ve baskı kalitesi konusunda Matbaagross Kurumsal Güvencesi altındadır.
            </p>
            <ShieldCheck className="mx-auto mt-2 h-3.5 w-3.5 text-amber-600/60 stroke-[1.5]" />
          </div>
        </div>
      </div>
    </div>
  );
}
