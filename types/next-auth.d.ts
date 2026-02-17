import 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
    id: string;
    userType?: string;
    companyName?: string | null;
    phoneNumber?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      userType?: string;
      companyName?: string | null;
      phoneNumber?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    id: string;
    userType?: string;
    companyName?: string | null;
    phoneNumber?: string | null;
  }
}
