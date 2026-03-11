import { Prisma } from '@prisma/client';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { prisma } from './lib/prisma';

type Dump = {
  meta: {
    exportedAt: string;
    prismaVersion?: string;
  };
  data: Record<string, unknown[]>;
};

function getModelNamesFromDmmf(): string[] {
  const prismaAny = Prisma as any;

  const modelsFromDmmf = prismaAny?.dmmf?.datamodel?.models;
  if (Array.isArray(modelsFromDmmf)) {
    return modelsFromDmmf
      .map((m: any) => m?.name)
      .filter((n: any) => typeof n === 'string' && n.length > 0);
  }

  return [];
}

function delegateName(modelName: string): string {
  return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}

function jsonReplacer(_key: string, value: unknown) {
  if (typeof value === 'bigint') return value.toString();

  if (value && typeof value === 'object') {
    const anyVal = value as any;

    // Prisma.Decimal
    if (anyVal?.constructor?.name === 'Decimal' && typeof anyVal?.toString === 'function') {
      return anyVal.toString();
    }

    // Buffer (Node)
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(anyVal)) {
      return anyVal.toString('base64');
    }

    // Uint8Array
    if (anyVal instanceof Uint8Array) {
      return Buffer.from(anyVal).toString('base64');
    }
  }

  return value;
}

async function main() {
  try {
    const modelNames = getModelNamesFromDmmf();
    if (modelNames.length === 0) {
      throw new Error('Prisma DMMF üzerinden model listesi okunamadı.');
    }

    const data: Record<string, unknown[]> = {};

    for (const modelName of modelNames) {
      const delegate = delegateName(modelName);
      const clientAny = prisma as any;

      if (!clientAny[delegate] || typeof clientAny[delegate]?.findMany !== 'function') {
        continue;
      }

      const rows = (await clientAny[delegate].findMany()) as unknown[];
      data[modelName] = rows;

      console.log(`[export] ${modelName}: ${Array.isArray(rows) ? rows.length : 0}`);
    }

    const dump: Dump = {
      meta: {
        exportedAt: new Date().toISOString(),
        prismaVersion: (Prisma as any)?.prismaVersion?.client,
      },
      data,
    };

    const outPath = resolve(process.cwd(), 'yedek.json');
    await writeFile(outPath, JSON.stringify(dump, jsonReplacer, 2), 'utf8');
    console.log(`[done] Backup written: ${outPath}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
