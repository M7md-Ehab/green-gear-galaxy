
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
        EGP: 1, USD: 0.032, EUR: 0.030, GBP: 0.025,
        SAR: 0.120, AED: 0.118, JPY: 4.85, CNY: 0.234,
      },
      isLoading: false,
      error: null,
      apiToken: null,
      
      setCurrency: (currencyCode) => {
        const currency = get().currencies.find(c => c.code === currencyCode);
        if (currency) set({ currentCurrency: currency });
      },
      
      convertPrice: (price: number, fromCurrency: string = 'EGP') => {
        const { exchangeRates, currentCurrency } = get();
        const fromRate = exchangeRates[fromCurrency] || 1;
        const toRate = exchangeRates[currentCurrency.code] || 1;
        const priceInEGP = price / fromRate;
        return parseFloat((priceInEGP * toRate).toFixed(2));
      },

      formatPrice: (price: number, currencyCode?: string) => {
        const { currentCurrency } = get();
        const currency = currencyCode 
          ? get().currencies.find(c => c.code === currencyCode) || currentCurrency 
          : currentCurrency;
        return `${currency.symbol}${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },

      setApiToken: (token: string) => set({ apiToken: token }),

      updateExchangeRates: async () => {
        const { apiToken } = get();
        set({ isLoading: true, error: null });
        
        try {
          if (apiToken) {
            // Use CurrencyFreaks API with real-time rates
            const response = await fetch(
              `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${apiToken}&symbols=USD,EUR,GBP,SAR,AED,JPY,CNY&base=EGP`
            );
            
            if (!response.ok) throw new Error('Failed to fetch exchange rates');
            const data = await response.json();
            
            if (data.rates) {
              const rates: Record<string, number> = { EGP: 1 };
              Object.entries(data.rates).forEach(([key, value]) => {
                rates[key] = parseFloat(value as string);
              });
              set({ exchangeRates: rates, isLoading: false });
              console.log('Exchange rates updated from CurrencyFreaks API:', rates);
              return;
            }
          }

          // Fallback: use free exchangerate.host API
          try {
            const response = await fetch('https://api.exchangerate.host/latest?base=EGP&symbols=USD,EUR,GBP,SAR,AED,JPY,CNY');
            if (response.ok) {
              const data = await response.json();
              if (data.rates) {
                const rates: Record<string, number> = { EGP: 1, ...data.rates };
                set({ exchangeRates: rates, isLoading: false });
                console.log('Exchange rates updated from exchangerate.host:', rates);
                return;
              }
            }
          } catch (fallbackErr) {
            console.warn('exchangerate.host fallback failed:', fallbackErr);
          }

          // Final fallback: use static realistic rates (no random fluctuation)
          set({
            exchangeRates: {
              EGP: 1, USD: 0.0203, EUR: 0.0187, GBP: 0.0161,
              SAR: 0.0762, AED: 0.0747, JPY: 3.06, CNY: 0.148,
            },
            isLoading: false,
          });
          console.log('Using static exchange rates (no API available)');
        } catch (error) {
          set({ error: 'Failed to update exchange rates', isLoading: false });
          console.error('Currency update error:', error);
        }
      }
    }),
    { name: 'vlitrix-currency' }
  )
);

export const useCurrency = () => {
  const store = useCurrencyStore();
  
  // Update exchange rates every 5 minutes (not 30 seconds)
  useEffect(() => {
    store.updateExchangeRates();
    const interval = setInterval(store.updateExchangeRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [store.apiToken]);
  
  return store;
};
