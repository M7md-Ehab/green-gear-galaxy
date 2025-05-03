
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, useAuthListener } from '@/hooks/use-auth';
import { useCurrency, Currency } from '@/hooks/use-currency';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
];

const AccountEdit = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoading, updateUserProfile } = useAuth();
  const { currencies, currentCurrency, setCurrency } = useCurrency();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('en');
  
  // Setup auth listener
  useAuthListener();
  
  useEffect(() => {
    // Check if logged in
    if (!isLoggedIn && !isLoading) {
      navigate('/auth');
      return;
    }
    
    // Get user details
    if (user) {
      setName(user.user_metadata?.name || '');
      setEmail(user.email || '');
      
      // Get language preference from profile
      const fetchProfileData = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          if (data?.preferred_language) {
            setLanguage(data.preferred_language);
          }
        } catch (err) {
          console.error("Error fetching profile data:", err);
        }
      };
      
      fetchProfileData();
    }
  }, [isLoggedIn, isLoading, navigate, user]);

  const handleSaveChanges = async () => {
    try {
      await updateUserProfile(name, email);
      
      // Update language preference
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_language: language })
        .eq('id', user?.id);
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to update profile');
      console.error(err);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green mx-auto mb-4"></div>
            <p>Loading...</p>
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
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium mb-2">
                  Preferred Language
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="currency" className="block text-sm font-medium mb-2">
                  Preferred Currency
                </label>
                <Select 
                  value={currentCurrency.code} 
                  onValueChange={(code) => setCurrency(code)}
                >
                  <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.name} ({currency.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
