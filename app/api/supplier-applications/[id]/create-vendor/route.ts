import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SupplierApplicationStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { sendEmail } = body as { sendEmail?: boolean };

    // Başvuruyu getir
    const application = await prisma.supplierApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: 'Başvuru bulunamadı' }, { status: 404 });
    }

    if (![SupplierApplicationStatus.PENDING, SupplierApplicationStatus.REVIEWED, SupplierApplicationStatus.APPROVED].includes(application.status)) {
      return NextResponse.json({ error: 'Başvuru durumu uygun değil' }, { status: 400 });
    }

    // Email'in zaten kullanılıp kullanılmadığını kontrol et
    const existingUser = await prisma.user.findUnique({ where: { email: application.email } });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Satıcı kullanıcı hesabı bulunamadı. Üretici önce kayıt olmalı.' },
        { status: 400 }
      );
    }

    // User + Vendor kayıtlarını oluştur (transaction içinde)
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const trialEndsAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

      const user = await tx.user.update({
        where: { id: existingUser.id },
        data: {
          role: 'SELLER',
          userType: 'CORPORATE',
          companyName: application.companyName,
          phoneNumber: application.phone,
          taxNumber: application.taxNumber,
          applicationStatus: 'APPROVED',
        },
      });

      const existingVendor = await tx.vendor.findUnique({ where: { ownerId: user.id } });
      const vendor = existingVendor
        ? await tx.vendor.update({
            where: { id: existingVendor.id },
            data: {
              commissionRate: 0,
              subscriptionStatus: 'TRIAL',
              subscriptionEndsAt: trialEndsAt,
            } as any,
          })
        : await tx.vendor.create({
            data: {
              name: application.companyName,
              slug: application.companyName
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim(),
              ownerId: user.id,
              commissionRate: 0,
              subscriptionStatus: 'TRIAL',
              subscriptionEndsAt: trialEndsAt,
            },
          });

      await tx.supplierApplication.update({
        where: { id },
        data: { status: SupplierApplicationStatus.APPROVED },
      });

      return { user, vendor };
    });

    // E-posta gönderme (opsiyonel)
    if (sendEmail) {
      try {
        // TODO: Implement email sending functionality
        // await sendSupplierWelcomeEmail(application.email, application.companyName);
        console.log('E-posta gönderilecek:', {
          to: application.email,
          company: application.companyName,
        });
      } catch (emailError) {
        console.error('E-posta gönderme hatası:', emailError);
        // E-posta gönderilemese de işlem devam etsin
      }
    }

    return NextResponse.json({
      message: 'Satıcı hesabı başarıyla oluşturuldu',
      vendor: result.vendor,
    });

  } catch (error) {
    console.error('Create vendor error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
