
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import IndexPage from '@/pages/Index';
import ProductDetail from '@/pages/ProductDetail';
import Products from '@/pages/Products';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import Dashboard from '@/pages/Dashboard';
import AccountEdit from '@/pages/account/AccountEdit';
import Admin from '@/pages/Admin';

import NotFound from '@/pages/NotFound';
import HowToOrder from '@/pages/HowToOrder';

// New pages
import ReturnPolicy from '@/pages/ReturnPolicy';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsAndConditions from '@/pages/TermsAndConditions';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Accessories from '@/pages/Accessories';

// Auth pages
import SignUp from '@/pages/auth/SignUp';
import Login from '@/pages/auth/Login';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/accessories" element={<Accessories />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          
          {/* Auth routes */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/account/edit" element={
            <ProtectedRoute>
              <AccountEdit />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          } />
          
          {/* New routes */}
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/how-to-order" element={<HowToOrder />} />
          
          <Route path="*" element={<NotFound />} />
          </Routes>
          <SonnerToaster position="top-center" richColors closeButton />
          <Toaster />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
