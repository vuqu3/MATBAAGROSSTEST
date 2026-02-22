'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, User, Phone, FileText } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Ad Soyad gereklidir'),
  phoneNumber: z.string().optional(),
  companyName: z.string().optional(),
  taxOffice: z.string().optional(),
  taxNumber: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function FaturaBilgileriPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          reset({
            name: data.name ?? '',
            phoneNumber: data.phoneNumber ?? '',
            companyName: data.companyName ?? '',
            taxOffice: data.taxOffice ?? '',
            taxNumber: data.taxNumber ?? '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    setMessage('');
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Güncellenemedi');
      setMessage('Bilgileriniz güncellendi.');
    } catch {
      setMessage('Güncelleme sırasında bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-600">Yükleniyor...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1e3a8a] mb-6">Fatura Bilgileri</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6 max-w-xl">
        {message && (
          <div className={`p-4 rounded-lg text-sm ${message.includes('hata') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('name')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]"
              placeholder="Ad Soyad"
            />
          </div>
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('phoneNumber')}
              type="tel"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]"
              placeholder="05XX XXX XX XX"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Şirket Unvanı</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('companyName')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]"
              placeholder="Şirket Adı Ltd. Şti."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vergi Dairesi</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                {...register('taxOffice')}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]"
                placeholder="Vergi Dairesi"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vergi No</label>
            <input
              {...register('taxNumber')}
              type="text"
              maxLength={11}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]"
              placeholder="10 hane"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#FF6000] hover:bg-[#e55a00] text-white font-medium rounded-lg disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  );
}
