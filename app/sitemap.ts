import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.matbaagross.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = [
    '/',
    '/urunler',
    '/sikca-sorulanlar',
    '/kurumsal/hakkimizda',
    '/iletisim',
  ];

  return routes.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
