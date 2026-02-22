import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['REVIEWED', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const application = await prisma.supplierApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: 'Başvuru bulunamadı' }, { status: 404 });
    }

    const updatedApplication = await prisma.supplierApplication.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error('PATCH supplier application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.supplierApplication.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Başvuru silindi' });
  } catch (error) {
    console.error('DELETE supplier application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
