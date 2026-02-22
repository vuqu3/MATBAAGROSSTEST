'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Camera, MapPin, Calendar, Package, Clock, Sparkles } from 'lucide-react';

export default function MakineIlanVerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    model: '',
    year: '',
    condition: 'USED',
    location: '',
    duration: '1', // 1, 3, 6 ay
    images: [] as File[],
    specifications: '',
    contactPhone: '',
    contactEmail: '',
  });

  const categories = [
    'Ofset Baskı Makinesi',
    'Dijital Baskı Makinesi',
    'Kesim Makinesi',
    'Büküm Makinesi',
    'Laminasyon Makinesi',
    'Selefon Makinesi',
    'Koli Yapım Makinesi',
    'Etiket Basım Makinesi',
    'Diğer',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Burada API çağrısı yapılacak
      const response = await fetch('/api/seller/machine-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          year: formData.year ? parseInt(formData.year) : null,
          expiresAt: new Date(Date.now() + parseInt(formData.duration) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (response.ok) {
        alert('Makine ilanınız başarıyla oluşturuldu!');
        router.push('/seller-dashboard/makine-ilanlarim');
      } else {
        alert('İlan oluşturulurken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('İlan oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Başlık */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-[#D4AF37]" />
          <h1 className="text-3xl font-bold text-gray-900">Makine İlanı Ver</h1>
        </div>
        <p className="text-gray-600">
          MatbaaGross Machine Prime vitrininde makinenizi binlerce profesyonelle buluşturun
        </p>
      </div>

      {/* Premium Bilgi Kartı */}
      <div className="rounded-xl border border-[#D4AF37] bg-gradient-to-r from-[#FFF9E6] to-[#FFFDF7] p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[#D4AF37] mt-0.5" />
          <div>
            <h3 className="font-semibold text-[#D4AF37] mb-1">Premium Vitrin Avantajları</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Türkiye'nin en büyük matbaa profesyoneller ağına erişim</li>
              <li>• İlanınız süresince premium vitrinde yer alma</li>
              <li>• Detaylı teknik özellik ve çoklu resim yükleme</li>
              <li>• Doğrudan satıcı ile iletişim imkanı</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Temel Bilgiler */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-[#f97316]" />
            Temel Bilgiler
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İlan Başlığı *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                placeholder="Örn: Heidelberg Speedmaster 102"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
              >
                <option value="">Kategori Seçin</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat (TL)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                placeholder="Örn: 250000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum *
              </label>
              <select
                required
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
              >
                <option value="NEW">Yeni</option>
                <option value="USED">İkinci El</option>
                <option value="REFURBISHED">Yenilenmiş</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
              placeholder="Makinenin detaylı açıklaması, çalışma durumu, bakım geçmişi vb..."
            />
          </div>
        </div>

        {/* Teknik Özellikler */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Teknik Özellikler</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marka
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                placeholder="Örn: Heidelberg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                placeholder="Örn: Speedmaster 102"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yıl
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                placeholder="Örn: 2015"
                min="1950"
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teknik Özellikler
            </label>
            <textarea
              rows={3}
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
              placeholder="Baskı boyutu, hız, renk sayısı, kağıt gramaj aralığı vb..."
            />
          </div>
        </div>

        {/* Konum ve İletişim */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#f97316]" />
            Konum ve İletişim
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konum *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                placeholder="Örn: İstanbul / İkitelli"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İletişim Telefonu *
              </label>
              <input
                type="tel"
                required
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                placeholder="0555 123 45 67"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İletişim E-postası *
            </label>
            <input
              type="email"
              required
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
              placeholder="satici@firma.com"
            />
          </div>
        </div>

        {/* İlan Süresi */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#f97316]" />
            İlan Süresi
          </h2>

          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '1', label: '1 Ay', price: '₺500' },
              { value: '3', label: '3 Ay', price: '₺1.200' },
              { value: '6', label: '6 Ay', price: '₺2.000' },
            ].map((option) => (
              <label
                key={option.value}
                className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  formData.duration === option.value
                    ? 'border-[#D4AF37] bg-[#FFF9E6]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="duration"
                  value={option.value}
                  checked={formData.duration === option.value}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  <div className="text-sm text-[#D4AF37] font-medium">{option.price}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Gönder Butonu */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white font-semibold rounded-lg hover:from-[#B8941F] hover:to-[#9B7A1A] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Clock className="h-5 w-5 animate-spin" />
                İlan Oluşturuluyor...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                İlanı Yayınla
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
