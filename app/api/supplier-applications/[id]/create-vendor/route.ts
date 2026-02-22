import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
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
    const body = await request.json();
    const { password, sendEmail } = body;

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
    }

    // Başvuruyu getir
    const application = await prisma.supplierApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: 'Başvuru bulunamadı' }, { status: 404 });
    }

    if (application.status !== SupplierApplicationStatus.PENDING) {
      return NextResponse.json({ error: 'Bu başvuru zaten işleme alınmış' }, { status: 400 });
    }

    // Email'in zaten kullanılıp kullanılmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email: application.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanılıyor' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // User ve Vendor kayıtlarını oluştur (transaction içinde)
    const result = await prisma.$transaction(async (tx) => {
      // User oluştur
      const user = await tx.user.create({
        data: {
          email: application.email,
          password: hashedPassword,
          name: application.contactName,
          role: 'SELLER',
          userType: 'CORPORATE',
          companyName: application.companyName,
          phoneNumber: application.phone,
        },
      });

      // Vendor oluştur
      const vendor = await tx.vendor.create({
        data: {
          name: application.companyName,
          slug: application.companyName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim(),
          ownerId: user.id,
        },
      });

      // Başvuru durumunu güncelle
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
        // await sendSupplierWelcomeEmail(application.email, password, application.companyName);
        console.log('E-posta gönderilecek:', {
          to: application.email,
          company: application.companyName,
          password,
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
