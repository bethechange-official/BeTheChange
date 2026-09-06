import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Account = lazy(() => import('./pages/Account'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ProtectedRoute = lazy(() => import('./admin/components/ProtectedRoute').then((module) => ({ default: module.ProtectedRoute })));
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminProducts = lazy(() => import('./admin/pages/AdminProducts'));
const AddProduct = lazy(() => import('./admin/pages/AddProduct'));
const EditProduct = lazy(() => import('./admin/pages/EditProduct'));
const AdminCategories = lazy(() => import('./admin/pages/AdminCategories'));
const AdminCoupons = lazy(() => import('./admin/pages/AdminCoupons'));
const AdminCustomers = lazy(() => import('./admin/pages/AdminCustomers'));
const AdminOrders = lazy(() => import('./admin/pages/AdminOrders'));
const AdminOrderDetails = lazy(() => import('./admin/pages/AdminOrderDetails'));
const AdminSettings = lazy(() => import('./admin/pages/AdminSettings'));

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Header />}
      
      <Suspense fallback={<main className="min-h-screen flex items-center justify-center">Loading…</main>}>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<Account />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/products/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
        <Route path="/admin/products/edit/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/coupons" element={<ProtectedRoute><AdminCoupons /></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/orders/:id" element={<ProtectedRoute><AdminOrderDetails /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

        {/* 404 Catch All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>

      {!isAdminRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
