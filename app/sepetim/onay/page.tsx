'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '@/context/CartContext';
import { MapPin, CheckCircle } from 'lucide-react';

type Address = {
  id: string;
  type: string;
  title: string | null;
  city: string;
  district: string | null;
  line1: string;
  line2: string | null;
  postalCode: string | null;
};

export default function SepetOnayPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderDone, setOrderDone] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/giris?callbackUrl=/sepetim/onay');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'USER') {
      router.push('/');
      return;
    }
    if (status === 'authenticated' && items.length === 0 && !orderDone) {
      router.push('/sepetim');
      return;
    }
  }, [status, session, items.length, orderDone, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/user/addresses')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Address[]) => {
        setAddresses(data);
        if (data.length > 0 && !selectedAddressId) {
          const shipping = data.find((a) => a.type === 'SHIPPING') || data[0];
          setSelectedAddressId(shipping.id);
        }
      })
      .catch(() => setAddresses([]));
  }, [status]);

  const handleOnayla = async () => {
    if (!selectedAddressId || items.length === 0) {
      setError('Lütfen bir teslimat adresi seçin.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId,
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
            options: i.options,
            imageUrl: i.imageUrl,
            uploadedFileUrl: (i.options as { uploadedFileUrl?: string })?.uploadedFileUrl ?? null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Sipariş oluşturulamadı');
        setLoading(false);
        return;
      }
      setOrderId(data.id);
      clearCart();
      setOrderDone(true);
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && items.length === 0 && !orderDone)) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center py-16">
          <p className="text-gray-600">Yükleniyor...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderDone) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-lg w-full text-center shadow-sm">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-[#1e3a8a] mb-2">Siparişiniz Alındı!</h1>
            <p className="text-gray-600 mb-6">
              Ödeme için sizinle iletişime geçilecektir.
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 mb-6">Sipariş no: {orderId}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/hesabim/siparisler"
                className="inline-block px-6 py-2.5 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-medium rounded-lg transition-colors"
              >
                Siparişlerim
              </Link>
              <Link
                href="/"
                className="inline-block px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              >
                Alışverişe Devam
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1e3a8a] mb-6">Siparişi Onayla</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="text-[#FF6000]" size={22} />
              Teslimat Adresi
            </h2>
            {addresses.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-gray-600 mb-4">Kayıtlı teslimat adresiniz yok.</p>
                <Link
                  href="/hesabim/adresler"
                  className="inline-block px-4 py-2 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-lg text-sm"
                >
                  Adres Ekle
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.filter((a) => a.type === 'SHIPPING' || !addresses.some((x) => x.type === 'SHIPPING')).map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      selectedAddressId === addr.id
                        ? 'border-[#FF6000] bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1"
                    />
                    <div>
                      {addr.title && <span className="font-medium text-gray-900">{addr.title} · </span>}
                      <span className="text-gray-600">
                        {addr.line1}
                        {addr.line2 && `, ${addr.line2}`} — {addr.district && `${addr.district}, `}
                        {addr.city}
                        {addr.postalCode && ` ${addr.postalCode}`}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Özet</h2>
            <p className="text-gray-600 mb-2">{items.length} kalem ürün</p>
            <p className="text-xl font-bold text-[#FF6000] mb-6">
              Toplam: {totalAmount.toLocaleString('tr-TR')} TL
            </p>
            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}
            <button
              type="button"
              onClick={handleOnayla}
              disabled={loading || addresses.length === 0}
              className="w-full py-3 bg-[#FF6000] hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'İşleniyor...' : 'Siparişi Onayla'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
