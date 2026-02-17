'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function CategoryNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow flex items-center justify-center py-16">
        <div className="container mx-auto px-4 text-center">
          <Package className="mx-auto text-gray-400 mb-6" size={80} />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kategori Bulunamadı
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
            Aradığınız kategori mevcut değil veya kaldırılmış olabilir.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-[#FF6000] text-white rounded-lg hover:bg-[#e55a00] transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
            <Link
              href="/kategori"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Tüm Kategoriler
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
