import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { adminProductService } from '../../services/admin/productService';
import { adminCategoryService } from '../../services/admin/categoryService';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminProductService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        stockStatus: stockFilter !== 'ALL' ? stockFilter : undefined,
      });
      if (response.success) {
        setProducts(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 1,
        }));
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, categoryFilter, stockFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await adminCategoryService.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const response = await adminProductService.delete(deleteTarget.id);
      if (response.success) {
        setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Filter products based on search (local for immediate feedback)
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase()) ||
                          p.slug.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
            <img src={row.images?.[0] || 'https://via.placeholder.com/100'} alt={row.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate max-w-xs">{row.name}</p>
            <p className="text-[10px] text-gray-400 font-mono truncate">{row.slug}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (row) => <span className="font-medium text-gray-700">{row.category}</span>
    },
    {
      header: 'Price',
      accessor: 'price',
      cell: (row) => (
        <div>
          <span className="font-bold text-gray-900">\u20B9{row.price?.toLocaleString()}</span>
          {row.originalPrice && (
            <span className="text-[10px] text-gray-400 line-through block">\u20B9{row.originalPrice?.toLocaleString()}</span>
          )}
        </div>
      )
    },
    {
      header: 'Stock',
      accessor: 'stock',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <span className={`font-semibold ${row.stock <= 5 ? 'text-rose-600 font-bold' : 'text-gray-800'}`}>
            {row.stock} units
          </span>
          {row.stock <= 5 && row.stock > 0 && (
            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
              LOW
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      cell: (row) => (
        <StatusBadge
          status={!row.isActive ? 'Inactive' : row.stock === 0 ? 'Out of Stock' : row.stock <= 5 ? 'Low Stock' : 'Active'}
        />
      )
    },
    {
      header: 'Featured',
      accessor: 'isFeatured',
      cell: (row) => (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${row.isFeatured ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-400'}`}>
          {row.isFeatured ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/products/edit/${row.id}`}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
            title="Edit Product"
          >
            <Edit2 size={14} />
          </Link>
          <button
            onClick={() => setDeleteTarget(row)}
            disabled={loading}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors disabled:opacity-50"
            title="Delete Product"
          >
            {loading && row.id === deleteTarget?.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout title="Product Management">
      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs">
          {error}
        </div>
      )}

      {/* Table Filters */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        searchPlaceholder="Search product name, category..."
        searchValue={search}
        onSearchChange={setSearch}
        loading={loading}
        actionButton={
          <Link
            to="/admin/products/add"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </Link>
        }
        filterComponent={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-gray-900"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-gray-900"
            >
              <option value="ALL">All Stock Status</option>
              <option value="IN">In Stock (more than 5)</option>
              <option value="LOW">Low Stock (5 or fewer)</option>
              <option value="OUT">Out of Stock (0)</option>
            </select>
          </div>
        }
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          onPageChange: handlePageChange,
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Product"
        message={`Are you sure you want to permanently remove "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={loading}
      />
    </AdminLayout>
  );
}