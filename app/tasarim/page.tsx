'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const DesignEditor = dynamic(
  () => import('@/app/components/design-editor/DesignEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
          <p className="mt-4 text-gray-600">Tasarım editörü yükleniyor...</p>
        </div>
      </div>
    ),
  }
);

export default function TasarimPage() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-2">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-brand-blue"
        >
          <ChevronLeft className="h-4 w-4" />
          Ana sayfa
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">
          Ürün Tasarım Editörü
        </h1>
      </div>
      <main className="flex-1 overflow-hidden">
        <DesignEditor />
      </main>
    </div>
  );
}
