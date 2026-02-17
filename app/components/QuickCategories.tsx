'use client';

import Link from 'next/link';
import { FileText, CreditCard, ShoppingBag, Box, Tag, Package } from 'lucide-react';

export default function QuickCategories() {
  const categories = [
    {
      id: 'brosur',
      name: 'Broşür',
      icon: FileText,
      link: '/kategori/brosur',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'kartvizit',
      name: 'Kartvizit',
      icon: CreditCard,
      link: '/kategori/kartvizit',
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'karton-canta',
      name: 'Karton Çanta',
      icon: ShoppingBag,
      link: '/kategori/karton-canta',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'kutu',
      name: 'Kutu',
      icon: Box,
      link: '/ambalaj',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      id: 'etiket',
      name: 'Etiket',
      icon: Tag,
      link: '/kategori/etiket',
      color: 'bg-red-100 text-red-600',
    },
    {
      id: 'zarf',
      name: 'Zarf',
      icon: Package,
      link: '/kategori/zarf',
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <section className="bg-white py-8 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={category.link}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className={`${category.color} p-4 rounded-full mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon size={32} />
                </div>
                <span className="text-sm font-semibold text-[#484848] text-center group-hover:text-[#FF6000] transition-colors">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
