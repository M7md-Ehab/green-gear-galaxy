
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  
  useEffect(() => {
    // Check if logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      navigate('/auth');
      return;
    }
    
    // Get user details
    setUserName(localStorage.getItem('userName') || 'User');
    setUserEmail(localStorage.getItem('userEmail') || 'No email provided');
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Profile */}
            <div className="bg-gray-900/50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Profile</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="font-medium">{userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium">{userEmail}</p>
                </div>
                <Button variant="outline" className="w-full border-gray-600 text-white bg-gray-800 hover:bg-gray-700">
                  Edit Profile
                </Button>
              </div>
            </div>
            
            {/* Orders */}
            <div className="bg-gray-900/50 rounded-lg p-6 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
              <div className="text-center py-8 text-gray-400">
                <p>You haven't placed any orders yet.</p>
                <Button 
                  onClick={() => navigate('/products')} 
                  variant="outline" 
                  className="mt-4 border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
                >
                  Browse Products
                </Button>
              </div>
            </div>
            
            {/* Wishlist */}
            <div className="bg-gray-900/50 rounded-lg p-6 md:col-span-3">
              <h2 className="text-xl font-bold mb-4">Your Wishlist</h2>
              <div className="text-center py-8 text-gray-400">
                <p>Your wishlist is empty.</p>
                <Button 
                  onClick={() => navigate('/products')} 
                  variant="outline" 
                  className="mt-4 border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
                >
                  Browse Products
                </Button>
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
