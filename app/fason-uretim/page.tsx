'use client';

import { useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Printer,
  Scissors,
  Package,
  FileStack,
  Tag,
  Lock,
  Upload,
  Zap,
  Banknote,
  FileWarning,
  ShieldX,
  PackageCheck,
  CalendarClock,
  Factory,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FasonWelcomeModal from './FasonWelcomeModal';

const CATEGORIES = [
  {
    icon: Printer,
    title: 'Ofset & Dijital Baskı',
    desc: 'Kitaplar, broşürler, katalog ve tüm baskı işleriniz.',
  },
  {
    icon: Scissors,
    title: 'Kesim & Mücellit (Kırım, Selefon, Lak)',
    desc: 'Karton kesim, kırım, selefon ve lak işlemleri.',
  },
  {
    icon: Package,
    title: 'Ambalaj & Koli Üretimi',
    desc: 'Özel ebat koli, karton kutu ve ambalaj çözümleri.',
  },
  {
    icon: FileStack,
    title: 'Özel Hammadde İşleme (Kağıt Sizden, Baskı Bizden)',
    desc: 'Kendi malzemenizi gönderin, baskı ve işleme bizde.',
  },
  {
    icon: Tag,
    title: 'Tekstil & Kozmetik Ambalaj Çözümleri',
    desc: 'Etiket, buklet, kozmetik ve tekstil ambalajı.',
  },
];

const MALZEME_OPTIONS = [
  { value: 'ben_gonderecegim', label: 'Kağıdı Ben Göndereceğim' },
  { value: 'siz_tedarik', label: 'Siz Tedarik Edin' },
];

const CALISMA_PRENSIPLERI = [
  {
    icon: Banknote,
    title: 'Ödeme Politikası',
    text: 'Sipariş onayı ile birlikte %100 peşin ödeme kuralı geçerlidir. Ödemesi tamamlanmayan işler üretim bandına alınmaz.',
  },
  {
    icon: FileWarning,
    title: 'Grafik ve Baskı Sorumluluğu',
    text: 'Baskıya hazır (PDF/AI/CDR) gönderilen dosyalardaki imla, ölçü ve teknik hatalardan gönderici sorumludur. Fason merkezimiz grafik düzenleme yapmaz, sadece teknik üretimi gerçekleştirir.',
  },
  {
    icon: ShieldX,
    title: 'İade ve İptal',
    text: 'Özel üretim fason işlerde, onaylanan işin üretimine başlandıktan sonra iade veya değişim mümkün değildir. Teknik bir üretim hatası olması durumunda Matbaagross güvencesiyle inceleme yapılır.',
  },
  {
    icon: PackageCheck,
    title: 'Malzeme ve Hammadde',
    text: 'Müşteri tarafından gönderilen kağıt/malzemenin makine parkuruna uygunluğu ve fire oranları önceden teknik ekipçe onaylanmalıdır.',
  },
  {
    icon: CalendarClock,
    title: 'Lojistik ve Termin',
    text: 'Üretim süreleri, işin teknik detayına göre netleştirilir. Belirtilen termin süreleri, baskıya uygun dosyanın ve ödemenin ulaşmasıyla başlar.',
  },
];

export default function FasonUretimPage() {
  const { data: session, status } = useSession();
  const formRef = useRef<HTMLDivElement>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    isTanimi: '',
    malzemeDurumu: 'siz_tedarik',
    teknikDetaylar: '',
  });

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setUploadedFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      source: 'fason',
      userId: session?.user?.email,
      file: uploadedFile ? { name: uploadedFile.name, size: uploadedFile.size } : null,
    };
    console.log('Fason teklif formu:', payload);
    alert('Fason üretim talebiniz alındı. Üretim Taleplerim panelinizden takip edebilirsiniz.');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <FasonWelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />
      <Header />

      {/* Hero — Endüstriyel matbaa gücü */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">
        {/* Arka plan: endüstriyel matbaa / ağır üretim (kendi görselinizi public veya CDN ile değiştirebilirsiniz) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&q=80)`,
          }}
        />
        <div className="absolute inset-0 bg-black/70" aria-hidden="true" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tight mb-5 leading-tight">
            Endüstriyel Baskı Gücü: İşiniz İçin Dev Makine Parkuru
          </h1>
          <p className="text-base sm:text-lg text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Türkiye&apos;nin en kapsamlı fason üretim ağı. Çok renkli ofset baskıdan mücellite, bobin kesimden özel ambalaj hatlarına kadar; 7/24 çalışan sanayi tipi üretim kapasitemiz emrinizde.
          </p>
          <button
            type="button"
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <Zap className="h-5 w-5" />
            Fason Teklifi Al
          </button>
        </div>
      </section>

      {/* Hizmet kategorileri */}
      <section className="py-16 px-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">
            Hizmet Kategorileri
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {CATEGORIES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-slate-800 text-white mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fason teklif formu */}
      <section ref={formRef} className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Fason Üretim Teklifi</h2>
          <p className="text-slate-600 text-sm mb-8">
            Teknik detaylarınızı girin; size özel fason teklifini hazırlayalım.
          </p>

          {!isAuthenticated ? (
            <div className="relative rounded-xl border border-slate-200 bg-white/80 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-slate-100/60 backdrop-blur-[2px]" aria-hidden="true" />
              <div className="relative p-8 sm:p-10 text-center">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-slate-200 text-slate-600">
                  <Lock className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Giriş Gerekli
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto mb-6">
                  Fason üretim teklifi almak ve taleplerinizi panelinizden takip etmek için giriş yapın.
                </p>
                <Link
                  href="/giris"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Giriş Yap veya Kayıt Ol
                </Link>
                <p className="text-xs text-slate-500 mt-4">
                  Hesabınız yoksa <Link href="/kayit-ol" className="text-slate-700 font-medium hover:underline">kayıt olun</Link>.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">İşin Tanımı</label>
                <textarea
                  required
                  value={form.isTanimi}
                  onChange={(e) => setForm((f) => ({ ...f, isTanimi: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500 text-slate-900 placeholder:text-slate-400"
                  placeholder='Örn: 5000 adet 350gr Bristol Karton Kesim'
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Malzeme Durumu</label>
                <select
                  value={form.malzemeDurumu}
                  onChange={(e) => setForm((f) => ({ ...f, malzemeDurumu: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500 text-slate-900 bg-white"
                >
                  {MALZEME_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Teknik Detaylar</label>
                <textarea
                  value={form.teknikDetaylar}
                  onChange={(e) => setForm((f) => ({ ...f, teknikDetaylar: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500 text-slate-900 placeholder:text-slate-400"
                  placeholder="Gramaj, ebat, renk sayısı, ekstra işlemler (selefon, lak vb.)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Dosya Yükleme (Bıçak izi / Grafik)</label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive ? 'border-slate-400 bg-slate-100' : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf,.ai,.eps,.psd,.cdr,.dxf"
                    onChange={handleFileInput}
                    className="hidden"
                    id="fason-file-upload"
                  />
                  <label htmlFor="fason-file-upload" className="cursor-pointer block">
                    <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                    {uploadedFile ? (
                      <p className="text-sm font-medium text-slate-700">{uploadedFile.name}</p>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Dosyayı sürükleyin veya <span className="text-slate-700 font-medium">tıklayarak seçin</span>
                      </p>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-lg font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2"
              >
                Fason Üretim Teklifi Al
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Fason Üretim Merkezi — Çalışma Prensipleri */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-10">
            Fason Üretim Standartları ve Üretici Koruma Politikası
          </h2>
          <ul className="space-y-6">
            {CALISMA_PRENSIPLERI.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 text-slate-700">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Üreticiye özel CTA */}
      <section className="py-8 px-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/80 px-6 py-4">
          <p className="text-sm text-slate-700 text-center sm:text-left">
            Makine parkurunu sisteme dahil etmek isteyen üreticilerimiz için
          </p>
          <Link
            href="/tedarikci-ol"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-slate-800 hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <Factory className="w-4 h-4" />
            Tedarikçimiz Ol
          </Link>
        </div>
      </section>

      <Footer hideRetailBadges />
    </div>
  );
}
