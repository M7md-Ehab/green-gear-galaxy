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
  const [pendingAuth, setPendingAuth] = useState<{ email: string; password: string } | null>(null);

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
    // First, check if user already exists
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (existingUser.user) {
      toast.error('Account already exists. Please log in instead.');
      return { error: new Error('Account already exists') };
    }

    // Create user account - we'll send our own OTP email
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { email_confirmed: false },
      }
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    // Store password temporarily for post-OTP authentication
    setPendingAuth({ email, password });

    // Generate and send OTP
    try {
      const { error: otpError } = await supabase.functions.invoke('generate-otp', {
        body: { email, type: 'signup' }
      });

      if (otpError) throw otpError;
      
      toast.success('Check your email for the 6-digit verification code!');
      return { error: null };
    } catch (otpError: any) {
      console.error('OTP generation error:', otpError);
      toast.error('Failed to send verification code. Please try again.');
      return { error: otpError };
    }
  };

  const verifyOtp = async (email: string, token: string, type: 'signup' | 'signin' | 'recovery' = 'signup') => {
    try {
      console.log('Verifying OTP:', { email, type, codeLength: token.length });
      
      // Verify OTP via edge function
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email, code: token, type }
      });

      console.log('OTP verification response:', { data, error });

      if (error) {
        const errorMessage = error.message || 'Failed to verify code';
        console.error('OTP verification error:', errorMessage);
        toast.error(errorMessage);
        return { error };
      }

      if (data?.error) {
        console.error('OTP verification failed:', data.error);
        toast.error(data.error);
        return { error: new Error(data.error) };
      }

      // After OTP verification, establish proper Supabase session
      if (type === 'signup' || type === 'signin') {
        if (!pendingAuth || pendingAuth.email !== email) {
          toast.error('Session expired. Please try signing in again.');
          setPendingAuth(null);
          return { error: new Error('No pending authentication found') };
        }

        // Sign in with the stored password to create a valid session
        const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
          email: pendingAuth.email,
          password: pendingAuth.password,
        });

        // Clear pending auth data
        setPendingAuth(null);

        if (signInError) {
          toast.error('Failed to establish session. Please try again.');
          return { error: signInError };
        }

        // Session is now established with all user data including roles
        toast.success('Verification successful! Welcome back.');
      }

      return { error: null };
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error('Verification failed. Please try again.');
      setPendingAuth(null);
      return { error };
    }
  };

  const resendOtp = async (email: string, type: 'signup' | 'signin' | 'recovery' = 'signup') => {
    try {
      const { error } = await supabase.functions.invoke('generate-otp', {
        body: { email, type }
      });

      if (error) {
        toast.error('Failed to resend code. Please try again.');
        return { error };
      }

      toast.success('New verification code sent to your email!');
      return { error: null };
    } catch (error: any) {
      toast.error('Failed to resend code. Please try again.');
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // First verify the password by attempting sign in
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
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

      // Password is correct, but we need OTP verification
      // Sign out immediately to prevent auto-login
      await supabase.auth.signOut();
      
      // Store password temporarily for post-OTP authentication
      setPendingAuth({ email, password });
      
      // Generate and send OTP
      const { error: otpError } = await supabase.functions.invoke('generate-otp', {
        body: { email, type: 'signin' }
      });

      if (otpError) {
        throw otpError;
      }

      toast.success('Check your email for the 6-digit verification code!');
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error?.message || 'Failed to send verification code. Please try again.';
      toast.error(errorMessage);
      return { error };
    }
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
    // Generate and send OTP for password reset
    try {
      const { error } = await supabase.functions.invoke('generate-otp', {
        body: { email, type: 'recovery' }
      });

      if (error) throw error;

      toast.success('Check your email for the 6-digit verification code!');
      return { error: null };
    } catch (error: any) {
      console.error('OTP generation error:', error);
      toast.error('Failed to send verification code. Please try again.');
      return { error };
    }
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
