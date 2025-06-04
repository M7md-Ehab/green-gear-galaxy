
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
  isLoading: boolean;
  error: string | null;
  setCurrency: (currencyCode: string) => void;
  convertPrice: (price: number, fromCurrency: string) => number;
}

export const useCurrencyStore = create(
  persist<CurrencyState>(
    (set, get) => ({
      currencies: [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'EGP', name: 'Egyptian Pound', symbol: 'LE' },
      ],
      currentCurrency: { code: 'USD', name: 'US Dollar', symbol: '$' },
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
        // Simple conversion rates (in a real app, you'd fetch these from an API)
        const rates: Record<string, number> = {
          USD: 1,
          EUR: 0.85,
          GBP: 0.73,
          EGP: 30.5,
        };
        
        const { currentCurrency } = get();
        const fromRate = rates[fromCurrency] || 1;
        const toRate = rates[currentCurrency.code] || 1;
        
        return (price / fromRate) * toRate;
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
    isLoading, 
    error,
    setCurrency,
    convertPrice
  } = useCurrencyStore();
  
  return {
    currencies,
    currentCurrency,
    isLoading,
    error,
    setCurrency,
    convertPrice
  };
};
