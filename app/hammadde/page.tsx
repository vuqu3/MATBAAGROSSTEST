'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Package, ShoppingCart, TrendingUp, FileText, Layers } from 'lucide-react';

export default function HammaddePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Örnek ürünler
  const products = [
    {
      id: 'tabaka-a4-80gr',
      name: 'Tabaka Kağıt A4 - 80 gr/m²',
      category: 'tabaka',
      unit: 'paket',
      unitPrice: 45,
      bulkPrice: 42,
      minBulk: 10,
      stock: 'Stokta',
      image: '/placeholder-product.svg',
    },
    {
      id: 'tabaka-a3-100gr',
      name: 'Tabaka Kağıt A3 - 100 gr/m²',
      category: 'tabaka',
      unit: 'paket',
      unitPrice: 65,
      bulkPrice: 60,
      minBulk: 10,
      stock: 'Stokta',
      image: '/placeholder-product.svg',
    },
    {
      id: 'bobin-70cm-80gr',
      name: 'Bobin Kağıt 70cm - 80 gr/m²',
      category: 'bobin',
      unit: 'kg',
      unitPrice: 12,
      bulkPrice: 10.5,
      minBulk: 100,
      stock: 'Stokta',
      image: '/placeholder-product.svg',
    },
    {
      id: 'karton-350gr',
      name: 'Karton 350 gr/m²',
      category: 'karton',
      unit: 'adet',
      unitPrice: 2.5,
      bulkPrice: 2.2,
      minBulk: 100,
      stock: 'Stokta',
      image: '/placeholder-product.svg',
    },
  ];

  const categories = [
    { id: 'all', name: 'Tümü', icon: Package },
    { id: 'tabaka', name: 'Tabaka Kağıt', icon: FileText },
    { id: 'bobin', name: 'Bobin', icon: Layers },
    { id: 'karton', name: 'Karton', icon: Package },
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Başlık */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1e3a8a] mb-2">Hammadde Satışı</h1>
            <p className="text-xl text-gray-600">Kağıt Market - Birim Fiyat ve Toplu Alım Seçenekleri</p>
          </div>

          {/* Kategori Filtreleri */}
          <div className="flex flex-wrap gap-4 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-[#1e3a8a] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={20} />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Ürün Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#f97316] hover:shadow-lg transition-all"
              >
                <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center">
                  <Package className="text-gray-400" size={64} />
                </div>
                <h3 className="font-bold text-lg text-[#1e3a8a] mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Birim: {product.unit} | Stok: <span className="text-green-600 font-semibold">{product.stock}</span>
                </p>

                {/* Fiyat Bilgisi */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Birim Fiyat:</span>
                    <span className="text-lg font-bold text-[#1e3a8a]">
                      {product.unitPrice.toLocaleString('tr-TR')} TL/{product.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div>
                      <span className="text-xs text-gray-600">Toplu Alım ({product.minBulk}+):</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="text-[#f97316]" size={14} />
                        <span className="text-sm font-semibold text-[#f97316]">
                          {product.bulkPrice.toLocaleString('tr-TR')} TL/{product.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full min-h-11 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart size={18} />
                  Sepete Ekle
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
