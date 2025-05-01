
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isVerifying: boolean;
  verificationEmail: string;
  verificationCode: string;
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
  setVerifying: (email: string) => void;
  verifyCode: (code: string) => boolean;
  updateUserProfile: (name: string, email: string) => void;
}

// In a real app, this would be connected to a backend
// For demo purposes, we're using localStorage through zustand/persist
export const useAuth = create(
  persist<AuthState>(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isVerifying: false,
      verificationEmail: '',
      verificationCode: '',
      login: (email, password) => {
        console.log('Login attempt:', email);
        
        // For demo, check if user exists in our "database" (localStorage)
        const users = JSON.parse(localStorage.getItem('mehab-users') || '[]');
        const user = users.find((u: any) => u.email === email);
        
        if (user && user.password === password) {
          // Generate verification code
          const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
          
          // In a real app, this would send an email via backend
          console.log(`VERIFICATION CODE for ${email}: ${verificationCode}`);
          
          // Show toast with verification code (simulating email)
          toast.info(
            `Verification code sent to ${email}`,
            { 
              description: `Your verification code is: ${verificationCode}` 
            }
          );
          
          set({ 
            isVerifying: true, 
            verificationEmail: email,
            verificationCode: verificationCode
          });
        } else {
          toast.error('Login failed', { description: 'Invalid email or password' });
        }
      },
      register: (name, email, password) => {
        // For demo, store in localStorage as our "database"
        const users = JSON.parse(localStorage.getItem('mehab-users') || '[]');
        
        // Check if user already exists
        if (users.some((user: any) => user.email === email)) {
          toast.error('Registration failed', { description: 'Email already in use' });
          return;
        }
        
        // Add new user
        const newUser = { 
          id: Date.now().toString(),
          name, 
          email, 
          password, 
          wishlist: [] 
        };
        
        users.push(newUser);
        localStorage.setItem('mehab-users', JSON.stringify(users));
        
        toast.success('Registration successful', { 
          description: 'Please login to continue' 
        });
      },
      logout: () => {
        set({ user: null, isLoggedIn: false });
        toast.info('Logged out successfully');
      },
      setVerifying: (email) => {
        set({ isVerifying: true, verificationEmail: email });
      },
      verifyCode: (code) => {
        if (code === get().verificationCode) {
          const email = get().verificationEmail;
          const users = JSON.parse(localStorage.getItem('mehab-users') || '[]');
          const user = users.find((u: any) => u.email === email);
          
          if (user) {
            // Set user as logged in
            set({
              user: {
                id: user.id,
                name: user.name,
                email: user.email
              },
              isLoggedIn: true,
              isVerifying: false,
              verificationEmail: '',
              verificationCode: ''
            });
            
            // Store login state in localStorage for compatibility with existing code
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', user.name);
            localStorage.setItem('userEmail', user.email);
            
            toast.success('Login successful', { 
              description: `Welcome back, ${user.name}!` 
            });
            
            return true;
          }
        } else {
          toast.error('Verification failed', { description: 'Invalid code' });
        }
        return false;
      },
      updateUserProfile: (name, email) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        const users = JSON.parse(localStorage.getItem('mehab-users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
        
        if (userIndex !== -1) {
          users[userIndex].name = name;
          users[userIndex].email = email;
          localStorage.setItem('mehab-users', JSON.stringify(users));
          
          // Update current user
          set({
            user: {
              ...currentUser,
              name,
              email
            }
          });
          
          // Update localStorage for compatibility
          localStorage.setItem('userName', name);
          localStorage.setItem('userEmail', email);
          
          toast.success('Profile updated successfully');
        }
      }
    }),
    {
      name: 'mehab-auth'
    }
  )
);

// Initialize with default admin user
if (typeof window !== 'undefined') {
  const users = JSON.parse(localStorage.getItem('mehab-users') || '[]');
  if (users.length === 0) {
    users.push({ 
      id: 'admin',
      name: 'Administrator', 
      email: 'mo123', 
      password: 'mo123',
      wishlist: []
    });
    localStorage.setItem('mehab-users', JSON.stringify(users));
  }
}
