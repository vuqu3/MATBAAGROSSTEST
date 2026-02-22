import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, name, company } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi gereklidir' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingLead = await prisma.lead.findUnique({
      where: { email }
    });

    if (existingLead) {
      // Add Prime_Waitlist tag if not exists
      const currentTags = existingLead.tags.split(',').filter(t => t.trim());
      if (!currentTags.includes('Prime_Waitlist')) {
        const newTags = [...currentTags, 'Prime_Waitlist'].join(',');
        await prisma.lead.update({
          where: { email },
          data: {
            tags: newTags,
            name: name || existingLead.name,
            company: company || existingLead.company,
          }
        });
      }
      return NextResponse.json(
        { message: 'E-posta adresiniz zaten kayıtlı. Prime bekleme listesine eklendi.' },
        { status: 200 }
      );
    }

    // Create new lead
    const lead = await prisma.lead.create({
      data: {
        email,
        name: name || null,
        company: company || null,
        source: 'website',
        tags: 'Prime_Waitlist',
        notes: 'Machine Prime teaser sayfasından kayıt oldu',
      }
    });

    return NextResponse.json(
      { 
        message: 'Başarıyla kayıt oldunuz. Machine Prime lansmanında sizi bilgilendireceğiz.',
        lead: {
          id: lead.id,
          email: lead.email,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Prime waitlist error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Prime waitlist endpoint active' },
    { status: 200 }
  );
}
