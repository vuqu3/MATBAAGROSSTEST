'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Box, ChevronDown } from 'lucide-react';

interface NavbarChild {
  id: string;
  name: string;
  slug: string;
  order: number;
}

interface NavbarCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  children: NavbarChild[];
}

interface SubCategory {
  name: string;
  link: string;
}

interface CategoryItem {
  id: string;
  name: string;
  link: string;
  subCategories: SubCategory[];
}

export default function CategoryBar() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/categories/navbar')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: NavbarCategory[]) => {
        if (cancelled) return;
        setCategories(
          data.map((c) => ({
            id: c.id,
            name: c.name,
            link: `/kategori/${c.slug}`,
            subCategories: (c.children || []).map((ch) => ({
              name: ch.name,
              link: `/kategori/${ch.slug}`,
            })),
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || categories.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-200 relative z-40">
      <div className="container mx-auto px-4">
        <nav className="relative">
          <ul className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {categories.map((category) => {
              const isHovered = hoveredCategory === category.id;
              return (
                <li
                  key={category.id}
                  className="relative flex-shrink-0"
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    href={category.link}
                    className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors text-[#484848] hover:text-[#FF6000] hover:bg-gray-50 ${isHovered ? 'text-[#FF6000] bg-gray-50' : ''}`}
                  >
                    <Box size={18} />
                    <span>{category.name}</span>
                    {category.subCategories.length > 0 && (
                      <ChevronDown size={16} className={isHovered ? 'rotate-180 transition-transform' : ''} />
                    )}
                  </Link>
                  {isHovered && category.subCategories.length > 0 && (
                    <div className="absolute top-full left-0 mt-0 bg-white shadow-xl rounded-b-lg border border-gray-200 min-w-[280px] z-50">
                      <div className="p-6">
                        <Link
                          href={category.link}
                          className="block mb-4 pb-3 border-b border-gray-200 hover:text-[#FF6000] transition-colors"
                        >
                          <h3 className="font-bold text-lg text-[#484848]">{category.name}</h3>
                          <span className="text-xs text-gray-500">Tümünü Gör</span>
                        </Link>
                        <ul className="space-y-2">
                          {category.subCategories.map((subCategory, index) => (
                            <li key={index}>
                              <Link
                                href={subCategory.link}
                                className="block px-3 py-2 text-sm text-[#484848] hover:bg-gray-50 hover:text-[#FF6000] rounded transition-colors"
                              >
                                {subCategory.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
