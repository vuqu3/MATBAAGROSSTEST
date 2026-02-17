'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Building2, Mail, Lock, UserCircle, Phone, FileText, MapPin } from 'lucide-react';

const individualSchema = z.object({
  userType: z.literal('INDIVIDUAL'),
  name: z.string().min(1, 'Ad Soyad gereklidir'),
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  phoneNumber: z.string().optional(),
});

const corporateSchema = z.object({
  userType: z.literal('CORPORATE'),
  name: z.string().min(1, 'Yetkili adı soyadı gereklidir'),
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  phoneNumber: z.string().optional(),
  companyName: z.string().min(1, 'Şirket unvanı gereklidir'),
  taxOffice: z.string().min(1, 'Vergi dairesi gereklidir'),
  taxNumber: z.string().min(10, 'Vergi numarası 10 haneli olmalı').max(11, 'Vergi numarası 10 haneli olmalı'),
});

type IndividualForm = z.infer<typeof individualSchema>;
type CorporateForm = z.infer<typeof corporateSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'INDIVIDUAL' | 'CORPORATE'>('INDIVIDUAL');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const individualForm = useForm<IndividualForm>({
    resolver: zodResolver(individualSchema),
    defaultValues: { userType: 'INDIVIDUAL', name: '', email: '', password: '', phoneNumber: '' },
  });

  const corporateForm = useForm<CorporateForm>({
    resolver: zodResolver(corporateSchema),
    defaultValues: {
      userType: 'CORPORATE',
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      companyName: '',
      taxOffice: '',
      taxNumber: '',
    },
  });

  const onIndividualSubmit = async (data: IndividualForm) => {
    setSubmitError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Kayıt başarısız');
      router.push('/giris?registered=1');
      router.refresh();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Kayıt sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onCorporateSubmit = async (data: CorporateForm) => {
    setSubmitError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Kayıt başarısız');
      router.push('/giris?registered=1');
      router.refresh();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Kayıt sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex justify-center gap-2 mb-8">
          <span className="text-2xl font-bold text-[#FF6000]">Matbaa</span>
          <span className="text-2xl font-bold text-[#1e3a8a]">Gross</span>
        </Link>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <h1 className="text-xl font-bold text-[#1e3a8a] text-center pt-8 pb-2">
            Hesap Oluştur
          </h1>
          <p className="text-center text-gray-600 text-sm pb-6">
            Bireysel veya kurumsal hesap ile devam edin
          </p>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setTab('INDIVIDUAL')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                tab === 'INDIVIDUAL'
                  ? 'text-[#FF6000] border-b-2 border-[#FF6000] bg-orange-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={18} />
              Bireysel
            </button>
            <button
              type="button"
              onClick={() => setTab('CORPORATE')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                tab === 'CORPORATE'
                  ? 'text-[#FF6000] border-b-2 border-[#FF6000] bg-orange-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 size={18} />
              Kurumsal
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {submitError}
              </div>
            )}

            {tab === 'INDIVIDUAL' && (
              <form onSubmit={individualForm.handleSubmit(onIndividualSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...individualForm.register('name')}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                  {individualForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">{individualForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...individualForm.register('email')}
                      type="email"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                      placeholder="ornek@email.com"
                    />
                  </div>
                  {individualForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{individualForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şifre *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...individualForm.register('password')}
                      type="password"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                      placeholder="En az 6 karakter"
                    />
                  </div>
                  {individualForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{individualForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...individualForm.register('phoneNumber')}
                      type="tel"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#FF6000] hover:bg-[#e55a00] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                </button>
              </form>
            )}

            {tab === 'CORPORATE' && (
              <form onSubmit={corporateForm.handleSubmit(onCorporateSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Unvanı *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...corporateForm.register('companyName')}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                      placeholder="Şirket Adı Ltd. Şti."
                    />
                  </div>
                  {corporateForm.formState.errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{corporateForm.formState.errors.companyName.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi *</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...corporateForm.register('taxOffice')}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                        placeholder="Vergi Dairesi"
                      />
                    </div>
                    {corporateForm.formState.errors.taxOffice && (
                      <p className="mt-1 text-sm text-red-600">{corporateForm.formState.errors.taxOffice.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vergi No *</label>
                    <input
                      {...corporateForm.register('taxNumber')}
                      type="text"
                      maxLength={11}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                      placeholder="10 hane"
                    />
                    {corporateForm.formState.errors.taxNumber && (
                      <p className="mt-1 text-sm text-red-600">{corporateForm.formState.errors.taxNumber.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yetkili Adı Soyadı *</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...corporateForm.register('name')}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                      placeholder="Yetkili kişi adı"
                    />
                  </div>
                  {corporateForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">{corporateForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...corporateForm.register('email')}
                      type="email"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                      placeholder="siparis@sirket.com"
                    />
                  </div>
                  {corporateForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{corporateForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şifre *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...corporateForm.register('password')}
                      type="password"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                      placeholder="En az 6 karakter"
                    />
                  </div>
                  {corporateForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{corporateForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...corporateForm.register('phoneNumber')}
                      type="tel"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Kurumsal Kayıt Ol'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Zaten hesabınız var mı?{' '}
          <Link href="/giris" className="font-semibold text-[#FF6000] hover:text-[#e55a00]">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
