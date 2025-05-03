
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAuth, useAuthListener } from '@/hooks/use-auth';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCurrency } from '@/hooks/use-currency';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/data/products';
import ProductCard from '@/components/products/ProductCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';

interface Order {
  id: string;
  order_date: string;
  status: string;
  total_amount: number;
  payment_method: string;
  currency_code: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { currentCurrency } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Setup auth listener
  useAuthListener();
  
  useEffect(() => {
    // Check if logged in
    if (!isLoggedIn && !isLoading) {
      navigate('/auth');
      return;
    }

    // Fetch user's orders
    const fetchOrders = async () => {
      if (!user?.id) return;
      
      setLoadingOrders(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('order_date', { ascending: false });
          
        if (error) throw error;
        
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        toast.error('Failed to load your orders');
      } finally {
        setLoadingOrders(false);
      }
    };
    
    if (isLoggedIn && user) {
      fetchOrders();
    }
  }, [isLoggedIn, isLoading, navigate, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrencySymbol = (code: string) => {
    return code === currentCurrency.code ? 
      currentCurrency.symbol :
      code === 'USD' ? '$' : 
      code === 'EUR' ? '€' : 
      code === 'EGP' ? 'E£' : code;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Profile */}
            <div className="bg-gray-900/50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Profile</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="font-medium">{user?.user_metadata?.name || 'User'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Preferred Currency</p>
                  <p className="font-medium">{currentCurrency.name} ({currentCurrency.symbol})</p>
                </div>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
                    onClick={() => navigate('/account/edit')}
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Orders */}
            <div className="bg-gray-900/50 rounded-lg p-6 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
              {loadingOrders ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-green mx-auto mb-4"></div>
                  <p>Loading your orders...</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{formatDate(order.order_date)}</TableCell>
                          <TableCell className="font-mono">{order.id.substring(0, 8)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                              order.status === 'paid' ? 'bg-green-500/20 text-green-300' :
                              order.status === 'shipped' ? 'bg-blue-500/20 text-blue-300' :
                              order.status === 'delivered' ? 'bg-purple-500/20 text-purple-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getCurrencySymbol(order.currency_code)}{order.total_amount.toLocaleString()} {order.currency_code}
                          </TableCell>
                          <TableCell>
                            {order.payment_method === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>You haven't placed any orders yet.</p>
                  <Button 
                    onClick={() => navigate('/products')} 
                    variant="outline" 
                    className="mt-4 border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
                  >
                    Browse Products
                  </Button>
                </div>
              )}
            </div>
            
            {/* Wishlist */}
            <div className="bg-gray-900/50 rounded-lg p-6 md:col-span-3">
              <h2 className="text-xl font-bold mb-4">Your Wishlist</h2>
              {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Your wishlist is empty.</p>
                  <Button 
                    onClick={() => navigate('/products')} 
                    variant="outline" 
                    className="mt-4 border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
                  >
                    Browse Products
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
