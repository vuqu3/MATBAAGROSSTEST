'use client';

import { useState } from 'react';
import { Factory, Scissors, Layers, Calendar, Clock, FileText, Send } from 'lucide-react';

export default function FasonHizmetlerPage() {
  const [selectedService, setSelectedService] = useState('baski');
  const [formData, setFormData] = useState({
    serviceType: 'baski',
    quantity: '',
    dimensions: '',
    paperType: '',
    deadline: '',
    notes: '',
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
  });

  const services = [
    {
      id: 'baski',
      name: 'Baskı Hizmetleri',
      icon: Factory,
      description: 'Ofset ve dijital baskı hizmetleri',
      fields: ['quantity', 'dimensions', 'paperType', 'deadline'],
    },
    {
      id: 'kesim',
      name: 'Kesim Hizmetleri',
      icon: Scissors,
      description: 'Makine kesim ve özel kesim hizmetleri',
      fields: ['quantity', 'dimensions', 'paperType', 'deadline'],
    },
    {
      id: 'yapistirma',
      name: 'Yapıştırma Hizmetleri',
      icon: Layers,
      description: 'Otomatik ve manuel yapıştırma',
      fields: ['quantity', 'dimensions', 'deadline'],
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form gönderme işlemi
    alert('Teklif talebiniz alındı! En kısa sürede size dönüş yapacağız.');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Başlık */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2">Fason Hizmetler</h1>
            <p className="text-xl text-gray-600">Online Teklif ve Rezervasyon Sistemi</p>
          </div>

          {/* Hizmet Seçimi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service.id);
                    setFormData((prev) => ({ ...prev, serviceType: service.id }));
                  }}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedService === service.id
                      ? 'border-[#f97316] bg-[#f97316]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className={`p-3 rounded-lg ${
                        selectedService === service.id ? 'bg-[#f97316]' : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        className={selectedService === service.id ? 'text-white' : 'text-gray-600'}
                        size={32}
                      />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg text-[#1e3a8a]">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Teklif Formu */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-[#1e3a8a]" size={28} />
              <h2 className="text-2xl font-bold text-[#1e3a8a]">Teklif / Rezervasyon Formu</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* İletişim Bilgileri */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">İletişim Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Firma Adı
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f97316]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İletişim Kişisi
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f97316]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f97316]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f97316]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Hizmet Detayları */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Hizmet Detayları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedService === 'baski' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adet
                        </label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => handleInputChange('quantity', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f97316]"
                          placeholder="Örn: 1000"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ebatlar
                        </label>
                        <input
                          type="text"
                          value={formData.dimensions}
                          onChange={(e) => handleInputChange('dimensions', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f97316]"
                          placeholder="Örn: A4, 70x100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kağıt Tipi
                        </label>
                        <select
                          value={formData.paperType}
                          onChange={(e) => handleInputChange('paperType', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f97316]"
                          required
                        >
                          <option value="">Seçiniz</option>
                          <option value="80gr">80 gr/m²</option>
                          <option value="100gr">100 gr/m²</option>
                          <option value="170gr">170 gr/m²</option>
                          <option value="250gr">250 gr/m²</option>
                        </select>
                      </div>
                    </>
                  )}
                  {selectedService === 'kesim' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adet
                        </label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => handleInputChange('quantity', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f97316]"
                          placeholder="Örn: 5000"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kesim Ebatları
                        </label>
                        <input
                          type="text"
                          value={formData.dimensions}
                          onChange={(e) => handleInputChange('dimensions', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f97316]"
                          placeholder="Örn: 70x100"
                          required
                        />
                      </div>
                    </>
                  )}
                  {selectedService === 'yapistirma' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adet
                        </label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => handleInputChange('quantity', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f97316]"
                          placeholder="Örn: 2000"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ebatlar
                        </label>
                        <input
                          type="text"
                          value={formData.dimensions}
                          onChange={(e) => handleInputChange('dimensions', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f97316]"
                          placeholder="Örn: A4"
                          required
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline mr-2" size={16} />
                      Teslim Tarihi
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f97316]"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ek Notlar
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f97316]"
                    placeholder="Özel isteklerinizi buraya yazabilirsiniz..."
                  />
                </div>
              </div>

              {/* Gönder Butonu */}
              <button
                type="submit"
                className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
              >
                <Send size={20} />
                Teklif Talep Et / Rezervasyon Yap
              </button>
            </form>
          </div>
        </div>
      </main>    </div>
  );
}
