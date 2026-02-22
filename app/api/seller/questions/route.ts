import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  // SupportTicket tablosundan satıcıya ait soruları getir
  const questions = await prisma.supportTicket.findMany({
    where: {
      vendorId: vendor.id,
      // Henüz cevaplanmamış sorular (staffReply false olanlar)
      isStaffReply: false,
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      message: true,
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
      text: q.message,
      date: timeAgo,
      customerName: q.user.name || q.user.email,
    };
  });

  return NextResponse.json({ questions: formattedQuestions });
}
