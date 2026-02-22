import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tedarikçimiz Olun | MatbaaGross — Matbaa & Ambalaj Pazaryeri',
  description:
    'MatbaaGross tedarikçi ağına katılın. Kağıt, karton, ambalaj malzemeleri, matbaa boyaları, ofset mürekkepleri, UV lak, etiket, folyo, baskı makineleri ve yedek parça tedarikçileri için başvuru formu.',
  keywords: [
    'matbaa tedarikçisi',
    'kağıt tedarikçisi',
    'karton tedarikçisi',
    'ambalaj malzemeleri tedarikçisi',
    'ofset baskı boyası',
    'UV mürekkep',
    'matbaa kimyasalları',
    'hamur kağıt',
    'kuşe kağıt',
    'bristol karton',
    'krome karton',
    'kraft kağıdı',
    'oluklu mukavva',
    'laminasyon filmi',
    'termal kağıt',
    'karton koli',
    'pizza kutusu',
    'karton çanta',
    'streç film',
    'balonlu naylon',
    'shrink film',
    'kağıt bardak',
    'flexo baskı boyası',
    'serigrafi boyası',
    'UV lak',
    'matbaa verniği',
    'kauçuk baskı battaniyesi',
    'rulo etiket',
    'barkod etiketi',
    'termal etiket',
    'hologram etiket',
    'sıcak yaldız folyo',
    'PVC folyo',
    'PET folyo',
    'ofset baskı makinesi',
    'dijital baskı makinesi',
    'giyotin kesim bıçağı',
    'baskı kafası printhead',
    'rakle lastiği',
    'matbaa yedek parça',
    'matbaagross tedarikçi başvuru',
  ].join(', '),
  openGraph: {
    title: 'MatbaaGross Tedarikçi Başvurusu — Sektörün En Geniş Pazaryeri',
    description:
      'Kağıt & Karton, Ambalaj, Matbaa Boyaları, Etiket & Folyo, Makine & Yedek Parça kategorilerinde 100+ ürün kalemiyle MatbaaGross tedarikçi ağına katılın.',
    type: 'website',
    locale: 'tr_TR',
  },
};

export default function TedarikciOlLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
