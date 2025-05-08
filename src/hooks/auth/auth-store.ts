
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from './types';
import { sessionActions } from './session-actions';
import { loginActions } from './login-actions';
import { profileActions } from './profile-actions';
import { passwordActions } from './password-actions';

// Main authentication store with Supabase
export const useAuth = create(
  persist<AuthState>(
    (set, get) => ({
      user: null,
      session: null,
      isLoggedIn: false,
      isLoading: true,
      
      // Session management
      ...sessionActions(set, get),
      
      // Login and registration
      ...loginActions(set, get),
      
      // Profile management
      ...profileActions(set, get),
      
      // Password management
      ...passwordActions(set, get),
    }),
    {
      name: 'vlitrix-auth'
    }
  )
);
