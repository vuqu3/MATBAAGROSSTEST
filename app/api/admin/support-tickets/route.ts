import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, name: true } },
        order: { select: { id: true, barcode: true, totalAmount: true, createdAt: true } },
        messages: { orderBy: { createdAt: 'asc' }, take: 1 },
      },
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Admin support-tickets GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
