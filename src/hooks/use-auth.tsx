
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
  login: (email: string, password: string) => Promise<{ needsOTP?: boolean } | undefined>;
  register: (name: string, email: string, password: string) => Promise<{ needsOTP?: boolean } | undefined>;
  logout: () => Promise<void>;
  updateUserProfile: (name: string, email: string) => Promise<void>;
  checkSession: () => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  resetPassword: (email: string) => Promise<{ needsOTP?: boolean } | undefined>;
  updatePassword: (password: string) => Promise<void>;
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
          
          // If we got here, the user exists - now always send OTP for two-factor authentication
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
          
          // Now proceed with signup - always requiring email verification
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
          
          // Send OTP for verification
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: false, // User was created above
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
      },
      
      resetPassword: async (email) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });
          
          if (error) {
            throw error;
          }
          
          // Send OTP for verification
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: false,
            }
          });
          
          if (otpError) {
            throw otpError;
          }
          
          toast.info('Password reset email sent', {
            description: 'Check your email for the verification code'
          });
          
          return { needsOTP: true };
          
        } catch (error: any) {
          toast.error('Password reset failed', {
            description: error.message || 'There was an error sending the reset email'
          });
          return undefined;
        }
      },
      
      updatePassword: async (password) => {
        try {
          const { error } = await supabase.auth.updateUser({
            password: password
          });
          
          if (error) {
            throw error;
          }
          
          toast.success('Password updated successfully', {
            description: 'You can now log in with your new password'
          });
          
        } catch (error: any) {
          toast.error('Failed to update password', {
            description: error.message || 'There was an error updating your password'
          });
          throw error;
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
