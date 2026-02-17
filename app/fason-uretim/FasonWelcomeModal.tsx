'use client';

import { useEffect, useState } from 'react';
import { X, Zap } from 'lucide-react';

interface FasonWelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FasonWelcomeModal({ open, onClose }: FasonWelcomeModalProps) {
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
      aria-labelledby="fason-welcome-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div
        className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700/50 bg-white shadow-2xl transition-all duration-300 ease-out ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 rounded-full"
          >
            <X className="h-4 w-4 stroke-[1.5]" />
          </button>

          <h1
            id="fason-welcome-title"
            className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight pr-10"
          >
            Değerli Meslektaşlarımız ve Çözüm Ortaklarımız, Hoş Geldiniz.
          </h1>

          <p className="mt-4 text-slate-600 text-sm leading-relaxed">
            Matbaagross Fason Üretim Merkezi ile Türkiye&apos;nin en geniş makine parkuru artık sizin hizmetinizde.
            Atıl kapasiteyi ortadan kaldırdık; anlaşmalı matbaalarımızın devasa üretim gücünü en uygun maliyetlerle size açıyoruz.
          </p>

          <div className="mt-5 p-4 rounded-lg border border-slate-200 bg-slate-50/80">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Kural — Nakit Akışı
            </p>
            <p className="text-slate-800 text-sm leading-relaxed">
              Fason üretim sistemimiz <strong>&quot;Nakit Akışına Dayalı Üretim&quot;</strong> modeliyle çalışmaktadır.
              Sipariş onayında ödeme tamamlanır, üretim bantları anında sizin için dönmeye başlar.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full py-3.5 rounded-lg font-semibold text-sm text-white bg-slate-800 hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Üretim Bantlarına Eriş
          </button>
        </div>
      </div>
    </div>
  );
}
