
// This file now re-exports the auth functionality from the refactored structure
// to maintain backwards compatibility with existing imports

export { useAuth, useAuthListener } from './auth';
export type { AuthState } from './auth/types';
