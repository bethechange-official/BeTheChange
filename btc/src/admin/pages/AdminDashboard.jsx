import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  AlertTriangle,
  Users,
  Tag,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { AdminLayout } from '../components/AdminLayout';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { adminStorage } from '../utils/localStorageHelpers';

const monthlySalesData = [
  { month: 'Mar', sales: 42000, orders: 48 },
  { month: 'Apr', sales: 58000, orders: 62 },
  { month: 'May', sales: 64000, orders: 75 },
  { month: 'Jun', sales: 71000, orders: 84 },
  { month: 'Jul', sales: 89000, orders: 104 },
  { month: 'Aug', sales: 112000, orders: 130 }
];

const COLORS = ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444'];

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    setProducts(adminStorage.getProducts());
    setOrders(adminStorage.getOrders());
    setCustomers(adminStorage.getCustomers());
    setCoupons(adminStorage.getCoupons());
    setSettings(adminStorage.getSettings());
  }, []);

  // Compute metrics
  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;
  const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
  const totalProducts = products.length;
  const lowStockThreshold = settings.lowStockAlertThreshold || 5;
  const lowStockProducts = products.filter(p => p.stock <= lowStockThreshold);
  const totalCustomers = customers.length;
  const activeCoupons = coupons.filter(c => c.status === 'Active').length;

  // Pie chart data
  const orderStatusPie = [
    { name: 'Pending', value: orders.filter(o => o.orderStatus === 'Pending').length },
    { name: 'Processing', value: orders.filter(o => o.orderStatus === 'Processing').length },
    { name: 'Shipped', value: orders.filter(o => o.orderStatus === 'Shipped').length },
    { name: 'Delivered', value: orders.filter(o => o.orderStatus === 'Delivered').length },
    { name: 'Cancelled', value: orders.filter(o => o.orderStatus === 'Cancelled').length }
  ].filter(item => item.value > 0);

  return (
    <AdminLayout title="Dashboard Overview">
      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Total Sales"
          value={`₹${totalSales.toLocaleString()}`}
          icon={DollarSign}
          change="18.4%"
          trend="up"
          description="vs last month"
          bgAccent="bg-gradient-to-br from-emerald-50/50 to-white"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          change="12.1%"
          trend="up"
          description="vs last month"
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          icon={Clock}
          description="Requires processing"
          bgAccent="bg-amber-50/30"
        />
        <StatCard
          title="Delivered Orders"
          value={deliveredOrders}
          icon={CheckCircle2}
          description="Completed orders"
        />
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          description="Active catalog"
        />
        <StatCard
          title="Low Stock Alert"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          description={`Stock <= ${lowStockThreshold} units`}
          bgAccent={lowStockProducts.length > 0 ? "bg-rose-50/40 border-rose-200" : "bg-white"}
        />
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          icon={Users}
          change="8.5%"
          trend="up"
          description="Registered buyers"
        />
        <StatCard
          title="Active Coupons"
          value={activeCoupons}
          icon={Tag}
          description="Promotional codes"
        />
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-8 bg-white border border-gray-200/80 rounded-xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 font-serif">Revenue & Growth</h3>
              <p className="text-xs text-gray-500 font-light">Monthly sales performance summary</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md">
              <TrendingUp size={14} />
              <span>+24.8% YoY</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111111" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#111111" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Sales']}
                  contentStyle={{ backgroundColor: '#111111', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#111111" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution Pie Chart */}
        <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 font-serif mb-1">Order Breakdown</h3>
            <p className="text-xs text-gray-500 font-light">Distribution across fulfillment stages</p>
          </div>

          <div className="h-52 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusPie}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {orderStatusPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} Orders`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
            {orderStatusPie.map((entry, idx) => (
              <div key={entry.name} className="flex items-center justify-between text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span>{entry.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Recent Orders & Low Stock Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Orders List */}
        <div className="lg:col-span-8 bg-white border border-gray-200/80 rounded-xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900 font-serif">Recent Orders</h3>
              <p className="text-xs text-gray-500 font-light">Latest incoming customer transactions</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold uppercase tracking-wider text-gray-900 hover:text-gray-600 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase text-[10px] tracking-wider text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-gray-900">
                      <Link to={`/admin/orders/${ord.id}`} className="hover:underline">{ord.id}</Link>
                    </td>
                    <td className="py-3 px-3">{ord.customerName}</td>
                    <td className="py-3 px-3 text-gray-400">{ord.orderDate}</td>
                    <td className="py-3 px-3 font-bold text-gray-900">₹{ord.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={ord.orderStatus} type="order" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning List */}
        <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900 font-serif">Low Stock Alert</h3>
              <p className="text-xs text-gray-500 font-light">Products requiring reorder</p>
            </div>
            <Link to="/admin/products" className="text-xs font-semibold uppercase tracking-wider text-gray-900 hover:text-gray-600 flex items-center gap-1">
              <span>Catalog</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">All product inventory levels healthy.</p>
            ) : (
              lowStockProducts.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-rose-50/40 border border-rose-100 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={p.images?.[0]} alt={p.name} className="w-9 h-9 rounded object-cover flex-shrink-0 bg-gray-100" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-500">{p.category}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-xs">
                      {p.stock} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
