'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'matbaagross_cart';

export type CartItemOptions = {
  paperWeight?: string;
  quantity?: string;
  lamination?: string;
  finish?: string;
  /** Seçilen varyasyonlar: özellik adı -> seçenek (örn. Ebat -> 20x28) */
  [key: string]: string | number | boolean | undefined;
};

export type CartItem = {
  lineId: string;
  productId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options: CartItemOptions;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'lineId'>) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
  totalCount: number;
  totalAmount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(items);
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, 'lineId'>) => {
    const lineId = `${item.productId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setItems((prev) => [...prev, { ...item, lineId }]);
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.lineId === lineId ? { ...i, quantity, totalPrice: i.unitPrice * quantity } : i))
    );
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalAmount = useMemo(() => items.reduce((sum, i) => sum + i.totalPrice, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      totalCount,
      totalAmount,
    }),
    [items, addItem, updateQuantity, removeItem, clearCart, totalCount, totalAmount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
