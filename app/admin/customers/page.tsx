import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminCustomersPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/admin/login');

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Müşteriler</h1>
      <p className="mt-2 text-slate-600">Müşteri listesi ve yönetimi burada yer alacak.</p>
    </div>
  );
}
