import { create } from 'zustand';
import { getCurrentUser } from '@/lib/appwrite';

type User = { name: string; email: string; avatar?: string } | null;

type AuthState = {
    isAuthenticated: boolean;
    user: User;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    isLoading: true,

    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setUser: (user) => set({ user }),
    setLoading: (value) => set({ isLoading: value }),

    fetchAuthenticatedUser: async () => {
        set({ isLoading: true });

        try {
            const user = await getCurrentUser();
            if (user) {
                set({ isAuthenticated: true, user: { name: user.name, email: user.email, avatar: user.avatar } });
            } else {
                set({ isAuthenticated: false, user: null });
            }
        } catch (e) {
            set({ isAuthenticated: false, user: null })
        } finally {
            set({ isLoading: false });
        }
    }
}))

export default useAuthStore;
