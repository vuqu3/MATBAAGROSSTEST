'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteButtonProps {
  productId: string;
  productName: string;
}

export default function DeleteButton({ productId, productName }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`"${productName}" ürününü silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ürün silinemedi');
      }

      // Sayfayı yenile
      window.location.reload();
    } catch (error: any) {
      alert(error.message || 'Ürün silinirken bir hata oluştu');
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Trash2 size={16} />
      {isDeleting ? 'Siliniyor...' : 'Sil'}
    </button>
  );
}
