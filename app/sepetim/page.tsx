'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';

export default function SepetimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, updateQuantity, removeItem, totalAmount, totalCount } = useCart();

  const handleSiparisTamamla = () => {
    if (status !== 'authenticated' || !session?.user || session.user.role !== 'USER') {
      router.push('/giris?callbackUrl=/sepetim/onay');
      return;
    }
    if (items.length === 0) return;
    router.push('/sepetim/onay');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-4">
        <h1 className="text-xl font-semibold text-[#1e3a8a] mb-4 flex items-center gap-2">
          <ShoppingCart className="text-[#FF6000]" size={22} />
          Sepetim
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-600 mb-2">Sepetiniz boş.</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-[#FF6000] hover:bg-[#ea580c] text-white text-sm font-medium rounded-md transition-colors"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div
                  key={item.lineId}
                  className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm flex flex-wrap gap-3 items-center"
                >
                  <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.imageUrl && !item.imageUrl.includes('placeholder') ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Ürün</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/urun/${item.productId}`} className="font-medium text-sm text-[#1e3a8a] hover:text-[#FF6000] line-clamp-2">
                      {item.name}
                    </Link>
                    {item.options && Object.keys(item.options).length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {Object.entries(item.options)
                          .filter(([k, v]) => v != null && v !== '' && typeof v === 'string' && !['logoUploaded', 'fileName'].includes(k))
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                        {item.options.logoUploaded && item.options.fileName && (
                          <span className="block text-orange-600 text-xs">Dosya: {String(item.options.fileName)}</span>
                        )}
                      </p>
                    )}
                    <p className="text-[#FF6000] font-semibold text-sm mt-0.5">{item.totalPrice.toLocaleString('tr-TR')} TL</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.lineId, Math.max(100, item.quantity - 500))}
                      className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                      aria-label="Azalt"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center text-sm font-medium text-gray-700">{item.quantity.toLocaleString('tr-TR')}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.lineId, item.quantity + 500)}
                      className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                      aria-label="Artır"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.lineId)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    aria-label="Kaldır"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm sticky top-20">
                <h2 className="text-base font-semibold text-[#1e3a8a] mb-3">Sipariş Özeti</h2>
                <p className="text-xs text-gray-600 flex justify-between mb-1.5">
                  <span>Ürün sayısı</span>
                  <span>{items.length} kalem</span>
                </p>
                <p className="text-xs text-gray-600 flex justify-between mb-1.5">
                  <span>Toplam adet</span>
                  <span>{totalCount.toLocaleString('tr-TR')}</span>
                </p>
                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between text-base font-semibold text-[#1e3a8a]">
                  <span>Toplam</span>
                  <span className="text-[#FF6000]">{totalAmount.toLocaleString('tr-TR')} TL</span>
                </div>
                <button
                  type="button"
                  onClick={handleSiparisTamamla}
                  className="w-full mt-4 py-2.5 bg-[#FF6000] hover:bg-[#ea580c] text-white text-sm font-semibold rounded-md transition-colors"
                >
                  Siparişi Tamamla
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Siparişi tamamlamak için giriş yapmanız gerekir.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
