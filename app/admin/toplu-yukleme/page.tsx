'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react';

type BulkImportResponse = {
  success: boolean;
  committed?: boolean;
  createdCount?: number;
  parsedRows: number;
  validRows: number;
  errors: string[];
  preview: Array<{
    name: string;
    sku: string;
    basePrice: number;
    stock: number;
    categoryId: string;
    description: string | null;
    imageUrl?: string | null;
    productType: 'READY' | 'CUSTOM';
  }>;
};

export default function TopluYuklemePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<BulkImportResponse | null>(null);

  const canValidate = Boolean(file) && !loading;
  const canCommit = Boolean(file) && !loading && Boolean(result?.success) && (result?.errors?.length ?? 0) === 0;

  const templateHref = '/api/admin/bulk-import/template';
  const categoryExportHref = '/api/admin/categories/export';

  const stats = useMemo(() => {
    if (!result) return null;
    return {
      parsedRows: result.parsedRows,
      validRows: result.validRows,
      errorCount: result.errors?.length ?? 0,
    };
  }, [result]);

  const submit = async (commit: boolean) => {
    if (!file) return;

    setLoading(true);
    setError('');
    if (!commit) setResult(null);

    try {
      const fd = new FormData();
      fd.append('file', file);

      const url = commit ? '/api/admin/bulk-import?commit=1' : '/api/admin/bulk-import';
      const res = await fetch(url, {
        method: 'POST',
        body: fd,
      });

      const data = (await res.json()) as BulkImportResponse | { error?: string };
      if (!res.ok) {
        setError((data as any)?.error || 'Yükleme başarısız');
        return;
      }

      setResult(data as BulkImportResponse);
    } catch (e: any) {
      setError(e?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm"
          >
            <ArrowLeft size={18} /> Listeye Dön
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Toplu Ürün Yükle</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              CSV veya Excel dosyası yükleyerek ürünleri toplu doğrulayın.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={templateHref}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-900 transition-colors"
          >
            <Download size={18} />
            Örnek Excel Şablonunu İndir (.xlsx)
          </a>
          <a
            href={categoryExportHref}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6000] text-white font-semibold hover:bg-[#e55a00] transition-colors"
          >
            <Download size={18} />
            Güncel Kategori ID Listesini İndir
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800">
          <div className="font-semibold">Bilgilendirme</div>
          <div className="mt-0.5">
            Lütfen şablondaki formatı bozmayın. Varyasyonlu ürünler için aynı <span className="font-semibold">GrupKodu (ParentSKU)</span>
            değerini kullanın.
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle size={18} className="text-amber-700 mt-0.5" />
          <div className="text-sm text-amber-900">
            <div className="font-semibold">Önemli</div>
            <div className="mt-0.5">
              Dosyada kategori ismi değil <span className="font-semibold">KategoriID</span> kullanılmalıdır.
              Yukarıdaki butondan güncel ID listesini indirip şablonu buna göre doldurun.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Dosya Seç</label>
            <label className="flex items-center justify-between gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3 min-w-0">
                <FileSpreadsheet size={18} className="text-gray-500" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {file ? file.name : 'XLSX (önerilen) veya CSV seçin'}
                  </div>
                  <div className="text-xs text-gray-500">Şablon kolonları: GrupKodu, ÜrünAdı, StokKodu, Fiyat, Stok, KategoriID, Açıklama, Resim1</div>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-gray-700 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg">
                <Upload size={16} />
                Seç
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                  setResult(null);
                  setError('');
                }}
              />
            </label>
          </div>

          <div className="flex items-end">
            <div className="w-full grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!canValidate}
                onClick={() => submit(false)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload size={18} />
                {loading ? '...' : 'Doğrula'}
              </button>
              <button
                type="button"
                disabled={!canCommit}
                onClick={() => submit(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FF6000] text-white font-semibold hover:bg-[#e55a00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload size={18} />
                {loading ? '...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Parse Edilen Satır</div>
              <div className="text-lg font-bold text-slate-900">{stats.parsedRows}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Geçerli Satır</div>
              <div className="text-lg font-bold text-slate-900">{stats.validRows}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Hata</div>
              <div className="text-lg font-bold text-slate-900">{stats.errorCount}</div>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              {result.errors.length === 0 ? (
                <>
                  <CheckCircle2 size={18} className="text-green-600" />
                  <span className="text-green-700">
                    {result.committed
                      ? `Kaydetme başarılı. Oluşturulan ürün: ${result.createdCount ?? 0}`
                      : 'Doğrulama başarılı. Kaydet butonuna basarak DB’ye yazabilirsiniz.'}
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle size={18} className="text-amber-700" />
                  <span className="text-amber-800">Bazı satırlar hatalı. Lütfen düzeltip tekrar deneyin.</span>
                </>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-sm font-semibold text-amber-900 mb-2">Hata Listesi</div>
                <ul className="space-y-1 text-sm text-amber-900">
                  {result.errors.slice(0, 50).map((e, idx) => (
                    <li key={idx} className="font-mono break-words">
                      {e}
                    </li>
                  ))}
                </ul>
                {result.errors.length > 50 && (
                  <div className="text-xs text-amber-800 mt-2">İlk 50 hata gösteriliyor.</div>
                )}
              </div>
            )}

            <div className="p-4 rounded-xl bg-white border border-gray-200">
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold">UrunAdi</th>
                        <th className="text-left px-4 py-3 font-semibold">SKU</th>
                        <th className="text-left px-4 py-3 font-semibold">Resim1</th>
                        <th className="text-left px-4 py-3 font-semibold">Fiyat</th>
                        <th className="text-left px-4 py-3 font-semibold">Stok</th>
                        <th className="text-left px-4 py-3 font-semibold">KategoriID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.preview.map((p, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="px-4 py-3 whitespace-nowrap">{p.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{p.sku}</td>
                          <td className="px-4 py-3 whitespace-nowrap max-w-[240px] truncate">{p.imageUrl ?? ''}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{p.basePrice}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{p.stock}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{p.categoryId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
