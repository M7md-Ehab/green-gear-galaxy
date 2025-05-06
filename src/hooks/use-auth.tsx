
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ needsOTP?: boolean } | void>;
  register: (name: string, email: string, password: string) => Promise<{ needsOTP?: boolean } | void>;
  logout: () => Promise<void>;
  updateUserProfile: (name: string, email: string) => Promise<void>;
  checkSession: () => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
}

// Main authentication store with Supabase
export const useAuth = create(
  persist<AuthState>(
    (set, get) => ({
      user: null,
      session: null,
      isLoggedIn: false,
      isLoading: true,
      
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
      
      login: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            throw error;
          }
          
          // If OTP is enabled, handle verification
          if (data && !data.session) {
            toast.info('Verification code sent to your email', { 
              description: 'Please check your inbox and enter the 6-digit code' 
            });
            return { needsOTP: true };
          }
          
          set({ 
            user: data.user,
            session: data.session,
            isLoggedIn: !!data.session
          });
          
          toast.success('Login successful', { 
            description: `Welcome back!` 
          });
          
        } catch (error: any) {
          toast.error('Login failed', { 
            description: error.message || 'Invalid email or password' 
          });
        }
      },
      
      register: async (name, email, password) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
              }
            }
          });
          
          if (error) {
            throw error;
          }
          
          // If email verification is required
          if (data && !data.session) {
            toast.info('Verification code sent to your email', { 
              description: 'Please check your inbox and enter the 6-digit code' 
            });
            return { needsOTP: true };
          }
          
          toast.success('Registration successful', { 
            description: data.session ? 'You are now logged in' : 'Please check your email to verify your account' 
          });
          
          if (data.session) {
            set({ 
              user: data.user,
              session: data.session,
              isLoggedIn: true
            });
          }
          
        } catch (error: any) {
          toast.error('Registration failed', { 
            description: error.message || 'There was an error creating your account' 
          });
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
          
        } catch (error: any) {
          toast.error('Verification failed', { 
            description: error.message || 'Invalid or expired verification code' 
          });
        }
      },
      
      logout: async () => {
        try {
          await supabase.auth.signOut();
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
      },
      
      updateUserProfile: async (name, email) => {
        const user = get().user;
        if (!user) return;
        
        try {
          // Update user metadata in Supabase Auth
          const { error: updateError } = await supabase.auth.updateUser({
            email,
            data: { name }
          });
          
          if (updateError) {
            throw updateError;
          }
          
          toast.success('Profile updated successfully');
          
        } catch (error: any) {
          toast.error('Error updating profile', { 
            description: error.message 
          });
        }
      }
    }),
    {
      name: 'vlitrix-auth'
    }
  )
);

// Hook to setup auth listeners
export const useAuthListener = () => {
  const { checkSession } = useAuth();
  
  useEffect(() => {
    // Initial session check
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        useAuth.setState({ 
          session, 
          user: session?.user || null, 
          isLoggedIn: !!session 
        });
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession]);
};
