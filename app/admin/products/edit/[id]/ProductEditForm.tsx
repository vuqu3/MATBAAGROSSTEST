'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Box, Paintbrush, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export type ProductAttributeOption = { label: string; priceImpact: number };
export type ProductAttribute = { label: string; options: ProductAttributeOption[] };

const productSchema = z.object({
  name: z.string().min(1, 'Ürün adı gereklidir'),
  sku: z.string().min(1, 'SKU gereklidir'),
  description: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'Kategori seçimi gereklidir'),
  basePrice: z.number().min(0),
  buyPrice: z.number().optional(),
  salePrice: z.number().optional(),
  compareAtPrice: z.number().optional(),
  taxRate: z.number().min(0),
  supplier: z.string().optional(),
  stock: z.optional(
    z.preprocess(
      (v) => (v === '' || v === null || (typeof v === 'number' && Number.isNaN(v)) ? undefined : v),
      z.number().min(0).nullable()
    )
  ),
  minOrderQuantity: z.number().optional(),
  productionDays: z.number().optional(),
  isPublished: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

type FormInput = z.input<typeof productSchema>;
type FormData = z.output<typeof productSchema>;

type Product = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: string;
  basePrice: number;
  buyPrice: number | null;
  salePrice: number | null;
  compareAtPrice: number | null;
  taxRate: number;
  supplier: string | null;
  stock?: number | null;
  stockQuantity: number | null;
  minOrderQuantity: number | null;
  productionDays: number | null;
  productType: string;
  isPublished: boolean;
  isActive: boolean;
  attributes?: ProductAttribute[] | null;
  vendorName?: string | null;
  images?: string[] | null;
  highlights?: Record<string, string> | null;
  descriptionDetail?: { productInfo?: string; extraInfo?: string } | null;
  relatedProducts?: string[] | null;
};

type Category = { id: string; name: string; slug: string; parentId?: string | null; children?: { id: string; name: string; slug: string }[] };

export default function ProductEditForm({ product }: { product: Product }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [productType, setProductTypeState] = useState<'READY' | 'CUSTOM'>(product.productType === 'CUSTOM' ? 'CUSTOM' : 'READY');
  const [brandCategoryId, setBrandCategoryId] = useState<string | null>(null);

  const initialAttributes = useMemo((): ProductAttribute[] => {
    const a = product.attributes;
    if (Array.isArray(a) && a.length) return a as ProductAttribute[];
    return [];
  }, [product.attributes]);
  const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>(initialAttributes);
  const [vendorName, setVendorName] = useState(product.vendorName ?? 'MatbaaGross');
  const [imageUrls, setImageUrls] = useState<string[]>(Array.isArray(product.images) ? product.images : (product.imageUrl ? [product.imageUrl] : []));
  const [highlights, setHighlights] = useState<Record<string, string>>(product.highlights && typeof product.highlights === 'object' ? product.highlights as Record<string, string> : {});
  const [descriptionDetail, setDescriptionDetail] = useState<{ productInfo: string; extraInfo: string }>({
    productInfo: (product.descriptionDetail as { productInfo?: string })?.productInfo ?? '',
    extraInfo: (product.descriptionDetail as { extraInfo?: string })?.extraInfo ?? '',
  });
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(Array.isArray(product.relatedProducts) ? product.relatedProducts : []);
  const [highlightNewKey, setHighlightNewKey] = useState('');
  const [highlightNewVal, setHighlightNewVal] = useState('');

  useEffect(() => {
    setProductAttributes(initialAttributes);
    setVendorName(product.vendorName ?? 'MatbaaGross');
    setImageUrls(Array.isArray(product.images) ? product.images : (product.imageUrl ? [product.imageUrl] : []));
    setHighlights(product.highlights && typeof product.highlights === 'object' ? product.highlights as Record<string, string> : {});
    setDescriptionDetail({
      productInfo: (product.descriptionDetail as { productInfo?: string })?.productInfo ?? '',
      extraInfo: (product.descriptionDetail as { extraInfo?: string })?.extraInfo ?? '',
    });
    setRelatedProductIds(Array.isArray(product.relatedProducts) ? product.relatedProducts : []);
  }, [product.id, initialAttributes, product.vendorName, product.images, product.imageUrl, product.highlights, product.descriptionDetail, product.relatedProducts]);

  const isReadyStock = productType === 'READY';
  const stockValue = product.stockQuantity ?? product.stock ?? 0;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInput, undefined, FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      sku: product.sku,
      description: product.description ?? '',
      imageUrl: product.imageUrl ?? '',
      categoryId: product.categoryId,
      basePrice: Number(product.basePrice),
      buyPrice: product.buyPrice != null ? Number(product.buyPrice) : undefined,
      salePrice: product.salePrice != null ? Number(product.salePrice) : undefined,
      compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : undefined,
      taxRate: Number(product.taxRate),
      supplier: product.supplier ?? '',
      stock: isReadyStock ? Number(stockValue) : undefined,
      minOrderQuantity: product.minOrderQuantity != null ? Number(product.minOrderQuantity) : undefined,
      productionDays: product.productionDays != null ? Number(product.productionDays) : undefined,
      isPublished: product.isPublished,
      isActive: product.isActive,
    } satisfies FormInput,
  });

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Category[]) => {
        const flat = Array.isArray(data) ? data : [];
        setCategories(flat);
        const found = flat.find((c) => c.slug === 'markaniza-ozel-uretim')
          ?? flat.flatMap((c) => (c.children ?? [])).find((c) => c.slug === 'markaniza-ozel-uretim');
        if (found) setBrandCategoryId(found.id);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  /* Auto-set category when switching to CUSTOM */
  useEffect(() => {
    if (productType === 'CUSTOM' && brandCategoryId) {
      setValue('categoryId', brandCategoryId);
    }
  }, [productType, brandCategoryId, setValue]);

  const onSubmit = async (data: FormData) => {
    setError('');
    setIsSubmitting(true);
    try {
      const stockNum = isReadyStock
        ? (typeof data.stock === 'number' && !Number.isNaN(data.stock) ? data.stock : Number(stockValue))
        : undefined;

      const payload = {
        name: data.name,
        sku: data.sku,
        description: data.description || null,
        imageUrl: imageUrls[0] || data.imageUrl?.trim() || null,
        categoryId: data.categoryId,
        productType,
        basePrice: productType === 'CUSTOM' ? 0 : (parseFloat(String(data.basePrice)) || 0),
        buyPrice: data.buyPrice != null ? parseFloat(String(data.buyPrice)) : null,
        salePrice: data.salePrice != null ? parseFloat(String(data.salePrice)) : null,
        compareAtPrice: data.compareAtPrice != null ? parseFloat(String(data.compareAtPrice)) : null,
        taxRate: parseFloat(String(data.taxRate)) || 20,
        supplier: data.supplier || null,
        stock: isReadyStock ? stockNum : undefined,
        stockQuantity: isReadyStock ? stockNum : undefined,
        minOrderQuantity: !isReadyStock ? (data.minOrderQuantity ?? null) : null,
        productionDays: !isReadyStock ? (data.productionDays ?? null) : null,
        isPublished: data.isPublished,
        isActive: data.isActive,
        attributes: productAttributes.length > 0 ? productAttributes : null,
        vendorName: vendorName.trim() || 'MatbaaGross',
        images: imageUrls.length > 0 ? imageUrls.slice(0, 5) : null,
        highlights: Object.keys(highlights).length > 0 ? highlights : null,
        descriptionDetail: (descriptionDetail.productInfo || descriptionDetail.extraInfo) ? descriptionDetail : null,
        relatedProducts: relatedProductIds.length > 0 ? relatedProductIds.slice(0, 20) : null,
      };

      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Güncelleme başarısız');

      router.push('/admin/products');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Listeye Dön
        </Link>
      </div>

      {/* Ürün Tipi */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">Ürün Tipi</p>
        <div className="grid grid-cols-2 gap-3">
          <label className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
            productType === 'READY' ? 'border-[#FF6000] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input type="radio" name="ptEdit" value="READY" checked={productType === 'READY'}
              onChange={() => setProductTypeState('READY')} className="mt-0.5 h-4 w-4 text-[#FF6000]" />
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-sm text-gray-900">
                <Box className="h-4 w-4 text-[#FF6000]" /> Hazır Stok (Perakende)
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Fiyat + stok ile normal e-ticaret.</p>
            </div>
          </label>
          <label className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
            productType === 'CUSTOM' ? 'border-[#FF6000] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input type="radio" name="ptEdit" value="CUSTOM" checked={productType === 'CUSTOM'}
              onChange={() => setProductTypeState('CUSTOM')} className="mt-0.5 h-4 w-4 text-[#FF6000]" />
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-sm text-gray-900">
                <Paintbrush className="h-4 w-4 text-[#FF6000]" /> Özel Baskılı (Premium)
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Teklif usulü, fiyat gizli.</p>
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Adı *</label>
          <input {...register('name')} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
          <input {...register('sku')} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
          {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
        <textarea {...register('description')} rows={3} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Görsel</label>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={imageUploading}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setImageUploading(true);
                try {
                  const form = new FormData();
                  form.append('file', f);
                  const res = await fetch('/api/upload/product', { method: 'POST', body: form });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error);
                  setValue('imageUrl', data.url);
                } finally {
                  setImageUploading(false);
                  e.target.value = '';
                }
              }}
            />
            {imageUploading ? 'Yükleniyor...' : 'Görsel Yükle'}
          </label>
          <input
            {...register('imageUrl')}
            type="text"
            placeholder="Görsel URL"
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Kategori *</label>
        <select
          {...register('categoryId')}
          disabled={loading}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] disabled:bg-gray-100"
        >
          <option value="">{loading ? 'Yükleniyor...' : 'Kategori Seçin'}</option>
          {categories
            .filter((c) => !c.parentId)
            .flatMap((parent) => [
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>,
              ...(parent.children ?? []).map((child) => (
                <option key={child.id} value={child.id}>
                  {'  └ '}{child.name}
                </option>
              )),
            ])
          }
        </select>
        {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
      </div>

      {/* Fiyatlandırma — sadece READY */}
      {isReadyStock && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taban Fiyat (TL) *</label>
              <input {...register('basePrice', { valueAsNumber: true })} type="number" step="0.01" min={0} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
              {errors.basePrice && <p className="mt-1 text-sm text-red-600">{errors.basePrice.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Satış Fiyatı (TL)</label>
              <input {...register('salePrice', { valueAsNumber: true })} type="number" step="0.01" min={0} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Piyasa Fiyatı</label>
              <input {...register('compareAtPrice', { valueAsNumber: true })} type="number" step="0.01" min={0} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" placeholder="İsteğe bağlı" />
              <p className="mt-1 text-xs text-gray-500">Yüksek girerseniz indirim gösterilir.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alış/Maliyet (TL)</label>
              <input {...register('buyPrice', { valueAsNumber: true })} type="number" step="0.01" min={0} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">KDV (%)</label>
              <input {...register('taxRate', { valueAsNumber: true })} type="number" min={0} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stok Adedi</label>
              <input {...register('stock', { valueAsNumber: true })} type="number" min={0} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
              {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tedarikçi</label>
              <input {...register('supplier')} type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
            </div>
          </div>
        </>
      )}

      {/* Üretim bilgileri — sadece CUSTOM */}
      {!isReadyStock && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-4">
          <p className="text-sm font-semibold text-amber-800">Üretim Bilgileri (Özel Baskı)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min. Sipariş Adedi</label>
              <input {...register('minOrderQuantity', { valueAsNumber: true })} type="number" min={1} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Üretim Süresi (Gün)</label>
              <input {...register('productionDays', { valueAsNumber: true })} type="number" min={1} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tedarikçi</label>
            <input {...register('supplier')} type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
          </div>
        </div>
      )}

      {/* Özellik Yönetimi */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Özellik Yönetimi</h3>
          <span className="text-sm text-gray-500">Müşteri seçenekleri (Ebat, Kağıt vb.) ve fiyat etkisi</span>
        </div>
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
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            className="w-full max-w-xs px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]"
          />
        </div>
      </div>

      {/* Çoklu Resim (Max 5) */}
      <div className="border-t border-gray-200 pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Çoklu Resim (En fazla 5)</label>
        <div className="flex flex-wrap gap-3 items-start">
          {imageUrls.map((url, i) => (
            <div key={i} className="relative w-24 h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
              {(url.startsWith('http') || url.startsWith('/')) ? <img src={url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">URL</div>}
              <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">×</button>
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
                  setImageUploading(true);
                  try {
                    const form = new FormData();
                    form.append('file', f);
                    const res = await fetch('/api/upload/product', { method: 'POST', body: form });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    setImageUrls((prev) => [...prev, data.url].slice(0, 5));
                    if (imageUrls.length === 0) setValue('imageUrl', data.url);
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
      </div>

      {/* Öne Çıkan Özellikler */}
      <div className="border-t border-gray-200 pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Öne Çıkan Özellikler</label>
        <div className="space-y-2">
          {Object.entries(highlights).map(([k, v]) => (
            <div key={k} className="flex gap-2 items-center">
              <span className="text-sm font-medium text-gray-600 w-28 truncate">{k}:</span>
              <span className="text-sm text-gray-800 flex-1">{v}</span>
              <button type="button" onClick={() => setHighlights((prev) => { const n = { ...prev }; delete n[k]; return n; })} className="text-red-600 hover:bg-red-50 rounded p-1"><Trash2 size={16} /></button>
            </div>
          ))}
          <div className="flex gap-2 flex-wrap">
            <input type="text" value={highlightNewKey} onChange={(e) => setHighlightNewKey(e.target.value)} placeholder="Anahtar" className="w-36 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
            <input type="text" value={highlightNewVal} onChange={(e) => setHighlightNewVal(e.target.value)} placeholder="Değer" className="w-36 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
            <button type="button" onClick={() => { if (highlightNewKey.trim()) { setHighlights((prev) => ({ ...prev, [highlightNewKey.trim()]: highlightNewVal.trim() })); setHighlightNewKey(''); setHighlightNewVal(''); } }} className="px-3 py-2 bg-[#FF6000] text-white rounded-lg text-sm hover:bg-[#e55a00]"><Plus size={16} className="inline" /> Ekle</button>
          </div>
        </div>
      </div>

      {/* Ürün Detayı */}
      <div className="border-t border-gray-200 pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Detayı</label>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-gray-500 block mb-1">Ürün Bilgisi</span>
            <textarea value={descriptionDetail.productInfo} onChange={(e) => setDescriptionDetail((prev) => ({ ...prev, productInfo: e.target.value }))} rows={4} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" placeholder="Detaylı açıklama" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block mb-1">Ek Bilgiler</span>
            <textarea value={descriptionDetail.extraInfo} onChange={(e) => setDescriptionDetail((prev) => ({ ...prev, extraInfo: e.target.value }))} rows={3} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" placeholder="Kullanım, teslimat notları" />
          </div>
        </div>
      </div>

      {/* Benzer Ürünler (ID listesi) */}
      <div className="border-t border-gray-200 pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Benzer Ürünler (Ürün ID’leri, virgülle ayırın)</label>
        <input
          type="text"
          value={relatedProductIds.join(', ')}
          onChange={(e) => setRelatedProductIds(e.target.value.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20) as string[])}
          placeholder="id1, id2, id3"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]"
        />
      </div>

      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('isActive')} className="rounded border-gray-300 text-[#FF6000] focus:ring-[#FF6000]" />
          <span className="text-sm font-medium text-gray-700">Aktif</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('isPublished')} className="rounded border-gray-300 text-[#FF6000] focus:ring-[#FF6000]" />
          <span className="text-sm font-medium text-gray-700">Yayında (Ana sayfada görünsün)</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-[#FF6000] text-white rounded-lg hover:bg-[#e55a00] disabled:opacity-50"
        >
          {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        <Link href="/admin/products" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          İptal
        </Link>
      </div>
    </form>
  );
}
