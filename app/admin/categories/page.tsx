'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, Pencil } from 'lucide-react';

interface CategoryChild {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  showOnNavbar: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  isActive: boolean;
  showOnNavbar: boolean;
  parentId: string | null;
  createdAt: string;
  children?: CategoryChild[];
}

const defaultForm = {
  name: '',
  description: '',
  order: 0,
  isActive: true,
  showOnNavbar: false,
  parentId: '',
};

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [error, setError] = useState('');

  // Kategorileri yükle
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Kategoriler yüklenemedi');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Fetch categories error:', err);
      setError('Kategoriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const rootCategories = categories.filter((c) => !c.parentId);

  const openModal = () => {
    setEditingId(null);
    setIsModalOpen(true);
    setFormData(defaultForm);
    setError('');
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setIsModalOpen(true);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      order: cat.order,
      isActive: cat.isActive,
      showOnNavbar: cat.showOnNavbar,
      parentId: cat.parentId || '',
    });
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(defaultForm);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (editingId) {
        const response = await fetch(`/api/categories?id=${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || null,
            order: Number(formData.order) || 0,
            isActive: formData.isActive,
            showOnNavbar: formData.showOnNavbar,
            parentId: formData.parentId || null,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Güncellenemedi');
      } else {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || null,
            order: Number(formData.order) || 0,
            isActive: formData.isActive,
            showOnNavbar: formData.showOnNavbar,
            parentId: formData.parentId || null,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Kategori oluşturulamadı');
      }

      closeModal();
      router.refresh();
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kategori sil
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Kategori silinemedi');
      }

      // Başarılı - listeyi yenile
      router.refresh();
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Kategori silinirken bir hata oluştu');
    }
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Başlık ve Buton */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kategori Yönetimi</h1>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Yeni Kategori Ekle</span>
        </button>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Yükleniyor...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            Henüz kategori eklenmemiş. İlk kategoriyi eklemek için "Yeni Kategori Ekle" butonuna tıklayın.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sıra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Menüde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktif
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oluşturulma
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{category.order}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-500">/{category.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{category.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${category.showOnNavbar ? 'text-green-600' : 'text-gray-400'}`}>
                      {category.showOnNavbar ? 'Evet' : 'Hayır'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${category.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      {category.isActive ? 'Evet' : 'Hayır'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(category.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="text-[#1e3a8a] hover:text-blue-700 transition-colors"
                      title="Düzenle"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  placeholder="Örn: Karton Çanta"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent resize-none"
                  placeholder="Kategori açıklaması (isteğe bağlı)"
                />
              </div>

              <div className="mb-4 flex gap-4 flex-wrap">
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                    Sıralama No
                  </label>
                  <input
                    type="number"
                    id="order"
                    min={0}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-4 pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showOnNavbar}
                      onChange={(e) => setFormData({ ...formData, showOnNavbar: e.target.checked })}
                      className="rounded border-gray-300 text-[#1e3a8a] focus:ring-[#1e3a8a]"
                    />
                    <span className="text-sm font-medium text-gray-700">Menüde Göster</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-[#1e3a8a] focus:ring-[#1e3a8a]"
                    />
                    <span className="text-sm font-medium text-gray-700">Aktif</span>
                  </label>
                </div>
              </div>

              {!editingId && (
                <div className="mb-6">
                  <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
                    Üst Kategori (isteğe bağlı)
                  </label>
                  <select
                    id="parentId"
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  >
                    <option value="">— Ana kategori —</option>
                    {rootCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#1e3a8a] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
