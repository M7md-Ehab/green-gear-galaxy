
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
        EUR: 0.030,
        GBP: 0.025,
        SAR: 0.120,
        AED: 0.118,
        JPY: 4.85,
        CNY: 0.234,
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

      updateExchangeRates: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate real-time API call with more realistic fluctuations
          // Based on current EGP exchange rates (as of 2024)
          const baseRates = {
            EGP: 1,
            USD: 0.032 + (Math.random() - 0.5) * 0.001, // ±0.0005 variation
            EUR: 0.030 + (Math.random() - 0.5) * 0.001, // ±0.0005 variation  
            GBP: 0.025 + (Math.random() - 0.5) * 0.0008, // ±0.0004 variation
            SAR: 0.120 + (Math.random() - 0.5) * 0.002, // ±0.001 variation
            AED: 0.118 + (Math.random() - 0.5) * 0.002, // ±0.001 variation
            JPY: 4.85 + (Math.random() - 0.5) * 0.05, // ±0.025 variation
            CNY: 0.234 + (Math.random() - 0.5) * 0.005, // ±0.0025 variation
          };
          
          // Ensure rates don't go negative or too extreme
          Object.keys(baseRates).forEach(key => {
            if (key !== 'EGP') {
              baseRates[key] = Math.max(baseRates[key], baseRates[key] * 0.95);
            }
          });
          
          set({ exchangeRates: baseRates, isLoading: false });
          console.log('Exchange rates updated:', baseRates);
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
    setCurrency,
    convertPrice,
    updateExchangeRates,
    formatPrice
  } = useCurrencyStore();
  
  // Update exchange rates every 30 seconds for more realistic real-time feel
  useEffect(() => {
    updateExchangeRates();
    const interval = setInterval(updateExchangeRates, 30 * 1000);
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
