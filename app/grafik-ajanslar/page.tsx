'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, Zap, Gift, ArrowRight, CheckCircle, Clock, Shield, Users, MessageCircle, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

export default function GrafikAjanslarPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'Müşterim faturayı görür mü?',
      answer: 'Hayır, MatbaaGross olarak tüm gönderimlerde kendi logomuzu ve faturamızı kullanıyoruz. Müterinizler sizin markanızla doğrudan çalıştığınızı görür.'
    },
    {
      question: 'Ödeme vadeleri nasıl?',
      answer: 'Ajanslarımıza özel 30 gün vadeli ödeme imkanı sunuyoruz. İlk siparişten sonra kredi limitiniz artırılarak daha avantajlı koşullar sağlanır.'
    },
    {
      question: 'Minimum sipariş adedi nedir?',
      answer: 'Ajans paketlerinde minimum sipariş adedi bulunmamaktadır. Tekli ürünlerden bile alabilir, toplu gönderim avantajından yararlanabilirsiniz.'
    },
    {
      question: 'Teslimat süresi ne kadar?',
      answer: 'Standart üretim 3-5 iş günü, acil üretim 1-2 iş günü sürer. Ajans siparişlerinde öncelikli üretim garantisi veriyoruz.'
    }
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Mevcut İçerik (Arka Planda) */}
      <div className="opacity-30">
        {/* Hero Bölümü */}
        <div className="bg-gradient-to-br from-gray-50 to-white py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Sol Taraf */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Grafik Ajansları ve Tasarımcılar İçin
                  <span className="block text-orange-500">Güçlü Çözüm Ortağı</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Müşterilerinize en iyi baskı kalitesini, en uygun fiyatlarla sunun. 
                  Üretimi biz yapalım, övgüyü siz toplayın.
                </p>
                <Link 
                  href="/kayit?role=ajans"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
                >
                  Hemen Ajans Hesabı Oluştur
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              
              {/* Sağ Taraf - Görsel */}
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-100 rounded w-2/3"></div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="w-12 h-12 bg-green-100 rounded-lg mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-100 rounded w-4/5"></div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Neden MatbaaGross? */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
              Neden MatbaaGross?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Gizli Gönderim */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Gizli Gönderim
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Kargolarda MatbaaGross logosu veya faturası yer almaz. Doğrudan sizin adınıza müşterinize gider.
                </p>
              </div>

              {/* Ajanslara Özel Fiyat */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Ajanslara Özel Fiyat
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Toptan siparişlerinizde ekstra iskontolar ve özel fiyat listesi.
                </p>
              </div>

              {/* Öncelikli Üretim */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Öncelikli Üretim
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Ajans siparişlerine üretim hattında öncelik tanınır.
                </p>
              </div>

              {/* Ücretsiz Numune Kit */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Gift className="w-7 h-7 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Ücretsiz Numune Kit
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Kağıt ve baskı kalitenizi görmeniz için ücretsiz numune seti.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nasıl Çalışır? */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
              Nasıl Çalışır?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: 1, title: 'Tasarımı Yükle', desc: 'Müşteri tasarımını sistemimize yükleyin' },
                { step: 2, title: 'Otomatik Kontrol', desc: 'Dosya kontrolü ve onay süreci' },
                { step: 3, title: 'Yüksek Kalite Baskı', desc: 'Modern teknoloji ile baskı üretimi' },
                { step: 4, title: 'Sizin Adınıza Teslimat', desc: 'Müşterinize doğrudan gönderim' }
              ].map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="bg-white rounded-xl p-6 text-center h-full">
                    <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">
                      {item.desc}
                    </p>
                  </div>
                  
                  {/* Ok Bağlantıları */}
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sıkça Sorulan Sorular */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
              Sıkça Sorulan Sorular
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">
                      {faq.question}
                    </span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedFaq === index && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alt CTA */}
        <div className="bg-gray-100 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Hala sorularınız mı var? Ajans temsilcimizle görüşün
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Size özel avantajlar hakkında detaylı bilgi almak, sipariş sürecinizi 
              hızlandırmak veya teknik destek almak için uzman temsilcilerimiz hazır.
            </p>
            <Link 
              href="https://wa.me/905321234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp İletişim
            </Link>
          </div>
        </div>
      </div>

      {/* Bulanık Overlay */}
      <div className="absolute inset-0 z-50 backdrop-blur-xl bg-white/60"></div>

      {/* Merkez Kartı */}
      <div className="absolute inset-0 z-60 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          {/* Logo */}
          <div className="w-24 h-16 mx-auto mb-8 flex items-center justify-center">
            <Image
              src="/matbaagross-logo.png"
              alt="MatbaaGross"
              width={200}
              height={56}
              className="h-16 w-auto object-contain"
              priority
            />
          </div>
          
          {/* Başlık */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Ajans Platformu Hazırlanıyor
          </h1>
          
          {/* Açıklama */}
          <p className="text-gray-600 leading-relaxed mb-8">
            Grafik tasarımcılar ve ajanslar için özel fiyatlar, gizli kargo ve premium panel özelliklerimizi çok yakında hizmetinize sunacağız.
          </p>
          
          {/* Buton */}
          <Link 
            href="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
