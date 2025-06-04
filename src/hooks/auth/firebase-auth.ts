
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export interface FirebaseAuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ needsVerification?: boolean } | undefined>;
  signup: (email: string, password: string, name: string) => Promise<{ needsVerification?: boolean } | undefined>;
  logout: () => Promise<void>;
  updateUserProfile: (name: string, email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const firebaseAuthService = {
  login: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      if (!result.user.emailVerified) {
        toast.error('Please verify your email address before signing in');
        await signOut(auth);
        return { needsVerification: true };
      }
      
      toast.success('Successfully signed in!');
      return undefined;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Failed to sign in';
      toast.error(errorMessage);
      throw error;
    }
  },

  signup: async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      await updateProfile(result.user, {
        displayName: name
      });
      
      // Send verification email
      await sendEmailVerification(result.user);
      
      toast.success('Account created! Please check your email for verification.');
      
      // Sign out after signup to force email verification
      await signOut(auth);
      
      return { needsVerification: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.message || 'Failed to create account';
      toast.error(errorMessage);
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      toast.success('Successfully signed out');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  },

  updateUserProfile: async (name: string, email: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }
      
      await updateProfile(user, {
        displayName: name
      });
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  },

  sendVerificationEmail: async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        toast.success('Verification email sent!');
      }
    } catch (error: any) {
      console.error('Send verification error:', error);
      toast.error('Failed to send verification email');
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error('Failed to send password reset email');
      throw error;
    }
  }
};
