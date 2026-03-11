import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { Mail, MapPin, Phone, Tag } from 'lucide-react';

function formatPrice(value: number | null) {
  if (value == null || !Number.isFinite(value)) return 'Fiyat belirtilmedi';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
}

export default async function MakinePazariPage() {
  const now = new Date();

  const listings = await prisma.machineListing.findMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { gt: now },
      vendor: {
        isBlocked: false,
        subscriptionStatus: { in: ['ACTIVE', 'TRIAL'] },
      },
    } as any,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      price: true,
      location: true,
      category: true,
      brand: true,
      model: true,
      year: true,
      condition: true,
      images: true,
      contactInfo: true,
      vendor: { select: { name: true, slug: true } },
      createdAt: true,
    },
  });

  return (
    <div className="max-w-[1280px] mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Makine Pazarı</h1>
        <p className="text-sm text-slate-600">Sistemdeki tüm satıcıların aktif ikinci el makine ilanları.</p>
      </div>

      {listings.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
          Henüz aktif makine ilanı bulunmuyor.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((l) => {
            const imgs = Array.isArray(l.images) ? (l.images as any[]) : l.images ? [l.images] : [];
            const imageUrl = imgs.find((x) => typeof x === 'string' && x.trim()) || null;
            const contact = (l.contactInfo && typeof l.contactInfo === 'object') ? (l.contactInfo as any) : {};
            const phone = typeof contact?.phone === 'string' ? contact.phone.trim() : '';
            const email = typeof contact?.email === 'string' ? contact.email.trim() : '';

            return (
              <div key={l.id} className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative aspect-[16/10] bg-slate-100">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={l.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  <div className="absolute left-4 bottom-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-extrabold text-slate-900 border border-white/60">
                      <Tag className="h-3.5 w-3.5 text-orange-500" />
                      {l.category}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="min-h-[44px]">
                    <p className="text-base font-extrabold text-slate-900 line-clamp-2">{l.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">{formatPrice(l.price)}</span>
                      <span className="text-slate-300">|</span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="line-clamp-1">{l.location}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {l.brand ? (
                      <span className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">{l.brand}</span>
                    ) : null}
                    {l.model ? (
                      <span className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">{l.model}</span>
                    ) : null}
                    {l.year ? (
                      <span className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">{l.year}</span>
                    ) : null}
                    {l.condition ? (
                      <span className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">{String(l.condition)}</span>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-extrabold text-slate-700">Satıcıyla İletişime Geç</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 line-clamp-1">{l.vendor?.name || 'Satıcı'}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {phone ? (
                        <a
                          href={`tel:${phone}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          <Phone className="h-4 w-4 text-orange-500" />
                          Ara
                        </a>
                      ) : null}
                      {email ? (
                        <a
                          href={`mailto:${email}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          <Mail className="h-4 w-4 text-orange-500" />
                          E-posta
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
