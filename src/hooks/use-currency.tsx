
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyContextType {
  currencies: Currency[];
  currentCurrency: Currency;
  setCurrency: (currencyCode: string) => Promise<void>;
  isLoading: boolean;
  convertPrice: (priceInEGP: number) => number;
}

const defaultCurrency: Currency = {
  code: 'EGP',
  name: 'Egyptian Pound',
  symbol: 'E£'
};

// Exchange rates relative to EGP (as of May 2025)
// These would ideally come from an API but for now we're hardcoding them
const exchangeRates: Record<string, number> = {
  'EGP': 1,
  'USD': 0.032, // 1 EGP = 0.032 USD
  'EUR': 0.030, // 1 EGP = 0.030 EUR
  'GBP': 0.025, // 1 EGP = 0.025 GBP
  // Add more currencies as needed
};

const CurrencyContext = createContext<CurrencyContextType>({
  currencies: [],
  currentCurrency: defaultCurrency,
  setCurrency: async () => {},
  isLoading: true,
  convertPrice: (price) => price
});

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoggedIn } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(defaultCurrency);
  const [isLoading, setIsLoading] = useState(true);

  // Load all available currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const { data, error } = await supabase
          .from('currencies')
          .select('*')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setCurrencies(data);
        }
      } catch (error) {
        console.error('Error fetching currencies:', error);
        toast.error('Failed to load currencies');
      }
    };
    
    fetchCurrencies();
  }, []);

  // Load user's preferred currency if logged in
  useEffect(() => {
    const loadUserCurrency = async () => {
      setIsLoading(true);
      
      if (isLoggedIn && user) {
        try {
          // Get profile data including preferred currency
          const { data, error } = await supabase
            .from('profiles')
            .select('preferred_currency')
            .eq('id', user.id)
            .single();
          
          if (error) {
            throw error;
          }
          
          if (data?.preferred_currency) {
            // Find the user's preferred currency from the list
            const userCurrency = currencies.find(c => c.code === data.preferred_currency);
            if (userCurrency) {
              setCurrentCurrency(userCurrency);
            }
          }
        } catch (error) {
          console.error('Error loading user currency:', error);
        }
      } else {
        // If not logged in, try to get currency from local storage
        const savedCurrencyCode = localStorage.getItem('preferred_currency');
        if (savedCurrencyCode && currencies.length > 0) {
          const savedCurrency = currencies.find(c => c.code === savedCurrencyCode);
          if (savedCurrency) {
            setCurrentCurrency(savedCurrency);
          }
        }
      }
      
      setIsLoading(false);
    };
    
    if (currencies.length > 0) {
      loadUserCurrency();
    }
  }, [isLoggedIn, user, currencies]);

  // Convert price from EGP to selected currency
  const convertPrice = (priceInEGP: number): number => {
    const rate = exchangeRates[currentCurrency.code] || 1;
    return parseFloat((priceInEGP * rate).toFixed(2));
  };

  // Function to change currency
  const setCurrency = async (currencyCode: string) => {
    const newCurrency = currencies.find(c => c.code === currencyCode);
    if (!newCurrency) return;
    
    setCurrentCurrency(newCurrency);
    localStorage.setItem('preferred_currency', currencyCode);
    
    // If logged in, update user's profile in the database
    if (isLoggedIn && user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ preferred_currency: currencyCode })
          .eq('id', user.id);
          
        if (error) {
          throw error;
        }
        
        toast.success(`Currency changed to ${newCurrency.name}`);
      } catch (error) {
        console.error('Error updating user currency:', error);
        toast.error('Failed to update currency preference');
      }
    }
  };

  return (
    <CurrencyContext.Provider value={{ 
      currencies, 
      currentCurrency, 
      setCurrency, 
      isLoading,
      convertPrice 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
