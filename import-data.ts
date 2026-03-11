import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { prisma } from './lib/prisma';

type Dump = {
  meta?: {
    exportedAt?: string;
    prismaVersion?: string;
  };
  data: Record<string, unknown[]>;
};

function delegateName(modelName: string): string {
  return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}

type ImportResult = {
  model: string;
  count: number;
};

async function createMany(modelName: string, rows: unknown[]): Promise<ImportResult> {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { model: modelName, count: 0 };
  }

  const delegate = delegateName(modelName);
  const clientAny = prisma as any;

  if (!clientAny[delegate] || typeof clientAny[delegate]?.createMany !== 'function') {
    throw new Error(`Prisma delegate bulunamadı: ${modelName} (delegate: ${delegate})`);
  }

  // createMany nested relation kabul etmez; export çıktısı findMany() olduğu için sadece scalar alanlar olmalı.
  const res = await clientAny[delegate].createMany({
    data: rows as any[],
    skipDuplicates: true,
  });

  return { model: modelName, count: Number(res?.count ?? 0) };
}

async function main() {
  const backupPath = resolve(process.cwd(), 'yedek.json');
  const raw = await readFile(backupPath, 'utf8');
  const dump = JSON.parse(raw) as Dump;

  if (!dump?.data || typeof dump.data !== 'object') {
    throw new Error('yedek.json formatı beklenen yapıda değil (data alanı yok).');
  }

  // İlişkiler bozulmasın diye sıralı import.
  const order: string[] = [
    'User',
    'Vendor',
    'Address',
    'Category',
    'Product',
    'ProductVariant',
    'Review',
    'Order',
    'OrderItem',
    'SupportTicket',
    'TicketMessage',
    'SupplierApplication',
    'HeroWidget',
    'HomepageSection',
    'StoreSettings',
    'Banner',
    'FeaturedWidget',
    'Lead',
    'QuoteRequest',
    'Bid',
    'PremiumQuoteRequest',
    'PremiumQuoteOffer',
    'MachineListing',
  ];

  const presentModels = new Set(Object.keys(dump.data));
  const unknownModels = Object.keys(dump.data).filter((m) => !order.includes(m));

  // Bilinmeyen model varsa en sona ekleyelim (ilişki riski olabilir ama en azından kaybolmaz)
  const finalOrder = [...order.filter((m) => presentModels.has(m)), ...unknownModels];

  console.log(`[import] backup: ${backupPath}`);
  if (dump?.meta?.exportedAt) console.log(`[import] exportedAt: ${dump.meta.exportedAt}`);
  if (unknownModels.length) console.log(`[import] extra models (appended): ${unknownModels.join(', ')}`);

  const results: ImportResult[] = [];

  try {
    // FK bağımlılıkları için tek transaction yerine sıralı, model model ilerliyoruz.
    for (const modelName of finalOrder) {
      const rows = dump.data[modelName] ?? [];
      const r = await createMany(modelName, rows);
      results.push(r);
      console.log(`[import] ${r.model}: inserted=${r.count} (source=${Array.isArray(rows) ? rows.length : 0})`);
    }

    console.log('[done] Import completed.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
