import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

    // Get vendor with owner
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Satıcı bulunamadı' }, { status: 404 });
    }

    // Update vendor data
    const vendorData: any = {};
    if (typeof body.vendorName === 'string' && body.vendorName.trim()) {
      vendorData.name = body.vendorName.trim();
      vendorData.slug = body.vendorName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    if (typeof body.commissionRate === 'number') {
      if (body.commissionRate < 0 || body.commissionRate > 100) {
        return NextResponse.json({ error: 'Komisyon oranı 0-100 arasında olmalıdır.' }, { status: 400 });
      }
      vendorData.commissionRate = body.commissionRate;
    }

    if (typeof body.isBlocked === 'boolean') {
      vendorData.isBlocked = body.isBlocked;
    }

    // Update user data
    const userData: any = {};
    if (typeof body.userName === 'string') {
      userData.name = body.userName.trim() || null;
    }
    if (typeof body.userPhone === 'string') {
      userData.phoneNumber = body.userPhone.trim() || null;
    }
    if (typeof body.userTaxOffice === 'string') {
      userData.taxOffice = body.userTaxOffice.trim() || null;
    }
    if (typeof body.userTaxNumber === 'string') {
      userData.taxNumber = body.userTaxNumber.trim() || null;
    }
    if (typeof body.newPassword === 'string' && body.newPassword.trim()) {
      if (body.newPassword.length < 6) {
        return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
      }
      userData.password = await bcrypt.hash(body.newPassword, 12);
    }

    // Transaction update
    const result = await prisma.$transaction(async (tx) => {
      // Update vendor
      const updatedVendor = await tx.vendor.update({
        where: { id },
        data: vendorData,
        include: { owner: { select: { email: true, name: true } } },
      });

      // Update user if there are changes
      if (Object.keys(userData).length > 0 && vendor.owner) {
        await tx.user.update({
          where: { id: vendor.owner.id },
          data: userData,
        });
      }

      return updatedVendor;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('PATCH /api/admin/vendors/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
