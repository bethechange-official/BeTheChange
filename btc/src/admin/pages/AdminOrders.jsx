import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle2, ShoppingBag } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { adminStorage } from '../utils/localStorageHelpers';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setOrders(adminStorage.getOrders());
  }, []);

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updatedList = orders.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o);
    setOrders(updatedList);
    adminStorage.saveOrders(updatedList);
    setToastMsg(`Order ${orderId} updated to ${newStatus}`);
    setTimeout(() => setToastMsg(''), 3000);
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
          {row.id}
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
      cell: (row) => <span className="text-xs text-gray-500 font-mono">{row.orderDate}</span>
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
          className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 font-medium"
        >
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
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
        filterComponent={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-gray-900"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-gray-900"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        }
      />
    </AdminLayout>
  );
}
