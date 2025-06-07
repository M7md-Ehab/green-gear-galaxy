
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import OrderSearch from '@/components/admin/OrderSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Package, TrendingUp, LogOut } from 'lucide-react';

const Admin = () => {
  const { adminUser, isAdminLoggedIn, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/admin/auth');
    }
  }, [isAdminLoggedIn, navigate]);

  if (!isAdminLoggedIn) {
    return null;
  }

  const handleLogout = () => {
    adminLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-brand-green" />
              <div>
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-400 mt-1">Welcome back, {adminUser?.username}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
                <Users className="h-4 w-4 text-brand-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">1,234</div>
                <p className="text-xs text-gray-400">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-brand-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">567</div>
                <p className="text-xs text-gray-400">+8% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-brand-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">$45,678</div>
                <p className="text-xs text-gray-400">+15% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Active Products</CardTitle>
                <Package className="h-4 w-4 text-brand-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">12</div>
                <p className="text-xs text-gray-400">All series available</p>
              </CardContent>
            </Card>
          </div>

          <OrderSearch />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
