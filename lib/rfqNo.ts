import { prisma } from '@/lib/prisma';

export function generateRfqNo(year = new Date().getFullYear()) {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RFQ-${year}-${rand}`;
}

export async function createPremiumQuoteRequestWithStandardNo(data: {
  userId: string | null;
  preferredVendorId?: string | null;
  productId: string | null;
  productName: string;
  referenceProductId?: string | null;
  technicalSpecs?: any;
  designFiles?: string[];
  sampleImages?: string[];
  quantity: number;
  description: string;
  technicalDetails: string | null;
  fileUrl: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}) {
  const attempts = 8;

  for (let i = 0; i < attempts; i++) {
    const requestNo = generateRfqNo();

    try {
      const created = await (prisma.premiumQuoteRequest as any).create({
        data: {
          requestNo,
          userId: data.userId,
          preferredVendorId: data.preferredVendorId ?? null,
          productId: data.productId,
          referenceProductId: data.referenceProductId ?? data.productId,
          technicalSpecs: data.technicalSpecs ?? null,
          designFiles: Array.isArray(data.designFiles) ? data.designFiles : [],
          sampleImages: Array.isArray(data.sampleImages) ? data.sampleImages : [],
          productName: data.productName,
          quantity: data.quantity,
          description: data.description,
          technicalDetails: data.technicalDetails,
          fileUrl: data.fileUrl,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
        },
        select: {
          id: true,
          requestNo: true,
          createdAt: true,
        },
      });

      return created as { id: string; requestNo: string; createdAt: Date };
    } catch (err: any) {
      const code = err?.code;
      const metaTarget = err?.meta?.target;
      const isRequestNoUnique = code === 'P2002' && (metaTarget === 'requestNo' || (Array.isArray(metaTarget) && metaTarget.includes('requestNo')));
      if (isRequestNoUnique) continue;
      throw err;
    }
  }

  throw new Error('RFQ numarası üretilemedi');
}
