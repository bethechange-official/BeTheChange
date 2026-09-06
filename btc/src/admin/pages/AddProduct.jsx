import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { adminProductService } from '../../services/admin/productService';
import { adminCategoryService } from '../../services/admin/categoryService';
import { adminCollectionService } from '../../services/admin/collectionService';
import { adminApi } from '../../services/admin/api';

export default function AddProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'Skin Care',
    collection: 'Best Sellers',
    skinConcern: 'Brightening',
    price: '',
    originalPrice: '',
    stock: 20,
    size: '100ml',
    shortDescription: '',
    description: '',
    ingredients: '',
    benefits: '',
    usageInstructions: '',
    isFeatured: false,
    isActive: true
  });

  const [imageUrls, setImageUrls] = useState([]);
  const [newUrlInput, setNewUrlInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([adminCategoryService.getAll(), adminCollectionService.getAll()])
      .then(([categoryResponse, collectionResponse]) => {
        const fetchedCats = categoryResponse.data || [];
        const fetchedCols = collectionResponse.data || [];
        setCategories(fetchedCats);
        setCollections(fetchedCols);
        if (fetchedCats.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category: fetchedCats.some((c) => c.name === prev.category) ? prev.category : fetchedCats[0].name,
            collection: fetchedCols.some((c) => c.name === prev.collection) ? prev.collection : (fetchedCols[0]?.name || ''),
          }));
        }
      })
      .catch((err) => setError(err.message || 'Failed to load product options'));
  }, []);

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

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      const response = await adminApi.uploadImages(files);
      setImageUrls((current) => [...current, ...(response.data?.images || []).map((image) => image.url)]);
    } catch (err) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const newProduct = {
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      stock: Number(formData.stock),
      images: imageUrls,
    };
    try {
      await adminProductService.create(newProduct);
      setToastMessage('Product created successfully!');
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Add New Product">
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

        {error && <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs">{error}</div>}

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
                  placeholder="e.g. Turmeric Glow Face Wash"
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
                  placeholder="e.g. turmeric-glow-face-wash"
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
                  value={formData.skinConcern}
                  onChange={(e) => setFormData(prev => ({ ...prev, skinConcern: e.target.value }))}
                  placeholder="e.g. Brightening, Acne"
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
                  placeholder="399"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                  placeholder="499"
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
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  placeholder="e.g. 100ml, 50g"
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
                value={formData.shortDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="Brief one line summary..."
                className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Full Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Comprehensive formula breakdown..."
                className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg p-3 text-sm text-gray-900 focus:outline-none font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Ingredients</label>
                <textarea
                  rows={2}
                  value={formData.ingredients}
                  onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                  placeholder="Niacinamide, Turmeric, Aloe..."
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Benefits</label>
                <textarea
                  rows={2}
                  value={formData.benefits}
                  onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                  placeholder="Brightens skin, reduces spots..."
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Usage Instructions</label>
                <textarea
                  rows={2}
                  value={formData.usageInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, usageInstructions: e.target.value }))}
                  placeholder="Massage onto wet skin morning & night..."
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Media Images Card */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 font-serif border-b border-gray-100 pb-3">Product Images</h3>
            <label className="block border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-xs font-semibold text-gray-700 cursor-pointer hover:border-gray-400">
              {uploading ? 'Uploading images…' : 'Upload JPG, PNG, WebP, or GIF (max 5 MB each)'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleImageUpload} disabled={uploading} className="hidden" />
            </label>
            
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
                disabled={saving || uploading}
                className="px-6 py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider shadow-xs"
              >
                {saving ? 'Saving…' : 'Save Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
