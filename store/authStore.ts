import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'driver' | 'admin';
  vehicles?: string[];
  orders?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // Mock login for demo purposes
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock user data
          const user: User = {
            id: 'user123',
            name: 'John Doe',
            email: email,
            phone: '+1234567890',
            role: 'driver',
            vehicles: [],
            orders: [],
          };
          
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to login', 
            isLoading: false 
          });
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          // Mock logout
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to logout', 
            isLoading: false 
          });
        }
      },
      
      register: async (userData, password) => {
        set({ isLoading: true, error: null });
        try {
          // Mock registration
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newUser: User = {
            id: `user${Date.now()}`,
            name: userData.name || 'New User',
            email: userData.email || '',
            phone: userData.phone,
            role: userData.role || 'customer',
            vehicles: [],
            orders: [],
          };
          
          set({ user: newUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to register', 
            isLoading: false 
          });
        }
      },
      
      updateUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // Mock update
          await new Promise(resolve => setTimeout(resolve, 800));
          
          set(state => ({
            user: state.user ? { ...state.user, ...userData } : null,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update user', 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);