import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Prisma bağlantısını test et
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

const isProduction = process.env.NODE_ENV === 'production';
const cookieDomain = isProduction ? '.matbaagross.com' : undefined;

const authOptions: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        domain: cookieDomain,
      },
    },
    callbackUrl: {
      name: isProduction ? '__Secure-authjs.callback-url' : 'authjs.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        domain: cookieDomain,
      },
    },
    csrfToken: {
      name: isProduction ? '__Host-authjs.csrf-token' : 'authjs.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const rawEmail = credentials?.email;
        const rawPassword = credentials?.password;

        if (typeof rawEmail !== 'string' || typeof rawPassword !== 'string') {
          console.error('[auth][credentials] missing email or password');
          return null;
        }

        const email = String(rawEmail).trim().toLowerCase();
        const password = String(rawPassword);

        try {
          // Veritabanı bağlantısını kontrol et
          const isConnected = await testDatabaseConnection();
          if (!isConnected) {
            console.error('[auth][credentials] database connection failed');
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.error('[auth][credentials] user not found', { email });
            return null;
          }

          if (!user.password || typeof user.password !== 'string') {
            console.error('[auth][credentials] user has no password hash', { email });
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            console.error('[auth][credentials] invalid password', { email });
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            userType: user.userType,
            companyName: user.companyName,
            phoneNumber: user.phoneNumber,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true;
      const email = user?.email;
      if (!email) return false;

      let dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) {
        const randomPassword = crypto.randomUUID();
        const hashed = await bcrypt.hash(randomPassword, 10);
        dbUser = await prisma.user.create({
          data: {
            email,
            password: hashed,
            name: user?.name ?? null,
          },
        });
      }

      // Link any anonymous PremiumQuoteRequests that match this email
      try {
        await (prisma.premiumQuoteRequest as any).updateMany({
          where: { contactEmail: email, userId: null },
          data: { userId: dbUser.id },
        });
      } catch (linkErr) {
        console.error('[auth][google] request link error:', linkErr);
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.role = u.role;
        token.id = u.id;
        token.userType = u.userType;
        token.companyName = u.companyName;
        token.phoneNumber = u.phoneNumber;
      }

      if (token?.email && (!token.id || !token.role)) {
        const dbUser = await prisma.user.findUnique({ where: { email: String(token.email) } });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.userType = dbUser.userType;
          token.companyName = dbUser.companyName;
          token.phoneNumber = dbUser.phoneNumber;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.userType = token.userType as string;
        session.user.companyName = token.companyName as string | null;
        session.user.phoneNumber = token.phoneNumber as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/giris',
  },
  session: {
    strategy: 'jwt',
  },
};

// NextAuth v5 beta için auth() fonksiyonunu export et
export const { handlers, auth } = NextAuth(authOptions);

// Geriye uyumluluk için authOptions'ı da export et
export { authOptions };
