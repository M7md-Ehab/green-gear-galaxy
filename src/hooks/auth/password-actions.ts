
import { StateCreator } from 'zustand';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from './types';

type PasswordSlice = Pick<AuthState, 'resetPassword' | 'updatePassword'>;

export const passwordActions = (
  set: StateCreator<AuthState>['setState'], 
  get: StateCreator<AuthState>['getState']
): PasswordSlice => ({
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
  }
});
