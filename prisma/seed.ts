import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const url = process.env.DATABASE_URL || 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

// Slug oluşturma fonksiyonu
function createSlug(text: string): string {
  const turkishChars: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
  };

  let slug = text
    .toLowerCase()
    .replace(/&/g, 've') // & işaretini "ve" olarak değiştir
    .split('')
    .map(char => turkishChars[char] || char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '') // Özel karakterleri temizle
    .trim()
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/-+/g, '-'); // Birden fazla tireyi tek tire yap

  return slug;
}

async function main() {
  // İlk Admin Kullanıcısı Oluştur
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@matbaagross.com' },
    update: {},
    create: {
      email: 'admin@matbaagross.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('Admin kullanıcısı oluşturuldu:', adminUser);

  // İlk satıcı: Kral Ambalaj (%2 komisyon)
  const sellerPassword = await bcrypt.hash('seller123', 10);
  const kralUser = await prisma.user.upsert({
    where: { email: 'kral@matbaagross.com' },
    update: {},
    create: {
      email: 'kral@matbaagross.com',
      password: sellerPassword,
      name: 'Kral Ambalaj',
      role: 'SELLER',
    },
  });

  const kralVendor = await prisma.vendor.upsert({
    where: { slug: 'kral-ambalaj' },
    update: { commissionRate: 2.0 },
    create: {
      name: 'Kral Ambalaj',
      slug: 'kral-ambalaj',
      commissionRate: 2.0,
      balance: 0,
      ownerId: kralUser.id,
    },
  });
  console.log('Satıcı oluşturuldu: Kral Ambalaj (2% komisyon)', kralVendor);

  // Tüm Kategoriler (12 kategori)
  const categoriesData = [
    {
      name: 'Kutu & Ambalaj',
      description: 'Baklava, pizza, hamburger ve özel ambalaj kutuları',
      attributes: {
        fields: [
          { name: 'en', type: 'number', label: 'En (cm)', required: true },
          { name: 'boy', type: 'number', label: 'Boy (cm)', required: true },
          { name: 'yukseklik', type: 'number', label: 'Yükseklik (cm)', required: false },
        ],
      },
    },
    {
      name: 'Broşür & El İlanı',
      description: 'A4, A5 broşür ve el ilanı baskıları',
      attributes: {
        fields: [
          { name: 'kagit_gramaji', type: 'select', label: 'Kağıt Gramajı', options: ['80gr', '100gr', '170gr', '250gr', '350gr'], required: true },
          { name: 'selefon', type: 'select', label: 'Selefon', options: ['Yok', 'Mat', 'Parlak'], required: false },
          { name: 'kirim_tipi', type: 'select', label: 'Kırım Tipi', options: ['A4', 'A5', 'Kırımlı'], required: false },
        ],
      },
    },
    {
      name: 'Etiket & Sticker',
      description: 'Rulo, tabaka ve özel etiket çözümleri',
      attributes: {
        fields: [
          { name: 'etiket_tipi', type: 'select', label: 'Etiket Tipi', options: ['Rulo', 'Tabaka', 'Şeffaf'], required: true },
          { name: 'yapistirma_tipi', type: 'select', label: 'Yapıştırma Tipi', options: ['Kalıcı', 'Geçici'], required: true },
        ],
      },
    },
    {
      name: 'Kartvizit',
      description: 'Standart ve özel kesimli kartvizitler',
      attributes: {
        fields: [
          { name: 'kagit_tipi', type: 'select', label: 'Kağıt Tipi', options: ['350gr Kuşe', 'Fantazi', 'Bristol'], required: true },
          { name: 'selefon', type: 'select', label: 'Selefon', options: ['Yok', 'Mat', 'Parlak'], required: false },
        ],
      },
    },
    {
      name: 'Katalog & Dergi',
      description: 'Tel dikişli, iplik dikişli katalog ve dergi basımı',
      attributes: {
        fields: [
          { name: 'sayfa_sayisi', type: 'number', label: 'Sayfa Sayısı', required: true },
          { name: 'dikis_tipi', type: 'select', label: 'Dikiş Tipi', options: ['Tel Dikiş', 'İplik Dikiş', 'Spiral'], required: true },
        ],
      },
    },
    {
      name: 'Karton Çanta',
      description: 'İpli, kraft ve lüks karton çantalar',
      attributes: {
        fields: [
          { name: 'en', type: 'number', label: 'En (cm)', required: true },
          { name: 'boy', type: 'number', label: 'Boy (cm)', required: true },
          { name: 'yukseklik', type: 'number', label: 'Yükseklik (cm)', required: false },
          { name: 'ip_rengi', type: 'text', label: 'İp Rengi', required: false },
        ],
      },
    },
    {
      name: 'Kurumsal Ürünler',
      description: 'Antetli kağıt, zarf ve kurumsal evrak çözümleri',
      attributes: {
        fields: [
          { name: 'evrak_tipi', type: 'select', label: 'Evrak Tipi', options: ['Antetli Kağıt', 'Zarf', 'Makbuz', 'Dosya'], required: true },
        ],
      },
    },
    {
      name: 'Promosyon Ürünleri',
      description: 'Promosyon ürünleri ve hediyelik eşyalar',
      attributes: {
        fields: [
          { name: 'urun_tipi', type: 'select', label: 'Ürün Tipi', options: ['Kalem', 'Defter', 'Çanta', 'Saat', 'Powerbank', 'USB'], required: true },
        ],
      },
    },
    {
      name: 'Davetiye',
      description: 'Düğün, sünnet ve özel davetiyeler',
      attributes: {
        fields: [
          { name: 'davetiye_tipi', type: 'select', label: 'Davetiye Tipi', options: ['Düğün', 'Sünnet', 'Nişan', 'Özel'], required: true },
          { name: 'kagit_tipi', type: 'select', label: 'Kağıt Tipi', options: ['Kuşe', 'Fantazi', 'Özel'], required: false },
        ],
      },
    },
    {
      name: 'Kağıt Çeşitleri',
      description: '1. Hamur, kuşe, bristol ve özel kağıtlar',
      attributes: {
        fields: [
          { name: 'kagit_tipi', type: 'select', label: 'Kağıt Tipi', options: ['1. Hamur', 'Kuşe', 'Bristol', 'Fantazi'], required: true },
          { name: 'gramaj', type: 'text', label: 'Gramaj', required: false },
        ],
      },
    },
    {
      name: 'Matbaa Malzemeleri',
      description: 'Ofset mürekkep, kalıp, hazne suyu ve matbaa malzemeleri',
      attributes: {
        fields: [
          { name: 'malzeme_tipi', type: 'select', label: 'Malzeme Tipi', options: ['Mürekkep', 'Kalıp', 'Hazne Suyu', 'Cilt Bezi', 'Tutkal'], required: true },
        ],
      },
    },
    {
      name: 'Fason Üretim',
      description: 'Fason baskı ve üretim hizmetleri',
      attributes: {
        fields: [
          { name: 'hizmet_tipi', type: 'select', label: 'Hizmet Tipi', options: ['70x100 Baskı', 'Selefon', 'Lak', 'Varak Yaldız', 'Gofre', 'Kesim'], required: true },
        ],
      },
    },
  ];

  // Kategorileri slug ile birlikte oluştur
  for (const categoryData of categoriesData) {
    const slug = createSlug(categoryData.name);
    const category = {
      ...categoryData,
      slug,
    };

    await prisma.category.upsert({
      where: { slug },
      update: {
        name: category.name,
        description: category.description,
        attributes: category.attributes,
      },
      create: category,
    });
  }

  console.log('Kategoriler oluşturuldu');

  // Hero vitrin widget'ları (yoksa 12 adet varsayılan oluştur)
  const widgetCount = await prisma.heroWidget.count();
  if (widgetCount === 0) {
    const defaultWidgets = [
      { title: 'Ramazan', subtitle: 'İmsakiye & Kutu', targetUrl: '/kampanyalar', order: 1 },
      { title: 'Acil', subtitle: 'Baskıya Başla', targetUrl: '/kategori', order: 2 },
      { title: 'Tasarım', subtitle: 'Profesyonel Destek', targetUrl: '/kurumsal', order: 3 },
      { title: 'Kargo', subtitle: 'Bedava Gönderim', targetUrl: '/', order: 4 },
      { title: 'Yeni', subtitle: 'Keşfet', targetUrl: '/kategori', order: 5 },
      { title: 'Kurumsal', subtitle: 'Acil Baskı', targetUrl: '/kurumsal', order: 6 },
      { title: 'Toptan', subtitle: 'Büyük Parti', targetUrl: '/kategori', order: 7 },
      { title: 'Fason', subtitle: 'Kesim & Üretim', targetUrl: '/fason-hizmetler', order: 8 },
      { title: 'Promosyon', subtitle: 'Logo Baskılı', targetUrl: '/kampanyalar', order: 9 },
      { title: 'Ambalaj', subtitle: '%30 İndirim', targetUrl: '/ambalaj', order: 10 },
      { title: 'Kampanya 11', subtitle: 'Boş Widget', targetUrl: '/kampanyalar', order: 11 },
      { title: 'Kampanya 12', subtitle: 'Boş Widget', targetUrl: '/kampanyalar', order: 12 },
    ];
    for (const w of defaultWidgets) {
      await prisma.heroWidget.create({
        data: { ...w, imageUrl: null },
      });
    }
    console.log('12 adet HeroWidget varsayılan kayıt oluşturuldu.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
