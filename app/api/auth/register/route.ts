import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const addressSchema = z.object({
  type: z.enum(['BILLING', 'SHIPPING']),
  title: z.string().optional(),
  city: z.string().min(1, 'Şehir gereklidir'),
  district: z.string().optional(),
  line1: z.string().min(1, 'Adres satırı gereklidir'),
  line2: z.string().optional(),
  postalCode: z.string().optional(),
});

const registerIndividualSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  name: z.string().min(1, 'Ad Soyad gereklidir'),
  phoneNumber: z.string().optional(),
  userType: z.literal('INDIVIDUAL'),
  addresses: z.array(addressSchema).optional(),
});

const registerCorporateSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  name: z.string().min(1, 'Yetkili adı gereklidir'),
  phoneNumber: z.string().optional(),
  userType: z.literal('CORPORATE'),
  companyName: z.string().min(1, 'Şirket unvanı gereklidir'),
  taxOffice: z.string().min(1, 'Vergi dairesi gereklidir'),
  taxNumber: z.string().min(10, 'Vergi numarası 10 haneli olmalı').max(11, 'Vergi numarası 10 haneli olmalı'),
  addresses: z.array(addressSchema).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const isCorporate = body.userType === 'CORPORATE';
    const schema = isCorporate ? registerCorporateSchema : registerIndividualSchema;
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0];
      return NextResponse.json(
        { error: typeof firstError === 'string' ? firstError : 'Lütfen tüm zorunlu alanları doldurun' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kayıtlı' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        name: data.name.trim(),
        phoneNumber: data.phoneNumber?.trim() || null,
        userType: data.userType,
        companyName: 'companyName' in data && data.companyName ? data.companyName.trim() : null,
        taxOffice: 'taxOffice' in data && data.taxOffice ? data.taxOffice.trim() : null,
        taxNumber: 'taxNumber' in data && data.taxNumber ? data.taxNumber.trim() : null,
        role: 'USER',
      },
    });

    if (data.addresses && data.addresses.length > 0) {
      await prisma.address.createMany({
        data: data.addresses.map((a) => ({
          userId: user.id,
          type: a.type,
          title: a.title?.trim() || null,
          city: a.city.trim(),
          district: a.district?.trim() || null,
          line1: a.line1.trim(),
          line2: a.line2?.trim() || null,
          postalCode: a.postalCode?.trim() || null,
        })),
      });
    }

    // Hoş geldin e-postası taslağı (konsola yazdır)
    const welcomeEmailDraft = {
      to: user.email,
      subject: 'MatbaaGross\'a Hoş Geldiniz',
      html: `
        <h1>Hoş Geldiniz, ${user.name}!</h1>
        <p>MatbaaGross ailesine katıldığınız için teşekkür ederiz.</p>
        <p>Hesabınızla giriş yaparak sipariş verebilir, faturalarınızı yönetebilirsiniz.</p>
        <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/giris">Giriş Yap</a></p>
        <p>MatbaaGross - Türkiye'nin Online Matbaa Toptancısı</p>
      `,
    };
    console.log('[Hoş geldin e-postası taslağı]', JSON.stringify(welcomeEmailDraft, null, 2));

    return NextResponse.json(
      { message: 'Kayıt başarılı', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Kayıt sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
