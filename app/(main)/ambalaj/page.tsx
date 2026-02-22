'use client';

import { useState } from 'react';
import { Box, ShoppingCart, Package, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AmbalajPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'baklava', name: 'Baklava Kutuları' },
    { id: 'hamburger', name: 'Hamburger Kutuları' },
    { id: 'ozel', name: 'Özel Kutular' },
  ];

  const products = [
    {
      id: 'baklava-kutu-500gr',
      name: 'Baklava Kutusu 500gr',
      category: 'baklava',
      price: 2.5,
      minOrder: 100,
      stock: 'Stokta',
      image: '/placeholder-product.svg',
      description: 'Standart baklava kutusu, 500gr kapasiteli',
    },
    {
      id: 'baklava-kutu-1kg',
      name: 'Baklava Kutusu 1kg',
      category: 'baklava',
      price: 3.5,
      minOrder: 100,
      stock: 'Stokta',
      image: '/placeholder-product.svg',
      description: 'Büyük baklava kutusu, 1kg kapasiteli',
    },
    {
      id: 'hamburger-kutu-tekli',
      name: 'Hamburger Kutusu Tekli',
      category: 'hamburger',
      price: 1.8,
      minOrder: 200,
      stock: 'Stokta',
      image: '/placeholder-product.svg',
      description: 'Tek hamburger için standart kutu',
    },
    {
      id: 'hamburger-kutu-ikili',
      name: 'Hamburger Kutusu İkili',
      category: 'hamburger',
      price: 2.8,
      minOrder: 200,
      stock: 'Stokta',
      image: '/placeholder-product.svg',
      description: 'İki hamburger için geniş kutu',
    },
    {
      id: 'ozel-kutu-kare',
      name: 'Özel Kutu - Kare',
      category: 'ozel',
      price: 4.5,
      minOrder: 50,
      stock: 'Stokta',
      image: '/placeholder-product.svg',
      description: 'Özel tasarım kare kutu',
    },
    {
      id: 'ozel-kutu-dikdortgen',
      name: 'Özel Kutu - Dikdörtgen',
      category: 'ozel',
      price: 5.0,
      minOrder: 50,
      stock: 'Stokta',
      image: '/placeholder-product.svg',
      description: 'Özel tasarım dikdörtgen kutu',
    },
  ];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2">Ambalaj & Kutu</h1>
          <p className="text-xl text-gray-600">Hazır ambalaj çözümleri - Baklava, hamburger ve özel kutular</p>
        </div>

        {/* Kategori Filtreleri */}
        <div className="flex flex-wrap gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`min-h-11 px-6 py-3 rounded-lg font-semibold transition-colors ${
                selectedCategory === category.id
                  ? 'bg-[#1e3a8a] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Ürün Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#f97316] hover:shadow-lg transition-all"
            >
              <Link href={`/ambalaj/${product.id}`}>
                <div className="relative w-full h-64 bg-gray-100">
                  {product.image.endsWith('.svg') ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                </div>
              </Link>
              <div className="p-6">
                <h3 className="font-bold text-lg text-[#1e3a8a] mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Birim Fiyat:</span>
                    <span className="text-xl font-bold text-[#f97316]">
                      {product.price.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Minimum Sipariş: <strong>{product.minOrder} adet</strong>
                  </div>
                  <div className="text-xs text-green-600 font-semibold mt-2">
                    {product.stock}
                  </div>
                </div>

                <button className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart size={18} />
                  Sepete Ekle
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600 text-lg">Bu kategoride ürün bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
