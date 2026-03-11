'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Save, ExternalLink, AlertCircle, CheckCircle, Plus, Upload, Trash2, X, Factory, Phone, Mail, MapPin, Settings } from 'lucide-react';

type SellerProfileDto = {
  id: string;
  vendorId: string;
  slug: string;
  storeName: string;
  about: string | null;
  address: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  machinePark: any;
  showcase: any;
  createdAt: string;
  updatedAt: string;
} | null;

type VendorDto = {
  id: string;
  name: string;
  slug: string;
};

type ReferenceProductDto = {
  id: string;
  vendorId: string;
  title: string;
  imageUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function SellerStoreProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [vendor, setVendor] = useState<VendorDto | null>(null);
  const [profile, setProfile] = useState<SellerProfileDto>(null);

  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [about, setAbout] = useState('');
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [selectedMachineTypes, setSelectedMachineTypes] = useState<string[]>([]);
  const [referenceProducts, setReferenceProducts] = useState<ReferenceProductDto[]>([]);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [referenceSavingId, setReferenceSavingId] = useState<string | null>(null);
  const [referenceCreating, setReferenceCreating] = useState(false);

  const [editOpen, setEditOpen] = useState<null | 'store' | 'about' | 'contact' | 'machines' | 'logo' | 'banner'>(null);

  const [newRefTitle, setNewRefTitle] = useState('');
  const [newRefImageUrl, setNewRefImageUrl] = useState('');
  const [newRefDescription, setNewRefDescription] = useState('');

  const slugTouchedRef = useRef(false);

  const MACHINE_TYPES = [
    'Ofset',
    'Dijital',
    'Selefon',
    'Giyotin',
    'Lak',
    'Varak',
    'Kesim',
    'Cilt',
    'Laminasyon',
    'Etiket',
  ];

  const slugify = (value: string) => {
    const map: Record<string, string> = {
      ç: 'c',
      Ç: 'c',
      ğ: 'g',
      Ğ: 'g',
      ı: 'i',
      I: 'i',
      İ: 'i',
      ö: 'o',
      Ö: 'o',
      ş: 's',
      Ş: 's',
      ü: 'u',
      Ü: 'u',
    };

    const normalized = value
      .split('')
      .map((ch) => (map[ch] ? map[ch] : ch))
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    return normalized;
  };

  const proUrl = useMemo(() => {
    const s = (slug || '').trim();
    if (!s) return null;
    return `https://fabrika.matbaagross.com/${encodeURIComponent(s)}`;
  }, [slug]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await fetch('/api/seller/store-profile', { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof json?.error === 'string' ? json.error : 'Profil yüklenemedi');
          return;
        }

        const v = json?.vendor as VendorDto | undefined;
        const p = (json?.profile ?? null) as SellerProfileDto;
        if (v) setVendor(v);
        setProfile(p);

        setStoreName(p?.storeName ?? v?.name ?? '');
        setSlug(p?.slug ?? v?.slug ?? '');
        setAbout(p?.about ?? '');
        setAddress(p?.address ?? '');
        setContactPhone(p?.contactPhone ?? '');
        setContactEmail(p?.contactEmail ?? '');
        setLogoUrl(p?.logoUrl ?? '');
        setBannerUrl(p?.bannerUrl ?? '');

        const mp = p?.machinePark;
        if (Array.isArray(mp)) {
          setSelectedMachineTypes(mp.filter((x: any) => typeof x === 'string'));
        } else if (mp && typeof mp === 'object') {
          const keys = Object.keys(mp);
          const known = keys.filter((k) => MACHINE_TYPES.map((x) => x.toLowerCase()).includes(k.toLowerCase()));
          setSelectedMachineTypes(known.length ? known : []);
        } else if (typeof mp === 'string') {
          const raw = mp.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
          const known = raw.filter((k) => MACHINE_TYPES.map((x) => x.toLowerCase()).includes(k.toLowerCase()));
          setSelectedMachineTypes(known.length ? known : []);
        } else {
          setSelectedMachineTypes([]);
        }

      } catch {
        setError('Profil yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setReferenceLoading(true);
      try {
        const res = await fetch('/api/seller/reference-products', { cache: 'no-store', credentials: 'include' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) {
            setReferenceProducts([]);
          }
          return;
        }
        const items = Array.isArray(json?.items) ? (json.items as ReferenceProductDto[]) : [];
        if (!cancelled) setReferenceProducts(items);
      } catch {
        if (!cancelled) setReferenceProducts([]);
      } finally {
        if (!cancelled) setReferenceLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const machinePark = selectedMachineTypes.length ? selectedMachineTypes : null;

      const res = await fetch('/api/seller/store-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          slug,
          about,
          address,
          contactPhone,
          contactEmail,
          logoUrl,
          bannerUrl,
          machinePark,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json?.error === 'string' ? json.error : 'Kaydedilemedi');
        return;
      }

      setProfile(json?.profile ?? null);
      setSuccess('Profil kaydedildi.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload/widget', { method: 'POST', body: fd, credentials: 'include' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) throw new Error('Unauthorized: Satıcı hesabınızla giriş yaptığınızdan emin olun.');
      throw new Error(typeof json?.error === 'string' ? json.error : 'Yükleme başarısız');
    }
    const url = typeof json?.url === 'string' ? json.url : '';
    if (!url) throw new Error('Yükleme başarısız');
    return url;
  };

  const createReference = async () => {
    setReferenceCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const title = newRefTitle.trim();
      if (!title) {
        setError('Ürün adı zorunlu');
        return;
      }

      const imageUrl = newRefImageUrl.trim();
      if (!imageUrl) {
        setError('Görsel zorunlu');
        return;
      }

      const description = newRefDescription.trim();
      if (!description) {
        setError('Açıklama zorunlu');
        return;
      }

      const res = await fetch('/api/seller/reference-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          imageUrl,
          description,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json?.error === 'string' ? json.error : 'Kaydedilemedi');
        return;
      }

      const item = json?.item as ReferenceProductDto | undefined;
      if (item) {
        setReferenceProducts((prev) => [item, ...prev]);
      }

      setNewRefTitle('');
      setNewRefImageUrl('');
      setNewRefDescription('');

      setSuccess('Ürün eklendi.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kaydedilemedi');
    } finally {
      setReferenceCreating(false);
    }
  };

  const updateReference = async (id: string, patch: Partial<ReferenceProductDto>) => {
    setReferenceSavingId(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/seller/reference-products/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(patch),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json?.error === 'string' ? json.error : 'Güncellenemedi');
        return;
      }
      const item = json?.item as ReferenceProductDto | undefined;
      if (item) {
        setReferenceProducts((prev) => prev.map((x) => (x.id === id ? item : x)));
      }
      setSuccess('Ürün güncellendi.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Güncellenemedi');
    } finally {
      setReferenceSavingId(null);
    }
  };

  const deleteReference = async (id: string) => {
    if (!confirm('Bu ürünü silmek istiyor musunuz?')) return;
    setReferenceSavingId(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/seller/reference-products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json?.error === 'string' ? json.error : 'Silinemedi');
        return;
      }
      setReferenceProducts((prev) => prev.filter((x) => x.id !== id));
      setSuccess('Ürün silindi.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Silinemedi');
    } finally {
      setReferenceSavingId(null);
    }
  };

  if (loading) {
    return <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-gray-600">Yükleniyor...</div>;
  }

  const dirty =
    storeName !== (profile?.storeName ?? vendor?.name ?? '') ||
    slug !== (profile?.slug ?? vendor?.slug ?? '') ||
    about !== (profile?.about ?? '') ||
    address !== (profile?.address ?? '') ||
    contactPhone !== (profile?.contactPhone ?? '') ||
    contactEmail !== (profile?.contactEmail ?? '') ||
    logoUrl !== (profile?.logoUrl ?? '') ||
    bannerUrl !== (profile?.bannerUrl ?? '') ||
    JSON.stringify(selectedMachineTypes) !==
      JSON.stringify(Array.isArray(profile?.machinePark) ? profile!.machinePark : []);

  const closeEdit = () => setEditOpen(null);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Mağaza Profilim</h1>
          <p className="text-sm text-gray-600 mt-1">
            Vitrin sayfanız: {proUrl ? (
              <Link href={proUrl} target="_blank" className="inline-flex items-center gap-1 text-[#FF6000] font-semibold hover:underline">
                {proUrl}
                <ExternalLink className="h-4 w-4" />
              </Link>
            ) : (
              <span className="text-gray-500">(slug girin)</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {proUrl ? (
            <Link
              href={proUrl}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-extrabold px-4 py-2.5 transition-colors"
            >
              Vitrinimi Canlı Gör
              <ExternalLink className="h-4 w-4" />
            </Link>
          ) : null}

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF6000] hover:bg-[#e55a00] text-white font-extrabold px-4 py-2.5 transition-colors disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3 text-sm flex items-start gap-2">
          <CheckCircle className="h-5 w-5 mt-0.5" />
          <span>{success}</span>
        </div>
      ) : null}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setEditOpen('banner')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setEditOpen('banner');
          }}
          className="relative h-[220px] md:h-[320px] w-full cursor-pointer"
        >
          {bannerUrl.trim() ? (
            <>
              <img src={bannerUrl.trim()} alt={storeName || 'Banner'} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#05070f] via-[#0b1f3a] to-[#111827]" />
          )}
        </div>

        <div className="px-4 sm:px-6">
          <div className="-mt-10 pb-6 flex flex-col md:flex-row md:items-end gap-4 relative z-10">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setEditOpen('logo')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setEditOpen('logo');
              }}
              className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-white border border-white/40 shadow-xl flex items-center justify-center overflow-hidden cursor-pointer"
            >
              {logoUrl.trim() ? (
                <img src={logoUrl.trim()} alt={storeName || 'Logo'} className="h-full w-full object-contain" />
              ) : (
                <span className="text-3xl font-black text-[#0b1f3a]">{(storeName || 'M').charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setEditOpen('store')}
                    className="text-left"
                  >
                    <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 truncate hover:underline">
                      {storeName || vendor?.name || 'Mağaza'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Slug: {slug || '-'}</p>
                  </button>
                </div>

                {proUrl ? (
                  <Link
                    href={proUrl}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-extrabold px-4 py-2.5 transition-colors"
                  >
                    Vitrinimi Canlı Gör
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-[#FF6000]" />
                <h2 className="text-base font-extrabold text-gray-900">Fabrika Profili</h2>
              </div>
              <button type="button" onClick={() => setEditOpen('about')} className="text-xs font-extrabold text-[#FF6000] hover:underline">
                Düzenle
              </button>
            </div>
            <p className="text-sm md:text-[15px] leading-relaxed text-gray-700 mt-3 whitespace-pre-wrap">
              {about || 'Yakında...'}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-[#FF6000]" />
                <h2 className="text-base font-extrabold text-gray-900">İletişim Bilgileri</h2>
              </div>
              <button type="button" onClick={() => setEditOpen('contact')} className="text-xs font-extrabold text-[#FF6000] hover:underline">
                Düzenle
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {contactPhone.trim() ? (
                <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <Phone className="h-4 w-4 text-gray-700 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wide">Telefon</p>
                    <p className="text-sm font-extrabold text-gray-900 mt-1 break-words">{contactPhone}</p>
                  </div>
                </div>
              ) : null}

              {contactEmail.trim() ? (
                <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <Mail className="h-4 w-4 text-gray-700 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wide">E-posta</p>
                    <p className="text-sm font-extrabold text-gray-900 mt-1 break-words">{contactEmail}</p>
                  </div>
                </div>
              ) : null}

              {address.trim() ? (
                <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <MapPin className="h-4 w-4 text-gray-700 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wide">Adres</p>
                    <p className="text-sm font-extrabold text-gray-900 mt-1 whitespace-pre-wrap break-words">{address}</p>
                  </div>
                </div>
              ) : null}

              {!contactPhone.trim() && !contactEmail.trim() && !address.trim() ? (
                <p className="text-sm text-gray-600">Henüz iletişim bilgisi eklenmedi.</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#FF6000]" />
                <h2 className="text-base font-extrabold text-gray-900">Makine Parkuru</h2>
              </div>
              <button type="button" onClick={() => setEditOpen('machines')} className="text-xs font-extrabold text-[#FF6000] hover:underline">
                Düzenle
              </button>
            </div>
            {selectedMachineTypes.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedMachineTypes.map((t) => (
                  <span key={t} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-extrabold text-gray-800">
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 mt-3">Yakında...</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="block text-xs font-semibold text-gray-600">Teknik Referans Ürünler</label>
              </div>

            </div>

            <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold text-gray-900">Yeni Ürün Ekle</p>
                <button
                  type="button"
                  onClick={createReference}
                  disabled={referenceCreating}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF6000] hover:bg-[#e55a00] text-white font-extrabold px-4 py-2 transition-colors disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  {referenceCreating ? 'Ekleniyor...' : 'Ekle'}
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600">Ürün Adı</label>
                <input
                  value={newRefTitle}
                  onChange={(e) => setNewRefTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                  placeholder="Örn: Lüks Mıknatıslı Kutu"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600">Görsel *</label>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-extrabold text-gray-800 cursor-pointer hover:bg-gray-50">
                    <Upload className="h-4 w-4" />
                    Resim Yükle
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadImage(file);
                          setNewRefImageUrl(url);
                          setSuccess('Resim Başarıyla Yüklendi');
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Yükleme başarısız');
                        } finally {
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>

                  <input
                    value={newRefImageUrl}
                    onChange={(e) => setNewRefImageUrl(e.target.value)}
                    className="flex-1 min-w-[220px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs"
                    placeholder="...veya görsel URL yapıştırın"
                  />

                  {newRefImageUrl ? (
                    <a href={newRefImageUrl} target="_blank" rel="noreferrer" className="text-xs font-extrabold text-[#FF6000] hover:underline">
                      Önizle
                    </a>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600">Açıklama *</label>
                <textarea
                  value={newRefDescription}
                  onChange={(e) => setNewRefDescription(e.target.value)}
                  rows={5}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                  placeholder="Ürün detaylarını kısaca yazın..."
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold text-gray-900">Ürünleriniz</p>
                {referenceLoading ? <span className="text-xs text-gray-500">Yükleniyor...</span> : null}
              </div>

              <div className="mt-3 space-y-3">
                {referenceProducts.length === 0 ? (
                  <p className="text-sm text-gray-600">Henüz ürün eklenmedi.</p>
                ) : (
                  referenceProducts.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.description ? item.description : 'Açıklama yok'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateReference(item.id, item)}
                            disabled={referenceSavingId === item.id}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-extrabold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                          >
                            <Save className="h-4 w-4" />
                            {referenceSavingId === item.id ? 'Kaydediliyor...' : 'Kaydet'}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteReference(item.id)}
                            disabled={referenceSavingId === item.id}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100 disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />
                            Sil
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600">Ürün Adı</label>
                          <input
                            value={item.title}
                            onChange={(e) => setReferenceProducts((prev) => prev.map((x) => (x.id === item.id ? { ...x, title: e.target.value } : x)))}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600">Görsel URL</label>
                          <input
                            value={item.imageUrl || ''}
                            onChange={(e) => setReferenceProducts((prev) => prev.map((x) => (x.id === item.id ? { ...x, imageUrl: e.target.value } : x)))}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                            placeholder="https://..."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-semibold text-gray-600">Açıklama</label>
                          <textarea
                            value={item.description || ''}
                            onChange={(e) => setReferenceProducts((prev) => prev.map((x) => (x.id === item.id ? { ...x, description: e.target.value } : x)))}
                            rows={4}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                            placeholder="Ürün detaylarını kısaca yazın..."
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-[11px] font-semibold text-gray-600">Görsel</label>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-extrabold text-gray-800 cursor-pointer hover:bg-gray-50">
                            <Upload className="h-4 w-4" />
                            Resim Yükle
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const url = await uploadImage(file);
                                  setReferenceProducts((prev) => prev.map((x) => (x.id === item.id ? { ...x, imageUrl: url } : x)));
                                  setSuccess('Resim Başarıyla Yüklendi');
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : 'Yükleme başarısız');
                                } finally {
                                  e.target.value = '';
                                }
                              }}
                            />
                          </label>

                          {item.imageUrl ? (
                            <a href={item.imageUrl} target="_blank" rel="noreferrer" className="text-xs font-extrabold text-[#FF6000] hover:underline">
                              Önizle
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-semibold">Not</p>
            <p className="mt-1">
              Bu sayfa vitrin/referans amaçlıdır. Müşteriler teklif istemeyi Matbaagross üzerinden yapar.
            </p>
          </div>
        </div>
      </div>

      {dirty ? (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700">Kaydedilmemiş değişiklikler var</div>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF6000] hover:bg-[#e55a00] text-white font-extrabold px-4 py-2.5 transition-colors disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </div>
      ) : null}

      {editOpen ? (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4" onClick={closeEdit}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-extrabold text-gray-900">Düzenle</p>
              </div>
              <button type="button" className="p-2 rounded-full hover:bg-gray-100" onClick={closeEdit} aria-label="Kapat">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {editOpen === 'store' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Mağaza Adı</label>
                    <input
                      value={storeName}
                      onChange={(e) => {
                        const next = e.target.value;
                        setStoreName(next);
                        if (!slugTouchedRef.current) setSlug(slugify(next));
                      }}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Slug</label>
                    <input
                      value={slug}
                      onChange={(e) => {
                        slugTouchedRef.current = true;
                        setSlug(e.target.value);
                      }}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                    />
                  </div>
                </>
              ) : null}

              {editOpen === 'about' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Hakkımızda</label>
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    rows={8}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                    placeholder="Kısa tanıtım..."
                  />
                </div>
              ) : null}

              {editOpen === 'contact' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Firma Açık Adresi</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={4}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">İletişim Telefon</label>
                      <input
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">İletişim E-posta</label>
                      <input
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </>
              ) : null}

              {editOpen === 'machines' ? (
                <div>
                  <div className="text-xs font-semibold text-gray-600">Makine Parkuru</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {MACHINE_TYPES.map((t) => {
                      const active = selectedMachineTypes.includes(t);
                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() => {
                            setSelectedMachineTypes((prev) =>
                              prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                            );
                          }}
                          className={`rounded-full px-3 py-1.5 text-xs font-extrabold border transition-colors ${
                            active
                              ? 'border-[#FF6000] bg-orange-50 text-[#FF6000]'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {editOpen === 'logo' ? (
                <div className="space-y-3">
                  <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-extrabold text-gray-800 cursor-pointer hover:bg-gray-50">
                    <Upload className="h-4 w-4" />
                    Logo Yükle
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadImage(file);
                          setLogoUrl(url);
                          setSuccess('Resim Başarıyla Yüklendi');
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Yükleme başarısız');
                        } finally {
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Logo URL</label>
                    <input
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ) : null}

              {editOpen === 'banner' ? (
                <div className="space-y-3">
                  <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-extrabold text-gray-800 cursor-pointer hover:bg-gray-50">
                    <Upload className="h-4 w-4" />
                    Banner Yükle
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadImage(file);
                          setBannerUrl(url);
                          setSuccess('Resim Başarıyla Yüklendi');
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Yükleme başarısız');
                        } finally {
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Banner URL</label>
                    <input
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ) : null}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={closeEdit} className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-gray-900 font-extrabold hover:bg-gray-50">
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="text-xs text-gray-500">
        Son güncelleme: {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString('tr-TR') : '-'}
      </div>
    </div>
  );
}
