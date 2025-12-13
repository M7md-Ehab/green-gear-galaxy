import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import OrderSearch from '@/components/admin/OrderSearch';
import InventoryManagement from '@/components/admin/InventoryManagement';
import SpendingAnalytics from '@/components/admin/SpendingAnalytics';
import EmailActivity from '@/components/admin/EmailActivity';
import FeedbackManagement from '@/components/admin/FeedbackManagement';
import { Shield, Package, BarChart3, Mail, MessageSquare, ShoppingCart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Admin = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container-custom">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-brand-green/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-brand-green" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-400">Manage your store efficiently</p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="bg-gray-900 border border-gray-800 p-1 h-auto flex-wrap">
              <TabsTrigger 
                value="orders" 
                className="data-[state=active]:bg-brand-green data-[state=active]:text-black flex items-center gap-2 px-4 py-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger 
                value="inventory" 
                className="data-[state=active]:bg-brand-green data-[state=active]:text-black flex items-center gap-2 px-4 py-2"
              >
                <Package className="h-4 w-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-brand-green data-[state=active]:text-black flex items-center gap-2 px-4 py-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="feedback" 
                className="data-[state=active]:bg-brand-green data-[state=active]:text-black flex items-center gap-2 px-4 py-2"
              >
                <MessageSquare className="h-4 w-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger 
                value="emails" 
                className="data-[state=active]:bg-brand-green data-[state=active]:text-black flex items-center gap-2 px-4 py-2"
              >
                <Mail className="h-4 w-4" />
                Emails
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
              <OrderSearch />
            </TabsContent>

            <TabsContent value="inventory" className="mt-6">
              <InventoryManagement />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <SpendingAnalytics />
            </TabsContent>

            <TabsContent value="feedback" className="mt-6">
              <FeedbackManagement />
            </TabsContent>

            <TabsContent value="emails" className="mt-6">
              <EmailActivity />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
