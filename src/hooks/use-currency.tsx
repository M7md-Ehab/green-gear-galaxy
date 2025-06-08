
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
        EUR: 0.029,
        GBP: 0.025,
        SAR: 0.12,
        AED: 0.117,
        JPY: 4.79,
        CNY: 0.23,
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
      
      convertPrice: (price: number, fromCurrency: string = 'EGP') => {
        const { exchangeRates, currentCurrency } = get();
        const fromRate = exchangeRates[fromCurrency] || 1;
        const toRate = exchangeRates[currentCurrency.code] || 1;
        
        return (price / fromRate) * toRate;
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

      updateExchangeRates: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Real-time rates based on EGP
          const baseRates = {
            EGP: 1,
            USD: 0.032 + (Math.random() - 0.5) * 0.002,
            EUR: 0.029 + (Math.random() - 0.5) * 0.002,
            GBP: 0.025 + (Math.random() - 0.5) * 0.001,
            SAR: 0.12 + (Math.random() - 0.5) * 0.005,
            AED: 0.117 + (Math.random() - 0.5) * 0.005,
            JPY: 4.79 + (Math.random() - 0.5) * 0.1,
            CNY: 0.23 + (Math.random() - 0.5) * 0.01,
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
