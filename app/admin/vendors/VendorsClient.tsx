'use client';

import { useState } from 'react';
import { Pencil, Check, X, Ban, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

type Vendor = {
  id: string;
  name: string;
  slug: string;
  commissionRate: number;
  balance: number;
  isBlocked: boolean;
  owner: { email: string; name: string | null } | null;
};

export default function VendorsClient({ initialVendors }: { initialVendors: Vendor[] }) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState<string>('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (v: Vendor) => {
    setEditingId(v.id);
    setEditRate(String(v.commissionRate));
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRate('');
    setError(null);
  };

  const saveCommission = async (id: string) => {
    const rate = parseFloat(editRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setError('Geçerli bir oran girin (0-100).');
      return;
    }
    setLoadingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionRate: rate }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Güncelleme başarısız.');
        return;
      }
      const updated: Vendor = await res.json();
      setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, commissionRate: updated.commissionRate } : v)));
      setEditingId(null);
    } catch {
      setError('Bir hata oluştu.');
    } finally {
      setLoadingId(null);
    }
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

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Satıcı Listesi</h1>
          <p className="mt-0.5 text-sm text-slate-500">Pazaryerine kayıtlı satıcılar</p>
        </div>
        <span className="text-sm text-slate-400">{vendors.length} satıcı</span>
      </div>

      {error && (
        <div className="mt-3 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
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
                <th className="px-4 py-3 text-left font-medium text-slate-700">Komisyon</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Bakiye</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Yetkili</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Durum / İşlem</th>
                <th className="px-4 py-3 text-center font-medium text-slate-700">Düzenle</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr
                  key={v.id}
                  className={`border-b border-slate-100 transition-colors ${
                    v.isBlocked ? 'bg-red-50/40' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-slate-800">{v.name}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{v.slug}</td>

                  {/* Komisyon — düzenlenebilir */}
                  <td className="px-4 py-3">
                    {editingId === v.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">%</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                          className="w-16 border border-slate-300 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => saveCommission(v.id)}
                          disabled={loadingId === v.id}
                          className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                          title="Kaydet"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-slate-400 hover:text-slate-600"
                          title="İptal"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">%{v.commissionRate}</span>
                        <button
                          onClick={() => startEdit(v)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Komisyonu düzenle"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                    )}
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
