import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type ImportRow = {
  GrupKodu?: string;
  UrunAdi?: string;
  SKU?: string;
  Fiyat?: string | number;
  Stok?: string | number;
  KategoriID?: string;
  Aciklama?: string;
  Resim1?: string;
  Resim2?: string;
  Resim3?: string;
  Resim4?: string;
  Resim5?: string;
  [k: string]: unknown;
};

type ParsedProduct = {
  name: string;
  sku: string;
  basePrice: number;
  stock: number;
  categoryId: string;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  sourceRowNo: number;
};

function extractImagesFromRow(row: ImportRow) {
  const candidates = [row.Resim1, row.Resim2, row.Resim3, row.Resim4, row.Resim5]
    .map((v) => String(v ?? '').trim())
    .filter(Boolean)
    .slice(0, 5);
  return {
    imageUrl: candidates[0] ?? null,
    images: candidates,
  };
}

function skuPrefixFromCategorySlug(slug: string | null | undefined) {
  const raw = String(slug ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/[^a-z0-9]/g, '');
  const prefix = raw.slice(0, 6).toUpperCase();
  return prefix || 'CAT';
}

function generateSku(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
}

function normalizeHeader(v: unknown) {
  const raw = String(v ?? '').trim().toLowerCase();
  // Remove accents/diacritics and normalize Turkish-specific letters
  const noDiacritics = raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i');
  return noDiacritics.replace(/\s+/g, '');
}

function toNumber(value: unknown) {
  const raw = String(value ?? '').trim();
  if (!raw) return NaN;
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

function parseCsv(text: string): ImportRow[] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;

  const pushField = () => {
    current.push(field);
    field = '';
  };

  const pushRow = () => {
    rows.push(current);
    current = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;

    if (inQuotes) {
      if (c === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      continue;
    }

    if (c === ',') {
      pushField();
      continue;
    }

    if (c === '\n') {
      pushField();
      pushRow();
      continue;
    }

    if (c === '\r') {
      continue;
    }

    field += c;
  }

  pushField();
  if (current.some((x) => x.trim() !== '')) pushRow();

  if (rows.length === 0) return [];

  const header = rows[0]!.map((h) => String(h ?? '').trim());
  const normHeader = header.map(normalizeHeader);

  const result: ImportRow[] = [];
  for (let r = 1; r < rows.length; r++) {
    const line = rows[r]!;
    const obj: ImportRow = {};
    for (let c = 0; c < normHeader.length; c++) {
      const key = header[c];
      if (!key) continue;
      obj[key] = line[c] ?? '';
    }
    result.push(obj);
  }

  // Support alternative headers by mapping normalized keys to canonical ones.
  const canonicalKeys = {
    grupkodu: 'GrupKodu',
    parentsku: 'GrupKodu',
    'grupkodu(parentsku)': 'GrupKodu',
    urunadi: 'UrunAdi',
    name: 'UrunAdi',
    sku: 'SKU',
    stokkodu: 'SKU',
    'stokkodu(sku)': 'SKU',
    fiyat: 'Fiyat',
    price: 'Fiyat',
    stok: 'Stok',
    stock: 'Stok',
    adet: 'Stok',
    miktar: 'Stok',
    kategoriid: 'KategoriID',
    categoryid: 'KategoriID',
    aciklama: 'Aciklama',
    description: 'Aciklama',
    resim1: 'Resim1',
    image1: 'Resim1',
    resim2: 'Resim2',
    image2: 'Resim2',
    resim3: 'Resim3',
    image3: 'Resim3',
    resim4: 'Resim4',
    image4: 'Resim4',
    resim5: 'Resim5',
    image5: 'Resim5',
  } as const;

  const canonicalizeRow = (row: ImportRow): ImportRow => {
    const mapped: ImportRow = {};
    for (const [k, v] of Object.entries(row)) {
      const nk = normalizeHeader(k);
      const canonical = (canonicalKeys as any)[nk] as keyof typeof canonicalKeys | undefined;
      if (canonical) (mapped as any)[canonical] = v;
    }
    return mapped;
  };

  return result.map(canonicalizeRow);
}

async function parseXlsx(buffer: ArrayBuffer): Promise<ImportRow[]> {
  const mod = await import('xlsx');
  const XLSX = mod.default ?? mod;
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheetName = wb.SheetNames?.[0];
  if (!sheetName) return [];
  const ws = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) as ImportRow[];
  return Array.isArray(json) ? json : [];
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const shouldCommit = searchParams.get('commit') === '1';

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'multipart/form-data bekleniyor (file upload).' },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file alanı zorunlu' }, { status: 400 });
    }

    const filename = String(file.name || '').toLowerCase();
    const isXlsx = filename.endsWith('.xlsx') || filename.endsWith('.xls');
    const isCsv = filename.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel';

    if (!isCsv && !isXlsx) {
      return NextResponse.json(
        { error: 'Desteklenen dosyalar: .csv, .xlsx' },
        { status: 400 }
      );
    }

    let rows: ImportRow[] = [];
    if (isXlsx) {
      const buffer = await file.arrayBuffer();
      rows = await parseXlsx(buffer);
    } else {
      const text = await file.text();
      rows = parseCsv(text);
    }

    // Canonicalize XLSX/CSV header keys so validations can rely on row.UrunAdi, row.SKU, ...
    rows = rows.map((row) => {
      const canonicalKeys = {
        grupkodu: 'GrupKodu',
        parentsku: 'GrupKodu',
        'grupkodu(parentsku)': 'GrupKodu',
        urunadi: 'UrunAdi',
        name: 'UrunAdi',
        sku: 'SKU',
        stokkodu: 'SKU',
        'stokkodu(sku)': 'SKU',
        fiyat: 'Fiyat',
        price: 'Fiyat',
        stok: 'Stok',
        stock: 'Stok',
        adet: 'Stok',
        miktar: 'Stok',
        kategoriid: 'KategoriID',
        categoryid: 'KategoriID',
        aciklama: 'Aciklama',
        description: 'Aciklama',
        resim1: 'Resim1',
        image1: 'Resim1',
        resim2: 'Resim2',
        image2: 'Resim2',
        resim3: 'Resim3',
        image3: 'Resim3',
        resim4: 'Resim4',
        image4: 'Resim4',
        resim5: 'Resim5',
        image5: 'Resim5',
      } as const;

      const mapped: ImportRow = {};
      for (const [k, v] of Object.entries(row ?? {})) {
        const nk = normalizeHeader(k);
        const canonical = (canonicalKeys as any)[nk] as keyof typeof canonicalKeys | undefined;
        if (canonical) (mapped as any)[canonical] = v;
      }
      return mapped;
    });

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'Dosyada veri bulunamadı veya parse edilemedi.' },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    const candidates: ParsedProduct[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] ?? {};
      const rowNo = i + 2;

      // Skip completely empty rows (e.g., blank Excel rows at the bottom)
      if (!row || Object.keys(row).every((k) => !String(row[k] ?? '').trim())) continue;

      const name = String(row.UrunAdi ?? '').trim();
      const sku = String(row.SKU ?? '').trim();
      const categoryId = String(row.KategoriID ?? '').trim();

      const price = toNumber(row.Fiyat);
      const stock = toNumber(row.Stok);

      if (!name) {
        // Ignore trailing empty rows; otherwise report missing name
        if (Object.keys(row).every((k) => !String(row[k] ?? '').trim())) continue;
        errors.push(`Row ${rowNo} failed: UrunAdi zorunludur`);
        continue;
      }
      if (!categoryId) {
        errors.push(`Row ${rowNo} failed: KategoriID zorunludur`);
        continue;
      }
      if (!Number.isFinite(price) || price < 0) {
        errors.push(`Row ${rowNo} failed: Fiyat geçersiz (${String(row.Fiyat ?? '')})`);
        continue;
      }
      if (!Number.isFinite(stock) || stock < 0) {
        errors.push(`Row ${rowNo} failed: Stok geçersiz (${String(row.Stok ?? '')})`);
        continue;
      }

      candidates.push({
        name,
        sku,
        basePrice: price,
        stock: Math.floor(stock),
        categoryId,
        description: String(row.Aciklama ?? '').trim() || null,
        ...extractImagesFromRow(row),
        sourceRowNo: rowNo,
      });
    }

    const categoryIds = Array.from(new Set(candidates.map((p) => p.categoryId)));
    const existingCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, slug: true },
    });
    const categoryById = new Map(existingCategories.map((c) => [c.id, c] as const));

    const validated: ParsedProduct[] = [];
    for (let i = 0; i < candidates.length; i++) {
      const p = candidates[i]!;
      const cat = categoryById.get(p.categoryId) ?? null;
      if (!cat) {
        errors.push(`Row ${p.sourceRowNo} failed: Category ID ${p.categoryId} does not exist`);
        continue;
      }

      // Auto-generate SKU if missing (category-based prefix)
      if (!p.sku) {
        const prefix = skuPrefixFromCategorySlug(cat.slug);
        p.sku = generateSku(prefix);
      }

      validated.push(p);
    }

    const productsToCreate = validated.map((p) => ({
      name: p.name,
      sku: p.sku,
      basePrice: p.basePrice,
      stock: p.stock,
      categoryId: p.categoryId,
      description: p.description,
      imageUrl: p.imageUrl,
      images: p.images.length > 0 ? p.images : undefined,
      isActive: true,
      isPublished: false,
      productType: 'READY' as const,
    }));

    let createdCount = 0;
    if (shouldCommit) {
      const resp = await prisma.product.createMany({ data: productsToCreate, skipDuplicates: true });
      createdCount = resp.count;
    }

    return NextResponse.json({
      success: errors.length === 0,
      committed: shouldCommit,
      createdCount,
      parsedRows: rows.length,
      validRows: productsToCreate.length,
      errors,
      preview: productsToCreate.slice(0, 25),
    });
  } catch (error) {
    console.error('Bulk Import Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
