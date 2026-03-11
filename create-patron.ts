import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma';

async function main() {
  const email = 'patron@matbaagross.com';
  const passwordPlain = 'MatbaaYonetim2026!';

  const passwordHash = await bcrypt.hash(passwordPlain, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      role: 'ADMIN',
      name: 'Kurucu Patron',
    },
    create: {
      email,
      password: passwordHash,
      role: 'ADMIN',
      name: 'Kurucu Patron',
      userType: 'INDIVIDUAL',
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
    },
  });

  console.log('[create-patron] OK', user);
}

main()
  .catch((err) => {
    console.error('[create-patron] FAILED', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
