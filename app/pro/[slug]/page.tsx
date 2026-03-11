import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BadgeCheck, Crown, Factory, Mail, MapPin, Phone, Printer, Settings, Star, ShieldCheck, Sparkles } from 'lucide-react';
import ReferenceProductsSection from './ReferenceProductsSection';
import SpecialQuoteCta from './SpecialQuoteCta';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = String(slug || '').trim();
  if (!s) return {};

  const profile = await (prisma as any).sellerProfile.findUnique({
    where: { slug: s },
    select: {
      storeName: true,
      about: true,
      vendor: { select: { name: true, slug: true } },
    },
  });

  const vendor = profile
    ? null
    : await (prisma as any).vendor.findUnique({ where: { slug: s }, select: { name: true, slug: true } });

  const name = (profile?.storeName || profile?.vendor?.name || vendor?.name || '').trim();
  if (!name) return {};

  const rawDesc = String(profile?.about || '').trim();
  const description = rawDesc ? rawDesc.slice(0, 160) : `${name} için Matbaagross onaylı üretici vitrini.`;

  const title = `${name} | Onaylı Ambalaj & Matbaa Fabrikası`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://fabrika.matbaagross.com/${encodeURIComponent(s)}`,
    },
    openGraph: {
      title,
      description,
      url: `https://fabrika.matbaagross.com/${encodeURIComponent(s)}`,
      type: 'website',
    },
  };
}

async function getProfile(slug: string) {
  return (prisma as any).sellerProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      storeName: true,
      about: true,
      address: true,
      contactPhone: true,
      contactEmail: true,
      logoUrl: true,
      bannerUrl: true,
      machinePark: true,
      showcase: true,
      rating: true,
      completedJobs: true,
      vendorId: true,
      vendor: {
        select: {
          id: true,
          name: true,
          slug: true,
          owner: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
}

async function getReferenceProducts(vendorId: string) {
  try {
    return await (prisma as any).referenceProduct.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return [];
    }
    throw err;
  }
}

async function getVendorBySlug(slug: string) {
  return (prisma as any).vendor.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      profile: { select: { rating: true, completedJobs: true } },
      owner: { select: { id: true, name: true, email: true } },
    },
  });
}

async function getRatingAndReviewCount(vendorId: string) {
  const agg = await (prisma as any).sellerReview.aggregate({
    where: { sellerId: vendorId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return {
    averageRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
    total: agg._count.rating ?? 0,
  };
}

async function getLatestReviews(vendorId: string) {
  return (prisma as any).sellerReview.findMany({
    where: { sellerId: vendorId },
    orderBy: { createdAt: 'desc' },
    take: 6,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      customer: { select: { id: true, name: true } },
    },
  });
}

function normalizeMachinePark(machinePark: any): string[] {
  if (!machinePark) return [];

  if (typeof machinePark === 'string') {
    const t = machinePark.trim();
    if (!t) return [];
    const lines = t.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    if (lines.length > 1) return lines;
    return t.split(',').map((s) => s.trim()).filter(Boolean);
  }

  if (Array.isArray(machinePark)) {
    return machinePark.map((x) => (typeof x === 'string' ? x.trim() : JSON.stringify(x))).filter(Boolean);
  }

  if (typeof machinePark === 'object') {
    const out: string[] = [];
    for (const [k, v] of Object.entries(machinePark)) {
      if (Array.isArray(v)) {
        for (const item of v) {
          const val = typeof item === 'string' ? item.trim() : JSON.stringify(item);
          if (val) out.push(`${k}: ${val}`);
        }
      } else if (typeof v === 'string') {
        const val = v.trim();
        if (val) out.push(`${k}: ${val}`);
      } else if (v != null) {
        out.push(`${k}: ${JSON.stringify(v)}`);
      }
    }
    return out;
  }

  return [String(machinePark)];
}

function normalizeShowcase(showcase: any): Array<{ title: string; imageUrl?: string | null }>{
  if (!Array.isArray(showcase)) return [];
  return showcase.map((x, idx) => {
    const title = typeof x?.title === 'string' ? x.title : `Referans ${idx + 1}`;
    const imageUrl = typeof x?.imageUrl === 'string' ? x.imageUrl : null;
    const description = typeof x?.description === 'string' ? x.description : '';
    return { title, imageUrl, description };
  });
}

function normalizePhoneForLinks(phone?: string | null) {
  const raw = String(phone ?? '').trim();
  if (!raw) return { tel: null as string | null, wa: null as string | null };
  const digits = raw.replace(/[^0-9+]/g, '');
  if (!digits) return { tel: null as string | null, wa: null as string | null };

  const waDigits = digits.replace(/\+/g, '');
  return {
    tel: digits,
    wa: waDigits || null,
  };
}

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < rounded;
        return (
          <Star
            key={i}
            className={filled ? 'h-4 w-4 text-[#D4AF37] fill-[#D4AF37]' : 'h-4 w-4 text-slate-300'}
          />
        );
      })}
    </div>
  );
}

function MachineIcon({ label }: { label: string }) {
  const t = label.toLowerCase();
  if (t.includes('kes') || t.includes('bıçak') || t.includes('die')) return <Settings className="h-4 w-4 text-[#FF6000]" />;
  if (t.includes('dijital') || t.includes('digital') || t.includes('indigo')) return <Sparkles className="h-4 w-4 text-[#FF6000]" />;
  return <Printer className="h-4 w-4 text-[#FF6000]" />;
}

export default async function ProVitrinPage({ params }: Props) {
  const { slug } = await params;
  const s = typeof slug === 'string' ? slug.trim() : '';
  if (!s) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <p className="text-lg font-extrabold text-gray-900">Üretici bulunamadı</p>
          <p className="text-sm text-gray-600 mt-2">Geçersiz profil adresi.</p>
          <div className="mt-4">
            <Link href="/" className="text-sm font-semibold text-[#FF6000] hover:underline">Anasayfaya dön</Link>
          </div>
        </div>
      </div>
    );
  }

  const profile = await getProfile(s);
  if (!profile) {
    const vendor = await getVendorBySlug(s);
    if (!vendor) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-xl w-full rounded-3xl border border-gray-200 bg-white shadow-sm p-8">
            <p className="text-2xl font-extrabold text-gray-900">Üretici bulunamadı</p>
            <p className="text-sm text-gray-600 mt-2">Bu vitrin sayfası için bir üretici kaydı bulunamadı.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/urunler?kategori=premium-urunler" className="inline-flex items-center gap-2 rounded-xl bg-[#FF6000] px-5 py-3 text-white font-extrabold hover:bg-[#e55a00] transition-colors">
                Ürünlerden teklif iste
              </Link>
              <Link href="/" className="text-sm font-semibold text-gray-700 hover:underline">Anasayfaya dön</Link>
            </div>
          </div>
        </div>
      );
    }

    const referenceProducts = await getReferenceProducts(vendor.id);
    const vendorId = vendor.id;
    const manualRating = typeof vendor.profile?.rating === 'number' ? vendor.profile.rating : 5;
    const manualCompleted = typeof vendor.profile?.completedJobs === 'number' ? vendor.profile.completedJobs : 0;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: vendor.name,
      url: `https://fabrika.matbaagross.com/${encodeURIComponent(vendor.slug)}`,
      description: 'Matbaagross Premium Onaylı Üretici',
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Technical Specifications',
          value: 'Makine parkuru bilgisi yakında.',
        },
      ],
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="relative">
          <div className="relative h-72 md:h-[420px] w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-[#05070f] via-[#0b1f3a] to-[#111827]" />
            <div className="absolute inset-0 opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(212,175,55,0.25),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.18),transparent_40%),radial-gradient(circle_at_60%_80%,rgba(59,130,246,0.18),transparent_45%)]" />
            </div>
            <div className="absolute inset-0 bg-black/25" />
          </div>

          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <div className="-mt-12 pb-6 flex flex-col md:flex-row md:items-end gap-4 relative z-10">
              <div className="h-28 w-28 md:h-36 md:w-36 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                <span className="text-4xl font-black text-[#0b1f3a]">{vendor.name?.charAt(0)?.toUpperCase?.() || 'M'}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-sm px-4 py-3 md:px-5 md:py-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start flex-wrap gap-3">
                      <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900">{vendor.name}</h1>
                      <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs md:text-sm font-extrabold text-amber-800 shadow-[0_0_20px_rgba(245,158,11,0.18)]">
                        <Crown className="h-4 w-4 text-amber-600" />
                        Premium Onaylı Üretici
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700 text-sm">
                      <BadgeCheck className="h-4 w-4 text-emerald-600" />
                      Matbaagross onaylı vitrin sayfası
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                      <div className="inline-flex items-center gap-2">
                        <Stars value={manualRating} />
                        <span className="font-extrabold text-slate-900">{Number(manualRating).toFixed(1).replace('.', ',')}</span>
                      </div>
                      <span className="text-slate-300">|</span>
                      <span className="font-semibold">{manualCompleted}+ Başarılı İş</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-7">
                <div className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-[#FF6000]" />
                  <h2 className="text-base font-extrabold text-gray-900">Fabrika Profili</h2>
                </div>
                <p className="text-sm md:text-[15px] leading-relaxed text-gray-700 mt-3 whitespace-pre-wrap">
                  Bu üretici henüz vitrin detaylarını girmedi. Teklif almak için Premium formunu kullanabilirsiniz.
                </p>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-7">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#FF6000]" />
                  <h2 className="text-base font-extrabold text-gray-900">Makine Parkuru</h2>
                </div>
                <p className="text-sm text-gray-600 mt-3">Yakında eklenecek</p>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-7">
                <h2 className="text-base font-extrabold text-gray-900">Üretimden Kareler / Referanslar</h2>
                {referenceProducts.length ? (
                  <div className="mt-5">
                    <ReferenceProductsSection vendorId={vendorId} vendorSlug={vendor.slug} items={referenceProducts} />
                  </div>
                ) : (
                  <div className="mt-5 rounded-3xl border border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-[#FF6000] mt-0.5" />
                      <div>
                        <p className="text-sm font-extrabold text-gray-900">Yakında eklenecek</p>
                        <p className="text-sm text-gray-600 mt-1">Bu üretici vitrin görsellerini hazırlıyor. Teklif almak için sağdaki formu kullanabilirsiniz.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                <div className="rounded-3xl border border-orange-200/60 bg-gradient-to-br from-white to-orange-50 shadow-sm p-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#FF6000]" />
                    <p className="text-sm font-extrabold text-gray-900">Hızlı Teklif</p>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">Bu üreticiden fiyat teklifi almak için formu doldurun. Komisyon yok.</p>
                  <SpecialQuoteCta preferredVendorId={vendorId} vendorName={vendor.name} />
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#FF6000]" />
                    <h2 className="text-base font-extrabold text-gray-900">İletişim Bilgileri</h2>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">Bu üretici iletişim bilgilerini henüz paylaşmadı.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [reviews, referenceProducts] = await Promise.all([
    getLatestReviews(profile.vendorId),
    getReferenceProducts(profile.vendorId),
  ]);

  const manualRating = typeof profile.rating === 'number' ? profile.rating : 5;
  const manualCompleted = typeof profile.completedJobs === 'number' ? profile.completedJobs : 0;

  const machineItems = normalizeMachinePark(profile.machinePark);
  const showcaseItems = normalizeShowcase(profile.showcase);

  const hasBanner = typeof profile.bannerUrl === 'string' && profile.bannerUrl.trim();
  const bannerUrl = hasBanner ? profile.bannerUrl!.trim() : null;

  const hasLogo = typeof profile.logoUrl === 'string' && profile.logoUrl.trim();
  const logoUrl = hasLogo ? profile.logoUrl!.trim() : null;
  const contact = normalizePhoneForLinks(profile.contactPhone);

  const machineGroups: Array<{ title: string; items: string[] }> = (() => {
    const mp = profile.machinePark as any;
    if (!mp) return [];
    if (typeof mp === 'object' && !Array.isArray(mp)) {
      const groups: Array<{ title: string; items: string[] }> = [];
      for (const [k, v] of Object.entries(mp)) {
        const arr = Array.isArray(v) ? v : v != null ? [v] : [];
        const lines = arr
          .map((x) => (typeof x === 'string' ? x.trim() : JSON.stringify(x)))
          .filter(Boolean);
        if (lines.length) groups.push({ title: k, items: lines });
      }
      if (groups.length) return groups;
    }
    return machineItems.length ? [{ title: 'Makine Parkuru', items: machineItems }] : [];
  })();

  const vendorId = profile.vendorId;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: profile.storeName,
    url: `https://fabrika.matbaagross.com/${encodeURIComponent(profile.slug)}`,
    description: profile.about || 'Matbaagross Premium Onaylı Üretici',
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Technical Specifications',
        value: machineItems.length ? machineItems.join(' | ') : 'Makine parkuru bilgisi yakında.',
      },
      {
        '@type': 'PropertyValue',
        name: 'Reference Products',
        value: referenceProducts.length ? referenceProducts.map((x: any) => String(x.title || '')).filter(Boolean).join(' | ') : 'Referans ürün bilgisi yakında.',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="relative">
        <div className="relative h-72 md:h-[440px] w-full">
          {bannerUrl ? (
            <>
              <Image src={bannerUrl} alt={profile.storeName} fill className="object-cover" sizes="100vw" priority />
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-[#05070f] via-[#0b1f3a] to-[#111827]" />
              <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(212,175,55,0.28),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(16,185,129,0.20),transparent_40%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.20),transparent_45%)]" />
              </div>
            </>
          )}
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="-mt-14 pb-6 flex flex-col md:flex-row md:items-end gap-6 relative z-10">
            <div className="h-28 w-28 md:h-36 md:w-36 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <Image src={logoUrl} alt={profile.storeName} width={144} height={144} className="object-contain" />
              ) : (
                <span className="text-4xl font-black text-[#0b1f3a]">{profile.storeName?.charAt(0)?.toUpperCase?.() || 'M'}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-sm px-4 py-3 md:px-5 md:py-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start flex-wrap gap-3">
                    <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900">
                      {profile.storeName}
                    </h1>
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs md:text-sm font-extrabold text-amber-800 shadow-[0_0_20px_rgba(245,158,11,0.18)]">
                      <Crown className="h-4 w-4 text-amber-600" />
                      Premium Onaylı Üretici
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700 text-sm">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                    Matbaagross onaylı vitrin sayfası
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                    <div className="inline-flex items-center gap-2">
                      <Stars value={manualRating} />
                      <span className="font-extrabold text-slate-900">{Number(manualRating).toFixed(1).replace('.', ',')}</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <span className="font-semibold">{manualCompleted}+ Başarılı İş</span>
                  </div>

                  {(contact.tel || contact.wa || profile.contactEmail) ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {contact.tel ? (
                        <a
                          href={`tel:${contact.tel}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs md:text-sm font-extrabold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          <Phone className="h-4 w-4 text-[#FF6000]" />
                          Hemen Ara
                        </a>
                      ) : null}
                      {contact.wa ? (
                        <a
                          href={`https://wa.me/${contact.wa}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs md:text-sm font-extrabold text-white hover:bg-emerald-700 transition-colors"
                        >
                          <Sparkles className="h-4 w-4" />
                          WhatsApp
                        </a>
                      ) : null}
                      {profile.contactEmail ? (
                        <a
                          href={`mailto:${profile.contactEmail}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs md:text-sm font-extrabold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          <Mail className="h-4 w-4 text-[#FF6000]" />
                          E-posta Gönder
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-7">
              <div className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-[#FF6000]" />
                <h2 className="text-base font-extrabold text-gray-900">Fabrika Profili</h2>
              </div>
              <p className="text-sm md:text-[15px] leading-relaxed text-gray-700 mt-3 whitespace-pre-wrap">
                {profile.about || 'Yakında...'}
              </p>

              {reviews.length ? (
                <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" />
                    <p className="text-xs font-extrabold text-gray-900">Son Yorumlar</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {reviews.map((r) => (
                      <div key={r.id} className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-gray-900 truncate">{r.customer?.name || 'Müşteri'}</p>
                          <div className="inline-flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                            <span className="text-xs font-extrabold text-gray-900">{Number(r.rating).toFixed(1).replace('.', ',')}</span>
                          </div>
                        </div>
                        {r.comment ? <p className="text-xs text-gray-600 mt-1 line-clamp-2">{r.comment}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-7">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#FF6000]" />
                <h2 className="text-base font-extrabold text-gray-900">Makine Parkuru</h2>
              </div>

              {machineGroups.length === 0 ? (
                <p className="text-sm text-gray-600 mt-3">Yakında...</p>
              ) : (
                <div className="mt-4 space-y-5">
                  {machineGroups.map((g) => (
                    <div key={g.title}>
                      <p className="text-xs font-extrabold text-gray-900 uppercase tracking-wide">{g.title}</p>
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {g.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                          >
                            <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#FF6000]">
                              <MachineIcon label={`${g.title} ${item}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-700 line-clamp-2">{item}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-7">
              <h2 className="text-base font-extrabold text-gray-900">Üretimden Kareler / Referanslar</h2>

              {referenceProducts.length ? (
                <div className="mt-5">
                  <ReferenceProductsSection vendorId={profile.vendorId} vendorSlug={profile.vendor?.slug || profile.slug} items={referenceProducts} />
                </div>
              ) : showcaseItems.length === 0 ? (
                <div className="mt-5 rounded-3xl border border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-[#FF6000] mt-0.5" />
                    <div>
                      <p className="text-sm font-extrabold text-gray-900">Yakında eklenecek</p>
                      <p className="text-sm text-gray-600 mt-1">Üretim örnekleri ve referans görselleri hazırlanıyor.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 [column-count:1] sm:[column-count:2] lg:[column-count:3] [column-gap:16px]">
                  {showcaseItems.map((item, idx) => (
                    <div key={idx} className="mb-4 break-inside-avoid rounded-2xl overflow-hidden border border-gray-200 bg-white group">
                      <div className="relative">
                        <div className="relative aspect-[4/3] bg-gray-100">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                          )}
                        </div>

                        {item.description ? (
                          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute inset-x-0 bottom-0 p-4">
                              <p className="text-xs font-extrabold text-white">{item.title}</p>
                              <p className="mt-1 text-xs text-white/90 line-clamp-3">{item.description}</p>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="p-4">
                        <p className="text-sm font-extrabold text-gray-900 line-clamp-2">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-3xl border border-orange-200/60 bg-gradient-to-br from-white to-orange-50 shadow-sm p-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#FF6000]" />
                  <p className="text-sm font-extrabold text-gray-900">Hızlı Teklif</p>
                </div>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">Komisyonsuz şekilde bu üreticiden fiyat teklifi al.</p>
                <SpecialQuoteCta preferredVendorId={vendorId} vendorName={profile.storeName} />

                {(contact.tel || contact.wa || profile.contactEmail) ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {contact.tel ? (
                      <a
                        href={`tel:${contact.tel}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <Phone className="h-4 w-4 text-[#FF6000]" />
                        Hemen Ara
                      </a>
                    ) : null}
                    {contact.wa ? (
                      <a
                        href={`https://wa.me/${contact.wa}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 transition-colors"
                      >
                        <Sparkles className="h-4 w-4" />
                        WhatsApp
                      </a>
                    ) : null}
                    {profile.contactEmail ? (
                      <a
                        href={`mailto:${profile.contactEmail}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <Mail className="h-4 w-4 text-[#FF6000]" />
                        E-posta
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#FF6000]" />
                  <h2 className="text-base font-extrabold text-gray-900">İletişim Bilgileri</h2>
                </div>

                {(profile.address || profile.contactPhone || profile.contactEmail) ? (
                  <div className="mt-4 space-y-3">
                    {profile.contactPhone ? (
                      <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <Phone className="h-4 w-4 text-gray-700 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wide">Telefon</p>
                          <p className="text-sm font-extrabold text-gray-900 mt-1 break-words">{profile.contactPhone}</p>
                        </div>
                      </div>
                    ) : null}

                    {profile.contactEmail ? (
                      <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <Mail className="h-4 w-4 text-gray-700 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wide">E-posta</p>
                          <a
                            href={`mailto:${profile.contactEmail}`}
                            className="text-sm font-extrabold text-[#FF6000] mt-1 break-words hover:underline"
                          >
                            {profile.contactEmail}
                          </a>
                        </div>
                      </div>
                    ) : null}

                    {profile.address ? (
                      <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <MapPin className="h-4 w-4 text-gray-700 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wide">Adres</p>
                          <p className="text-sm font-extrabold text-gray-900 mt-1 whitespace-pre-wrap break-words">{profile.address}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mt-3">Bu üretici iletişim bilgilerini henüz paylaşmadı.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
