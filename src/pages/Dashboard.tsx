import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from '@/hooks/use-auth';
import { Product } from '@/data/products';
import ProductCard from '@/components/products/ProductCard';
import RecentOrders from '@/components/dashboard/RecentOrders';
import { User, Heart, Settings, LogOut, ShoppingBag, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Dashboard = () => {
  const navigate = useNavigate();
  const { items: wishlistItems } = useWishlist();
  const { currentCurrency } = useCurrency();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-8 md:py-12">
        <div className="container-custom">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 bg-brand-green/20 border-2 border-brand-green">
                <AvatarFallback className="text-brand-green text-2xl font-bold bg-transparent">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Welcome back!</h1>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full md:w-auto"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Profile & Quick Actions */}
            <div className="space-y-6">
              {/* Account Card */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <User className="h-5 w-5 text-brand-green" />
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="text-white font-medium truncate">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Preferred Currency</p>
                    <p className="text-white font-medium">{currentCurrency.name} ({currentCurrency.symbol})</p>
                  </div>
                  <Separator className="bg-gray-800" />
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-700 text-white bg-gray-800/50 hover:bg-gray-700"
                    onClick={() => navigate('/account/edit')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-gray-700 text-white bg-gray-800/50 hover:bg-gray-700"
                    onClick={() => navigate('/products')}
                  >
                    <ShoppingBag className="mr-3 h-4 w-4 text-brand-green" />
                    Browse Products
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-gray-700 text-white bg-gray-800/50 hover:bg-gray-700"
                    onClick={() => navigate('/contact')}
                  >
                    <User className="mr-3 h-4 w-4 text-brand-green" />
                    Contact Support
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-gray-700 text-white bg-gray-800/50 hover:bg-gray-700"
                    onClick={() => navigate('/currency-settings')}
                  >
                    <Settings className="mr-3 h-4 w-4 text-brand-green" />
                    Currency Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Wishlist Preview - Mobile */}
              <div className="lg:hidden">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <Heart className="h-5 w-5 text-brand-green" />
                      Wishlist ({wishlistItems.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {wishlistItems.length > 0 ? (
                      <div className="space-y-3">
                        {wishlistItems.slice(0, 2).map((product: Product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                        {wishlistItems.length > 2 && (
                          <Button 
                            onClick={() => navigate('/products')} 
                            variant="outline" 
                            className="w-full border-gray-700 text-white bg-gray-800/50 hover:bg-gray-700"
                          >
                            View All ({wishlistItems.length} items)
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        <Heart className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Your wishlist is empty</p>
                        <Button 
                          onClick={() => navigate('/products')} 
                          variant="link" 
                          className="text-brand-green mt-2"
                        >
                          Browse Products
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Center Column - Recent Orders */}
            <div className="lg:col-span-2 space-y-6">
              <RecentOrders />
            </div>
          </div>

          {/* Wishlist - Desktop Sidebar */}
          <div className="hidden lg:block fixed right-4 top-24 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
              <CardHeader className="pb-3 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Heart className="h-5 w-5 text-brand-green" />
                  Wishlist ({wishlistItems.length})
                </CardTitle>
                <CardDescription className="text-gray-400 text-xs">
                  Your saved items
                </CardDescription>
              </CardHeader>
              <CardContent>
                {wishlistItems.length > 0 ? (
                  <div className="space-y-3">
                    {wishlistItems.slice(0, 4).map((product: Product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                    {wishlistItems.length > 4 && (
                      <Button 
                        onClick={() => navigate('/products')} 
                        variant="outline" 
                        className="w-full border-gray-700 text-white bg-gray-800/50 hover:bg-gray-700"
                      >
                        View All ({wishlistItems.length} items)
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Your wishlist is empty</p>
                    <Button 
                      onClick={() => navigate('/products')} 
                      variant="link" 
                      className="text-brand-green mt-2"
                    >
                      Browse Products
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
