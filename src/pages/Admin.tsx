
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { products } from '@/data/products';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";

// Using the products from data file
const initialProducts = products.map(product => ({
  id: product.id,
  name: product.name,
  stock: product.stock
}));

// Initial currencies
const initialCurrencies = [
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', exchangeRate: 1 },
  { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 0.032 },
  { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.030 },
  { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.025 }
];

const Admin = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState(initialProducts);
  const [currencies, setCurrencies] = useState(initialCurrencies);
  
  // Create a single state for all product stocks instead of using dynamic hook creation
  const [productStocks, setProductStocks] = useState({});
  
  // Initialize product stocks on component mount
  useEffect(() => {
    const initialStocks = {};
    products.forEach(product => {
      initialStocks[product.id] = product.stock;
    });
    setProductStocks(initialStocks);
    
    // Load saved currencies if they exist
    const savedCurrencies = localStorage.getItem('vlitrix-currencies');
    if (savedCurrencies) {
      setCurrencies(JSON.parse(savedCurrencies));
    }
  }, []);
  
  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    setIsLoggedIn(adminLoggedIn);
    setIsCheckingAuth(false);
  }, []);
  
  const handleLogin = () => {
    // Use the admin username/password that matches the default account
    if (username === 'admin' && password === 'admin123') {
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
  
  // Update product stock handler
  const updateProductStock = (productId, newStock) => {
    // Update products state
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, stock: newStock } 
          : product
      )
    );
    
    // Update productStocks state
    setProductStocks(prev => ({
      ...prev,
      [productId]: newStock
    }));
    
    toast.success(`Stock updated for ${products.find(p => p.id === productId)?.name}`);
  };
  
  // Handle stock input change
  const handleStockChange = (productId, value) => {
    setProductStocks(prev => ({
      ...prev,
      [productId]: parseInt(value) || 0
    }));
  };
  
  // Currency management
  const [newCurrency, setNewCurrency] = useState({ 
    code: '', 
    name: '', 
    symbol: '', 
    exchangeRate: 1 
  });
  
  const handleCurrencyChange = (index, field, value) => {
    const updatedCurrencies = [...currencies];
    updatedCurrencies[index] = {
      ...updatedCurrencies[index],
      [field]: field === 'exchangeRate' ? parseFloat(value) || 0 : value
    };
    setCurrencies(updatedCurrencies);
    
    // Save currencies to localStorage
    localStorage.setItem('vlitrix-currencies', JSON.stringify(updatedCurrencies));
    toast.success('Currency rates updated');
  };
  
  const addCurrency = () => {
    if (!newCurrency.code || !newCurrency.name || !newCurrency.symbol) {
      toast.error('Please fill in all currency fields');
      return;
    }
    
    const updatedCurrencies = [...currencies, newCurrency];
    setCurrencies(updatedCurrencies);
    localStorage.setItem('vlitrix-currencies', JSON.stringify(updatedCurrencies));
    
    // Reset new currency form
    setNewCurrency({ code: '', name: '', symbol: '', exchangeRate: 1 });
    toast.success('New currency added');
  };
  
  const removeCurrency = (index) => {
    if (currencies.length <= 1) {
      toast.error('Cannot remove the last currency');
      return;
    }
    
    const updatedCurrencies = currencies.filter((_, i) => i !== index);
    setCurrencies(updatedCurrencies);
    localStorage.setItem('vlitrix-currencies', JSON.stringify(updatedCurrencies));
    toast.success('Currency removed');
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
              
              <div className="text-center text-sm text-gray-400 pt-2">
                <p>Default admin credentials:</p>
                <p>Username: admin</p>
                <p>Password: admin123</p>
              </div>
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
              className={`py-2 px-4 ${activeTab === 'inventory' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400'}`}
              onClick={() => setActiveTab('inventory')}
            >
              Inventory
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'currencies' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400'}`}
              onClick={() => setActiveTab('currencies')}
            >
              Currencies
            </button>
          </div>
          
          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Inventory Management</h2>
              
              <div className="bg-gray-900/50 rounded-lg p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.stock} units</TableCell>
                        <TableCell className="flex items-center space-x-2">
                          <Input 
                            type="number" 
                            min="0"
                            value={productStocks[product.id] || 0}
                            onChange={(e) => handleStockChange(product.id, e.target.value)}
                            className="w-24 bg-gray-800 border-gray-700"
                          />
                          <Button
                            size="sm"
                            className="bg-brand-green hover:bg-brand-green/90 text-black"
                            onClick={() => updateProductStock(product.id, productStocks[product.id] || 0)}
                          >
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* Currencies Tab */}
          {activeTab === 'currencies' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Currency Management</h2>
              
              <div className="bg-gray-900/50 rounded-lg p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Exchange Rate (vs EGP)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencies.map((currency, index) => (
                      <TableRow key={currency.code}>
                        <TableCell>
                          <Input 
                            value={currency.code}
                            onChange={(e) => handleCurrencyChange(index, 'code', e.target.value)}
                            className="w-20 bg-gray-800 border-gray-700"
                            readOnly={currency.code === 'EGP'} // Base currency can't be changed
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={currency.name}
                            onChange={(e) => handleCurrencyChange(index, 'name', e.target.value)}
                            className="w-full bg-gray-800 border-gray-700"
                            readOnly={currency.code === 'EGP'} // Base currency can't be changed
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={currency.symbol}
                            onChange={(e) => handleCurrencyChange(index, 'symbol', e.target.value)}
                            className="w-16 bg-gray-800 border-gray-700"
                            readOnly={currency.code === 'EGP'} // Base currency can't be changed
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            step="0.001"
                            value={currency.exchangeRate}
                            onChange={(e) => handleCurrencyChange(index, 'exchangeRate', e.target.value)}
                            className="w-32 bg-gray-800 border-gray-700"
                            readOnly={currency.code === 'EGP'} // Base currency can't be changed
                          />
                        </TableCell>
                        <TableCell>
                          {currency.code !== 'EGP' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeCurrency(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-6 border-t border-gray-800 pt-6">
                  <h3 className="text-lg font-medium mb-4">Add New Currency</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Currency Code</label>
                      <Input 
                        placeholder="USD"
                        value={newCurrency.code}
                        onChange={(e) => setNewCurrency({...newCurrency, code: e.target.value.toUpperCase()})}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Currency Name</label>
                      <Input 
                        placeholder="US Dollar"
                        value={newCurrency.name}
                        onChange={(e) => setNewCurrency({...newCurrency, name: e.target.value})}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Currency Symbol</label>
                      <Input 
                        placeholder="$"
                        value={newCurrency.symbol}
                        onChange={(e) => setNewCurrency({...newCurrency, symbol: e.target.value})}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Exchange Rate (vs EGP)</label>
                      <Input 
                        type="number"
                        step="0.001"
                        placeholder="0.032"
                        value={newCurrency.exchangeRate}
                        onChange={(e) => setNewCurrency({...newCurrency, exchangeRate: parseFloat(e.target.value) || 0})}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={addCurrency}
                    className="mt-4 bg-brand-green hover:bg-brand-green/90 text-black"
                  >
                    Add Currency
                  </Button>
                  
                  <div className="mt-4 p-4 bg-gray-800/50 rounded-md">
                    <h4 className="font-medium text-brand-green mb-2">About Exchange Rates</h4>
                    <p className="text-sm text-gray-400">
                      Exchange rates are relative to Egyptian Pound (EGP). For example, if 1 EGP = 0.032 USD, enter 0.032 as the exchange rate for USD.
                      These rates will be used to calculate product prices in different currencies.
                    </p>
                  </div>
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
