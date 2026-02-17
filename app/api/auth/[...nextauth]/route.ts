import { handlers } from '@/lib/auth';

// NextAuth v5 beta route handler
// handlers zaten lib/auth.ts'den export ediliyor
export const { GET, POST } = handlers;

// Dynamic route için
export const dynamic = 'force-dynamic';