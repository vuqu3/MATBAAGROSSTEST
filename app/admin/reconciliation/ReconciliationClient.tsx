'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Eye, Download, X } from 'lucide-react';

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  order: {
    barcode: string;
    createdAt: Date;
  };
};

type VendorStat = {
  id: string;
  name: string;
  email: string;
  commissionRate: number;
  totalRevenue: number;
  commissionAmount: number;
  netPayable: number;
  orderItems: OrderItem[];
};

export default function ReconciliationClient({ vendors }: { vendors: VendorStat[] }) {
  const [selectedVendor, setSelectedVendor] = useState<VendorStat | null>(null);

  const generatePDF = (vendor: VendorStat) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Başlık
    doc.setFontSize(18);
    doc.text('MatbaaGross - Satıcı Mutabakat Ekstresi', pageWidth / 2, 20, { align: 'center' });
    
    // Satıcı bilgileri
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Satıcı: ${vendor.name}`, 20, 40);
    doc.text(`E-posta: ${vendor.email}`, 20, 48);
    doc.text(`Dönem: ${new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}`, 20, 56);
    
    // Tablo başlıkları
    const tableColumn = ['Ürün Adı', 'Adet', 'Birim Fiyat', 'Toplam Tutar'];
    const tableRows = vendor.orderItems.map((item) => [
      item.productName,
      String(item.quantity),
      `₺${item.unitPrice.toFixed(2)}`,
      `₺${item.totalPrice.toFixed(2)}`,
    ]);
    
    // Tablo
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: [255, 96, 0] },
    });
    
    // Özet
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Toplam Ciro: ₺${vendor.totalRevenue.toFixed(2)}`, 20, finalY);
    doc.text(`Komisyon (%${vendor.commissionRate}): ₺${vendor.commissionAmount.toFixed(2)}`, 20, finalY + 8);
    doc.text(`Ödenecek Net Tutar: ₺${vendor.netPayable.toFixed(2)}`, 20, finalY + 16);
    
    // Footer
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Bu belge MatbaaGross sisteminden otomatik oluşturulmuştur.', pageWidth / 2, 285, { align: 'center' });
    
    // İndir
    doc.save(`${vendor.name.replace(/\s+/g, '_')}_ekstre_${Date.now()}.pdf`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Mutabakat</h1>
          <p className="mt-0.5 text-sm text-slate-500">Satıcı finansal mutabakat ve ödemeler</p>
        </div>
        <span className="text-sm text-slate-400">{vendors.length} satıcı</span>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        {vendors.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Henüz tamamlanmış sipariş yok.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Satıcı Adı</th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">Toplam Satış</th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">Komisyon Oranı</th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">Kesilen Komisyon</th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">Net Hakediş</th>
                <th className="px-4 py-3 text-center font-medium text-slate-700">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-slate-800">{vendor.name}</div>
                      <div className="text-xs text-slate-500">{vendor.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">{formatCurrency(vendor.totalRevenue)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">%{vendor.commissionRate}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(vendor.commissionAmount)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">{formatCurrency(vendor.netPayable)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedVendor(vendor)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Detayları görüntüle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => generatePDF(vendor)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                        title="Ekstre indir"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detay Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{selectedVendor.name}</h2>
                <p className="text-sm text-slate-500">Sipariş Detayları</p>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {selectedVendor.orderItems.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Bu satıcıya ait tamamlanmış sipariş yok.</p>
              ) : (
                <div className="space-y-3">
                  {selectedVendor.orderItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3 bg-slate-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800">{item.productName}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            Sipariş: {item.order.barcode} • {new Date(item.order.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-slate-600">{item.quantity} adet × ₺{item.unitPrice.toFixed(2)}</p>
                          <p className="font-semibold text-slate-800">₺{item.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-slate-50">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Toplam Ciro:</span>
                <span className="font-semibold">{formatCurrency(selectedVendor.totalRevenue)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-600">Komisyon (%{selectedVendor.commissionRate}):</span>
                <span className="font-semibold">{formatCurrency(selectedVendor.commissionAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-green-700 mt-2 pt-2 border-t">
                <span>Net Hakediş:</span>
                <span>{formatCurrency(selectedVendor.netPayable)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
