import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-supabase-auth';

type AppRole = 'admin' | 'moderator' | 'user';

interface RoleAuthState {
  userRoles: AppRole[];
  isAdmin: boolean;
  isModerator: boolean;
  isLoading: boolean;
  hasRole: (role: AppRole) => boolean;
  refreshRoles: () => Promise<void>;
}

const RoleAuthContext = createContext<RoleAuthState | undefined>(undefined);

export const useRoleAuth = () => {
  const context = useContext(RoleAuthContext);
  if (context === undefined) {
    throw new Error('useRoleAuth must be used within a RoleAuthProvider');
  }
  return context;
};

interface RoleAuthProviderProps {
  children: ReactNode;
}

export const RoleAuthProvider = ({ children }: RoleAuthProviderProps) => {
  const { user, isLoggedIn } = useAuth();
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserRoles = async () => {
    if (!user || !isLoggedIn) {
      setUserRoles([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        setUserRoles([]);
      } else {
        setUserRoles(data?.map(r => r.role) || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setUserRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [user, isLoggedIn]);

  const hasRole = (role: AppRole): boolean => {
    return userRoles.includes(role);
  };

  const isAdmin = hasRole('admin');
  const isModerator = hasRole('moderator');

  const authState: RoleAuthState = {
    userRoles,
    isAdmin,
    isModerator,
    isLoading,
    hasRole,
    refreshRoles: fetchUserRoles,
  };

  return (
    <RoleAuthContext.Provider value={authState}>
      {children}
    </RoleAuthContext.Provider>
  );
};