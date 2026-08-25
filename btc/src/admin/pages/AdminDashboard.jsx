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

const STATUS_COLORS = {
  Pending: '#F59E0B',
  Processing: '#3B82F6',
  Shipped: '#8B5CF6',
  Delivered: '#10B981',
  Cancelled: '#EF4444'
};

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [settings, setSettings] = useState({});
  const [hoveredMonth, setHoveredMonth] = useState(null);

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

  // Order status breakdown data
  const orderStatusPie = [
    { name: 'Pending', value: orders.filter(o => o.orderStatus === 'Pending').length, color: STATUS_COLORS.Pending },
    { name: 'Processing', value: orders.filter(o => o.orderStatus === 'Processing').length, color: STATUS_COLORS.Processing },
    { name: 'Shipped', value: orders.filter(o => o.orderStatus === 'Shipped').length, color: STATUS_COLORS.Shipped },
    { name: 'Delivered', value: orders.filter(o => o.orderStatus === 'Delivered').length, color: STATUS_COLORS.Delivered },
    { name: 'Cancelled', value: orders.filter(o => o.orderStatus === 'Cancelled').length, color: STATUS_COLORS.Cancelled }
  ].filter(item => item.value > 0);

  const totalStatusOrders = orderStatusPie.reduce((acc, curr) => acc + curr.value, 0) || 1;

  // SVG calculations for Revenue Area Chart
  const maxSales = Math.max(...monthlySalesData.map(d => d.sales));
  const minSales = 0;
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 20;

  const points = monthlySalesData.map((d, i) => {
    const x = paddingX + (i * (svgWidth - 2 * paddingX)) / (monthlySalesData.length - 1);
    const y = svgHeight - paddingY - ((d.sales - minSales) * (svgHeight - 2 * paddingY)) / maxSales;
    return { x, y, ...d };
  });

  const linePath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  // Donut chart stroke dashoffset calculations
  let accumulatedPercent = 0;

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

      {/* 2. Native SVG Charts Section */}
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

          {/* SVG Area Chart */}
          <div className="relative w-full overflow-hidden">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111111" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#111111" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = paddingY + ratio * (svgHeight - 2 * paddingY);
                return (
                  <line
                    key={idx}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Filled Area */}
              <path d={areaPath} fill="url(#areaGradient)" />

              {/* Smooth Line */}
              <path d={linePath} fill="none" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />

              {/* Data Points */}
              {points.map((p, idx) => (
                <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredMonth(p)} onMouseLeave={() => setHoveredMonth(null)}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredMonth?.month === p.month ? 6 : 4}
                    fill={hoveredMonth?.month === p.month ? '#111111' : '#ffffff'}
                    stroke="#111111"
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                  <text
                    x={p.x}
                    y={svgHeight - 4}
                    textAnchor="middle"
                    className="text-[10px] font-sans fill-gray-500 font-medium"
                  >
                    {p.month}
                  </text>
                </g>
              ))}
            </svg>

            {/* Interactive Tooltip Overlay */}
            {hoveredMonth && (
              <div
                className="absolute bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs shadow-lg pointer-events-none -translate-x-1/2 -translate-y-full font-sans z-10"
                style={{
                  left: `${((hoveredMonth.x - paddingX) / (svgWidth - 2 * paddingX)) * 88 + 6}%`,
                  top: `${(hoveredMonth.y / svgHeight) * 100 - 10}%`
                }}
              >
                <p className="font-bold">{hoveredMonth.month}</p>
                <p className="text-[11px] text-gray-300">Revenue: <strong className="text-white">₹{hoveredMonth.sales.toLocaleString()}</strong></p>
                <p className="text-[11px] text-gray-300">Orders: <strong className="text-white">{hoveredMonth.orders}</strong></p>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Distribution Donut Chart */}
        <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 font-serif mb-1">Order Breakdown</h3>
            <p className="text-xs text-gray-500 font-light">Distribution across fulfillment stages</p>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative w-44 h-44 mx-auto my-4 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {orderStatusPie.map((item, idx) => {
                const percent = item.value / totalStatusOrders;
                const dashArray = `${percent * 283} 283`;
                const dashOffset = -accumulatedPercent * 283;
                accumulatedPercent += percent;

                return (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="10"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-500 hover:opacity-80"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-serif text-gray-900">{totalOrders}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Total Orders</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
            {orderStatusPie.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
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
