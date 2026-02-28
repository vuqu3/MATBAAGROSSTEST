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

const authOptions: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  // Trust host için (development'ta gerekli olabilir)
  trustHost: true,
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
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Veritabanı bağlantısını kontrol et
          const isConnected = await testDatabaseConnection();
          if (!isConnected) {
            console.error('Database connection failed');
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
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

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return true;

      const randomPassword = crypto.randomUUID();
      const hashed = await bcrypt.hash(randomPassword, 10);

      await prisma.user.create({
        data: {
          email,
          password: hashed,
          name: user?.name ?? null,
        },
      });
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
