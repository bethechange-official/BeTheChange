import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

import Home from './pages/Home';
import Shop from './pages/Shop';
import CategoryPage from './pages/CategoryPage';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin imports
import { ProtectedRoute } from './admin/components/ProtectedRoute';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminProducts from './admin/pages/AdminProducts';
import AddProduct from './admin/pages/AddProduct';
import EditProduct from './admin/pages/EditProduct';
import AdminCategories from './admin/pages/AdminCategories';
import AdminCoupons from './admin/pages/AdminCoupons';
import AdminCustomers from './admin/pages/AdminCustomers';
import AdminOrders from './admin/pages/AdminOrders';
import AdminOrderDetails from './admin/pages/AdminOrderDetails';
import AdminSettings from './admin/pages/AdminSettings';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Header />}
      
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
      </Routes>

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
