import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from '@/hooks/use-auth';
import RecentOrders from '@/components/dashboard/RecentOrders';
import WishlistSection from '@/components/dashboard/WishlistSection';
import { User, Settings, LogOut, ShoppingBag, Loader2, Mail, DollarSign, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="container-custom max-w-6xl">
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                      <p className="text-white font-medium truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Currency</p>
                      <p className="text-white font-medium">{currentCurrency.name} ({currentCurrency.symbol})</p>
                    </div>
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
                    <MessageSquare className="mr-3 h-4 w-4 text-brand-green" />
                    Send Feedback
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-gray-700 text-white bg-gray-800/50 hover:bg-gray-700"
                    onClick={() => navigate('/currency-settings')}
                  >
                    <DollarSign className="mr-3 h-4 w-4 text-brand-green" />
                    Currency Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Wishlist - Mobile Only */}
              <div className="lg:hidden">
                <WishlistSection />
              </div>
            </div>

            {/* Center Column - Recent Orders */}
            <div className="lg:col-span-2 space-y-6">
              <RecentOrders />
              
              {/* Wishlist - Desktop */}
              <div className="hidden lg:block">
                <WishlistSection />
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
