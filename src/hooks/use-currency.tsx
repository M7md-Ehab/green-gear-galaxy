import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
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
  symbol: 'E£',
  exchangeRate: 1
};

// Default exchange rates with all previously available currencies
const defaultCurrencies: Currency[] = [
  defaultCurrency,
  { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 0.032 },
  { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.030 },
  { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.025 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', exchangeRate: 0.12 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', exchangeRate: 0.118 },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', exchangeRate: 0.0098 },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', exchangeRate: 0.117 },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', exchangeRate: 0.012 },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', exchangeRate: 0.012 },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', exchangeRate: 0.023 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRate: 0.043 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRate: 0.048 }
];

const CurrencyContext = createContext<CurrencyContextType>({
  currencies: defaultCurrencies,
  currentCurrency: defaultCurrency,
  setCurrency: async () => {},
  isLoading: true,
  convertPrice: (price) => price
});

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoggedIn } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>(defaultCurrencies);
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(defaultCurrency);
  const [isLoading, setIsLoading] = useState(true);

  // Load all available currencies
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        // Try to fetch currencies from the database
        const { data, error } = await supabase
          .from('currencies')
          .select('*');
          
        if (error) {
          console.error('Error fetching currencies:', error);
        } else if (data && data.length > 0) {
          // Format the data from database to match Currency type
          const dbCurrencies: Currency[] = data.map(item => ({
            code: item.code,
            name: item.name,
            symbol: item.symbol,
            // Use optional chaining and nullish coalescing to safely handle the exchange_rate property
            exchangeRate: item.exchange_rate ?? 1
          }));
          
          // Make sure EGP is the default with exchange rate 1
          const hasEGP = dbCurrencies.some(c => c.code === 'EGP');
          if (!hasEGP) {
            dbCurrencies.push(defaultCurrency);
          }
          
          setCurrencies(dbCurrencies);
          localStorage.setItem('vlitrix-currencies', JSON.stringify(dbCurrencies));
        } else {
          // If no currencies in DB, check local storage
          const storedCurrencies = localStorage.getItem('vlitrix-currencies');
          if (storedCurrencies) {
            try {
              const parsedCurrencies = JSON.parse(storedCurrencies);
              if (Array.isArray(parsedCurrencies) && parsedCurrencies.length > 0) {
                setCurrencies(parsedCurrencies);
              }
            } catch (error) {
              console.error('Error parsing stored currencies:', error);
            }
          } else {
            // If no stored currencies, use defaults and store them
            localStorage.setItem('vlitrix-currencies', JSON.stringify(defaultCurrencies));
          }
        }
      } catch (e) {
        console.error('Error in currency loading:', e);
        // Use defaults if there's any error
        const storedCurrencies = localStorage.getItem('vlitrix-currencies');
        if (storedCurrencies) {
          try {
            const parsedCurrencies = JSON.parse(storedCurrencies);
            if (Array.isArray(parsedCurrencies) && parsedCurrencies.length > 0) {
              setCurrencies(parsedCurrencies);
            }
          } catch (error) {
            console.error('Error parsing stored currencies:', error);
          }
        }
      }
    };
    
    loadCurrencies();
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
    const rate = currentCurrency.exchangeRate || 1;
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
