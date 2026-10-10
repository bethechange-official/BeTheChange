import { useState, useEffect, useCallback } from 'react';
import { useDebouncedValue } from '../utils/useDebouncedValue';
import { Plus, Edit2, Trash2, Tag, CheckCircle2, X, Loader2 } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { adminCouponService } from '../../services/admin/couponService';

const codeCell = (row) => (
  <div className="flex items-center gap-2">
    <Tag size={15} className="text-gray-400" />
    <span className="font-mono font-bold text-gray-900 text-sm tracking-wider">{row.code}</span>
  </div>
);

const discountCell = (row) => (
  <div>
    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded text-xs">
      {row.discountType === 'Percentage' ? `${row.discountValue}% OFF` : `₹${row.discountValue} OFF`}
    </span>
    {row.discountType === 'Percentage' && row.maxDiscountAmount && (
      <p className="text-[10px] text-gray-500 mt-1">Max ₹{row.maxDiscountAmount}</p>
    )}
  </div>
);

const minOrderCell = (row) => (
  <span className="font-semibold text-gray-800">{Number(row.minOrderAmount) > 0 ? `₹${row.minOrderAmount}` : '—'}</span>
);

const usageCell = (row) => (
  <span className="text-gray-600">
    <strong className="text-gray-900">{row.usedCount}</strong> / {row.usageLimit}
  </span>
);

const datesCell = (row) => (
  <div className="text-[11px] text-gray-500 font-mono">
    <span>{row.startDate} to {row.endDate}</span>
    {row.isExpired && <p className="text-rose-600 font-sans font-semibold mt-0.5">Expired</p>}
  </div>
);

// Dates are edited as local calendar days: a coupon runs from 00:00 on its start day to 23:59:59 on its expiry day.
const toDateInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const dateInputOffset = (years = 0) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + years);
  return toDateInput(d.toISOString());
};
const emptyForm = () => ({
  code: '',
  discountType: 'Percentage',
  discountValue: 10,
  minOrderAmount: '',
  maxDiscountAmount: '',
  startDate: dateInputOffset(0),
  endDate: dateInputOffset(1),
  usageLimit: 100,
  usedCount: 0,
  status: 'Active',
});

const statusCell = (row, loading, handleToggleStatus) => (
  <button
    onClick={() => handleToggleStatus(row)}
    title="Click to toggle status"
    disabled={loading}
  >
    <StatusBadge status={row.status} />
  </button>
);

const toCouponView = (coupon) => ({
  ...coupon,
  discountType: coupon.discountType === 'PERCENTAGE' ? 'Percentage' : 'Flat',
  minOrderAmount: coupon.minimumOrderAmount,
  maxDiscountAmount: coupon.maximumDiscountAmount ?? '',
  startDate: toDateInput(coupon.startDate),
  endDate: toDateInput(coupon.expiryDate),
  isExpired: new Date(coupon.expiryDate) < new Date(),
  status: coupon.isActive ? 'Active' : 'Inactive',
});

const actionsCell = (row, loading, editingCoupon, deleteTarget, openEditModal, setDeleteTarget) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => openEditModal(row)}
      disabled={loading}
      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50"
      title="Edit Coupon"
    >
      {loading && editingCoupon?.id === row.id ? <Loader2 size={14} className="animate-spin" /> : <Edit2 size={14} />}
    </button>
    <button
      onClick={() => setDeleteTarget(row)}
      disabled={loading}
      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-rose-600 hover:text-white transition-colors disabled:opacity-50"
      title="Delete Coupon"
    >
      {loading && deleteTarget?.id === row.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  </div>
);

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const [formData, setFormData] = useState(emptyForm);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminCouponService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (response.success) {
        setCoupons((response.data || []).map(toCouponView));
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 1,
        }));
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openAddModal = () => {
    setEditingCoupon(null);
    setErrorMsg('');
    setFormData(emptyForm());
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCoupon(c);
    setErrorMsg('');
    setFormData({ ...c });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      let response;
      const formattedCode = formData.code.trim().toUpperCase();

      // Validation
      if (!formattedCode) {
        setErrorMsg('Coupon code is required.');
        setLoading(false);
        return;
      }
      if (formData.discountType === 'Percentage' && Number(formData.discountValue) > 100) {
        setErrorMsg('Percentage discount cannot exceed 100%.');
        setLoading(false);
        return;
      }
      if (Number(formData.discountValue) <= 0) {
        setErrorMsg('Discount value must be greater than 0.');
        setLoading(false);
        return;
      }
      if (formData.endDate < formData.startDate) {
        setErrorMsg('Expiry date cannot be before the start date.');
        setLoading(false);
        return;
      }
      if (!Number.isInteger(Number(formData.usageLimit)) || Number(formData.usageLimit) <= 0) {
        setErrorMsg('Usage limit must be a whole number greater than 0.');
        setLoading(false);
        return;
      }
      if (formData.minOrderAmount !== '' && Number(formData.minOrderAmount) < 0) {
        setErrorMsg('Minimum order value cannot be negative.');
        setLoading(false);
        return;
      }
      const isPercentage = formData.discountType === 'Percentage';
      if (isPercentage && formData.maxDiscountAmount !== '' && Number(formData.maxDiscountAmount) <= 0) {
        setErrorMsg('Maximum discount must be greater than 0, or left empty for no cap.');
        setLoading(false);
        return;
      }

      const payload = {
        code: formattedCode,
        discountType: isPercentage ? 'PERCENTAGE' : 'FLAT',
        discountValue: Number(formData.discountValue),
        minimumOrderAmount: formData.minOrderAmount === '' ? 0 : Number(formData.minOrderAmount),
        // A flat coupon is its own cap, so the max only applies to percentage coupons.
        maximumDiscountAmount: isPercentage && formData.maxDiscountAmount !== '' ? Number(formData.maxDiscountAmount) : null,
        startDate: new Date(`${formData.startDate}T00:00:00`).toISOString(),
        expiryDate: new Date(`${formData.endDate}T23:59:59.999`).toISOString(),
        usageLimit: Number(formData.usageLimit),
        isActive: formData.status === 'Active',
      };

      response = editingCoupon
        ? await adminCouponService.update(editingCoupon.id, payload)
        : await adminCouponService.create(payload);

      if (response.success) {
        setToastMsg(editingCoupon ? 'Coupon updated successfully!' : 'Coupon created successfully!');
        fetchCoupons();
        setModalOpen(false);
        setTimeout(() => setToastMsg(''), 3000);
      } else {
        setErrorMsg(response.message);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);

    try {
      const response = await adminCouponService.delete(deleteTarget.id);
      if (response.success) {
        setCoupons(prev => prev.filter(c => c.id !== deleteTarget.id));
        setToastMsg('Coupon deleted.');
        setTimeout(() => setToastMsg(''), 3000);
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'Code', accessor: 'code', cell: codeCell },
    { header: 'Discount', cell: discountCell },
    { header: 'Min Order', accessor: 'minOrderAmount', cell: minOrderCell },
    { header: 'Usage', cell: usageCell },
    { header: 'Valid Dates', cell: datesCell },
    { header: 'Status', accessor: 'status', cell: (row) => statusCell(row, loading, handleToggleStatus) },
    { header: 'Actions', cell: (row) => actionsCell(row, loading, editingCoupon, deleteTarget, openEditModal, setDeleteTarget) },
  ];

  const handleToggleStatus = async (coupon) => {
    setLoading(true);
    try {
      const response = await adminCouponService.toggleStatus(coupon.id);
      if (response.success) {
        setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c));
        setToastMsg(`Coupon ${coupon.code} set to ${coupon.status === 'Active' ? 'Inactive' : 'Active'}`);
        setTimeout(() => setToastMsg(''), 3000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Coupon Code Management">
      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <X size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
        loading={loading}
        actionButton={
          <button
            onClick={openAddModal}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-xs disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            <span>Create Coupon</span>
          </button>
        }
        filterComponent={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={loading}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-gray-900 disabled:opacity-50"
          >
            <option value="ALL">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        }
        pagination={{
          currentPage: pagination.page,
          total: pagination.total,
          limit: pagination.limit,
          totalPages: pagination.totalPages,
          onPageChange: handlePageChange,
        }}
      />

      {/* Add / Edit Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setModalOpen(false)}
              disabled={loading}
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
                    <option value="Flat">Fixed Amount (₹)</option>
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
                    min="0.01"
                    max={formData.discountType === 'Percentage' ? 100 : undefined}
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                    placeholder="Optional — no minimum"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              {formData.discountType === 'Percentage' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Maximum Discount (₹)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxDiscountAmount: e.target.value }))}
                    placeholder="Optional — no cap"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">e.g. 10% off, capped at ₹200 on large orders.</p>
                </div>
              )}

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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Expiry Date *</label>
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
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-gray-900 hover:bg-black rounded-lg shadow-xs disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : 'Save Coupon'}
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
        loading={loading}
      />
    </AdminLayout>
  );
}
