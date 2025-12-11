import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCurrency } from '@/hooks/use-currency';
import { Product } from '@/data/products';
import ProductCard from '@/components/products/ProductCard';
import RecentOrders from '@/components/dashboard/RecentOrders';

const Dashboard = () => {
  const navigate = useNavigate();
  const { items: wishlistItems } = useWishlist();
  const { currentCurrency } = useCurrency();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-8 gradient-text">Dashboard</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile & Orders */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Profile */}
              <div className="bg-gray-900/50 rounded-lg p-6 tech-border">
                <h2 className="text-xl font-bold mb-4 text-brand-green">Profile</h2>
                <div className="space-y-4">
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
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <RecentOrders />
            </div>

            {/* Right Column - Wishlist */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 rounded-lg p-6 tech-border sticky top-4">
                <h2 className="text-xl font-bold mb-4 text-brand-green">Your Wishlist</h2>
                {wishlistItems.length > 0 ? (
                  <div className="space-y-4">
                    {wishlistItems.slice(0, 3).map((product: Product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                    {wishlistItems.length > 3 && (
                      <Button 
                        onClick={() => navigate('/products')} 
                        variant="outline" 
                        className="w-full border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
                      >
                        View All ({wishlistItems.length} items)
                      </Button>
                    )}
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
