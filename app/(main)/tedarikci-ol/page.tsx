'use client';

import { useState } from 'react';
import { TrendingUp, Shield, Package, Users, MapPin, Clock, ArrowRight, FileText, Box, Droplets, Tag, Wrench, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function TedarikciOlPage() {
  const [formData, setFormData] = useState({
    firmaAdi: '',
    yetkiliKisi: '',
    telefon: '',
    email: '',
    urunGrubu: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const handleCategoryClick = (kategori: string) => {
    setFormData(prev => ({ ...prev, urunGrubu: kategori }));
    document.getElementById('basvuru-formu')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleExpand = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setExpandedCard(prev => (prev === index ? null : index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch('/api/supplier-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.firmaAdi,
          contactName: formData.yetkiliKisi,
          phone: formData.telefon,
          email: formData.email,
          productGroup: formData.urunGrubu,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Başvuru gönderilemedi.');
      }

      setSubmitMessage(data.message);
      setFormData({
        firmaAdi: '',
        yetkiliKisi: '',
        telefon: '',
        email: '',
        urunGrubu: ''
      });
    } catch (err: any) {
      setSubmitMessage(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const avantajlar = [
    {
      icon: Package,
      title: 'Satış Hacmi',
      description: 'Sürekli ve yüksek hacimli sipariş akışı.'
    },
    {
      icon: Shield,
      title: 'Garanti Ödeme',
      description: 'Vadeli değil, planlı ve garanti ödeme sistemi.'
    },
    {
      icon: TrendingUp,
      title: 'Marka Bilinirliği',
      description: 'Firmanızı Türkiye geneline tanıtma fırsatı.'
    }
  ];

  const urunKategorileri = [
    {
      kategori: 'Kağıt & Karton Grubu',
      ikon: FileText,
      ozet: 'Hamur, Kuşe, Bristol, Krome, Mukavva ve tüm kağıt çeşitleri',
      etiketler: ['Hamur Kağıt', 'Kuşe Kağıt (Mat/Parlak)', 'Amerikan Bristol', 'Krome Karton', 'Kraft Kağıdı', 'Saman Kağıdı', 'Pelür Kağıdı', 'Otokopili Kağıt', 'Sticker Kağıt', 'Fantazi Kağıt', 'Oluklu Mukavva', 'Kraft Liner', 'Test Liner', 'Fluting', 'Gri Mukavva', 'Cilt Bezi', 'Laminasyon Filmi', 'Termal Kağıt Ruloları', 'LWC Kağıt', 'Metalize Kağıt']
    },
    {
      kategori: 'Ambalaj Malzemeleri',
      ikon: Box,
      ozet: 'Koli, kutu, çanta, streç film ve tüm paketleme malzemeleri',
      etiketler: ['Karton Koli', 'Pizza Kutusu', 'Ayakkabı Kutusu', 'Takı & Aksesuar Kutusu', 'E-ticaret Gönderi Kutusu', 'Kraft Çanta', 'Karton Çanta', 'Plastik Poşet', 'Bez Çanta', 'Streç Film', 'Balonlu Naylon', 'Çemberleme Bandı', 'Koli Bandı', 'Shrink Film', 'Kağıt Bardak', 'Plastik Tabak & Çatal', 'Vakum Poşeti', 'Naylon Branda', 'Alüminyum Folyo Kaplar', 'Pastane Kutuları']
    },
    {
      kategori: 'Matbaa Boyaları & Kimyasalları',
      ikon: Droplets,
      ozet: 'Ofset mürekkepleri, UV lak, vernik ve matbaa kimyasalları',
      etiketler: ['Ofset Baskı Boyası', 'UV Mürekkep', 'Flexo Baskı Boyası', 'Serigrafi Boyası', 'Pantone Renk Katalogları', 'Matbaa Verniği', 'Disperziyon Lakı', 'UV Lak', 'Hazne Suyu Konsantresi', 'Merdane Temizleyici', 'Kalıp Temizleme Kimyasalları', 'Montaj Bandı', 'Kauçuk Baskı Battaniyesi', 'Hazne Tozu', 'Spray Pudrası', 'Mürekkep İnceltici', 'Fosforlu Boyalar', 'Metalize Mürekkepler', 'Pigment Boya', 'Kurutucu Yardımcılar']
    },
    {
      kategori: 'Etiket, Folyo & Sarf',
      ikon: Tag,
      ozet: 'Rulo etiket, yaldız folyo, PVC/PP/PET folyo çeşitleri',
      etiketler: ['Rulo Etiket', 'Tabaka Etiket', 'Barkod Etiketi', 'Termal Etiket', 'Şeffaf Etiket', 'Metalize Etiket', 'Opak Etiket', 'Saten Etiket', 'Dokuma Etiket', 'Hologram Etiket', 'Sıcak Yaldız Folyo', 'Soğuk Yaldız Folyo', 'Varak Baskı Folyosu', 'Plotter Folyosu', 'Cam Filmi', 'Mıknatıslı Folyo', 'PVC Folyo', 'PP (Polipropilen) Folyo', 'PE (Polietilen) Folyo', 'PET Folyo']
    },
    {
      kategori: 'Makine, Yedek Parça & Teknik',
      ikon: Wrench,
      ozet: 'Ofset & dijital baskı makineleri, yedek parça ve teknik servis',
      etiketler: ['Ofset Baskı Makinesi', 'Dijital Baskı Makinesi', 'Giyotin Kesim Bıçağı', 'Kırım Katlama Makinesi', 'Selefon Makinesi', 'Lak ve Emprime Makinesi', 'Ambalaj Paketleme Makinesi', 'Etiket Kesim Makinesi', 'Vakum Makinesi', 'Hava Kompresörü', 'Rezistans Grupları', 'Rulman Çeşitleri', 'Kayış Takımları', 'Baskı Kafası (Printhead)', 'Kartuş & Toner', 'Rakle Lastiği', 'Şase Parçaları', 'Pnömatik Sistemler', 'Hidrolik Üniteler', 'Teknik Servis Yedek Parçaları']
    }
  ];

  const urunGruplari = urunKategorileri.map(k => k.kategori);

  return (
    <div className="min-h-screen bg-white">      {/* Hero Bölümü */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Sol Taraf - İçerik */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="text-orange-500">Tedarikçimiz Olun</span>, Birlikte Büyüyelim
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Ürünlerinizi binlerce kurumsal müşteriye doğrudan ulaştırın. Pazarlama, lojistik ve tahsilat süreçlerini biz yönetelim, siz üretime odaklanın.
              </p>
              
              <button
                onClick={() => document.getElementById('basvuru-formu')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
              >
                Hemen Başvurun
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Sağ Taraf - Görsel */}
            <div className="relative">
              <Image
                src='https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1600&auto=format&fit=crop'
                alt="MatbaaGross Kurumsal İş Ortaklığı ve Lojistik Ağı"
                width={600}
                height={400}
                className="rounded-2xl shadow-xl object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Güç Veren İstatistikler */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">5000+ Kurumsal Müşteri</span>
            </div>
            <div className="hidden md:block text-gray-400">|</div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">81 İle Kargo</span>
            </div>
            <div className="hidden md:block text-gray-400">|</div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">Zamanında Ödeme Garantisi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tedarikçi Avantajları */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tedarikçi Avantajları
            </h2>
            <p className="text-xl text-gray-600">
              Türkiye'nin en büyük matbaa platformunun avantajları
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {avantajlar.map((avantaj, index) => {
              const Icon = avantaj.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {avantaj.title}
                  </h3>
                  <p className="text-gray-600">
                    {avantaj.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Aradığımız Kategoriler */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tedarik Edebileceğiniz Ürün Grupları
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              100'den fazla ürün kalemi — sektörün en geniş yelpazeli pazaryeri
            </p>
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
              <Package className="w-4 h-4" />
              <span>Kategoriye tıklayın → form otomatik dolsun, ürünleri görmek için 'İncele'ye basın</span>
            </div>
          </div>

          {/* SEO: Görünmez anahtar kelime bloğu — Google tarafından indekslenir */}
          <div className="sr-only" aria-hidden="true">
            <h3>Matbaa Tedarikçisi Ürün Grupları</h3>
            {urunKategorileri.map((k) => (
              <span key={k.kategori}>{k.etiketler.join(', ')} </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {urunKategorileri.map((kategori, index) => {
              const Icon = kategori.ikon;
              const isSelected = formData.urunGrubu === kategori.kategori;
              const isExpanded = expandedCard === index;

              return (
                <div
                  key={index}
                  onClick={() => handleCategoryClick(kategori.kategori)}
                  className={`border border-gray-100 bg-white rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md overflow-hidden ${
                    isSelected ? 'border-orange-300 shadow-lg' : ''
                  }`}
                >
                  {/* Kart Başlık Alanı */}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50 hover:bg-orange-50 transition-colors ${
                        isSelected ? 'bg-orange-50' : ''
                      }`}>
                        <Icon className={`w-6 h-6 text-slate-700 transition-colors ${
                          isSelected ? 'text-orange-500' : ''
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-slate-800 leading-tight">
                          {kategori.kategori}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {kategori.ozet}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      )}
                    </div>

                    {/* İlk 4 etiket her zaman görünür */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {kategori.etiketler.slice(0, 4).map((etiket, ei) => (
                        <span
                          key={ei}
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 ${
                            isSelected ? 'bg-orange-100 text-orange-700' : ''
                          }`}
                        >
                          {etiket}
                        </span>
                      ))}
                      {!isExpanded && (
                        <span className="text-[11px] text-gray-400 px-2 py-0.5">
                          +{kategori.etiketler.length - 4} daha
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Genişletilmiş Etiket Alanı */}
                  {isExpanded && (
                    <div className={`px-5 pb-4 border-t ${
                      isSelected ? 'border-orange-200' : 'border-gray-100'
                    }`}>
                      <div className="pt-3 flex flex-wrap gap-1.5">
                        {kategori.etiketler.slice(4).map((etiket, ei) => (
                          <span
                            key={ei}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 ${
                              isSelected ? 'bg-orange-100 text-orange-700' : ''
                            }`}
                          >
                            {etiket}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alt Aksiyon Çubuğu */}
                  <div className={`px-5 py-3 flex items-center justify-between border-t ${
                    isSelected ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100 bg-gray-50/50'
                  }`}>
                    {isSelected ? (
                      <span className="text-xs font-semibold text-orange-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Formda seçildi
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        Seçmek için tıklayın
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(e, index)}
                      className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                        isSelected
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isExpanded ? (
                        <><ChevronUp className="w-3 h-3" /> Gizle</>
                      ) : (
                        <><ChevronDown className="w-3 h-3" /> İncele ({kategori.etiketler.length})</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Başvuru Formu */}
      <div id="basvuru-formu" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tedarikçi Başvuru Formu
              </h2>
              <p className="text-xl text-gray-600">
                Formu doldurun, en kısa sürede sizinle iletişime geçelim
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Firma Adı
                  </label>
                  <input
                    type="text"
                    name="firmaAdi"
                    value={formData.firmaAdi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="Firma adınız"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yetkili Kişi
                  </label>
                  <input
                    type="text"
                    name="yetkiliKisi"
                    value={formData.yetkiliKisi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="Adınız soyadınız"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="telefon"
                      value={formData.telefon}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="Telefon numaranız"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="E-posta adresiniz"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ürün Grubu
                  </label>
                  <select
                    name="urunGrubu"
                    value={formData.urunGrubu}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    required
                  >
                    <option value="">Seçiniz...</option>
                    {urunGruplari.map((urun, index) => (
                      <option key={index} value={urun}>
                        {urun}
                      </option>
                    ))}
                  </select>
                </div>

                {submitMessage && (
                  <div className={`p-4 rounded-lg text-sm ${
                    submitMessage.includes('başarıyla') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {submitMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-lg px-6 py-4 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                </button>
                
                {!formData.urunGrubu && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <ArrowRight className="w-4 h-4 text-orange-500" />
                    <span>Yukarıdan ürün grubu seçerek başvurunuzu hızlandırabilirsiniz</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>    </div>
  );
}
