
import { useState, useEffect } from 'react';
import { products } from '@/data/products';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [productStock, setProductStock] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Load product stock data on mount
  useEffect(() => {
    const initialStock: Record<string, number> = {};
    products.forEach(product => {
      initialStock[product.id] = product.stock;
    });
    setProductStock(initialStock);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Updated to use mo123/mo123
    if (username === 'mo123' && password === 'mo123') {
      setIsAuthenticated(true);
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid username or password",
      });
    }
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProductStock(prev => ({
      ...prev,
      [productId]: newStock
    }));
  };

  const handleSaveChanges = () => {
    // In a real app, this would save to your backend
    // For now, we'll just show a toast
    toast({
      title: "Changes saved",
      description: "Product stock has been updated.",
    });
    // Update products in memory (in a real app, this would be persistent)
    products.forEach(product => {
      if (productStock[product.id] !== undefined) {
        product.stock = productStock[product.id];
      }
    });
    
    // Simulate email notification
    toast({
      title: "Notification sent",
      description: `Inventory update email sent to mohamed.ehab.work0@gmail.com`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-center mb-8">Admin Login</h1>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-gray-900 border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-900 border-gray-700"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-brand-green text-black hover:bg-brand-green/90">
                  Login
                </Button>
              </form>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <Button 
                  onClick={handleSaveChanges}
                  className="bg-brand-green text-black hover:bg-brand-green/90"
                >
                  Save All Changes
                </Button>
              </div>
              
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Inventory Management</h2>
                <div className="bg-gray-900 rounded-lg p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4">ID</th>
                          <th className="text-left py-3 px-4">Product</th>
                          <th className="text-left py-3 px-4">Series</th>
                          <th className="text-left py-3 px-4">Price</th>
                          <th className="text-left py-3 px-4">Stock</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b border-gray-800">
                            <td className="py-3 px-4 text-gray-400">{product.id}</td>
                            <td className="py-3 px-4">{product.name}</td>
                            <td className="py-3 px-4 text-gray-400">{product.series}</td>
                            <td className="py-3 px-4">{product.price.toLocaleString()} EGP</td>
                            <td className="py-3 px-4">
                              <Input
                                type="number"
                                min="0"
                                className="w-24 bg-gray-800 border-gray-700"
                                value={productStock[product.id] || 0}
                                onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value) || 0)}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <Button 
                                variant="outline"
                                size="sm" 
                                className="border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
                              >
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Orders</h2>
                <div className="bg-gray-900 rounded-lg p-6">
                  <p className="text-gray-400 italic">No orders found. Orders will appear here when customers make purchases.</p>
                </div>
              </div>
              
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Users</h2>
                <div className="bg-gray-900 rounded-lg p-6">
                  <p className="text-gray-400 italic">No users found. Users will appear here when they register.</p>
                </div>
              </div>
              
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Send Notification</h2>
                <div className="bg-gray-900 rounded-lg p-6">
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="Notification Subject"
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Enter your message here..."
                        className="bg-gray-800 border-gray-700 h-32"
                      />
                    </div>
                    <Button type="submit" className="bg-brand-green text-black hover:bg-brand-green/90">
                      Send Notification
                    </Button>
                  </form>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4">Email Settings</h2>
                <div className="bg-gray-900 rounded-lg p-6">
                  <p className="mb-4">
                    Notification email: <strong>mohamed.ehab.work0@gmail.com</strong>
                  </p>
                  <Button className="bg-brand-green text-black hover:bg-brand-green/90">
                    Update Email Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
