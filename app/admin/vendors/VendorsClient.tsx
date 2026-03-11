'use client';

import { useActionState, useEffect, useState } from 'react';
import { Pencil, Ban, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { quickAddSeller, type QuickAddSellerState } from './actions';

type Vendor = {
  id: string;
  name: string;
  slug: string;
  balance: number;
  isBlocked: boolean;
  subscriptionStatus?: string | null;
  subscriptionEndsAt?: string | null;
  owner: { email: string; name: string | null } | null;
};

export default function VendorsClient({ initialVendors }: { initialVendors: Vendor[] }) {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addState, addAction, addPending] = useActionState<QuickAddSellerState, FormData>(quickAddSeller, {
    ok: false,
  });

  useEffect(() => {
    setVendors(initialVendors);
  }, [initialVendors]);

  useEffect(() => {
    if (!addState) return;
    if (addState.ok) {
      setAddOpen(false);
      const msg = addState.message || 'Satıcı başarıyla oluşturuldu ve onaylandı!';
      setSuccess(msg);
      setToast(msg);
      router.refresh();
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
    if (addState.error) {
      setError(addState.error);
    }
  }, [addState, router]);

  const getSubscriptionBadge = (v: Vendor) => {
    const now = Date.now();
    const endsAt = v.subscriptionEndsAt ? new Date(v.subscriptionEndsAt).getTime() : null;
    const status = String(v.subscriptionStatus ?? '').toUpperCase();
    const daysLeft = endsAt ? Math.ceil((endsAt - now) / (24 * 60 * 60 * 1000)) : null;

    const expiredByDate = endsAt ? endsAt <= now : true;
    if (status === 'CANCELLED') {
      return { text: 'İptal Edildi', cls: 'bg-red-100 text-red-700 border-red-200' };
    }

    if (status === 'EXPIRED' || expiredByDate) {
      return { text: 'Süresi Doldu', cls: 'bg-amber-100 text-amber-800 border-amber-200' };
    }

    if (status === 'TRIAL') {
      const left = daysLeft != null ? `${daysLeft} Gün Kaldı` : 'Devam Ediyor';
      return { text: `Deneme • ${left}`, cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    }

    if (status === 'ACTIVE') {
      const left = daysLeft != null ? `${daysLeft} Gün Kaldı` : 'Aktif';
      return { text: `Aktif • ${left}`, cls: 'bg-blue-100 text-blue-700 border-blue-200' };
    }

    return { text: 'Bilinmiyor', cls: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  const toggleBlock = async (v: Vendor) => {
    const action = v.isBlocked ? 'aktif etmek' : 'engellemek';
    if (!confirm(`"${v.name}" satıcısını ${action} istediğinizden emin misiniz?`)) return;

    setLoadingId(v.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/vendors/${v.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !v.isBlocked }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'İşlem başarısız.');
        return;
      }
      const updated: Vendor = await res.json();
      setVendors((prev) => prev.map((x) => (x.id === v.id ? { ...x, isBlocked: updated.isBlocked } : x)));
    } catch {
      setError('Bir hata oluştu.');
    } finally {
      setLoadingId(null);
    }
  };

  const renewSubscription = async (v: Vendor) => {
    if (!confirm('Bu satıcının aboneliğini 1 ay (30 gün) uzatmak istediğinize emin misiniz?')) return;

    setLoadingId(v.id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/admin/vendors/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId: v.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'İşlem başarısız.');
        return;
      }
      const updated = (data?.vendor ?? null) as { id?: string; subscriptionStatus?: string | null; subscriptionEndsAt?: string | null } | null;
      if (updated?.id) {
        setVendors((prev) =>
          prev.map((x) =>
            x.id === updated.id
              ? { ...x, subscriptionStatus: updated.subscriptionStatus ?? x.subscriptionStatus, subscriptionEndsAt: updated.subscriptionEndsAt ?? x.subscriptionEndsAt }
              : x
          )
        );
      }
      setSuccess('Abonelik başarıyla uzatıldı');
    } catch {
      setError('Bir hata oluştu.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Satıcı Listesi</h1>
          <p className="mt-0.5 text-sm text-slate-500">Pazaryerine kayıtlı satıcılar</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF6000] px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-[#e55a00] transition-colors"
          >
            ➕ Yeni Satıcı Ekle
          </button>
          <span className="text-sm text-slate-400">{vendors.length} satıcı</span>
        </div>
      </div>

      {toast ? (
        <div className="fixed top-4 right-4 z-[9999]">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3 shadow-lg text-sm font-semibold">
            {toast}
          </div>
        </div>
      ) : null}

      {error && (
        <div className="mt-3 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-slate-200 bg-white overflow-hidden">
        {vendors.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Henüz satıcı yok.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Satıcı</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Abonelik Durumu / Süresi</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Bakiye</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Yetkili</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Durum / İşlem</th>
                <th className="px-4 py-3 text-center font-medium text-slate-700">Düzenle</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                (() => {
                  const badge = getSubscriptionBadge(v);
                  return (
                <tr
                  key={v.id}
                  className={`border-b border-slate-100 transition-colors ${
                    v.isBlocked ? 'bg-red-50/40' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-slate-800">{v.name}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{v.slug}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${badge.cls}`}>{badge.text}</span>
                      <button
                        type="button"
                        onClick={() => renewSubscription(v)}
                        disabled={loadingId === v.id}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
                        title="Aboneliği +30 gün uzat"
                      >
                        🗓️ +30 Gün
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v.balance)}
                  </td>

                  <td className="px-4 py-3 text-slate-500 text-xs">{v.owner?.email ?? '—'}</td>

                  {/* Durum / Blok toggle */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleBlock(v)}
                      disabled={loadingId === v.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                        v.isBlocked
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {v.isBlocked ? (
                        <>
                          <Ban size={12} />
                          Engelli
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={12} />
                          Aktif
                        </>
                      )}
                    </button>
                  </td>

                  {/* Düzenle */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <Link
                        href={`/admin/vendors/${v.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <Pencil size={12} />
                        Düzenle
                      </Link>
                    </div>
                  </td>
                </tr>
                  );
                })()
              ))}
            </tbody>
          </table>
        )}
      </div>

      {addOpen ? (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4" onClick={() => setAddOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Hızlı Satıcı Ekle</h2>
                <p className="text-sm text-slate-500 mt-0.5">Satıcı evrak sürecini atlayarak direkt onaylı oluşturulur.</p>
              </div>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={addAction} className="px-6 py-5 space-y-4">
              {addState?.error && !addState.ok ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {addState.error}
                </div>
              ) : null}

              <div>
                <label className="block text-sm font-semibold text-slate-800">Firma / Mağaza Adı <span className="text-red-500">*</span></label>
                <input
                  name="name"
                  required
                  placeholder="Örn: Quark Matbaa"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800">E-posta Adresi <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="ornek@firma.com"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800">Şifre <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="En az 6 karakter"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={addPending}
                  className="rounded-xl bg-[#FF6000] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#e55a00] disabled:opacity-60"
                >
                  {addPending ? 'Oluşturuluyor...' : 'Satıcıyı Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
