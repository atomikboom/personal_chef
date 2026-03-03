import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

interface AuthState {
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

// Simple storage wrapper to handle Web vs Native
const storage = {
    getItem: async (key: string) => {
        if (Platform.OS === 'web') {
            return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
        }
        try {
            return await SecureStore.getItemAsync(key);
        } catch {
            return null;
        }
    },
    setItem: async (key: string, value: string) => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') localStorage.setItem(key, value);
            return;
        }
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (e) {
            console.warn('SecureStore not available', e);
        }
    },
    deleteItem: async (key: string) => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') localStorage.removeItem(key);
            return;
        }
        try {
            await SecureStore.deleteItemAsync(key);
        } catch {
            // Ignored
        }
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    login: async (username, password) => {
        if (username === 'admin' && password === 'superadmin') {
            set({ isAuthenticated: true });
            return true;
        }
        return false;
    },
    logout: async () => {
        set({ isAuthenticated: false });
    },
    checkAuth: async () => {
        // Persistence disabled as per user request
    },
}));
