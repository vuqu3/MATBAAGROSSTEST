'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Upload, Send, X, AlertCircle, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';

type SmartQuoteFormProps = {
  variant?: 'modal' | 'inline';
  productId?: string | null;
  productName?: string | null;
  minOrderQuantity?: number | null;
  preferredVendorId?: string | null;
  onClose?: () => void;
  successRedirect?: boolean;
  className?: string;
  title?: string;
};

export default function SmartQuoteForm({
  variant = 'inline',
  productId = null,
  productName = null,
  minOrderQuantity = null,
  preferredVendorId = null,
  onClose,
  successRedirect = true,
  className,
  title,
}: SmartQuoteFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const isProductMode = Boolean(productId && productName);

  const [what, setWhat] = useState(() => (isProductMode ? '' : (productName || '')));
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qtyNumber = useMemo(() => {
    const n = Number(quantity);
    return Number.isFinite(n) ? n : NaN;
  }, [quantity]);

  const moqError = useMemo(() => {
    if (!isProductMode) return null;
    if (!minOrderQuantity || minOrderQuantity <= 0) return null;
    if (!Number.isFinite(qtyNumber) || qtyNumber <= 0) return null;
    if (qtyNumber < minOrderQuantity) return `Bu ürün için minimum sipariş adedi ${minOrderQuantity} adettir.`;
    return null;
  }, [isProductMode, minOrderQuantity, qtyNumber]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload/customer-file', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Dosya yüklenemedi');
      const url = typeof data?.url === 'string' ? data.url : '';
      setFileUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dosya yüklenemedi');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sessionEmail = String(session?.user?.email || '').trim();
    const sessionPhone = String(session?.user?.phoneNumber || '').trim();
    const email = (isLoggedIn ? sessionEmail : contactEmail.trim());
    const phone = (isLoggedIn ? sessionPhone : contactPhone.trim());

    if (!isLoggedIn) {
      if (!email) {
        setError('E-posta adresi zorunludur.');
        return;
      }
      if (!phone) {
        setError('Telefon numarası zorunludur.');
        return;
      }
    } else {
      if (!email) {
        setError('Hesabınızda e-posta bilgisi bulunamadı.');
        return;
      }
      if (!phone) {
        setError('Hesabınızda telefon bilgisi bulunamadı.');
        return;
      }
    }

    const q = Number(quantity);
    if (!Number.isFinite(q) || q <= 0) {
      setError('Geçerli bir adet girin.');
      return;
    }
    if (moqError) {
      setError(moqError);
      return;
    }

    const finalProductName = isProductMode ? String(productName) : what.trim();
    if (!finalProductName) {
      setError('Ne ürettirmek istediğinizi yazın.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productName: productName || what,
          preferredVendorId,
          quantity: q,
          description: note || what,
          technicalDetails: '',
          fileUrl,
          contactName: '',
          contactEmail: email,
          contactPhone: phone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'Bir hata oluştu.');
        return;
      }

      const createdRequestNo = typeof data?.requestNo === 'string' ? data.requestNo : '';

      if (successRedirect) {
        const params = new URLSearchParams({
          ...(createdRequestNo ? { requestNo: createdRequestNo } : {}),
          ...(finalProductName ? { productName: finalProductName } : {}),
        });
        router.push(`/teklif-basarili?${params.toString()}`);
      }

      if (variant === 'modal') {
        onClose?.();
      } else {
        setWhat('');
        setQuantity('');
        setNote('');
        setContactEmail('');
        setContactPhone('');
        setFileUrl('');
      }
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const body = (
    <form onSubmit={submit} className={className || 'space-y-4'}>
      {title ? <h2 className="text-lg font-bold text-gray-900">{title}</h2> : null}

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {isProductMode ? (
        <div className="rounded-xl bg-orange-50 border border-orange-200 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-orange-700">Seçilen Ürün</div>
          <div className="text-sm font-bold text-gray-900 mt-0.5">{productName}</div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-gray-900">Ne Ürettirmek İstiyorsunuz?</label>
          <input
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Örn: Pizza kutusu, karton bardak, etiket..."
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-900">İstenen Adet</label>
        <input
          type="number"
          inputMode="numeric"
          min={isProductMode && minOrderQuantity ? minOrderQuantity : 1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
            moqError ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white'
          }`}
          placeholder={isProductMode && minOrderQuantity ? `Min: ${minOrderQuantity}` : 'Örn: 1000'}
          required
        />
        {moqError ? <p className="mt-1.5 text-xs text-red-600 font-medium">{moqError}</p> : null}
      </div>

      {isProductMode ? (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-900">Tasarım / Logonuz <span className="text-gray-400 font-normal">(Opsiyonel)</span></label>
            <label className="mt-2 flex items-center gap-3 w-full cursor-pointer rounded-xl border-2 border-dashed border-slate-200 hover:border-orange-400 bg-slate-50 px-4 py-3 transition-colors">
              <Upload className="h-5 w-5 text-slate-500 flex-shrink-0" />
              <span className="text-sm text-slate-700 truncate">
                {uploading ? 'Yükleniyor...' : fileUrl ? '✓ Dosya yüklendi' : 'Dosya seç (PDF, AI, EPS, PNG, JPG...)'}
              </span>
              <input
                type="file"
                accept=".pdf,.ai,.eps,.png,.jpg,.jpeg,.svg,.webp,.gif"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {fileUrl ? (
              <a href={fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-blue-700 hover:underline">
                <FileText className="h-4 w-4" />
                Yüklenen dosyayı görüntüle
              </a>
            ) : null}
          </div>

          {!isLoggedIn ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Zaten üye misiniz? Hızlı işlem için{' '}
              <Link
                href={`/giris?callbackUrl=${encodeURIComponent(pathname || '/')}`}
                className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
              >
                Giriş Yap
              </Link>
            </div>
          ) : null}

          {!isLoggedIn ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-900">E-posta Adresi</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Size ulaşabileceğimiz e-posta adresiniz"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900">Telefon Numarası</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Teklif hazır olduğunda bilgi verilecek numara"
                  required
                />
              </div>
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-semibold text-gray-900">Ek Notlarınız <span className="text-gray-400 font-normal">(Opsiyonel)</span></label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Örn: Logomuzu ortalayın..."
            />
          </div>
        </>
      ) : null}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 text-sm transition-colors"
      >
        <Send className="h-4 w-4" />
        {submitting ? 'Gönderiliyor...' : 'Teklif İste'}
      </button>
    </form>
  );

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4" onClick={() => onClose?.()}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl z-10">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <FileText className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-bold text-gray-900">{title || (isProductMode ? 'Teklif İste' : 'Hızlı Teklif')}</h2>
              </div>
              <p className="text-sm text-gray-500 line-clamp-1">{isProductMode ? productName : 'Talebinizi hızlıca gönderin'}</p>
            </div>
            <button
              type="button"
              onClick={() => onClose?.()}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5">{body}</div>
        </div>
      </div>
    );
  }

  return body;
}
