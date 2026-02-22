import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveVendorForSession } from '@/lib/getMatbaaGrossVendor';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await resolveVendorForSession(session.user.id, session.user.role);
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  // Satıcının ürünlerini içeren siparişlere ait destek taleplerini getir
  const vendorOrderIds = await prisma.orderItem.findMany({
    where: { vendorId: vendor.id },
    select: { orderId: true },
    distinct: ['orderId'],
  });
  const orderIds = vendorOrderIds.map((o) => o.orderId);

  const questions = await prisma.supportTicket.findMany({
    where: {
      orderId: { in: orderIds },
      status: { in: ['OPEN', 'IN_PROGRESS'] },
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      subject: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const formattedQuestions = questions.map(q => {
    const now = new Date();
    const created = new Date(q.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    let timeAgo: string;
    if (diffDays > 0) {
      timeAgo = `${diffDays} gün önce`;
    } else if (diffHours > 0) {
      timeAgo = `${diffHours} saat önce`;
    } else {
      timeAgo = 'Az önce';
    }

    return {
      id: q.id,
      text: q.subject,
      date: timeAgo,
      customerName: q.user.name || q.user.email,
    };
  });

  return NextResponse.json({ questions: formattedQuestions });
}
