
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

const AccountEdit = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, updateUserProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    // Check if logged in
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }
    
    // Get user details
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [isLoggedIn, navigate, user]);

  const handleSaveChanges = () => {
    updateUserProfile(name, email);
    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom max-w-lg mx-auto">
          <h1 className="text-4xl font-bold mb-8">Edit Profile</h1>
          
          <div className="bg-gray-900/50 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800 border-gray-700"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={handleSaveChanges}
                  className="flex-1 bg-brand-green text-black hover:bg-brand-green/90"
                >
                  Save Changes
                </Button>
                
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
                >
                  Cancel
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

export default AccountEdit;
