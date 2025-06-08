
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
  formatPrice: (price: number, currencyCode?: string) => string;
}

export const useCurrencyStore = create(
  persist<CurrencyState>(
    (set, get) => ({
      currencies: [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
        { code: 'EGP', name: 'Egyptian Pound', symbol: 'LE' },
        { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      ],
      currentCurrency: { code: 'USD', name: 'US Dollar', symbol: '$' },
      exchangeRates: {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        EGP: 48.65,
        SAR: 3.75,
        AED: 3.67,
        JPY: 149.50,
        CNY: 7.23,
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
      
      convertPrice: (price: number, fromCurrency: string = 'USD') => {
        const { exchangeRates, currentCurrency } = get();
        const fromRate = exchangeRates[fromCurrency] || 1;
        const toRate = exchangeRates[currentCurrency.code] || 1;
        
        return (price / fromRate) * toRate;
      },

      formatPrice: (price: number, currencyCode?: string) => {
        const { currentCurrency, exchangeRates } = get();
        const currency = currencyCode ? 
          get().currencies.find(c => c.code === currencyCode) || currentCurrency : 
          currentCurrency;
        
        const convertedPrice = currencyCode && currencyCode !== currentCurrency.code ?
          (price / (exchangeRates[currencyCode] || 1)) * (exchangeRates[currentCurrency.code] || 1) :
          price;
        
        return `${currency.symbol}${convertedPrice.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
      },

      updateExchangeRates: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulating real-time rates with slight variations
          const baseRates = {
            USD: 1,
            EUR: 0.92 + (Math.random() - 0.5) * 0.02,
            GBP: 0.79 + (Math.random() - 0.5) * 0.015,
            EGP: 48.65 + (Math.random() - 0.5) * 2,
            SAR: 3.75 + (Math.random() - 0.5) * 0.05,
            AED: 3.67 + (Math.random() - 0.5) * 0.05,
            JPY: 149.50 + (Math.random() - 0.5) * 3,
            CNY: 7.23 + (Math.random() - 0.5) * 0.15,
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
    updateExchangeRates,
    formatPrice
  } = useCurrencyStore();
  
  // Update exchange rates every 2 minutes for real-time feel
  useEffect(() => {
    updateExchangeRates();
    const interval = setInterval(updateExchangeRates, 2 * 60 * 1000);
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
    updateExchangeRates,
    formatPrice
  };
};
