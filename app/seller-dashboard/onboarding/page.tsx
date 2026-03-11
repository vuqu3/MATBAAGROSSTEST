'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

type SellerMeResponse = {
  vendor: null | {
    id: string;
    name: string;
    slug: string;
    commissionRate: number;
    balance: number;
  };
  applicationStatus: 'PENDING_DOCS' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | null;
  documents?: {
    taxPlateUrl?: string | null;
    tradeRegistryUrl?: string | null;
    signatureCircularUrl?: string | null;
    identityDocumentUrl?: string | null;
  };
};

type DocKey = 'taxPlate' | 'tradeRegistry' | 'signatureCircular' | 'identityDocument';

type DocConfig = {
  key: DocKey;
  title: string;
  hint: string;
};

const DOCS: DocConfig[] = [
  { key: 'taxPlate', title: 'Vergi Levhası', hint: 'PDF / JPG / PNG' },
  { key: 'tradeRegistry', title: 'Ticaret Sicil Gazetesi', hint: 'PDF / JPG / PNG' },
  { key: 'signatureCircular', title: 'İmza Sirküsü', hint: 'PDF / JPG / PNG' },
  { key: 'identityDocument', title: 'Yetkili Kimliği', hint: 'PDF / JPG / PNG' },
];

export default function SellerOnboardingPage() {
  const { status } = useSession();
  const [me, setMe] = useState<SellerMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<Partial<Record<DocKey, File | null>>>({});
  const [companyDetails, setCompanyDetails] = useState('');

  const appStatus = me?.applicationStatus ?? null;

  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    fetch('/api/seller/me')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: SellerMeResponse) => setMe(data))
      .catch(() => setError('Bilgileriniz alınamadı. Lütfen tekrar deneyin.'))
      .finally(() => setLoading(false));
  }, [status]);

  const canSubmit = useMemo(() => {
    if (appStatus !== 'PENDING_DOCS') return false;
    return DOCS.every((d) => Boolean(files[d.key]));
  }, [appStatus, files]);

  const onDrop = (key: DocKey, file: File) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const submitDocs = async () => {
    setError(null);

    if (!canSubmit) {
      setError('Lütfen tüm evrakları yükleyin.');
      return;
    }

    const fd = new FormData();
    fd.append('companyDetails', companyDetails);
    for (const d of DOCS) {
      const f = files[d.key];
      if (f) fd.append(d.key, f);
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/seller/onboarding-docs', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Evraklar gönderilemedi.');
      }
      setMe((prev) =>
        prev
          ? {
              ...prev,
              applicationStatus: 'IN_REVIEW',
              documents: data?.documents ?? prev.documents,
            }
          : prev
      );
    } catch (e: any) {
      setError(e?.message || 'Bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-slate-500 text-sm">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-0px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-center mb-8">
          <Image src="/logo.svg" alt="Matbaagross" width={420} height={120} className="h-10 w-auto" priority />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-8 py-7 border-b border-slate-100">
            <h1 className="text-xl font-extrabold text-slate-900">Evrak Yükleme ve Onboarding</h1>
            <p className="mt-1 text-sm text-slate-600">
              Admin onayı tamamlanana kadar üretici paneli kilitlidir. Evraklarınızı yükleyip onaya gönderin.
            </p>
          </div>

          <div className="px-8 py-7">
            {error && (
              <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {appStatus === 'IN_REVIEW' && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-6">
                <div className="text-4xl">⏳</div>
                <div className="mt-3 text-lg font-extrabold text-slate-900">Evraklarınız İnceleme Aşamasındadır</div>
                <div className="mt-2 text-sm text-slate-600">
                  Matbaagross yetkilileri başvurunuzu onayladıktan sonra üretim paneliniz açılacaktır.
                </div>
              </div>
            )}

            {appStatus === 'PENDING_DOCS' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DOCS.map((doc) => (
                    <div
                      key={doc.key}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) onDrop(doc.key, file);
                      }}
                    >
                      <div className="text-sm font-extrabold text-slate-900">{doc.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{doc.hint}</div>

                      <div className="mt-4">
                        <input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setFiles((prev) => ({ ...prev, [doc.key]: file }));
                          }}
                          className="block w-full text-xs text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
                        />
                      </div>

                      <div className="mt-3 text-xs text-slate-600">
                        {files[doc.key] ? (
                          <span className="font-semibold text-emerald-700">Yüklendi: {files[doc.key]!.name}</span>
                        ) : (
                          <span className="text-slate-500">Dosya seçin veya sürükleyip bırakın</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="text-sm font-extrabold text-slate-900">Firma Kapasitesi ve Makine Parkuru</div>
                  <div className="mt-2">
                    <textarea
                      value={companyDetails}
                      onChange={(e) => setCompanyDetails(e.target.value)}
                      rows={5}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6000] focus:border-transparent"
                      placeholder="Sahip olduğunuz baskı makinelerini, fason işlem kapasitenizi ve toplam çalışan sayınızı kısaca belirtiniz."
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={submitDocs}
                  disabled={!canSubmit || submitting}
                  className="mt-6 w-full rounded-2xl bg-[#FF6000] py-4 text-white font-extrabold hover:bg-[#e55a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Gönderiliyor...' : 'Evrakları Onaya Gönder'}
                </button>

                <div className="mt-4 text-xs text-slate-500">
                  Evraklar gönderildiğinde durumunuz otomatik olarak <span className="font-semibold">IN_REVIEW</span> olur.
                </div>
              </>
            )}

            {appStatus === 'REJECTED' && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-6">
                <div className="text-lg font-extrabold text-red-800">Başvurunuz Reddedildi</div>
                <div className="mt-2 text-sm text-red-700">Detaylar için destek ekibimizle iletişime geçin.</div>
              </div>
            )}

            {!appStatus && (
              <div className="text-sm text-slate-600">Durum bilgisi alınamadı.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
