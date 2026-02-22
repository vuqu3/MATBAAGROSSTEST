'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle, Upload, Loader2, X, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const MAX_IMAGES = 5;
type ImageItem = File | string; // string = URL (mevcut yükleme)

type Category = { id: string; name: string; slug: string; parentId: string | null };

type ProductVariant = { id: string; name: string; price: number; stock: number };

type Product = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  unitPrice: number | null;
  stock: number;
  categoryId: string;
  imageUrl: string | null;
  images: string[] | null;
  sku: string;
  status: string;
  isActive: boolean;
  isPublished: boolean;
  width: number | null;
  height: number | null;
  depth: number | null;
  weight: number | null;
  desi: number | null;
  variants?: ProductVariant[] | null;
};

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

export default function SellerEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageItem[]>([]);

  type VariantRow = { id: string; name: string; price: string; stock: string };
  const [variants, setVariants] = useState<VariantRow[]>([]);

  const addVariant = () =>
    setVariants((v) => [...v, { id: crypto.randomUUID(), name: '', price: '', stock: '' }]);
  const removeVariant = (vid: string) =>
    setVariants((v) => v.filter((r) => r.id !== vid));
  const updateVariant = (vid: string, field: keyof Omit<VariantRow, 'id'>, value: string) =>
    setVariants((v) => v.map((r) => (r.id === vid ? { ...r, [field]: value } : r)));

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    unitPrice: '',
    stock: '0',
    categoryId: '',
    width: '',
    height: '',
    depth: '',
    weight: '',
    desi: '',
  });

  // Kategorileri yükle
  useEffect(() => {
    fetch('/api/seller/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]));
  }, []);

  // Auto-calculate desi when dimensions change
  useEffect(() => {
    const width = parseFloat(form.width) || 0;
    const height = parseFloat(form.height) || 0;
    const depth = parseFloat(form.depth) || 0;
    
    if (width > 0 && height > 0 && depth > 0) {
      const calculatedDesi = (width * height * depth) / 3000;
      setForm((f) => ({ ...f, desi: calculatedDesi.toFixed(2) }));
    } else {
      setForm((f) => ({ ...f, desi: '' }));
    }
  }, [form.width, form.height, form.depth]);

  // Ürün bilgilerini yükle
  useEffect(() => {
    if (!id) return;
    
    setProductLoading(true);
    fetch(`/api/seller/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Ürün bulunamadı');
        return res.json();
      })
      .then((data: Product) => {
        setForm({
          name: data.name,
          description: data.description || '',
          price: data.basePrice.toString(),
          compareAtPrice: data.compareAtPrice?.toString() || '',
          unitPrice: data.unitPrice?.toString() || '',
          stock: data.stock.toString(),
          categoryId: data.categoryId,
          width: data.width?.toString() || '',
          height: data.height?.toString() || '',
          depth: data.depth?.toString() || '',
          weight: data.weight?.toString() || '',
          desi: data.desi?.toString() || '',
        });

        // Mevcut varyasyonları state'e yükle
        if (data.variants && Array.isArray(data.variants)) {
          setVariants(
            data.variants.map((v) => ({
              id: v.id,
              name: v.name,
              price: v.price.toString(),
              stock: v.stock.toString(),
            }))
          );
        }
        
        // Mevcut resimleri ayarla
        const existingImages: string[] = [];
        if (data.imageUrl) existingImages.push(data.imageUrl);
        if (data.images && Array.isArray(data.images)) {
          existingImages.push(...data.images.filter((img: string) => img !== data.imageUrl));
        }
        setImages(existingImages);
        
        setProductLoading(false);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Product load error:', err);
        setError('Ürün yüklenirken bir hata oluştu.');
        setProductLoading(false);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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
      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          basePrice: priceNum,
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
          unitPrice: form.unitPrice ? parseFloat(form.unitPrice) : null,
          stock: Math.max(0, parseInt(form.stock, 10) || 0),
          categoryId: form.categoryId,
          imageUrl: uploadedUrls[0] || undefined,
          images: uploadedUrls.length > 0 ? uploadedUrls : undefined,
          width: form.width ? parseFloat(form.width) : undefined,
          height: form.height ? parseFloat(form.height) : undefined,
          depth: form.depth ? parseFloat(form.depth) : undefined,
          weight: form.weight ? parseFloat(form.weight) : undefined,
          desi: form.desi ? parseFloat(form.desi) : undefined,
          variants: variants
            .filter((v) => v.name.trim() && v.price)
            .map((v) => ({
              name: v.name.trim(),
              price: parseFloat(v.price),
              stock: Math.max(0, parseInt(v.stock, 10) || 0),
            })),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Ürün güncellenirken bir hata oluştu.');
        setSubmitting(false);
        return;
      }

      setSuccess('Ürün başarıyla güncellendi.');
      setTimeout(() => {
        router.push('/seller-dashboard/products');
      }, 1500);
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
      setUploadError(`${files.length - toAdd} dosya atlandı (en fazla ${MAX_IMAGES} görsel).`);
    }
    setImages((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  }, [images]);

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  if (loading || productLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
        <span className="ml-2 text-gray-600">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/seller-dashboard/products"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Ürünlerime Dön
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Ürün Düzenle</h1>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800">Temel Bilgiler</h2>
          
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
              placeholder="Ürün adını giriniz"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Ürün hakkında kısa açıklama"
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
              Kategori *
            </label>
            <select
              id="categoryId"
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Kategori seçiniz</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800">Fiyatlandırma</h2>
          
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Satış Fiyatı (TL) *
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
                placeholder="0.00 (KDV Dahil)"
              />
              <p className="mt-1 text-xs text-gray-500">Lütfen KDV dahil son satış fiyatını giriniz.</p>
            </div>
            <div>
              <label htmlFor="compareAtPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Piyasa Fiyatı (İndirimsiz Hali)
              </label>
              <input
                id="compareAtPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.compareAtPrice}
                onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="0.00 (İsteğe bağlı)"
              />
              <p className="mt-1 text-xs text-gray-500">Satış fiyatından yüksek girerseniz indirim olarak gösterilir.</p>
            </div>
            <div>
              <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Referans Birim Fiyatı (1 Adet İçin)
              </label>
              <input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.unitPrice}
                onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="0.00 (İsteğe bağlı)"
              />
              <p className="mt-1 text-xs text-gray-500">İndirim rozetlerinin hesaplanması için 1 adet ürünün piyasa fiyatını girin (Örn: 5 TL).</p>
            </div>
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

          {/* Kargo & Teslimat Ölçüleri */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Kargo & Teslimat Ölçüleri</h3>
            <p className="text-sm text-gray-500 mb-4">Paketlenmiş/Kargoya hazır ölçüleri giriniz.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                  En (cm)
                </label>
                <input
                  id="width"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.width}
                  onChange={(e) => setForm((f) => ({ ...f, width: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label htmlFor="depth" className="block text-sm font-medium text-gray-700 mb-1">
                  Boy (cm)
                </label>
                <input
                  id="depth"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.depth}
                  onChange={(e) => setForm((f) => ({ ...f, depth: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                  Yükseklik (cm)
                </label>
                <input
                  id="height"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.height}
                  onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Ağırlık (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.weight}
                  onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="desi" className="block text-sm font-medium text-gray-700 mb-1">
                Desi
              </label>
              <input
                id="desi"
                type="number"
                min="0"
                step="0.01"
                value={form.desi}
                readOnly
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-600 bg-gray-50 cursor-not-allowed"
                placeholder="Otomatik hesaplanır"
              />
              <p className="mt-1 text-xs text-gray-500">Desi = (En × Boy × Yükseklik) / 3000</p>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800">Ürün Görselleri</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {images.map((item, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                {typeof item === 'string' ? (
                  <Image src={item} alt="" fill className="object-cover" sizes="120px" />
                ) : (
                  <FilePreviewThumb file={item} />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                  title="Kaldır"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {canAddMore && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs">Ekle</span>
              </button>
            )}
          </div>
          
          {uploadError && (
            <p className="text-sm text-red-600">{uploadError}</p>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Varyasyonlar */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Seçenekler / Varyasyonlar</h2>
              <p className="text-xs text-gray-500 mt-0.5">İsteğe bağlı — Miktara göre farklı fiyat sunmak için ekleyin (örn: 25 Adet, 100 Adet)</p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1.5 text-sm font-medium text-[#FF6000] hover:text-[#e55a00] border border-[#FF6000] hover:border-[#e55a00] px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Seçenek Ekle
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Henüz seçenek eklenmedi. Seçenek eklemezseniz ürün tek fiyatla listelenir.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
                <div className="col-span-5">Seçenek Adı</div>
                <div className="col-span-3">Fiyat (TL)</div>
                <div className="col-span-3">Stok</div>
                <div className="col-span-1"></div>
              </div>
              {variants.map((row) => (
                <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateVariant(row.id, 'name', e.target.value)}
                      placeholder="örn: 100 Adet"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.price}
                      onChange={(e) => updateVariant(row.id, 'price', e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="0"
                      value={row.stock}
                      onChange={(e) => updateVariant(row.id, 'stock', e.target.value)}
                      placeholder="0"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removeVariant(row.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      aria-label="Seçeneği sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Link
            href="/seller-dashboard/products"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              'Değişiklikleri Kaydet'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
