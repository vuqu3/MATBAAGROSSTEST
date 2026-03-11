import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as
      | { currentPassword?: unknown; newPassword?: unknown }
      | null;

    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mevcut şifre ve yeni şifre zorunludur.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user?.password) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Mevcut şifre hatalı.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/seller/change-password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
