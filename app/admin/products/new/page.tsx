'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Box, Paintbrush, Plus, Trash2, Upload } from 'lucide-react';

type ProductAttributeOption = { label: string; priceImpact: number };
type ProductAttribute = { label: string; options: ProductAttributeOption[] };

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  children?: { id: string; name: string; slug: string }[];
}

const INPUT = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] text-sm';
const LABEL = 'block text-sm font-medium text-gray-700 mb-1';
const SECTION = 'bg-white rounded-xl border border-gray-200 p-6 space-y-4';
const SECTION_TITLE = 'text-base font-semibold text-gray-900 mb-3';

function genSku() {
  return 'MG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
}

export default function NewProductPage() {
  const router = useRouter();

  /* ─── form state ─── */
  const [productType, setProductType] = useState<'READY' | 'CUSTOM'>('READY');
  const [name, setName] = useState('');
  const [sku, setSku] = useState(genSku());
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [taxRate, setTaxRate] = useState('20');
  const [stock, setStock] = useState('');
  const [minOrderQuantity, setMinOrderQuantity] = useState('');
  const [productionDays, setProductionDays] = useState('');
  const [vendorName, setVendorName] = useState('MatbaaGross');
  const [supplier, setSupplier] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>([]);
  const [highlights, setHighlights] = useState<Record<string, string>>({});
  const [highlightKey, setHighlightKey] = useState('');
  const [highlightVal, setHighlightVal] = useState('');
  const [productInfo, setProductInfo] = useState('');
  const [extraInfo, setExtraInfo] = useState('');

  /* ─── meta ─── */
  const [categories, setCategories] = useState<Category[]>([]);
  const [brandCategoryId, setBrandCategoryId] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  /* load categories */
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Category[]) => {
        const flat = Array.isArray(data) ? data : [];
        setCategories(flat);
        const found = flat.find((c) => c.slug === 'markaniza-ozel-uretim')
          ?? flat.flatMap((c) => c.children ?? []).find((c) => c.slug === 'markaniza-ozel-uretim');
        if (found) setBrandCategoryId(found.id);
      })
      .catch(() => {});
  }, []);

  /* auto-assign category when switching to CUSTOM */
  useEffect(() => {
    if (productType === 'CUSTOM' && brandCategoryId) {
      setCategoryId(brandCategoryId);
    }
  }, [productType, brandCategoryId]);

  /* ─── image upload ─── */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || imageUrls.length >= 5) return;
    setUploadError('');
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const res = await fetch('/api/upload/product', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Yükleme başarısız');
      setImageUrls((prev) => [...prev, data.url].slice(0, 5));
    } catch (err: any) {
      setUploadError(err.message || 'Görsel yüklenemedi');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  /* ─── submit ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Ürün adı zorunludur.'); return; }
    if (!sku.trim()) { setError('SKU zorunludur.'); return; }
    if (!categoryId) { setError('Kategori seçimi zorunludur.'); return; }

    const basePriceNum = productType === 'CUSTOM' ? 0 : (parseFloat(basePrice) || 0);
    const salePriceNum = salePrice ? (parseFloat(salePrice) || undefined) : undefined;
    const buyPriceNum = buyPrice ? (parseFloat(buyPrice) || undefined) : undefined;
    const taxRateNum = parseFloat(taxRate) || 20;
    const stockNum = productType === 'READY' ? (parseInt(stock, 10) || 0) : undefined;
    const moqNum = productType === 'CUSTOM' ? (parseInt(minOrderQuantity, 10) || undefined) : undefined;
    const pdNum = productType === 'CUSTOM' ? (parseInt(productionDays, 10) || undefined) : undefined;

    if (productType === 'CUSTOM' && !moqNum) {
      setError('Özel Baskı ürünü için minimum sipariş adedi zorunludur.');
      return;
    }

    const payload: any = {
      name: name.trim(),
      sku: sku.trim(),
      description: description.trim() || undefined,
      categoryId,
      productType,
      basePrice: basePriceNum,
      salePrice: salePriceNum,
      buyPrice: buyPriceNum,
      taxRate: taxRateNum,
      stock: stockNum,
      stockQuantity: stockNum,
      minOrderQuantity: moqNum,
      productionDays: pdNum,
      supplier: supplier.trim() || undefined,
      vendorName: vendorName.trim() || 'MatbaaGross',
      imageUrl: imageUrls[0] || undefined,
      images: imageUrls.length > 0 ? imageUrls : undefined,
      attributes: productAttributes.length > 0 ? productAttributes : undefined,
      highlights: Object.keys(highlights).length > 0 ? highlights : undefined,
      descriptionDetail: (productInfo || extraInfo) ? { productInfo, extraInfo } : undefined,
    };

    setSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Ürün oluşturulamadı');
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm">
          <ArrowLeft size={18} /> Listeye Dön
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ─── 1. Ürün Tipi ─── */}
        <div className={SECTION}>
          <p className={SECTION_TITLE}>Ürün Tipi</p>
          <div className="grid grid-cols-2 gap-4">
            <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${productType === 'READY' ? 'border-[#FF6000] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="productType" value="READY" checked={productType === 'READY'}
                onChange={() => setProductType('READY')} className="mt-0.5 h-4 w-4 text-[#FF6000]" />
              <div>
                <div className="flex items-center gap-2 font-semibold text-sm text-gray-900">
                  <Box className="h-4 w-4 text-[#FF6000]" /> Hazır Stok Ürün (Perakende)
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Fiyat, stok ve KDV ile normal e-ticaret akışı.</p>
              </div>
            </label>
            <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${productType === 'CUSTOM' ? 'border-[#FF6000] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="productType" value="CUSTOM" checked={productType === 'CUSTOM'}
                onChange={() => setProductType('CUSTOM')} className="mt-0.5 h-4 w-4 text-[#FF6000]" />
              <div>
                <div className="flex items-center gap-2 font-semibold text-sm text-gray-900">
                  <Paintbrush className="h-4 w-4 text-[#FF6000]" /> Özel Baskılı Ürün (Premium)
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Teklif usulü. Müşteri &quot;Fiyat Teklifi Al&quot; ile sipariş verir.</p>
              </div>
            </label>
          </div>
          {productType === 'CUSTOM' && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              Bu ürün otomatik olarak <strong>Markanıza Özel Üretim</strong> kategorisine bağlanacak. Müşteri tarafında
              fiyat gösterilmeyecek, &ldquo;Fiyat Teklifi Al&rdquo; butonu çıkacaktır.
            </div>
          )}
        </div>

        {/* ─── 2. Temel Bilgiler ─── */}
        <div className={SECTION}>
          <p className={SECTION_TITLE}>Temel Bilgiler</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Ürün Adı <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Kartvizit 350gr Mat Selefon" className={INPUT} required />
            </div>
            <div>
              <label className={LABEL}>SKU (Stok Kodu) <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input type="text" value={sku} onChange={(e) => setSku(e.target.value)}
                  className={INPUT} required />
                <button type="button" onClick={() => setSku(genSku())}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg whitespace-nowrap border border-gray-300">
                  Yeni
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className={LABEL}>Açıklama</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} placeholder="Kısa ürün açıklaması..." className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Tedarikçi</label>
            <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)}
              placeholder="Örn: Yıldız Kesim" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Satıcı / Marka Adı</label>
            <input type="text" value={vendorName} onChange={(e) => setVendorName(e.target.value)}
              placeholder="MatbaaGross" className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000] text-sm" />
          </div>
        </div>

        {/* ─── 3. Kategori ─── */}
        <div className={SECTION}>
          <p className={SECTION_TITLE}>Kategori</p>
          {productType === 'CUSTOM' ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-sm text-green-800">
                ✓ Kategori otomatik atandı: <strong>Markanıza Özel Üretim</strong>
                {!brandCategoryId && <span className="text-amber-700"> (kategori bulunamadı — önce admin panelinden oluşturun)</span>}
              </span>
            </div>
          ) : (
            <div>
              <label className={LABEL}>Kategori <span className="text-red-500">*</span></label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className={INPUT} required>
                <option value="">Kategori Seçiniz...</option>
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
            </div>
          )}
        </div>

        {/* ─── 4. Görseller ─── */}
        <div className={SECTION}>
          <p className={SECTION_TITLE}>Görseller (En fazla 5)</p>
          <div className="flex flex-wrap gap-3 items-start">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button"
                  onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
              </div>
            ))}
            {imageUrls.length < 5 && (
              <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-400 text-xs gap-1">
                <Upload size={18} />
                <span>{imageUploading ? 'Yükleniyor...' : 'Ekle'}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden" disabled={imageUploading} onChange={handleImageUpload} />
              </label>
            )}
          </div>
          {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
          <p className="text-xs text-gray-400">İlk görsel ana ürün görseli olarak kullanılır.</p>
        </div>

        {/* ─── 5. Fiyatlandırma (sadece READY) ─── */}
        {productType === 'READY' && (
          <div className={SECTION}>
            <p className={SECTION_TITLE}>Fiyatlandırma ve Stok</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={LABEL}>Taban Fiyat (TL) <span className="text-red-500">*</span></label>
                <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)}
                  step="0.01" min="0" placeholder="0.00" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Satış Fiyatı (TL)</label>
                <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)}
                  step="0.01" min="0" placeholder="0.00" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Alış / Maliyet (TL)</label>
                <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)}
                  step="0.01" min="0" placeholder="0.00" className={INPUT} />
                <p className="text-xs text-gray-400 mt-0.5">Müşteri görmez</p>
              </div>
              <div>
                <label className={LABEL}>KDV (%)</label>
                <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)}
                  min="0" max="100" placeholder="20" className={INPUT} />
              </div>
            </div>
            <div className="max-w-xs">
              <label className={LABEL}>Stok Adedi</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)}
                min="0" placeholder="0" className={INPUT} />
            </div>
          </div>
        )}

        {/* ─── 6. Min. Sipariş (sadece CUSTOM) ─── */}
        {productType === 'CUSTOM' && (
          <div className={SECTION}>
            <p className={SECTION_TITLE}>Üretim Bilgileri</p>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label className={LABEL}>Min. Sipariş Adedi <span className="text-red-500">*</span></label>
                <input type="number" value={minOrderQuantity} onChange={(e) => setMinOrderQuantity(e.target.value)}
                  min="1" placeholder="100" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Üretim Süresi (Gün)</label>
                <input type="number" value={productionDays} onChange={(e) => setProductionDays(e.target.value)}
                  min="1" placeholder="5" className={INPUT} />
              </div>
            </div>
          </div>
        )}

        {/* ─── 7. Özellik Yönetimi ─── */}
        <div className={SECTION}>
          <p className={SECTION_TITLE}>Özellik Yönetimi <span className="text-xs font-normal text-gray-400">(Ebat, Kağıt vb. + fiyat etkisi)</span></p>
          <div className="space-y-4">
            {productAttributes.map((attr, ai) => (
              <div key={ai} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <div className="flex items-center gap-2">
                  <input type="text" value={attr.label}
                    onChange={(e) => {
                      const next = [...productAttributes];
                      next[ai] = { ...attr, label: e.target.value };
                      setProductAttributes(next);
                    }}
                    placeholder="Özellik adı (örn: Kağıt Tipi)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
                  <button type="button" onClick={() => setProductAttributes(productAttributes.filter((_, i) => i !== ai))}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
                <div className="space-y-2 pl-2 border-l-2 border-orange-200">
                  {attr.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2 flex-wrap">
                      <input type="text" value={opt.label}
                        onChange={(e) => {
                          const next = [...productAttributes];
                          next[ai].options = [...attr.options];
                          next[ai].options[oi] = { ...opt, label: e.target.value };
                          setProductAttributes(next);
                        }}
                        placeholder="Seçenek (örn: 80gr Kuşe)"
                        className="flex-1 min-w-[130px] px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
                      <input type="number" value={opt.priceImpact}
                        onChange={(e) => {
                          const next = [...productAttributes];
                          next[ai].options = [...attr.options];
                          next[ai].options[oi] = { ...opt, priceImpact: Number(e.target.value) || 0 };
                          setProductAttributes(next);
                        }}
                        placeholder="+TL"
                        className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
                      <span className="text-xs text-gray-500">TL</span>
                      <button type="button" onClick={() => {
                        const next = [...productAttributes];
                        next[ai].options = attr.options.filter((_, i) => i !== oi);
                        setProductAttributes(next);
                      }} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => {
                    const next = [...productAttributes];
                    next[ai].options = [...attr.options, { label: '', priceImpact: 0 }];
                    setProductAttributes(next);
                  }} className="flex items-center gap-1 text-xs text-[#FF6000] font-medium hover:text-[#e55a00]">
                    <Plus size={13} /> Seçenek ekle
                  </button>
                </div>
              </div>
            ))}
            <button type="button"
              onClick={() => setProductAttributes([...productAttributes, { label: '', options: [{ label: '', priceImpact: 0 }] }])}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#FF6000] hover:text-[#FF6000]">
              <Plus size={16} /> Özellik ekle (Ebat, Kağıt vb.)
            </button>
          </div>
        </div>

        {/* ─── 8. Öne Çıkan Özellikler ─── */}
        <div className={SECTION}>
          <p className={SECTION_TITLE}>Öne Çıkan Özellikler <span className="text-xs font-normal text-gray-400">(Anahtar-Değer)</span></p>
          <div className="space-y-2">
            {Object.entries(highlights).map(([k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-28 truncate">{k}:</span>
                <span className="text-sm text-gray-800 flex-1">{v}</span>
                <button type="button" onClick={() => setHighlights((p) => { const n = { ...p }; delete n[k]; return n; })}
                  className="text-red-500 hover:bg-red-50 rounded p-1"><Trash2 size={15} /></button>
              </div>
            ))}
            <div className="flex gap-2 flex-wrap">
              <input type="text" value={highlightKey} onChange={(e) => setHighlightKey(e.target.value)}
                placeholder="Materyal" className="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
              <input type="text" value={highlightVal} onChange={(e) => setHighlightVal(e.target.value)}
                placeholder="Kağıt" className="w-36 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6000]" />
              <button type="button" onClick={() => {
                if (highlightKey.trim()) {
                  setHighlights((p) => ({ ...p, [highlightKey.trim()]: highlightVal.trim() }));
                  setHighlightKey(''); setHighlightVal('');
                }
              }} className="px-3 py-2 bg-[#FF6000] text-white text-sm rounded-lg hover:bg-[#e55a00]">
                <Plus size={14} className="inline" /> Ekle
              </button>
            </div>
          </div>
        </div>

        {/* ─── 9. Ürün Detayı ─── */}
        <div className={SECTION}>
          <p className={SECTION_TITLE}>Ürün Detayı</p>
          <div>
            <label className={LABEL}>Ürün Bilgisi</label>
            <textarea value={productInfo} onChange={(e) => setProductInfo(e.target.value)}
              rows={4} placeholder="Detaylı ürün açıklaması..." className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Ek Bilgiler</label>
            <textarea value={extraInfo} onChange={(e) => setExtraInfo(e.target.value)}
              rows={3} placeholder="Kullanım, kargo, teslimat notları..." className={INPUT} />
          </div>
        </div>

        {/* ─── Submit ─── */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting}
            className="px-8 py-3 bg-[#FF6000] text-white font-semibold rounded-xl hover:bg-[#e55a00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
            {submitting ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
          </button>
          <Link href="/admin/products"
            className="px-6 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            İptal
          </Link>
        </div>

      </form>
    </div>
  );
}
