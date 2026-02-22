'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FREE_SHIPPING_THRESHOLD, calculateShippingCost, calculateRemainingForFreeShipping } from '@/lib/shipping';

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
  desi?: number; // Product desi for shipping calculation
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'lineId'>) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
  totalCount: number;
  totalAmount: number;
  totalDesi: number;
  shippingCost: number;
  grandTotal: number;
  remainingForFreeShipping: number;
  hasFreeShipping: boolean;
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
    // Ensure quantity is a valid number
    const validQuantity = Number(quantity);
    if (isNaN(validQuantity) || validQuantity < 1) return;
    
    setItems((prev) =>
      prev.map((i) => (i.lineId === lineId ? { ...i, quantity: validQuantity, totalPrice: i.unitPrice * validQuantity } : i))
    );
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalAmount = useMemo(() => items.reduce((sum, i) => sum + i.totalPrice, 0), [items]);
  const totalDesi = useMemo(() => items.reduce((sum, i) => sum + (i.desi || 0) * i.quantity, 0), [items]);
  
  const hasFreeShipping = useMemo(() => totalAmount >= FREE_SHIPPING_THRESHOLD, [totalAmount]);
  const shippingCost = useMemo(() => {
    if (hasFreeShipping) return 0;
    return calculateShippingCost(totalDesi);
  }, [hasFreeShipping, totalDesi]);
  
  const grandTotal = useMemo(() => totalAmount + shippingCost, [totalAmount, shippingCost]);
  const remainingForFreeShipping = useMemo(() => calculateRemainingForFreeShipping(totalAmount), [totalAmount]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      totalCount,
      totalAmount,
      totalDesi,
      shippingCost,
      grandTotal,
      remainingForFreeShipping,
      hasFreeShipping,
    }),
    [items, addItem, updateQuantity, removeItem, clearCart, totalCount, totalAmount, totalDesi, shippingCost, grandTotal, remainingForFreeShipping, hasFreeShipping]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
