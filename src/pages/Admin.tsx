import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import OrderSearch from '@/components/admin/OrderSearch';
import InventoryManagement from '@/components/admin/InventoryManagement';
import SpendingAnalytics from '@/components/admin/SpendingAnalytics';
import EmailActivity from '@/components/admin/EmailActivity';
import EmailTemplates from '@/components/admin/EmailTemplates';
import FeedbackManagement from '@/components/admin/FeedbackManagement';
import CurrencySelector from '@/components/CurrencySelector';
import { Sparkles, Shield, Package, BarChart3, Mail, MessageSquare, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

const Admin = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-green to-emerald-600 flex items-center justify-center shadow-lg shadow-brand-green/20">
                <LayoutDashboard className="h-7 w-7 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-400">Manage your store, orders, and inventory</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-lg px-2 py-1">
              <span className="text-xs text-gray-400 pl-2">Currency:</span>
              <CurrencySelector />
            </div>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="orders" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-2">
                <TabsList className="bg-transparent border-0 p-0 h-auto flex flex-wrap gap-2">
                  <TabsTrigger 
                    value="orders" 
                    className="data-[state=active]:bg-brand-green data-[state=active]:text-black data-[state=inactive]:bg-gray-800/50 data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:bg-gray-800 flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="font-medium">Orders</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="inventory" 
                    className="data-[state=active]:bg-brand-green data-[state=active]:text-black data-[state=inactive]:bg-gray-800/50 data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:bg-gray-800 flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200"
                  >
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Inventory</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics" 
                    className="data-[state=active]:bg-brand-green data-[state=active]:text-black data-[state=inactive]:bg-gray-800/50 data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:bg-gray-800 flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="font-medium">Analytics</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="feedback" 
                    className="data-[state=active]:bg-brand-green data-[state=active]:text-black data-[state=inactive]:bg-gray-800/50 data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:bg-gray-800 flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">Feedback</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="templates" 
                    className="data-[state=active]:bg-brand-green data-[state=active]:text-black data-[state=inactive]:bg-gray-800/50 data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:bg-gray-800 flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">Templates</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="emails" 
                    className="data-[state=active]:bg-brand-green data-[state=active]:text-black data-[state=inactive]:bg-gray-800/50 data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:bg-gray-800 flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Emails</span>
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>

            <TabsContent value="orders" className="mt-6 animate-in fade-in-50 duration-300">
              <OrderSearch />
            </TabsContent>

            <TabsContent value="inventory" className="mt-6 animate-in fade-in-50 duration-300">
              <InventoryManagement />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6 animate-in fade-in-50 duration-300">
              <SpendingAnalytics />
            </TabsContent>

            <TabsContent value="feedback" className="mt-6 animate-in fade-in-50 duration-300">
              <FeedbackManagement />
            </TabsContent>

            <TabsContent value="templates" className="mt-6 animate-in fade-in-50 duration-300">
              <EmailTemplates />
            </TabsContent>

            <TabsContent value="emails" className="mt-6 animate-in fade-in-50 duration-300">
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
