import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function checkAdminStatus() {
      setLoading(true);
      if (!user) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (cancelled) return;

      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    }

    checkAdminStatus();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return { isAdmin, loading };
}
