import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const ticket = await prisma.supportTicket.findFirst({
      where: { id, userId: session.user.id },
      include: {
        order: { select: { id: true, barcode: true, totalAmount: true, createdAt: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!ticket) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
    }
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Support ticket GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
