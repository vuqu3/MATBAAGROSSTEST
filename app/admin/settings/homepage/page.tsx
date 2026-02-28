'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';

type HomepageSectionType = 'PRODUCT_CAROUSEL' | 'BANNER_GRID';

type HomepageSection = {
  id: string;
  title: string;
  type: HomepageSectionType;
  order: number;
  isActive: boolean;
  metadata: any;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: string;
  name: string;
};

type CarouselMetadata = {
  source?: 'LATEST' | 'CATEGORY' | 'MANUAL';
  limit?: number;
  categoryId?: string;
  productIds?: string[];
};

type BannerItem = {
  imageUrl: string;
  link?: string;
  alt?: string;
};

type BannerGridMetadata = {
  columns?: 1 | 2 | 3 | 4;
  banners?: BannerItem[];
  aspectRatio?: 'landscape' | 'square';
};

function safeJsonParse(value: string) {
  try {
    return { ok: true as const, data: JSON.parse(value) };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

export default function AdminHomepageLayoutPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<HomepageSectionType>('PRODUCT_CAROUSEL');
  const [formActive, setFormActive] = useState(true);

  // PRODUCT_CAROUSEL form
  const [carouselSource, setCarouselSource] = useState<'LATEST' | 'CATEGORY' | 'MANUAL'>('LATEST');
  const [carouselLimit, setCarouselLimit] = useState('10');
  const [carouselCategoryId, setCarouselCategoryId] = useState<string>('');
  const [carouselProductIds, setCarouselProductIds] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  // BANNER_GRID form
  const [bannerColumns, setBannerColumns] = useState<'1' | '2' | '3' | '4'>('2');
  const [bannerAspectRatio, setBannerAspectRatio] = useState<'landscape' | 'square'>('square');
  const [banners, setBanners] = useState<BannerItem[]>([
    { imageUrl: '', link: '' },
    { imageUrl: '', link: '' },
  ]);
  const [bannerFiles, setBannerFiles] = useState<(File | null)[]>([null, null]);
  const [uploadingBanners, setUploadingBanners] = useState<boolean[]>([false, false]);

  // Advanced JSON override
  const [rawMetadata, setRawMetadata] = useState<string>('');
  const [useRawMetadata, setUseRawMetadata] = useState(false);

  const loadSections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage-sections', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setSections(Array.isArray(data) ? data : []);
      else setSections([]);
    } catch {
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setCategories(data.map((c: any) => ({ id: c.id, name: c.name })));
      }
    } catch {
      // ignore
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setProducts(data.filter((p: any) => p.isPublished && p.isActive));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadSections();
    loadCategories();
    loadProducts();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setFormTitle('');
    setFormType('PRODUCT_CAROUSEL');
    setFormActive(true);

    setCarouselSource('LATEST');
    setCarouselLimit('10');
    setCarouselCategoryId('');
    setCarouselProductIds([]);
    setSelectedProducts([]);
    setProductSearchTerm('');

    setBannerColumns('2');
    setBannerAspectRatio('square');
    setBanners([
      { imageUrl: '', link: '' },
      { imageUrl: '', link: '' },
    ]);
    setBannerFiles([null, null]);
    setUploadingBanners([false, false]);

    setRawMetadata('');
    setUseRawMetadata(false);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = async (section: HomepageSection) => {
    resetForm();
    setEditing(section);
    setFormTitle(section.title);
    setFormType(section.type);
    setFormActive(section.isActive);

    if (section.type === 'PRODUCT_CAROUSEL') {
      const md = (section.metadata ?? {}) as CarouselMetadata;
      const source = md.source === 'CATEGORY' ? 'CATEGORY' : md.source === 'MANUAL' ? 'MANUAL' : 'LATEST';
      setCarouselSource(source);
      setCarouselLimit(String(md.limit ?? 10));
      setCarouselCategoryId(md.categoryId ?? '');
      setCarouselProductIds(md.productIds ?? []);
      
      // Load selected products for manual selection
      if (md.productIds && Array.isArray(md.productIds) && md.productIds.length > 0) {
        try {
          const res = await fetch('/api/products?limit=100');
          const allProducts = res.ok ? await res.json() : [];
          const selected = allProducts.filter((p: any) => md.productIds!.includes(p.id));
          setSelectedProducts(selected);
        } catch {
          // ignore
        }
      }
    } else {
      const md = (section.metadata ?? {}) as BannerGridMetadata;
      setBannerColumns(String(md.columns ?? 2) as any);
      setBannerAspectRatio(md.aspectRatio === 'landscape' ? 'landscape' : 'square');
      const nextBanners = Array.isArray(md.banners) ? md.banners : [];
      setBanners(nextBanners.length ? nextBanners : [{ imageUrl: '', link: '' }, { imageUrl: '', link: '' }]);
      setBannerFiles(nextBanners.length ? new Array(nextBanners.length).fill(null) : [null, null]);
      setUploadingBanners(nextBanners.length ? new Array(nextBanners.length).fill(false) : [false, false]);
    }

    setRawMetadata(JSON.stringify(section.metadata ?? {}, null, 2));
    setShowForm(true);
  };

  const computedMetadata = useMemo(() => {
    if (useRawMetadata) {
      const parsed = safeJsonParse(rawMetadata || '{}');
      return parsed.ok ? parsed.data : null;
    }

    if (formType === 'PRODUCT_CAROUSEL') {
      const md: CarouselMetadata = {
        source: carouselSource,
        limit: Math.max(1, Number(carouselLimit) || 10),
      };
      if (carouselSource === 'CATEGORY' && carouselCategoryId) md.categoryId = carouselCategoryId;
      if (carouselSource === 'MANUAL' && carouselProductIds.length > 0) md.productIds = carouselProductIds;
      return md;
    }

    const cols = (Number(bannerColumns) as 1 | 2 | 3 | 4) || 2;
    const cleaned = banners
      .map((b) => ({
        imageUrl: (b.imageUrl || '').trim(),
        link: (b.link || '').trim() || undefined,
        alt: (b.alt || '').trim() || undefined,
      }))
      .filter((b) => b.imageUrl);

    const md: BannerGridMetadata = {
      columns: cols,
      banners: cleaned,
      aspectRatio: bannerAspectRatio,
    };
    return md;
  }, [
    useRawMetadata,
    rawMetadata,
    formType,
    carouselSource,
    carouselLimit,
    carouselCategoryId,
    carouselProductIds,
    bannerColumns,
    bannerAspectRatio,
    banners,
    bannerFiles,
    uploadingBanners,
  ]);

  const uploadBannerImage = async (file: File, index: number): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'Görsel yüklenirken bir hata oluştu.');
    }

    if (!data.url) {
      throw new Error('Görsel yüklenirken bir hata oluştu.');
    }

    return data.url;
  };

  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Resim dosyası 5MB\'dan küçük olmalıdır.');
      return;
    }

    const newBannerFiles = [...bannerFiles];
    newBannerFiles[index] = file;
    setBannerFiles(newBannerFiles);

    const newUploading = [...uploadingBanners];
    newUploading[index] = true;
    setUploadingBanners(newUploading);

    try {
      const uploadedUrl = await uploadBannerImage(file, index);
      const newBanners = [...banners];
      newBanners[index] = { ...newBanners[index], imageUrl: uploadedUrl || '' };
      setBanners(newBanners);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Görsel yüklenemedi');
    } finally {
      const newUploading = [...uploadingBanners];
      newUploading[index] = false;
      setUploadingBanners(newUploading);
    }
  };

  const removeBannerImage = (index: number) => {
    const newBannerFiles = [...bannerFiles];
    newBannerFiles[index] = null;
    setBannerFiles(newBannerFiles);

    const newBanners = [...banners];
    newBanners[index] = { ...newBanners[index], imageUrl: '' };
    setBanners(newBanners);
  };

  const saveSection = async () => {
    if (!formTitle.trim()) {
      alert('Başlık zorunlu');
      return;
    }

    if (useRawMetadata) {
      const parsed = safeJsonParse(rawMetadata || '{}');
      if (!parsed.ok) {
        alert(`Metadata JSON hatalı: ${parsed.error}`);
        return;
      }
    }

    if (!computedMetadata) {
      alert('Metadata oluşturulamadı');
      return;
    }

    setSaving(true);
    try {
      const url = editing ? `/api/admin/homepage-sections/${editing.id}` : '/api/admin/homepage-sections';
      const method = editing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          type: formType,
          isActive: formActive,
          metadata: computedMetadata,
        }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error ?? 'Kaydedilemedi');
        return;
      }

      await loadSections();
      setShowForm(false);
      resetForm();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm('Bu bölümü silmek istediğinizden emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/homepage-sections/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error ?? 'Silinemedi');
        return;
      }
      await loadSections();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Silinemedi');
    }
  };

  const toggleActive = async (section: HomepageSection) => {
    try {
      const res = await fetch(`/api/admin/homepage-sections/${section.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !section.isActive }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error ?? 'Güncellenemedi');
        return;
      }
      setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, isActive: !s.isActive } : s)));
    } catch {
      alert('Güncellenemedi');
    }
  };

  const reorder = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...sections].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((s) => s.id === id);
    if (index === -1) return;

    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= sorted.length) return;

    const a = sorted[index];
    const b = sorted[swapWith];

    const updated = sorted.map((s) => {
      if (s.id === a.id) return { ...s, order: b.order };
      if (s.id === b.id) return { ...s, order: a.order };
      return s;
    });

    setSections(updated);

    try {
      const res = await fetch('/api/admin/homepage-sections/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updated.map((s) => ({ id: s.id, order: s.order })),
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error ?? 'Sıralama güncellenemedi');
        await loadSections();
      }
    } catch {
      await loadSections();
    }
  };

  const metadataPreview = useMemo(() => {
    try {
      return JSON.stringify(computedMetadata ?? {}, null, 2);
    } catch {
      return '';
    }
  }, [computedMetadata]);

  const isRawJsonInvalid = useMemo(() => {
    if (!useRawMetadata) return false;
    const parsed = safeJsonParse(rawMetadata || '{}');
    return !parsed.ok;
  }, [useRawMetadata, rawMetadata]);

  if (loading) {
    return <div className="text-slate-600">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ana Sayfa Düzeni</h1>
          <p className="mt-1 text-slate-600 text-sm">Ana sayfada görünecek blokları buradan ekleyip sıralayabilirsiniz.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800"
        >
          Yeni Bölüm Ekle
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Bölümler</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {sections.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">Henüz bölüm eklenmedi.</div>
            ) : (
              sections
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((s, idx, arr) => (
                  <div key={s.id} className="p-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">#{s.order}</span>
                        <span className="font-semibold text-slate-900 truncate">{s.title}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${s.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {s.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {s.type}
                        </span>
                      </div>
                      <pre className="mt-2 text-[11px] bg-slate-50 border border-slate-100 rounded p-2 overflow-auto max-h-28">{JSON.stringify(s.metadata ?? {}, null, 2)}</pre>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => reorder(s.id, 'up')}
                          disabled={idx === 0}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Yukarı
                        </button>
                        <button
                          type="button"
                          onClick={() => reorder(s.id, 'down')}
                          disabled={idx === arr.length - 1}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Aşağı
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleActive(s)}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Aktif/Pasif
                      </button>

                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="rounded-md bg-orange-600 text-white px-2 py-1 text-xs font-semibold hover:bg-orange-700"
                      >
                        Düzenle
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteSection(s.id)}
                        className="rounded-md border border-red-200 bg-red-50 text-red-700 px-2 py-1 text-xs font-semibold hover:bg-red-100"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">{editing ? 'Bölümü Düzenle' : 'Yeni Bölüm'}</h2>
            {showForm && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Kapat
              </button>
            )}
          </div>

          {!showForm ? (
            <div className="p-4 text-sm text-slate-500">Yeni bölüm eklemek için “Yeni Bölüm Ekle” butonuna tıkla veya listeden bir bölümü düzenle.</div>
          ) : (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Başlık</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Örn: Günün Fırsatları"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Tip</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as HomepageSectionType)}
                    className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="PRODUCT_CAROUSEL">Ürün Kaydırıcısı</option>
                    <option value="BANNER_GRID">Banner Grid</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Aktif</label>
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-700">Metadata</p>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={useRawMetadata}
                      onChange={(e) => setUseRawMetadata(e.target.checked)}
                    />
                    JSON ile düzenle
                  </label>
                </div>

                {!useRawMetadata ? (
                  <div className="mt-3 space-y-3">
                    {formType === 'PRODUCT_CAROUSEL' ? (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-medium text-slate-700">Kaynak</label>
                            <select
                              value={carouselSource}
                              onChange={(e) => setCarouselSource(e.target.value as any)}
                              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                            >
                              <option value="LATEST">Yeni Ürünler</option>
                              <option value="CATEGORY">Kategori</option>
                              <option value="MANUAL">Manuel Ürün Seç</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700">Limit</label>
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={carouselLimit}
                              onChange={(e) => setCarouselLimit(e.target.value)}
                              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                        </div>

                        {carouselSource === 'CATEGORY' && (
                          <div>
                            <label className="block text-xs font-medium text-slate-700">Kategori</label>
                            <select
                              value={carouselCategoryId}
                              onChange={(e) => setCarouselCategoryId(e.target.value)}
                              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                            >
                              <option value="">Seçiniz</option>
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {carouselSource === 'MANUAL' && (
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-2">Ürün Seçimi</label>
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={productSearchTerm}
                                onChange={(e) => setProductSearchTerm(e.target.value)}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Ürün ara..."
                              />
                              <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-md">
                                {products
                                  .filter((p) => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) && !selectedProducts.some((sp) => sp.id === p.id))
                                  .slice(0, 10)
                                  .map((product) => (
                                    <div
                                      key={product.id}
                                      onClick={() => {
                                        setSelectedProducts([...selectedProducts, product]);
                                        setCarouselProductIds([...carouselProductIds, product.id]);
                                        setProductSearchTerm('');
                                      }}
                                      className="p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                    >
                                      <div className="text-xs font-medium text-slate-900 truncate">{product.name}</div>
                                      <div className="text-[11px] text-slate-500">{Number(product.basePrice).toLocaleString('tr-TR')} TL</div>
                                    </div>
                                  ))}
                              </div>
                              {selectedProducts.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-[11px] font-medium text-slate-700 mb-1">Seçilen Ürünler:</div>
                                  <div className="space-y-1 max-h-24 overflow-y-auto">
                                    {selectedProducts.map((product, idx) => (
                                      <div key={product.id} className="flex items-center justify-between p-1 bg-slate-50 rounded">
                                        <div className="flex-1 min-w-0">
                                          <div className="text-xs font-medium text-slate-900 truncate">{product.name}</div>
                                          <div className="text-[11px] text-slate-500">{Number(product.basePrice).toLocaleString('tr-TR')} TL</div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedProducts(selectedProducts.filter((_, i) => i !== idx));
                                            setCarouselProductIds(carouselProductIds.filter((id, i) => i !== idx));
                                          }}
                                          className="text-xs text-red-600 hover:text-red-800 ml-2"
                                        >
                                          Kaldır
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-medium text-slate-700">Grid Kolon</label>
                            <select
                              value={bannerColumns}
                              onChange={(e) => setBannerColumns(e.target.value as any)}
                              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                            >
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                            </select>
                            <p className="mt-1 text-[11px] text-slate-500">
                              {bannerAspectRatio === 'landscape'
                                ? bannerColumns === '1'
                                  ? 'Tavsiye edilen boyut: 1200x320px (şerit)'
                                  : bannerColumns === '2'
                                    ? 'Tavsiye edilen boyut: 800x320px (şerit)'
                                    : 'Tavsiye edilen boyut: 600x320px (şerit)'
                                : bannerColumns === '1'
                                  ? 'Tavsiye edilen boyut: 1200x400px (veya 16:9 yatay)'
                                  : bannerColumns === '2'
                                    ? 'Tavsiye edilen boyut: 800x400px'
                                    : 'Tavsiye edilen boyut: 600x400px veya 1:1 kare format'}
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700">Banner Formatı</label>
                            <select
                              value={bannerAspectRatio}
                              onChange={(e) => setBannerAspectRatio(e.target.value as any)}
                              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                            >
                              <option value="landscape">İnce &amp; Yatay (Örn: Şerit bannerlar)</option>
                              <option value="square">Büyük &amp; Kare (Örn: Vurgulu görseller)</option>
                            </select>
                          </div>

                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => {
                                const newColumns = Number(bannerColumns) as 1 | 2 | 3 | 4;
                                setBanners([...banners, { imageUrl: '', link: '' }]);
                                setBannerFiles([...bannerFiles, null]);
                                setUploadingBanners([...uploadingBanners, false]);
                              }}
                              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Banner Ekle
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {banners.map((b, i) => (
                            <div key={i} className="border border-slate-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-slate-700">Banner #{i + 1}</label>
                                {banners.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBanners(banners.filter((_, idx) => idx !== i));
                                      setBannerFiles(bannerFiles.filter((_, idx) => idx !== i));
                                      setUploadingBanners(uploadingBanners.filter((_, idx) => idx !== i));
                                    }}
                                    className="text-xs text-red-600 hover:text-red-800"
                                  >
                                    Kaldır
                                  </button>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">Görsel</label>
                                  {bannerFiles[i] || b.imageUrl ? (
                                    <div className="border rounded-md p-2">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <p className="text-xs font-medium text-slate-900 truncate">
                                            {bannerFiles[i]?.name || 'Mevcut görsel'}
                                          </p>
                                          {bannerFiles[i] && (
                                            <p className="text-xs text-slate-500">
                                              {(bannerFiles[i]!.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => removeBannerImage(i)}
                                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                      {(bannerFiles[i] || b.imageUrl) && (
                                        <div
                                          className={`relative w-full ${
                                            bannerAspectRatio === 'landscape' ? 'aspect-[16/5]' : 'aspect-[4/3]'
                                          } bg-neutral-50 rounded-lg overflow-hidden border border-slate-200`}
                                        >
                                          <Image
                                            src={bannerFiles[i] ? URL.createObjectURL(bannerFiles[i]!) : b.imageUrl}
                                            alt="Preview"
                                            fill
                                            className="object-contain"
                                            sizes="320px"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleBannerImageChange(e, i)}
                                        className="hidden"
                                        id={`bannerImage${i}`}
                                      />
                                      <label
                                        htmlFor={`bannerImage${i}`}
                                        className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 py-2"
                                      >
                                        {uploadingBanners[i] ? (
                                          <div className="text-xs text-slate-500">Yükleniyor...</div>
                                        ) : (
                                          <>
                                            <Upload className="w-4 h-4 text-gray-400 mb-1" />
                                            <span className="text-xs text-gray-600">Görsel seç</span>
                                          </>
                                        )}
                                      </label>
                                    </div>
                                  )}
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">Link (opsiyonel)</label>
                                  <input
                                    value={b.link ?? ''}
                                    onChange={(e) => setBanners((prev) => prev.map((x, idx) => idx === i ? { ...x, link: e.target.value } : x))}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                                    placeholder="https://..."
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <div>
                      <p className="text-[11px] text-slate-600 font-medium">Önizleme (kayıt edilecek metadata)</p>
                      <pre className="mt-1 text-[11px] bg-white border border-slate-200 rounded p-2 overflow-auto max-h-40">{metadataPreview}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <textarea
                      value={rawMetadata}
                      onChange={(e) => setRawMetadata(e.target.value)}
                      className={`w-full h-44 border rounded-md px-3 py-2 text-xs font-mono ${isRawJsonInvalid ? 'border-red-300' : 'border-slate-300'}`}
                      placeholder='{"source":"LATEST","limit":10}'
                    />
                    {isRawJsonInvalid && (
                      <p className="mt-1 text-xs text-red-600">JSON geçersiz.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={saveSection}
                  disabled={saving}
                  className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
