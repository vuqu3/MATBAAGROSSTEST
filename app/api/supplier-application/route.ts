import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, contactName, phone, email, productGroup } = body;

    if (!companyName || !contactName || !phone || !email || !productGroup) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur.' }, { status: 400 });
    }

    const application = await prisma.supplierApplication.create({
      data: {
        companyName: String(companyName).trim(),
        contactName: String(contactName).trim(),
        phone: String(phone).trim(),
        email: String(email).trim().toLowerCase(),
        productGroup: String(productGroup).trim(),
      },
    });

    return NextResponse.json({ 
      message: 'Başvurunuz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.',
      application 
    });
  } catch (error) {
    console.error('Supplier application POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
