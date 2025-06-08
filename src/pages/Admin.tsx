
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import OrderSearch from '@/components/admin/OrderSearch';
import InventoryManagement from '@/components/admin/InventoryManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Package, TrendingUp, LogOut, Warehouse } from 'lucide-react';

const Admin = () => {
  const { adminUser, isAdminLoggedIn, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeUsers: 2847,
    userGrowth: 18,
    totalOrders: 1234,
    orderGrowth: 12,
    monthlyRevenue: 89421,
    revenueGrowth: 24,
    productsInStock: 156
  });

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/admin/auth');
    }
  }, [isAdminLoggedIn, navigate]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5),
        totalOrders: prev.totalOrders + Math.floor(Math.random() * 3),
        monthlyRevenue: prev.monthlyRevenue + Math.floor(Math.random() * 100)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

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
                <CardTitle className="text-sm font-medium text-gray-300">Active Users</CardTitle>
                <Users className="h-4 w-4 text-brand-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-green-400">+{stats.userGrowth}% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-brand-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalOrders.toLocaleString()}</div>
                <p className="text-xs text-green-400">+{stats.orderGrowth}% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Monthly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-brand-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${stats.monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-green-400">+{stats.revenueGrowth}% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Products in Stock</CardTitle>
                <Warehouse className="h-4 w-4 text-brand-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.productsInStock}</div>
                <p className="text-xs text-gray-400">Across all series</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <OrderSearch />
            </div>
            <div>
              <InventoryManagement />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
