import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** Admin yeni mesaj ekler. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id: ticketId } = await params;
    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) {
      return NextResponse.json({ error: 'Mesaj gerekli' }, { status: 400 });
    }
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
    }
    await prisma.ticketMessage.create({
      data: { ticketId, message, isStaffReply: true },
    });
    const updated = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, email: true, name: true } },
        order: { select: { id: true, barcode: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin support-ticket message POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
