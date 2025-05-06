
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyState {
  currencies: Currency[];
  currentCurrency: Currency;
  isLoading: boolean;
  error: string | null;
  fetchCurrencies: () => Promise<void>;
  setCurrency: (currencyCode: string) => void;
}

export const useCurrencyStore = create(
  persist<CurrencyState>(
    (set, get) => ({
      currencies: [],
      currentCurrency: { code: 'USD', name: 'US Dollar', symbol: '$' },
      isLoading: false,
      error: null,
      
      fetchCurrencies: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await supabase
            .from('currencies')
            .select('*');
          
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            set({ 
              currencies: data,
              isLoading: false
            });
          } else {
            // If no currencies found in database, use default ones
            const defaultCurrencies = [
              { code: 'USD', name: 'US Dollar', symbol: '$' },
              { code: 'EUR', name: 'Euro', symbol: '€' },
              { code: 'GBP', name: 'British Pound', symbol: '£' },
              { code: 'EGP', name: 'Egyptian Pound', symbol: 'LE' },
            ];
            
            set({ 
              currencies: defaultCurrencies,
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Error fetching currencies:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An error occurred fetching currencies' 
          });
          
          // Fall back to default currencies
          const defaultCurrencies = [
            { code: 'USD', name: 'US Dollar', symbol: '$' },
            { code: 'EUR', name: 'Euro', symbol: '€' },
            { code: 'GBP', name: 'British Pound', symbol: '£' },
            { code: 'EGP', name: 'Egyptian Pound', symbol: 'LE' },
          ];
          
          set({ currencies: defaultCurrencies });
        }
      },
      
      setCurrency: (currencyCode) => {
        const { currencies } = get();
        const currency = currencies.find(c => c.code === currencyCode);
        
        if (currency) {
          set({ currentCurrency: currency });
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
    isLoading, 
    error,
    fetchCurrencies, 
    setCurrency 
  } = useCurrencyStore();
  
  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);
  
  return {
    currencies,
    currentCurrency,
    isLoading,
    error,
    setCurrency
  };
};
