
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-store';

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
