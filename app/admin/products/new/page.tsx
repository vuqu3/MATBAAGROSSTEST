'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, FileText, DollarSign, ChevronRight, ChevronLeft, Box, Paintbrush, Plus, Trash2 } from 'lucide-react';

type ProductAttributeOption = { label: string; priceImpact: number };
type ProductAttribute = { label: string; options: ProductAttributeOption[] };

interface CategoryAttribute {
  name: string;
  type: 'number' | 'text' | 'select';
  label: string;
  options?: string[];
  required?: boolean;
}

interface CategoryChild {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  attributes?: {
    fields: CategoryAttribute[];
  };
  children?: CategoryChild[];
}

// Form validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Ürün adı gereklidir'),
  sku: z.string().min(1, 'SKU gereklidir'),
  description: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  productType: z.enum(['READY', 'CUSTOM']),
  categoryId: z.string().min(1, 'Kategori seçimi gereklidir'),
  basePrice: z.number().min(0, 'Fiyat 0 veya daha büyük olmalıdır'),
  purchasePrice: z.number().optional(),
  buyPrice: z.number().optional(),
  salePrice: z.number().optional(),
  taxRate: z.number().default(20),
  stock: z
    .preprocess(
      (v) => (v === '' || (typeof v === 'number' && Number.isNaN(v)) ? undefined : v),
      z.number().min(0)
    )
    .optional(),
  stockQuantity: z.number().optional(),
  supplier: z.string().optional(),
  minOrderQuantity: z.number().optional(),
  productionDays: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  depth: z.number().optional(),
  weight: z.number().optional(),
  desi: z.number().optional(),
  dynamicAttributes: z.record(z.string(), z.any()).optional(),
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductFormData = z.output<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [productType, setProductType] = useState<'READY' | 'CUSTOM'>('READY');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormInput, undefined, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productType: 'READY',
      taxRate: 20,
    },
  });

  const watchedProductType = watch('productType');
  const watchedCategoryId = watch('categoryId');

  // Seçili kategoriyi bul (ana veya alt kategori; dinamik özellikler için ana kategorinin attributes kullanılır)
  const selectedCategory = categories.find((c) => c.id === watchedCategoryId)
    || categories.find((c) => (c.children || []).some((ch) => ch.id === watchedCategoryId));
  
  // Dinamik özellikler için state
  const [dynamicAttributes, setDynamicAttributes] = useState<Record<string, any>>({});
  // Özellik Yönetimi (Ebat, Kağıt vb. + fiyat etkisi)
  const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>([]);
  const [vendorName, setVendorName] = useState('MatbaaGross');
  // Çoklu resim (max 5)
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  // Öne çıkan özellikler: { "Materyal": "Kağıt", "Ebat": "25x35" }
  const [highlights, setHighlights] = useState<Record<string, string>>({});
  const [highlightNewKey, setHighlightNewKey] = useState('');
  const [highlightNewVal, setHighlightNewVal] = useState('');
  // Ürün detayı (Ürün Bilgisi + Ek Bilgiler)
  const [descriptionDetail, setDescriptionDetail] = useState<{ productInfo: string; extraInfo: string }>({ productInfo: '', extraInfo: '' });
  // Benzer ürün ID'leri
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]);

  // Kategorileri yükle
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Kategoriler yüklenemedi');
        }

        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Fetch categories error:', error);
        setSubmitError('Kategoriler yüklenirken bir hata oluştu');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');

      const stockValue =
        watchedProductType === 'READY'
          ? (typeof data.stock === 'number' && !Number.isNaN(data.stock) ? data.stock : 0)
          : undefined;

      const mainImage = imageUrls[0] || (data.imageUrl && String(data.imageUrl).trim() ? String(data.imageUrl).trim() : undefined);
      const payload = {
        ...data,
        imageUrl: mainImage,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        highlights: Object.keys(highlights).length > 0 ? highlights : undefined,
        descriptionDetail: (descriptionDetail.productInfo || descriptionDetail.extraInfo) ? descriptionDetail : undefined,
        relatedProducts: relatedProductIds.length > 0 ? relatedProductIds : undefined,
        dynamicAttributes: Object.keys(dynamicAttributes).length > 0 ? dynamicAttributes : undefined,
        stock: watchedProductType === 'READY' ? stockValue : undefined,
        stockQuantity: watchedProductType === 'READY' ? stockValue : undefined,
        attributes: productAttributes.length > 0 ? productAttributes : undefined,
        vendorName: vendorName.trim() || 'MatbaaGross',
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ürün oluşturulamadı');
      }

      alert('Ürün başarıyla eklendi!');
      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      console.error('Error creating product:', error);
      setSubmitError(error.message || 'Ürün oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: 'Genel Bilgiler', icon: FileText },
    { id: 2, name: 'Kategori & Özellikler', icon: Package },
    { id: 3, name: 'Fiyatlandırma', icon: DollarSign },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Ürün Ekle</h1>
        <p className="text-gray-600">Ürün bilgilerini adım adım doldurun</p>
      </div>

      {/* Ürün Tipi Seçimi – en başta */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-3">Ürün Tipi Seçimi *</label>
        <div className="grid grid-cols-2 gap-4">
          <label
            className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              productType === 'READY' ? 'border-[#FF6000] bg-orange-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name="productType"
              value="READY"
              className="mt-1 h-4 w-4 text-[#FF6000] focus:ring-[#FF6000]"
              checked={productType === 'READY'}
              onChange={() => { setProductType('READY'); setValue('productType', 'READY'); }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold text-gray-900"><Box className="h-5 w-5 text-[#FF6000]" />Hazır Stok Ürün</div>
              <p className="mt-1 text-sm text-gray-600">Logo istenmez, direkt satılır.</p>
            </div>
          </label>
          <label
            className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              productType === 'CUSTOM' ? 'border-[#FF6000] bg-orange-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name="productType"
              value="CUSTOM"
              className="mt-1 h-4 w-4 text-[#FF6000] focus:ring-[#FF6000]"
              checked={productType === 'CUSTOM'}
              onChange={() => { setProductType('CUSTOM'); setValue('productType', 'CUSTOM'); }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold text-gray-900"><Paintbrush className="h-5 w-5 text-[#FF6000]" />Özel Baskılı Ürün</div>
              <p className="mt-1 text-sm text-gray-600">Müşteri logo yüklemek zorundadır.</p>
            </div>
          </label>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isActive
                        ? 'bg-[#FF6000] border-[#FF6000] text-white'
                        : isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <span className={`mt-2 text-sm font-medium ${isActive ? 'text-[#FF6000]' : 'text-gray-500'}`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="text-sm">{submitError}</p>
          </div>
        )}
        {/* Step 1: Genel Bilgiler */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Genel Bilgiler</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Adı *
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                placeholder="Örn: Baklava Kutusu 500gr"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU (Stok Kodu) *
              </label>
              <input
                {...register('sku')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                placeholder="Örn: BAK-KUT-500"
              />
              {errors.sku && (
                <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                placeholder="Ürün hakkında detaylı açıklama..."
              />
            </div>

            {/* Çoklu Resim Yükleme (Max 5) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çoklu Resim Yükleme (En fazla 5)
              </label>
              <div className="flex flex-wrap gap-3 items-start">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                    {url.startsWith('http') || url.startsWith('/') ? (
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">URL</div>
                    )}
                    <button
                      type="button"
                      onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {imageUrls.length < 5 && (
                  <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-500 text-xs">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={imageUploading}
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f || imageUrls.length >= 5) return;
                        setUploadError('');
                        setImageUploading(true);
                        try {
                          const form = new FormData();
                          form.append('file', f);
                          const res = await fetch('/api/upload/product', { method: 'POST', body: form });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Yükleme başarısız');
                          setImageUrls((prev) => [...prev, data.url].slice(0, 5));
                          if (imageUrls.length === 0) setValue('imageUrl', data.url);
                        } catch (err: unknown) {
                          setUploadError(err instanceof Error ? err.message : 'Görsel yüklenemedi');
                        } finally {
                          setImageUploading(false);
                          e.target.value = '';
                        }
                      }}
                    />
                    {imageUploading ? '...' : '+'}
                  </label>
                )}
              </div>
              {uploadError && <p className="text-sm text-red-600 mt-1">{uploadError}</p>}
              <p className="mt-1 text-xs text-gray-500">İlk görsel ana ürün görseli olarak kullanılır.</p>
            </div>

            {/* Öne Çıkan Özellikler */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Öne Çıkan Özellikler (Anahtar-Değer)</label>
              <p className="text-xs text-gray-500 mb-2">Örn: Materyal: Kağıt, Ebat: 25x35, Baskı: CMYK</p>
              <div className="space-y-2">
                {Object.entries(highlights).map(([k, v]) => (
                  <div key={k} className="flex gap-2 items-center">
                    <span className="text-sm font-medium text-gray-600 w-28 truncate">{k}:</span>
                    <span className="text-sm text-gray-800 flex-1">{v}</span>
                    <button
                      type="button"
                      onClick={() => setHighlights((prev) => { const next = { ...prev }; delete next[k]; return next; })}
                      className="text-red-600 hover:bg-red-50 rounded p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="text"
                    value={highlightNewKey}
                    onChange={(e) => setHighlightNewKey(e.target.value)}
                    placeholder="Anahtar (örn: Materyal)"
                    className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#FF6000]"
                  />
                  <input
                    type="text"
                    value={highlightNewVal}
                    onChange={(e) => setHighlightNewVal(e.target.value)}
                    placeholder="Değer (örn: Kağıt)"
                    className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#FF6000]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (highlightNewKey.trim()) {
                        setHighlights((prev) => ({ ...prev, [highlightNewKey.trim()]: highlightNewVal.trim() }));
                        setHighlightNewKey('');
                        setHighlightNewVal('');
                      }
                    }}
                    className="px-3 py-2 bg-[#FF6000] text-white rounded-lg text-sm hover:bg-[#e55a00]"
                  >
                    <Plus size={16} className="inline" /> Ekle
                  </button>
                </div>
              </div>
            </div>

            {/* Ürün Detayı (Ürün Bilgisi + Ek Bilgiler) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Detayı (Zengin açıklama)</label>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Ürün Bilgisi</span>
                  <textarea
                    value={descriptionDetail.productInfo}
                    onChange={(e) => setDescriptionDetail((prev) => ({ ...prev, productInfo: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                    placeholder="Detaylı ürün açıklaması..."
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Ek Bilgiler</span>
                  <textarea
                    value={descriptionDetail.extraInfo}
                    onChange={(e) => setDescriptionDetail((prev) => ({ ...prev, extraInfo: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                    placeholder="Kullanım, bakım, teslimat notları vb."
                  />
                </div>
              </div>
            </div>

            {/* Tedarikçi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tedarikçi Adı
              </label>
              <input
                {...register('supplier')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                placeholder="Örn: Yıldız Kesim"
              />
            </div>

            {/* Hazır Stok için Stok Adedi */}
            {watchedProductType === 'READY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stok Adedi *
                </label>
                <input
                  {...register('stock', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Stok takibi için kullanılır
                </p>
              </div>
            )}

            {/* Özel Baskılı için Minimum Sipariş ve Üretim Süresi */}
            {watchedProductType === 'CUSTOM' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Sipariş Adedi *
                  </label>
                  <input
                    {...register('minOrderQuantity', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Üretim Süresi (Gün) *
                  </label>
                  <input
                    {...register('productionDays', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                    placeholder="5"
                  />
                </div>
              </div>
            )}

            {/* Kargo & Teslimat Ölçüleri */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Kargo & Teslimat Ölçüleri</h3>
              <p className="text-sm text-gray-500 mb-4">Paketlenmiş/Kargoya hazır ölçüleri giriniz.</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    En (cm)
                  </label>
                  <input
                    {...register('width', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Boy (cm)
                  </label>
                  <input
                    {...register('depth', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yükseklik (cm)
                  </label>
                  <input
                    {...register('height', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ağırlık (kg)
                  </label>
                  <input
                    {...register('weight', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desi
                </label>
                <input
                  {...register('desi', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                  placeholder="Otomatik hesaplanır"
                />
                <p className="mt-1 text-xs text-gray-500">Desi = (En × Boy × Yükseklik) / 3000</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Kategori & Özellikler */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Kategori & Özellikler</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                {...register('categoryId')}
                disabled={loadingCategories}
                onChange={(e) => {
                  setValue('categoryId', e.target.value);
                  setDynamicAttributes({});
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000] disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingCategories ? 'Kategoriler yükleniyor...' : 'Kategori Seçiniz'}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
                {categories.flatMap((category) =>
                  (category.children || []).map((child) => (
                    <option key={child.id} value={child.id}>
                      — {category.name} › {child.name}
                    </option>
                  ))
                )}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Dinamik Özellikler - Kategoriye Özel */}
            {selectedCategory && selectedCategory.attributes?.fields && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedCategory.name} - Ürün Özellikleri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCategory.attributes.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={dynamicAttributes[field.name] || ''}
                          onChange={(e) => {
                            setDynamicAttributes({
                              ...dynamicAttributes,
                              [field.name]: e.target.value,
                            });
                          }}
                          required={field.required}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                        >
                          <option value="">Seçiniz</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'number' ? (
                        <input
                          type="number"
                          value={dynamicAttributes[field.name] || ''}
                          onChange={(e) => {
                            setDynamicAttributes({
                              ...dynamicAttributes,
                              [field.name]: e.target.value ? parseFloat(e.target.value) : '',
                            });
                          }}
                          required={field.required}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                          placeholder={field.label}
                        />
                      ) : (
                        <input
                          type="text"
                          value={dynamicAttributes[field.name] || ''}
                          onChange={(e) => {
                            setDynamicAttributes({
                              ...dynamicAttributes,
                              [field.name]: e.target.value,
                            });
                          }}
                          required={field.required}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                          placeholder={field.label}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!selectedCategory && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Lütfen bir kategori seçin. Kategori seçildikten sonra, o kategoriye özel dinamik özellikler burada görünecektir.
                </p>
              </div>
            )}

            {/* Özellik Yönetimi */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Özellik Yönetimi</h3>
              <p className="text-sm text-gray-500 mb-4">Müşteri seçenekleri (Ebat, Kağıt Tipi vb.) ve her seçeneğin fiyat etkisi (+TL)</p>
              <div className="space-y-4">
                {productAttributes.map((attr, attrIdx) => (
                  <div key={attrIdx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={attr.label}
                        onChange={(e) => {
                          const next = [...productAttributes];
                          next[attrIdx] = { ...attr, label: e.target.value };
                          setProductAttributes(next);
                        }}
                        placeholder="Özellik adı (örn: Kağıt Tipi)"
                        className="flex-1 min-w-[160px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]"
                      />
                      <button
                        type="button"
                        onClick={() => setProductAttributes(productAttributes.filter((_, i) => i !== attrIdx))}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label="Özelliği kaldır"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="space-y-2 pl-2 border-l-2 border-orange-200">
                      {attr.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2 flex-wrap">
                          <input
                            type="text"
                            value={opt.label}
                            onChange={(e) => {
                              const next = [...productAttributes];
                              next[attrIdx].options = [...attr.options];
                              next[attrIdx].options[optIdx] = { ...opt, label: e.target.value };
                              setProductAttributes(next);
                            }}
                            placeholder="Seçenek (örn: 80gr 1. Hamur)"
                            className="flex-1 min-w-[140px] px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF6000]"
                          />
                          <input
                            type="number"
                            value={opt.priceImpact}
                            onChange={(e) => {
                              const next = [...productAttributes];
                              next[attrIdx].options = [...attr.options];
                              next[attrIdx].options[optIdx] = { ...opt, priceImpact: Number(e.target.value) || 0 };
                              setProductAttributes(next);
                            }}
                            placeholder="+TL"
                            className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF6000]"
                          />
                          <span className="text-sm text-gray-500">TL</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...productAttributes];
                              next[attrIdx].options = attr.options.filter((_, i) => i !== optIdx);
                              setProductAttributes(next);
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            aria-label="Seçeneği kaldır"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...productAttributes];
                          next[attrIdx].options = [...attr.options, { label: '', priceImpact: 0 }];
                          setProductAttributes(next);
                        }}
                        className="flex items-center gap-1 text-sm text-[#FF6000] hover:text-[#ea580c] font-medium"
                      >
                        <Plus size={14} /> Seçenek ekle
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setProductAttributes([...productAttributes, { label: '', options: [{ label: '', priceImpact: 0 }] }])}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#FF6000] hover:text-[#FF6000] transition-colors"
                >
                  <Plus size={18} /> Özellik ekle (Ebat, Kağıt vb.)
                </button>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Satıcı adı</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="MatbaaGross"
                  className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Fiyatlandırma */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Fiyatlandırma</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taban Fiyat (TL) *
                </label>
                <input
                  {...register('basePrice', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                  placeholder="0.00"
                />
                {errors.basePrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.basePrice.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KDV Oranı (%)
                </label>
                <input
                  {...register('taxRate', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                  placeholder="20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alış Fiyatı (Maliyet) (TL)
                </label>
                <input
                  {...register('buyPrice', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Kar/zarar hesabı için kullanılır (müşteri görmez)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alış Fiyatı (TL) - Eski Alan
                </label>
                <input
                  {...register('purchasePrice', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Satış Fiyatı (TL)
                </label>
                <input
                  {...register('salePrice', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6000]"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
            Geri
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              className="flex items-center gap-2 px-6 py-2 bg-[#FF6000] text-white rounded-lg hover:bg-[#e55a00] transition-colors"
            >
              İleri
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-[#FF6000] text-white rounded-lg hover:bg-[#e55a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
