
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash, ArrowRight } from 'lucide-react';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, cartTotal } = useCart();
  
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
          
          {isEmpty ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
              <p className="text-gray-400 mb-8">Browse our products and add something you like.</p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex flex-col sm:flex-row bg-gray-900/50 rounded-lg overflow-hidden">
                    {/* Product Image */}
                    <div className="sm:w-40 h-40 bg-black flex-shrink-0">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="object-contain w-full h-full p-4"
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4 flex-grow">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-bold">{item.product.name}</h3>
                        <button 
                          onClick={() => removeItem(item.product.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">{item.product.series}</p>
                      
                      <div className="flex flex-wrap justify-between items-end">
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 border-gray-600 text-white bg-gray-800"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="mx-3">{item.quantity}</span>
                          
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 border-gray-600 text-white bg-gray-800"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <p className="font-bold text-lg">
                          {(item.product.price * item.quantity).toLocaleString()} EGP
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-4">
                  <Button 
                    variant="outline"
                    className="border-gray-600 text-white bg-gray-800 hover:bg-gray-700" 
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                  
                  <Button asChild variant="outline" className="border-gray-600 text-white bg-gray-800 hover:bg-gray-700">
                    <Link to="/products">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-900/50 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span>{cartTotal().toLocaleString()} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t border-gray-700 pt-4 flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-lg">{cartTotal().toLocaleString()} EGP</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
                    size="lg"
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
