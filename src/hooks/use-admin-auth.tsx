
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { ADMIN_CREDENTIALS } from '@/components/admin/AdminConfig';

interface AdminUser {
  id: string;
  username: string;
  role: 'admin';
}

interface AdminAuthState {
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  isLoading: boolean;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const storedAdmin = localStorage.getItem('adminUser');
    if (storedAdmin) {
      setAdminUser(JSON.parse(storedAdmin));
    }
    setIsLoading(false);
  }, []);

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const admin: AdminUser = {
          id: 'admin-1',
          username: username,
          role: 'admin'
        };
        
        setAdminUser(admin);
        localStorage.setItem('adminUser', JSON.stringify(admin));
        toast.success('Admin login successful');
        return true;
      } else {
        toast.error('Invalid admin credentials');
        return false;
      }
    } catch (error) {
      toast.error('Login failed');
      return false;
    }
  };

  const adminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('adminUser');
    toast.success('Admin logged out');
  };

  const authState: AdminAuthState = {
    adminUser,
    isAdminLoggedIn: !!adminUser,
    isLoading,
    adminLogin,
    adminLogout,
  };

  return (
    <AdminAuthContext.Provider value={authState}>
      {children}
    </AdminAuthContext.Provider>
  );
};
