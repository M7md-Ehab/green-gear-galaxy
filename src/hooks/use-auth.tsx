import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string) => Promise<{ error: any }>;
  signIn: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string, type?: string) => Promise<{ error: any }>;
  resendOtp: (email: string, type?: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function callEdgeFunction(functionName: string, body: Record<string, any>) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return { data, ok: response.ok };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string) => {
    const { data, ok } = await callEdgeFunction('send-otp', { email, type: 'signup' });

    if (!ok) {
      toast.error(data.error || 'Failed to send verification code');
      return { error: data };
    }

    toast.success('Check your email for the 6-digit verification code!');
    return { error: null };
  };

  const signIn = async (email: string) => {
    const { data, ok } = await callEdgeFunction('send-otp', { email, type: 'login' });

    if (!ok) {
      toast.error(data.error || 'Failed to send verification code');
      return { error: data };
    }

    toast.success('Check your email for the 6-digit verification code!');
    return { error: null };
  };

  const verifyOtp = async (email: string, token: string, type: string = 'login') => {
    const { data, ok } = await callEdgeFunction('verify-custom-otp', { email, otp: token, type });

    if (!ok) {
      toast.error(data.error || 'Invalid verification code');
      return { error: data };
    }

    // If we got a token_hash, use it to create a session
    if (data.token_hash) {
      const { error: sessionError } = await supabase.auth.verifyOtp({
        token_hash: data.token_hash,
        type: 'magiclink',
      });

      if (sessionError) {
        toast.error('Failed to create session');
        return { error: sessionError };
      }
    }

    toast.success('Verification successful! Welcome.');
    return { error: null };
  };

  const resendOtp = async (email: string, type: string = 'login') => {
    const { data, ok } = await callEdgeFunction('send-otp', { email, type });

    if (!ok) {
      toast.error('Failed to resend code. Please try again.');
      return { error: data };
    }

    toast.success('New verification code sent to your email!');
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

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, verifyOtp, resendOtp }}>
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
