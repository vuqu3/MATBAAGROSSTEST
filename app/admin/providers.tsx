'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/context/CartContext';
import { OffersProvider } from '@/context/OffersContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OffersProvider>
        <CartProvider>{children}</CartProvider>
      </OffersProvider>
    </SessionProvider>
  );
}
