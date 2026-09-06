import { useState, useEffect, useCallback } from 'react';
import { Mail, Phone, ShoppingBag, DollarSign, Calendar, Eye, Loader2, X } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { adminCustomerService } from '../../services/admin/customerService';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminCustomerService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (response.success) {
        setCustomers(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 1,
        }));
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const filteredCustomers = customers.filter(c => {
    const query = search.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(query) ||
                          c.email.toLowerCase().includes(query) ||
                          c.phone.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'Customer',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-900 text-white font-serif font-bold text-xs flex items-center justify-center flex-shrink-0">
            {row.name ? row.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-tight">{row.name}</p>
            <p className="text-[10px] text-gray-400 font-mono">{row.id}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-gray-700">
            <Mail size={12} className="text-gray-400" />
            <span>{row.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
            <Phone size={12} className="text-gray-400" />
            <span>{row.phone}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Orders',
      accessor: 'totalOrders',
      cell: (row) => (
        <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">
          {row.totalOrders} orders
        </span>
      )
    },
    {
      header: 'Total Spent',
      accessor: 'totalSpent',
      cell: (row) => (
        <span className="font-bold text-emerald-700 text-sm">
          ₹{row.totalSpent?.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Joined Date',
      accessor: 'joinedDate',
      cell: (row) => <span className="font-mono text-xs text-gray-500">{row.joinedDate}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => setSelectedCustomer(row)}
          disabled={loading}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50"
          title="View Details"
        >
          {loading && selectedCustomer?.id === row.id ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
        </button>
      )
    }
  ];

  return (
    <AdminLayout title="Customer Directory">
      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <X size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredCustomers}
        searchPlaceholder="Search by name, email, phone..."
        searchValue={search}
        onSearchChange={setSearch}
        loading={loading}
        filterComponent={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={loading}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-gray-900 disabled:opacity-50"
          >
            <option value="ALL">All Customers</option>
            <option value="Active">Active Customers</option>
            <option value="Inactive">Inactive Customers</option>
          </select>
        }
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          onPageChange: (page) => setPagination(prev => ({ ...prev, page: page })),
        }}
      />

      {/* Customer Quick View Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-lg font-bold font-serif text-gray-900">Customer Details</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-700 p-1 text-xs font-semibold uppercase"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gray-900 text-white font-serif font-bold text-lg flex items-center justify-center">
                  {selectedCustomer.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900 leading-tight">{selectedCustomer.name}</h4>
                  <p className="text-xs text-gray-500 font-mono">{selectedCustomer.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-gray-400 uppercase text-[10px] tracking-wider mb-0.5">Total Orders</p>
                  <p className="font-bold text-gray-900 text-base">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-gray-400 uppercase text-[10px] tracking-wider mb-0.5">Total Spent</p>
                  <p className="font-bold text-emerald-700 text-base">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                <p><strong>Email:</strong> {selectedCustomer.email}</p>
                <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                <p><strong>Joined Date:</strong> {selectedCustomer.joinedDate}</p>
                <p><strong>Status:</strong> {selectedCustomer.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}