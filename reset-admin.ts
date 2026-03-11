import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma';

async function main() {
  const email = 'admin@matbaagross.com';
  const passwordPlain = 'MatbaaAdmin2026!';

  const passwordHash = await bcrypt.hash(passwordPlain, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      role: 'ADMIN',
    },
    create: {
      email,
      password: passwordHash,
      role: 'ADMIN',
      name: 'Süper Admin',
      userType: 'INDIVIDUAL',
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      userType: true,
    },
  });

  console.log('[reset-admin] OK', user);
}

main()
  .catch((err) => {
    console.error('[reset-admin] FAILED', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
