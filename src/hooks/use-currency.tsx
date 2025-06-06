
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
  setCurrency: (currencyCode: string) => void;
  convertPrice: (price: number, fromCurrency: string) => number;
  updateExchangeRates: () => Promise<void>;
}

export const useCurrencyStore = create(
  persist<CurrencyState>(
    (set, get) => ({
      currencies: [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'EGP', name: 'Egyptian Pound', symbol: 'LE' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      ],
      currentCurrency: { code: 'USD', name: 'US Dollar', symbol: '$' },
      exchangeRates: {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        EGP: 30.5,
        JPY: 110,
        CNY: 6.45,
      },
      isLoading: false,
      error: null,
      
      setCurrency: (currencyCode) => {
        const { currencies } = get();
        const currency = currencies.find(c => c.code === currencyCode);
        
        if (currency) {
          set({ currentCurrency: currency });
        }
      },
      
      convertPrice: (price: number, fromCurrency: string) => {
        const { exchangeRates, currentCurrency } = get();
        const fromRate = exchangeRates[fromCurrency] || 1;
        const toRate = exchangeRates[currentCurrency.code] || 1;
        
        return (price / fromRate) * toRate;
      },

      updateExchangeRates: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, you would fetch from a real exchange rate API
          // For now, we'll simulate with slightly random rates
          const baseRates = {
            USD: 1,
            EUR: 0.85 + (Math.random() - 0.5) * 0.02,
            GBP: 0.73 + (Math.random() - 0.5) * 0.02,
            EGP: 30.5 + (Math.random() - 0.5) * 1,
            JPY: 110 + (Math.random() - 0.5) * 5,
            CNY: 6.45 + (Math.random() - 0.5) * 0.2,
          };
          
          set({ exchangeRates: baseRates, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to update exchange rates', isLoading: false });
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
    setCurrency,
    convertPrice,
    updateExchangeRates
  } = useCurrencyStore();
  
  // Update exchange rates every 5 minutes
  useEffect(() => {
    updateExchangeRates();
    const interval = setInterval(updateExchangeRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateExchangeRates]);
  
  return {
    currencies,
    currentCurrency,
    exchangeRates,
    isLoading,
    error,
    setCurrency,
    convertPrice,
    updateExchangeRates
  };
};
