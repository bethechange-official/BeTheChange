import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle2, MapPin, User, CreditCard, Clock } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { StatusBadge } from '../components/StatusBadge';
import { adminStorage } from '../utils/localStorageHelpers';

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const orders = adminStorage.getOrders();
    const found = orders.find(o => o.id === id);

    if (found) {
      setOrder(found);
    } else {
      navigate('/admin/orders');
    }
  }, [id, navigate]);

  if (!order) return null;

  const handleStatusChange = (newStatus) => {
    const updatedOrder = { ...order, orderStatus: newStatus };
    setOrder(updatedOrder);

    const orders = adminStorage.getOrders();
    const updatedList = orders.map(o => o.id === id ? updatedOrder : o);
    adminStorage.saveOrders(updatedList);

    setToastMsg(`Order status updated to ${newStatus}`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handlePaymentStatusChange = (newPayStatus) => {
    const updatedOrder = { ...order, paymentStatus: newPayStatus };
    setOrder(updatedOrder);

    const orders = adminStorage.getOrders();
    const updatedList = orders.map(o => o.id === id ? updatedOrder : o);
    adminStorage.saveOrders(updatedList);

    setToastMsg(`Payment status updated to ${newPayStatus}`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <AdminLayout title={`Order Details: ${order.id}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Back Link & Print Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 uppercase tracking-wider"
          >
            <ArrowLeft size={16} />
            <span>Back to Orders</span>
          </Link>

          <button
            onClick={handlePrintInvoice}
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider shadow-xs"
          >
            <Printer size={15} />
            <span>Print Invoice</span>
          </button>
        </div>

        {toastMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 print:hidden">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Printable Invoice Header */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-100 pb-6 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Order Invoice</span>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mt-1">{order.id}</h2>
              <p className="text-xs text-gray-500 font-mono mt-1">Placed on {order.orderDate}</p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Order Status:</span>
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 font-bold focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Payment Status:</span>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 font-bold focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2 border-b border-gray-200/60 pb-1.5">
                <User size={14} className="text-gray-500" />
                <span>Customer Details</span>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{order.customerName}</p>
              <p className="text-gray-600">Email: {order.customerEmail}</p>
              <p className="text-gray-600">Phone: {order.customerPhone}</p>
            </div>

            <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2 border-b border-gray-200/60 pb-1.5">
                <MapPin size={14} className="text-gray-500" />
                <span>Shipping Address</span>
              </div>
              <p className="text-gray-800 leading-relaxed font-light">
                {order.shippingAddress?.addressLine1}, {order.shippingAddress?.addressLine2}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 font-serif">Order Items</h3>
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase text-[10px] tracking-wider text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="py-3 px-3">Item Description</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 px-3 text-right">Qty</th>
                  <th className="py-3 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3.5 px-3 font-semibold text-gray-900">{item.name}</td>
                    <td className="py-3.5 px-3 text-right">₹{item.price?.toLocaleString()}</td>
                    <td className="py-3.5 px-3 text-right font-bold">{item.quantity}</td>
                    <td className="py-3.5 px-3 text-right font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="border-t border-gray-100 pt-4 flex justify-end">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Discount</span>
                <span>-₹{order.discount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span>₹{order.shippingFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-gray-900 border-t border-gray-200 pt-2">
                <span>Total Paid</span>
                <span>₹{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
