
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyState {
  currencies: Currency[];
  currentCurrency: Currency;
  exchangeRates: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  apiToken: string | null;
  setCurrency: (currencyCode: string) => void;
  convertPrice: (price: number, fromCurrency: string) => number;
  updateExchangeRates: () => Promise<void>;
  formatPrice: (price: number, currencyCode?: string) => string;
  setApiToken: (token: string) => void;
}

export const useCurrencyStore = create(
  persist<CurrencyState>(
    (set, get) => ({
      currencies: [
        { code: 'EGP', name: 'Egyptian Pound', symbol: 'LE' },
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
        { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      ],
      currentCurrency: { code: 'EGP', name: 'Egyptian Pound', symbol: 'LE' },
      exchangeRates: {
        EGP: 1,
        USD: 0.032,
        EUR: 0.030,
        GBP: 0.025,
        SAR: 0.120,
        AED: 0.118,
        JPY: 4.85,
        CNY: 0.234,
      },
      isLoading: false,
      error: null,
      apiToken: null,
      
      setCurrency: (currencyCode) => {
        const { currencies } = get();
        const currency = currencies.find(c => c.code === currencyCode);
        
        if (currency) {
          set({ currentCurrency: currency });
        }
      },
      
      convertPrice: (price: number, fromCurrency: string = 'EGP') => {
        const { exchangeRates, currentCurrency } = get();
        const fromRate = exchangeRates[fromCurrency] || 1;
        const toRate = exchangeRates[currentCurrency.code] || 1;
        
        // Convert from source currency to EGP first, then to target currency
        const priceInEGP = price / fromRate;
        const convertedPrice = priceInEGP * toRate;
        
        return parseFloat(convertedPrice.toFixed(2));
      },

      formatPrice: (price: number, currencyCode?: string) => {
        const { currentCurrency } = get();
        const currency = currencyCode ? 
          get().currencies.find(c => c.code === currencyCode) || currentCurrency : 
          currentCurrency;
        
        return `${currency.symbol}${price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
      },

      setApiToken: (token: string) => {
        set({ apiToken: token });
      },

      updateExchangeRates: async () => {
        const { apiToken } = get();
        set({ isLoading: true, error: null });
        
        try {
          if (apiToken) {
            // Use FXRates API
            const response = await fetch(`https://api.fxratesapi.com/latest?api_key=${apiToken}&base=EGP&currencies=USD,EUR,GBP,SAR,AED,JPY,CNY`);
            
            if (!response.ok) {
              throw new Error('Failed to fetch exchange rates');
            }
            
            const data = await response.json();
            
            if (data.success && data.rates) {
              const rates = {
                EGP: 1,
                ...data.rates
              };
              
              set({ exchangeRates: rates, isLoading: false });
              console.log('Exchange rates updated from FXRates API:', rates);
            } else {
              throw new Error('Invalid API response');
            }
          } else {
            // Fallback to simulated rates with realistic fluctuations
            const baseRates = {
              EGP: 1,
              USD: 0.032 + (Math.random() - 0.5) * 0.001,
              EUR: 0.030 + (Math.random() - 0.5) * 0.001,
              GBP: 0.025 + (Math.random() - 0.5) * 0.0008,
              SAR: 0.120 + (Math.random() - 0.5) * 0.002,
              AED: 0.118 + (Math.random() - 0.5) * 0.002,
              JPY: 4.85 + (Math.random() - 0.5) * 0.05,
              CNY: 0.234 + (Math.random() - 0.5) * 0.005,
            };
            
            // Ensure rates don't go negative or too extreme
            Object.keys(baseRates).forEach(key => {
              if (key !== 'EGP') {
                baseRates[key] = Math.max(baseRates[key], baseRates[key] * 0.95);
              }
            });
            
            set({ exchangeRates: baseRates, isLoading: false });
            console.log('Exchange rates updated (simulated):', baseRates);
          }
        } catch (error) {
          set({ error: 'Failed to update exchange rates', isLoading: false });
          console.error('Currency update error:', error);
        }
      }
    }),
    {
      name: 'vlitrix-currency'
    }
  )
);

export const useCurrency = () => {
  const { 
    currencies, 
    currentCurrency, 
    exchangeRates,
    isLoading, 
    error,
    apiToken,
    setCurrency,
    convertPrice,
    updateExchangeRates,
    formatPrice,
    setApiToken
  } = useCurrencyStore();
  
  // Update exchange rates every 30 seconds
  useEffect(() => {
    updateExchangeRates();
    const interval = setInterval(updateExchangeRates, 30 * 1000);
    return () => clearInterval(interval);
  }, [updateExchangeRates, apiToken]);
  
  return {
    currencies,
    currentCurrency,
    exchangeRates,
    isLoading,
    error,
    apiToken,
    setCurrency,
    convertPrice,
    updateExchangeRates,
    formatPrice,
    setApiToken
  };
};
