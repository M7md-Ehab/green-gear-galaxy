
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';

const CheckoutSuccess = () => {
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart when the success page loads
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            
            <h1 className="text-3xl font-bold">Order Confirmed!</h1>
            <p className="text-gray-400 text-lg">
              Thank you for your purchase. Your order has been successfully placed and will be processed shortly.
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-green-500" />
              <span className="text-gray-300">Order processing will begin within 24 hours</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-green-500" />
              <span className="text-gray-300">You'll receive tracking information via email</span>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              asChild 
              className="w-full bg-green-500 hover:bg-green-400 text-black font-medium"
            >
              <Link to="/">
                Return to Home
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              className="w-full border-gray-600 text-white hover:bg-gray-800"
            >
              <Link to="/products">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
