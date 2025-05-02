
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getProductById } from '@/data/products';

// Mock orders data - in a real app, this would come from a database
const mockOrders = [
  {
    id: 'order-1',
    customerId: 'cust-1',
    customerName: 'Mohamed Ahmed',
    customerEmail: 'mohamed@example.com',
    customerPhone: '+201234567890',
    shippingAddress: '123 Cairo Street, Nasr City',
    city: 'Cairo',
    paymentMethod: 'cod',
    status: 'pending',
    total: 16000,
    createdAt: '2025-05-01T10:30:00Z',
    items: [
      { productId: 't1-basic', quantity: 2, price: 6000 },
      { productId: 't1-pro', quantity: 1, price: 10000 }
    ]
  },
  {
    id: 'order-2',
    customerId: 'cust-2',
    customerName: 'Ahmed Hassan',
    customerEmail: 'ahmed@example.com',
    customerPhone: '+201987654321',
    shippingAddress: '456 Alexandria Street, Smouha',
    city: 'Alexandria',
    paymentMethod: 'online',
    status: 'completed',
    total: 12000,
    createdAt: '2025-04-28T14:45:00Z',
    items: [
      { productId: 't1-basic', quantity: 2, price: 6000 }
    ]
  }
];

// Mock products for stock management
const initialProducts = [
  { id: 't1-basic', name: 'T1', stock: 10 },
  { id: 't1-pro', name: 'T1 Pro', stock: 15 },
  { id: 't2', name: 'T2', stock: 8 },
  { id: 't2-pro', name: 'T2 Pro', stock: 12 },
  { id: 't3', name: 'T3', stock: 5 }
];

const Admin = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [products, setProducts] = useState(initialProducts);
  const [orders] = useState(mockOrders);
  
  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    setIsLoggedIn(adminLoggedIn);
    setIsCheckingAuth(false);
  }, []);
  
  const handleLogin = () => {
    if (username === 'mo123' && password === 'mo123') {
      localStorage.setItem('adminLoggedIn', 'true');
      setIsLoggedIn(true);
      toast.success('Admin login successful');
    } else {
      toast.error('Invalid credentials');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    toast.info('Admin logged out');
  };
  
  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, stock: newStock } 
          : product
      )
    );
    toast.success(`Stock updated for ${products.find(p => p.id === productId)?.name}`);
  };

  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="w-full max-w-md p-6 bg-gray-900/50 rounded-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block mb-2 text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full bg-brand-green hover:bg-brand-green/90 text-black"
              >
                Login
              </Button>
            </div>
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <Button 
              variant="outline" 
              className="border-gray-600 text-white bg-gray-800"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-8">
            <button
              className={`py-2 px-4 ${activeTab === 'orders' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400'}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'inventory' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400'}`}
              onClick={() => setActiveTab('inventory')}
            >
              Inventory
            </button>
          </div>
          
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
              
              {orders.length === 0 ? (
                <div className="bg-gray-900/50 rounded-lg p-6 text-center">
                  <p className="text-gray-400">No orders found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const formattedDate = new Date(order.createdAt).toLocaleString();
                    
                    return (
                      <div key={order.id} className="bg-gray-900/50 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold">Order #{order.id}</h3>
                            <p className="text-sm text-gray-400">{formattedDate}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-900 text-green-100' : 'bg-yellow-900 text-yellow-100'
                          }`}>
                            {order.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-2 text-brand-green">Customer Information</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-gray-400">Name:</span> {order.customerName}</p>
                              <p><span className="text-gray-400">Email:</span> {order.customerEmail}</p>
                              <p><span className="text-gray-400">Phone:</span> {order.customerPhone}</p>
                              <p><span className="text-gray-400">Address:</span> {order.shippingAddress}</p>
                              <p><span className="text-gray-400">City:</span> {order.city}</p>
                              <p><span className="text-gray-400">Payment:</span> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2 text-brand-green">Order Items</h4>
                            <div className="space-y-2">
                              {order.items.map((item) => {
                                const product = getProductById(item.productId);
                                
                                return (
                                  <div key={item.productId} className="flex justify-between">
                                    <span>{item.quantity} x {product ? product.name : item.productId}</span>
                                    <span>{(item.quantity * item.price).toLocaleString()} EGP</span>
                                  </div>
                                );
                              })}
                              <div className="border-t border-gray-700 pt-2 flex justify-between font-bold">
                                <span>Total</span>
                                <span>{order.total.toLocaleString()} EGP</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant={order.status === 'completed' ? 'outline' : 'default'}
                            className={order.status === 'completed' ? 
                              'border-gray-600 text-white bg-gray-800' : 
                              'bg-brand-green hover:bg-brand-green/90 text-black'}
                            size="sm"
                          >
                            {order.status === 'completed' ? 'View Details' : 'Mark as Completed'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Inventory Management</h2>
              
              <div className="bg-gray-900/50 rounded-lg p-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700">
                      <th className="pb-2">Product</th>
                      <th className="pb-2">Current Stock</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const [newStock, setNewStock] = useState(product.stock);
                      
                      return (
                        <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                          <td className="py-3">{product.name}</td>
                          <td className="py-3">{product.stock} units</td>
                          <td className="py-3 flex items-center space-x-2">
                            <Input 
                              type="number" 
                              min="0"
                              value={newStock}
                              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                              className="w-24 bg-gray-800 border-gray-700"
                            />
                            <Button
                              size="sm"
                              className="bg-brand-green hover:bg-brand-green/90 text-black"
                              onClick={() => updateProductStock(product.id, newStock)}
                            >
                              Update
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
