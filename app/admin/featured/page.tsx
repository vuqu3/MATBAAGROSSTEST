'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package, Star, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  basePrice: number;
  salePrice?: number;
  compareAtPrice?: number;
  isPublished: boolean;
  isActive: boolean;
}

interface FeaturedWidget {
  id: string;
  productId: string;
  customTitle?: string;
  order: number;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export default function AdminFeaturedPage() {
  const [widgets, setWidgets] = useState<FeaturedWidget[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWidget, setEditingWidget] = useState<FeaturedWidget | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    productId: '',
    customTitle: '',
    order: 0
  });

  const fetchWidgets = async () => {
    try {
      const res = await fetch('/api/admin/featured');
      if (res.ok) {
        const data = await res.json();
        setWidgets(data.sort((a: FeaturedWidget, b: FeaturedWidget) => a.order - b.order));
      }
    } catch (error) {
      console.error('Öne çıkanlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.filter((p: Product) => p.isPublished && p.isActive));
      }
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    }
  };

  useEffect(() => {
    fetchWidgets();
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingWidget ? `/api/admin/featured/${editingWidget.id}` : '/api/admin/featured';
      const method = editingWidget ? 'PATCH' : 'POST';
      
      console.log('FRONTEND_SUBMITTING:', {
        url,
        method,
        formData,
        editingWidget: editingWidget?.id
      });
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const responseData = await res.json();

      if (res.ok) {
        console.log('FRONTEND_SUCCESS:', responseData);
        await fetchWidgets();
        setShowForm(false);
        setEditingWidget(null);
        setFormData({
          productId: '',
          customTitle: '',
          order: 0
        });
        alert(editingWidget ? 'Öne çıkan ürün başarıyla güncellendi!' : 'Öne çıkan ürün başarıyla eklendi!');
      } else {
        console.error('FRONTEND_ERROR:', responseData);
        alert(`Hata: ${responseData.error || 'Öne çıkan ürün kaydedilirken hata oluştu.'}`);
      }
    } catch (error) {
      console.error('FRONTEND_CATCH_ERROR:', error);
      alert('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  };

  const handleEdit = (widget: FeaturedWidget) => {
    setEditingWidget(widget);
    setFormData({
      productId: widget.productId,
      customTitle: widget.customTitle || '',
      order: widget.order
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü öne çıkanlardan kaldırmak istediğinizden emin misiniz?')) return;
    
    try {
      console.log('FRONTEND_DELETING:', { id });
      
      const res = await fetch(`/api/admin/featured/${id}`, {
        method: 'DELETE',
      });

      const responseData = await res.json();

      if (res.ok) {
        console.log('FRONTEND_DELETE_SUCCESS:', responseData);
        await fetchWidgets();
        alert('Öne çıkan ürün başarıyla kaldırıldı!');
      } else {
        console.error('FRONTEND_DELETE_ERROR:', responseData);
        alert(`Hata: ${responseData.error || 'Öne çıkan ürün kaldırılırken hata oluştu.'}`);
      }
    } catch (error) {
      console.error('FRONTEND_DELETE_CATCH_ERROR:', error);
      alert('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  };

  const getSelectedProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const getPrice = (product: Product) => {
    const sale = product.salePrice != null ? Number(product.salePrice) : null;
    const base = Number(product.basePrice);
    return sale ?? base;
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Öne Çıkanlar</h1>
          <p className="mt-0.5 text-sm text-slate-500">Ana sayfada gösterilecek öne çıkan ürünleri yönetin.</p>
        </div>
        <button
          onClick={() => {
            setEditingWidget(null);
            setFormData({
              productId: '',
              customTitle: '',
              order: widgets.length
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg transition-colors"
        >
          <Plus size={16} />
          Ürün Ekle
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingWidget ? 'Öne Çıkanı Düzenle' : 'Öne Çıkan Ürün Ekle'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Seçimi
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus-[#f97316]"
                    placeholder="Ürün ara..."
                  />
                </div>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus-[#f97316]"
                  required
                >
                  <option value="">Ürün seçin</option>
                  {filteredProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {getPrice(product).toLocaleString('tr-TR')} TL
                    </option>
                  ))}
                </select>
                {formData.productId && getSelectedProduct(formData.productId) && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <div className="flex gap-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={getSelectedProduct(formData.productId)?.imageUrl || '/placeholder-product.svg'}
                          alt={getSelectedProduct(formData.productId)?.name || ''}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getSelectedProduct(formData.productId)?.name}
                        </p>
                        <p className="text-sm text-[#f97316] font-bold">
                          {getPrice(getSelectedProduct(formData.productId)!).toLocaleString('tr-TR')} TL
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Özel Başlık (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={formData.customTitle}
                  onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus-[#f97316]"
                  placeholder="Özel başlık girin (boş bırakılırsa ürün adı kullanılır)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sıra
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus-[#f97316]"
                  min="0"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg transition-colors"
                >
                  {editingWidget ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingWidget(null);
                    setSearchTerm('');
                  }}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Featured Widgets List */}
      <div className="space-y-4">
        {widgets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Henüz öne çıkan ürün eklenmemiş.</p>
            <p className="text-sm text-gray-400 mt-1">En az 3 ürün eklemeniz önerilir.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-[#f97316] hover:underline text-sm font-medium"
            >
              İlk ürünü ekleyin
            </button>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <strong>Tavsiye:</strong> Ana sayfada gösterim için en az 3 ürün ekleyin. Karakter slider'ı bu ürünler arasında otomatik geçiş yapacaktır.
            </div>
            
            {widgets.map((widget) => (
              <div key={widget.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={widget.product.imageUrl || '/placeholder-product.svg'}
                      alt={widget.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {widget.customTitle || widget.product.name}
                        </h3>
                        {widget.customTitle && (
                          <p className="text-xs text-gray-500 mt-1">Orijinal: {widget.product.name}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-[#f97316]">
                            {getPrice(widget.product).toLocaleString('tr-TR')} TL
                          </span>
                          {widget.product.salePrice && widget.product.basePrice > widget.product.salePrice && (
                            <span className="text-xs text-gray-500 line-through">
                              {Number(widget.product.basePrice).toLocaleString('tr-TR')} TL
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">Sıra: {widget.order}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            widget.product.isPublished && widget.product.isActive
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {widget.product.isPublished && widget.product.isActive ? 'Yayında' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(widget)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(widget.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Kaldır"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
