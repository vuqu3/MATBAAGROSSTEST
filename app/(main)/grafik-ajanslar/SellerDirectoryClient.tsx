'use client';

import { useMemo, useState } from 'react';
import { MapPin, Search, Settings } from 'lucide-react';

export type SellerDirectoryItem = {
  vendorId: string;
  vendorName: string;
  vendorSlug: string;
  storeName: string | null;
  bannerUrl: string | null;
  logoUrl: string | null;
  machinePark: any;
  about: string | null;
  address: string | null;
};

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

function normalizeMachinePark(machinePark: any): string[] {
  if (!machinePark) return [];

  if (Array.isArray(machinePark)) {
    return machinePark
      .map((x) => (typeof x === 'string' ? x.trim() : ''))
      .filter(Boolean);
  }

  if (typeof machinePark === 'string') {
    const t = machinePark.trim();
    if (!t) return [];
    const lines = t.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
    return lines;
  }

  if (typeof machinePark === 'object') {
    return Object.keys(machinePark)
      .map((k) => String(k).trim())
      .filter(Boolean);
  }

  return [];
}

function deriveLocation(address: string | null): string {
  const a = String(address || '').trim();
  if (!a) return '';
  const parts = a
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[parts.length - 2]} / ${parts[parts.length - 1]}`;
  }
  return parts[0] || '';
}

function initials(value: string): string {
  const t = String(value || '').trim();
  if (!t) return 'M';
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}

export default function SellerDirectoryClient({ initialItems }: { initialItems: SellerDirectoryItem[] }) {
  const [query, setQuery] = useState('');
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return initialItems.filter((item) => {
      const name = String(item.storeName || item.vendorName || '').toLowerCase();
      const machines = normalizeMachinePark(item.machinePark).map((x) => x.toLowerCase());

      const matchesQuery = !q || name.includes(q);

      const matchesMachines =
        selectedMachines.length === 0 ||
        selectedMachines.some((m) => machines.includes(m.toLowerCase()));

      return matchesQuery && matchesMachines;
    });
  }, [initialItems, query, selectedMachines]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-200">
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Üretici Rehberi</h1>
            <p className="text-sm text-slate-600">
              Onaylı üreticileri keşfedin. Makine parkuruna göre filtreleyin ve vitrin profillerini inceleyin.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Firma adına göre ara"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                />
              </div>
            </div>

            <div className="lg:col-span-7 xl:col-span-8">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-700">Makine parkuru filtresi</p>
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    {filtered.length} sonuç
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {MACHINE_TYPES.map((t) => {
                    const active = selectedMachines.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setSelectedMachines((prev) =>
                            prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                          )
                        }
                        className={`rounded-lg px-2.5 py-1 text-[12px] font-semibold border transition-colors ${
                          active
                            ? 'border-orange-300 bg-orange-100/60 text-orange-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}

                  {selectedMachines.length ? (
                    <button
                      type="button"
                      onClick={() => setSelectedMachines([])}
                      className="rounded-lg px-2.5 py-1 text-[12px] font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    >
                      Temizle
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-600 shadow-sm">
            Sonuç bulunamadı
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item) => {
              const href = `https://fabrika.matbaagross.com/${encodeURIComponent(item.vendorSlug)}`;
              const title = item.storeName || item.vendorName;
              const about = String(item.about || '').trim();
              const location = deriveLocation(item.address);

              return (
                <a
                  key={item.vendorId}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative">
                    <div className="relative h-24 bg-slate-100">
                      {item.bannerUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.bannerUrl} alt={title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-600" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
                    </div>

                    <div className="absolute left-4 -bottom-6">
                      <div className="h-12 w-12 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
                        {item.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.logoUrl} alt={title} className="h-full w-full object-contain" />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-orange-100 to-slate-50 flex items-center justify-center">
                            <span className="text-sm font-bold text-slate-800">{initials(title)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pt-9 pb-4">
                    <div className="min-h-[44px]">
                      <p className="text-lg font-semibold text-gray-800 leading-snug line-clamp-2">{title}</p>
                      {location ? (
                        <div className="mt-1 inline-flex items-center gap-1.5 text-sm text-gray-500">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="line-clamp-1">{location}</span>
                        </div>
                      ) : null}
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-3 mt-2">
                      {about ? about : (
                        <span className="text-slate-400">Henüz fabrika profili açıklaması eklenmedi.</span>
                      )}
                    </p>

                    <button
                      type="button"
                      className="mt-4 w-full rounded-lg bg-white text-orange-500 border border-orange-500 text-sm font-semibold py-2.5 transition-colors hover:bg-orange-500 hover:text-white"
                    >
                      Profili ve Fiyatları İncele
                    </button>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
