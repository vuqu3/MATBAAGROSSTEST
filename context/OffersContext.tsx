'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const OFFERS_STORAGE_KEY = 'matbaagross_offers_v1';

export type QuoteStatus = 'OFFER_RECEIVED' | 'ODEME_BEKLIYOR' | 'URETIMDE' | 'KARGODA';

export type QuoteRequest = {
  requestNo: string;
  productTitle?: string;
  productGroup: string;
  requestSummary?: string;
  technicalDetails?: string;
  quantity?: number;
  deadlineExpectation?: string;
  attachment?: { name: string; size: number } | null;
  attachmentDataUrl?: string;
  attachmentMime?: string;
  expiresAt: string;
};

export type Quote = {
  id: string;
  requestNo: string;
  partnerLabel: string;
  vendorId?: string; // Hangi satıcının teklifi olduğu
  price: number;
  deliveryDays?: number;
  sellerNote?: string;
  supplierScore?: number;
  status: QuoteStatus;
};

type OffersState = {
  requests: QuoteRequest[];
  quotes: Quote[];
};

type OffersContextValue = {
  requests: QuoteRequest[];
  quotes: Quote[];
  addRequest: (request: QuoteRequest) => void;
  addQuote: (quote: Omit<Quote, 'id'>) => void;
  approveQuote: (quoteId: string) => void;
  updateQuotePrice: (quoteId: string, price: number) => void;
};

const OffersContext = createContext<OffersContextValue | null>(null);

function loadFromStorage(): OffersState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(OFFERS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OffersState;
    if (!parsed || !Array.isArray(parsed.requests) || !Array.isArray(parsed.quotes)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(state: OffersState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function seedState(): OffersState {
  const now = Date.now();
  const hours = (h: number) => new Date(now + h * 60 * 60 * 1000).toISOString();

  return {
    requests: [
      {
        requestNo: 'TLP-10421',
        productTitle: 'Lüks Parfüm Kutusu',
        productGroup: 'Karton Kutu & Ambalaj',
        requestSummary: '1000 Adet, 350gr Bristol, Mat Selefon, 4 renk baskı',
        technicalDetails: 'Ebat: 10x20x8 cm. İç-dış baskı. Selefon mat. Özel kesim. Logo: altın yaldız opsiyonlu.',
        quantity: 1000,
        deadlineExpectation: '7 gün',
        attachment: { name: 'kutu-tasarim.pdf', size: 2450000 },
        expiresAt: hours(18),
      },
      {
        requestNo: 'TLP-10435',
        productTitle: 'Premium Etiket',
        productGroup: 'Etiket & Sticker',
        requestSummary: '5000 Adet, 7x7 cm, UV lak, rulo, kuşe',
        technicalDetails: 'Materyal: kuşe. Rulo yönü dıştan sarım. Kesim: yuvarlak köşe.',
        quantity: 5000,
        deadlineExpectation: '3 gün',
        attachment: null,
        expiresAt: hours(6),
      },
      {
        requestNo: 'TLP-10488',
        productTitle: 'Kartvizit',
        productGroup: 'Kartvizit',
        requestSummary: '1000 Adet, 350gr, çift yön, lak',
        technicalDetails: 'Ölçü: 8.5x5.5 cm. Tasarım hazır. Selefon mat + kısmi lak.',
        quantity: 1000,
        deadlineExpectation: '5 gün',
        attachment: { name: 'kartvizit.ai', size: 870000 },
        expiresAt: hours(30),
      },
    ],
    quotes: [
      {
        id: 'q-1',
        requestNo: 'TLP-10421',
        partnerLabel: 'Partner #1',
        price: 1890,
        supplierScore: 8.2,
        status: 'ODEME_BEKLIYOR',
      },
      {
        id: 'q-2',
        requestNo: 'TLP-10421',
        partnerLabel: 'Partner #2',
        price: 1750,
        supplierScore: 7.6,
        status: 'ODEME_BEKLIYOR',
      },
      {
        id: 'q-3',
        requestNo: 'TLP-10435',
        partnerLabel: 'Partner #1',
        price: 690,
        supplierScore: 8.9,
        status: 'ODEME_BEKLIYOR',
      },
    ],
  };
}

export function OffersProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<OffersState>({ requests: [], quotes: [] });

  useEffect(() => {
    const fromStorage = loadFromStorage();
    setState(fromStorage ?? seedState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(state);
  }, [state, hydrated]);

  const addQuote = useCallback((quote: Omit<Quote, 'id'>) => {
    setState((prev) => {
      const existingIndex = prev.quotes.findIndex(
        (q) => q.requestNo === quote.requestNo && q.partnerLabel === quote.partnerLabel
      );

      if (existingIndex >= 0) {
        const existing = prev.quotes[existingIndex];
        const next = [...prev.quotes];
        next[existingIndex] = {
          ...existing,
          ...quote,
          id: existing.id,
        };
        return {
          ...prev,
          quotes: next,
        };
      }

      const id = `q-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      return {
        ...prev,
        quotes: [...prev.quotes, { ...quote, id }],
      };
    });
  }, []);

  const addRequest = useCallback((request: QuoteRequest) => {
    setState((prev) => ({
      ...prev,
      requests: [request, ...prev.requests],
    }));
  }, []);

  const approveQuote = useCallback((quoteId: string) => {
    setState((prev) => ({
      ...prev,
      quotes: prev.quotes.map((q) => (q.id === quoteId ? { ...q, status: 'URETIMDE' } : q)),
    }));
  }, []);

  const updateQuotePrice = useCallback((quoteId: string, price: number) => {
    setState((prev) => ({
      ...prev,
      quotes: prev.quotes.map((q) => (q.id === quoteId ? { ...q, price } : q)),
    }));
  }, []);

  const value = useMemo<OffersContextValue>(
    () => ({
      requests: state.requests,
      quotes: state.quotes,
      addRequest,
      addQuote,
      approveQuote,
      updateQuotePrice,
    }),
    [state.requests, state.quotes, addRequest, addQuote, approveQuote, updateQuotePrice]
  );

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
}

export function useOffers() {
  const ctx = useContext(OffersContext);
  if (!ctx) throw new Error('useOffers must be used within OffersProvider');
  return ctx;
}
