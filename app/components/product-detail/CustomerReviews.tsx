'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Star } from 'lucide-react';

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
};

type ReviewsResponse = {
  productId: string;
  averageRating: number;
  total: number;
  canReview: boolean;
  hasReviewed: boolean;
  reviews: Review[];
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rounded} / 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < rounded;
        return (
          <Star
            key={i}
            size={size}
            className={filled ? 'text-[#FF6000] fill-[#FF6000]' : 'text-gray-300'}
          />
        );
      })}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const v = i + 1;
        const filled = v <= value;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className="p-1 rounded hover:bg-orange-50"
            aria-label={`${v} yıldız`}
          >
            <Star
              size={18}
              className={filled ? 'text-[#FF6000] fill-[#FF6000]' : 'text-gray-300'}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function CustomerReviews({ productId }: { productId: string }) {
  const { status } = useSession();
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const averageText = useMemo(() => {
    const avg = data?.averageRating ?? 0;
    return avg > 0 ? avg.toFixed(1).replace('.', ',') : '0,0';
  }, [data?.averageRating]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Yorumlar yüklenirken hata oluştu');
        setData(null);
        return;
      }
      setData(json as ReviewsResponse);
    } catch {
      setError('Yorumlar yüklenirken hata oluştu');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.canReview) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || 'Yorum gönderilirken hata oluştu');
        return;
      }
      setComment('');
      setRating(5);
      await fetchReviews();
    } catch {
      setError('Yorum gönderilirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Müşteri Yorumları</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-gray-900">{averageText}</span>
              <Stars value={data?.averageRating ?? 0} size={18} />
              <span className="text-sm text-gray-500">({data?.total ?? 0})</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            {loading ? (
              <div className="text-sm text-gray-500">Yorumlar yükleniyor...</div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : (data?.reviews?.length ?? 0) > 0 ? (
              <div className="space-y-4">
                {data!.reviews.map((r) => (
                  <div key={r.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{r.userName}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{formatDate(r.createdAt)}</span>
                        </div>
                        <div className="mt-1">
                          <Stars value={r.rating} />
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{r.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Henüz yorum yok.</div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-extrabold text-gray-900">Yorum Yap</h3>
                {data?.hasReviewed ? (
                  <span className="text-xs font-semibold text-gray-500">Bu ürünü zaten yorumladınız</span>
                ) : null}
              </div>

              {status !== 'authenticated' ? (
                <div className="text-sm text-gray-600">
                  Yorum yapabilmek için giriş yapmanız gerekmektedir.
                </div>
              ) : data?.canReview ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Puan</label>
                    <StarPicker value={rating} onChange={setRating} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Yorumunuz</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#FF6000] bg-white"
                      placeholder="Bu ürün hakkındaki deneyiminizi yazın..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 rounded-lg bg-[#FF6000] hover:bg-[#e55a00] text-white font-bold text-sm transition-colors disabled:opacity-60"
                  >
                    {submitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                  </button>
                </form>
              ) : (
                <div className="text-sm text-gray-600">
                  Yorum yapmak için ürünü satın almış olmanız gerekmektedir.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
