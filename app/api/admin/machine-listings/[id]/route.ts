import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MachineListingStatus } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, featured, expiresAt } = body;

  try {
    const updateData: any = {};
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    if (featured !== undefined) {
      updateData.featured = featured;
    }
    
    if (expiresAt !== undefined) {
      updateData.expiresAt = new Date(expiresAt);
      // Eğer süre uzatılıyorsa ve ilan süresi dolmuşsa, status'u ACTIVE yap
      if (updateData.expiresAt > new Date()) {
        updateData.status = MachineListingStatus.ACTIVE;
      }
    }

    const listing = await prisma.machineListing.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Error updating machine listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.machineListing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting machine listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
