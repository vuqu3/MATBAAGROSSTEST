'use client';

import { useState } from 'react';
import { Check, Trash2, Phone, Mail, Building2, User, Package, UserPlus, X, Key, Mail as MailIcon } from 'lucide-react';

type Application = {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  productGroup: string;
  status: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
};

export default function SupplierApplicationsClient({ applications }: { applications: Application[] }) {
  const [apps, setApps] = useState<Application[]>(applications);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vendorModal, setVendorModal] = useState<{
    isOpen: boolean;
    application: Application | null;
    password: string;
    sendEmail: boolean;
  }>({
    isOpen: false,
    application: null,
    password: 'matbaagross123',
    sendEmail: true,
  });

  const updateStatus = async (id: string, status: 'REVIEWED' | 'REJECTED') => {
    setLoadingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/supplier-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'İşlem başarısız.');
        return;
      }
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch {
      setError('Bir hata oluştu.');
    } finally {
      setLoadingId(null);
    }
  };

  const createVendor = async () => {
    if (!vendorModal.application) return;
    
    setLoadingId(vendorModal.application.id);
    setError(null);
    
    try {
      const res = await fetch(`/api/supplier-applications/${vendorModal.application.id}/create-vendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password: vendorModal.password,
          sendEmail: vendorModal.sendEmail 
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Satıcı oluşturma başarısız.');
        return;
      }
      
      // Başvuruyu APPROVED durumuna güncelle
      setApps((prev) => prev.map((a) => 
        a.id === vendorModal.application!.id ? { ...a, status: 'APPROVED' as const } : a
      ));
      
      // Modal'ı kapat
      setVendorModal({ isOpen: false, application: null, password: 'matbaagross123', sendEmail: true });
      
    } catch {
      setError('Bir hata oluştu.');
    } finally {
      setLoadingId(null);
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm('Bu başvuruyu silmek istediğinizden emin misiniz?')) return;
    setLoadingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/supplier-applications/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Silme başarısız.');
        return;
      }
      setApps((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError('Bir hata oluştu.');
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Beklemede';
      case 'REVIEWED': return 'İncelendi';
      case 'APPROVED': return 'Onaylandı';
      case 'REJECTED': return 'Reddedildi';
      default: return status;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tedarikçi Başvuruları</h1>
          <p className="mt-0.5 text-sm text-slate-500">Onay bekleyen tedarikçi başvuruları</p>
        </div>
        <span className="text-sm text-slate-400">{apps.length} başvuru</span>
      </div>

      {error && (
        <div className="mt-3 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        {apps.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Henüz başvuru yok.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Tarih</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Firma</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Yetkili</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">İletişim</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Ürün Grubu</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Durum</th>
                <th className="px-4 py-3 text-center font-medium text-slate-700">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(app.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-800">{app.companyName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{app.contactName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs">{app.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Mail className="w-3 h-3" />
                        <span className="text-xs">{app.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{app.productGroup}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(app.status)}`}>
                      {getStatusText(app.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => setVendorModal({ ...vendorModal, isOpen: true, application: app })}
                            disabled={loadingId === app.id}
                            className="p-1.5 text-slate-400 hover:text-green-600 disabled:opacity-50"
                            title="Onayla ve Hesap Aç"
                          >
                            <UserPlus size={14} />
                          </button>
                          <button
                            onClick={() => updateStatus(app.id, 'REVIEWED')}
                            disabled={loadingId === app.id}
                            className="p-1.5 text-slate-400 hover:text-blue-600 disabled:opacity-50"
                            title="İncelendi olarak işaretle"
                          >
                            <Check size={14} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteApplication(app.id)}
                        disabled={loadingId === app.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-50"
                        title="Başvuruyu sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Satıcı Oluşturma Modal */}
      {vendorModal.isOpen && vendorModal.application && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Satıcı Hesabı Oluştur</h3>
              <button
                onClick={() => setVendorModal({ ...vendorModal, isOpen: false })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-slate-700">{vendorModal.application.companyName}</p>
                <p className="text-xs text-slate-500">{vendorModal.application.contactName}</p>
                <p className="text-xs text-slate-500">{vendorModal.application.email}</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Key size={16} />
                  Başlangıç Şifresi
                </label>
                <input
                  type="text"
                  value={vendorModal.password}
                  onChange={(e) => setVendorModal({ ...vendorModal, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Şifre belirleyin"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={vendorModal.sendEmail}
                  onChange={(e) => setVendorModal({ ...vendorModal, sendEmail: e.target.checked })}
                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="sendEmail" className="text-sm text-slate-700 flex items-center gap-2">
                  <MailIcon size={16} />
                  Satıcıya e-posta gönder
                </label>
              </div>

              {vendorModal.sendEmail && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    Satıcıya aşağıdaki bilgiler gönderilecek:
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    • Giriş adresi: /seller-login<br/>
                    • Geçici şifre: {vendorModal.password}<br/>
                    • Şifre değiştirme ve belge gönderme talimatları
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setVendorModal({ ...vendorModal, isOpen: false })}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                İptal
              </button>
              <button
                onClick={createVendor}
                disabled={loadingId === vendorModal.application.id || !vendorModal.password.trim()}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingId === vendorModal.application.id ? 'Oluşturuluyor...' : 'Hesabı Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
