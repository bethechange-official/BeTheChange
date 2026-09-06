import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle2, X } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { adminOrderService } from '../../services/admin/orderService';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminOrderService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        orderStatus: orderStatusFilter !== 'ALL' ? orderStatusFilter : undefined,
        paymentStatus: paymentStatusFilter !== 'ALL' ? paymentStatusFilter : undefined,
      });
      if (response.success) {
        setOrders(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 1,
        }));
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, orderStatusFilter, paymentStatusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      const response = await adminOrderService.updateStatus(orderId, { orderStatus: newStatus });
      if (response.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
        setToastMsg(`Order ${orderId} updated to ${newStatus}`);
        setTimeout(() => setToastMsg(''), 3000);
      } else {
        setError(response.message);
        fetchOrders(); // Refresh to reset UI
      }
    } catch (err) {
      setError(err.message || 'Failed to update order');
      fetchOrders(); // Refresh to reset UI
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const query = search.toLowerCase();
    const matchesSearch = o.id.toLowerCase().includes(query) ||
                          o.customerName.toLowerCase().includes(query) ||
                          o.customerEmail.toLowerCase().includes(query);

    const matchesOrderStatus = orderStatusFilter === 'ALL' || o.orderStatus === orderStatusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'ALL' || o.paymentStatus === paymentStatusFilter;

    return matchesSearch && matchesOrderStatus && matchesPaymentStatus;
  });

  const columns = [
    {
      header: 'Order ID',
      accessor: 'id',
      cell: (row) => (
        <Link to={`/admin/orders/${row.id}`} className="font-mono font-bold text-gray-900 hover:underline">
          {row.orderNumber || row.id}
        </Link>
      )
    },
    {
      header: 'Customer',
      cell: (row) => (
        <div>
          <p className="font-bold text-gray-900">{row.customerName}</p>
          <p className="text-[10px] text-gray-400 font-mono">{row.customerEmail}</p>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'orderDate',
      cell: (row) => <span className="text-xs text-gray-500 font-mono">{new Date(row.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
    },
    {
      header: 'Items',
      cell: (row) => (
        <span className="text-xs text-gray-700">
          {row.items?.length || 1} item(s)
        </span>
      )
    },
    {
      header: 'Total Amount',
      accessor: 'totalAmount',
      cell: (row) => (
        <span className="font-bold text-gray-900 text-sm">
          ₹{row.totalAmount?.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Payment Method',
      accessor: 'paymentMethod',
      cell: (row) => (
        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
          {row.paymentMethod}
        </span>
      )
    },
    {
      header: 'Payment Status',
      accessor: 'paymentStatus',
      cell: (row) => <StatusBadge status={row.paymentStatus} type="order" />
    },
    {
      header: 'Order Status',
      cell: (row) => (
        <select
          value={row.orderStatus}
          onChange={(e) => handleUpdateOrderStatus(row.id, e.target.value)}
          disabled={loading}
          className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 font-medium disabled:opacity-50"
        >
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <Link
          to={`/admin/orders/${row.id}`}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white transition-colors inline-block"
          title="View Details"
        >
          <Eye size={14} />
        </Link>
      )
    }
  ];

  return (
    <AdminLayout title="Order Management">
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
        data={filteredOrders}
        searchPlaceholder="Search order ID or customer name..."
        searchValue={search}
        onSearchChange={setSearch}
        loading={loading}
        filterComponent={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              disabled={loading}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-gray-900 disabled:opacity-50"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              disabled={loading}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-gray-900 disabled:opacity-50"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        }
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          onPageChange: (page) => setPagination(prev => ({ ...prev, page: page })),
        }}
      />
    </AdminLayout>
  );
}
