import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Users, Building2, User } from 'lucide-react';

export default async function AdminCustomersPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/admin/login');

  const customers = await prisma.user.findMany({
    where: { role: 'USER' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      userType: true,
      companyName: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Müşteriler</h1>
          <p className="text-sm text-slate-500 mt-1">Toplam {customers.length} kayıtlı müşteri</p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Henüz kayıtlı müşteri yok</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Müşteri</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">E-posta</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Telefon</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Tip</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Sipariş</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {c.userType === 'CORPORATE' ? (
                          <Building2 className="h-4 w-4 text-slate-500" />
                        ) : (
                          <User className="h-4 w-4 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{c.name || '—'}</p>
                        {c.companyName && (
                          <p className="text-xs text-slate-500">{c.companyName}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.email}</td>
                  <td className="px-4 py-3 text-slate-600">{c.phoneNumber || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.userType === 'CORPORATE'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.userType === 'CORPORATE' ? 'Kurumsal' : 'Bireysel'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900">{c._count.orders}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
