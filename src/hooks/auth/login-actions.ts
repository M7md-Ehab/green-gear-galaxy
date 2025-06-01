
import { StateCreator } from 'zustand';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from './types';

type LoginSlice = Pick<AuthState, 'login' | 'signup' | 'logout' | 'verifyOTP'>;

export const loginActions = (
  set: (state: Partial<AuthState>) => void, 
  get: () => AuthState
): LoginSlice => ({
  login: async (email, password) => {
    try {
      // Always use OTP for login like ChatGPT
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });
      
      if (error) {
        throw error;
      }
      
      return { needsOTP: true };
      
    } catch (error: any) {
      // If user doesn't exist, suggest signup
      if (error.message?.includes('User not found') || error.message?.includes('Invalid login')) {
        toast.error('Account not found', {
          description: 'Please check your email or create a new account'
        });
      } else {
        toast.error('Login failed', {
          description: error.message || 'There was an error signing you in'
        });
      }
      throw error;
    }
  },

  signup: async (email, password, name) => {
    try {
      // Use OTP signup like ChatGPT
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            name: name || 'User'
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      return { needsOTP: true };
      
    } catch (error: any) {
      toast.error('Signup failed', {
        description: error.message || 'There was an error creating your account'
      });
      throw error;
    }
  },

  verifyOTP: async (email, token) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        set({ 
          user: data.user, 
          session: data.session,
          isLoggedIn: true 
        });
        
        toast.success('Successfully signed in!');
        return data;
      }
      
    } catch (error: any) {
      toast.error('Verification failed', {
        description: error.message || 'Invalid verification code'
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Clear auth state first
      const cleanupAuthState = () => {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      };
      
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.warn('Logout error:', error);
      }
      
      set({ 
        user: null, 
        session: null, 
        isLoggedIn: false 
      });
      
      // Force page reload for clean state
      window.location.href = '/auth';
      
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still clear the state even if there's an error
      set({ 
        user: null, 
        session: null, 
        isLoggedIn: false 
      });
      window.location.href = '/auth';
    }
  }
});
