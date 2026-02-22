'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, Pencil, ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
}

interface CategoryNode extends Category {
  children: CategoryNode[];
  level: number;
  isExpanded?: boolean;
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
  const [treeData, setTreeData] = useState<CategoryNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [error, setError] = useState('');
  
  // Drag & Drop states
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      buildTree(data);
    } catch (err) {
      console.error('Fetch categories error:', err);
      setError('Kategoriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Kategorileri hiyerarşik yapıya dönüştür
  const buildTree = (categories: Category[]) => {
    const categoryMap = new Map<string, CategoryNode>();
    const rootCategories: CategoryNode[] = [];

    // Önce tüm kategorileri map'e ekle
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
        level: 0
      });
    });

    // Çocukları ebeveynlere ata
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          node.level = parent.level + 1;
          parent.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    // Her seviyeyi sırala
    const sortNodes = (nodes: CategoryNode[]) => {
      nodes.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(rootCategories);
    setTreeData(rootCategories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Ağaç düğümünü aç/kapat
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Tümünü aç/kapat
  const expandAll = () => {
    const allNodeIds = new Set<string>();
    const collectIds = (nodes: CategoryNode[]) => {
      nodes.forEach(node => {
        allNodeIds.add(node.id);
        if (node.children.length > 0) {
          collectIds(node.children);
        }
      });
    };
    collectIds(treeData);
    setExpandedNodes(allNodeIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Get flattened array for drag & drop (all visible items)
  const getFlattenedCategories = (nodes: CategoryNode[]): CategoryNode[] => {
    const result: CategoryNode[] = [];
    
    const flatten = (nodeList: CategoryNode[]) => {
      nodeList.forEach(node => {
        result.push(node);
        // Add children if parent is expanded
        if (node.children.length > 0 && expandedNodes.has(node.id)) {
          flatten(node.children);
        }
      });
    };
    
    flatten(nodes);
    return result;
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag started:', event.active.id);
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    console.log('Drag ended:', { active: event.active.id, over: event.over?.id });
    
    const { active, over } = event;
    
    if (!over) {
      console.log('No drop target');
      setActiveId(null);
      return;
    }

    if (active.id !== over.id) {
      setIsReordering(true);
      
      // Get flattened categories for all visible items
      const flattenedCategories = getFlattenedCategories(treeData);
      console.log('Flattened categories:', flattenedCategories.map(c => ({ id: c.id, name: c.name, parentId: c.parentId })));
      
      const oldIndex = flattenedCategories.findIndex(item => item.id === active.id);
      const newIndex = flattenedCategories.findIndex(item => item.id === over.id);
      
      console.log('Indices:', { oldIndex, newIndex });
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const draggedCategory = flattenedCategories[oldIndex];
        const targetCategory = flattenedCategories[newIndex];
        
        console.log('Categories:', { 
          dragged: { id: draggedCategory.id, name: draggedCategory.name, parentId: draggedCategory.parentId },
          target: { id: targetCategory.id, name: targetCategory.name, parentId: targetCategory.parentId }
        });
        
        // Check if they are at the same level (same parentId)
        if (draggedCategory.parentId === targetCategory.parentId) {
          console.log('Same level - allowing reorder');
          // Same level - allow reordering
          const newCategories = arrayMove(flattenedCategories, oldIndex, newIndex);
          const updatedCategories = newCategories.map((cat, index) => ({
            ...cat,
            order: index,
          }));
          
          // Update tree data with new order
          const updatedTreeData = rebuildTreeFromFlattened(updatedCategories);
          setTreeData(updatedTreeData);
          
          // Prepare data for API
          const reorderItems = updatedCategories.map(cat => ({
            id: cat.id,
            order: cat.order,
          }));
          
          try {
            // Save to database
            const response = await fetch('/api/categories/reorder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: reorderItems }),
            });
            
            if (response.ok) {
              showNotification('success', 'Sıralama başarıyla güncellendi');
              fetchCategories(); // Refresh data from server
            } else {
              throw new Error('Sıralama güncellenemedi');
            }
          } catch (error) {
            console.error('Reorder error:', error);
            showNotification('error', 'Sıralama güncellenirken hata oluştu');
            fetchCategories(); // Revert to original data
          }
        } else {
          console.log('Different levels - blocking reorder');
          // Different levels - show warning
          showNotification('error', 'Sadece aynı seviyedeki kategoriler sıralanabilir');
        }
      }
    }
    
    setActiveId(null);
    setIsReordering(false);
  };

  // Rebuild tree structure from flattened array
  const rebuildTreeFromFlattened = (flattened: CategoryNode[]): CategoryNode[] => {
    const categoryMap = new Map<string, CategoryNode>();
    const rootCategories: CategoryNode[] = [];

    // Create map
    flattened.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    });

    // Build tree
    flattened.forEach(category => {
      const node = categoryMap.get(category.id)!;
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  };

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

  // Sortable category row component
  const SortableCategoryRow = ({ node, level }: { node: CategoryNode; level: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ 
      id: node.id,
      disabled: false // Ensure it's always enabled
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const indent = level * 24; // Her seviye için 24px girinti

    return (
      <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{node.order}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center" style={{ paddingLeft: `${indent}px` }}>
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="mr-2 p-1 cursor-grab active:cursor-grabbing hover:bg-gray-100 rounded transition-colors"
              title="Sürükle bırak ile sırala"
              style={{ touchAction: 'none' }} // Prevent touch scrolling
            >
              <GripVertical size={16} className="text-gray-400" />
            </div>
            
            {/* Expand/Collapse Arrow */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent drag events
                  toggleNode(node.id);
                }}
                className="mr-2 p-1 hover:bg-gray-100 rounded transition-colors"
                title={isExpanded ? 'Daralt' : 'Genişlet'}
              >
                {isExpanded ? (
                  <ChevronDown size={16} className="text-gray-600" />
                ) : (
                  <ChevronRight size={16} className="text-gray-600" />
                )}
              </button>
            )}
            {!hasChildren && (
              <div className="mr-2 w-6" /> // Boşluk için hizalama
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">{node.name}</div>
              <div className="text-sm text-gray-500">/{node.slug}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900">{node.description || '-'}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`text-sm ${node.showOnNavbar ? 'text-green-600' : 'text-gray-400'}`}>
            {node.showOnNavbar ? 'Evet' : 'Hayır'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`text-sm ${node.isActive ? 'text-green-600' : 'text-gray-400'}`}>
            {node.isActive ? 'Evet' : 'Hayır'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDate(node.createdAt)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent drag events
                openEditModal(node);
              }}
              className="text-[#1e3a8a] hover:text-blue-700 transition-colors"
              title="Düzenle"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent drag events
                handleDelete(node.id, node.name);
              }}
              className="text-red-600 hover:text-red-900 transition-colors"
              title="Sil"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Hiyerarşik kategori satırı render et (non-sortable version for children)
  const renderCategoryRow = (node: CategoryNode) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const indent = node.level * 24; // Her seviye için 24px girinti

    return (
      <React.Fragment key={node.id}>
        <SortableCategoryRow node={node} level={node.level} />
        {/* Alt kategorileri göster */}
        {hasChildren && isExpanded && node.children.map(child => renderCategoryRow(child))}
      </React.Fragment>
    );
  };

  // Kategori seçeneklerini hiyerarşik olarak render et
  const renderCategoryOptions = (categories: Category[], level: number = 0, excludeId?: string) => {
    const options: React.ReactElement[] = [];
    
    categories
      .filter(cat => cat.id !== excludeId) // Düzenleme sırasında kendini üst kategori olarak seçemez
      .forEach(category => {
        const prefix = level > 0 ? '  '.repeat(level) + '└ ' : '';
        options.push(
          <option key={category.id} value={category.id}>
            {prefix + category.name}
          </option>
        );
        
        // Alt kategorileri recursive olarak ekle
        const childCategories = categories.filter(cat => cat.parentId === category.id);
        if (childCategories.length > 0) {
          options.push(...renderCategoryOptions(childCategories, level + 1, excludeId));
        }
      });
    
    return options;
  };

  return (
    <div>
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Başlık ve Butonlar */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kategori Yönetimi</h1>
        <div className="flex items-center gap-3">
          {treeData.length > 0 && (
            <>
              <button
                onClick={expandAll}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Tümünü Aç
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Tümünü Kapat
              </button>
            </>
          )}
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Yeni Kategori Ekle</span>
          </button>
        </div>
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={getFlattenedCategories(treeData).map(cat => cat.id)}
              strategy={verticalListSortingStrategy}
            >
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
                  {treeData.map(node => renderCategoryRow(node))}
                </tbody>
              </table>
            </SortableContext>
            
            {/* Drag Overlay */}
            <DragOverlay>
              {activeId ? (
                <div className="bg-white border-2 border-blue-500 rounded-lg shadow-lg p-4">
                  <div className="flex items-center">
                    <GripVertical size={16} className="text-gray-400 mr-2" />
                    <span className="font-medium">
                      {categories.find(cat => cat.id === activeId)?.name}
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
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

              <div className="mb-4">
                <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
                  Üst Kategori
                </label>
                <select
                  id="parentId"
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                >
                  <option value="">— Ana kategori —</option>
                  {renderCategoryOptions(rootCategories, 0, editingId || undefined)}
                </select>
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
