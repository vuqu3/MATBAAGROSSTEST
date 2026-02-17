'use client';

import { useEffect, useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import Link from 'next/link';

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

export default function AdreslerPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'SHIPPING',
    title: '',
    city: '',
    district: '',
    line1: '',
    line2: '',
    postalCode: '',
  });

  const load = () => {
    fetch('/api/user/addresses', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Address[]) => setAddresses(Array.isArray(data) ? data : []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.city.trim() || !form.line1.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses((prev) => [...prev, data]);
        setForm({ type: 'SHIPPING', title: '', city: '', district: '', line1: '', line2: '', postalCode: '' });
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a8a] mb-6">Adreslerim</h1>
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a8a]">Adreslerim</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF6000] hover:bg-[#ea580c] text-white font-medium rounded-lg transition-colors"
        >
          <Plus size={18} />
          Yeni Adres
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Yeni adres ekle</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tür</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
              >
                <option value="SHIPPING">Teslimat</option>
                <option value="BILLING">Fatura</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlık (opsiyonel)</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Örn. Merkez, Şube"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şehir *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres satırı 1 *</label>
              <input
                type="text"
                value={form.line1}
                onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres satırı 2</label>
              <input
                type="text"
                value={form.line2}
                onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posta kodu</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-medium rounded-lg disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <MapPin className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-600 mb-2">Kayıtlı adresiniz bulunmuyor.</p>
          <p className="text-sm text-gray-500 mb-4">
            Sipariş verebilmek için en az bir teslimat adresi ekleyin.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-block px-6 py-2.5 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-medium rounded-lg transition-colors"
          >
            Adres Ekle
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-wrap items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <MapPin className="text-[#FF6000] flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-2">
                    {addr.type === 'SHIPPING' ? 'Teslimat' : 'Fatura'}
                  </span>
                  {addr.title && <span className="font-medium text-gray-900">{addr.title}</span>}
                  <p className="text-gray-600 mt-1">
                    {addr.line1}
                    {addr.line2 && `, ${addr.line2}`}
                    <br />
                    {addr.district && `${addr.district}, `}
                    {addr.city}
                    {addr.postalCode && ` ${addr.postalCode}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {addresses.length > 0 && (
        <p className="mt-6 text-sm text-gray-500">
          <Link href="/" className="text-[#FF6000] hover:underline">
            Alışverişe devam et
          </Link>
        </p>
      )}
    </div>
  );
}
