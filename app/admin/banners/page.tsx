import Link from 'next/link';

export default function AdminBannersPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Banner Yönetimi</h1>
      <p className="mt-0.5 text-sm text-slate-500">Ana sayfa vitrin ve banner’ları yönetin.</p>
      <p className="mt-4 text-sm text-slate-600">
        Hero widget’lar için{' '}
        <Link href="/admin/settings" className="text-[#f97316] hover:underline">
          Site Ayarları
        </Link>{' '}
        sayfasını kullanabilirsiniz.
      </p>
    </div>
  );
}
