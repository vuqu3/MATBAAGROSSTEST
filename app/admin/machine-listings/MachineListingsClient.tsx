'use client';

import { useState } from 'react';
import { Calendar, Clock, Eye, MapPin, Package, RefreshCw, Sparkles, ToggleLeft, ToggleRight, X } from 'lucide-react';

type MachineListing = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  category: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  condition: 'NEW' | 'USED' | 'REFURBISHED';
  location: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SOLD' | 'DRAFT' | 'PENDING' | 'REJECTED';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  vendor: {
    id: string;
    name: string;
    slug: string;
    owner: {
      email: string;
      name: string | null;
    };
  };
};

const statusLabels = {
  ACTIVE: 'Aktif',
  EXPIRED: 'Süresi Dolmuş',
  SOLD: 'Satıldı',
  DRAFT: 'Taslak',
  PENDING: 'Onay Bekliyor',
  REJECTED: 'Reddedildi',
};

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
  SOLD: 'bg-blue-100 text-blue-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const conditionLabels = {
  NEW: 'Yeni',
  USED: 'İkinci El',
  REFURBISHED: 'Yenilenmiş',
};

export default function MachineListingsClient({ listings: initialListings }: { listings: MachineListing[] }) {
  const [listings, setListings] = useState<MachineListing[]>(initialListings);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<MachineListing | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setLoading(id);
    try {
      const response = await fetch(`/api/admin/machine-listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setListings(prev =>
          prev.map(listing =>
            listing.id === id ? { ...listing, status: status as any } : listing
          )
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(null);
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    setLoading(id);
    try {
      const response = await fetch(`/api/admin/machine-listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured }),
      });

      if (response.ok) {
        setListings(prev =>
          prev.map(listing =>
            listing.id === id ? { ...listing, featured } : listing
          )
        );
      }
    } catch (error) {
      console.error('Error updating featured:', error);
    } finally {
      setLoading(null);
    }
  };

  const extendExpiry = async (id: string, days: number) => {
    setLoading(id);
    try {
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + days);

      const response = await fetch(`/api/admin/machine-listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresAt: newExpiryDate.toISOString() }),
      });

      if (response.ok) {
        setListings(prev =>
          prev.map(listing =>
            listing.id === id ? { ...listing, expiresAt: newExpiryDate.toISOString() } : listing
          )
        );
      }
    } catch (error) {
      console.error('Error extending expiry:', error);
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#D4AF37]" />
            Machine Prime İlanları
          </h1>
          <p className="text-gray-600 mt-1">Premium makine ilanlarını yönetin</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Package className="h-4 w-4" />
          {listings.length} ilan
        </div>
      </div>

      {/* İlanlar Tablosu */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-semibold text-gray-700 px-6 py-3">İlan</th>
                <th className="text-left font-semibold text-gray-700 px-6 py-3">Satıcı</th>
                <th className="text-left font-semibold text-gray-700 px-6 py-3">Fiyat</th>
                <th className="text-left font-semibold text-gray-700 px-6 py-3">Durum</th>
                <th className="text-left font-semibold text-gray-700 px-6 py-3">Bitiş Tarihi</th>
                <th className="text-left font-semibold text-gray-700 px-6 py-3">Vitrin</th>
                <th className="text-right font-semibold text-gray-700 px-6 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{listing.title}</div>
                      <div className="text-sm text-gray-500">{listing.category}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{conditionLabels[listing.condition]}</span>
                        {listing.brand && listing.model && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-400">
                              {listing.brand} {listing.model}
                            </span>
                          </>
                        )}
                        {listing.year && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-400">{listing.year}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{listing.vendor.name}</div>
                      <div className="text-sm text-gray-500">{listing.vendor.owner.email}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <MapPin className="h-3 w-3" />
                        {listing.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {listing.price ? (
                      <div className="font-medium text-gray-900">
                        ₺{listing.price.toLocaleString('tr-TR')}
                      </div>
                    ) : (
                      <span className="text-gray-400">Belirtilmemiş</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[listing.status]}`}>
                      {statusLabels[listing.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${isExpired(listing.expiresAt) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {formatDate(listing.expiresAt)}
                    </div>
                    {isExpired(listing.expiresAt) && (
                      <div className="text-xs text-red-500">Süresi Dolmuş</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleFeatured(listing.id, !listing.featured)}
                      disabled={loading === listing.id}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#D4AF37] transition-colors"
                    >
                      {listing.featured ? (
                        <ToggleRight className="h-5 w-5 text-[#D4AF37]" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                      <span>{listing.featured ? 'Vitrinde' : 'Normal'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Detay Butonu */}
                      <button
                        onClick={() => setSelectedListing(listing)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Süre Uzatma */}
                      {isExpired(listing.expiresAt) && (
                        <button
                          onClick={() => extendExpiry(listing.id, 30)}
                          disabled={loading === listing.id}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="30 gün uzat"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}

                      {/* Durum Değiştirme */}
                      {listing.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateStatus(listing.id, 'ACTIVE')}
                            disabled={loading === listing.id}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => updateStatus(listing.id, 'REJECTED')}
                            disabled={loading === listing.id}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            Reddet
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detay Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedListing.title}</h2>
                  <p className="text-gray-600 mt-1">{selectedListing.category}</p>
                </div>
                <button
                  onClick={() => setSelectedListing(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Açıklama */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Açıklama</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedListing.description}</p>
              </div>

              {/* Teknik Özellikler */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Teknik Bilgiler</h3>
                  <dl className="space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Marka:</dt>
                      <dd className="font-medium">{selectedListing.brand || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Model:</dt>
                      <dd className="font-medium">{selectedListing.model || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Yıl:</dt>
                      <dd className="font-medium">{selectedListing.year || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Durum:</dt>
                      <dd className="font-medium">{conditionLabels[selectedListing.condition]}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">İletişim</h3>
                  <dl className="space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Satıcı:</dt>
                      <dd className="font-medium">{selectedListing.vendor.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">E-posta:</dt>
                      <dd className="font-medium">{selectedListing.vendor.owner.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Konum:</dt>
                      <dd className="font-medium">{selectedListing.location}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Fiyat:</dt>
                      <dd className="font-medium">
                        {selectedListing.price ? `₺${selectedListing.price.toLocaleString('tr-TR')}` : '-'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Tarih Bilgileri */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Oluşturulma</span>
                  </div>
                  <div className="font-medium mt-1">{formatDate(selectedListing.createdAt)}</div>
                </div>
                <div className={`p-3 rounded-lg ${isExpired(selectedListing.expiresAt) ? 'bg-red-50' : 'bg-green-50'}`}>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Bitiş Tarihi</span>
                  </div>
                  <div className={`font-medium mt-1 ${isExpired(selectedListing.expiresAt) ? 'text-red-700' : 'text-green-700'}`}>
                    {formatDate(selectedListing.expiresAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
