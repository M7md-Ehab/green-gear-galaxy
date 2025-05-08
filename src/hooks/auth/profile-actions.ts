
import { StateCreator } from 'zustand';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from './types';

type ProfileSlice = Pick<AuthState, 'updateUserProfile'>;

export const profileActions = (
  set: (state: Partial<AuthState>) => void, 
  get: () => AuthState
): ProfileSlice => ({
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
});
