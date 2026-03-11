'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, CheckCircle, AlertCircle, Send, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface QuoteRequestModalProps {
  productId: string;
  productName: string;
  onClose: () => void;
  /** Giriş yapılmış olsa bile iletişim alanlarını göster (ve oturumdan ön-doldur) */
  alwaysShowContact?: boolean;
  /** Gönder butonundaki metin */
  buttonLabel?: string;
  /** Başarı mesajı */
  successMessage?: string;
}

export default function QuoteRequestModal({
  productId,
  productName,
  onClose,
  alwaysShowContact = false,
  buttonLabel = 'Teklif Talebini Gönder',
  successMessage = 'Talebiniz üretici ağımıza iletilmiştir. En kısa sürede size fiyat teklifleri sunulacaktır.',
}: QuoteRequestModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isLoggedIn = !!session?.user;

  const [form, setForm] = useState({
    quantity: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  /* Oturumdan iletişim bilgilerini ön-doldur */
  useEffect(() => {
    if (alwaysShowContact && isLoggedIn && session?.user) {
      setForm((prev) => ({
        ...prev,
        contactName: (session.user as any).name ?? prev.contactName,
        contactEmail: (session.user as any).email ?? prev.contactEmail,
      }));
    }
  }, [alwaysShowContact, isLoggedIn, session]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Yükleme başarısız');
      const data = await res.json();
      setFileUrl(data.url ?? data.fileUrl ?? '');
    } catch {
      setResult({ ok: false, msg: 'Dosya yüklenemedi. Lütfen tekrar deneyin.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(form.quantity);
    if (!qty || qty <= 0) {
      setResult({ ok: false, msg: 'Geçerli bir adet girin.' });
      return;
    }
    if (!form.description.trim()) {
      setResult({ ok: false, msg: 'Açıklama alanı zorunludur.' });
      return;
    }
    const needContact = !isLoggedIn || alwaysShowContact;
    if (needContact) {
      if (!form.contactName.trim() || !form.contactEmail.trim() || !form.contactPhone.trim()) {
        setResult({ ok: false, msg: 'İletişim bilgilerini eksiksiz doldurun.' });
        return;
      }
    }

    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productName,
          quantity: qty,
          description: form.description,
          fileUrl: fileUrl || undefined,
          contactName: (!isLoggedIn || alwaysShowContact) ? form.contactName : undefined,
          contactEmail: (!isLoggedIn || alwaysShowContact) ? form.contactEmail : undefined,
          contactPhone: (!isLoggedIn || alwaysShowContact) ? form.contactPhone : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, msg: data?.error ?? 'Bir hata oluştu.' });
        return;
      }

      const createdRequestNo = typeof data?.requestNo === 'string' ? data.requestNo : '';

      // Redirect to success/registration page
      const email = (!isLoggedIn || alwaysShowContact) ? form.contactEmail : (session?.user?.email ?? '');
      const params = new URLSearchParams({
        ...(createdRequestNo ? { requestNo: createdRequestNo } : {}),
        productName,
        ...(email ? { email } : {}),
      });
      router.push(`/teklif-basarili?${params.toString()}`);
      onClose();
      return;
    } catch {
      setResult({ ok: false, msg: 'Bağlantı hatası. Lütfen tekrar deneyin.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <FileText className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900">{buttonLabel}</h2>
            </div>
            <p className="text-sm text-gray-500 line-clamp-1">{productName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {result?.ok ? (
            /* Başarı ekranı */
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-9 w-9 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Talebiniz Alındı!</h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">{result.msg}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                Kapat
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {result && !result.ok && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{result.msg}</span>
                </div>
              )}

              {/* Adet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İstenen Adet <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleInput}
                  min="1"
                  placeholder="Örn: 500"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detaylı Açıklama <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInput}
                  rows={4}
                  placeholder="Örn: 170gr kuşe, mat selefonlu, 4+0 baskı, 1000 adet..."
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                />
              </div>

              {/* Dosya Yükleme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tasarım / Teknik Dosya <span className="text-gray-400 font-normal">(Opsiyonel)</span>
                </label>
                <label className="flex items-center gap-3 w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-400 px-4 py-3 transition-colors">
                  <Upload className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500">
                    {uploading
                      ? 'Yükleniyor...'
                      : fileUrl
                        ? '✓ Dosya yüklendi'
                        : 'Dosya seç (PDF, PNG, AI vb.)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.ai,.eps,.zip"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* İletişim bilgileri */}
              {(!isLoggedIn || alwaysShowContact) && (
                <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 space-y-3">
                  <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">İletişim Bilgileri</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ad Soyad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        value={form.contactName}
                        onChange={handleInput}
                        placeholder="Adınız Soyadınız"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        E-posta <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={form.contactEmail}
                        onChange={handleInput}
                        placeholder="ornek@email.com"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Telefon <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={form.contactPhone}
                        onChange={handleInput}
                        placeholder="05xx xxx xx xx"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 text-sm transition-colors mt-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Gönderiliyor...' : buttonLabel}
              </button>

              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                Talebiniz premium üretici ağımıza iletilecek ve en kısa sürede dönüş yapılacaktır.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
