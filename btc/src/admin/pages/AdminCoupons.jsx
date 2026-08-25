import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, CheckCircle2, X } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { adminStorage } from '../utils/localStorageHelpers';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: 10,
    minOrderAmount: 499,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 500,
    usedCount: 0,
    status: 'Active'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setCoupons(adminStorage.getCoupons());
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setErrorMsg('');
    setFormData({
      code: '',
      discountType: 'Percentage',
      discountValue: 10,
      minOrderAmount: 499,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      usageLimit: 100,
      usedCount: 0,
      status: 'Active'
    });
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCoupon(c);
    setErrorMsg('');
    setFormData({ ...c });
    setModalOpen(true);
  };

  const handleToggleStatus = (coupon) => {
    const updatedStatus = coupon.status === 'Active' ? 'Inactive' : 'Active';
    const updatedList = coupons.map(c => c.id === coupon.id ? { ...c, status: updatedStatus } : c);
    setCoupons(updatedList);
    adminStorage.saveCoupons(updatedList);
    setToastMsg(`Coupon ${coupon.code} set to ${updatedStatus}`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const formattedCode = formData.code.trim().toUpperCase();

    // Validation rules
    if (!formattedCode) {
      setErrorMsg('Coupon code is required.');
      return;
    }
    if (formData.discountType === 'Percentage' && Number(formData.discountValue) > 100) {
      setErrorMsg('Percentage discount cannot exceed 100%.');
      return;
    }
    if (Number(formData.discountValue) <= 0) {
      setErrorMsg('Discount value must be greater than 0.');
      return;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setErrorMsg('End date must be after start date.');
      return;
    }
    if (Number(formData.usageLimit) <= 0) {
      setErrorMsg('Usage limit must be greater than 0.');
      return;
    }

    const payload = {
      ...formData,
      code: formattedCode,
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount),
      usageLimit: Number(formData.usageLimit)
    };

    let updatedList;
    if (editingCoupon) {
      updatedList = coupons.map(c => c.id === editingCoupon.id ? payload : c);
      setToastMsg('Coupon updated successfully!');
    } else {
      const newCoupon = { ...payload, id: 'coup_' + Date.now() };
      updatedList = [newCoupon, ...coupons];
      setToastMsg('Coupon created successfully!');
    }

    setCoupons(updatedList);
    adminStorage.saveCoupons(updatedList);
    setModalOpen(false);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const updatedList = coupons.filter(c => c.id !== deleteTarget.id);
    setCoupons(updatedList);
    adminStorage.saveCoupons(updatedList);
    setDeleteTarget(null);
    setToastMsg('Coupon deleted.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'Code',
      accessor: 'code',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Tag size={15} className="text-gray-400" />
          <span className="font-mono font-bold text-gray-900 text-sm tracking-wider">{row.code}</span>
        </div>
      )
    },
    {
      header: 'Discount',
      cell: (row) => (
        <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded text-xs">
          {row.discountType === 'Percentage' ? `${row.discountValue}% OFF` : `₹${row.discountValue} OFF`}
        </span>
      )
    },
    {
      header: 'Min Order',
      accessor: 'minOrderAmount',
      cell: (row) => <span className="font-semibold text-gray-800">₹{row.minOrderAmount}</span>
    },
    {
      header: 'Usage',
      cell: (row) => (
        <span className="text-gray-600">
          <strong className="text-gray-900">{row.usedCount}</strong> / {row.usageLimit}
        </span>
      )
    },
    {
      header: 'Valid Dates',
      cell: (row) => (
        <span className="text-[11px] text-gray-500 font-mono">
          {row.startDate} to {row.endDate}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <button onClick={() => handleToggleStatus(row)} title="Click to toggle status">
          <StatusBadge status={row.status} />
        </button>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white transition-colors"
            title="Edit Coupon"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-rose-600 hover:text-white transition-colors"
            title="Delete Coupon"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout title="Coupon Code Management">
      {toastMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredCoupons}
        searchPlaceholder="Search coupon code (e.g. BTC10)..."
        searchValue={search}
        onSearchChange={setSearch}
        actionButton={
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
          >
            <Plus size={16} />
            <span>Create Coupon</span>
          </button>
        }
        filterComponent={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-gray-900"
          >
            <option value="ALL">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        }
      />

      {/* Add / Edit Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold font-serif text-gray-900 mb-4">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h3>

            {errorMsg && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. BTC10"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono uppercase text-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Discount Value ({formData.discountType === 'Percentage' ? '%' : '₹'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Min Order Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Usage Limit *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
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
                  className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-gray-900 hover:bg-black rounded-lg shadow-xs"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon code "${deleteTarget?.code}"?`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
