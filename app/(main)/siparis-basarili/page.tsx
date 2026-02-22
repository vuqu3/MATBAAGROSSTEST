'use client';

import Link from 'next/link';
import { CheckCircle, ShoppingBag, Home, Package } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SiparisBasariliPage() {
  const [orderNumber] = useState(() =>
    'MG' + Date.now().toString().slice(-8)
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div
        className={`max-w-md w-full text-center transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center shadow-lg shadow-green-100">
            <CheckCircle size={52} className="text-green-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          Siparişiniz Alındı!
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Ödemeniz başarıyla gerçekleşti. Siparişiniz en kısa sürede hazırlanacaktır.
        </p>

        {/* Order number card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mb-2">
            <Package size={14} />
            <span className="uppercase tracking-widest font-semibold">Sipariş Numaranız</span>
          </div>
          <div className="text-2xl font-black text-[#FF6000] tracking-widest">
            #{orderNumber}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Bu numarayı not alın. Sipariş takibinde kullanabilirsiniz.
          </p>
        </div>

        {/* Info boxes */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-left shadow-sm">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tahmini Teslimat</div>
            <div className="text-sm font-bold text-gray-800">3–5 İş Günü</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-left shadow-sm">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bildirim</div>
            <div className="text-sm font-bold text-gray-800">E-posta ile</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Home size={16} />
            Ana Sayfa
          </Link>
          <Link
            href="/urunler"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF6000] to-[#ea580c] text-white text-sm font-bold hover:from-[#ea580c] hover:to-[#c2410c] transition-all shadow-lg shadow-orange-200"
          >
            <ShoppingBag size={16} />
            Alışverişe Devam
          </Link>
        </div>
      </div>
    </div>
  );
}
