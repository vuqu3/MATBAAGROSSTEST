'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin } from 'lucide-react';

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string | null;
};

type Address = {
  line1: string;
  line2?: string | null;
  district?: string | null;
  city: string;
  postalCode?: string | null;
  title?: string | null;
};

type Order = {
  id: string;
  barcode?: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  address: Address;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Beklemede',
  PROCESSING: 'Hazırlanıyor',
  SHIPPED: 'Kargoya Verildi',
  COMPLETED: 'Teslim Edildi',
};

export default function SiparisDetayPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data: Order | null) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-2">
        <p className="text-gray-500 text-sm">Yükleniyor...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-2">
        <p className="text-gray-600 text-sm mb-4">Sipariş bulunamadı.</p>
        <Link href="/hesabim/siparisler" className="text-sm font-medium text-[#1e3a8a] hover:underline">
          ← Siparişlerime dön
        </Link>
      </div>
    );
  }

  return (
    <div className="py-2">
      <Link
        href="/hesabim/siparisler"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#1e3a8a] mb-4"
      >
        <ArrowLeft size={16} />
        Siparişlerime dön
      </Link>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Sipariş {order.barcode || `#${order.id.slice(-8)}`}
            </h1>
            <p className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleString('tr-TR')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
              order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800' :
              order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
            <span className="font-semibold text-[#1e3a8a]">
              {Number(order.totalAmount).toLocaleString('tr-TR')} TL
            </span>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
            <MapPin size={12} />
            Teslimat Adresi
          </h2>
          <p className="text-sm text-gray-700">
            {order.address.title && `${order.address.title}, `}
            {order.address.line1}
            {order.address.line2 && `, ${order.address.line2}`}
            {order.address.district && `, ${order.address.district}`}
            {order.address.city}
            {order.address.postalCode && ` ${order.address.postalCode}`}
          </p>
        </div>
        <div className="px-4 py-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ürünler</h2>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={item.imageUrl || '/placeholder-product.svg'}
                    alt={item.productName}
                    fill
                    className="object-contain"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-500">{item.quantity} adet × {Number(item.unitPrice).toLocaleString('tr-TR')} TL</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {Number(item.totalPrice).toLocaleString('tr-TR')} TL
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
