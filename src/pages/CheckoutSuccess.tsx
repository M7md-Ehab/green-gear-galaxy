
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  
  // If someone tries to access this page directly without checking out, redirect them
  useEffect(() => {
    // Instead of conditionally calling hooks, we always set up a timer
    // and handle the logic inside the effect
    const timer = setTimeout(() => {
      if (items.length > 0) {
        navigate('/checkout');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [items.length, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12 flex items-center">
        <div className="container-custom max-w-md mx-auto text-center">
          <div className="bg-gray-900/50 rounded-lg p-8">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-24 w-24 text-brand-green" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
            
            <p className="text-gray-300 mb-8">
              Thank you for your purchase. We've sent you an email with your order details.
            </p>
            
            <div className="space-y-4">
              <Button asChild className="w-full bg-brand-green hover:bg-brand-green/90 text-black">
                <Link to="/products">Continue Shopping</Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
