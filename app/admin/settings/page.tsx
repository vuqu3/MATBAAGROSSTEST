import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import HeroWidgetManager from './HeroWidgetManager';

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/admin/login');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
        <p className="mt-1 text-slate-600">Vitrin widget’ları ve genel ayarlar.</p>
      </div>
      <HeroWidgetManager />
    </div>
  );
}
