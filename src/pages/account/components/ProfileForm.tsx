
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from '@/hooks/use-currency';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
];

interface ProfileFormProps {
  onCancel: () => void;
}

const ProfileForm = ({ onCancel }: ProfileFormProps) => {
  const { user, updateUserProfile } = useAuth();
  const { currencies, currentCurrency, setCurrency } = useCurrency();
  
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState('en');
  
  // Get language preference from profile
  useState(() => {
    if (!user) return;
    
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
  });

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
      onCancel();
    } catch (err) {
      toast.error('Failed to update profile');
      console.error(err);
    }
  };

  return (
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
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm;
