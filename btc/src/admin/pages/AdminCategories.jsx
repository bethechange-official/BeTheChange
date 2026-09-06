import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Layers, FolderHeart, X, CheckCircle2, Loader2 } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { adminCategoryService } from '../../services/admin/categoryService';
import { adminCollectionService } from '../../services/admin/collectionService';
import { adminProductService } from '../../services/admin/productService';

export default function AdminCategories() {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'collections'
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    status: 'Active'
  });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await adminCategoryService.getAll();
      if (response.success) {
        setCategories((response.data || []).map((item) => ({ ...item, status: item.isActive ? 'Active' : 'Inactive' })));
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  const fetchCollections = useCallback(async () => {
    try {
      const response = await adminCollectionService.getAll();
      if (response.success) {
        setCollections((response.data || []).map((item) => ({ ...item, status: item.isActive ? 'Active' : 'Inactive' })));
      }
    } catch (err) {
      console.error('Failed to load collections:', err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await adminProductService.getAll({ limit: 1000 });
      if (response.success) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchCollections();
    fetchProducts();
  }, [fetchCategories, fetchCollections, fetchProducts]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
      status: 'Active'
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
      status: item.status || 'Active'
    });
    setModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, name: val, slug: autoSlug }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (activeTab === 'categories') {
        if (editingItem) {
          response = await adminCategoryService.update(editingItem.id, {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            imageUrl: formData.imageUrl,
            isActive: formData.status === 'Active',
          });
          setToastMessage('Category updated successfully!');
        } else {
          response = await adminCategoryService.create({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            imageUrl: formData.imageUrl,
            isActive: formData.status === 'Active',
          });
          setToastMessage('Category created successfully!');
        }
      } else {
        if (editingItem) {
          response = await adminCollectionService.update(editingItem.id, {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            imageUrl: formData.imageUrl,
            isActive: formData.status === 'Active',
          });
          setToastMessage('Collection updated successfully!');
        } else {
          response = await adminCollectionService.create({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            imageUrl: formData.imageUrl,
            isActive: formData.status === 'Active',
          });
          setToastMessage('Collection created successfully!');
        }
      }

      if (response.success) {
        if (activeTab === 'categories') {
          fetchCategories();
        } else {
          fetchCollections();
        }
        setModalOpen(false);
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);

    try {
      let response;
      if (activeTab === 'categories') {
        response = await adminCategoryService.delete(deleteTarget.id);
      } else {
        response = await adminCollectionService.delete(deleteTarget.id);
      }

      if (response.success) {
        if (activeTab === 'categories') {
          setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
        } else {
          setCollections(prev => prev.filter(c => c.id !== deleteTarget.id));
        }
        setToastMessage(`${activeTab === 'categories' ? 'Category' : 'Collection'} deleted.`);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  // Calculate items count
  const getProductCount = (name, type) => {
    if (type === 'categories') {
      return products.filter(p => p.category === name).length;
    }
    return products.filter(p => p.collection === name).length;
  };

  const items = activeTab === 'categories' ? categories : collections;

  return (
    <AdminLayout title="Categories & Collections">
      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <X size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {toastMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs Header & Add Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center bg-gray-200/70 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'categories' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers size={15} />
            <span>Categories ({categories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'collections' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FolderHeart size={15} />
            <span>Collections ({collections.length})</span>
          </button>
        </div>

        <button
          onClick={openAddModal}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-xs disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          <span>Add {activeTab === 'categories' ? 'Category' : 'Collection'}</span>
        </button>
      </div>

      {/* Items Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => {
          const count = getProductCount(item.name, activeTab);
          return (
            <div key={item.id} className="bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-36 bg-gray-100 overflow-hidden">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={item.status || (item.isActive ? 'Active' : 'Inactive')} />
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="font-serif text-xl font-bold leading-tight">{item.name}</h3>
                    <p className="text-[10px] text-white/80 font-mono">{item.slug}</p>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-600 font-light line-clamp-2 leading-relaxed mb-3">
                    {item.description || 'No description provided.'}
                  </p>
                  <div className="text-xs font-semibold text-gray-900 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg w-fit">
                    {getProductCount(item.name, activeTab)} Products Assigned
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-gray-100 mt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  disabled={loading}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50"
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setDeleteTarget(item)}
                  disabled={loading}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-rose-600 hover:text-white transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold font-serif text-gray-900 mb-4">
              {editingItem ? 'Edit' : 'Add New'} {activeTab === 'categories' ? 'Category' : 'Collection'}
            </h3>

            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder={`e.g. ${activeTab === 'categories' ? 'Skin Care' : 'Summer Care'}`}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-gray-900 hover:bg-black rounded-lg shadow-xs disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={`Delete ${activeTab === 'categories' ? 'Category' : 'Collection'}`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Assigned products will not be deleted.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={loading}
      />
    </AdminLayout>
  );
}
