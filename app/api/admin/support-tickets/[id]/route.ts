import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true, phoneNumber: true } },
        order: { select: { id: true, barcode: true, totalAmount: true, createdAt: true, status: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!ticket) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
    }
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Admin support-ticket GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const { status } = body as { status?: string };

    const data: { status?: string } = {};
    const validStatuses = ['OPEN', 'ANSWERED', 'IN_PROGRESS', 'CLOSED', 'RESOLVED'];
    if (status != null && validStatuses.includes(status)) {
      data.status = status;
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, email: true, name: true } },
        order: { select: { id: true, barcode: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Admin support-ticket PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
