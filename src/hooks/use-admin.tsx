import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAdminStatus() {
      if (authLoading) {
        return;
      }

      setLoading(true);

      if (!user) {
        if (!cancelled) {
          setIsAdmin(false);
          setResolvedUserId(null);
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

      setResolvedUserId(user.id);
      setLoading(false);
    }

    checkAdminStatus();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  const isResolvingCurrentUser = useMemo(() => {
    if (authLoading) {
      return true;
    }

    if (!user) {
      return loading;
    }

    return loading || resolvedUserId !== user.id;
  }, [authLoading, loading, resolvedUserId, user]);

  return { isAdmin, loading: isResolvingCurrentUser };
}
