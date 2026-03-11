/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function SellerSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword) {
      setMessage({ type: 'err', text: 'Lütfen mevcut şifre ve yeni şifre alanlarını doldurun.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/seller/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage({ type: 'err', text: data?.error ?? 'Şifre güncellenemedi.' });
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setMessage({ type: 'ok', text: 'Şifreniz başarıyla güncellendi.' });
    } catch {
      setMessage({ type: 'err', text: 'Bağlantı hatası. Lütfen tekrar deneyin.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mağaza Ayarları</h1>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 max-w-xl">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Lock className="h-5 w-5 text-[#FF6000]" />
          Şifre Değiştir
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Güvenliğiniz için şifrenizi düzenli aralıklarla güncellemenizi öneririz.
        </p>

        {message && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm flex items-start gap-2 ${
              message.type === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {message.type === 'ok' ? <CheckCircle className="h-5 w-5 mt-0.5" /> : <AlertCircle className="h-5 w-5 mt-0.5" />}
            <span className="leading-relaxed">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-[#FF6000]"
              autoComplete="current-password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-[#FF6000]"
              autoComplete="new-password"
              required
              minLength={6}
            />
            <p className="mt-1 text-xs text-gray-500">En az 6 karakter olmalıdır.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#FF6000] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e55a00] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  );
}
