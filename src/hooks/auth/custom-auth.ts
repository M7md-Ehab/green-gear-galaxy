
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthState {
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

// Simulate email sending (you can replace this with your actual email service)
const simulateEmailSend = (to: string, subject: string, content: string) => {
  console.log(`📧 Email sent to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content: ${content}`);
  // In your real implementation, call your email service API here
};

export const customAuthService = {
  login: async (email: string, password: string) => {
    try {
      // Get stored users
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        toast.error('Invalid email or password');
        throw new Error('Invalid credentials');
      }
      
      if (!user.emailVerified) {
        toast.error('Please verify your email address before signing in');
        return { needsVerification: true };
      }
      
      // Store current user
      const userToStore = { ...user };
      delete userToStore.password; // Don't store password in session
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      
      toast.success('Successfully signed in!');
      return undefined;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  signup: async (email: string, password: string, name: string) => {
    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      if (users.find((u: any) => u.email === email)) {
        toast.error('User with this email already exists');
        throw new Error('User already exists');
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        password, // In real app, this should be hashed
        displayName: name,
        emailVerified: false,
        createdAt: new Date().toISOString()
      };
      
      // Store user
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Send verification email (simulated)
      simulateEmailSend(
        email,
        'Verify your email address',
        `Hello ${name}! Please click this link to verify your email: [Verification Link]`
      );
      
      toast.success('Account created! Please check your email for verification.');
      return { needsVerification: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  logout: async () => {
    localStorage.removeItem('currentUser');
    toast.success('Successfully signed out');
  },

  updateUserProfile: async (name: string, email: string) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      
      // Update in users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex !== -1) {
        users[userIndex].displayName = name;
        users[userIndex].email = email;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user
        const updatedUser = { ...users[userIndex] };
        delete updatedUser.password;
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  },

  sendVerificationEmail: async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
      simulateEmailSend(
        currentUser.email,
        'Verify your email address',
        `Hello ${currentUser.displayName}! Please click this link to verify your email: [Verification Link]`
      );
      toast.success('Verification email sent!');
    }
  },

  resetPassword: async (email: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email);
    
    if (user) {
      simulateEmailSend(
        email,
        'Reset your password',
        `Hello! Please click this link to reset your password: [Reset Link]`
      );
      toast.success('Password reset email sent!');
    } else {
      toast.error('No account found with that email address');
    }
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  },

  // Simulate email verification (you can call this from a verification link)
  verifyEmail: (userId: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].emailVerified = true;
      localStorage.setItem('users', JSON.stringify(users));
      toast.success('Email verified successfully!');
    }
  }
};
