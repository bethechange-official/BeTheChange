import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, AlertCircle } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { adminStorage } from '../utils/localStorageHelpers';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    setProducts(adminStorage.getProducts());
    setCategories(adminStorage.getCategories());
  }, []);

  const handleDelete = () => {
    if (!deleteTarget) return;
    const updated = products.filter(p => p.id !== deleteTarget.id);
    setProducts(updated);
    adminStorage.saveProducts(updated);
    setDeleteTarget(null);
  };

  // Filter products based on search, category, and stock status
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase()) ||
                          p.slug.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === 'LOW') matchesStock = p.stock <= 5 && p.stock > 0;
    else if (stockFilter === 'OUT') matchesStock = p.stock === 0;
    else if (stockFilter === 'IN') matchesStock = p.stock > 5;

    return matchesSearch && matchesCategory && matchesStock;
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
          <span className="font-bold text-gray-900">₹{row.price?.toLocaleString()}</span>
          {row.originalPrice && (
            <span className="text-[10px] text-gray-400 line-through block">₹{row.originalPrice?.toLocaleString()}</span>
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
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors"
            title="Delete Product"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout title="Product Management">
      {/* Table Filters */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        searchPlaceholder="Search product name, category..."
        searchValue={search}
        onSearchChange={setSearch}
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
              <option value="IN">In Stock (&gt; 5)</option>
              <option value="LOW">Low Stock (&lt;= 5)</option>
              <option value="OUT">Out of Stock (0)</option>
            </select>
          </div>
        }
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Product"
        message={`Are you sure you want to permanently remove "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
