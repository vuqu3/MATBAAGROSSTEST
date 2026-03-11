'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, FileText, Send, X } from 'lucide-react';

type Props = {
  preferredVendorId: string;
  vendorName: string;
};

export default function SpecialQuoteCta({ preferredVendorId, vendorName }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6000] px-5 py-3 text-white font-extrabold shadow-[0_15px_40px_rgba(255,96,0,0.22)] hover:bg-[#e55a00] transition-colors"
      >
        📝 Bu Üreticiden Fiyat Teklifi Al
      </button>

      {open ? (
        <SpecialQuoteModal
          preferredVendorId={preferredVendorId}
          vendorName={vendorName}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function SpecialQuoteModal({
  preferredVendorId,
  vendorName,
  onClose,
}: {
  preferredVendorId: string;
  vendorName: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    description: '',
    quantity: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const qty = useMemo(() => Number(form.quantity), [form.quantity]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!form.description.trim()) {
      setResult({ ok: false, msg: 'Ürün/Hizmet detayı zorunludur.' });
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      setResult({ ok: false, msg: 'Geçerli bir adet girin.' });
      return;
    }
    if (!form.contactPhone.trim()) {
      setResult({ ok: false, msg: 'Telefon numarası zorunludur.' });
      return;
    }
    if (!form.contactEmail.trim()) {
      setResult({ ok: false, msg: 'E-posta adresi zorunludur.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredVendorId,
          productName: `Özel Teklif (${vendorName})`,
          quantity: qty,
          description: form.description,
          contactName: form.contactName.trim() || undefined,
          contactPhone: form.contactPhone.trim(),
          contactEmail: form.contactEmail.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ ok: false, msg: data?.error ?? 'Bir hata oluştu.' });
        return;
      }

      setResult({
        ok: true,
        msg: 'Talebiniz üreticiye iletildi. En kısa sürede size dönüş yapılacaktır.',
      });
    } catch {
      setResult({ ok: false, msg: 'Bağlantı hatası. Lütfen tekrar deneyin.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <FileText className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900">Özel Teklif İste</h2>
            </div>
            <p className="text-sm text-gray-500 line-clamp-1">{vendorName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {result?.ok ? (
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
            <form onSubmit={submit} className="space-y-4">
              {result && !result.ok ? (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{result.msg}</span>
                </div>
              ) : null}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün/Hizmet Detayı <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={5}
                  placeholder="Örn: 170gr kuşe, mat selefon, 4+0 baskı, teslim süresi..."
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İstenen Adet <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={onChange}
                  min="1"
                  placeholder="Örn: 1000"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 space-y-3">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">İletişim Bilgileri</p>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    name="contactName"
                    value={form.contactName}
                    onChange={onChange}
                    placeholder="Adınız Soyadınız"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Telefon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={form.contactPhone}
                      onChange={onChange}
                      placeholder="05xx xxx xx xx"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      E-posta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={form.contactEmail}
                      onChange={onChange}
                      placeholder="ornek@mail.com"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-4 py-3 transition-colors"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Gönderiliyor...' : 'Özel Teklif Talebini Gönder'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
