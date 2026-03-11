'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Trash2, Phone, Mail, Building2, User, Package, UserPlus, X } from 'lucide-react';

type Application = {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  companyDetails?: string | null;
  companyType?: string | null;
  taxNumber?: string | null;
  city?: string | null;
  district?: string | null;
  taxPlateUrl?: string | null;
  tradeRegistryUrl?: string | null;
  signatureCircularUrl?: string | null;
  identityDocumentUrl?: string | null;
  isKvkkAccepted?: boolean;
  productGroup: string;
  status: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
};

export default function SupplierApplicationsClient({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>(applications);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inspectModal, setInspectModal] = useState<{ isOpen: boolean; application: Application | null }>({
    isOpen: false,
    application: null,
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

  const updateStatusWithNotify = async (
    id: string,
    status: 'REVIEWED' | 'REJECTED',
    notify: 'MISSING_DOCS' | 'REJECTED'
  ) => {
    setLoadingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/supplier-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notify }),
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

  const approveApplication = async (app: Application) => {
    const ok = confirm('Bu başvuruyu onaylamak istediğinizden emin misiniz?');
    if (!ok) return;
    setLoadingId(app.id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/supplier-applications/${app.id}/create-vendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sendEmail: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Onay başarısız.');
        return;
      }
      setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, status: 'APPROVED' as const } : a)));
      setInspectModal({ isOpen: false, application: null });
      setSuccess('Başvuru başarıyla onaylandı ve satıcı paneli açıldı.');
      router.refresh();
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
          <h1 className="text-xl font-semibold text-slate-900">Premium Üretici Başvuruları</h1>
          <p className="mt-0.5 text-sm text-slate-500">Onay bekleyen premium üretici başvuruları</p>
        </div>
        <span className="text-sm text-slate-400">{apps.length} başvuru</span>
      </div>

      {error && (
        <div className="mt-3 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm">
          {success}
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
                <th className="px-4 py-3 text-left font-medium text-slate-700">Vergi / Lokasyon</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">İletişim</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Ürün Grubu</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">KVKK</th>
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
                      <div className="text-xs text-slate-700">
                        <span className="font-medium">Vergi No:</span> {app.taxNumber || '—'}
                      </div>
                      <div className="text-xs text-slate-600">
                        {app.city || '—'}{app.district ? ` / ${app.district}` : ''}
                      </div>
                      {app.companyType && (
                        <div className="text-[11px] text-slate-500">{app.companyType}</div>
                      )}
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
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        app.isKvkkAccepted ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {app.isKvkkAccepted ? 'Kabul' : 'Yok'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(app.status)}`}> 
                      {getStatusText(app.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setInspectModal({ isOpen: true, application: app })}
                        className="px-2 py-1 text-xs font-medium rounded-md bg-slate-900 text-white hover:bg-slate-800"
                        title="Başvuruyu incele"
                      >
                        🔍 İncele
                      </button>
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => approveApplication(app)}
                            disabled={loadingId === app.id}
                            className="p-1.5 text-slate-400 hover:text-green-600 disabled:opacity-50"
                            title="Onayla"
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

      {/* Başvuru İnceleme Modal */}
      {inspectModal.isOpen && inspectModal.application && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Başvuru İncele</h3>
                <p className="text-xs text-slate-500">Detaylı evrak ve firma bilgisi kontrol ekranı</p>
              </div>
              <button
                onClick={() => setInspectModal({ isOpen: false, application: null })}
                className="text-slate-400 hover:text-slate-600"
                title="Kapat"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">Firma Detayları</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 mt-0.5 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500">Firma Adı</div>
                        <div className="font-medium text-slate-900">{inspectModal.application.companyName}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 mt-0.5 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500">Yetkili Kişi</div>
                        <div className="font-medium text-slate-900">{inspectModal.application.contactName}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 mt-0.5 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500">Telefon</div>
                        <div className="font-medium text-slate-900">{inspectModal.application.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 mt-0.5 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500">E-posta</div>
                        <div className="font-medium text-slate-900">{inspectModal.application.email}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100" />

                    <div className="text-xs text-slate-600">
                      <span className="font-medium text-slate-700">Vergi No:</span> {inspectModal.application.taxNumber || '—'}
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="font-medium text-slate-700">Lokasyon:</span> {inspectModal.application.city || '—'}
                      {inspectModal.application.district ? ` / ${inspectModal.application.district}` : ''}
                    </div>
                    {inspectModal.application.companyType && (
                      <div className="text-xs text-slate-600">
                        <span className="font-medium text-slate-700">Şirket Tipi:</span> {inspectModal.application.companyType}
                      </div>
                    )}

                    {inspectModal.application.companyDetails && (
                      <div className="pt-3 border-t border-slate-100">
                        <div className="text-xs font-semibold text-slate-700">Firma Kapasitesi ve Makine Parkuru</div>
                        <div className="mt-1 text-xs text-slate-600 whitespace-pre-wrap">
                          {inspectModal.application.companyDetails}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">Resmi Evraklar</h4>
                  <div className="space-y-3">
                    {([
                      { key: 'taxPlateUrl', title: 'Vergi Levhası', url: inspectModal.application.taxPlateUrl },
                      { key: 'tradeRegistryUrl', title: 'Ticaret Sicil Gazetesi', url: inspectModal.application.tradeRegistryUrl },
                      { key: 'signatureCircularUrl', title: 'İmza Sirküsü', url: inspectModal.application.signatureCircularUrl },
                      { key: 'identityDocumentUrl', title: 'Yetkili Kimlik', url: inspectModal.application.identityDocumentUrl },
                    ] as const).map((doc) => (
                      <div key={doc.key} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{doc.title}</div>
                          {doc.url ? (
                            <div className="text-[11px] text-slate-500 break-all">{doc.url}</div>
                          ) : (
                            <div className="text-[11px] font-medium text-red-600">Evrak Yüklenmemiş</div>
                          )}
                        </div>
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 ml-3 inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50"
                          >
                            📄 Görüntüle / İndir
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => approveApplication(inspectModal.application!)}
                  disabled={loadingId === inspectModal.application.id}
                  className="w-full rounded-xl bg-emerald-600 text-white px-4 py-3 font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  🟢 Başvuruyu Onayla
                </button>
                <button
                  onClick={async () => {
                    await updateStatusWithNotify(inspectModal.application.id, 'REVIEWED', 'MISSING_DOCS');
                    setInspectModal({ isOpen: false, application: null });
                  }}
                  disabled={loadingId === inspectModal.application.id}
                  className="w-full rounded-xl bg-amber-500 text-white px-4 py-3 font-semibold hover:bg-amber-600 disabled:opacity-50"
                >
                  🟡 Eksik Evrak İste
                </button>
                <button
                  onClick={async () => {
                    await updateStatusWithNotify(inspectModal.application.id, 'REJECTED', 'REJECTED');
                    setInspectModal({ isOpen: false, application: null });
                  }}
                  disabled={loadingId === inspectModal.application.id}
                  className="w-full rounded-xl bg-red-600 text-white px-4 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  🔴 Reddet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
