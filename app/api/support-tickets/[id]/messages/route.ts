import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** Müşteri yeni mesaj ekler; talebi tekrar OPEN yapar. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id: ticketId } = await params;
    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) {
      return NextResponse.json({ error: 'Mesaj gerekli' }, { status: 400 });
    }
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId, userId: session.user.id },
    });
    if (!ticket) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
    }
    await prisma.$transaction([
      prisma.ticketMessage.create({
        data: { ticketId, message, isStaffReply: false },
      }),
      prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'OPEN' },
      }),
    ]);
    const updated = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Support ticket message POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
