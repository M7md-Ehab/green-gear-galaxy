import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ShoppingCart, Package, Truck, CheckCircle, CreditCard, Shield } from 'lucide-react';

const HowToOrder = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">How to Order</h1>
          <p className="text-gray-300 text-center mb-12 text-lg">
            Follow these simple steps to place your order and receive your products
          </p>
          
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="bg-gray-900/50 rounded-lg p-6 flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-brand-green rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">1</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <ShoppingCart className="h-6 w-6 text-brand-green" />
                  <h2 className="text-xl font-bold">Browse & Select Products</h2>
                </div>
                <p className="text-gray-300">
                  Browse our catalog of gaming machines, vending solutions, and accessories. 
                  Add your desired products to the cart and proceed to checkout.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-900/50 rounded-lg p-6 flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-brand-green rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">2</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <CreditCard className="h-6 w-6 text-brand-green" />
                  <h2 className="text-xl font-bold">Complete Payment</h2>
                </div>
                <p className="text-gray-300">
                  Choose your preferred payment method and complete the secure checkout process. 
                  We accept various payment options for your convenience.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-900/50 rounded-lg p-6 flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-brand-green rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">3</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Package className="h-6 w-6 text-brand-green" />
                  <h2 className="text-xl font-bold">Order Processing</h2>
                </div>
                <p className="text-gray-300">
                  Your order will be processed within 24-48 hours. We'll send you a confirmation 
                  email with your order details and tracking information.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-gray-900/50 rounded-lg p-6 flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-brand-green rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">4</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Truck className="h-6 w-6 text-brand-green" />
                  <h2 className="text-xl font-bold">Shipping & Delivery</h2>
                </div>
                <p className="text-gray-300">
                  Your order will be carefully packaged and shipped to your address. 
                  Delivery times vary based on location and product availability.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-gray-900/50 rounded-lg p-6 flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-brand-green rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">5</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="h-6 w-6 text-brand-green" />
                  <h2 className="text-xl font-bold">Identity Verification Upon Delivery</h2>
                </div>
                <p className="text-gray-300">
                  <strong>Important:</strong> When your order arrives, you will need to provide your 
                  ID card number for verification purposes. This is a security measure to ensure 
                  the order reaches the correct recipient and for warranty registration.
                </p>
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    <strong>Note:</strong> Please have your government-issued ID ready when receiving your delivery. 
                    The delivery agent will verify your identity before completing the handover.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-gray-900/50 rounded-lg p-6 flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-brand-green rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">6</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-brand-green" />
                  <h2 className="text-xl font-bold">Enjoy Your Purchase</h2>
                </div>
                <p className="text-gray-300">
                  Once delivered and verified, you can start enjoying your new Vlitrix products! 
                  Don't forget to register for warranty and explore our support resources.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-12 bg-gray-900/30 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-brand-green">Important Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Shipping Times</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Standard delivery: 5-7 business days</li>
                  <li>• Express delivery: 2-3 business days</li>
                  <li>• Large machines: 7-14 business days</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Required for Delivery</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Government-issued photo ID</li>
                  <li>• Order confirmation number</li>
                  <li>• Delivery address verification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowToOrder;