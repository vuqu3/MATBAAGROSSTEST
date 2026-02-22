'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle, Upload, Loader2, X, Plus, Trash2 } from 'lucide-react';

const MAX_IMAGES = 5;
type ImageItem = File | string; // string = URL (mevcut yükleme)

type Category = { id: string; name: string; slug: string; parentId: string | null; order: number };

interface CategoryNode extends Category {
  children: CategoryNode[];
  level: number;
  path: string; // Full path for breadcrumb display
}

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
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageItem[]>([]);

  type VariantRow = { id: string; name: string; price: string; stock: string };
  const [variants, setVariants] = useState<VariantRow[]>([]);

  const addVariant = () =>
    setVariants((v) => [...v, { id: crypto.randomUUID(), name: '', price: '', stock: '' }]);

  const removeVariant = (id: string) =>
    setVariants((v) => v.filter((r) => r.id !== id));

  const updateVariant = (id: string, field: keyof Omit<VariantRow, 'id'>, value: string) =>
    setVariants((v) => v.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
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

  // Build hierarchical tree structure from flat categories
  const buildCategoryTree = (flatCategories: Category[]): CategoryNode[] => {
    const categoryMap = new Map<string, CategoryNode>();
    const rootCategories: CategoryNode[] = [];

    // Create map of all categories
    flatCategories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
        level: 0,
        path: category.name,
      });
    });

    // Build tree structure and calculate paths
    flatCategories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          node.level = parent.level + 1;
          node.path = `${parent.path} > ${category.name}`;
          parent.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    // Sort categories by order, then by name
    const sortCategories = (nodes: CategoryNode[]): CategoryNode[] => {
      return nodes.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return a.name.localeCompare(b.name, 'tr');
      }).map(node => ({
        ...node,
        children: sortCategories(node.children)
      }));
    };

    return sortCategories(rootCategories);
  };

  // Flatten tree for select options with proper formatting
  const flattenCategoriesForSelect = (nodes: CategoryNode[]): Array<{id: string, name: string, isLeaf: boolean}> => {
    const result: Array<{id: string, name: string, isLeaf: boolean}> = [];
    
    const flatten = (nodeList: CategoryNode[]) => {
      nodeList.forEach(node => {
        // Add current category
        result.push({
          id: node.id,
          name: node.path,
          isLeaf: node.children.length === 0
        });
        
        // Add children
        if (node.children.length > 0) {
          flatten(node.children);
        }
      });
    };
    
    flatten(nodes);
    return result;
  };

  useEffect(() => {
    fetch('/api/seller/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const categoriesArray = Array.isArray(data) ? data : [];
        setCategories(categoriesArray);
        
        // Build hierarchical tree
        const tree = buildCategoryTree(categoriesArray);
        setCategoryTree(tree);
        
        // Set default category to first leaf category (deepest level)
        const flattenedOptions = flattenCategoriesForSelect(tree);
        const firstLeaf = flattenedOptions.find(option => option.isLeaf);
        if (firstLeaf && !form.categoryId) {
          setForm((f) => ({ ...f, categoryId: firstLeaf.id }));
        }
        
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
          unitPrice: form.unitPrice ? parseFloat(form.unitPrice) : undefined,
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

  // Render category options with hierarchical structure
  const renderCategoryOptions = (nodes: CategoryNode[]): React.ReactElement[] => {
    const options: React.ReactElement[] = [];
    
    nodes.forEach(node => {
      if (node.children.length === 0) {
        // Leaf category - directly add as option
        options.push(
          <option key={node.id} value={node.id}>
            {node.path}
          </option>
        );
      } else {
        // Parent category - create optgroup
        const childOptions = renderCategoryOptions(node.children);
        if (childOptions.length > 0) {
          options.push(
            <optgroup key={node.id} label={node.name}>
              {childOptions}
            </optgroup>
          );
        }
      }
    });
    
    return options;
  };

  // Alternative: Render with breadcrumb style (fallback for browsers that don't support optgroup well)
  const renderBreadcrumbOptions = (): React.ReactElement[] => {
    const flattenedOptions = flattenCategoriesForSelect(categoryTree);
    
    return flattenedOptions.map(option => (
      <option 
        key={option.id} 
        value={option.id}
        // Disable parent categories (non-leaf nodes) to enforce selection of deepest categories
        disabled={!option.isLeaf}
        className={!option.isLeaf ? 'text-gray-400' : ''}
      >
        {option.name}
      </option>
    ));
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

          {/* Kargo & Teslimat Ölçüleri */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Kargo & Teslimat Ölçüleri</h3>
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
              {categoryTree.length > 0 ? renderCategoryOptions(categoryTree) : renderBreadcrumbOptions()}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Lütfen ürününüz için en uygun alt kategoriyi seçin. Ana kategoriler ürün eklemek için uygun değildir.
            </p>
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

          {/* Varyasyonlar */}
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Seçenekler / Varyasyonlar</h3>
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
                {/* Header */}
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
