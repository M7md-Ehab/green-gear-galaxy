
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-firebase-auth';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCurrency } from '@/hooks/use-currency';
import { Product } from '@/data/products';
import ProductCard from '@/components/products/ProductCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { currentCurrency } = useCurrency();
  
  useEffect(() => {
    // Check if logged in
    if (!isLoggedIn && !isLoading) {
      navigate('/auth');
    }
  }, [isLoggedIn, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
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
          <h1 className="text-4xl font-bold mb-8 gradient-text">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            {/* User Profile */}
            <div className="bg-gray-900/50 rounded-lg p-6 tech-border">
              <h2 className="text-xl font-bold mb-4 text-brand-green">Profile</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="font-medium">{user?.displayName || 'User'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email Verified</p>
                  <p className="font-medium">{user?.emailVerified ? 'Yes' : 'No'}</p>
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
            
            {/* Wishlist */}
            <div className="bg-gray-900/50 rounded-lg p-6 tech-border">
              <h2 className="text-xl font-bold mb-4 text-brand-green">Your Wishlist</h2>
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
