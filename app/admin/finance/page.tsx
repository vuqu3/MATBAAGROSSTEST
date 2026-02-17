import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminFinancePage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/admin/login');

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Finans</h1>
      <p className="mt-2 text-slate-600">Gelir / gider raporları burada yer alacak.</p>
    </div>
  );
}
