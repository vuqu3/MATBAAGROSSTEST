'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cleanupTestData } from '../actions/cleanupTestData';

export default function TestDataCleanupButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onClick = async () => {
    const ok = window.confirm(
      'Tüm test siparişleri ve teklifleri silinecek, ama ürünler kalacak. Emin misiniz?'
    );
    if (!ok) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await cleanupTestData();
      setSuccess('Test verileri temizlendi.');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? 'Temizleniyor...' : 'Test Verilerini Temizle'}
      </button>

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
          {success}
        </div>
      )}
    </div>
  );
}
