import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  verifyOtp: (email: string, token: string, type?: 'signup' | 'signin' | 'recovery') => Promise<{ error: any }>;
  resendOtp: (email: string, type?: 'signup' | 'signin' | 'recovery') => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    toast.success('Check your email for the 6-digit verification code!');
    return { error: null };
  };

  const verifyOtp = async (email: string, token: string, type: 'signup' | 'signin' | 'recovery' = 'signup') => {
    const otpType = type === 'signin' ? 'email' : type;
    
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: otpType as any
    });

    if (error) {
      toast.error('Invalid or expired code');
      return { error };
    }

    toast.success('Email verified successfully!');
    return { error: null };
  };

  const resendOtp = async (email: string, type: 'signup' | 'signin' | 'recovery' = 'signup') => {
    const resendType = type === 'signin' ? 'email' : type;
    
    const { error } = await supabase.auth.resend({
      type: resendType as any,
      email
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    toast.success('New verification code sent to your email!');
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // First verify the password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.message.includes('Email not confirmed')) {
        toast.error('Please verify your email before logging in');
      } else if (signInError.message.includes('Invalid')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(signInError.message);
      }
      return { error: signInError };
    }

    // Password is correct, sign out and send OTP
    await supabase.auth.signOut();
    
    // Send OTP for login verification
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      }
    });

    if (otpError) {
      toast.error(otpError.message);
      return { error: otpError };
    }

    toast.success('Check your email for the 6-digit verification code!');
    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Logged out successfully');
    }
  };

  const resetPassword = async (email: string) => {
    // Send OTP for password reset
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      }
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    toast.success('Check your email for the 6-digit verification code!');
    return { error: null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    toast.success('Password updated successfully!');
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword, updatePassword, verifyOtp, resendOtp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
