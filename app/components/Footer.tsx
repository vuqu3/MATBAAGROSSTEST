'use client';

import { Truck, RotateCcw, CreditCard, Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface FooterProps {
  /** Fason üretim gibi B2B sayfalarında perakende ikonlarını (Ücretsiz Kargo, Grafik Onayı vb.) gizler */
  hideRetailBadges?: boolean;
}

export default function Footer({ hideRetailBadges }: FooterProps = {}) {
  return (
    <footer className="bg-[#0f172a] text-white">
      {!hideRetailBadges && (
        <div className="border-b border-gray-200 bg-gray-50 py-6 md:py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-gray-200 gap-6 md:gap-0">
                <div className="flex items-center gap-4 md:px-6 first:md:pl-0 last:md:pr-0">
                  <Truck className="h-8 w-8 flex-shrink-0 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Ücretsiz Kargo Fırsatı</h3>
                    <p className="text-sm text-gray-600 mt-0.5">1500 TL ve üzeri siparişlerde.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:px-6 first:md:pl-0 last:md:pr-0">
                  <RotateCcw className="h-8 w-8 flex-shrink-0 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Kolay İade Garantisi</h3>
                    <p className="text-sm text-gray-600 mt-0.5">Koşulsuz 7 gün içinde iade hakkı.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:px-6 first:md:pl-0 last:md:pr-0">
                  <CreditCard className="h-8 w-8 flex-shrink-0 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Esnek Ödeme</h3>
                    <p className="text-sm text-gray-600 mt-0.5">Tüm kartlara 12 aya varan taksit.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer İçerik */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">MatbaaGross</h2>
            <p className="text-gray-300 text-sm mb-4">
              Türkiye'nin Online Matbaa Toptancısı
            </p>
            <p className="text-gray-400 text-xs mb-6">
              Profesyonel matbaa ürünleri ve hizmetleri için güvenilir adresiniz.
            </p>
            
            {/* Sosyal Medya İkonları */}
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-[#f97316] rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-[#f97316] rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-[#f97316] rounded-full flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-[#f97316] rounded-full flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Kategoriler</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link href="/ofset-dijital-baski" className="flex items-center gap-2 hover:text-[#f97316] transition-all duration-200 hover:translate-x-1">
                  <span className="text-[#f97316] text-xs">▸</span>
                  Ofset & Dijital Baskı
                </Link>
              </li>
              <li>
                <Link href="/kutu-ambalaj" className="flex items-center gap-2 hover:text-[#f97316] transition-all duration-200 hover:translate-x-1">
                  <span className="text-[#f97316] text-xs">▸</span>
                  Kutu & Ambalaj
                </Link>
              </li>
              <li>
                <Link href="/restaurant-gida-grubu" className="flex items-center gap-2 hover:text-[#f97316] transition-all duration-200 hover:translate-x-1">
                  <span className="text-[#f97316] text-xs">▸</span>
                  Restoran & Gıda Grubu
                </Link>
              </li>
              <li>
                <Link href="/karton-bardak-uretimi" className="flex items-center gap-2 hover:text-[#f97316] transition-all duration-200 hover:translate-x-1">
                  <span className="text-[#f97316] text-xs">▸</span>
                  Karton Bardak Üretimi
                </Link>
              </li>
              <li>
                <Link href="/promosyon-urunleri" className="flex items-center gap-2 hover:text-[#f97316] transition-all duration-200 hover:translate-x-1">
                  <span className="text-[#f97316] text-xs">▸</span>
                  Promosyon Ürünleri
                </Link>
              </li>
              <li>
                <Link href="/brosur-ilan" className="flex items-center gap-2 hover:text-[#f97316] transition-all duration-200 hover:translate-x-1">
                  <span className="text-[#f97316] text-xs">▸</span>
                  Broşür & İlan
                </Link>
              </li>
              <li>
                <Link href="/oto-paspas" className="flex items-center gap-2 hover:text-[#f97316] transition-all duration-200 hover:translate-x-1">
                  <span className="text-[#f97316] text-xs">▸</span>
                  Oto Paspas
                </Link>
              </li>
              <li>
                <Link href="/matbaa-malzemeleri" className="flex items-center gap-2 hover:text-[#f97316] transition-all duration-200 hover:translate-x-1">
                  <span className="text-[#f97316] text-xs">▸</span>
                  Matbaa Malzemeleri
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Kurumsal</h3>
            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li>
                <Link href="/kurumsal/hakkimizda" className="hover:text-[#f97316] transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/kurumsal/iletisim" className="hover:text-[#f97316] transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/kurumsal/sikca-sorulan-sorular" className="hover:text-[#f97316] transition-colors">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href="/fason-uretim" className="hover:text-[#f97316] transition-colors">
                  Fason Üretim
                </Link>
              </li>
              <li>
                <Link href="/kargo-takip" className="hover:text-[#f97316] transition-colors">
                  Kargo Takip
                </Link>
              </li>
            </ul>
            
            {/* İletişim Bilgileri */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-[#f97316]" />
                <span>0850 123 45 67</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-[#f97316]" />
                <span>info@matbaagross.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-[#f97316]" />
                <span>İstanbul, Türkiye</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Fırsatları Kaçırmayın</h3>
            <p className="text-gray-400 text-sm mb-4">
              E-bültenimize abone olup özel indirimlerden ve kampanyalardan haberdar olun.
            </p>
            <form className="space-y-3" onSubmit={(e) => {
              e.preventDefault();
              // Burada e-bülten kayıt işlemi yapılacak
              alert('E-bülten kaydınız başarıyla alındı!');
            }}>
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#f97316] transition-colors"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white font-medium rounded-lg transition-colors"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Alt Kısım */}
      <div className="border-t border-gray-700 bg-[#0a0f1f] py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} MatbaaGross. Tüm hakları saklıdır.
            </p>
            
            {/* Ödeme ve Güven Logoları */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400 mr-2">Güvenli Ödeme:</span>
              <div className="flex gap-3">
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">iyzico</span>
                </div>
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">MC</span>
                </div>
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">TROY</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hukuksal Linkler */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/hukuksal/mesafeli-satis-sozlesmesi" className="text-xs text-gray-400 hover:text-[#f97316] transition-colors">
                Mesafeli Satış Sözleşmesi
              </Link>
              <Link href="/hukuksal/gizlilik-ve-guvenlik" className="text-xs text-gray-400 hover:text-[#f97316] transition-colors">
                Gizlilik ve Güvenlik
              </Link>
              <Link href="/hukuksal/hizmet-ve-kullanim-sartlari" className="text-xs text-gray-400 hover:text-[#f97316] transition-colors">
                Hizmet ve Kullanım Şartları
              </Link>
              <Link href="/hukuksal/iade-politikasi" className="text-xs text-gray-400 hover:text-[#f97316] transition-colors">
                İade Politikası
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
