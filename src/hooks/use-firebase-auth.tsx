
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { firebaseAuthService, FirebaseAuthState } from './auth/firebase-auth';

const AuthContext = createContext<FirebaseAuthState | undefined>(undefined);

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const authState: FirebaseAuthState = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login: firebaseAuthService.login,
    signup: firebaseAuthService.signup,
    logout: firebaseAuthService.logout,
    updateUserProfile: firebaseAuthService.updateUserProfile,
    sendVerificationEmail: firebaseAuthService.sendVerificationEmail,
    resetPassword: firebaseAuthService.resetPassword,
  };

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};
