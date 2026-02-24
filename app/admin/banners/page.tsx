'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit2, Trash2, ExternalLink, Power, PowerOff, Upload, X } from 'lucide-react';

interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  link?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  imageUrl: string;
  title: string;
  subtitle: string;
  link: string;
  order: number;
  isActive: boolean;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<FormData>({
    imageUrl: '',
    title: '',
    subtitle: '',
    link: '',
    order: 0,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners?admin=true');
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (error) {
      console.error('Banner\'lar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Upload image if a new file is selected
      const uploadedUrl = await uploadImage();
      if (!uploadedUrl && !formData.imageUrl) {
        alert('Lütfen bir görsel yükleyin veya görsel URL girin.');
        setSubmitting(false);
        return;
      }

      const url = editingBanner ? `/api/banners/${editingBanner.id}` : '/api/banners';
      const method = editingBanner ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        imageUrl: uploadedUrl || formData.imageUrl,
      };

      console.log('FRONTEND_SUBMITTING:', {
        url,
        method,
        payload,
        editingBanner: editingBanner?.id
      });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (res.ok) {
        console.log('FRONTEND_SUCCESS:', responseData);
        await fetchBanners();
        setShowModal(false);
        setEditingBanner(null);
        setFormData({
          imageUrl: '',
          title: '',
          subtitle: '',
          link: '',
          order: 0,
          isActive: true,
        });
        setImageFile(null);
        setImageDimensions(null);
        alert(editingBanner ? 'Banner başarıyla güncellendi!' : 'Banner başarıyla eklendi!');
      } else {
        console.error('FRONTEND_ERROR:', responseData);
        alert(`Hata: ${responseData.error || 'Banner kaydedilirken hata oluştu.'}`);
      }
    } catch (error) {
      console.error('FRONTEND_CATCH_ERROR:', error);
      alert(error instanceof Error ? error.message : 'Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      imageUrl: banner.imageUrl,
      title: banner.title,
      subtitle: banner.subtitle,
      link: banner.link || '',
      order: banner.order,
      isActive: banner.isActive,
    });
    setImageFile(null);
    setImageDimensions(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu banner\'ı silmek istediğinizden emin misiniz?')) return;

    try {
      console.log('FRONTEND_DELETING:', { id });

      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
      });

      const responseData = await res.json();

      if (res.ok) {
        console.log('FRONTEND_DELETE_SUCCESS:', responseData);
        await fetchBanners();
        alert('Banner başarıyla kaldırıldı!');
      } else {
        console.error('FRONTEND_DELETE_ERROR:', responseData);
        alert(`Hata: ${responseData.error || 'Banner kaldırılırken hata oluştu.'}`);
      }
    } catch (error) {
      console.error('FRONTEND_DELETE_CATCH_ERROR:', error);
      alert('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });

      if (res.ok) {
        await fetchBanners();
      }
    } catch (error) {
      console.error('Banner durumu güncellenirken hata:', error);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Resim dosyası 5MB\'dan küçük olmalıdır.');
      return;
    }

    setImageFile(file);
    setUploading(true);

    // Get image dimensions
    const img = document.createElement('img') as HTMLImageElement;
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setUploading(false);
    };
    img.onerror = () => {
      alert('Resim yüklenirken bir hata oluştu.');
      setImageFile(null);
      setImageDimensions(null);
      setUploading(false);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageDimensions(null);
    setFormData({ ...formData, imageUrl: '' });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.imageUrl || null;

    const fd = new FormData();
    fd.append('file', imageFile);

    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'Görsel yüklenirken bir hata oluştu.');
    }

    if (!data.url) {
      throw new Error('Görsel yüklenirken bir hata oluştu.');
    }

    return data.url;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner Yönetimi</h1>
          <p className="mt-0.5 text-sm text-gray-500">Ana sayfa banner'larını yönetin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Yeni Banner Ekle
        </button>
      </div>

      {/* Banner Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alt Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sıra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative w-20 h-12 rounded overflow-hidden bg-gray-100">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">{banner.subtitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {banner.link ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-600 truncate max-w-xs">{banner.link}</span>
                        <Link
                          href={banner.link}
                          target="_blank"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink size={16} />
                        </Link>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{banner.order}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        banner.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {banner.isActive ? <Power size={12} /> : <PowerOff size={12} />}
                      {banner.isActive ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {banners.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Henüz banner eklenmemiş</div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              İlk Banner'ı Ekle
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingBanner ? 'Banner Düzenle' : 'Yeni Banner Ekle'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Görsel Yükle
                  </label>
                  <div className="space-y-2">
                    {!imageFile ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="bannerImage"
                        />
                        <label
                          htmlFor="bannerImage"
                          className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Resim seçmek için tıklayın</span>
                          <span className="text-xs text-gray-500 mt-1">JPEG, PNG, GIF, WebP (max 5MB)</span>
                        </label>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{imageFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {imageDimensions && (
                              <p className="text-xs text-blue-600 font-medium">
                                Boyut: {imageDimensions.width} × {imageDimensions.height} px
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        {imageDimensions && (
                          <div className="relative w-full h-32 bg-gray-100 rounded overflow-hidden">
                            <Image
                              src={URL.createObjectURL(imageFile)}
                              alt="Preview"
                              fill
                              className="object-contain"
                              sizes="320px"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {!imageFile && formData.imageUrl && (
                      <div className="text-xs text-gray-500">
                        Mevcut görsel: {formData.imageUrl}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlık
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Banner başlığı"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alt Başlık
                  </label>
                  <textarea
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Banner alt başlığı"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hedef Link (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/page"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sıra
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Banner aktif olsun
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBanner(null);
                      setFormData({
                        imageUrl: '',
                        title: '',
                        subtitle: '',
                        link: '',
                        order: 0,
                        isActive: true,
                      });
                      setImageFile(null);
                      setImageDimensions(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Kaydediliyor...' : (editingBanner ? 'Güncelle' : 'Ekle')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
