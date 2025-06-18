import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './page/HomePage';
import LoginPage from './page/LoginPage';
import RegisterPage from './page/RegisterPage';
import ProductDetailPage from './page/ProductDetailPage';
import ProfilePage from './page/ProfilePage';
import CartPage from './page/CartPage';
import CollectionPage from './page/CollectionPage';
import CheckoutPage from './page/CheckoutPage';
import PaymentSuccessPage from './page/PaymentSuccessPage';
import OrderPage from './page/OrderPage';
import AddressPage from './page/AddressPage';
import OrderDetail from './page/OrderDetail';
import AdminProductPage from './page/AdminProductPage';
import AdminOrderPage from './page/AdminOrderPage';
import AdminUserPage from './page/AdminUserPage';
import ProtectedRoute from './context/ProtectedRoute';
import AdminEditProduct from './page/AdminEditProduct';
import AdminRevenueDashboard from './page/AdminRevenueDashboard';
import AdminOrderDetail from './page/AdminOrderDetail';
import PasswordChangePage from './page/PasswordChangePage';

// Tạo một component wrapper để sử dụng useAuth
const AppContent = () => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/products/category/:category" element={<CollectionPage />} />
          <Route path="/product" element={<CollectionPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/address" element={<AddressPage />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/change-password" element={<PasswordChangePage/>}/>
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminEditProduct />
              </ProtectedRoute>
            }
          />
           <Route
            path="/admin/revenue-dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminRevenueDashboard/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminOrderDetail/>
              </ProtectedRoute>
            }
          />
          
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      
        <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;