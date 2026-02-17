import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminVendorsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/admin/login');

  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' },
    include: { owner: { select: { email: true, name: true } } },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Satıcı Listesi</h1>
      <p className="mt-0.5 text-sm text-slate-500">Pazaryerine kayıtlı satıcılar</p>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white overflow-hidden">
        {vendors.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Henüz satıcı yok.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Satıcı</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Komisyon</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Bakiye</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Yetkili</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{v.name}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono">{v.slug}</td>
                  <td className="px-4 py-3">%{v.commissionRate}</td>
                  <td className="px-4 py-3">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v.balance)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{v.owner?.email ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
