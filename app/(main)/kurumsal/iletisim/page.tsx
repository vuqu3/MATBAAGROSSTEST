'use client';

import { useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function IletisimPage() {
  const [form, setForm] = useState({
    ad: '',
    soyad: '',
    email: '',
    konu: '',
    mesaj: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API veya e-posta entegrasyonu buraya eklenebilir
    alert('Mesajınız alındı. En kısa sürede size dönüş yapacağız.');
    setForm({ ad: '', soyad: '', email: '', konu: '', mesaj: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2">İletişim</h1>
          <p className="text-lg text-gray-600 mb-10">
            Sorularınız ve teklif talepleriniz için bize ulaşın.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Sol: İletişim Bilgileri */}
            <div className="space-y-6">
              <div className="prose prose-lg max-w-none text-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">İletişim Bilgileri</h2>
                <p className="mb-6">
                  MatbaaGross merkez ofisimiz Adana&apos;dadır. Sipariş, fason teklifi ve genel sorularınız
                  için aşağıdaki kanallardan bize ulaşabilirsiniz.
                </p>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#1e3a8a]/10">
                    <MapPin className="h-5 w-5 text-[#1e3a8a]" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Adres</span>
                    <p className="text-gray-700 text-sm mt-1">
                      Örnek Mah. Matbaa Cad. No: 1<br />
                      Seyhan / Adana, Türkiye
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#1e3a8a]/10">
                    <Phone className="h-5 w-5 text-[#1e3a8a]" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Telefon</span>
                    <p className="text-gray-700 text-sm mt-1">+90 (322) 000 00 00</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#1e3a8a]/10">
                    <Mail className="h-5 w-5 text-[#1e3a8a]" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">E-posta</span>
                    <p className="text-gray-700 text-sm mt-1">info@matbaagross.com</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#1e3a8a]/10">
                    <Clock className="h-5 w-5 text-[#1e3a8a]" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Çalışma Saatleri</span>
                    <p className="text-gray-700 text-sm mt-1">
                      Pazartesi – Cuma: 08:30 – 18:00<br />
                      Cumartesi: 09:00 – 14:00
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Sağ: İletişim Formu */}
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Bize Yazın</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ad" className="block text-sm font-medium text-gray-700 mb-1">
                      Ad
                    </label>
                    <input
                      id="ad"
                      name="ad"
                      type="text"
                      required
                      value={form.ad}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-gray-900"
                      placeholder="Adınız"
                    />
                  </div>
                  <div>
                    <label htmlFor="soyad" className="block text-sm font-medium text-gray-700 mb-1">
                      Soyad
                    </label>
                    <input
                      id="soyad"
                      name="soyad"
                      type="text"
                      required
                      value={form.soyad}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-gray-900"
                      placeholder="Soyadınız"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-gray-900"
                    placeholder="ornek@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="konu" className="block text-sm font-medium text-gray-700 mb-1">
                    Konu
                  </label>
                  <select
                    id="konu"
                    name="konu"
                    required
                    value={form.konu}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-gray-900 bg-white"
                  >
                    <option value="">Konu seçin</option>
                    <option value="siparis">Sipariş Sorgulama</option>
                    <option value="fason">Fason Teklif</option>
                    <option value="urun">Ürün Bilgisi</option>
                    <option value="iade">İade / Değişim</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="mesaj" className="block text-sm font-medium text-gray-700 mb-1">
                    Mesaj
                  </label>
                  <textarea
                    id="mesaj"
                    name="mesaj"
                    required
                    rows={5}
                    value={form.mesaj}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-gray-900"
                    placeholder="Mesajınızı yazın..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-[#1e3a8a]/90 transition-colors"
                >
                  <Send className="h-5 w-5" />
                  Gönder
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>    </div>
  );
}
