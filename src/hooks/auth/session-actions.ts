
import { StateCreator } from 'zustand';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from './types';

type SessionSlice = Pick<AuthState, 'checkSession' | 'logout'>;

export const sessionActions = (
  set: StateCreator<AuthState>['setState'], 
  get: StateCreator<AuthState>['getState']
): SessionSlice => ({
  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ 
        session, 
        user: session?.user || null, 
        isLoggedIn: !!session, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error checking session:', error);
      set({ isLoading: false });
    }
  },
  
  logout: async () => {
    try {
      // Clean up auth state completely to prevent any auth limbo states
      const cleanupAuthState = () => {
        localStorage.removeItem('supabase.auth.token');
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        // Also clean up sessionStorage if needed
        Object.keys(sessionStorage || {}).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      };
      
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      
      set({ 
        user: null, 
        session: null, 
        isLoggedIn: false 
      });
      toast.info('Logged out successfully');
    } catch (error: any) {
      toast.error('Error signing out', { 
        description: error.message 
      });
    }
  }
});
