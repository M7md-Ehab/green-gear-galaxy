
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useWishlist } from '@/hooks/use-wishlist';
import { Product } from '@/data/products';
import ProductCard from '@/components/products/ProductCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout, updateUserProfile } = useAuth();
  const { items: wishlistItems } = useWishlist();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    // Check if logged in
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }
    
    // Get user details
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [isLoggedIn, navigate, user]);

  const handleUpdateProfile = () => {
    updateUserProfile(name, email);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
                {isEditing ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="mt-1 bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <Input 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="mt-1 bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleUpdateProfile} 
                        className="flex-1 bg-brand-green text-black hover:bg-brand-green/90"
                      >
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="flex-1 border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <p className="font-medium">{name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-medium">{email}</p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
                        onClick={() => setIsEditing(true)}
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
                  </>
                )}
              </div>
            </div>
            
            {/* Orders */}
            <div className="bg-gray-900/50 rounded-lg p-6 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
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
