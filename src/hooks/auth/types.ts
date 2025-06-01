
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ needsOTP?: boolean } | undefined>;
  signup: (email: string, password: string, name?: string) => Promise<{ needsOTP?: boolean } | undefined>;
  logout: () => Promise<void>;
  updateUserProfile: (name: string, email: string) => Promise<void>;
  checkSession: () => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<any>;
  resetPassword: (email: string) => Promise<{ needsOTP?: boolean } | undefined>;
  updatePassword: (password: string) => Promise<void>;
}
