
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { customAuthService, AuthState, User } from './auth/custom-auth';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage
    const currentUser = customAuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const authState: AuthState = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login: async (email: string, password: string) => {
      const result = await customAuthService.login(email, password);
      if (!result?.needsVerification) {
        setUser(customAuthService.getCurrentUser());
      }
      return result;
    },
    signup: customAuthService.signup,
    logout: async () => {
      await customAuthService.logout();
      setUser(null);
    },
    updateUserProfile: async (name: string, email: string) => {
      await customAuthService.updateUserProfile(name, email);
      setUser(customAuthService.getCurrentUser());
    },
    sendVerificationEmail: customAuthService.sendVerificationEmail,
    resetPassword: customAuthService.resetPassword,
  };

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};
