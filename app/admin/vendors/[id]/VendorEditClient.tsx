'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Key, Save, Eye, EyeOff, Mail, Phone, Building2, User } from 'lucide-react';

type Vendor = {
  id: string;
  name: string;
  slug: string;
  commissionRate: number;
  balance: number;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    email: string;
    name: string | null;
    phoneNumber: string | null;
    companyName: string | null;
    taxOffice: string | null;
    taxNumber: string | null;
  } | null;
};

export default function VendorEditClient({ vendor }: { vendor: Vendor }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    vendorName: vendor.name,
    commissionRate: vendor.commissionRate,
    isBlocked: vendor.isBlocked,
    userName: vendor.owner?.name || '',
    userPhone: vendor.owner?.phoneNumber || '',
    userTaxOffice: vendor.owner?.taxOffice || '',
    userTaxNumber: vendor.owner?.taxNumber || '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Password validation
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır');
        setLoading(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Şifreler eşleşmiyor');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorName: formData.vendorName,
          commissionRate: formData.commissionRate,
          isBlocked: formData.isBlocked,
          userName: formData.userName,
          userPhone: formData.userPhone,
          userTaxOffice: formData.userTaxOffice,
          userTaxNumber: formData.userTaxNumber,
          newPassword: formData.newPassword || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Güncelleme başarısız');
        return;
      }

      setSuccess('Satıcı bilgileri başarıyla güncellendi');
      
      // Password field'ları temizle
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
      }));

    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Satıcı Listesine Dön
        </button>
        
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Satıcı Düzenle</h1>
        <p className="mt-1 text-sm text-slate-500">
          {vendor.owner?.email} • {vendor.name}
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vendor Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Satıcı Bilgileri</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Satıcı Adı
                </label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Komisyon Oranı (%)
                </label>
                <input
                  type="number"
                  name="commissionRate"
                  value={formData.commissionRate}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isBlocked"
                  checked={formData.isBlocked}
                  onChange={handleInputChange}
                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-slate-700">Satıcıyı Engelle</span>
              </label>
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Yetkili Bilgileri</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <User className="inline w-3 h-3 mr-1" />
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Phone className="inline w-3 h-3 mr-1" />
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="userPhone"
                    value={formData.userPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Building2 className="inline w-3 h-3 mr-1" />
                    Vergi Dairesi
                  </label>
                  <input
                    type="text"
                    name="userTaxOffice"
                    value={formData.userTaxOffice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Vergi No
                  </label>
                  <input
                    type="text"
                    name="userTaxNumber"
                    value={formData.userTaxNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              <Key className="inline w-4 h-4 mr-1" />
              Şifre Güncelle
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Yeni şifre (boş bırakırsanız değiştirilmez)"
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Şifre Tekrarı
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Yeni şifre tekrarı"
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
