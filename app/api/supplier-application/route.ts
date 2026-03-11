import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName,
      contactName,
      phone,
      email,
      password,
      productGroup,
      companyType,
      taxNumber,
      city,
      district,
      isKvkkAccepted,
    } = body;

    if (!companyName || !phone || !email) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur.' }, { status: 400 });
    }

    if (isKvkkAccepted !== true) {
      return NextResponse.json({ error: 'Aydınlatma metni onayı zorunludur.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır.' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanılıyor.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const application = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: String(contactName ?? companyName).trim(),
          role: 'SELLER',
          userType: 'CORPORATE',
          companyName: String(companyName).trim(),
          phoneNumber: String(phone).trim(),
          taxNumber: taxNumber ? String(taxNumber).trim() : null,
          applicationStatus: 'PENDING_DOCS',
        },
      });

      const createdApplication = await tx.supplierApplication.create({
        data: {
          companyName: String(companyName).trim(),
          contactName: String(contactName ?? companyName).trim(),
          phone: String(phone).trim(),
          email: normalizedEmail,
          productGroup: String(productGroup ?? 'Premium Üretici').trim(),
          companyType: companyType ? String(companyType).trim() : null,
          taxNumber: taxNumber ? String(taxNumber).trim() : null,
          city: city ? String(city).trim() : null,
          district: district ? String(district).trim() : null,
          isKvkkAccepted: true,
        },
      });

      return { createdApplication, createdUser };
    });

    return NextResponse.json({
      message:
        'Başvurunuz başarıyla alındı. Evraklarınızı yükleyerek onaya gönderebilirsiniz. En kısa sürede sizinle iletişime geçeceğiz.',
      application: application.createdApplication,
      userId: application.createdUser.id,
    });
  } catch (error) {
    console.error('Supplier application POST error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Common case after schema changes: columns not pushed to DB yet.
      if (error.code === 'P2022' || error.code === 'P2021') {
        return NextResponse.json(
          {
            error:
              'Veritabanı şeması güncel değil. Lütfen sunucuda `npx prisma db push` çalıştırıp dev serverı yeniden başlatın.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ error: `Prisma error: ${error.code}` }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
