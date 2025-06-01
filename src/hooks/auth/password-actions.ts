
import { StateCreator } from 'zustand';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from './types';

type PasswordSlice = Pick<AuthState, 'resetPassword' | 'updatePassword'>;

export const passwordActions = (
  set: (state: Partial<AuthState>) => void, 
  get: () => AuthState
): PasswordSlice => ({
  resetPassword: async (email) => {
    try {
      // Send OTP for password reset
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.info('Password reset code sent', {
        description: 'Check your email for the verification code'
      });
      
      return { needsOTP: true };
      
    } catch (error: any) {
      toast.error('Password reset failed', {
        description: error.message || 'There was an error sending the reset code'
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
