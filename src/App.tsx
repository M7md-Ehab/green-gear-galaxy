
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

import { LanguageProvider } from '@/contexts/LanguageContext';
import IndexPage from '@/pages/Index';
import ProductDetail from '@/pages/ProductDetail';
import Products from '@/pages/Products';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import CheckoutSuccess from '@/pages/CheckoutSuccess';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import AccountEdit from '@/pages/account/AccountEdit';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';

// New pages
import ReturnPolicy from '@/pages/ReturnPolicy';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsAndConditions from '@/pages/TermsAndConditions';
import About from '@/pages/About';
import Contact from '@/pages/Contact';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/reset-password" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/account/edit" element={<AccountEdit />} />
          <Route path="/admin" element={<Admin />} />
          
          {/* New routes */}
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SonnerToaster position="top-center" richColors closeButton />
        <Toaster />
      </Router>
    </LanguageProvider>
  );
}

export default App;
