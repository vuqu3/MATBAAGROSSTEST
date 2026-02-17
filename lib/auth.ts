import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

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

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  // Trust host için (development'ta gerekli olabilir)
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
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

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.userType = user.userType;
        token.companyName = user.companyName;
        token.phoneNumber = user.phoneNumber;
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
