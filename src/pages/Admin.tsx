
import { useState } from 'react';
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
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // This is just a placeholder. In a real application, this would
    // connect to your backend authentication system
    if (username === 'admin' && password === 'admin123') {
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
              <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
              
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
