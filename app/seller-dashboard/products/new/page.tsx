'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle, Upload, Loader2, X } from 'lucide-react';

const MAX_IMAGES = 5;
type ImageItem = File | string; // string = URL (mevcut yükleme)

type Category = { id: string; name: string; slug: string; parentId: string | null };

function FilePreviewThumb({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  if (!url) return <div className="absolute inset-0 bg-gray-200 animate-pulse" />;
  return <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />;
}

export default function SellerNewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '0',
    categoryId: '',
  });

  useEffect(() => {
    fetch('/api/seller/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        if (data?.length && !form.categoryId) {
          setForm((f) => ({ ...f, categoryId: data[0].id }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const priceNum = parseFloat(form.price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError('Geçerli bir fiyat giriniz.');
      setSubmitting(false);
      return;
    }
    if (!form.name.trim()) {
      setError('Ürün adı zorunludur.');
      setSubmitting(false);
      return;
    }
    if (!form.categoryId) {
      setError('Kategori seçiniz.');
      setSubmitting(false);
      return;
    }

    const uploadedUrls: string[] = [];
    for (const item of images) {
      if (typeof item === 'string') {
        uploadedUrls.push(item);
      } else {
        try {
          const fd = new FormData();
          fd.append('file', item);
          const up = await fetch('/api/upload', { method: 'POST', body: fd });
          const data = await up.json().catch(() => ({}));
          if (up.ok && data.url) uploadedUrls.push(data.url);
        } catch {
          setError('Görsel yüklenirken bir hata oluştu.');
          setSubmitting(false);
          return;
        }
      }
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          basePrice: priceNum,
          stock: Math.max(0, parseInt(form.stock, 10) || 0),
          categoryId: form.categoryId,
          imageUrl: uploadedUrls[0] || undefined,
          images: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Ürün eklenirken bir hata oluştu.');
        setSubmitting(false);
        return;
      }

      router.push('/seller-dashboard/products');
      router.refresh();
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
      setSubmitting(false);
    }
  };

  const currentCount = images.length;
  const canAddMore = currentCount < MAX_IMAGES;

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadError('');
    const existing = images.length;
    const toAdd = Math.min(MAX_IMAGES - existing, files.length);
    if (toAdd <= 0) {
      setUploadError('Bir ürün için en fazla 5 görsel yükleyebilirsiniz.');
      e.target.value = '';
      return;
    }
    const newFiles = Array.from(files).slice(0, toAdd);
    if (files.length > toAdd) {
      setUploadError('Bir ürün için en fazla 5 görsel yükleyebilirsiniz. Sadece ilk ' + toAdd + ' dosya eklendi.');
    }
    setImages((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setUploadError('');
  }, []);

  const [dragActive, setDragActive] = useState(false);
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (!files?.length) return;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!imageFiles.length) {
      setUploadError('Sadece resim dosyaları (JPEG, PNG, GIF, WebP) yükleyebilirsiniz.');
      return;
    }
    const existing = images.length;
    const toAdd = Math.min(MAX_IMAGES - existing, imageFiles.length);
    if (toAdd <= 0) {
      setUploadError('Bir ürün için en fazla 5 görsel yükleyebilirsiniz.');
      return;
    }
    setUploadError('');
    setImages((prev) => [...prev, ...imageFiles.slice(0, toAdd)]);
    if (imageFiles.length > toAdd) {
      setUploadError('Bir ürün için en fazla 5 görsel yükleyebilirsiniz.');
    }
  }, [images.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Yeni Ürün Ekle</h1>
        <Link
          href="/seller-dashboard/products"
          className="text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          ← Ürünlerime dön
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            Eklediğiniz ürünler editör onayından geçtikten sonra yayına alınacaktır.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Adı *
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Örn. Karton Pizza Kutusu 30x30"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Ürün hakkında kısa açıklama"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Fiyat (TL) *
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stok Adedi
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Kategori *
            </label>
            <select
              id="category"
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Kategori seçin</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentId ? `  ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Görselleri (Maks. 5 Adet)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            {canAddMore && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`rounded-xl border-2 border-dashed py-6 px-4 text-center transition-colors ${
                  dragActive ? 'border-orange-400 bg-orange-50/50' : 'border-gray-300 bg-gray-50/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-orange-600 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                      <span>Yükleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8" />
                      <span>Dosya seçin veya sürükleyip bırakın</span>
                    </>
                  )}
                </button>
              </div>
            )}
            {uploadError && (
              <p className="mt-1 text-sm text-red-600">{uploadError}</p>
            )}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {images.map((item, index) => (
                  <div key={index} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100 group">
                    {typeof item === 'string' ? (
                      <Image
                        src={item}
                        alt={`Önizleme ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    ) : (
                      <FilePreviewThumb file={item} />
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity shadow"
                      aria-label="Görseli kaldır"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[#FF6000] px-4 py-3 font-semibold text-white hover:bg-[#e55a00] disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Gönderiliyor...' : 'Onaya Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
