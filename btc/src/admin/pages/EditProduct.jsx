import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { adminStorage } from '../utils/localStorageHelpers';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);

  const [formData, setFormData] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [newUrlInput, setNewUrlInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setCategories(adminStorage.getCategories());
    setCollections(adminStorage.getCollections());

    const allProducts = adminStorage.getProducts();
    const found = allProducts.find(p => p.id === id);

    if (found) {
      setFormData(found);
      setImageUrls(found.images || []);
    } else {
      navigate('/admin/products');
    }
  }, [id, navigate]);

  if (!formData) return null;

  const handleNameChange = (e) => {
    const val = e.target.value;
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, name: val, slug: autoSlug }));
  };

  const handleAddImageUrl = () => {
    if (newUrlInput.trim()) {
      setImageUrls(prev => [...prev, newUrlInput.trim()]);
      setNewUrlInput('');
    }
  };

  const handleRemoveImage = (index) => {
    setImageUrls(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedProduct = {
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      stock: Number(formData.stock),
      images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80']
    };

    const existingProducts = adminStorage.getProducts();
    const updatedList = existingProducts.map(p => p.id === id ? updatedProduct : p);
    adminStorage.saveProducts(updatedList);

    setToastMessage('Product updated successfully!');
    setTimeout(() => {
      navigate('/admin/products');
    }, 1000);
  };

  return (
    <AdminLayout title={`Edit Product: ${formData.name}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 uppercase tracking-wider"
          >
            <ArrowLeft size={16} />
            <span>Back to Products</span>
          </Link>
        </div>

        {toastMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information Card */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 font-serif border-b border-gray-100 pb-3">Basic Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Collection</label>
                <select
                  value={formData.collection}
                  onChange={(e) => setFormData(prev => ({ ...prev, collection: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                >
                  {collections.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Skin Concern</label>
                <input
                  type="text"
                  value={formData.skinConcern || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, skinConcern: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 font-serif border-b border-gray-100 pb-3">Pricing & Stock</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.originalPrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Size / Unit *</label>
                <input
                  type="text"
                  required
                  value={formData.size || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Detailed Description & Formula Card */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 font-serif border-b border-gray-100 pb-3">Product Details</h3>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Short Description</label>
              <input
                type="text"
                value={formData.shortDescription || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Full Description</label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg p-3 text-sm text-gray-900 focus:outline-none font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Ingredients</label>
                <textarea
                  rows={2}
                  value={formData.ingredients || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Benefits</label>
                <textarea
                  rows={2}
                  value={formData.benefits || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Usage Instructions</label>
                <textarea
                  rows={2}
                  value={formData.usageInstructions || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, usageInstructions: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Media Images Card */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 font-serif border-b border-gray-100 pb-3">Product Images</h3>
            
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={newUrlInput}
                onChange={(e) => setNewUrlInput(e.target.value)}
                placeholder="Paste image URL (https://...)"
                className="flex-1 bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Image</span>
              </button>
            </div>

            {/* Image Previews */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-square">
                  <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status & Options Card */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-4 h-4 rounded text-gray-900 border-gray-300 focus:ring-0"
                />
                <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Featured Product</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-gray-900 border-gray-300 focus:ring-0"
                />
                <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Active Status</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/products"
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider shadow-xs"
              >
                Update Product
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
