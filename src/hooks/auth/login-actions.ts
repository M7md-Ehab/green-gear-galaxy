
import { StateCreator } from 'zustand';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from './types';

type LoginSlice = Pick<AuthState, 'login' | 'register' | 'verifyOTP'>;

export const loginActions = (
  set: (state: Partial<AuthState>) => void, 
  get: () => AuthState
): LoginSlice => ({
  login: async (email, password) => {
    try {
      // First check if the email exists
      const { data: userExists, error: userExistsError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (userExistsError) {
        if (userExistsError.message.includes('Invalid login')) {
          toast.error('Login failed', { 
            description: 'Invalid email or password' 
          });
          return undefined;
        }
        throw userExistsError;
      }

      // If login succeeded, but we want to enforce OTP verification,
      // we need to immediately log the user out
      if (userExists.session) {
        // Sign the user out right away - we want them to verify via OTP
        await supabase.auth.signOut();
        
        // Reset the auth state
        set({ 
          user: null, 
          session: null, 
          isLoggedIn: false 
        });
      }
      
      // Now send OTP for verification
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.info('Verification code sent to your email', { 
        description: 'Please check your inbox and enter the 6-digit code' 
      });
      
      return { needsOTP: true };
    } catch (error: any) {
      toast.error('Login failed', { 
        description: error.message || 'There was an error processing your request' 
      });
      return undefined;
    }
  },
  
  register: async (name, email, password) => {
    try {
      // Check if the email already exists (will not create new user if exists)
      const { data: { user: existingUser }, error: existingUserError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });
      
      if (existingUser) {
        toast.error('Registration failed', { 
          description: 'This email is already registered. Please try logging in instead.' 
        });
        return undefined;
      }
      
      // Now proceed with signup but don't auto-sign in
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) {
        throw error;
      }
      
      // If user was created successfully, now send OTP
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });
      
      if (otpError) {
        throw otpError;
      }
      
      toast.info('Verification code sent to your email', { 
        description: 'Please check your inbox and enter the 6-digit code to complete registration' 
      });
      
      return { needsOTP: true };
    } catch (error: any) {
      toast.error('Registration failed', { 
        description: error.message || 'There was an error creating your account' 
      });
      return undefined;
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
      
      set({ 
        user: data.user,
        session: data.session,
        isLoggedIn: true
      });
      
      toast.success('Email verified successfully', { 
        description: 'You are now logged in' 
      });
      
      return;
      
    } catch (error: any) {
      toast.error('Verification failed', { 
        description: error.message || 'Invalid or expired verification code' 
      });
      throw error;
    }
  }
});
